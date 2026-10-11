import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, logAuditAction } from '@/lib/auth'
import { validateEmbeddingVector, normalizeVector } from '@/lib/biometrics'

function generate7DigitFaceId(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000))
}

export async function POST(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
    }
    if (user.role !== 'FACULTY' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Faculty permissions required' }, { status: 403 })
    }
    const faculty = user
    const { studentId } = await props.params

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      embeddingVector,
      sampleCount = 5,
      consentAgreed = true,
      qualityScore = 0.95,
      customFaceId,
      algorithm = 'ARCFACE_ORTHO3D_128D',
    } = body

    let rawVector: number[] = []
    if (typeof embeddingVector === 'string') {
      try {
        rawVector = JSON.parse(embeddingVector)
      } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON string for embeddingVector.' }, { status: 400 })
      }
    } else if (Array.isArray(embeddingVector)) {
      rawVector = embeddingVector
    } else {
      return NextResponse.json(
        { error: 'Valid 128-D biometric embedding vector is required.' },
        { status: 400 }
      )
    }

    const val = validateEmbeddingVector(rawVector)
    if (!val.isValid || !val.isFinite) {
      return NextResponse.json(
        { error: 'Biometric embedding vector must contain 128 finite numeric coordinates.' },
        { status: 400 }
      )
    }

    const normalizedArray = Array.from(normalizeVector(rawVector))
    const vectorString = JSON.stringify(normalizedArray)

    if (!consentAgreed) {
      return NextResponse.json(
        { error: 'Student informed biometric consent is mandatory for registration.' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 })
    }

    let faceId = customFaceId ? String(customFaceId).trim() : student.faceId || generate7DigitFaceId()
    if (faceId.length !== 7 || !/^\d{7}$/.test(faceId)) {
      faceId = generate7DigitFaceId()
    }

    // Revoke previous templates for this student to maintain a single approved template
    await prisma.faceTemplate.updateMany({
      where: { studentId: student.id, status: 'APPROVED' },
      data: { status: 'REVOKED' },
    })

    // Create newly approved FaceTemplate
    const newTemplate = await prisma.faceTemplate.create({
      data: {
        studentId: student.id,
        enrolledByFacultyId: faculty.facultyId,
        embeddingVector: vectorString,
        algorithm,
        sampleCount: Number(sampleCount) || 5,
        consentAgreed: Boolean(consentAgreed),
        status: 'APPROVED',
        qualityScore: Number(qualityScore) || 0.95,
      },
    })

    // Sync student record for quick lookup
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        faceId,
        faceDescriptor: vectorString,
      },
      include: { user: true },
    })

    await logAuditAction({
      actorId: faculty.id,
      actorRole: 'FACULTY',
      action: 'FACE_TEMPLATE_ENROLLED',
      entityType: 'Student',
      entityId: student.id,
      newValue: `Face ID ${faceId} approved by ${faculty.name} (Template ID: ${newTemplate.id})`,
      reason: 'Faculty supervised Face ID biometric registration',
    })

    return NextResponse.json({
      success: true,
      faceId,
      template: newTemplate,
      student: updatedStudent,
      message: `Successfully enrolled and approved biometric Face ID for ${student.user.name}!`,
    })
  } catch (err: any) {
    console.error('Error in student face enrollment:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
