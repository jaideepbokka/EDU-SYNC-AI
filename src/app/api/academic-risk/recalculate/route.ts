import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateStudentRisk } from '@/lib/riskEngine'

export async function POST() {
  try {
    const students = await prisma.student.findMany({ select: { id: true } })
    const results: any[] = []
    const BATCH_SIZE = 15

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const chunk = students.slice(i, i + BATCH_SIZE)
      const chunkResults = await Promise.all(
        chunk.map(async (stu) => {
          const res = await evaluateStudentRisk(stu.id)
          return { studentId: stu.id, ...res }
        })
      )
      results.push(...chunkResults)
    }

    return NextResponse.json({ success: true, count: results.length, results })
  } catch (err: any) {
    console.error('Error recalculating academic risk:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
