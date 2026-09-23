import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'
import { StudentAttendanceClient } from './StudentAttendanceClient'

export const metadata = {
  title: 'Student Biometric & GPS Check-In | EduSync AI',
  description: 'Mark attendance using face verification and GPS classroom geofencing.',
}

export default async function StudentAttendancePage() {
  const user = await requireStudentUser()

  const [currentStudent, students, activeSession] = await Promise.all([
    user.studentId
      ? prisma.student.findUnique({
          where: { id: user.studentId },
          include: { user: true },
        })
      : null,
    prisma.student.findMany({
      include: { user: true },
      orderBy: { rollNo: 'asc' },
    }),
    prisma.attendanceSession.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { user: true } },
          },
        },
      },
    }),
  ])

  const effectiveStudent = currentStudent || students[0]

  return (
    <StudentAttendanceClient
      currentStudent={effectiveStudent as any}
      students={students as any}
      activeSession={activeSession}
    />
  )
}
