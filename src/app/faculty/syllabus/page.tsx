import React from 'react'
import { prisma } from '@/lib/prisma'
import { SyllabusClient } from './SyllabusClient'

export const metadata = {
  title: 'Hierarchical Syllabus | EduSync AI Faculty',
  description: 'Manage unit, topic, and learning objective curriculum hierarchies.',
}

export default async function FacultySyllabusPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      units: {
        include: {
          topics: {
            include: { learningObjectives: true },
            orderBy: { topicNumber: 'asc' },
          },
        },
        orderBy: { unitNumber: 'asc' },
      },
    },
    orderBy: { code: 'asc' },
  })

  return <SyllabusClient subjects={subjects as any} />
}
