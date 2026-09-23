import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, subjectId, unitId, topicId, unitNumber, title, description, topicNumber, difficulty, estimatedHours, code, bloomLevel } = body

    if (type === 'UNIT') {
      const unit = await prisma.unit.create({
        data: {
          subjectId,
          unitNumber: Number(unitNumber),
          title,
          description,
        },
      })
      await logAuditAction({
        actorRole: 'FACULTY',
        action: 'SYLLABUS_UNIT_CREATED',
        entityType: 'Unit',
        entityId: unit.id,
        newValue: title,
        reason: `Unit ${unitNumber} added to subject`,
      })
      return NextResponse.json({ success: true, unit }, { status: 201 })
    }

    if (type === 'TOPIC') {
      const topic = await prisma.topic.create({
        data: {
          unitId,
          topicNumber: Number(topicNumber),
          title,
          description,
          difficulty: difficulty || 'MEDIUM',
          estimatedHours: Number(estimatedHours) || 3.0,
        },
      })
      await logAuditAction({
        actorRole: 'FACULTY',
        action: 'SYLLABUS_TOPIC_CREATED',
        entityType: 'Topic',
        entityId: topic.id,
        newValue: title,
        reason: `Topic ${topicNumber} added to unit`,
      })
      return NextResponse.json({ success: true, topic }, { status: 201 })
    }

    if (type === 'OBJECTIVE') {
      const lo = await prisma.learningObjective.create({
        data: {
          topicId,
          code: code || 'LO-1.0',
          description,
          bloomLevel: bloomLevel || 'APPLY',
        },
      })
      return NextResponse.json({ success: true, lo }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid syllabus entity type' }, { status: 400 })
  } catch (err: any) {
    console.error('Error in syllabus API:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let type = searchParams.get('type')
    let id = searchParams.get('id')

    if (!id || !type) {
      try {
        const body = await request.json()
        type = type || body?.type
        id = id || body?.id
      } catch {
        // No json body
      }
    }

    if (!id || !type) {
      return NextResponse.json(
        { error: 'Entity type (UNIT, TOPIC, or OBJECTIVE) and id are required' },
        { status: 400 }
      )
    }

    if (type === 'UNIT') {
      const existing = await prisma.unit.findUnique({
        where: { id },
        select: { id: true, unitNumber: true, title: true },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
      }

      await prisma.unit.delete({ where: { id } })

      await logAuditAction({
        actorRole: 'FACULTY',
        action: 'SYLLABUS_UNIT_DELETED',
        entityType: 'Unit',
        entityId: id,
        oldValue: `Unit ${existing.unitNumber}: ${existing.title}`,
        reason: 'Faculty deleted syllabus unit',
      })

      return NextResponse.json({
        success: true,
        message: `Unit ${existing.unitNumber}: ${existing.title} deleted successfully.`,
        deletedId: id,
        type: 'UNIT',
      })
    }

    if (type === 'TOPIC') {
      const existing = await prisma.topic.findUnique({
        where: { id },
        select: { id: true, topicNumber: true, title: true },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
      }

      await prisma.topic.delete({ where: { id } })

      await logAuditAction({
        actorRole: 'FACULTY',
        action: 'SYLLABUS_TOPIC_DELETED',
        entityType: 'Topic',
        entityId: id,
        oldValue: `Topic ${existing.topicNumber}: ${existing.title}`,
        reason: 'Faculty deleted syllabus topic',
      })

      return NextResponse.json({
        success: true,
        message: `Topic ${existing.topicNumber}: ${existing.title} deleted successfully.`,
        deletedId: id,
        type: 'TOPIC',
      })
    }

    if (type === 'OBJECTIVE') {
      const existing = await prisma.learningObjective.findUnique({
        where: { id },
        select: { id: true, code: true, description: true },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Learning objective not found' }, { status: 404 })
      }

      await prisma.learningObjective.delete({ where: { id } })

      return NextResponse.json({
        success: true,
        message: `Learning Objective ${existing.code} deleted successfully.`,
        deletedId: id,
        type: 'OBJECTIVE',
      })
    }

    return NextResponse.json({ error: 'Invalid syllabus entity type' }, { status: 400 })
  } catch (err: any) {
    console.error('Error deleting syllabus entity:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to delete syllabus entity' },
      { status: 500 }
    )
  }
}

