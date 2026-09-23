import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, logAuditAction } from '@/lib/auth'

export async function GET() {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser || sessionUser.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized faculty access.' }, { status: 401 })
    }

    const faculty = await prisma.faculty.findFirst({
      where: { userId: sessionUser.id },
      include: {
        department: true,
        user: true,
        offerings: {
          include: { subject: true, enrollments: true },
        },
      },
    })

    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ faculty, departments })
  } catch (error: any) {
    console.error('Error fetching faculty profile:', error)
    return NextResponse.json({ error: 'Failed to retrieve profile data.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser || sessionUser.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized faculty access.' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      departmentId,
      departmentName,
      designation,
      phone,
      cabinNumber,
      cabinHours,
      email,
      avatar,
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Faculty name is required.' }, { status: 400 })
    }

    // Resolve Department
    let targetDepartmentId = departmentId
    if (!targetDepartmentId && departmentName) {
      // Find or create department
      const existing = await prisma.department.findFirst({
        where: { name: { equals: departmentName.trim() } },
      })
      if (existing) {
        targetDepartmentId = existing.id
      } else {
        const code = departmentName
          .trim()
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 5) || 'DEPT'
        const created = await prisma.department.create({
          data: {
            name: departmentName.trim(),
            code: `${code}_${Date.now().toString().slice(-3)}`,
          },
        })
        targetDepartmentId = created.id
      }
    }

    if (!targetDepartmentId) {
      return NextResponse.json({ error: 'Academic department is required.' }, { status: 400 })
    }

    // If email changed, verify uniqueness
    if (email && email.toLowerCase().trim() !== sessionUser.email.toLowerCase()) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })
      if (existingEmail && existingEmail.id !== sessionUser.id) {
        return NextResponse.json({ error: 'Email address is already in use by another account.' }, { status: 400 })
      }
    }

    // Update User Record
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : undefined,
        ...(avatar !== undefined ? { avatar } : {}),
      },
    })

    // Update Faculty Record
    const updatedFaculty = await prisma.faculty.update({
      where: { userId: sessionUser.id },
      data: {
        departmentId: targetDepartmentId,
        designation: designation ? designation.trim() : 'Professor',
        phone: phone !== undefined ? phone.trim() : null,
        cabinNumber: cabinNumber !== undefined ? cabinNumber.trim() : null,
        cabinHours: cabinHours !== undefined ? cabinHours.trim() : null,
      },
      include: {
        department: true,
        user: true,
        offerings: {
          include: { subject: true, enrollments: true },
        },
      },
    })

    // Update cookies if email changed
    if (email && email.toLowerCase().trim() !== sessionUser.email.toLowerCase()) {
      const cookieStore = await cookies()
      cookieStore.set('edusync_email', updatedUser.email, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 86400 * 7,
      })
    }

    // Audit action
    await logAuditAction({
      actorId: sessionUser.id,
      actorRole: 'FACULTY',
      action: 'UPDATE_PERSONAL_DETAILS',
      entityType: 'FACULTY_PROFILE',
      entityId: updatedFaculty.id,
      oldValue: `${sessionUser.name} (${sessionUser.designation})`,
      newValue: `${updatedUser.name} (${updatedFaculty.designation}) - Dept: ${updatedFaculty.department.name}`,
      reason: 'Faculty updated personal and departmental details from self-service portal',
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      faculty: updatedFaculty,
      message: 'Personal details updated successfully!',
    })
  } catch (error: any) {
    console.error('Error updating faculty profile:', error)
    return NextResponse.json({ error: error.message || 'Failed to update personal details.' }, { status: 500 })
  }
}
