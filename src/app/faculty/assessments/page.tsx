import React from 'react'
import { prisma } from '@/lib/prisma'
import { AssessmentsClient } from './AssessmentsClient'

export const metadata = {
  title: 'Assessments Builder | EduSync AI Faculty',
  description: 'Design, schedule, and publish examinations and quizzes.',
}

export default async function FacultyAssessmentsPage() {
  const [assessments, subjects, questions] = await Promise.all([
    prisma.assessment.findMany({
      include: {
        subject: true,
        assessmentQuestions: { include: { question: true } },
        attempts: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }),
    prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <AssessmentsClient
      assessments={assessments as any}
      subjects={subjects as any}
      questions={questions as any}
    />
  )
}
