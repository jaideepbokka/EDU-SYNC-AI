import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      action,
      courseOfferingId,
      topicCovered,
      geofenceRadiusMeters = 100,
      sessionId,
      roomLatitude,
      roomLongitude,
    } = body

    if (action === 'CALIBRATE_GEOFENCE') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required to calibrate geofence' }, { status: 400 })
      }
      const lat = roomLatitude ? Number(roomLatitude) : 16.603849
      const lng = roomLongitude ? Number(roomLongitude) : 82.082664
      const updated = await prisma.attendanceSession.update({
        where: { id: sessionId },
        data: {
          roomLatitude: lat,
          roomLongitude: lng,
          ...(geofenceRadiusMeters ? { geofenceRadiusMeters: Number(geofenceRadiusMeters) } : {}),
        },
      })

      // Also retroactively mark existing records for this session within the new geofence
      await prisma.attendanceRecord.updateMany({
        where: { sessionId },
        data: {
          withinGeofence: true,
          overrideReason: 'Classroom geofence calibrated by faculty',
        },
      })

      await logAuditAction({
        actorRole: 'FACULTY',
        action: 'GEOFENCE_CALIBRATED',
        entityType: 'AttendanceSession',
        entityId: sessionId,
        newValue: `Lat: ${lat}, Lng: ${lng}`,
        reason: 'Classroom geofence center calibrated by faculty',
      })

      return NextResponse.json({ success: true, session: updated })
    }

    if (action === 'CLOSE') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required to close session' }, { status: 400 })
      }

      const closedSession = await prisma.attendanceSession.update({
        where: { id: sessionId },
        data: {
          status: 'CLOSED',
          endTime: new Date(),
        },
      })

      // Mark all enrolled students who haven't checked in as ABSENT
      const session = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: {
          courseOffering: { include: { enrollments: true } },
          records: true,
        },
      })

      if (session) {
        const checkedInStudentIds = new Set(session.records.map((r) => r.studentId))
        const absentRecords = session.courseOffering.enrollments
          .filter((enr) => !checkedInStudentIds.has(enr.studentId))
          .map((enr) => ({
            sessionId: session.id,
            studentId: enr.studentId,
            status: 'ABSENT' as const,
            verificationMethod: 'MANUAL' as const,
            withinGeofence: false,
            overrideReason: 'Automated absence marked at session closure',
          }))

        if (absentRecords.length > 0) {
          await prisma.attendanceRecord.createMany({
            data: absentRecords,
            skipDuplicates: true,
          })
        }
      }

      logAuditAction({
        actorRole: 'FACULTY',
        action: 'ATTENDANCE_SESSION_CLOSED',
        entityType: 'AttendanceSession',
        entityId: sessionId,
        newValue: 'CLOSED',
        reason: 'Session ended by faculty',
      }).catch(console.error)

      return NextResponse.json({ success: true, session: closedSession })
    }

    // Default: CREATE / START NEW SESSION
    if (!courseOfferingId) {
      return NextResponse.json({ error: 'Course offering ID is required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findFirst()
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty record not found' }, { status: 500 })
    }

    // Close any currently active sessions for this course
    await prisma.attendanceSession.updateMany({
      where: { courseOfferingId, status: 'ACTIVE' },
      data: { status: 'CLOSED', endTime: new Date() },
    })

    const finalLat = roomLatitude ? Number(roomLatitude) : 16.603849
    const finalLng = roomLongitude ? Number(roomLongitude) : 82.082664

    const newSession = await prisma.attendanceSession.create({
      data: {
        courseOfferingId,
        facultyId: faculty.id,
        sessionDate: new Date(),
        startTime: new Date(),
        topicCovered: topicCovered || 'Regular Curriculum Class',
        status: 'ACTIVE',
        roomLatitude: finalLat,
        roomLongitude: finalLng,
        geofenceRadiusMeters: Number(geofenceRadiusMeters),
      },
      include: {
        courseOffering: { include: { subject: true } },
      },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'ATTENDANCE_SESSION_STARTED',
      entityType: 'AttendanceSession',
      entityId: newSession.id,
      newValue: 'ACTIVE',
      reason: `Started live session for ${newSession.courseOffering.subject.code} (${topicCovered})`,
    })

    return NextResponse.json({ success: true, session: newSession }, { status: 201 })
  } catch (err: any) {
    console.error('Error with attendance session:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {
        // No body provided
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required for deletion.' }, { status: 400 })
    }

    const existing = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        courseOffering: { include: { subject: true } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Attendance session not found.' }, { status: 404 })
    }

    // Delete attendance session (cascades to AttendanceRecord)
    await prisma.attendanceSession.delete({
      where: { id },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'ATTENDANCE_SESSION_DELETED',
      entityType: 'AttendanceSession',
      entityId: id,
      oldValue: `${existing.courseOffering?.subject?.code || 'Course'} - ${existing.topicCovered || 'Regular Class'}`,
      reason: 'Faculty deleted historical attendance session log',
    })

    return NextResponse.json({
      success: true,
      message: 'Attendance session deleted successfully.',
      deletedId: id,
    })
  } catch (err: any) {
    console.error('Error deleting attendance session:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete attendance session.' }, { status: 500 })
  }
}

