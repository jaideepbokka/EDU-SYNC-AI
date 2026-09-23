import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, credits = 4, semester = 5, description } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and name are required' }, { status: 400 })
    }

    const dept = await prisma.department.findFirst({ where: { code: 'CSE' } })
    if (!dept) {
      return NextResponse.json({ error: 'Department not found' }, { status: 500 })
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        credits: Number(credits),
        semester: Number(semester),
        description,
        departmentId: dept.id,
      },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'SUBJECT_CREATED',
      entityType: 'Subject',
      entityId: subject.id,
      newValue: `${code} - ${name}`,
      reason: 'Curriculum update',
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (err: any) {
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
        // No body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Subject/Course ID is required for deletion.' }, { status: 400 })
    }

    const existing = await prisma.subject.findUnique({
      where: { id },
      select: { id: true, code: true, name: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Course/Subject not found.' }, { status: 404 })
    }

    // Delete subject (cascades to Unit, Topic, CourseOffering, Assessment, SubjectProgress, LearningPath)
    await prisma.subject.delete({
      where: { id },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'SUBJECT_DELETED',
      entityType: 'Subject',
      entityId: id,
      oldValue: `${existing.code} - ${existing.name}`,
      reason: 'Faculty removed course/subject from curriculum repository',
    })

    return NextResponse.json({
      success: true,
      message: `Course ${existing.code} (${existing.name}) deleted successfully.`,
      deletedId: id,
    })
  } catch (err: any) {
    console.error('Error deleting subject:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete course/subject.' }, { status: 500 })
  }
}

