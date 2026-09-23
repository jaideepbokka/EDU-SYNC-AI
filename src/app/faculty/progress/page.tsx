import React from 'react'
import { prisma } from '@/lib/prisma'
import { ProgressClient } from './ProgressClient'

export const metadata = {
  title: 'Topic & Subject Mastery | EduSync AI Faculty',
  description: 'Curricular competency tracking and topic mastery matrices.',
}

export default async function FacultyProgressPage() {
  const [students, topics] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: true,
        subjectProgress: true,
        topicProgress: true,
      },
      orderBy: { rollNo: 'asc' },
    }),
    prisma.topic.findMany({
      orderBy: { topicNumber: 'asc' },
      take: 6,
    }),
  ])

  return <ProgressClient students={students as any} topics={topics as any} />
}
