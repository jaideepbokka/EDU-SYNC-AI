import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, role = 'FACULTY' } = body

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: role === 'FACULTY' ? 'Faculty ID is required.' : 'Student Roll Number is required.' },
        { status: 400 }
      )
    }

    const input = email.trim()
    const inputLower = input.toLowerCase()

    // 1. Check exact email in User table
    let user = await prisma.user.findFirst({
      where: {
        email: {
          equals: inputLower,
        },
      },
      include: {
        faculty: true,
        student: true,
      },
    })

    // 2. If not found by email, check if it's a Faculty ID (e.g. FAC101)
    if (!user) {
      const faculty = await prisma.faculty.findFirst({
        where: {
          employeeId: {
            equals: input.toUpperCase(),
          },
        },
        include: { user: true },
      })
      if (faculty) {
        user = {
          ...faculty.user,
          faculty,
          student: null,
        } as any
      }
    }

    // 3. If not found, check if it's a Student Roll No (e.g. 101) or Register No (e.g. CSE23A001)
    if (!user) {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { rollNo: input },
            { registerNo: { equals: input.toUpperCase() } },
          ],
        },
        include: { user: true },
      })
      if (student) {
        user = {
          ...student.user,
          faculty: null,
          student,
        } as any
      }
    }

    // Strict validation: No arbitrary fallback. User must exist in the dataset!
    if (!user) {
      return NextResponse.json(
        {
          error:
            role === 'FACULTY'
              ? `Faculty ID "${input}" not found in institutional directory.`
              : `Student Roll Number "${input}" not found in institutional directory.`,
        },
        { status: 401 }
      )
    }

    // Strict Role Enforcement: Selected tab MUST match user's registered role!
    if (role && user.role !== role) {
      return NextResponse.json(
        {
          error:
            user.role === 'STUDENT'
              ? `ID "${input}" belongs to a student. Please switch to the Student Portal tab.`
              : `ID "${input}" belongs to a faculty member. Please switch to the Faculty Portal tab.`,
        },
        { status: 403 }
      )
    }

    // Set session cookies
    const cookieStore = await cookies()

    cookieStore.set('edusync_user_id', user.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7, // 7 days
    })

    cookieStore.set('edusync_role', user.role || role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7,
    })

    cookieStore.set('edusync_email', user.email, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7,
    })

    cookieStore.set('edusync_name', user.name, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7,
    })

    await logAuditAction({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      newValue: user.email,
      reason: `Logged in to ${user.role} portal with verified dataset identity`,
    })

    const redirectUrl = user.role === 'STUDENT' ? '/student' : '/faculty'

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectUrl,
    })
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
