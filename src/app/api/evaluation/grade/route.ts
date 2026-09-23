import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, logAuditAction } from '@/lib/auth'
import { evaluateStudentRisk } from '@/lib/riskEngine'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { answerId, marksAwarded, feedback } = body

    if (!answerId) {
      return NextResponse.json({ error: 'Answer ID is required' }, { status: 400 })
    }

    // Find answer and attempt
    const answer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
      include: {
        attempt: {
          include: {
            answers: { include: { question: true } },
            assessment: true,
          },
        },
        question: true,
      },
    })

    if (!answer) {
      return NextResponse.json({ error: 'Student answer not found' }, { status: 404 })
    }

    const marks = Number(marksAwarded)
    const isCorrect = marks >= (answer.question.marks / 2)

    // Update student answer
    await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        marksAwarded: marks,
        facultyFeedback: feedback,
        isCorrect,
        evaluatedBy: user.name,
        evaluatedAt: new Date(),
      },
    })

    // Recompute total attempt score
    const updatedAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId: answer.attemptId },
    })

    const totalScore = updatedAnswers.reduce((acc, a) => acc + a.marksAwarded, 0)
    const maxMarks = answer.attempt.totalMarks || 1
    const pct = Number(((totalScore / maxMarks) * 100).toFixed(1))

    // Check if all answers evaluated
    const allEvaluated = updatedAnswers.every(
      (a) => a.evaluatedAt !== null || a.selectedOptionKeys !== null
    )

    await prisma.studentAttempt.update({
      where: { id: answer.attemptId },
      data: {
        score: totalScore,
        percentage: pct,
        status: allEvaluated ? 'EVALUATED' : 'IN_PROGRESS',
        feedback: feedback || answer.attempt.feedback,
      },
    })

    // Run risk engine re-evaluation
    await evaluateStudentRisk(answer.attempt.studentId)

    await logAuditAction({
      actorId: user.id,
      actorRole: 'FACULTY',
      action: 'SUBJECTIVE_ANSWER_EVALUATED',
      entityType: 'StudentAnswer',
      entityId: answer.id,
      newValue: `${marks}/${answer.question.marks} Marks`,
      reason: `Faculty subjective grading for assessment ${answer.attempt.assessment.title}`,
    })

    return NextResponse.json({
      success: true,
      totalScore,
      percentage: pct,
      status: allEvaluated ? 'EVALUATED' : 'IN_PROGRESS',
    })
  } catch (err: any) {
    console.error('Error in subjective evaluation:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
