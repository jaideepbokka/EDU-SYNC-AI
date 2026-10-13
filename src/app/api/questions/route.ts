import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')

    const where: any = {}
    if (topicId && topicId !== 'ALL') where.topicId = topicId
    if (difficulty && difficulty !== 'ALL') where.difficulty = difficulty
    if (type && type !== 'ALL') where.type = type

    const questions = await prisma.question.findMany({
      where,
      include: {
        topic: { include: { unit: { include: { subject: true } } } },
        options: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(questions)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const faculty = await prisma.faculty.findFirst()

    // Handle Bulk Questions Array concurrently
    if (Array.isArray(body.questions) || Array.isArray(body)) {
      const items = (Array.isArray(body.questions) ? body.questions : body).filter(
        (item: any) => item.topicId && item.questionText
      )

      const createdQuestions = await Promise.all(
        items.map((item: any) =>
          prisma.question.create({
            data: {
              topicId: item.topicId,
              facultyId: faculty?.id,
              type: item.type || 'MCQ',
              questionText: item.questionText,
              explanation: item.explanation,
              difficulty: item.difficulty || 'MEDIUM',
              marks: Number(item.marks || 2),
              bloomLevel: item.bloomLevel || 'APPLY',
              correctAnswer: item.correctAnswer,
              sampleAnswer: item.sampleAnswer,
              codeSnippet: item.codeSnippet,
              options: {
                create: (item.options || []).map((opt: any) => ({
                  optionKey: opt.optionKey,
                  optionText: opt.optionText,
                  isCorrect: Boolean(opt.isCorrect),
                })),
              },
            },
            include: { options: true, topic: true },
          })
        )
      )

      logAuditAction({
        actorRole: 'FACULTY',
        action: 'QUESTION_CREATED',
        entityType: 'Question',
        entityId: 'BULK',
        newValue: `${createdQuestions.length} questions approved into Question Bank`,
        reason: 'Bulk AI Question Approval',
      }).catch(console.error)

      return NextResponse.json(
        { success: true, count: createdQuestions.length, questions: createdQuestions },
        { status: 201 }
      )
    }

    // Handle Single Question
    const {
      topicId,
      type = 'MCQ',
      questionText,
      explanation,
      difficulty = 'MEDIUM',
      marks = 2,
      bloomLevel = 'APPLY',
      options = [],
      correctAnswer,
      sampleAnswer,
      codeSnippet,
    } = body

    if (!topicId || !questionText) {
      return NextResponse.json({ error: 'Topic and question text are required' }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        topicId,
        facultyId: faculty?.id,
        type,
        questionText,
        explanation,
        difficulty,
        marks: Number(marks),
        bloomLevel,
        correctAnswer,
        sampleAnswer,
        codeSnippet,
        options: {
          create: options.map((opt: any) => ({
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
        },
      },
      include: { options: true, topic: true },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'QUESTION_CREATED',
      entityType: 'Question',
      entityId: question.id,
      newValue: questionText.substring(0, 50),
      reason: 'Question added to question bank',
    })

    return NextResponse.json({ success: true, question }, { status: 201 })
  } catch (err: any) {
    console.error('Error creating question:', err)
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
      return NextResponse.json({ error: 'Question ID is required for deletion.' }, { status: 400 })
    }

    const existing = await prisma.question.findUnique({
      where: { id },
      select: { id: true, questionText: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Question not found.' }, { status: 404 })
    }

    // Delete question (cascades to QuestionOption, AssessmentQuestion, StudentAnswer)
    await prisma.question.delete({
      where: { id },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'QUESTION_DELETED',
      entityType: 'Question',
      entityId: id,
      oldValue: existing.questionText.substring(0, 50),
      reason: 'Faculty removed question from Question Bank repository',
    })

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully.',
      deletedId: id,
    })
  } catch (err: any) {
    console.error('Error deleting question:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete question.' }, { status: 500 })
  }
}

