import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'
import { StudentFeesClient } from './StudentFeesClient'

export const metadata = {
  title: 'Fees Details | EduSync AI Student Portal',
  description: 'View prescribed semester fees, breakdown, minimum standard regulations, and official receipts.',
}

export default async function StudentFeesPage() {
  const user = await requireStudentUser()

  let student = await prisma.student.findUnique({
    where: { id: user.studentId },
    include: {
      user: true,
      department: true,
      fee: true,
    },
  })

  if (!student) {
    return <div className="p-8 text-center text-[#85878F]">Student record not found.</div>
  }

  // Ensure fee record exists with minimum 55,000
  let fee = student.fee
  if (!fee) {
    fee = await prisma.studentFee.create({
      data: {
        studentId: student.id,
        academicYear: '2025-2026',
        totalFee: 55000,
        tuitionFee: 55000,
        specialLabFee: 0,
        libraryFee: 0,
        examFee: 0,
        paidAmount: 55000,
        dueAmount: 0,
        status: 'PAID',
        dueDate: new Date('2026-04-30'),
        lastPaymentDate: new Date('2026-01-15'),
        paymentReference: `BVC-FEE-${new Date().getFullYear()}-${student.rollNo.padStart(4, '0')}`,
        paymentMode: 'ONLINE_UPI',
      },
    })
  }

  return <StudentFeesClient student={student} fee={fee} />
}
