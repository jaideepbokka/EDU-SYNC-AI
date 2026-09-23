import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  const facUser = await prisma.user.findFirst({ where: { role: 'FACULTY' } })
  if (!facUser) {
    console.error('No faculty user found')
    return
  }

  console.log(`Testing with Faculty User: ${facUser.name} (${facUser.id})`)

  // 1. Test Timetable
  const res1 = await fetch('http://localhost:3000/faculty/timetable', {
    headers: { Cookie: `edusync_user_id=${facUser.id}` },
  })
  console.log('1. Timetable Status:', res1.status)
  const text1 = await res1.text()
  console.log('   - Contains "Weekly Columns View":', text1.includes('Weekly Columns View'))
  console.log('   - Contains "DWDM":', text1.includes('DWDM'))
  console.log('   - Contains "Dr. Anil Kumar Reddy":', text1.includes('Dr. Anil Kumar Reddy'))
  console.log('   - Contains "MONDAY":', text1.includes('MONDAY'))
  console.log('   - Contains "FRIDAY":', text1.includes('FRIDAY'))
  console.log('   - Contains "LH-101":', text1.includes('LH-101'))
  console.log('   - Contains "LH-102":', text1.includes('LH-102'))

  // 2. Test Subjects
  const res2 = await fetch('http://localhost:3000/faculty/subjects', {
    headers: { Cookie: `edusync_user_id=${facUser.id}` },
  })
  console.log('2. Subjects Status:', res2.status)
  const text2 = await res2.text()
  console.log('   - Contains "DWDM":', text2.includes('DWDM'))
  console.log('   - Contains "Python Programming":', text2.includes('Python Programming'))
  console.log('   - Contains "Quantum Computing":', text2.includes('Quantum Computing'))
  console.log('   - Contains "Mathematics":', text2.includes('Mathematics'))
  console.log('   - Contains "English":', text2.includes('English'))
  console.log('   - Contains "Assigned Faculty":', text2.includes('Assigned Faculty'))

  // 3. Test Syllabus
  const res3 = await fetch('http://localhost:3000/faculty/syllabus', {
    headers: { Cookie: `edusync_user_id=${facUser.id}` },
  })
  console.log('3. Syllabus Status:', res3.status)
  const text3 = await res3.text()
  console.log('   - Contains "Unit 1: Data Warehousing":', text3.includes('Data Warehousing'))
  console.log('   - Contains "Introduction to Data Warehousing":', text3.includes('Introduction to Data Warehousing'))
  console.log('   - Contains "Data Warehouse Architecture":', text3.includes('Data Warehouse Architecture'))
  console.log('   - Contains "ETL and Data Preprocessing":', text3.includes('ETL and Data Preprocessing'))
  console.log('   - Contains "Unit 2: Data Mining":', text3.includes('Data Mining'))
  console.log('   - Contains "Unit 3: Advanced Data Mining":', text3.includes('Advanced Data Mining'))
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
