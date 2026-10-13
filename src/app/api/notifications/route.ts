import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')
    const deleteAllRead = searchParams.get('allRead') === 'true'

    // Also check if body has id or ids
    let ids: string[] = []
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json()
        if (body.id) id = body.id
        if (Array.isArray(body.ids)) ids = body.ids
      } catch {
        // ignore JSON parse error if body is empty
      }
    }

    if (id) {
      await prisma.notification.deleteMany({
        where: { id },
      })
      return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
    }

    if (ids.length > 0) {
      const deleted = await prisma.notification.deleteMany({
        where: { id: { in: ids } },
      })
      return NextResponse.json({ success: true, count: deleted.count })
    }

    if (deleteAllRead) {
      // Delete all verified/read notifications
      const deleted = await prisma.notification.deleteMany({
        where: { isRead: true },
      })
      return NextResponse.json({
        success: true,
        count: deleted.count,
        message: `Deleted ${deleted.count} verified notification(s)`,
      })
    }

    return NextResponse.json(
      { error: 'Notification ID or allRead parameter is required' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('Error deleting notification:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete notification' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isRead } = body

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: Boolean(isRead) },
    })

    return NextResponse.json({ success: true, notification: updated })
  } catch (err: any) {
    console.error('Error updating notification verification status:', err)
    return NextResponse.json({ error: err.message || 'Failed to update notification' }, { status: 500 })
  }
}
