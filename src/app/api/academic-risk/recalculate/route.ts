import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateStudentRisk } from '@/lib/riskEngine'

export async function POST() {
  try {
    const students = await prisma.student.findMany()
    const results = []

    for (const stu of students) {
      const res = await evaluateStudentRisk(stu.id)
      results.push({ studentId: stu.id, ...res })
    }

    return NextResponse.json({ success: true, count: results.length, results })
  } catch (err: any) {
    console.error('Error recalculating academic risk:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
