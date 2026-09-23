import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subjectId, section = 'A', semester = 5, academicYear = '2025-2026' } = body

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findFirst()
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 500 })
    }

    const offering = await prisma.courseOffering.create({
      data: {
        subjectId,
        facultyId: faculty.id,
        section,
        semester: Number(semester),
        academicYear,
      },
      include: { subject: true },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'COURSE_OFFERING_CREATED',
      entityType: 'CourseOffering',
      entityId: offering.id,
      newValue: `${offering.subject.code} Sec ${section}`,
      reason: 'Course section opened',
    })

    return NextResponse.json({ success: true, offering }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
