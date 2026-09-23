import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('edusync_user_id')
    cookieStore.delete('edusync_role')
    cookieStore.delete('edusync_email')
    cookieStore.delete('edusync_name')

    return NextResponse.json({ success: true, redirectUrl: '/' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
