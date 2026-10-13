import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanLegacyStudents() {
  console.log('--- Scanning Database for Students ---')
  const allStudents = await prisma.student.findMany({
    include: {
      user: true,
    },
  })

  console.log(`Found ${allStudents.length} total students in database.`)

  // The 160 real students have roll numbers starting with '23' or '24' (specifically 23221A... or 24221A...)
  const legacyStudents = allStudents.filter(
    (s) => !s.rollNo.startsWith('23221') && !s.rollNo.startsWith('24221')
  )

  console.log(`Identified ${legacyStudents.length} legacy/dummy students to purge:`)
  legacyStudents.forEach((s) => {
    console.log(`  - [${s.rollNo}] ${s.user.name} (${s.user.email}) [Section ${s.section}]`)
  })

  if (legacyStudents.length === 0) {
    console.log('No legacy students found. Database is clean!')
    return
  }

  const legacyStudentIds = legacyStudents.map((s) => s.id)
  const legacyUserIds = legacyStudents.map((s) => s.userId)

  console.log('\nCleaning child records for legacy students...')

  // Delete all dependent child records
  await prisma.attendanceRecord.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.studentEnrollment.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.studentFee.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.academicRisk.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.facultyIntervention.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.faceTemplate.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.verificationAttempt.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.verificationToken.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.studentAttempt.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.semesterResult.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.subjectProgress.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.topicProgress.deleteMany({ where: { studentId: { in: legacyStudentIds } } })
  await prisma.learningPath.deleteMany({ where: { studentId: { in: legacyStudentIds } } })

  // Delete students
  const deletedStudents = await prisma.student.deleteMany({
    where: { id: { in: legacyStudentIds } },
  })
  console.log(`✓ Deleted ${deletedStudents.count} legacy Student records.`)

  // Delete associated users
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: legacyUserIds } },
  })
  console.log(`✓ Deleted ${deletedUsers.count} legacy User accounts.`)

  // Check new counts
  const remainingTotal = await prisma.student.count()
  const secA = await prisma.student.count({ where: { section: 'A' } })
  const secB = await prisma.student.count({ where: { section: 'B' } })
  const secC = await prisma.student.count({ where: { section: 'C' } })

  console.log('\n--- Final Student Count Summary ---')
  console.log(`Total active students: ${remainingTotal}`)
  console.log(`Section A: ${secA}`)
  console.log(`Section B: ${secB}`)
  console.log(`Section C: ${secC}`)
}

cleanLegacyStudents()
  .catch((e) => {
    console.error('Error cleaning legacy students:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
