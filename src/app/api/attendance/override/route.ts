import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, studentId, newStatus = 'PRESENT', reason } = body

    if (!sessionId || !studentId) {
      return NextResponse.json(
        { error: 'Session ID and Student ID are required.' },
        { status: 400 }
      )
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'A valid academic justification is required for the faculty audit log.' },
        { status: 400 }
      )
    }

    // Upsert attendance record
    const record = await prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: { sessionId, studentId },
      },
      update: {
        status: newStatus,
        verificationMethod: 'MANUAL',
        overrideReason: reason,
      },
      create: {
        sessionId,
        studentId,
        status: newStatus,
        verificationMethod: 'MANUAL',
        overrideReason: reason,
        withinGeofence: true,
      },
    })

    // Recompute student's overall attendance %
    const totalRecords = await prisma.attendanceRecord.findMany({
      where: { studentId },
    })
    const presentCount = totalRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length
    const newPct = totalRecords.length > 0 ? (presentCount / totalRecords.length) * 100 : 85.0

    await prisma.student.update({
      where: { id: studentId },
      data: { attendancePercentage: Number(newPct.toFixed(1)) },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'ATTENDANCE_MANUAL_OVERRIDE',
      entityType: 'AttendanceRecord',
      entityId: record.id,
      newValue: newStatus,
      reason,
    })

    return NextResponse.json({ success: true, record })
  } catch (err: any) {
    console.error('Error overriding attendance:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
