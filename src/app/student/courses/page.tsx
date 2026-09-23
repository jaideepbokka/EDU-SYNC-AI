import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'
import { StudentCoursesClient } from './StudentCoursesClient'

export const metadata = {
  title: 'Learning Courses & Topic Videos | EduSync AI Student',
  description: 'Access lecture videos and coursework posted by your faculty.',
}

export default async function StudentCoursesPage() {
  const user = await requireStudentUser()

  const [resources, subjects] = await Promise.all([
    prisma.learningResource.findMany({
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }),
  ])

  return (
    <StudentCoursesClient
      resources={resources as any}
      subjects={subjects as any}
      studentName={user.name}
    />
  )
}
