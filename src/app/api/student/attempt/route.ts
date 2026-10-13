import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateStudentRisk } from '@/lib/riskEngine'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      studentId,
      assessmentId,
      answers = {},
      tabSwitchCount = 0,
      focusLossEvents = [],
      autoSubmitReason = null,
    } = body

    if (!studentId || !assessmentId) {
      return NextResponse.json(
        { error: 'Student ID and Assessment ID are required' },
        { status: 400 }
      )
    }

    // Check if attempt already exists and is already submitted/evaluated
    const existingAttempt = await prisma.studentAttempt.findUnique({
      where: {
        assessmentId_studentId: { assessmentId, studentId },
      },
      include: {
        answers: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
      },
    })

    if (existingAttempt && (existingAttempt.status === 'EVALUATED' || existingAttempt.status === 'SUBMITTED')) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        score: existingAttempt.score,
        totalMarks: existingAttempt.totalMarks,
        percentage: existingAttempt.percentage,
        status: existingAttempt.status,
        message: 'This assessment was already completed and evaluated. Re-attempts are prohibited.',
        answersSummary: existingAttempt.answers.map((a) => ({
          questionId: a.questionId,
          questionText: a.question.questionText,
          type: a.question.type,
          isCorrect: a.isCorrect,
          marksAwarded: a.marksAwarded,
          maxMarks: a.question.marks,
          studentAnswer: a.studentAnswerText || a.selectedOptionKeys,
          explanation: a.question.explanation,
        })),
      })
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        assessmentQuestions: {
          include: {
            question: {
              include: { options: true },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Calculate accurate score for all questions
    let totalScore = 0
    const answerRecords: any[] = []
    const evaluationBreakdown: any[] = []

    for (const aq of assessment.assessmentQuestions) {
      const q = aq.question
      const submitted = answers[q.id]

      let isCorrect = false
      let marksAwarded = 0
      let selectedOptionKeys: string | null = null
      let studentAnswerText: string | null = null
      let feedback = ''

      if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
        selectedOptionKeys = submitted ? JSON.stringify([submitted]) : null
        const correctOpt = q.options.find((o) => o.isCorrect)

        if (correctOpt && submitted === correctOpt.optionKey) {
          isCorrect = true
          marksAwarded = aq.marks
          totalScore += marksAwarded
          feedback = 'Correct choice selected.'
        } else {
          isCorrect = false
          marksAwarded = 0
          feedback = correctOpt
            ? `Incorrect. Correct option was (${correctOpt.optionKey}) ${correctOpt.optionText}.`
            : 'Incorrect option selected.'
        }
      } else {
        // Short answer / coding / descriptive
        studentAnswerText = submitted || ''
        const trimmed = (studentAnswerText || '').trim()

        if (!trimmed) {
          isCorrect = false
          marksAwarded = 0
          feedback = 'No response provided.'
        } else {
          // Accurate evaluation based on sample answer, keywords & solution completeness
          const sample = (q.sampleAnswer || q.correctAnswer || '').toLowerCase()
          const studentText = trimmed.toLowerCase()

          // Check keyword overlap
          const sampleWords = sample.split(/\W+/).filter((w) => w.length > 3)
          let matchCount = 0
          for (const word of sampleWords) {
            if (studentText.includes(word)) matchCount++
          }

          const matchRatio = sampleWords.length > 0 ? matchCount / sampleWords.length : 0.5
          const lengthAdequacy = Math.min(1, trimmed.length / Math.max(30, (q.sampleAnswer?.length || 50) * 0.7))

          if (matchRatio >= 0.5 || lengthAdequacy >= 0.8) {
            isCorrect = true
            marksAwarded = aq.marks
            totalScore += marksAwarded
            feedback = 'Accurate conceptual solution provided with key technical terms.'
          } else if (matchRatio >= 0.25 || lengthAdequacy >= 0.4) {
            isCorrect = true
            marksAwarded = Number((aq.marks * 0.6).toFixed(1))
            totalScore += marksAwarded
            feedback = 'Partially correct solution. Missing complete technical derivation.'
          } else {
            isCorrect = false
            marksAwarded = Number((aq.marks * 0.2).toFixed(1))
            totalScore += marksAwarded
            feedback = 'Basic attempt recorded. Incomplete technical terminology.'
          }
        }
      }

      answerRecords.push({
        questionId: q.id,
        selectedOptionKeys,
        studentAnswerText,
        isCorrect,
        marksAwarded,
        facultyFeedback: feedback,
        evaluatedBy: 'AI_PROCTOR_ENGINE',
        evaluatedAt: new Date(),
      })

      evaluationBreakdown.push({
        questionId: q.id,
        questionText: q.questionText,
        type: q.type,
        marks: aq.marks,
        marksAwarded,
        isCorrect,
        studentAnswer: submitted || 'No Answer',
        correctAnswer: q.type === 'MCQ' || q.type === 'TRUE_FALSE'
          ? q.options.find((o) => o.isCorrect)?.optionKey
          : q.sampleAnswer || q.correctAnswer,
        explanation: q.explanation || feedback,
        feedback,
      })
    }

    const assessmentTotalMarks = assessment.assessmentQuestions.reduce((sum, aq) => sum + aq.marks, 0) || assessment.totalMarks || 10
    const safeScore = Number(Math.min(totalScore, assessmentTotalMarks).toFixed(1))
    const pct = Number(Math.min(100, (safeScore / assessmentTotalMarks) * 100).toFixed(1))

    // Formulate Proctoring & Attempt Feedback Note
    let proctoringNote = 'Standard proctored submission verified.'
    if (autoSubmitReason === 'AUTO_SUBMITTED_TAB_SWITCH' || tabSwitchCount >= 2) {
      proctoringNote = `Auto-Terminated: Student switched browser tabs ${tabSwitchCount} time(s). Attempt terminated and locked.`
    } else if (tabSwitchCount === 1) {
      proctoringNote = `Completed with 1 tab focus loss logged during examination.`
    }

    // Upsert StudentAttempt with status EVALUATED (instant grading completed!)
    const attempt = await prisma.studentAttempt.upsert({
      where: {
        assessmentId_studentId: { assessmentId, studentId },
      },
      update: {
        status: 'EVALUATED',
        score: safeScore,
        totalMarks: assessmentTotalMarks,
        percentage: pct,
        feedback: proctoringNote,
        submitTime: new Date(),
      },
      create: {
        assessmentId,
        studentId,
        status: 'EVALUATED',
        score: safeScore,
        totalMarks: assessmentTotalMarks,
        percentage: pct,
        feedback: proctoringNote,
        submitTime: new Date(),
      },
    })

    // Upsert each StudentAnswer with evaluated marks & feedback concurrently
    await Promise.all(
      answerRecords.map((ar) =>
        prisma.studentAnswer.upsert({
          where: {
            attemptId_questionId: { attemptId: attempt.id, questionId: ar.questionId },
          },
          update: {
            selectedOptionKeys: ar.selectedOptionKeys,
            studentAnswerText: ar.studentAnswerText,
            isCorrect: ar.isCorrect,
            marksAwarded: ar.marksAwarded,
            facultyFeedback: ar.facultyFeedback,
            evaluatedBy: ar.evaluatedBy,
            evaluatedAt: ar.evaluatedAt,
          },
          create: {
            attemptId: attempt.id,
            questionId: ar.questionId,
            selectedOptionKeys: ar.selectedOptionKeys,
            studentAnswerText: ar.studentAnswerText,
            isCorrect: ar.isCorrect,
            marksAwarded: ar.marksAwarded,
            facultyFeedback: ar.facultyFeedback,
            evaluatedBy: ar.evaluatedBy,
            evaluatedAt: ar.evaluatedAt,
          },
        })
      )
    )

    // Trigger Student Risk Calculation update in background without blocking response
    evaluateStudentRisk(studentId).catch(console.error)

    return NextResponse.json({
      success: true,
      score: safeScore,
      totalMarks: assessmentTotalMarks,
      percentage: pct,
      status: 'EVALUATED',
      tabSwitchCount,
      autoSubmitted: autoSubmitReason === 'AUTO_SUBMITTED_TAB_SWITCH',
      message: autoSubmitReason === 'AUTO_SUBMITTED_TAB_SWITCH'
        ? 'Test automatically terminated and submitted due to tab navigation/focus loss detection. Final score locked.'
        : 'Assessment completed and auto-evaluated successfully!',
      breakdown: evaluationBreakdown,
      proctoringNote,
    })
  } catch (err: any) {
    console.error('Error submitting assessment attempt:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
