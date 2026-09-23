import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireFacultyUser } from '@/lib/auth'
import { FacultyProfileClient } from './FacultyProfileClient'

export const metadata = {
  title: 'Faculty Profile & Personal Details | EduSync AI',
  description: 'Manage faculty personal details, academic department, cabin hours, and teaching assignments.',
}

export default async function FacultyProfilePage() {
  const user = await requireFacultyUser()

  const [faculty, departments] = await Promise.all([
    prisma.faculty.findFirst({
      where: { userId: user.id },
      include: {
        department: true,
        user: true,
        offerings: {
          include: { subject: true, enrollments: true },
        },
      },
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <FacultyProfileClient
      initialUser={user}
      initialFaculty={faculty}
      departments={departments}
    />
  )
}
