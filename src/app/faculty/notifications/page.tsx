import React from 'react'
import { prisma } from '@/lib/prisma'
import { NotificationsClient } from './NotificationsClient'

export const metadata = {
  title: 'Notifications & Alerts | EduSync AI Faculty',
  description: 'View real-time academic notifications and operational alerts.',
}

export default async function FacultyNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <NotificationsClient initialNotifications={notifications as any} />
}
