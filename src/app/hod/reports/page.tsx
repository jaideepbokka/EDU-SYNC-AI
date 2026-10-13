import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'
import { HodReportsClient } from './HodReportsClient'

export const metadata = {
  title: 'Export Reports (CSV/PDF) | HOD Portal',
  description: 'Selectable parameter reporting tool for attendance, student fees, and academic records.',
}

export default async function HodReportsPage() {
  await requireHodUser()

  const students = await prisma.student.findMany({
    include: {
      user: true,
      department: true,
      fee: true,
    },
    orderBy: [{ section: 'asc' }, { rollNo: 'asc' }],
  })

  return <HodReportsClient students={students} />
}
