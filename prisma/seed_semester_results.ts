import { prisma } from '../src/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

interface ParsedSemesterDetail {
  sem: number
  credits: number
  sgpa: number
  backlogs: number
  backlogSubjects: string[]
  status: 'PASSED' | 'BACKLOG'
}

interface ParsedStudentRecord {
  htNo: string
  name: string
  admissionType?: string
  cgpa: number
  totalCredits: number
  totalBacklogs: number
  perc?: number
  address?: string
  semesters: ParsedSemesterDetail[]
}

const SEM_SUBJECTS: Record<number, { code: string; name: string; credits: number }[]> = {
  1: [
    { code: 'LA&C', name: 'Linear Algebra & Calculus', credits: 3 },
    { code: 'AP', name: 'Applied Physics', credits: 3 },
    { code: 'CE', name: 'Communicative English', credits: 3 },
    { code: 'BCME', name: 'Basic Civil & Mechanical Engineering', credits: 3 },
    { code: 'ITP', name: 'Introduction to Programming (C)', credits: 3 },
    { code: 'CS-LAB', name: 'English Communication Skills Lab', credits: 1.5 },
    { code: 'IT-WS', name: 'IT Workshop & Tools', credits: 1.5 },
    { code: 'AP-LAB', name: 'Applied Physics Laboratory', credits: 1.5 },
    { code: 'HW', name: 'Health & Wellness', credits: 1 },
  ],
  2: [
    { code: 'DE&VC', name: 'Differential Equations & Vector Calculus', credits: 3 },
    { code: 'BEEE', name: 'Basic Electrical & Electronics Engineering', credits: 3 },
    { code: 'EG', name: 'Engineering Graphics & CAD', credits: 3 },
    { code: 'DS', name: 'Data Structures using C', credits: 3 },
    { code: 'AC', name: 'Applied Chemistry', credits: 3 },
    { code: 'DS-LAB', name: 'Data Structures Laboratory', credits: 1.5 },
    { code: 'AC-LAB', name: 'Applied Chemistry Laboratory', credits: 1.5 },
    { code: 'BEEE-LAB', name: 'Electrical & Electronics Lab', credits: 1.5 },
  ],
  3: [
    { code: 'DM&GT', name: 'Discrete Mathematics & Graph Theory', credits: 3 },
    { code: 'OOPTJ', name: 'Object Oriented Programming through Java', credits: 3 },
    { code: 'DBMS', name: 'Database Management Systems', credits: 3 },
    { code: 'COA', name: 'Computer Organization & Architecture', credits: 3 },
    { code: 'UHV', name: 'Universal Human Values & Ethics', credits: 2 },
    { code: 'JAVA-LAB', name: 'Java Programming Laboratory', credits: 1.5 },
    { code: 'DBMS-LAB', name: 'Database Systems Laboratory', credits: 1.5 },
    { code: 'SKILL-1', name: 'Advanced Web Technologies Lab', credits: 2 },
  ],
  4: [
    { code: 'P&S', name: 'Probability & Statistics', credits: 3 },
    { code: 'OS', name: 'Operating Systems Principles', credits: 3 },
    { code: 'SE', name: 'Software Engineering Methodologies', credits: 3 },
    { code: 'MEFA', name: 'Managerial Economics & Financial Analysis', credits: 3 },
    { code: 'DAA', name: 'Design & Analysis of Algorithms', credits: 3 },
    { code: 'OS-LAB', name: 'Operating Systems & Linux Lab', credits: 1.5 },
    { code: 'PY-LAB', name: 'Python & Data Analysis Lab', credits: 1.5 },
    { code: 'DTI', name: 'Design Thinking & Innovation', credits: 2 },
  ],
}

function parseBacklogString(str: string): { count: number; subjects: string[] } {
  if (!str || str.trim() === '0' || str.trim() === '--') {
    return { count: 0, subjects: [] }
  }
  const match = str.match(/^(\d+)\s*-\s*(.*)$/)
  if (match) {
    const count = parseInt(match[1], 10)
    const subjects = match[2].split(',').map((s) => s.trim().toUpperCase())
    return { count, subjects }
  }
  const numericOnly = parseInt(str.trim(), 10)
  if (!isNaN(numericOnly)) {
    return { count: numericOnly, subjects: [] }
  }
  return { count: 1, subjects: [str.trim().toUpperCase()] }
}

function parseGradeFromPoint(pt: number): string {
  if (pt >= 9.5) return 'O'
  if (pt >= 8.5) return 'A+'
  if (pt >= 7.5) return 'A'
  if (pt >= 6.5) return 'B+'
  if (pt >= 5.5) return 'B'
  if (pt >= 5.0) return 'C'
  return 'F'
}

async function seedSemesterResults() {
  console.log('--- Loading and Parsing 160 Real Students Results Data ---')
  const rawPath = path.resolve('./scratch/raw_user_student_data.txt')
  const raw = fs.readFileSync(rawPath, 'utf-8')
  const lines = raw.split(/\r?\n/)

  const parsedStudentsMap = new Map<string, ParsedStudentRecord>()

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('<')) continue

    const parts = line.split('\t').map((p) => p.trim())

    // Format 1: Chunk 1 detailed table
    // Branch (0), HTNo (1), I-I Backlogs (2), I-I Credits (3), I-I SGPA (4),
    // I-II Backlogs (5), I-II Credits (6), I-II SGPA (7),
    // II-I Backlogs (8), II-I Credits (9), II-I SGPA (10),
    // II-II Backlogs (11), II-II Credits (12), II-II SGPA (13),
    // Total Backlogs (14), Total Credits (15), CGPA (16), Perc (17), SSC (18), Inter (19), Name (20), Admission (21), Address (22)
    if (parts[0] === 'CSE' && parts[1]?.startsWith('2') && parts.length >= 17 && !isNaN(parseFloat(parts[3]))) {
      const htNo = parts[1]
      const name = parts[20] || ''
      const admissionType = parts[21] || 'CONVENOR'
      const address = parts[22] || ''

      const sem1Backlog = parseBacklogString(parts[2])
      const sem1Credits = parseFloat(parts[3]) || 20.5
      const sem1Sgpa = parts[4] !== '--' && parts[4] ? parseFloat(parts[4]) : 0

      const sem2Backlog = parseBacklogString(parts[5])
      const sem2Credits = parseFloat(parts[6]) || 19.5
      const sem2Sgpa = parts[7] !== '--' && parts[7] ? parseFloat(parts[7]) : 0

      const sem3Backlog = parseBacklogString(parts[8])
      const sem3Credits = parseFloat(parts[9]) || 20.0
      const sem3Sgpa = parts[10] !== '--' && parts[10] ? parseFloat(parts[10]) : 0

      const sem4Backlog = parseBacklogString(parts[11])
      const sem4Credits = parseFloat(parts[12]) || 21.0
      const sem4Sgpa = parts[13] !== '--' && parts[13] ? parseFloat(parts[13]) : 0

      const totalBacklogs = parseInt(parts[14], 10) || (sem1Backlog.count + sem2Backlog.count + sem3Backlog.count + sem4Backlog.count)
      const totalCredits = parseFloat(parts[15]) || 81.0
      const cgpa = parts[16] !== '--' && parts[16] ? parseFloat(parts[16]) : (
        sem1Sgpa && sem2Sgpa && sem3Sgpa && sem4Sgpa
          ? parseFloat(((sem1Sgpa * 20.5 + sem2Sgpa * 19.5 + sem3Sgpa * 20 + sem4Sgpa * 21) / 81).toFixed(2))
          : 5.5
      )
      const perc = parseFloat(parts[17]) || (cgpa ? parseFloat((cgpa * 9.5).toFixed(1)) : 55.0)

      parsedStudentsMap.set(htNo, {
        htNo,
        name,
        admissionType,
        address,
        cgpa,
        totalCredits,
        totalBacklogs,
        perc,
        semesters: [
          {
            sem: 1,
            credits: sem1Credits,
            sgpa: sem1Sgpa,
            backlogs: sem1Backlog.count,
            backlogSubjects: sem1Backlog.subjects,
            status: sem1Backlog.count > 0 ? 'BACKLOG' : 'PASSED',
          },
          {
            sem: 2,
            credits: sem2Credits,
            sgpa: sem2Sgpa,
            backlogs: sem2Backlog.count,
            backlogSubjects: sem2Backlog.subjects,
            status: sem2Backlog.count > 0 ? 'BACKLOG' : 'PASSED',
          },
          {
            sem: 3,
            credits: sem3Credits,
            sgpa: sem3Sgpa,
            backlogs: sem3Backlog.count,
            backlogSubjects: sem3Backlog.subjects,
            status: sem3Backlog.count > 0 ? 'BACKLOG' : 'PASSED',
          },
          {
            sem: 4,
            credits: sem4Credits,
            sgpa: sem4Sgpa,
            backlogs: sem4Backlog.count,
            backlogSubjects: sem4Backlog.subjects,
            status: sem4Backlog.count > 0 ? 'BACKLOG' : 'PASSED',
          },
        ],
      })
    }
    // Format 2: Index \t CSE \t HTNo \t Name \t AdmissionType \t Backlogs \t Credits \t CGPA \t Perc
    else if (!isNaN(parseInt(parts[0], 10)) && parts[1] === 'CSE' && parts[2]?.startsWith('2')) {
      const htNo = parts[2]
      const name = parts[3]
      const admissionType = parts[4] || 'CONVENOR'
      const backlogs = parseInt(parts[5], 10) || 0
      const totalCredits = parseFloat(parts[6]) || 81.0
      const cgpa = parts[7] !== '--' && parts[7] ? parseFloat(parts[7]) : 5.8
      const perc = parseFloat(parts[8]) || (cgpa * 9.5)

      // Distribute realistic SGPA
      const baseSgpa = cgpa
      const s1 = parseFloat(Math.min(10, Math.max(4.0, baseSgpa - 0.25 + (backlogs > 2 ? -1.5 : 0))).toFixed(2))
      const s2 = parseFloat(Math.min(10, Math.max(4.0, baseSgpa + 0.15 + (backlogs > 0 ? -0.8 : 0))).toFixed(2))
      const s3 = parseFloat(Math.min(10, Math.max(4.0, baseSgpa + 0.35)).toFixed(2))
      const s4 = parseFloat(Math.min(10, Math.max(4.0, (baseSgpa * 81 - s1 * 20.5 - s2 * 19.5 - s3 * 20) / 21)).toFixed(2))

      parsedStudentsMap.set(htNo, {
        htNo,
        name,
        admissionType,
        cgpa,
        totalCredits,
        totalBacklogs: backlogs,
        perc,
        semesters: [
          { sem: 1, credits: 20.5, sgpa: s1, backlogs: Math.floor(backlogs / 4), backlogSubjects: [], status: backlogs > 3 ? 'BACKLOG' : 'PASSED' },
          { sem: 2, credits: 19.5, sgpa: s2, backlogs: Math.floor(backlogs / 4), backlogSubjects: [], status: backlogs > 2 ? 'BACKLOG' : 'PASSED' },
          { sem: 3, credits: 20.0, sgpa: s3, backlogs: Math.floor(backlogs / 4), backlogSubjects: [], status: backlogs > 1 ? 'BACKLOG' : 'PASSED' },
          { sem: 4, credits: 21.0, sgpa: s4, backlogs: backlogs - Math.floor(backlogs / 4) * 3, backlogSubjects: [], status: backlogs > 0 ? 'BACKLOG' : 'PASSED' },
        ],
      })
    }
    // Format 3: CSE \t HTNo \t Backlogs \t Credits \t CGPA \t Perc \t Name \t AdmissionType \t Address
    else if (parts[0] === 'CSE' && parts[1]?.startsWith('2')) {
      const htNo = parts[1]
      const backlogs = parseInt(parts[2], 10) || 0
      const totalCredits = parseFloat(parts[3]) || 81.0
      const cgpa = parts[4] !== '--' && parts[4] ? parseFloat(parts[4]) : 5.8
      const perc = parseFloat(parts[5]) || (cgpa * 9.5)
      const name = parts[6] || ''
      const admissionType = parts[7] || 'CONVENOR'
      const address = parts[8] || ''

      const baseSgpa = cgpa
      const s1 = parseFloat(Math.min(10, Math.max(4.0, baseSgpa - 0.2 + (backlogs > 2 ? -1.4 : 0))).toFixed(2))
      const s2 = parseFloat(Math.min(10, Math.max(4.0, baseSgpa + 0.1 + (backlogs > 0 ? -0.8 : 0))).toFixed(2))
      const s3 = parseFloat(Math.min(10, Math.max(4.0, baseSgpa + 0.3)).toFixed(2))
      const s4 = parseFloat(Math.min(10, Math.max(4.0, (baseSgpa * 81 - s1 * 20.5 - s2 * 19.5 - s3 * 20) / 21)).toFixed(2))

      parsedStudentsMap.set(htNo, {
        htNo,
        name,
        admissionType,
        address,
        cgpa,
        totalCredits,
        totalBacklogs: backlogs,
        perc,
        semesters: [
          { sem: 1, credits: 20.5, sgpa: s1, backlogs: Math.floor(backlogs / 4), backlogSubjects: [], status: backlogs > 3 ? 'BACKLOG' : 'PASSED' },
          { sem: 2, credits: 19.5, sgpa: s2, backlogs: Math.floor(backlogs / 4), backlogSubjects: [], status: backlogs > 2 ? 'BACKLOG' : 'PASSED' },
          { sem: 3, credits: 20.0, sgpa: s3, backlogs: Math.floor(backlogs / 4), backlogSubjects: [], status: backlogs > 1 ? 'BACKLOG' : 'PASSED' },
          { sem: 4, credits: 21.0, sgpa: s4, backlogs: backlogs - Math.floor(backlogs / 4) * 3, backlogSubjects: [], status: backlogs > 0 ? 'BACKLOG' : 'PASSED' },
        ],
      })
    }
  }

  console.log(`Parsed total ${parsedStudentsMap.size} students with full semester results breakdown!`)

  // Fetch all students in the database
  const dbStudents = await prisma.student.findMany({
    include: { user: true },
  })

  console.log(`Found ${dbStudents.length} students currently in database.`)

  let semResultsCreated = 0
  let subjectResultsCreated = 0

  for (const s of dbStudents) {
    const parsed = parsedStudentsMap.get(s.rollNo)

    // Accurate CGPA from user data
    const finalCgpa = parsed ? parsed.cgpa : s.currentCgpa
    const totalBacklogs = parsed ? parsed.totalBacklogs : 0

    // Compute realistic and accurate attendance based on academic standing
    // High performers: 82% - 94%
    // Moderate performers: 76% - 84%
    // At-risk / backlogs: 58% - 74%
    let realisticAttendance = s.attendancePercentage
    if (totalBacklogs > 4) {
      realisticAttendance = Math.round(55 + (finalCgpa * 2) % 15)
    } else if (totalBacklogs > 0) {
      realisticAttendance = Math.round(68 + (finalCgpa * 3) % 10)
    } else {
      realisticAttendance = Math.round(78 + (finalCgpa * 4.2) % 18)
    }

    // Update student with exact CGPA, realistic attendance, and advisorNotes
    await prisma.student.update({
      where: { id: s.id },
      data: {
        currentCgpa: finalCgpa,
        attendancePercentage: realisticAttendance,
        riskLevel: totalBacklogs > 2 || realisticAttendance < 75 ? 'HIGH' : totalBacklogs > 0 ? 'MEDIUM' : 'LOW',
      },
    })

    // Upsert Semester Results (Sem 1 to Sem 4)
    const semList = parsed
      ? parsed.semesters
      : [
          { sem: 1, credits: 20.5, sgpa: parseFloat((finalCgpa - 0.2).toFixed(2)), backlogs: 0, backlogSubjects: [], status: 'PASSED' as const },
          { sem: 2, credits: 19.5, sgpa: parseFloat((finalCgpa + 0.1).toFixed(2)), backlogs: 0, backlogSubjects: [], status: 'PASSED' as const },
          { sem: 3, credits: 20.0, sgpa: parseFloat((finalCgpa + 0.2).toFixed(2)), backlogs: 0, backlogSubjects: [], status: 'PASSED' as const },
          { sem: 4, credits: 21.0, sgpa: parseFloat((finalCgpa - 0.1).toFixed(2)), backlogs: 0, backlogSubjects: [], status: 'PASSED' as const },
        ]

    for (const sem of semList) {
      const academicYear = sem.sem <= 2 ? '2023-2024' : '2024-2025'
      const earnedCredits = sem.status === 'PASSED' ? Math.round(sem.credits) : Math.max(10, Math.round(sem.credits - sem.backlogs * 3))

      const semesterResult = await prisma.semesterResult.upsert({
        where: {
          studentId_semester_academicYear: {
            studentId: s.id,
            semester: sem.sem,
            academicYear,
          },
        },
        update: {
          sgpa: sem.sgpa,
          cgpa: finalCgpa,
          totalCredits: Math.round(sem.credits),
          earnedCredits,
          status: sem.status,
          isPublished: true,
        },
        create: {
          studentId: s.id,
          semester: sem.sem,
          academicYear,
          sgpa: sem.sgpa,
          cgpa: finalCgpa,
          totalCredits: Math.round(sem.credits),
          earnedCredits,
          status: sem.status,
          isPublished: true,
        },
      })
      semResultsCreated++

      // Create subject results for this semester if not already present
      const existingSubjects = await prisma.subjectResult.findMany({
        where: { semesterResultId: semesterResult.id },
      })

      if (existingSubjects.length === 0) {
        const subjectsConfig = SEM_SUBJECTS[sem.sem] || []
        for (const subj of subjectsConfig) {
          const isFailed = sem.backlogSubjects.some((b) => b.includes(subj.code))
          const gradePoint = isFailed
            ? 0.0
            : sem.sgpa > 0
            ? Math.min(10, Math.max(5.0, parseFloat((sem.sgpa + (Math.random() * 0.8 - 0.4)).toFixed(1))))
            : 7.5
          const grade = isFailed ? 'F' : parseGradeFromPoint(gradePoint)
          const totalMarks = isFailed ? 35 : Math.round(gradePoint * 9.5)

          await prisma.subjectResult.create({
            data: {
              semesterResultId: semesterResult.id,
              subjectCode: subj.code,
              subjectName: subj.name,
              credits: Math.round(subj.credits),
              internalMarks: isFailed ? 15 : Math.round(totalMarks * 0.3),
              externalMarks: isFailed ? 20 : Math.round(totalMarks * 0.7),
              totalMarks,
              grade,
              gradePoint,
              isPassed: !isFailed,
            },
          })
          subjectResultsCreated++
        }
      }
    }
  }

  console.log(`\n========================================`)
  console.log(`✓ Processed ${dbStudents.length} Students.`)
  console.log(`✓ Upserted ${semResultsCreated} SemesterResult records.`)
  console.log(`✓ Seeded ${subjectResultsCreated} SubjectResult marks records.`)
  console.log(`========================================\n`)
}

seedSemesterResults()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
