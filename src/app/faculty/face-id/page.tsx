import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireFacultyUser } from '@/lib/auth'
import { FacultyFaceIdWidget } from '@/components/FacultyFaceIdWidget'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Real-Time Face ID Generator | EduSync AI Faculty',
  description: 'Generate real-time 7-digit Face ID codes and manage biometric registration for Section A & B students.',
}

export default async function FacultyFaceIdPage() {
  await requireFacultyUser()

  const students = await prisma.student.findMany({
    include: {
      user: true,
    },
    orderBy: { rollNo: 'asc' },
  })

  return (
    <div className="space-y-6">
      <FacultyFaceIdWidget initialStudents={students as any} />
    </div>
  )
}
