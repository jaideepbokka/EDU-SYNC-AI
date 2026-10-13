import React from 'react'
import { prisma } from '@/lib/prisma'
import { StudentListClient } from './StudentListClient'

export const metadata = {
  title: 'Student Directory | EduSync AI Faculty',
  description: 'Manage enrolled students, academic attendance, and risk profiles.',
}

export const dynamic = 'force-dynamic'

export default async function FacultyStudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      user: true,
      department: true,
      riskProfiles: { take: 1, orderBy: { calculatedAt: 'desc' } },
    },
    orderBy: { rollNo: 'asc' },
  })

  return <StudentListClient initialStudents={students as any} />
}
