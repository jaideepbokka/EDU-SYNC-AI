import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'

export async function GET() {
  try {
    await requireHodUser()
    const faculty = await prisma.faculty.findMany({
      include: {
        user: true,
        department: true,
        offerings: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    })

    return NextResponse.json({ success: true, faculty })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireHodUser()
    const body = await request.json()
    const {
      name,
      email,
      employeeId,
      designation = 'Assistant Professor',
      phone,
      cabinNumber,
      status = 'ACTIVE',
    } = body

    if (!name || !email || !employeeId) {
      return NextResponse.json(
        { error: 'Name, email, and Employee ID are required.' },
        { status: 400 }
      )
    }

    const dept = await prisma.department.findFirst({ where: { code: 'CSE' } })
    if (!dept) {
      return NextResponse.json({ error: 'CSE Department not found.' }, { status: 404 })
    }

    // Check if user or employee ID already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 400 }
      )
    }

    const existingFaculty = await prisma.faculty.findUnique({
      where: { employeeId: employeeId.trim().toUpperCase() },
    })
    if (existingFaculty) {
      return NextResponse.json(
        { error: 'A faculty with this Employee ID already exists.' },
        { status: 400 }
      )
    }

    // Create User & Faculty
    const newUser = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: 'FACULTY',
        avatar: '/avatars/faculty1.jpg',
      },
    })

    const newFaculty = await prisma.faculty.create({
      data: {
        userId: newUser.id,
        employeeId: employeeId.trim().toUpperCase(),
        designation: designation.trim(),
        phone: phone ? phone.trim() : null,
        cabinNumber: cabinNumber ? cabinNumber.trim() : null,
        status: status || 'ACTIVE',
        departmentId: dept.id,
      },
      include: {
        user: true,
        department: true,
        offerings: { include: { subject: true } },
      },
    })

    return NextResponse.json({ success: true, faculty: newFaculty })
  } catch (err: any) {
    console.error('Error adding faculty:', err)
    return NextResponse.json({ error: err.message || 'Failed to create faculty' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireHodUser()
    const body = await request.json()
    const { facultyId, name, designation, phone, cabinNumber, status } = body

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    const existing = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { user: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Update user name if changed
    if (name && name.trim()) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { name: name.trim() },
      })
    }

    // Update faculty attributes
    const updated = await prisma.faculty.update({
      where: { id: facultyId },
      data: {
        designation: designation !== undefined ? designation : existing.designation,
        phone: phone !== undefined ? phone : existing.phone,
        cabinNumber: cabinNumber !== undefined ? cabinNumber : existing.cabinNumber,
        status: status !== undefined ? status : existing.status,
      },
      include: {
        user: true,
        department: true,
        offerings: { include: { subject: true } },
      },
    })

    return NextResponse.json({ success: true, faculty: updated })
  } catch (err: any) {
    console.error('Error updating faculty:', err)
    return NextResponse.json({ error: err.message || 'Failed to update faculty' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireHodUser()
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('id')

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { user: true },
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }

    // Delete offerings or unlink sessions first
    await prisma.courseOffering.deleteMany({
      where: { facultyId },
    })

    // Delete faculty and user
    await prisma.faculty.delete({
      where: { id: facultyId },
    })

    await prisma.user.delete({
      where: { id: faculty.userId },
    })

    return NextResponse.json({ success: true, message: 'Faculty member removed successfully.' })
  } catch (err: any) {
    console.error('Error deleting faculty:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete faculty' }, { status: 500 })
  }
}
