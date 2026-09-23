import React from 'react'
import { prisma } from '@/lib/prisma'
import { SubjectsClient } from './SubjectsClient'

export const metadata = {
  title: 'Curriculum Subjects | EduSync AI Faculty',
  description: 'Manage department academic subjects, credits, and units.',
}

export default async function FacultySubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      units: true,
      offerings: {
        include: {
          enrollments: true,
          faculty: { include: { user: true } },
        },
      },
      assessments: true,
    },
    orderBy: { code: 'asc' },
  })

  return <SubjectsClient subjects={subjects as any} />
}
