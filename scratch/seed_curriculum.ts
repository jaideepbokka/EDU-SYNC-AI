import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CURRICULUM_DATA = [
  {
    code: 'DWDM',
    name: 'DWDM — Data Warehousing and Data Mining',
    credits: 4,
    semester: 6,
    facultyEmployeeId: 'FAC101', // Dr. Anil Kumar Reddy
    description:
      'Covers data warehouse modeling, ETL architectures, data mining tasks, association rules, decision trees, and clustering.',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Data Warehousing',
        description: 'Introduction to data warehouses, multi-dimensional schemas, architectures, and ETL pipelines.',
        topics: [
          'Introduction to Data Warehousing',
          'Data Warehouse Architecture',
          'ETL and Data Preprocessing',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Data Mining',
        description: 'Core concepts, Apriori association rule mining, classification, and statistical prediction.',
        topics: [
          'Data Mining Concepts and Tasks',
          'Association Rule Mining',
          'Classification and Prediction',
        ],
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Advanced Data Mining',
        description: 'Unsupervised clustering techniques, decision tree induction (ID3), and enterprise applications.',
        topics: [
          'Clustering Techniques',
          'Decision Trees and ID3',
          'Data Mining Applications',
        ],
      },
    ],
  },
  {
    code: 'PYTHON',
    name: 'Python Programming',
    credits: 4,
    semester: 6,
    facultyEmployeeId: 'FAC102', // Mrs. Priya Sharma
    description:
      'Comprehensive programming in Python covering syntax, core data structures, OOP paradigms, and standard library modules.',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Python Fundamentals',
        description: 'Variables, data types, arithmetic/logical operators, control flow statements, and iterations.',
        topics: [
          'Introduction to Python',
          'Variables, Data Types and Operators',
          'Conditional Statements and Loops',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Python Data Structures',
        description: 'Built-in compound data types, dictionary hash maps, sets, string manipulation, and functional blocks.',
        topics: [
          'Lists and Tuples',
          'Dictionaries and Sets',
          'Strings and Functions',
        ],
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Advanced Python',
        description: 'Classes and inheritance, polymorphs, custom exception handling, filesystem I/O, and modules.',
        topics: [
          'Object-Oriented Programming',
          'Exception Handling',
          'File Handling and Modules',
        ],
      },
    ],
  },
  {
    code: 'QC',
    name: 'Quantum Computing',
    credits: 3,
    semester: 6,
    facultyEmployeeId: 'FAC103', // Mr. Ravi Teja
    description:
      'Quantum state mechanics, superposition, entanglement, quantum logic gates, circuits, and quantum algorithms.',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Quantum Fundamentals',
        description: 'Quantum bits (qubits), state vectors, superposition, and measurement operators in Hilbert spaces.',
        topics: [
          'Introduction to Quantum Computing',
          'Qubits and Superposition',
          'Quantum Measurement',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Quantum Gates and Circuits',
        description: 'Pauli, Hadamard, Phase, and CNOT gates, circuit synthesis, Bell states, and quantum teleportation.',
        topics: [
          'Quantum Gates',
          'Quantum Circuits',
          'Entanglement and Quantum Teleportation',
        ],
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Quantum Algorithms',
        description: 'Quantum speedups, Deutsch-Jozsa oracle, Grover search algorithm, and Shor polynomial period finding.',
        topics: [
          "Deutsch-Jozsa Algorithm",
          "Grover's Search Algorithm",
          "Shor's Algorithm",
        ],
      },
    ],
  },
  {
    code: 'MATH',
    name: 'Mathematics',
    credits: 4,
    semester: 6,
    facultyEmployeeId: 'FAC104', // Mrs. Sneha Rao
    description:
      'Differential calculus, integral methods and geometric applications, probability density models, and descriptive statistics.',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Differential Calculus',
        description: 'Limits, continuity, mean value theorems, higher derivatives, optimization, and curvature applications.',
        topics: [
          'Limits and Continuity',
          'Differentiation',
          'Applications of Derivatives',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Integral Calculus',
        description: 'Integration techniques, substitution, partial fractions, definite integrals, areas, and volumes.',
        topics: [
          'Indefinite Integrals',
          'Definite Integrals',
          'Applications of Integration',
        ],
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Probability and Statistics',
        description: 'Axiomatic probability, Bayes theorem, discrete & continuous distributions, variance, and sample statistics.',
        topics: [
          'Probability Basics',
          'Probability Distributions',
          'Mean, Variance and Standard Deviation',
        ],
      },
    ],
  },
  {
    code: 'ENG',
    name: 'English',
    credits: 3,
    semester: 6,
    facultyEmployeeId: 'FAC105', // Dr. Kiran Babu
    description:
      'Professional communications, technical writing, grammar precision, public presentations, and corporate readiness.',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Communication Skills',
        description: 'Communication barriers, active listening, voice modulation, verbal and non-verbal body language.',
        topics: [
          'Fundamentals of Communication',
          'Verbal and Non-Verbal Communication',
          'Listening and Speaking Skills',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Grammar and Writing',
        description: 'Syntactic mechanics, tenses, common grammatical pitfalls, sentence structuring, and structured essays.',
        topics: [
          'Parts of Speech and Tenses',
          'Sentence Structure and Error Correction',
          'Paragraph and Essay Writing',
        ],
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Professional English',
        description: 'Resume crafting, cover letters, group discussion dynamics, persuasive presentation, and interview mastery.',
        topics: [
          'Resume and Cover Letter Writing',
          'Group Discussions and Presentations',
          'Interview Skills',
        ],
      },
    ],
  },
]

// Timetable Matrix (Monday to Friday, 5 lecture slots per day)
// Slot times:
// 1: 09:00 - 10:00
// 2: 10:00 - 11:00
// (11:00 - 11:15 Short Break)
// 3: 11:15 - 12:15
// (12:15 - 01:15 Lunch)
// 4: 01:15 - 02:15
// 5: 02:15 - 03:15
const TIME_SLOTS = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:15', endTime: '12:15' },
  { startTime: '01:15', endTime: '02:15' },
  { startTime: '02:15', endTime: '03:15' },
]

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

// Schedule mapping: Subject codes for Section A and Section B per day & slot
// Ensuring NO faculty teaches Sec A and Sec B at the same time!
const SCHEDULE_MATRIX: Record<
  string,
  { slotIndex: number; secASubject: string; secBSubject: string }[]
> = {
  MONDAY: [
    { slotIndex: 0, secASubject: 'DWDM', secBSubject: 'PYTHON' },
    { slotIndex: 1, secASubject: 'PYTHON', secBSubject: 'QC' },
    { slotIndex: 2, secASubject: 'QC', secBSubject: 'MATH' },
    { slotIndex: 3, secASubject: 'MATH', secBSubject: 'ENG' },
    { slotIndex: 4, secASubject: 'ENG', secBSubject: 'DWDM' },
  ],
  TUESDAY: [
    { slotIndex: 0, secASubject: 'PYTHON', secBSubject: 'QC' },
    { slotIndex: 1, secASubject: 'QC', secBSubject: 'MATH' },
    { slotIndex: 2, secASubject: 'MATH', secBSubject: 'ENG' },
    { slotIndex: 3, secASubject: 'ENG', secBSubject: 'DWDM' },
    { slotIndex: 4, secASubject: 'DWDM', secBSubject: 'PYTHON' },
  ],
  WEDNESDAY: [
    { slotIndex: 0, secASubject: 'QC', secBSubject: 'MATH' },
    { slotIndex: 1, secASubject: 'MATH', secBSubject: 'ENG' },
    { slotIndex: 2, secASubject: 'DWDM', secBSubject: 'PYTHON' },
    { slotIndex: 3, secASubject: 'PYTHON', secBSubject: 'QC' },
    { slotIndex: 4, secASubject: 'ENG', secBSubject: 'DWDM' },
  ],
  THURSDAY: [
    { slotIndex: 0, secASubject: 'MATH', secBSubject: 'ENG' },
    { slotIndex: 1, secASubject: 'ENG', secBSubject: 'DWDM' },
    { slotIndex: 2, secASubject: 'PYTHON', secBSubject: 'QC' },
    { slotIndex: 3, secASubject: 'DWDM', secBSubject: 'PYTHON' },
    { slotIndex: 4, secASubject: 'QC', secBSubject: 'MATH' },
  ],
  FRIDAY: [
    { slotIndex: 0, secASubject: 'ENG', secBSubject: 'DWDM' },
    { slotIndex: 1, secASubject: 'DWDM', secBSubject: 'PYTHON' },
    { slotIndex: 2, secASubject: 'QC', secBSubject: 'MATH' },
    { slotIndex: 3, secASubject: 'MATH', secBSubject: 'ENG' },
    { slotIndex: 4, secASubject: 'PYTHON', secBSubject: 'QC' },
  ],
}

async function seedCurriculum() {
  console.log('🚀 Starting Curriculum Migration & Timetable Generation...')

  // Find Department
  const dept = await prisma.department.findFirst()
  if (!dept) {
    throw new Error('Department not found. Please run base seed first.')
  }

  // Load all faculty members
  const allFaculty = await prisma.faculty.findMany({
    include: { user: true },
  })
  console.log(`👨‍🏫 Found ${allFaculty.length} faculty members:`)
  const facultyByEmpId: Record<string, any> = {}
  for (const f of allFaculty) {
    facultyByEmpId[f.employeeId] = f
    console.log(`  - ${f.employeeId}: ${f.user.name} (${f.designation})`)
  }

  // Check required faculty
  for (const item of CURRICULUM_DATA) {
    if (!facultyByEmpId[item.facultyEmployeeId]) {
      throw new Error(`Faculty with employeeId ${item.facultyEmployeeId} not found in database!`)
    }
  }

  // Load students by section
  const secAStudents = await prisma.student.findMany({ where: { section: 'A' } })
  const secBStudents = await prisma.student.findMany({ where: { section: 'B' } })
  console.log(`👨‍🎓 Students: Section A = ${secAStudents.length}, Section B = ${secBStudents.length}`)

  // 1. Purge existing academic courses, subjects, units, topics, timetable, and sessions
  console.log('🧹 Purging all previous subjects, offerings, units, topics, and timetables...')
  await prisma.timetable.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.attendanceSession.deleteMany()
  await prisma.studentEnrollment.deleteMany()
  await prisma.studentAnswer.deleteMany()
  await prisma.studentAttempt.deleteMany()
  await prisma.assessmentQuestion.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.learningResource.deleteMany()
  await prisma.topicProgress.deleteMany()
  await prisma.subjectProgress.deleteMany()
  await prisma.learningPathStep.deleteMany()
  await prisma.learningPath.deleteMany()
  await prisma.learningObjective.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.courseOffering.deleteMany()
  await prisma.subject.deleteMany()

  console.log('✅ Previous subjects successfully removed.')

  // 2. Create the 5 subjects with Units and Topics
  const createdSubjects: Record<string, any> = {}
  const createdOfferings: Record<string, { secA: any; secB: any }> = {}
  const allCreatedTopics: any[] = []

  for (const subData of CURRICULUM_DATA) {
    const assignedFaculty = facultyByEmpId[subData.facultyEmployeeId]
    console.log(`\n📚 Creating Subject: [${subData.code}] ${subData.name}`)
    console.log(`   Assigned Faculty: ${assignedFaculty.user.name} (${assignedFaculty.employeeId})`)

    const subject = await prisma.subject.create({
      data: {
        code: subData.code,
        name: subData.name,
        credits: subData.credits,
        semester: subData.semester,
        description: subData.description,
        departmentId: dept.id,
      },
    })
    createdSubjects[subData.code] = subject

    // Create Units & Topics
    for (const uData of subData.units) {
      const unit = await prisma.unit.create({
        data: {
          subjectId: subject.id,
          unitNumber: uData.unitNumber,
          title: uData.title,
          description: uData.description,
        },
      })
      console.log(`   ├── ${uData.title}`)

      for (let tIdx = 0; tIdx < uData.topics.length; tIdx++) {
        const topicTitle = uData.topics[tIdx]
        const topic = await prisma.topic.create({
          data: {
            unitId: unit.id,
            topicNumber: tIdx + 1,
            title: topicTitle,
            difficulty: tIdx === 2 ? 'HARD' : tIdx === 1 ? 'MEDIUM' : 'EASY',
            estimatedHours: 3.5,
          },
        })
        allCreatedTopics.push(topic)
        console.log(`   │    ├── ${tIdx + 1}. ${topicTitle}`)

        // Create learning objective for topic
        await prisma.learningObjective.create({
          data: {
            topicId: topic.id,
            code: `LO-${subData.code}-${uData.unitNumber}.${tIdx + 1}`,
            description: `Understand and apply core concepts of ${topicTitle}.`,
            bloomLevel: tIdx === 2 ? 'ANALYZE' : tIdx === 1 ? 'APPLY' : 'UNDERSTAND',
          },
        })
      }
    }

    // 3. Create CourseOfferings for Section A and Section B assigned to this Faculty
    const offeringA = await prisma.courseOffering.create({
      data: {
        subjectId: subject.id,
        facultyId: assignedFaculty.id,
        academicYear: '2025-2026',
        semester: subData.semester,
        section: 'A',
      },
    })

    const offeringB = await prisma.courseOffering.create({
      data: {
        subjectId: subject.id,
        facultyId: assignedFaculty.id,
        academicYear: '2025-2026',
        semester: subData.semester,
        section: 'B',
      },
    })

    createdOfferings[subData.code] = { secA: offeringA, secB: offeringB }

    // Enroll Section A students
    for (const student of secAStudents) {
      await prisma.studentEnrollment.create({
        data: {
          studentId: student.id,
          courseOfferingId: offeringA.id,
        },
      })
    }

    // Enroll Section B students
    for (const student of secBStudents) {
      await prisma.studentEnrollment.create({
        data: {
          studentId: student.id,
          courseOfferingId: offeringB.id,
        },
      })
    }

    console.log(`   ✓ Course Offerings created for Section A & B with ${secAStudents.length + secBStudents.length} students enrolled.`)
  }

  // 4. Generate Weekly Timetable
  console.log('\n🗓️ Generating Weekly Timetable Across Respective Columns...')
  let timetableCount = 0

  for (const day of DAYS_OF_WEEK) {
    const daySchedule = SCHEDULE_MATRIX[day]
    for (const entry of daySchedule) {
      const slot = TIME_SLOTS[entry.slotIndex]
      const offA = createdOfferings[entry.secASubject].secA
      const offB = createdOfferings[entry.secBSubject].secB

      // Section A Slot in LH-101
      await prisma.timetable.create({
        data: {
          courseOfferingId: offA.id,
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNumber: 'LH-101',
        },
      })

      // Section B Slot in LH-102
      await prisma.timetable.create({
        data: {
          courseOfferingId: offB.id,
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNumber: 'LH-102',
        },
      })

      timetableCount += 2
    }
  }

  console.log(`✅ ${timetableCount} Timetable entries successfully generated across Monday–Friday.`)

  // 5. Create Live Active Attendance Session for DWDM (Section A) with Dr. Anil Kumar Reddy
  console.log('\n📡 Creating Live Active Attendance Session for Section A (DWDM)...')
  const dwdmOfferingA = createdOfferings['DWDM'].secA
  const primaryFaculty = facultyByEmpId['FAC101']

  const activeSession = await prisma.attendanceSession.create({
    data: {
      courseOfferingId: dwdmOfferingA.id,
      facultyId: primaryFaculty.id,
      topicCovered: 'Introduction to Data Warehousing & Architecture Review',
      status: 'ACTIVE',
      roomLatitude: 12.9716,
      roomLongitude: 77.5946,
      geofenceRadiusMeters: 500,
    },
  })
  console.log(`✅ Active Attendance Session ready: ${activeSession.id}`)

  // 6. Create sample video masterclasses and assessments for rich UI presentation
  console.log('\n🎥 Seeding Educational Video Masterclasses & Quizzes...')
  const sampleVideos = [
    {
      title: 'Data Warehouse Architecture & Multi-Tier Schemas Masterclass',
      url: 'https://www.youtube.com/watch?v=CHYPFX_vI04',
      topicCode: 'DWDM',
      durationMinutes: 45,
      content: 'Deep dive into Kimball vs Inmon architectures, star schemas, snowflake schemas, and data marts.',
    },
    {
      title: 'Python Object-Oriented Programming & Dunder Methods',
      url: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
      topicCode: 'PYTHON',
      durationMinutes: 52,
      content: 'Classes, inheritance, polymorphism, encapsulation, and magic methods in Python 3.12.',
    },
    {
      title: 'Qubits, Superposition & Bloch Sphere Intuition',
      url: 'https://www.youtube.com/watch?v=QuR969uMICM',
      topicCode: 'QC',
      durationMinutes: 38,
      content: 'Visualizing quantum states on the Bloch sphere, Hadamard transformations, and measurement collapse.',
    },
    {
      title: 'Differential Calculus: Limits, Derivatives & Real-World Rates',
      url: 'https://www.youtube.com/watch?v=9vKqVkMQHKk',
      topicCode: 'MATH',
      durationMinutes: 40,
      content: 'Limit theorems, chain rule derivations, and practical optimization problem walkthroughs.',
    },
    {
      title: 'Mastering Professional Communication & Group Discussions',
      url: 'https://www.youtube.com/watch?v=7TgywMv_qHw',
      topicCode: 'ENG',
      durationMinutes: 30,
      content: 'Key body language signals, articulation clarity, active listening, and GD leadership techniques.',
    },
  ]

  for (const vid of sampleVideos) {
    // Find topic from subject
    const subject = createdSubjects[vid.topicCode]
    const unit = await prisma.unit.findFirst({ where: { subjectId: subject.id } })
    if (unit) {
      const topic = await prisma.topic.findFirst({ where: { unitId: unit.id } })
      if (topic) {
        await prisma.learningResource.create({
          data: {
            topicId: topic.id,
            title: vid.title,
            type: 'VIDEO',
            url: vid.url,
            content: vid.content,
            durationMinutes: vid.durationMinutes,
            author: facultyByEmpId[CURRICULUM_DATA.find((c) => c.code === vid.topicCode)!.facultyEmployeeId].user.name,
          },
        })
      }
    }
  }

  // Create sample published assessments
  const sampleQuizzes = [
    {
      subjectCode: 'DWDM',
      title: 'DWDM Quiz 1: Warehouse Concepts & ETL Pipelines',
      durationMinutes: 30,
      totalMarks: 25,
    },
    {
      subjectCode: 'PYTHON',
      title: 'Python Diagnostic Assessment: OOP & Data Structures',
      durationMinutes: 45,
      totalMarks: 50,
    },
    {
      subjectCode: 'QC',
      title: 'Quantum Foundations: Qubits & Gates Evaluation',
      durationMinutes: 30,
      totalMarks: 30,
    },
  ]

  for (const q of sampleQuizzes) {
    const subject = createdSubjects[q.subjectCode]
    const faculty = facultyByEmpId[CURRICULUM_DATA.find((c) => c.code === q.subjectCode)!.facultyEmployeeId]
    await prisma.assessment.create({
      data: {
        subjectId: subject.id,
        facultyId: faculty.id,
        title: q.title,
        description: `Comprehensive evaluation covering unit topics for ${subject.name}.`,
        type: 'QUIZ',
        status: 'PUBLISHED',
        totalMarks: q.totalMarks,
        passMarks: Math.floor(q.totalMarks * 0.4),
        durationMinutes: q.durationMinutes,
      },
    })
  }

  console.log('\n🎉 Curriculum, Faculty Assignments & Timetable Seeding Completed Successfully!')
}

seedCurriculum()
  .catch((e) => {
    console.error('❌ Error during curriculum seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
