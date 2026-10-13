import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'
import { HodFacultyClient } from './HodFacultyClient'

export const metadata = {
  title: 'Faculty & Teaching Staff Management | HOD Portal',
  description: 'Manage CSE faculty members, toggle active status, and assign academic workloads.',
}

export default async function HodFacultyPage() {
  await requireHodUser()

  const [faculty, subjects] = await Promise.all([
    prisma.faculty.findMany({
      include: {
        user: true,
        department: true,
        offerings: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    }),
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }),
  ])

  return (
    <HodFacultyClient
      initialFaculty={faculty}
      availableSubjects={subjects}
    />
  )
}
