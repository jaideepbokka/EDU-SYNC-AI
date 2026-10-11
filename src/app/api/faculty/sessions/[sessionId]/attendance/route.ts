import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFacultyUser } from '@/lib/auth'

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  try {
    await requireFacultyUser()
    const { sessionId } = await props.params

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        courseOffering: {
          include: {
            subject: true,
            enrollments: {
              include: {
                student: { include: { user: true, faceTemplates: { where: { status: 'APPROVED' } } } },
              },
            },
          },
        },
        records: {
          include: {
            student: { include: { user: true } },
          },
        },
        verificationAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            student: { include: { user: true } },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Attendance session not found.' }, { status: 404 })
    }

    const enrolledStudents = session.courseOffering.enrollments.map((e) => e.student)
    const recordsMap = new Map(session.records.map((r) => [r.studentId, r]))

    const studentRoster = enrolledStudents.map((s) => {
      const record = recordsMap.get(s.id)
      return {
        id: s.id,
        name: s.user.name,
        rollNo: s.rollNo,
        registerNo: s.registerNo,
        section: s.section,
        isEnrolledFace: s.faceTemplates.length > 0 || !!s.faceDescriptor,
        faceId: s.faceId,
        status: record ? record.status : 'ABSENT',
        markedAt: record ? record.markedAt : null,
        verificationMethod: record?.verificationMethod || null,
        faceConfidence: record?.faceConfidence || null,
        livenessVerified: record?.livenessVerified || false,
      }
    })

    const presentCount = session.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length
    const totalCount = enrolledStudents.length || 1

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        subjectCode: session.courseOffering.subject.code,
        subjectName: session.courseOffering.subject.name,
        status: session.status,
        startTime: session.startTime,
        presentCount,
        absentCount: totalCount - presentCount,
        attendancePercentage: Number(((presentCount / totalCount) * 100).toFixed(1)),
      },
      roster: studentRoster,
      recentAttempts: session.verificationAttempts.map((a) => ({
        id: a.id,
        studentName: a.student.user.name,
        rollNo: a.student.rollNo,
        status: a.status,
        livenessScore: a.livenessScore,
        similarityScore: a.similarityScore,
        createdAt: a.createdAt,
        failureReason: a.failureReason,
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
