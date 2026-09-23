import React from 'react'
import { prisma } from '@/lib/prisma'
import { TimetableClient } from './TimetableClient'

export const metadata = {
  title: 'Weekly Timetable | EduSync AI Faculty',
  description: 'View lecture schedules and trigger real-time attendance sessions.',
}

export default async function FacultyTimetablePage() {
  const [timetables, courseOfferings, facultyList] = await Promise.all([
    prisma.timetable.findMany({
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { user: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.courseOffering.findMany({
      include: { subject: true, faculty: { include: { user: true } } },
    }),
    prisma.faculty.findMany({
      include: { user: true, department: true },
      orderBy: { employeeId: 'asc' },
    }),
  ])

  return (
    <TimetableClient
      timetables={timetables as any}
      courseOfferings={courseOfferings as any}
      facultyList={facultyList as any}
    />
  )
}
