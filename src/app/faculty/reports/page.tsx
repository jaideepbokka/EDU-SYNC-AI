import React from 'react'
import { prisma } from '@/lib/prisma'
import { ReportsClient } from './ReportsClient'

export const metadata = {
  title: 'Regulatory Reports & CSV Exports | EduSync AI Faculty',
  description: 'Download compliance reports for attendance, examination eligibility, and cognitive risk.',
}

export default async function FacultyReportsPage() {
  const [students, results] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: true,
        riskProfiles: { take: 1, orderBy: { calculatedAt: 'desc' } },
      },
      orderBy: { rollNo: 'asc' },
    }),
    prisma.semesterResult.findMany({
      include: {
        student: { include: { user: true } },
      },
      orderBy: { semester: 'desc' },
    }),
  ])

  return <ReportsClient students={students as any} results={results as any} />
}
