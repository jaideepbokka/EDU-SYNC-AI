import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireHodUser, logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const hod = await requireHodUser()
    const body = await request.json()
    const {
      recipientType = 'ALL',
      facultyId,
      subject,
      message,
      priority = 'NORMAL',
    } = body

    if (!subject || !subject.trim() || !message || !message.trim()) {
      return NextResponse.json(
        { error: 'Subject and Message body are required.' },
        { status: 400 }
      )
    }

    let targetUsers: { id: string; name: string; email: string }[] = []

    if (recipientType === 'ALL') {
      const allFaculty = await prisma.faculty.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true },
      })
      targetUsers = allFaculty.map((f) => ({
        id: f.user.id,
        name: f.user.name,
        email: f.user.email,
      }))
    } else {
      if (!facultyId) {
        return NextResponse.json(
          { error: 'Please select a faculty member.' },
          { status: 400 }
        )
      }
      const f = await prisma.faculty.findUnique({
        where: { id: facultyId },
        include: { user: true },
      })
      if (!f) {
        return NextResponse.json({ error: 'Faculty not found.' }, { status: 404 })
      }
      targetUsers = [{ id: f.user.id, name: f.user.name, email: f.user.email }]
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'No active faculty recipients found.' },
        { status: 400 }
      )
    }

    const priorityPrefix = priority === 'URGENT' ? '🚨 [URGENT HOD MEMO] ' : '[HOD Circular] '
    const fullTitle = `${priorityPrefix}${subject.trim()}`
    const fullMessage = `From: Head of Department (${hod.name})\n\n${message.trim()}`

    // Insert notifications for each faculty user
    await prisma.notification.createMany({
      data: targetUsers.map((u) => ({
        userId: u.id,
        title: fullTitle,
        message: fullMessage,
        type: 'HOD_MAIL',
        linkUrl: '/faculty/notifications',
        isRead: false,
      })),
    })

    await logAuditAction({
      actorId: hod.id,
      actorRole: 'HOD',
      action: 'HOD_MAIL_BROADCAST',
      entityType: 'Notification',
      entityId: hod.id,
      reason: `Broadcast "${subject}" sent to ${targetUsers.length} faculty members`,
    })

    return NextResponse.json({
      success: true,
      recipientCount: targetUsers.length,
      recipients: targetUsers.map((u) => u.name),
      message: `Official Mail successfully dispatched to ${targetUsers.length} faculty member(s). Visible in their notifications.`,
    })
  } catch (err: any) {
    console.error('HOD mail error:', err)
    return NextResponse.json({ error: err.message || 'Failed to dispatch mail' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await requireHodUser()
    const recentMails = await prisma.notification.findMany({
      where: { type: 'HOD_MAIL' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ success: true, mails: recentMails })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
}
