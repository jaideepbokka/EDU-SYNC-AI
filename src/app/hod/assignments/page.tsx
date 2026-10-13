import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'
import { HodAssignmentsClient } from './HodAssignmentsClient'

export const metadata = {
  title: 'Teaching Assignments | HOD Portal',
  description: 'Manage CSE curriculum subject allocations and faculty workloads.',
}

export default async function HodAssignmentsPage() {
  await requireHodUser()

  const [offerings, faculty, subjects] = await Promise.all([
    prisma.courseOffering.findMany({
      include: {
        faculty: { include: { user: true } },
        subject: true,
      },
      orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }],
    }),
    prisma.faculty.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true },
      orderBy: { employeeId: 'asc' },
    }),
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }),
  ])

  return (
    <HodAssignmentsClient
      initialOfferings={offerings}
      facultyList={faculty}
      subjectList={subjects}
    />
  )
}
