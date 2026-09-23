import React from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StudentProfileClient } from './StudentProfileClient'

export const metadata = {
  title: 'Student Academic Dossier | EduSync AI',
}

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { studentId } = await params
  const queryParams = await searchParams
  const initialTab = typeof queryParams.tab === 'string' ? queryParams.tab : 'overview'

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      department: true,
      enrollments: {
        include: {
          courseOffering: {
            include: {
              subject: true,
              faculty: { include: { user: true } },
            },
          },
        },
      },
      attendanceRecords: {
        include: {
          session: {
            include: {
              courseOffering: { include: { subject: true } },
            },
          },
        },
        orderBy: { markedAt: 'desc' },
      },
      semesterResults: {
        include: { subjectResults: true },
        orderBy: { semester: 'desc' },
      },
      attempts: {
        include: { assessment: true },
        orderBy: { startTime: 'desc' },
      },
      topicProgress: {
        include: { topic: true },
      },
      learningPaths: {
        include: {
          steps: {
            include: { topic: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      riskProfiles: {
        orderBy: { calculatedAt: 'desc' },
      },
      interventions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!student) {
    notFound()
  }

  return <StudentProfileClient student={student} initialTab={initialTab} />
}
