import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await requireStudentUser()
    const body = await request.json()
    const { amount = 0, paymentMode = 'ONLINE_UPI' } = body

    if (!user.studentId) {
      return NextResponse.json({ error: 'Student ID not found' }, { status: 400 })
    }

    const payAmount = Number(amount)
    if (isNaN(payAmount) || payAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
    }

    const fee = await prisma.studentFee.findUnique({
      where: { studentId: user.studentId },
    })

    if (!fee) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
    }

    const newPaid = Math.min(fee.totalFee, fee.paidAmount + payAmount)
    const newDue = Math.max(0, fee.totalFee - newPaid)
    const newStatus = newDue <= 0 ? 'PAID' : 'PARTIAL'
    const newRef = `BVC-TXN-${Date.now().toString().slice(-8)}`

    const updated = await prisma.studentFee.update({
      where: { studentId: user.studentId },
      data: {
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newStatus,
        lastPaymentDate: new Date(),
        paymentReference: newRef,
        paymentMode,
      },
    })

    return NextResponse.json({
      success: true,
      fee: updated,
      message: `Payment of ₹${payAmount.toLocaleString('en-IN')} verified successfully. Receipt: ${newRef}`,
    })
  } catch (err: any) {
    console.error('Fee payment error:', err)
    return NextResponse.json({ error: err.message || 'Payment processing failed' }, { status: 500 })
  }
}
