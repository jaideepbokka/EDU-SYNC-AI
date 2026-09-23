import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { studentId, type = 'COUNSELING', description, notes, targetDays = 3 } = body

    if (!studentId || !description) {
      return NextResponse.json(
        { error: 'Student ID and description are required.' },
        { status: 400 }
      )
    }

    const faculty = await prisma.faculty.findFirst()
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty record not found' }, { status: 500 })
    }

    const targetDate = new Date(Date.now() + 86400000 * targetDays)

    const intervention = await prisma.facultyIntervention.create({
      data: {
        studentId,
        facultyId: faculty.id,
        type,
        description,
        targetDate,
        notes,
        status: 'SCHEDULED',
      },
    })

    await logAuditAction({
      actorId: user.id,
      actorRole: 'FACULTY',
      action: 'FACULTY_INTERVENTION_SCHEDULED',
      entityType: 'FacultyIntervention',
      entityId: intervention.id,
      newValue: type,
      reason: description,
    })

    return NextResponse.json({ success: true, intervention })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
