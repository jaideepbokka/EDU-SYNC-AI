import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireFacultyUser } from '@/lib/auth'
import { FacultyLayoutWrapper } from '@/components/FacultyLayoutWrapper'

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireFacultyUser()

  // Dynamic badge counts
  const [pendingEvalCount, atRiskCount, activeSession, notifications] = await Promise.all([
    prisma.studentAttempt.count({
      where: { status: 'SUBMITTED' },
    }),
    prisma.student.count({
      where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } },
    }),
    prisma.attendanceSession.findFirst({
      where: { status: 'ACTIVE' },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  return (
    <FacultyLayoutWrapper
      userName={user.name}
      userDesignation={user.designation}
      userAvatar={user.avatar}
      pendingEvaluationsCount={pendingEvalCount}
      atRiskCount={atRiskCount}
      activeSessionExists={!!activeSession}
      notifications={notifications}
    >
      {children}
    </FacultyLayoutWrapper>
  )
}
