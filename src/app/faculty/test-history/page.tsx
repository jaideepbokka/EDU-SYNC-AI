import React from 'react'
import { prisma } from '@/lib/prisma'
import { TestHistoryClient } from './TestHistoryClient'

export const metadata = {
  title: 'Test History | EduSync AI Faculty',
  description: 'Chronological test history and score distributions.',
}

export default async function FacultyTestHistoryPage() {
  const attempts = await prisma.studentAttempt.findMany({
    include: {
      student: { include: { user: true } },
      assessment: { include: { subject: true } },
      answers: { include: { question: true } },
    },
    orderBy: { startTime: 'desc' },
  })

  return <TestHistoryClient attempts={attempts as any} />
}
