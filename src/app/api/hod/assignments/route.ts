import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'

export async function GET() {
  try {
    await requireHodUser()
    const [offerings, faculty, subjects] = await Promise.all([
      prisma.courseOffering.findMany({
        include: {
          faculty: { include: { user: true } },
          subject: true,
          enrollments: true,
        },
        orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }],
      }),
      prisma.faculty.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true },
        orderBy: { employeeId: 'asc' },
      }),
      prisma.subject.findMany({
        orderBy: { code: 'asc' },
      }),
    ])

    return NextResponse.json({ success: true, offerings, faculty, subjects })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireHodUser()
    const body = await request.json()
    const {
      facultyId,
      subjectId,
      academicYear = '2025-2026',
      semester = 5,
      section = 'A',
    } = body

    if (!facultyId || !subjectId) {
      return NextResponse.json(
        { error: 'Faculty and Subject must be selected.' },
        { status: 400 }
      )
    }

    const existing = await prisma.courseOffering.findUnique({
      where: {
        subjectId_facultyId_academicYear_semester_section: {
          subjectId,
          facultyId,
          academicYear,
          semester: Number(semester),
          section,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This teaching assignment already exists for this section and year.' },
        { status: 400 }
      )
    }

    const created = await prisma.courseOffering.create({
      data: {
        subjectId,
        facultyId,
        academicYear,
        semester: Number(semester),
        section,
      },
      include: {
        faculty: { include: { user: true } },
        subject: true,
      },
    })

    return NextResponse.json({
      success: true,
      offering: created,
      message: `Assigned ${created.subject.name} to ${created.faculty.user.name} for Semester ${created.semester} Sec ${created.section}`,
    })
  } catch (err: any) {
    console.error('Error creating assignment:', err)
    return NextResponse.json({ error: err.message || 'Failed to create assignment' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireHodUser()
    const { searchParams } = new URL(request.url)
    const offeringId = searchParams.get('id')

    if (!offeringId) {
      return NextResponse.json({ error: 'Offering ID is required' }, { status: 400 })
    }

    await prisma.courseOffering.delete({
      where: { id: offeringId },
    })

    return NextResponse.json({ success: true, message: 'Teaching assignment removed.' })
  } catch (err: any) {
    console.error('Error removing assignment:', err)
    return NextResponse.json({ error: err.message || 'Failed to remove assignment' }, { status: 500 })
  }
}
