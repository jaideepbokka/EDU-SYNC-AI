import React from 'react'
import { prisma } from '@/lib/prisma'
import { QuizGeneratorClient } from './QuizGeneratorClient'

export const metadata = {
  title: 'AI Quiz Generator | EduSync AI Faculty',
  description: 'Synthesize rigorous university examination questions using Google Gemini AI.',
}

export default async function FacultyQuizGeneratorPage() {
  const topics = await prisma.topic.findMany({
    include: {
      unit: { include: { subject: true } },
    },
    orderBy: { title: 'asc' },
  })

  return <QuizGeneratorClient topics={topics as any} />
}
