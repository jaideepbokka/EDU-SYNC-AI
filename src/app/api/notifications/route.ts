import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const deleteAllRead = searchParams.get('allRead') === 'true'

    if (id) {
      await prisma.notification.delete({
        where: { id },
      })
      return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
    }

    if (deleteAllRead) {
      const user = await getCurrentUser()
      if (user) {
        const deleted = await prisma.notification.deleteMany({
          where: {
            userId: user.id,
            isRead: true,
          },
        })
        return NextResponse.json({ success: true, count: deleted.count })
      } else {
        const deleted = await prisma.notification.deleteMany({
          where: { isRead: true },
        })
        return NextResponse.json({ success: true, count: deleted.count })
      }
    }

    return NextResponse.json({ error: 'Notification ID or allRead parameter is required' }, { status: 400 })
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
