import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'

export async function GET() {
  try {
    const studentUser = await requireStudentUser()

    if (!studentUser.studentId) {
      return NextResponse.json({ error: 'Student ID not associated with account' }, { status: 400 })
    }

    // Find all active attendance sessions
    const activeSessions = await prisma.attendanceSession.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { user: true } },
          },
        },
        records: {
          where: { studentId: studentUser.studentId },
        },
      },
      orderBy: { startTime: 'desc' },
    })

    const formattedSessions = activeSessions.map((s) => {
      const record = s.records[0]
      return {
        id: s.id,
        subjectCode: s.courseOffering.subject.code,
        subjectName: s.courseOffering.subject.name,
        facultyName: s.courseOffering.faculty?.user?.name || 'Faculty',
        section: s.courseOffering.section,
        semester: s.courseOffering.semester,
        startTime: s.startTime,
        roomLatitude: s.roomLatitude,
        roomLongitude: s.roomLongitude,
        geofenceRadiusMeters: s.geofenceRadiusMeters,
        topicCovered: s.topicCovered || 'Regular Class Session',
        isAlreadyMarked: !!record,
        markedAt: record?.markedAt || null,
        recordStatus: record?.status || null,
      }
    })

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
