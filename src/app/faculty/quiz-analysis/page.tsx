import React from 'react'
import { prisma } from '@/lib/prisma'
import { QuizAnalysisClient } from './QuizAnalysisClient'

export const metadata = {
  title: 'Quiz & Topic Analysis | EduSync AI Faculty',
  description: 'Deep cognitive analytics and weak topic detection.',
}

export default async function FacultyQuizAnalysisPage() {
  const [topicProgressData, assessments] = await Promise.all([
    prisma.topicProgress.findMany({
      include: {
        topic: true,
        student: { include: { user: true } },
      },
    }),
    prisma.assessment.findMany({
      include: {
        attempts: true,
        subject: true,
      },
    }),
  ])

  return (
    <QuizAnalysisClient
      topicProgressData={topicProgressData as any}
      assessments={assessments as any}
    />
  )
}
