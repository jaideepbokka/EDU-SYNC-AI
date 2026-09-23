import { prisma } from './prisma'

export interface RiskEvaluationResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  riskScore: number
  lowAttendanceAlert: boolean
  failedAssessmentsAlert: boolean
  scoreDropAlert: boolean
  primaryReason: string
}

export async function evaluateStudentRisk(studentId: string): Promise<RiskEvaluationResult> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      attendanceRecords: true,
      attempts: true,
      semesterResults: {
        orderBy: { semester: 'desc' },
      },
    },
  })

  if (!student) {
    throw new Error(`Student ${studentId} not found`)
  }

  let score = 0
  const reasons: string[] = []

  // 1. Attendance Analysis
  const totalSessions = student.attendanceRecords.length
  const attended = student.attendanceRecords.filter(
    (r) => r.status === 'PRESENT' || r.status === 'LATE'
  ).length

  const attendancePct = totalSessions > 0 ? (attended / totalSessions) * 100 : student.attendancePercentage

  let lowAttendanceAlert = false
  if (attendancePct < 50) {
    score += 45
    lowAttendanceAlert = true
    reasons.push(`Severely critical attendance (${attendancePct.toFixed(1)}% < 50%)`)
  } else if (attendancePct < 65) {
    score += 30
    lowAttendanceAlert = true
    reasons.push(`Critical low attendance (${attendancePct.toFixed(1)}% < 65%)`)
  } else if (attendancePct < 75) {
    score += 15
    lowAttendanceAlert = true
    reasons.push(`Attendance below mandatory 75% threshold (${attendancePct.toFixed(1)}%)`)
  }

  // 2. Assessment Analysis
  const submittedAttempts = student.attempts.filter((a) => a.status !== 'IN_PROGRESS')
  const failedAttempts = submittedAttempts.filter((a) => a.percentage < 40)

  let failedAssessmentsAlert = false
  if (failedAttempts.length >= 2) {
    score += 30
    failedAssessmentsAlert = true
    reasons.push(`Failed ${failedAttempts.length} recent assessments`)
  } else if (failedAttempts.length === 1) {
    score += 15
    failedAssessmentsAlert = true
    reasons.push('Failed 1 recent assessment')
  }

  // 3. GPA Trend Analysis
  let scoreDropAlert = false
  if (student.semesterResults.length >= 2) {
    const latest = student.semesterResults[0].sgpa
    const previous = student.semesterResults[1].sgpa
    if (previous - latest >= 1.5) {
      score += 25
      scoreDropAlert = true
      reasons.push(`Sharp GPA decline from ${previous.toFixed(2)} to ${latest.toFixed(2)}`)
    } else if (previous - latest >= 0.8) {
      score += 15
      scoreDropAlert = true
      reasons.push(`GPA dropped by ${(previous - latest).toFixed(2)} points`)
    }
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score))

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  if (score >= 70) riskLevel = 'CRITICAL'
  else if (score >= 45) riskLevel = 'HIGH'
  else if (score >= 25) riskLevel = 'MEDIUM'

  const primaryReason = reasons.length > 0 ? reasons.join('; ') : 'Academic performance within acceptable parameters.'

  // Update student table
  await prisma.student.update({
    where: { id: studentId },
    data: {
      riskLevel,
      riskScore: score,
      attendancePercentage: attendancePct,
    },
  })

  // Upsert risk profile record
  await prisma.academicRisk.create({
    data: {
      studentId,
      riskLevel,
      riskScore: score,
      lowAttendanceAlert,
      failedAssessmentsAlert,
      scoreDropAlert,
      primaryReason,
    },
  })

  return {
    riskLevel,
    riskScore: score,
    lowAttendanceAlert,
    failedAssessmentsAlert,
    scoreDropAlert,
    primaryReason,
  }
}
