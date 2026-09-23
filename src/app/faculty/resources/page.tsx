import React from 'react'
import { prisma } from '@/lib/prisma'
import { ResourcesClient } from './ResourcesClient'

export const metadata = {
  title: 'Learning Courses & Topic Videos | EduSync AI Faculty',
  description: 'Manage curriculum learning videos mapped by topic and synced with students.',
}

export default async function FacultyResourcesPage() {
  const [resources, topics] = await Promise.all([
    prisma.learningResource.findMany({
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.topic.findMany({
      include: {
        unit: {
          include: { subject: true },
        },
      },
      orderBy: { title: 'asc' },
    }),
  ])

  return <ResourcesClient resources={resources as any} topics={topics as any} />
}
