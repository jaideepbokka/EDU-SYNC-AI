import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const subjects = await prisma.subject.findMany({
    include: {
      units: {
        include: {
          topics: true,
        },
      },
      offerings: {
        include: {
          faculty: {
            include: { user: true },
          },
          timetables: true,
        },
      },
    },
  })

  const faculty = await prisma.faculty.findMany({
    include: {
      user: true,
    },
  })

  const timetables = await prisma.timetable.findMany({
    include: {
      courseOffering: {
        include: {
          subject: true,
          faculty: { include: { user: true } },
        },
      },
    },
  })

  console.log('SUBJECTS (' + subjects.length + '):')
  for (const s of subjects) {
    console.log(`- [${s.code}] ${s.name} (Units: ${s.units.length}, Offerings: ${s.offerings.length})`)
    for (const u of s.units) {
      console.log(`    Unit ${u.unitNumber}: ${u.title} (${u.topics.length} topics)`)
      for (const t of u.topics) {
        console.log(`      Topic ${t.topicNumber}: ${t.title}`)
      }
    }
  }

  console.log('\nFACULTY (' + faculty.length + '):')
  for (const f of faculty) {
    console.log(`- ${f.employeeId}: ${f.user.name} (${f.user.email}) - Designation: ${f.designation}`)
  }

  console.log('\nTIMETABLES (' + timetables.length + '):')
  for (const tt of timetables) {
    console.log(`- ${tt.dayOfWeek} ${tt.startTime}-${tt.endTime} (${tt.roomNumber}): ${tt.courseOffering.subject.code} (${tt.courseOffering.faculty.user.name}) Sec: ${tt.courseOffering.section}`)
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
