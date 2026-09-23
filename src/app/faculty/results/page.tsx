import React from 'react'
import { prisma } from '@/lib/prisma'
import { ResultsClient } from './ResultsClient'

export const metadata = {
  title: 'Semester Results | EduSync AI Faculty',
  description: 'View and manage student semester SGPA and grade sheets.',
}

export default async function FacultyResultsPage() {
  const results = await prisma.semesterResult.findMany({
    include: {
      student: { include: { user: true } },
      subjectResults: true,
    },
    orderBy: [{ semester: 'desc' }, { sgpa: 'desc' }],
  })

  return <ResultsClient semesterResults={results as any} />
}
