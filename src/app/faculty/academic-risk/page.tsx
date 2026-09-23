import React from 'react'
import { prisma } from '@/lib/prisma'
import { AcademicRiskClient } from './AcademicRiskClient'

export const metadata = {
  title: 'Academic Risk Engine | EduSync AI Faculty',
  description: 'AI-assisted academic risk indicators and faculty intervention strategies.',
}

export default async function FacultyAcademicRiskPage() {
  const [studentsAtRisk, interventions] = await Promise.all([
    prisma.student.findMany({
      where: {
        riskLevel: { in: ['CRITICAL', 'HIGH', 'MEDIUM'] },
      },
      include: {
        user: true,
        department: true,
        riskProfiles: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
      orderBy: { riskScore: 'desc' },
    }),
    prisma.facultyIntervention.findMany({
      include: {
        student: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <AcademicRiskClient
      studentsAtRisk={studentsAtRisk as any}
      interventions={interventions as any}
    />
  )
}
