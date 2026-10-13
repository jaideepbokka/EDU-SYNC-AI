import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'FACULTY' | 'STUDENT' | 'ADMIN' | 'HOD'
  facultyId?: string
  studentId?: string
  departmentCode?: string
  designation?: string
  avatar?: string
  rollNo?: string
  attendancePercentage?: number
  currentCgpa?: number
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('edusync_user_id')?.value

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      faculty: { include: { department: true } },
      student: { include: { department: true } },
    },
  })

  if (!user) {
    return null
  }

  if (user.role === 'HOD') {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'HOD',
      facultyId: user.faculty?.id,
      departmentCode: user.faculty?.department?.code || 'CSE',
      designation: user.faculty?.designation || 'Head of Department (HOD)',
      avatar: user.avatar || '/avatars/faculty1.jpg',
    }
  }

  if (user.role === 'STUDENT' && user.student) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'STUDENT',
      studentId: user.student.id,
      departmentCode: user.student.department.code,
      designation: `Semester ${user.student.currentSemester} (Sec ${user.student.section})`,
      avatar: user.avatar || '/avatars/student1.jpg',
      rollNo: user.student.rollNo,
      attendancePercentage: user.student.attendancePercentage,
      currentCgpa: user.student.currentCgpa,
    }
  }

  if (user.faculty) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'FACULTY',
      facultyId: user.faculty.id,
      departmentCode: user.faculty.department.code,
      designation: user.faculty.designation,
      avatar: user.avatar || '/avatars/faculty1.jpg',
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role as any) || 'FACULTY',
    avatar: user.avatar || undefined,
  }
}

export async function requireFacultyUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?error=login_required&role=faculty')
  }
  if (user.role !== 'FACULTY' && user.role !== 'ADMIN' && user.role !== 'HOD') {
    redirect('/student?error=faculty_access_only')
  }
  return user
}

export async function requireHodUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?error=login_required&role=hod')
  }
  if (user.role !== 'HOD' && user.role !== 'ADMIN') {
    redirect('/?error=unauthorized&role=hod')
  }
  return user
}

export async function requireStudentUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?error=login_required&role=student')
  }
  if (user.role !== 'STUDENT') {
    redirect('/faculty?error=student_access_only')
  }
  return user
}

export async function logAuditAction(params: {
  actorId?: string
  actorRole: string
  action: string
  entityType: string
  entityId: string
  oldValue?: string
  newValue?: string
  reason?: string
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        reason: params.reason,
      },
    })
  } catch (err) {
    console.error('Failed to write audit log:', err)
    return null
  }
}
