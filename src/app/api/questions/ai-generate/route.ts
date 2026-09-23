import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAiQuiz } from '@/lib/gemini'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topicId, difficulty = 'MEDIUM', count = 3, bloomLevel } = body

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { unit: { include: { subject: true } } },
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const questions = await generateAiQuiz({
      subjectName: topic.unit.subject.name,
      topicTitle: topic.title,
      difficulty: difficulty as any,
      count: Number(count),
      bloomsLevel: bloomLevel,
    })

    return NextResponse.json({
      success: true,
      topic: { id: topic.id, title: topic.title, subjectName: topic.unit.subject.name },
      questions,
    })
  } catch (err: any) {
    console.error('Error generating AI questions:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
