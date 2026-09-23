import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateStudentRisk } from '@/lib/riskEngine'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, assessmentId, answers } = body

    if (!studentId || !assessmentId || !answers) {
      return NextResponse.json(
        { error: 'Student ID, Assessment ID, and Answers are required' },
        { status: 400 }
      )
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        assessmentQuestions: { include: { question: { include: { options: true } } } },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Calculate auto-graded marks (MCQ, True/False)
    let autoScore = 0
    let hasSubjective = false

    const answerRecords: any[] = []

    for (const aq of assessment.assessmentQuestions) {
      const q = aq.question
      const submitted = answers[q.id]

      let isCorrect: boolean | null = null
      let marksAwarded = 0
      let selectedOptionKeys: string | null = null
      let studentAnswerText: string | null = null

      if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
        selectedOptionKeys = submitted ? JSON.stringify([submitted]) : null
        const correctOpt = q.options.find((o) => o.isCorrect)
        if (correctOpt && submitted === correctOpt.optionKey) {
          isCorrect = true
          marksAwarded = aq.marks
          autoScore += marksAwarded
        } else {
          isCorrect = false
          marksAwarded = 0
        }
      } else {
        // Short answer / subjective / coding
        hasSubjective = true
        studentAnswerText = submitted || ''
        marksAwarded = 0 // pending faculty grading!
      }

      answerRecords.push({
        questionId: q.id,
        selectedOptionKeys,
        studentAnswerText,
        isCorrect,
        marksAwarded,
      })
    }

    const pct = Number(((autoScore / assessment.totalMarks) * 100).toFixed(1))

    // Create or update student attempt
    const attempt = await prisma.studentAttempt.upsert({
      where: {
        assessmentId_studentId: { assessmentId, studentId },
      },
      update: {
        status: hasSubjective ? 'SUBMITTED' : 'EVALUATED',
        score: autoScore,
        totalMarks: assessment.totalMarks,
        percentage: pct,
        submitTime: new Date(),
      },
      create: {
        assessmentId,
        studentId,
        status: hasSubjective ? 'SUBMITTED' : 'EVALUATED',
        score: autoScore,
        totalMarks: assessment.totalMarks,
        percentage: pct,
        submitTime: new Date(),
      },
    })

    // Upsert each answer
    for (const ar of answerRecords) {
      await prisma.studentAnswer.upsert({
        where: {
          attemptId_questionId: { attemptId: attempt.id, questionId: ar.questionId },
        },
        update: {
          selectedOptionKeys: ar.selectedOptionKeys,
          studentAnswerText: ar.studentAnswerText,
          isCorrect: ar.isCorrect,
          marksAwarded: ar.marksAwarded,
        },
        create: {
          attemptId: attempt.id,
          questionId: ar.questionId,
          selectedOptionKeys: ar.selectedOptionKeys,
          studentAnswerText: ar.studentAnswerText,
          isCorrect: ar.isCorrect,
          marksAwarded: ar.marksAwarded,
        },
      })
    }

    // Trigger risk update
    await evaluateStudentRisk(studentId)

    return NextResponse.json({
      success: true,
      hasSubjective,
      score: autoScore,
      totalMarks: assessment.totalMarks,
      status: hasSubjective ? 'SUBMITTED' : 'EVALUATED',
      message: hasSubjective
        ? 'Assessment submitted successfully! Subjective answers are now queued for faculty review.'
        : 'Assessment completed and auto-graded successfully!',
    })
  } catch (err: any) {
    console.error('Error submitting assessment attempt:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
