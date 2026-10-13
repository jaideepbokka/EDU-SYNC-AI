import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAiLearningPath } from '@/lib/gemini'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, subjectId, weakTopics = ['Graph Traversal', 'Dijkstra Priority Queue'], action, stepId, isCompleted } = body

    if (action === 'TOGGLE_STEP') {
      const step = await prisma.learningPathStep.update({
        where: { id: stepId },
        data: {
          isCompleted: Boolean(isCompleted),
          completedAt: isCompleted ? new Date() : null,
        },
      })
      return NextResponse.json({ success: true, step })
    }

    if (!studentId || !subjectId) {
      return NextResponse.json({ error: 'Student ID and Subject ID are required' }, { status: 400 })
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    let topic = await prisma.topic.findFirst({ where: { unit: { subjectId } } })
    if (!topic) {
      let unit = await prisma.unit.findFirst({ where: { subjectId } })
      if (!unit) {
        unit = await prisma.unit.create({
          data: {
            subjectId,
            unitNumber: 1,
            title: `${subject.name} - Core Foundations`,
            description: `Curriculum unit for ${subject.name}`,
          },
        })
      }
      topic = await prisma.topic.create({
        data: {
          unitId: unit.id,
          topicNumber: 1,
          title: `${subject.name} - Core Foundations`,
          description: `Foundational principles in ${subject.name}`,
        },
      })
    }

    // Call Gemini or Academic rule engine
    const aiPath = await generateAiLearningPath({
      subjectName: subject.name,
      weakTopics,
      currentAccuracy: 45,
      targetGoal: 'Target 80% Benchmark Proficiency',
    })

    const path = await prisma.learningPath.create({
      data: {
        studentId,
        subjectId,
        title: aiPath.title,
        reason: aiPath.summary,
        status: 'ACTIVE',
      },
    })

    // Find any topic matching or fallback
    const availableTopics = await prisma.topic.findMany({
      where: { unit: { subjectId } },
    })

    const stepData = aiPath.steps.map((s: any, i: number) => {
      const matchedTopic =
        availableTopics.find((t) => t.title.toLowerCase().includes(s.topicTitle.toLowerCase())) ||
        availableTopics[i % availableTopics.length] ||
        topic

      return {
        learningPathId: path.id,
        topicId: matchedTopic.id,
        orderIndex: i + 1,
        title: s.topicTitle,
        description: s.description,
        resourceUrl: 'https://visualgo.net/en',
        isCompleted: false,
      }
    })

    if (stepData.length > 0) {
      await prisma.learningPathStep.createMany({
        data: stepData,
      })
    }

    try {
      await logAuditAction({
        actorRole: 'FACULTY',
        action: 'LEARNING_PATH_GENERATED',
        entityType: 'LearningPath',
        entityId: path.id,
        newValue: path.title,
        reason: 'AI Remedial Learning Path assigned to at-risk student',
      })
    } catch (auditErr) {
      console.warn('Audit logging warning:', auditErr)
    }

    return NextResponse.json({ success: true, path }, { status: 201 })
  } catch (err: any) {
    console.error('Error generating learning path:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
