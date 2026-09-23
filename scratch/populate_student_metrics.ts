import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('--- Populating Varied Student Metrics, Topic Masteries & Academic Risk ---')

  const students = await prisma.student.findMany({
    include: { user: true },
    orderBy: { rollNo: 'asc' },
  })
  const subjects = await prisma.subject.findMany()
  const topics = await prisma.topic.findMany({ orderBy: { topicNumber: 'asc' } })
  const assessments = await prisma.assessment.findMany()

  console.log(`Found ${students.length} students, ${subjects.length} subjects, ${topics.length} topics, ${assessments.length} assessments.`)

  // Define custom data for the 6 at-risk students:
  const atRiskMap: Record<string, {
    attendance: number
    subjectMastery: number
    topicBase: number
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    riskScore: number
    primaryReason: string
    failedAssessments: number
    gpaDrop: number
    sem5Sgpa: number
    sem4Sgpa: number
  }> = {
    '109': { // Dhanush Kumar
      attendance: 20.0,
      subjectMastery: 22.0,
      topicBase: 20,
      riskLevel: 'CRITICAL',
      riskScore: 90,
      primaryReason: 'Severely critical attendance (20.0% < 50%); Failed 2 recent assessments; Sharp GPA decline from 7.60 to 4.90',
      failedAssessments: 2,
      gpaDrop: 2.7,
      sem5Sgpa: 4.90,
      sem4Sgpa: 7.60,
    },
    '116': { // Manoj Kumar
      attendance: 28.0,
      subjectMastery: 25.0,
      topicBase: 24,
      riskLevel: 'CRITICAL',
      riskScore: 85,
      primaryReason: 'Severely critical attendance (28.0% < 50%); Failed 2 recent assessments; Sharp GPA decline from 8.10 to 5.80',
      failedAssessments: 2,
      gpaDrop: 2.3,
      sem5Sgpa: 5.80,
      sem4Sgpa: 8.10,
    },
    '112': { // Ishita Reddy
      attendance: 45.0,
      subjectMastery: 42.0,
      topicBase: 40,
      riskLevel: 'HIGH',
      riskScore: 60,
      primaryReason: 'Severely critical attendance (45.0% < 50%); Failed 1 recent assessment; GPA dropped by 1.10 points',
      failedAssessments: 1,
      gpaDrop: 1.1,
      sem5Sgpa: 6.80,
      sem4Sgpa: 7.90,
    },
    '125': { // Devika Rani
      attendance: 54.0,
      subjectMastery: 48.0,
      topicBase: 46,
      riskLevel: 'HIGH',
      riskScore: 50,
      primaryReason: 'Critical low attendance (54.0% < 65%); Failed 1 recent assessment; GPA dropped by 0.90 points',
      failedAssessments: 1,
      gpaDrop: 0.9,
      sem5Sgpa: 6.50,
      sem4Sgpa: 7.40,
    },
    '107': { // Charan Reddy
      attendance: 69.0,
      subjectMastery: 58.0,
      topicBase: 56,
      riskLevel: 'MEDIUM',
      riskScore: 35,
      primaryReason: 'Attendance below mandatory 75% threshold (69.0%); GPA dropped by 1.10 points',
      failedAssessments: 0,
      gpaDrop: 1.1,
      sem5Sgpa: 7.10,
      sem4Sgpa: 8.20,
    },
    '130': { // Lokesh Reddy
      attendance: 71.0,
      subjectMastery: 62.0,
      topicBase: 60,
      riskLevel: 'MEDIUM',
      riskScore: 30,
      primaryReason: 'Attendance below mandatory 75% threshold (71.0%); Failed 1 recent assessment',
      failedAssessments: 1,
      gpaDrop: 0.4,
      sem5Sgpa: 7.40,
      sem4Sgpa: 7.80,
    },
  }

  // Clear existing progress and risk profiles so clean records are created
  await prisma.subjectProgress.deleteMany()
  await prisma.topicProgress.deleteMany()
  await prisma.academicRisk.deleteMany()
  await prisma.semesterResult.deleteMany()
  await prisma.studentAttempt.deleteMany()

  // Diverse normal attendance and mastery seeds
  const normalAttendanceSeed = [96, 94, 92, 91, 89, 88, 87, 85, 84, 83, 82, 80, 79, 78, 95, 93, 90, 86, 84, 82]
  const normalMasterySeed = [94, 91, 88, 85, 83, 80, 78, 76, 74, 72, 92, 89, 86, 82, 79, 75, 71, 95, 90, 87]

  for (let i = 0; i < students.length; i++) {
    const s = students[i]
    const atRisk = atRiskMap[s.rollNo]

    let attPct: number
    let subMastery: number
    let riskLvl: string
    let riskScr: number
    let reason: string
    let failedCount: number
    let sem5: number
    let sem4: number

    if (atRisk) {
      attPct = atRisk.attendance
      subMastery = atRisk.subjectMastery
      riskLvl = atRisk.riskLevel
      riskScr = atRisk.riskScore
      reason = atRisk.primaryReason
      failedCount = atRisk.failedAssessments
      sem5 = atRisk.sem5Sgpa
      sem4 = atRisk.sem4Sgpa
    } else {
      attPct = normalAttendanceSeed[i % normalAttendanceSeed.length]
      subMastery = normalMasterySeed[i % normalMasterySeed.length]
      riskLvl = 'LOW'
      riskScr = Math.floor((100 - attPct) / 3)
      reason = 'Academic performance within acceptable parameters.'
      failedCount = 0
      sem5 = Number((7.8 + ((i % 15) * 0.1)).toFixed(2))
      sem4 = Number((sem5 - 0.2 + ((i % 5) * 0.1)).toFixed(2))
    }

    // 1. Update Student Table
    await prisma.student.update({
      where: { id: s.id },
      data: {
        attendancePercentage: attPct,
        riskLevel: riskLvl,
        riskScore: riskScr,
        currentCgpa: sem5,
      },
    })

    // 2. Insert Semester Results for GPA drop detection
    await prisma.semesterResult.create({
      data: {
        studentId: s.id,
        semester: 5,
        academicYear: '2025-2026',
        sgpa: sem5,
        cgpa: sem5,
      },
    })
    await prisma.semesterResult.create({
      data: {
        studentId: s.id,
        semester: 4,
        academicYear: '2024-2025',
        sgpa: sem4,
        cgpa: sem4,
      },
    })

    // 3. Insert Assessment Attempts
    if (assessments.length > 0) {
      if (failedCount >= 2) {
        await prisma.studentAttempt.create({
          data: {
            studentId: s.id,
            assessmentId: assessments[0].id,
            status: 'EVALUATED',
            score: 2.5,
            totalMarks: 10,
            percentage: 25.0,
            feedback: 'Struggling with fundamentals. Immediate remediation recommended.',
          },
        })
        if (assessments.length > 1) {
          await prisma.studentAttempt.create({
            data: {
              studentId: s.id,
              assessmentId: assessments[1].id,
              status: 'EVALUATED',
              score: 3.0,
              totalMarks: 10,
              percentage: 30.0,
              feedback: 'Critical gaps in core constructs.',
            },
          })
        }
      } else if (failedCount === 1) {
        await prisma.studentAttempt.create({
          data: {
            studentId: s.id,
            assessmentId: assessments[0].id,
            status: 'EVALUATED',
            score: 3.5,
            totalMarks: 10,
            percentage: 35.0,
            feedback: 'Below passing cutoff.',
          },
        })
        if (assessments.length > 1) {
          await prisma.studentAttempt.create({
            data: {
              studentId: s.id,
              assessmentId: assessments[1].id,
              status: 'EVALUATED',
              score: 6.0,
              totalMarks: 10,
              percentage: 60.0,
            },
          })
        }
      } else {
        // Normal students pass well
        const goodScore = Number((7.0 + ((i % 6) * 0.5)).toFixed(1))
        await prisma.studentAttempt.create({
          data: {
            studentId: s.id,
            assessmentId: assessments[0].id,
            status: 'EVALUATED',
            score: goodScore,
            totalMarks: 10,
            percentage: goodScore * 10,
            feedback: 'Good comprehension of concepts.',
          },
        })
      }
    }

    // 4. Insert SubjectProgress for primary subjects
    for (const sub of subjects) {
      const variation = ((i + sub.name.length) % 7) - 3
      const subScore = Math.min(98, Math.max(18, subMastery + variation))
      let status = 'LEARNING'
      if (subScore >= 85) status = 'MASTERED'
      else if (subScore >= 70) status = 'PRACTICING'
      else if (subScore < 45) status = 'NEEDS_IMPROVEMENT'

      await prisma.subjectProgress.create({
        data: {
          studentId: s.id,
          subjectId: sub.id,
          overallMastery: subScore,
          status,
        },
      })
    }

    // 5. Insert TopicProgress across curricular topics
    for (let tIdx = 0; tIdx < topics.length; tIdx++) {
      const top = topics[tIdx]
      let topicScore: number
      let topicStatus: string

      if (atRisk) {
        const delta = ((tIdx * 4) % 15) - 7
        topicScore = Math.min(48, Math.max(14, atRisk.topicBase + delta))
        topicStatus = topicScore >= 40 ? 'LEARNING' : 'NEEDS_IMPROVEMENT'
      } else {
        const delta = ((tIdx * 5 + i * 3) % 21) - 10
        topicScore = Math.min(98, Math.max(55, subMastery + delta))
        if (topicScore >= 85) topicStatus = 'MASTERED'
        else if (topicScore >= 72) topicStatus = 'PRACTICING'
        else topicStatus = 'LEARNING'
      }

      await prisma.topicProgress.create({
        data: {
          studentId: s.id,
          topicId: top.id,
          masteryScore: topicScore,
          status: topicStatus,
          quizzesAttempted: atRisk ? 1 : 3,
          accuracyRate: topicScore / 100,
        },
      })
    }

    // 6. Insert AcademicRisk profile
    await prisma.academicRisk.create({
      data: {
        studentId: s.id,
        riskLevel: riskLvl,
        riskScore: riskScr,
        lowAttendanceAlert: attPct < 75,
        failedAssessmentsAlert: failedCount > 0,
        scoreDropAlert: sem4 - sem5 >= 0.8,
        primaryReason: reason,
      },
    })
  }

  console.log('✅ Successfully populated diverse attendance, subject & topic mastery, and Academic Risk profiles for all 40 students!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
