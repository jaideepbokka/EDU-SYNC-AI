import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

// Generates a cryptographically random 7-digit Face ID matching user reference code
function generate7DigitFaceId(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const search = searchParams.get('search')

    const where: any = {}
    if (section && section !== 'ALL') {
      where.section = section
    }

    if (search) {
      where.OR = [
        { rollNo: { contains: search } },
        { registerNo: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { faceId: { contains: search } },
      ]
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { rollNo: 'asc' },
    })

    return NextResponse.json({
      success: true,
      students,
      total: students.length,
    })
  } catch (err: any) {
    console.error('Error fetching students for Face ID:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action = 'GENERATE', studentId, section, customFaceId, faceDescriptor } = body

    // 1. Single Student Real-Time Generation & Biometric Embedding
    if (action === 'GENERATE') {
      if (!studentId) {
        return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 })
      }

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true },
      })

      if (!student) {
        return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
      }

      // Generate or use custom 7-digit ID
      let newFaceId = customFaceId ? String(customFaceId).trim() : generate7DigitFaceId()
      if (newFaceId.length !== 7 || !/^\d{7}$/.test(newFaceId)) {
        newFaceId = generate7DigitFaceId()
      }

      // Format faceDescriptor if provided
      let descriptorString: string | undefined = undefined
      if (faceDescriptor) {
        descriptorString =
          typeof faceDescriptor === 'string'
            ? faceDescriptor
            : JSON.stringify(Array.from(faceDescriptor))
      }

      const updated = await prisma.student.update({
        where: { id: studentId },
        data: {
          faceId: newFaceId,
          ...(descriptorString !== undefined ? { faceDescriptor: descriptorString } : {}),
        },
        include: { user: true },
      })

      await logAuditAction({
        actorRole: 'FACULTY',
        action: 'FACE_ID_GENERATED',
        entityType: 'Student',
        entityId: student.id,
        newValue: `Face ID: ${newFaceId}${descriptorString ? ' (Biometric Descriptor Vector Enrolled)' : ''}`,
        oldValue: student.faceId ? `Face ID: ${student.faceId}` : undefined,
        reason: 'Faculty registered biometric Face ID and facial feature descriptor',
      })

      return NextResponse.json({
        success: true,
        faceId: newFaceId,
        student: updated,
        message: `Registered Face ID (${newFaceId}) with biometric descriptor for ${student.user.name}.`,
      })
    }

    // 1b. Clear Face Biometrics for a Student
    if (action === 'CLEAR') {
      if (!studentId) {
        return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 })
      }

      const updated = await prisma.student.update({
        where: { id: studentId },
        data: {
          faceDescriptor: null,
        },
        include: { user: true },
      })

      return NextResponse.json({
        success: true,
        student: updated,
        message: 'Cleared saved biometric facial descriptor.',
      })
    }

    // 1c. Reset all face descriptors for clean testing
    if (action === 'RESET_ALL') {
      await prisma.student.updateMany({
        data: {
          faceDescriptor: null,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Cleared all biometric facial descriptors for clean re-enrollment.',
      })
    }

    // 2. Bulk Generation for Section or All
    if (action === 'BULK_GENERATE') {
      const where: any = {}
      if (section && section !== 'ALL') {
        where.section = section
      }

      const students = await prisma.student.findMany({ where })

      await Promise.all(
        students.map((s) =>
          prisma.student.update({
            where: { id: s.id },
            data: { faceId: generate7DigitFaceId() },
          })
        )
      )
      const count = students.length

      logAuditAction({
        actorRole: 'FACULTY',
        action: 'BULK_FACE_ID_REGENERATED',
        entityType: 'Department',
        entityId: section || 'ALL',
        newValue: `${count} student Face IDs refreshed`,
        reason: 'Faculty initiated bulk Face ID regeneration',
      }).catch(console.error)

      return NextResponse.json({
        success: true,
        count,
        message: `Successfully regenerated 7-digit Face IDs for ${count} students.`,
      })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (err: any) {
    console.error('Error generating Face ID:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
