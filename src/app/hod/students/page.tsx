import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'
import { HodStudentsClient } from './HodStudentsClient'

export const metadata = {
  title: 'CSE Student Directory | HOD Portal',
  description: 'Comprehensive directory of enrolled CSE students, attendance standings, and fee clearances.',
}

export default async function HodStudentsPage() {
  await requireHodUser()

  const students = await prisma.student.findMany({
    include: {
      user: true,
      department: true,
      fee: true,
    },
    orderBy: [{ section: 'asc' }, { rollNo: 'asc' }],
  })

  return <HodStudentsClient students={students} />
}
