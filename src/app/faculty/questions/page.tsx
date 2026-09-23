import React from 'react'
import { prisma } from '@/lib/prisma'
import { QuestionsClient } from './QuestionsClient'

export const metadata = {
  title: 'Question Bank | EduSync AI Faculty',
  description: 'Manage question bank items and Bloom Taxonomy mappings.',
}

export default async function FacultyQuestionsPage() {
  const [questions, topics] = await Promise.all([
    prisma.question.findMany({
      include: {
        topic: true,
        options: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.topic.findMany({
      orderBy: { title: 'asc' },
    }),
  ])

  return <QuestionsClient questions={questions as any} topics={topics as any} />
}
