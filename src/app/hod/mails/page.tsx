import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'
import { HodMailsClient } from './HodMailsClient'

export const metadata = {
  title: 'Faculty Mails & Circulars | HOD Portal',
  description: 'Transmit departmental memos and notices directly to faculty notification feeds.',
}

export default async function HodMailsPage() {
  const hodUser = await requireHodUser()

  const [faculty, recentMails] = await Promise.all([
    prisma.faculty.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true },
      orderBy: { employeeId: 'asc' },
    }),
    prisma.notification.findMany({
      where: { type: 'HOD_MAIL' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return (
    <HodMailsClient
      facultyList={faculty}
      initialSentMails={recentMails}
      hodUser={hodUser}
    />
  )
}
