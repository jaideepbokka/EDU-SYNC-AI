import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get('semester')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (semester) where.semester = Number(semester)
    if (studentId) where.studentId = studentId

    const results = await prisma.semesterResult.findMany({
      where,
      include: {
        student: { include: { user: true } },
        subjectResults: true,
      },
      orderBy: [{ semester: 'desc' }, { sgpa: 'desc' }],
    })

    return NextResponse.json(results)
  } catch (err: any) {
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
      return NextResponse.json({ error: 'Semester Result ID is required for deletion.' }, { status: 400 })
    }

    const result = await prisma.semesterResult.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
      },
    })

    if (!result) {
      return NextResponse.json({ error: 'Semester result record not found.' }, { status: 404 })
    }

    const studentName = result.student?.user?.name || 'Student'
    const rollNo = result.student?.rollNo || 'N/A'
    const sem = result.semester

    // Deleting semesterResult cascades to SubjectResult
    await prisma.semesterResult.delete({
      where: { id },
    })

    await logAuditAction({
      actorRole: 'FACULTY',
      action: 'SEMESTER_RESULT_DELETED',
      entityType: 'SemesterResult',
      entityId: id,
      oldValue: `Sem ${sem} Result for ${studentName} (${rollNo})`,
      reason: 'Faculty removed semester result entry from registry',
    })

    return NextResponse.json({
      success: true,
      message: `Semester ${sem} result for ${studentName} (${rollNo}) deleted successfully.`,
      deletedId: id,
    })
  } catch (err: any) {
    console.error('Error deleting semester result:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to delete semester result.' },
      { status: 500 }
    )
  }
}
