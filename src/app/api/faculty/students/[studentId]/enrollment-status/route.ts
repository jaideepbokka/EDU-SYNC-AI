import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFacultyUser } from '@/lib/auth'

export async function GET(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    await requireFacultyUser()
    const { studentId } = await props.params

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        faceTemplates: {
          orderBy: { createdAt: 'desc' },
          include: { enrolledByFaculty: { include: { user: true } } },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    }

    const activeTemplate = student.faceTemplates.find((t) => t.status === 'APPROVED')

    return NextResponse.json({
      success: true,
      studentId: student.id,
      studentName: student.user?.name,
      rollNo: student.rollNo,
      faceId: student.faceId,
      isEnrolled: !!activeTemplate,
      activeTemplate: activeTemplate
        ? {
            id: activeTemplate.id,
            algorithm: activeTemplate.algorithm,
            sampleCount: activeTemplate.sampleCount,
            qualityScore: activeTemplate.qualityScore,
            enrolledAt: activeTemplate.createdAt,
            enrolledBy: activeTemplate.enrolledByFaculty?.user?.name || 'Faculty',
          }
        : null,
      history: student.faceTemplates.map((t) => ({
        id: t.id,
        status: t.status,
        algorithm: t.algorithm,
        createdAt: t.createdAt,
        enrolledBy: t.enrolledByFaculty?.user?.name || 'Faculty',
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
