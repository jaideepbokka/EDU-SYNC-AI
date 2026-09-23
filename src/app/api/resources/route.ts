import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function GET() {
  try {
    const resources = await prisma.learningResource.findMany({
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, resources })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topicId, title, type = 'VIDEO', url, content, durationMinutes = 30, author } = body

    if (!topicId || !title) {
      return NextResponse.json({ error: 'Topic ID and Video Title are required' }, { status: 400 })
    }

    const resource = await prisma.learningResource.create({
      data: {
        topicId,
        title,
        type,
        url: url || 'https://www.youtube.com/watch?v=bZkzH5x0Ikk',
        content,
        durationMinutes: Number(durationMinutes) || 30,
        author: author || 'Faculty CSE',
      },
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true },
            },
          },
        },
      },
    })

    // Sync notification for enrolled students
    try {
      const students = await prisma.student.findMany({
        include: { user: true },
        take: 10,
      })

      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map((s) => ({
            userId: s.userId,
            title: 'New Topic Video Posted',
            message: `Faculty posted: "${title}" for topic ${resource.topic?.title || 'Coursework'}.`,
            type: 'ACADEMIC',
            linkUrl: '/student/courses',
          })),
        })
      }
    } catch (notifErr) {
      console.warn('Failed to dispatch student notifications:', notifErr)
    }

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'LEARNING_VIDEO_POSTED',
      entityType: 'LearningResource',
      entityId: resource.id,
      newValue: title,
      reason: `Topic-based course video posted: ${resource.topic?.title}`,
    })

    return NextResponse.json({ success: true, resource }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 })
    }

    const deleted = await prisma.learningResource.delete({
      where: { id },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'LEARNING_VIDEO_DELETED',
      entityType: 'LearningResource',
      entityId: id,
      newValue: deleted.title,
      reason: 'Course video removed by faculty',
    })

    return NextResponse.json({ success: true, deleted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
