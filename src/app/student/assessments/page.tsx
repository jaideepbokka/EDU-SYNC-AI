import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'
import { StudentAssessmentsClient } from './StudentAssessmentsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Student Assessment Room | EduSync AI',
  description: 'Attempt scheduled quizzes and university examinations with live proctoring.',
}

export default async function StudentAssessmentsPage() {
  const user = await requireStudentUser()

  const [student, assessments] = await Promise.all([
    prisma.student.findUnique({
      where: { id: user.studentId },
      include: {
        user: true,
        attempts: {
          include: {
            answers: {
              include: {
                question: { include: { options: true } },
              },
            },
            assessment: true,
          },
        },
      },
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
        attempts: {
          where: { studentId: user.studentId },
          include: {
            answers: {
              include: {
                question: { include: { options: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <StudentAssessmentsClient
      student={student as any}
      assessments={assessments as any}
    />
  )
}
