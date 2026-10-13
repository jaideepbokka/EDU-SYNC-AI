import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const risk = searchParams.get('risk')
    const section = searchParams.get('section')

    const where: any = {}
    if (risk && risk !== 'ALL') where.riskLevel = risk
    if (section && section !== 'ALL') where.section = section

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
        department: true,
        riskProfiles: { take: 1, orderBy: { calculatedAt: 'desc' } },
      },
      orderBy: { rollNo: 'asc' },
    })

    return NextResponse.json(students)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      rollNo,
      registerNo,
      batch = '2023-2027',
      section = 'A',
      currentSemester = 5,
      guardianName,
      guardianPhone,
      studentPhone,
      address,
    } = body

    if (!name || !email || !rollNo || !registerNo) {
      return NextResponse.json(
        { error: 'Name, email, roll number, and register number are required.' },
        { status: 400 }
      )
    }

    // Default CSE Department
    const dept = await prisma.department.findFirst({ where: { code: 'CSE' } })
    if (!dept) {
      return NextResponse.json({ error: 'Default department not found' }, { status: 500 })
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'STUDENT',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      },
    })

    // Create Student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNo,
        registerNo,
        batch,
        section,
        currentSemester: Number(currentSemester),
        departmentId: dept.id,
        currentCgpa: 8.0,
        attendancePercentage: 85.0,
        riskLevel: 'LOW',
        riskScore: 10,
        guardianName,
        guardianPhone,
        studentPhone,
        address,
      },
      include: { user: true },
    })

    // Enroll in active course offerings in a single batch query
    const offerings = await prisma.courseOffering.findMany({
      where: { semester: Number(currentSemester), section },
    })

    if (offerings.length > 0) {
      await prisma.studentEnrollment.createMany({
        data: offerings.map((off) => ({
          studentId: student.id,
          courseOfferingId: off.id,
        })),
        skipDuplicates: true,
      })
    }

    logAuditAction({
      actorRole: 'FACULTY',
      action: 'STUDENT_ENROLLED',
      entityType: 'Student',
      entityId: student.id,
      newValue: `${name} (${rollNo})`,
      reason: 'New student admission enrollment',
    }).catch(console.error)

    return NextResponse.json(student, { status: 201 })
  } catch (err: any) {
    console.error('Error creating student:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await request.json()
        id = body?.id
      } catch {
        // No body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required for deletion.' }, { status: 400 })
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 })
    }

    const studentName = student.user?.name || 'Student'
    const rollNo = student.rollNo

    // Deleting the associated user cascades to the student record and all child tables
    await prisma.user.delete({
      where: { id: student.userId },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'STUDENT_DELETED',
      entityType: 'Student',
      entityId: id,
      oldValue: `${studentName} (${rollNo})`,
      reason: 'Faculty removed student record from directory',
    })

    return NextResponse.json({
      success: true,
      message: `Student ${studentName} (${rollNo}) deleted successfully.`,
      deletedId: id,
    })
  } catch (err: any) {
    console.error('Error deleting student:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to delete student record.' },
      { status: 500 }
    )
  }
}

