import React from 'react'
import { prisma } from '@/lib/prisma'
import { StudentAssessmentsClient } from './StudentAssessmentsClient'

export const metadata = {
  title: 'Student Assessment Room | EduSync AI',
  description: 'Attempt scheduled quizzes and university examinations.',
}

export default async function StudentAssessmentsPage() {
  const [students, assessments] = await Promise.all([
    prisma.student.findMany({
      include: { user: true },
      orderBy: { rollNo: 'asc' },
    }),
    prisma.assessment.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        subject: true,
        assessmentQuestions: {
          include: {
            question: { include: { options: true } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <StudentAssessmentsClient
      students={students as any}
      assessments={assessments as any}
    />
  )
}
