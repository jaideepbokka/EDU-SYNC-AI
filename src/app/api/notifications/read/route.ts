import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id } = body

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      })
    } else {
      await prisma.notification.updateMany({
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
