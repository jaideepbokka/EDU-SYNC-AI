import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function GET() {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        subject: true,
        assessmentQuestions: { include: { question: true } },
        attempts: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(assessments)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      subjectId,
      type = 'QUIZ',
      durationMinutes = 30,
      totalMarks = 20,
      passMarks = 8,
      status = 'PUBLISHED',
      questionIds = [],
    } = body

    if (!title || !subjectId) {
      return NextResponse.json({ error: 'Title and Subject ID are required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findFirst()

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        subjectId,
        facultyId: faculty!.id,
        type,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passMarks: Number(passMarks),
        status,
        scheduledStart: new Date(),
        scheduledEnd: new Date(Date.now() + 86400000 * 7),
      },
    })

    // Attach questions in a single batch operation
    if (questionIds.length > 0) {
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, marks: true },
      })
      const questionMarksMap = new Map(questions.map((q) => [q.id, q.marks]))

      await prisma.assessmentQuestion.createMany({
        data: questionIds.map((qId: string, i: number) => ({
          assessmentId: assessment.id,
          questionId: qId,
          orderIndex: i + 1,
          marks: questionMarksMap.get(qId) || 2,
        })),
        skipDuplicates: true,
      })
    }

    logAuditAction({
      actorRole: 'FACULTY',
      action: 'ASSESSMENT_CREATED',
      entityType: 'Assessment',
      entityId: assessment.id,
      newValue: `${title} (${status})`,
      reason: 'New examination assessment created by faculty',
    }).catch(console.error)

    return NextResponse.json({ success: true, assessment }, { status: 201 })
  } catch (err: any) {
    console.error('Error creating assessment:', err)
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
      return NextResponse.json({ error: 'Assessment ID is required for deletion.' }, { status: 400 })
    }

    const existing = await prisma.assessment.findUnique({
      where: { id },
      select: { id: true, title: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 })
    }

    // Delete assessment (cascades to assessmentQuestions and studentAttempts)
    await prisma.assessment.delete({
      where: { id },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'ASSESSMENT_DELETED',
      entityType: 'Assessment',
      entityId: id,
      oldValue: existing.title,
      reason: 'Faculty deleted previous assessment / test from Assessments Builder',
    })

    return NextResponse.json({
      success: true,
      message: `Assessment "${existing.title}" deleted successfully.`,
      deletedId: id,
    })
  } catch (err: any) {
    console.error('Error deleting assessment:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete assessment.' }, { status: 500 })
  }
}

