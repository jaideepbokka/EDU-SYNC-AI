import React from 'react'
import { prisma } from '@/lib/prisma'
import { LearningPathsClient } from './LearningPathsClient'

export const metadata = {
  title: 'AI Learning Paths | EduSync AI Faculty',
  description: 'AI-assisted remedial trajectories and prerequisite bridges.',
}

export default async function FacultyLearningPathsPage() {
  const [learningPaths, students, subjects] = await Promise.all([
    prisma.learningPath.findMany({
      include: {
        student: { include: { user: true } },
        subject: true,
        steps: {
          include: { topic: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.findMany({
      include: { user: true },
      orderBy: { rollNo: 'asc' },
    }),
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }),
  ])

  return (
    <LearningPathsClient
      learningPaths={learningPaths as any}
      students={students as any}
      subjects={subjects as any}
    />
  )
}
