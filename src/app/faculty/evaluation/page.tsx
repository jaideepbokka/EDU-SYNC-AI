import React from 'react'
import { prisma } from '@/lib/prisma'
import { EvaluationClient } from './EvaluationClient'

export const metadata = {
  title: 'Evaluation Suite | EduSync AI Faculty',
  description: 'Evaluate subjective answers, assign rubric marks, and provide audit feedback.',
}

export default async function FacultyEvaluationPage() {
  const [pendingAnswers, evaluatedAnswers] = await Promise.all([
    prisma.studentAnswer.findMany({
      where: {
        evaluatedAt: null,
        studentAnswerText: { not: null },
      },
      include: {
        question: true,
        attempt: {
          include: {
            student: { include: { user: true } },
            assessment: { include: { subject: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.studentAnswer.findMany({
      where: {
        evaluatedAt: { not: null },
        studentAnswerText: { not: null },
      },
      include: {
        question: true,
        attempt: {
          include: {
            student: { include: { user: true } },
            assessment: { include: { subject: true } },
          },
        },
      },
      orderBy: { evaluatedAt: 'desc' },
      take: 15,
    }),
  ])

  return (
    <EvaluationClient
      pendingAnswers={pendingAnswers as any}
      evaluatedAnswers={evaluatedAnswers as any}
    />
  )
}
