import React from 'react'
import { prisma } from '@/lib/prisma'
import { AttendanceClient } from './AttendanceClient'

export const metadata = {
  title: 'Attendance Engine | EduSync AI Faculty',
  description: 'Manage face & geolocation attendance sessions and view live attendee logs.',
}

export default async function FacultyAttendancePage() {
  const [activeSession, pastSessions, courseOfferings] = await Promise.all([
    prisma.attendanceSession.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        courseOffering: { include: { subject: true } },
        records: {
          include: {
            student: { include: { user: true } },
          },
          orderBy: { markedAt: 'desc' },
        },
      },
    }),
    prisma.attendanceSession.findMany({
      where: { status: 'CLOSED' },
      include: {
        courseOffering: { include: { subject: true } },
        records: true,
      },
      orderBy: { sessionDate: 'desc' },
      take: 20,
    }),
    prisma.courseOffering.findMany({
      include: { subject: true },
      orderBy: { section: 'asc' },
    }),
  ])

  return (
    <AttendanceClient
      activeSession={activeSession}
      pastSessions={pastSessions}
      courseOfferings={courseOfferings}
    />
  )
}
