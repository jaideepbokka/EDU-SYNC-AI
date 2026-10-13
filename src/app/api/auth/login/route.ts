import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role = 'FACULTY' } = body

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email or ID is required.' }, { status: 400 })
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

    // 3. If not found, check if it's a Student Roll No (e.g. 24221A0519, 519, 101) or Register No
    if (!user) {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { rollNo: { equals: input, mode: 'insensitive' } },
            { registerNo: { equals: input.toUpperCase() } },
            ...(input.length >= 3 ? [{ rollNo: { endsWith: input, mode: 'insensitive' as const } }] : []),
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
          error: 'Access denied: User credentials not recognized.',
        },
        { status: 401 }
      )
    }

    // Strict Password Validation for HOD:
    if (user.role === 'HOD' || inputLower === 'hodcse001@gmail.com') {
      if (password !== 'HOD001') {
        return NextResponse.json(
          {
            error: 'Invalid password. Please enter the designated HOD password.',
          },
          { status: 401 }
        )
      }
    }

    // Strict Role Enforcement: Selected tab MUST match user's registered role!
    if (role && user.role !== role) {
      return NextResponse.json(
        {
          error: `Access denied: This account belongs to ${user.role} role.`,
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

    const redirectUrl = user.role === 'STUDENT' ? '/student' : user.role === 'HOD' ? '/hod' : '/faculty'

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
