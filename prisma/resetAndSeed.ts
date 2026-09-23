import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const FACULTY_DATA = [
  {
    employeeId: 'FAC101',
    name: 'Dr. Anil Kumar Reddy',
    email: 'FAC101EDUSYNC@gmail.com',
    phone: '9876543210',
    designation: 'Senior Professor & Department Chair',
  },
  {
    employeeId: 'FAC102',
    name: 'Mrs. Priya Sharma',
    email: 'FAC102EDUSYNC@gmail.com',
    phone: '9123456780',
    designation: 'Associate Professor',
  },
  {
    employeeId: 'FAC103',
    name: 'Mr. Ravi Teja',
    email: 'FAC103EDUSYNC@gmail.com',
    phone: '9988776655',
    designation: 'Assistant Professor',
  },
  {
    employeeId: 'FAC104',
    name: 'Mrs. Sneha Rao',
    email: 'FAC104EDUSYNC@gmail.com',
    phone: '9012345678',
    designation: 'Assistant Professor',
  },
  {
    employeeId: 'FAC105',
    name: 'Dr. Kiran Babu',
    email: 'FAC105EDUSYNC@gmail.com',
    phone: '9345678120',
    designation: 'Professor',
  },
]

const STUDENTS_SECTION_A = [
  {
    name: 'Aarav Reddy',
    email: '26CSE101@edusync.edu',
    rollNo: '101',
    registerNo: 'CSE23A001',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Suresh Reddy',
    guardianPhone: '9876501001',
    faceId: '4837216',
  },
  {
    name: 'Aditya Kumar',
    email: '26CSE102@edusync.edu',
    rollNo: '102',
    registerNo: 'CSE23A002',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Rajesh Kumar',
    guardianPhone: '9876501002',
    faceId: '6159042',
  },
  {
    name: 'Akhil Varma',
    email: '26CSE103@edusync.edu',
    rollNo: '103',
    registerNo: 'CSE23A003',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Mahesh Varma',
    guardianPhone: '9876501003',
    faceId: '2974381',
  },
  {
    name: 'Ananya Rao',
    email: '26CSE104@edusync.edu',
    rollNo: '104',
    registerNo: 'CSE23A004',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Prakash Rao',
    guardianPhone: '9876501004',
    faceId: '7518264',
  },
  {
    name: 'Arjun Teja',
    email: '26CSE105@edusync.edu',
    rollNo: '105',
    registerNo: 'CSE23A005',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Srinivas Teja',
    guardianPhone: '9876501005',
    faceId: '3649157',
  },
  {
    name: 'Bhavya Sri',
    email: '26CSE106@edusync.edu',
    rollNo: '106',
    registerNo: 'CSE23A006',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Ramesh Kumar',
    guardianPhone: '9876501006',
    faceId: '8294713',
  },
  {
    name: 'Charan Reddy',
    email: '26CSE107@edusync.edu',
    rollNo: '107',
    registerNo: 'CSE23A007',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Venkat Reddy',
    guardianPhone: '9876501007',
    faceId: '5162839',
  },
  {
    name: 'Deepika Sharma',
    email: '26CSE108@edusync.edu',
    rollNo: '108',
    registerNo: 'CSE23A008',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Ashok Sharma',
    guardianPhone: '9876501008',
    faceId: '7436502',
  },
  {
    name: 'Dhanush Kumar',
    email: '26CSE109@edusync.edu',
    rollNo: '109',
    registerNo: 'CSE23A009',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Naresh Kumar',
    guardianPhone: '9876501009',
    faceId: '2817645',
  },
  {
    name: 'Divya Rani',
    email: '26CSE110@edusync.edu',
    rollNo: '110',
    registerNo: 'CSE23A010',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Raghav Rao',
    guardianPhone: '9876501010',
    faceId: '6943187',
  },
  {
    name: 'Harish Varma',
    email: '26CSE111@edusync.edu',
    rollNo: '111',
    registerNo: 'CSE23A011',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Krishna Varma',
    guardianPhone: '9876501011',
    faceId: '8352071',
  },
  {
    name: 'Ishita Reddy',
    email: '26CSE112@edusync.edu',
    rollNo: '112',
    registerNo: 'CSE23A012',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Mohan Reddy',
    guardianPhone: '9876501012',
    faceId: '4279516',
  },
  {
    name: 'Karthik Sai',
    email: '26CSE113@edusync.edu',
    rollNo: '113',
    registerNo: 'CSE23A013',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Ravi Kumar',
    guardianPhone: '9876501013',
    faceId: '7184630',
  },
  {
    name: 'Keerthana Rao',
    email: '26CSE114@edusync.edu',
    rollNo: '114',
    registerNo: 'CSE23A014',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Anand Rao',
    guardianPhone: '9876501014',
    faceId: '3528194',
  },
  {
    name: 'Lakshmi Priya',
    email: '26CSE115@edusync.edu',
    rollNo: '115',
    registerNo: 'CSE23A015',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Subramanyam',
    guardianPhone: '9876501015',
    faceId: '9061743',
  },
  {
    name: 'Manoj Kumar',
    email: '26CSE116@edusync.edu',
    rollNo: '116',
    registerNo: 'CSE23A016',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Gopal Kumar',
    guardianPhone: '9876501016',
    faceId: '5813267',
  },
  {
    name: 'Nikhil Reddy',
    email: '26CSE117@edusync.edu',
    rollNo: '117',
    registerNo: 'CSE23A017',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Ramakrishna',
    guardianPhone: '9876501017',
    faceId: '2468951',
  },
  {
    name: 'Pooja Sharma',
    email: '26CSE118@edusync.edu',
    rollNo: '118',
    registerNo: 'CSE23A018',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Vinod Sharma',
    guardianPhone: '9876501018',
    faceId: '6735148',
  },
  {
    name: 'Rahul Teja',
    email: '26CSE119@edusync.edu',
    rollNo: '119',
    registerNo: 'CSE23A019',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Satyanarayana',
    guardianPhone: '9876501019',
    faceId: '9146825',
  },
  {
    name: 'Sai Kiran',
    email: '26CSE120@edusync.edu',
    rollNo: '120',
    registerNo: 'CSE23A020',
    section: 'A',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Chandrasekhar',
    guardianPhone: '9876501020',
    faceId: '5382074',
  },
]

const STUDENTS_SECTION_B = [
  {
    name: 'Abhinav Kumar',
    email: '26CSE121@edusync.edu',
    rollNo: '121',
    registerNo: 'CSE23B001',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Ramesh Kumar',
    guardianPhone: '9876501021',
    faceId: '7629415',
  },
  {
    name: 'Anjali Devi',
    email: '26CSE122@edusync.edu',
    rollNo: '122',
    registerNo: 'CSE23B002',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Srinivas Rao',
    guardianPhone: '9876501022',
    faceId: '3957162',
  },
  {
    name: 'Bharath Reddy',
    email: '26CSE123@edusync.edu',
    rollNo: '123',
    registerNo: 'CSE23B003',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Prasad Reddy',
    guardianPhone: '9876501023',
    faceId: '8415296',
  },
  {
    name: 'Chaitanya Varma',
    email: '26CSE124@edusync.edu',
    rollNo: '124',
    registerNo: 'CSE23B004',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Venkatesh Varma',
    guardianPhone: '9876501024',
    faceId: '6274839',
  },
  {
    name: 'Devika Rani',
    email: '26CSE125@edusync.edu',
    rollNo: '125',
    registerNo: 'CSE23B005',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Srinivas Reddy',
    guardianPhone: '9876501025',
    faceId: '4598217',
  },
  {
    name: 'Gautham Sai',
    email: '26CSE126@edusync.edu',
    rollNo: '126',
    registerNo: 'CSE23B006',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Rajendra Sai',
    guardianPhone: '9876501026',
    faceId: '7836154',
  },
  {
    name: 'Harini Priya',
    email: '26CSE127@edusync.edu',
    rollNo: '127',
    registerNo: 'CSE23B007',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Murali Krishna',
    guardianPhone: '9876501027',
    faceId: '2169473',
  },
  {
    name: 'Jaswanth Kumar',
    email: '26CSE128@edusync.edu',
    rollNo: '128',
    registerNo: 'CSE23B008',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Raghunath Kumar',
    guardianPhone: '9876501028',
    faceId: '9352741',
  },
  {
    name: 'Kavya Sri',
    email: '26CSE129@edusync.edu',
    rollNo: '129',
    registerNo: 'CSE23B009',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Rajesh Rao',
    guardianPhone: '9876501029',
    faceId: '5748163',
  },
  {
    name: 'Lokesh Reddy',
    email: '26CSE130@edusync.edu',
    rollNo: '130',
    registerNo: 'CSE23B010',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Narasimha Reddy',
    guardianPhone: '9876501030',
    faceId: '3287594',
  },
  {
    name: 'Meghana Rao',
    email: '26CSE131@edusync.edu',
    rollNo: '131',
    registerNo: 'CSE23B011',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Mohan Rao',
    guardianPhone: '9876501031',
    faceId: '8164327',
  },
  {
    name: 'Naveen Kumar',
    email: '26CSE132@edusync.edu',
    rollNo: '132',
    registerNo: 'CSE23B012',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Sridhar Kumar',
    guardianPhone: '9876501032',
    faceId: '4916738',
  },
  {
    name: 'Nandini Sharma',
    email: '26CSE133@edusync.edu',
    rollNo: '133',
    registerNo: 'CSE23B013',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Dinesh Sharma',
    guardianPhone: '9876501033',
    faceId: '6572184',
  },
  {
    name: 'Pranav Teja',
    email: '26CSE134@edusync.edu',
    rollNo: '134',
    registerNo: 'CSE23B014',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Ramana Teja',
    guardianPhone: '9876501034',
    faceId: '2749356',
  },
  {
    name: 'Riya Reddy',
    email: '26CSE135@edusync.edu',
    rollNo: '135',
    registerNo: 'CSE23B015',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Satish Reddy',
    guardianPhone: '9876501035',
    faceId: '7295816',
  },
  {
    name: 'Rohit Kumar',
    email: '26CSE136@edusync.edu',
    rollNo: '136',
    registerNo: 'CSE23B016',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Srinivas Kumar',
    guardianPhone: '9876501036',
    faceId: '8631472',
  },
  {
    name: 'Sandeep Varma',
    email: '26CSE137@edusync.edu',
    rollNo: '137',
    registerNo: 'CSE23B017',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Krishna Varma',
    guardianPhone: '9876501037',
    faceId: '3158629',
  },
  {
    name: 'Shreya Priya',
    email: '26CSE138@edusync.edu',
    rollNo: '138',
    registerNo: 'CSE23B018',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Anand Kumar',
    guardianPhone: '9876501038',
    faceId: '9482735',
  },
  {
    name: 'Tejaswini Rao',
    email: '26CSE139@edusync.edu',
    rollNo: '139',
    registerNo: 'CSE23B019',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Prabhakar Rao',
    guardianPhone: '9876501039',
    faceId: '5267148',
  },
  {
    name: 'Varun Sai',
    email: '26CSE140@edusync.edu',
    rollNo: '140',
    registerNo: 'CSE23B020',
    section: 'B',
    semester: 6,
    batch: '2023-2027',
    guardianName: 'Ravindra Sai',
    guardianPhone: '9876501040',
    faceId: '4183925',
  },
]

async function resetAndSeed() {
  console.log('🧹 Purging all previous database records...')

  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.facultyIntervention.deleteMany()
  await prisma.academicRisk.deleteMany()
  await prisma.learningPathStep.deleteMany()
  await prisma.learningPath.deleteMany()
  await prisma.learningResource.deleteMany()
  await prisma.topicProgress.deleteMany()
  await prisma.subjectProgress.deleteMany()
  await prisma.subjectResult.deleteMany()
  await prisma.semesterResult.deleteMany()
  await prisma.studentAnswer.deleteMany()
  await prisma.studentAttempt.deleteMany()
  await prisma.assessmentQuestion.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.questionOption.deleteMany()
  await prisma.question.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.attendanceSession.deleteMany()
  await prisma.timetable.deleteMany()
  await prisma.studentEnrollment.deleteMany()
  await prisma.courseOffering.deleteMany()
  await prisma.learningObjective.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.student.deleteMany()
  await prisma.faculty.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()

  console.log('🏛️ Creating Department: CSE...')
  const dept = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
    },
  })

  console.log('👨‍🏫 Seeding 5 Faculty Members...')
  const seededFaculty: any[] = []
  for (const fac of FACULTY_DATA) {
    const user = await prisma.user.create({
      data: {
        email: fac.email.toLowerCase().trim(),
        name: fac.name,
        role: 'FACULTY',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fac.name)}`,
      },
    })

    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        employeeId: fac.employeeId,
        designation: fac.designation,
        cabinNumber: 'CSE-Block-301',
        cabinHours: '10:00 AM - 1:00 PM',
        phone: fac.phone,
        departmentId: dept.id,
      },
    })
    seededFaculty.push({ ...faculty, user })
    console.log(`  ✓ ${fac.employeeId} - ${fac.name} (${fac.email})`)
  }

  console.log('📚 Creating 5 Department Curriculum Subjects, Units & Topics...')
  const CURRICULUM_DATA = [
    {
      code: 'DWDM',
      name: 'DWDM — Data Warehousing and Data Mining',
      credits: 4,
      semester: 6,
      facultyIdx: 0, // Dr. Anil Kumar Reddy (FAC101)
      description: 'Covers data warehouse modeling, ETL architectures, data mining tasks, association rules, decision trees, and clustering.',
      units: [
        {
          unitNumber: 1,
          title: 'Unit 1: Data Warehousing',
          description: 'Introduction to data warehouses, multi-dimensional schemas, architectures, and ETL pipelines.',
          topics: ['Introduction to Data Warehousing', 'Data Warehouse Architecture', 'ETL and Data Preprocessing'],
        },
        {
          unitNumber: 2,
          title: 'Unit 2: Data Mining',
          description: 'Core concepts, Apriori association rule mining, classification, and statistical prediction.',
          topics: ['Data Mining Concepts and Tasks', 'Association Rule Mining', 'Classification and Prediction'],
        },
        {
          unitNumber: 3,
          title: 'Unit 3: Advanced Data Mining',
          description: 'Unsupervised clustering techniques, decision tree induction (ID3), and enterprise applications.',
          topics: ['Clustering Techniques', 'Decision Trees and ID3', 'Data Mining Applications'],
        },
      ],
    },
    {
      code: 'PYTHON',
      name: 'Python Programming',
      credits: 4,
      semester: 6,
      facultyIdx: 1, // Mrs. Priya Sharma (FAC102)
      description: 'Comprehensive programming in Python covering syntax, core data structures, OOP paradigms, and standard library modules.',
      units: [
        {
          unitNumber: 1,
          title: 'Unit 1: Python Fundamentals',
          description: 'Variables, data types, arithmetic/logical operators, control flow statements, and iterations.',
          topics: ['Introduction to Python', 'Variables, Data Types and Operators', 'Conditional Statements and Loops'],
        },
        {
          unitNumber: 2,
          title: 'Unit 2: Python Data Structures',
          description: 'Built-in compound data types, dictionary hash maps, sets, string manipulation, and functional blocks.',
          topics: ['Lists and Tuples', 'Dictionaries and Sets', 'Strings and Functions'],
        },
        {
          unitNumber: 3,
          title: 'Unit 3: Advanced Python',
          description: 'Classes and inheritance, polymorphs, custom exception handling, filesystem I/O, and modules.',
          topics: ['Object-Oriented Programming', 'Exception Handling', 'File Handling and Modules'],
        },
      ],
    },
    {
      code: 'QC',
      name: 'Quantum Computing',
      credits: 3,
      semester: 6,
      facultyIdx: 2, // Mr. Ravi Teja (FAC103)
      description: 'Quantum state mechanics, superposition, entanglement, quantum logic gates, circuits, and quantum algorithms.',
      units: [
        {
          unitNumber: 1,
          title: 'Unit 1: Quantum Fundamentals',
          description: 'Quantum bits (qubits), state vectors, superposition, and measurement operators in Hilbert spaces.',
          topics: ['Introduction to Quantum Computing', 'Qubits and Superposition', 'Quantum Measurement'],
        },
        {
          unitNumber: 2,
          title: 'Unit 2: Quantum Gates and Circuits',
          description: 'Pauli, Hadamard, Phase, and CNOT gates, circuit synthesis, Bell states, and quantum teleportation.',
          topics: ['Quantum Gates', 'Quantum Circuits', 'Entanglement and Quantum Teleportation'],
        },
        {
          unitNumber: 3,
          title: 'Unit 3: Advanced Quantum Algorithms',
          description: 'Quantum speedups, Deutsch-Jozsa oracle, Grover search algorithm, and Shor polynomial period finding.',
          topics: ['Deutsch-Jozsa Algorithm', "Grover's Search Algorithm", "Shor's Algorithm"],
        },
      ],
    },
    {
      code: 'MATH',
      name: 'Mathematics',
      credits: 4,
      semester: 6,
      facultyIdx: 3, // Mrs. Sneha Rao (FAC104)
      description: 'Differential calculus, integral methods and geometric applications, probability density models, and descriptive statistics.',
      units: [
        {
          unitNumber: 1,
          title: 'Unit 1: Differential Calculus',
          description: 'Limits, continuity, mean value theorems, higher derivatives, optimization, and curvature applications.',
          topics: ['Limits and Continuity', 'Differentiation', 'Applications of Derivatives'],
        },
        {
          unitNumber: 2,
          title: 'Unit 2: Integral Calculus',
          description: 'Integration techniques, substitution, partial fractions, definite integrals, areas, and volumes.',
          topics: ['Indefinite Integrals', 'Definite Integrals', 'Applications of Integration'],
        },
        {
          unitNumber: 3,
          title: 'Unit 3: Probability and Statistics',
          description: 'Axiomatic probability, Bayes theorem, discrete & continuous distributions, variance, and sample statistics.',
          topics: ['Probability Basics', 'Probability Distributions', 'Mean, Variance and Standard Deviation'],
        },
      ],
    },
    {
      code: 'ENG',
      name: 'English',
      credits: 3,
      semester: 6,
      facultyIdx: 4, // Dr. Kiran Babu (FAC105)
      description: 'Professional communications, technical writing, grammar precision, public presentations, and corporate readiness.',
      units: [
        {
          unitNumber: 1,
          title: 'Unit 1: Communication Skills',
          description: 'Communication barriers, active listening, voice modulation, verbal and non-verbal body language.',
          topics: ['Fundamentals of Communication', 'Verbal and Non-Verbal Communication', 'Listening and Speaking Skills'],
        },
        {
          unitNumber: 2,
          title: 'Unit 2: Grammar and Writing',
          description: 'Syntactic mechanics, tenses, common grammatical pitfalls, sentence structuring, and structured essays.',
          topics: ['Parts of Speech and Tenses', 'Sentence Structure and Error Correction', 'Paragraph and Essay Writing'],
        },
        {
          unitNumber: 3,
          title: 'Unit 3: Professional English',
          description: 'Resume crafting, cover letters, group discussion dynamics, persuasive presentation, and interview mastery.',
          topics: ['Resume and Cover Letter Writing', 'Group Discussions and Presentations', 'Interview Skills'],
        },
      ],
    },
  ]

  const createdSubjects: Record<string, any> = {}
  const createdOfferings: Record<string, { secA: any; secB: any }> = {}

  for (const c of CURRICULUM_DATA) {
    const assignedFac = seededFaculty[c.facultyIdx]
    const subject = await prisma.subject.create({
      data: {
        code: c.code,
        name: c.name,
        credits: c.credits,
        semester: c.semester,
        description: c.description,
        departmentId: dept.id,
      },
    })
    createdSubjects[c.code] = subject

    for (const u of c.units) {
      const unit = await prisma.unit.create({
        data: {
          subjectId: subject.id,
          unitNumber: u.unitNumber,
          title: u.title,
          description: u.description,
        },
      })

      for (let tIdx = 0; tIdx < u.topics.length; tIdx++) {
        const topic = await prisma.topic.create({
          data: {
            unitId: unit.id,
            topicNumber: tIdx + 1,
            title: u.topics[tIdx],
            difficulty: tIdx === 2 ? 'HARD' : tIdx === 1 ? 'MEDIUM' : 'EASY',
            estimatedHours: 3.5,
          },
        })

        await prisma.learningObjective.create({
          data: {
            topicId: topic.id,
            code: `LO-${c.code}-${u.unitNumber}.${tIdx + 1}`,
            description: `Understand and apply concepts of ${u.topics[tIdx]}.`,
            bloomLevel: tIdx === 2 ? 'ANALYZE' : 'UNDERSTAND',
          },
        })
      }
    }

    const offeringA = await prisma.courseOffering.create({
      data: {
        subjectId: subject.id,
        facultyId: assignedFac.id,
        academicYear: '2025-2026',
        semester: c.semester,
        section: 'A',
      },
    })

    const offeringB = await prisma.courseOffering.create({
      data: {
        subjectId: subject.id,
        facultyId: assignedFac.id,
        academicYear: '2025-2026',
        semester: c.semester,
        section: 'B',
      },
    })

    createdOfferings[c.code] = { secA: offeringA, secB: offeringB }
    console.log(`  ✓ Subject: ${c.code} - ${c.name} assigned to ${assignedFac.user.name}`)
  }

  console.log('👨‍🎓 Seeding Section A (20 Students) & Enrolling in all 5 subjects...')
  const seededSecAStudents: any[] = []
  for (const s of STUDENTS_SECTION_A) {
    const user = await prisma.user.create({
      data: {
        email: s.email.toLowerCase().trim(),
        name: s.name,
        role: 'STUDENT',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.name)}`,
      },
    })

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNo: s.rollNo,
        registerNo: s.registerNo,
        batch: s.batch,
        section: s.section,
        currentSemester: s.semester,
        departmentId: dept.id,
        currentCgpa: 8.4,
        attendancePercentage: 88.0,
        riskLevel: 'LOW',
        riskScore: 12,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        faceId: s.faceId,
      },
    })
    seededSecAStudents.push(student)

    // Enroll in all 5 Section A offerings
    for (const code of Object.keys(createdOfferings)) {
      await prisma.studentEnrollment.create({
        data: {
          studentId: student.id,
          courseOfferingId: createdOfferings[code].secA.id,
        },
      })
    }
  }

  console.log('👩‍🎓 Seeding Section B (20 Students) & Enrolling in all 5 subjects...')
  const seededSecBStudents: any[] = []
  for (const s of STUDENTS_SECTION_B) {
    const user = await prisma.user.create({
      data: {
        email: s.email.toLowerCase().trim(),
        name: s.name,
        role: 'STUDENT',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.name)}`,
      },
    })

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNo: s.rollNo,
        registerNo: s.registerNo,
        batch: s.batch,
        section: s.section,
        currentSemester: s.semester,
        departmentId: dept.id,
        currentCgpa: 8.2,
        attendancePercentage: 85.0,
        riskLevel: 'LOW',
        riskScore: 15,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        faceId: s.faceId,
      },
    })
    seededSecBStudents.push(student)

    // Enroll in all 5 Section B offerings
    for (const code of Object.keys(createdOfferings)) {
      await prisma.studentEnrollment.create({
        data: {
          studentId: student.id,
          courseOfferingId: createdOfferings[code].secB.id,
        },
      })
    }
  }

  console.log('🗓️ Generating Weekly Timetable Across Monday to Friday...')
  const TIME_SLOTS = [
    { startTime: '09:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '11:15', endTime: '12:15' },
    { startTime: '01:15', endTime: '02:15' },
    { startTime: '02:15', endTime: '03:15' },
  ]
  const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const SCHEDULE_MATRIX: Record<string, { slotIndex: number; secASubject: string; secBSubject: string }[]> = {
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

  for (const day of DAYS_OF_WEEK) {
    for (const entry of SCHEDULE_MATRIX[day]) {
      const slot = TIME_SLOTS[entry.slotIndex]
      await prisma.timetable.create({
        data: {
          courseOfferingId: createdOfferings[entry.secASubject].secA.id,
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNumber: 'LH-101',
        },
      })
      await prisma.timetable.create({
        data: {
          courseOfferingId: createdOfferings[entry.secBSubject].secB.id,
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNumber: 'LH-102',
        },
      })
    }
  }

  console.log('📡 Creating Active Live Attendance Session for DWDM...')
  const sessionA = await prisma.attendanceSession.create({
    data: {
      courseOfferingId: createdOfferings['DWDM'].secA.id,
      facultyId: seededFaculty[0].id,
      topicCovered: 'Introduction to Data Warehousing & Architecture Overview',
      status: 'ACTIVE',
      roomLatitude: 12.9716,
      roomLongitude: 77.5946,
      geofenceRadiusMeters: 500,
    },
  })

  console.log(`  ✓ Active Attendance Session ready: ${sessionA.id}`)
  console.log('✨ Dataset reset and seeded successfully!')
}

resetAndSeed()
  .catch((e) => {
    console.error('Error during reset and seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
