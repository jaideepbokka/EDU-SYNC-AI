import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT' || !user.studentId) {
      return NextResponse.json(
        { error: 'Unauthorized: Student authentication required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { verificationToken } = body

    if (!verificationToken) {
      return NextResponse.json(
        {
          error:
            'Security Requirement: Attendance check-in requires a valid, single-use biometric verification token issued by /api/attendance/verify.',
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        error: 'Please submit attendance check-ins directly via /api/attendance/mark with your single-use verification token.',
      },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
