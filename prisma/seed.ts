import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Cleaning existing database tables...')
  // Clean in correct cascade order
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

  console.log('🏛️ Creating Departments...')
  const cseDept = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
    },
  })

  const eceDept = await prisma.department.create({
    data: {
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
    },
  })

  console.log('👨‍🏫 Creating Faculty Members...')
  const facultyUser1 = await prisma.user.create({
    data: {
      email: 'arvind.sharma@edusync.edu',
      name: 'Dr. Arvind Sharma',
      role: 'FACULTY',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  })

  const faculty1 = await prisma.faculty.create({
    data: {
      userId: facultyUser1.id,
      employeeId: 'FAC201201',
      designation: 'Professor & Head of Department',
      cabinNumber: 'LH-301 (Academic Block A)',
      cabinHours: 'Mon-Thu: 03:00 PM - 05:00 PM',
      phone: '+91 98450 12345',
      departmentId: cseDept.id,
    },
  })

  const facultyUser2 = await prisma.user.create({
    data: {
      email: 'neha.gupta@edusync.edu',
      name: 'Prof. Neha Gupta',
      role: 'FACULTY',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    },
  })

  const faculty2 = await prisma.faculty.create({
    data: {
      userId: facultyUser2.id,
      employeeId: 'FAC201844',
      designation: 'Associate Professor',
      cabinNumber: 'LH-205 (Academic Block A)',
      cabinHours: 'Tue-Fri: 02:00 PM - 04:00 PM',
      phone: '+91 98450 67890',
      departmentId: cseDept.id,
    },
  })

  console.log('📚 Creating Core Subjects & Hierarchical Syllabus...')
  const dsaSubject = await prisma.subject.create({
    data: {
      code: 'CS501',
      name: 'Data Structures & Advanced Algorithms',
      credits: 4,
      semester: 5,
      description: 'Comprehensive study of graph algorithms, dynamic programming, complexity classes, and tree paradigms.',
      departmentId: cseDept.id,
    },
  })

  const dbmsSubject = await prisma.subject.create({
    data: {
      code: 'CS502',
      name: 'Database Systems & Query Optimization',
      credits: 4,
      semester: 5,
      description: 'Relational query optimization, indexing hierarchies, transaction concurrency, and distributed storage.',
      departmentId: cseDept.id,
    },
  })

  const cnSubject = await prisma.subject.create({
    data: {
      code: 'CS503',
      name: 'Computer Networks & Security',
      credits: 3,
      semester: 5,
      description: 'Layered architectures, TCP congestion control, cryptographic protocols, and routing algorithms.',
      departmentId: cseDept.id,
    },
  })

  const aiSubject = await prisma.subject.create({
    data: {
      code: 'CS504',
      name: 'Artificial Intelligence & Machine Learning',
      credits: 4,
      semester: 5,
      description: 'State space search, reinforcement learning, neural networks, and statistical reasoning.',
      departmentId: cseDept.id,
    },
  })

  // Units and Topics for DSA
  const unit1 = await prisma.unit.create({
    data: {
      subjectId: dsaSubject.id,
      unitNumber: 1,
      title: 'Graph Algorithms & Shortest Paths',
      description: 'Traversal strategies, single-source and all-pairs shortest paths, and minimum spanning forest.',
    },
  })

  const topic1_1 = await prisma.topic.create({
    data: {
      unitId: unit1.id,
      topicNumber: 1,
      title: 'Graph Representation & BFS/DFS Invariants',
      difficulty: 'EASY',
      estimatedHours: 4.0,
    },
  })

  const topic1_2 = await prisma.topic.create({
    data: {
      unitId: unit1.id,
      topicNumber: 2,
      title: 'Dijkstra & Bellman-Ford Algorithms',
      difficulty: 'MEDIUM',
      estimatedHours: 5.0,
    },
  })

  const topic1_3 = await prisma.topic.create({
    data: {
      unitId: unit1.id,
      topicNumber: 3,
      title: 'Minimum Spanning Trees: Kruskal & Prim',
      difficulty: 'MEDIUM',
      estimatedHours: 4.0,
    },
  })

  // Learning Objectives
  await prisma.learningObjective.createMany({
    data: [
      { topicId: topic1_1.id, code: 'LO-1.1.1', description: 'Formulate graph adjacency lists vs matrices and analyze spatial trade-offs.', bloomLevel: 'ANALYZE' },
      { topicId: topic1_2.id, code: 'LO-1.2.1', description: 'Prove greedy choice correctness in Dijkstra and detect negative weight cycles.', bloomLevel: 'EVALUATE' },
      { topicId: topic1_3.id, code: 'LO-1.3.1', description: 'Implement Disjoint Set Union (DSU) with path compression for Kruskal algorithm.', bloomLevel: 'APPLY' },
    ],
  })

  const unit2 = await prisma.unit.create({
    data: {
      subjectId: dsaSubject.id,
      unitNumber: 2,
      title: 'Dynamic Programming Paradigms',
      description: 'Overlapping subproblems, optimal substructure, memoization vs bottom-up tabulation.',
    },
  })

  const topic2_1 = await prisma.topic.create({
    data: {
      unitId: unit2.id,
      topicNumber: 1,
      title: '0/1 Knapsack & Subset Sum Problems',
      difficulty: 'MEDIUM',
      estimatedHours: 5.0,
    },
  })

  const topic2_2 = await prisma.topic.create({
    data: {
      unitId: unit2.id,
      topicNumber: 2,
      title: 'Longest Common Subsequence & Matrix Chain',
      difficulty: 'HARD',
      estimatedHours: 6.0,
    },
  })

  // Course Offerings
  const offeringDsaA = await prisma.courseOffering.create({
    data: {
      subjectId: dsaSubject.id,
      facultyId: faculty1.id,
      academicYear: '2025-2026',
      semester: 5,
      section: 'A',
    },
  })

  const offeringDbmsA = await prisma.courseOffering.create({
    data: {
      subjectId: dbmsSubject.id,
      facultyId: faculty2.id,
      academicYear: '2025-2026',
      semester: 5,
      section: 'A',
    },
  })

  // Timetables
  await prisma.timetable.createMany({
    data: [
      { courseOfferingId: offeringDsaA.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', roomNumber: 'LH-101' },
      { courseOfferingId: offeringDsaA.id, dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '11:00', roomNumber: 'LH-101' },
      { courseOfferingId: offeringDsaA.id, dayOfWeek: 'FRIDAY', startTime: '11:15', endTime: '12:15', roomNumber: 'LH-101' },
      { courseOfferingId: offeringDbmsA.id, dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '10:00', roomNumber: 'LH-102' },
      { courseOfferingId: offeringDbmsA.id, dayOfWeek: 'THURSDAY', startTime: '14:00', endTime: '15:00', roomNumber: 'LH-102' },
    ],
  })

  console.log('🎓 Creating 10 Comprehensive Student Profiles...')
  const rawStudents = [
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@edusync.edu',
      rollNo: '23CS01',
      regNo: 'REG2023001',
      cgpa: 6.2,
      attPct: 48.5,
      risk: 'CRITICAL',
      riskScore: 88,
      guardianName: 'Sunil Verma',
      guardianPhone: '+91 98111 22334',
      phone: '+91 98111 55667',
      address: 'B-14, Green Park Extension, New Delhi',
      notes: 'Frequent unexcused absences. Struggles with algorithmic proofs. Family informed on 10th Sep.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@edusync.edu',
      rollNo: '23CS02',
      regNo: 'REG2023002',
      cgpa: 9.6,
      attPct: 96.0,
      risk: 'LOW',
      riskScore: 5,
      guardianName: 'Ramesh Patel',
      guardianPhone: '+91 98222 33445',
      phone: '+91 98222 77889',
      address: 'Flat 402, Shivalik Residency, Ahmedabad',
      notes: 'Department topper candidate. Consistent top quartile in algorithm benchmarks.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Ananya Rao',
      email: 'ananya.rao@edusync.edu',
      rollNo: '23CS03',
      regNo: 'REG2023003',
      cgpa: 7.4,
      attPct: 68.0,
      risk: 'HIGH',
      riskScore: 62,
      guardianName: 'Venkatesh Rao',
      guardianPhone: '+91 98333 44556',
      phone: '+91 98333 88990',
      address: '22/B, Indiranagar 1st Stage, Bengaluru',
      notes: 'Attendance slipped below 75% due to medical recovery. Needs guided remedial on Dynamic Programming.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Amit Kumar',
      email: 'amit.kumar@edusync.edu',
      rollNo: '23CS04',
      regNo: 'REG2023004',
      cgpa: 8.3,
      attPct: 86.5,
      risk: 'LOW',
      riskScore: 12,
      guardianName: 'Rajendra Kumar',
      guardianPhone: '+91 98444 55667',
      phone: '+91 98444 99001',
      address: 'Sector 62, Noida, Uttar Pradesh',
      notes: 'Solid participation in lab assignments. Strong implementation skills.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@edusync.edu',
      rollNo: '23CS05',
      regNo: 'REG2023005',
      cgpa: 8.8,
      attPct: 91.0,
      risk: 'LOW',
      riskScore: 8,
      guardianName: 'K. V. Reddy',
      guardianPhone: '+91 98555 66778',
      phone: '+91 98555 11223',
      address: 'Plot 88, Jubilee Hills, Hyderabad',
      notes: 'Demonstrates deep analytical clarity. Active member of competitive programming club.',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@edusync.edu',
      rollNo: '23CS06',
      regNo: 'REG2023006',
      cgpa: 7.1,
      attPct: 71.5,
      risk: 'MEDIUM',
      riskScore: 38,
      guardianName: 'Manjit Singh',
      guardianPhone: '+91 98666 77889',
      phone: '+91 98666 22334',
      address: 'Model Town, Phase 2, Ludhiana',
      notes: 'Slight decline in quiz scores during last two weeks. Requires counseling check-in.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Pooja Mehta',
      email: 'pooja.mehta@edusync.edu',
      rollNo: '23CS07',
      regNo: 'REG2023007',
      cgpa: 8.5,
      attPct: 92.5,
      risk: 'LOW',
      riskScore: 10,
      guardianName: 'Deepak Mehta',
      guardianPhone: '+91 98777 88990',
      phone: '+91 98777 33445',
      address: '15, Marine Drive, Mumbai',
      notes: 'High test scores in database indexing and B+ Tree derivations.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Rohan Nair',
      email: 'rohan.nair@edusync.edu',
      rollNo: '23CS08',
      regNo: 'REG2023008',
      cgpa: 5.8,
      attPct: 42.0,
      risk: 'CRITICAL',
      riskScore: 92,
      guardianName: 'Gopinath Nair',
      guardianPhone: '+91 98888 99001',
      phone: '+91 98888 44556',
      address: 'Vyttila, Kochi, Kerala',
      notes: 'Critical risk: Absent for multiple mandatory lab examinations. Formal warning letter dispatched.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Divya Iyer',
      email: 'divya.iyer@edusync.edu',
      rollNo: '23CS09',
      regNo: 'REG2023009',
      cgpa: 8.7,
      attPct: 89.0,
      risk: 'LOW',
      riskScore: 14,
      guardianName: 'S. Iyer',
      guardianPhone: '+91 98999 00112',
      phone: '+91 98999 55667',
      address: 'Mylapore, Chennai, Tamil Nadu',
      notes: 'Consistently completes all peer-learning modules and remedial reviews proactively.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Karthik Sundaram',
      email: 'karthik.s@edusync.edu',
      rollNo: '23CS10',
      regNo: 'REG2023010',
      cgpa: 9.3,
      attPct: 95.0,
      risk: 'LOW',
      riskScore: 6,
      guardianName: 'M. Sundaram',
      guardianPhone: '+91 98000 11223',
      phone: '+91 98000 66778',
      address: 'Basavanagudi, Bengaluru',
      notes: 'Exceptional problem-solving speed in graph theory and dynamic programming.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
  ]

  const createdStudents = []
  for (const s of rawStudents) {
    const u = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        role: 'STUDENT',
        avatar: s.avatar,
      },
    })

    const student = await prisma.student.create({
      data: {
        userId: u.id,
        rollNo: s.rollNo,
        registerNo: s.regNo,
        batch: '2023-2027',
        section: 'A',
        currentSemester: 5,
        departmentId: cseDept.id,
        currentCgpa: s.cgpa,
        attendancePercentage: s.attPct,
        riskLevel: s.risk,
        riskScore: s.riskScore,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        studentPhone: s.phone,
        address: s.address,
        advisorNotes: s.notes,
      },
    })
    createdStudents.push(student)

    // Enroll in Course Offerings
    await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        courseOfferingId: offeringDsaA.id,
      },
    })
    await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        courseOfferingId: offeringDbmsA.id,
      },
    })

    // Topic & Subject Progress
    await prisma.subjectProgress.create({
      data: {
        studentId: student.id,
        subjectId: dsaSubject.id,
        overallMastery: s.attPct > 75 ? Math.min(95, s.cgpa * 10) : 42.0,
        status: s.risk === 'CRITICAL' ? 'NEEDS_IMPROVEMENT' : 'MASTERED',
      },
    })

    await prisma.topicProgress.createMany({
      data: [
        {
          studentId: student.id,
          topicId: topic1_1.id,
          masteryScore: s.risk === 'CRITICAL' ? 45.0 : 88.0,
          status: s.risk === 'CRITICAL' ? 'NEEDS_IMPROVEMENT' : 'MASTERED',
          quizzesAttempted: 3,
          accuracyRate: s.risk === 'CRITICAL' ? 42.0 : 91.0,
          lastPracticed: new Date(),
        },
        {
          studentId: student.id,
          topicId: topic1_2.id,
          masteryScore: s.risk === 'CRITICAL' ? 32.0 : 82.0,
          status: s.risk === 'CRITICAL' ? 'NEEDS_IMPROVEMENT' : 'PRACTICING',
          quizzesAttempted: 2,
          accuracyRate: s.risk === 'CRITICAL' ? 30.0 : 85.0,
          lastPracticed: new Date(),
        },
      ],
    })

    // Semester Results for Sem 4 & Sem 3
    const sem4Result = await prisma.semesterResult.create({
      data: {
        studentId: student.id,
        semester: 4,
        academicYear: '2024-2025',
        sgpa: s.cgpa,
        cgpa: s.cgpa,
        totalCredits: 22,
        earnedCredits: s.risk === 'CRITICAL' ? 18 : 22,
        status: s.risk === 'CRITICAL' ? 'PROMOTED' : 'PASSED',
        isPublished: true,
      },
    })

    await prisma.subjectResult.createMany({
      data: [
        {
          semesterResultId: sem4Result.id,
          subjectCode: 'CS401',
          subjectName: 'Design and Analysis of Algorithms',
          credits: 4,
          internalMarks: s.risk === 'CRITICAL' ? 24 : 45,
          externalMarks: s.risk === 'CRITICAL' ? 32 : 46,
          totalMarks: s.risk === 'CRITICAL' ? 56 : 91,
          grade: s.risk === 'CRITICAL' ? 'C' : 'O',
          gradePoint: s.risk === 'CRITICAL' ? 6.0 : 10.0,
          isPassed: true,
        },
        {
          semesterResultId: sem4Result.id,
          subjectCode: 'CS402',
          subjectName: 'Operating Systems & System Programming',
          credits: 4,
          internalMarks: s.risk === 'CRITICAL' ? 28 : 42,
          externalMarks: s.risk === 'CRITICAL' ? 35 : 44,
          totalMarks: s.risk === 'CRITICAL' ? 63 : 86,
          grade: s.risk === 'CRITICAL' ? 'B' : 'A+',
          gradePoint: s.risk === 'CRITICAL' ? 7.0 : 9.0,
          isPassed: true,
        },
      ],
    })
  }

  console.log('📝 Creating Question Bank & Assessment...')
  // Questions for Topic 1.1 & 1.2
  const q1 = await prisma.question.create({
    data: {
      topicId: topic1_1.id,
      facultyId: faculty1.id,
      type: 'MCQ',
      questionText: 'What is the time complexity of Breadth-First Search (BFS) using an adjacency list representation on a graph G = (V, E)?',
      explanation: 'BFS touches each vertex once and traverses each edge in directed/undirected representation, resulting in O(V + E).',
      difficulty: 'EASY',
      marks: 2,
      bloomLevel: 'UNDERSTAND',
      options: {
        create: [
          { optionKey: 'A', optionText: 'O(V + E)', isCorrect: true },
          { optionKey: 'B', optionText: 'O(V * E)', isCorrect: false },
          { optionKey: 'C', optionText: 'O(V^2)', isCorrect: false },
          { optionKey: 'D', optionText: 'O(E log V)', isCorrect: false },
        ],
      },
    },
  })

  const q2 = await prisma.question.create({
    data: {
      topicId: topic1_2.id,
      facultyId: faculty1.id,
      type: 'MCQ',
      questionText: 'Why does Dijkstra’s algorithm fail to guarantee the shortest path on graphs containing negative-weight edges?',
      explanation: 'Dijkstra assumes that adding an edge to an established shortest path will never decrease the total path cost (greedy non-decreasing property). Negative weights violate this assumption.',
      difficulty: 'MEDIUM',
      marks: 3,
      bloomLevel: 'ANALYZE',
      options: {
        create: [
          { optionKey: 'A', optionText: 'It enters an infinite cycle on all cyclic graphs.', isCorrect: false },
          { optionKey: 'B', optionText: 'The greedy assumption that visited nodes have finalized minimum distances is invalidated.', isCorrect: true },
          { optionKey: 'C', optionText: 'Priority queue data structures cannot store negative key values.', isCorrect: false },
          { optionKey: 'D', optionText: 'It requires undirected edge weights only.', isCorrect: false },
        ],
      },
    },
  })

  const q3 = await prisma.question.create({
    data: {
      topicId: topic1_2.id,
      facultyId: faculty1.id,
      type: 'TRUE_FALSE',
      questionText: 'Bellman-Ford algorithm can detect negative-weight cycles in a directed graph within O(V * E) iterations.',
      correctAnswer: 'True',
      explanation: 'By relaxing all edges V-1 times and checking if any distance can still be reduced in the V-th pass, Bellman-Ford accurately detects negative weight cycles.',
      difficulty: 'EASY',
      marks: 2,
      bloomLevel: 'APPLY',
      options: {
        create: [
          { optionKey: 'A', optionText: 'True', isCorrect: true },
          { optionKey: 'B', optionText: 'False', isCorrect: false },
        ],
      },
    },
  })

  const q4 = await prisma.question.create({
    data: {
      topicId: topic1_2.id,
      facultyId: faculty1.id,
      type: 'SHORT_ANSWER',
      questionText: 'Derive the recurrence relation and explain the edge relaxation condition utilized in the Bellman-Ford algorithm.',
      sampleAnswer: 'Distance relaxation: if dist[u] + weight(u, v) < dist[v], then dist[v] = dist[u] + weight(u, v). This is repeated |V|-1 times for all edges.',
      explanation: 'Evaluates theoretical foundation of dynamic programming formulation of shortest paths.',
      difficulty: 'HARD',
      marks: 5,
      bloomLevel: 'ANALYZE',
    },
  })

  // Create an Assessment
  const assessment1 = await prisma.assessment.create({
    data: {
      title: 'Unit 1: Graph Invariants & Shortest Paths Benchmark',
      description: 'Formal evaluative quiz testing BFS/DFS runtime properties and Dijkstra/Bellman-Ford relaxation invariants.',
      subjectId: dsaSubject.id,
      facultyId: faculty1.id,
      type: 'QUIZ',
      durationMinutes: 30,
      totalMarks: 12,
      passMarks: 5,
      status: 'PUBLISHED',
      scheduledStart: new Date(Date.now() - 3600000 * 48),
      scheduledEnd: new Date(Date.now() + 3600000 * 48),
    },
  })

  await prisma.assessmentQuestion.createMany({
    data: [
      { assessmentId: assessment1.id, questionId: q1.id, orderIndex: 1, marks: 2 },
      { assessmentId: assessment1.id, questionId: q2.id, orderIndex: 2, marks: 3 },
      { assessmentId: assessment1.id, questionId: q3.id, orderIndex: 3, marks: 2 },
      { assessmentId: assessment1.id, questionId: q4.id, orderIndex: 4, marks: 5 },
    ],
  })

  // Populate student attempts
  // Priya Patel (Topper attempt)
  const attemptPriya = await prisma.studentAttempt.create({
    data: {
      assessmentId: assessment1.id,
      studentId: createdStudents[1].id,
      status: 'EVALUATED',
      score: 12.0,
      totalMarks: 12.0,
      percentage: 100.0,
      feedback: 'Flawless proof derivation and edge relaxation explanation.',
    },
  })
  await prisma.studentAnswer.createMany({
    data: [
      { attemptId: attemptPriya.id, questionId: q1.id, selectedOptionKeys: '["A"]', isCorrect: true, marksAwarded: 2.0 },
      { attemptId: attemptPriya.id, questionId: q2.id, selectedOptionKeys: '["B"]', isCorrect: true, marksAwarded: 3.0 },
      { attemptId: attemptPriya.id, questionId: q3.id, selectedOptionKeys: '["A"]', isCorrect: true, marksAwarded: 2.0 },
      {
        attemptId: attemptPriya.id,
        questionId: q4.id,
        studentAnswerText: 'The relaxation step evaluates whether passing through vertex u yields a shorter path to v: if (dist[u] + w(u,v) < dist[v]) { dist[v] = dist[u] + w(u,v); pred[v] = u; }. Across |V|-1 phases, all simple paths of length <= |V|-1 are resolved.',
        isCorrect: true,
        marksAwarded: 5.0,
        facultyFeedback: 'Excellent mathematical rigour.',
        evaluatedBy: 'Dr. Arvind Sharma',
        evaluatedAt: new Date(),
      },
    ],
  })

  // Rahul Verma (At-risk attempt: SUBMITTED with subjective answer pending faculty evaluation!)
  const attemptRahul = await prisma.studentAttempt.create({
    data: {
      assessmentId: assessment1.id,
      studentId: createdStudents[0].id,
      status: 'SUBMITTED', // Pending subjective grading!
      score: 2.0,
      totalMarks: 12.0,
      percentage: 16.6,
      feedback: 'Subjective question pending grading.',
    },
  })
  await prisma.studentAnswer.createMany({
    data: [
      { attemptId: attemptRahul.id, questionId: q1.id, selectedOptionKeys: '["A"]', isCorrect: true, marksAwarded: 2.0 },
      { attemptId: attemptRahul.id, questionId: q2.id, selectedOptionKeys: '["A"]', isCorrect: false, marksAwarded: 0.0 },
      { attemptId: attemptRahul.id, questionId: q3.id, selectedOptionKeys: '["B"]', isCorrect: false, marksAwarded: 0.0 },
      {
        attemptId: attemptRahul.id,
        questionId: q4.id,
        studentAnswerText: 'Bellman Ford relaxes edges by checking dist[u] + cost < dist[v] over multiple loops until vertices do not change.',
        marksAwarded: 0.0,
        // Left unevaluated for faculty evaluation demo!
      },
    ],
  })

  console.log('📍 Creating Attendance Sessions with Face & Geolocation Logs...')
  // Session 1: Past Closed Session
  const session1 = await prisma.attendanceSession.create({
    data: {
      courseOfferingId: offeringDsaA.id,
      facultyId: faculty1.id,
      sessionDate: new Date(Date.now() - 3600000 * 24 * 3),
      startTime: new Date(Date.now() - 3600000 * 24 * 3),
      endTime: new Date(Date.now() - 3600000 * 24 * 3 + 3600000),
      topicCovered: 'Graph Representation & BFS Invariants',
      status: 'CLOSED',
      roomLatitude: 12.9716,
      roomLongitude: 77.5946,
      geofenceRadiusMeters: 100.0,
    },
  })

  // Session 2: Active Session Open for Live Check-In!
  const sessionActive = await prisma.attendanceSession.create({
    data: {
      courseOfferingId: offeringDsaA.id,
      facultyId: faculty1.id,
      sessionDate: new Date(),
      startTime: new Date(),
      topicCovered: 'Dijkstra Priority Queue Optimization & Invariant Bounds',
      status: 'ACTIVE',
      roomLatitude: 12.9716,
      roomLongitude: 77.5946,
      geofenceRadiusMeters: 100.0,
    },
  })

  // Attendance Records for Session 1
  for (const stu of createdStudents) {
    const isPresent = stu.rollNo !== '23CS01' && stu.rollNo !== '23CS08'
    await prisma.attendanceRecord.create({
      data: {
        sessionId: session1.id,
        studentId: stu.id,
        status: isPresent ? 'PRESENT' : 'ABSENT',
        verificationMethod: isPresent ? 'FACE_GEO' : 'MANUAL',
        faceConfidence: isPresent ? 0.94 : null,
        livenessVerified: isPresent,
        latitude: isPresent ? 12.97162 : null,
        longitude: isPresent ? 77.59461 : null,
        withinGeofence: isPresent,
        overrideReason: !isPresent ? 'Unexcused absence recorded by biometric gateway' : null,
      },
    })
  }

  // Pre-seed some check-ins in active session
  await prisma.attendanceRecord.create({
    data: {
      sessionId: sessionActive.id,
      studentId: createdStudents[1].id, // Priya
      status: 'PRESENT',
      verificationMethod: 'FACE_GEO',
      faceConfidence: 0.98,
      livenessVerified: true,
      latitude: 12.971605,
      longitude: 77.594602,
      withinGeofence: true,
    },
  })

  console.log('⚠️ Creating Academic Risks & Faculty Interventions...')
  // Critical Risk for Rahul Verma
  const riskRahul = await prisma.academicRisk.create({
    data: {
      studentId: createdStudents[0].id,
      riskLevel: 'CRITICAL',
      riskScore: 88,
      lowAttendanceAlert: true,
      failedAssessmentsAlert: true,
      scoreDropAlert: false,
      primaryReason: 'Severely critical attendance (48.5% < 50%); Failed 2 recent assessments in Graph Theory.',
    },
  })

  await prisma.facultyIntervention.create({
    data: {
      riskId: riskRahul.id,
      studentId: createdStudents[0].id,
      facultyId: faculty1.id,
      type: 'PARENT_MEETING',
      description: 'Scheduled urgent parent consultation regarding 48.5% attendance rate and remedial plan.',
      targetDate: new Date(Date.now() + 3600000 * 24 * 3),
      status: 'SCHEDULED',
      notes: 'Guardian Sunil Verma reached via phone on 15th Sep. Meeting scheduled in HOD cabin LH-301.',
    },
  })

  await prisma.facultyIntervention.create({
    data: {
      riskId: riskRahul.id,
      studentId: createdStudents[0].id,
      facultyId: faculty1.id,
      type: 'REMEDIAL_CLASS',
      description: 'Assign mandatory remedial lab session on Graph Traversal and Dijkstra priority queue implementation.',
      targetDate: new Date(Date.now() + 3600000 * 24 * 5),
      status: 'IN_PROGRESS',
      notes: 'Teaching Assistant instructed to log lab progress.',
    },
  })

  // High Risk for Ananya Rao
  const riskAnanya = await prisma.academicRisk.create({
    data: {
      studentId: createdStudents[2].id,
      riskLevel: 'HIGH',
      riskScore: 62,
      lowAttendanceAlert: true,
      failedAssessmentsAlert: false,
      scoreDropAlert: true,
      primaryReason: 'Attendance below mandatory 75% threshold (68.0%); GPA dropped by 0.9 points due to health absence.',
    },
  })

  await prisma.facultyIntervention.create({
    data: {
      riskId: riskAnanya.id,
      studentId: createdStudents[2].id,
      facultyId: faculty1.id,
      type: 'COUNSELING',
      description: 'Academic counseling to outline makeup coursework and lecture recordings schedule.',
      targetDate: new Date(Date.now() + 3600000 * 24 * 2),
      status: 'SCHEDULED',
      notes: 'Doctor certificate verified by university medical officer.',
    },
  })

  console.log('🛤️ Creating AI Learning Paths & Resources...')
  const pathRahul = await prisma.learningPath.create({
    data: {
      studentId: createdStudents[0].id,
      subjectId: dsaSubject.id,
      title: 'Remedial Mastery: Graph Traversal & Shortest Paths',
      reason: 'Low Assessment Score (16.6%) in Unit 1 Benchmark',
      status: 'ACTIVE',
    },
  })

  await prisma.learningPathStep.createMany({
    data: [
      {
        learningPathId: pathRahul.id,
        topicId: topic1_1.id,
        orderIndex: 1,
        title: 'Review Adjacency Lists vs Matrix Representation',
        description: 'Watch video module and write memory space analysis for sparse graphs.',
        resourceUrl: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms/',
        isCompleted: true,
        completedAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        learningPathId: pathRahul.id,
        topicId: topic1_2.id,
        orderIndex: 2,
        title: 'Dijkstra Invariant & Priority Queue Mechanics',
        description: 'Step-by-step trace of Dijkstra with min-heap on a 6-node weighted graph.',
        resourceUrl: 'https://visualgo.net/en/sssp',
        isCompleted: false,
      },
      {
        learningPathId: pathRahul.id,
        topicId: topic1_2.id,
        orderIndex: 3,
        title: 'Solve 3 Remedial Benchmark Problems',
        description: 'Complete practice questions on Dijkstra edge cases and submit for TA validation.',
        isCompleted: false,
      },
    ],
  })

  // Learning Resources
  await prisma.learningResource.createMany({
    data: [
      {
        topicId: topic1_1.id,
        title: 'MIT 6.006: Breadth-First Search & Depth-First Search Foundations',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=s-CYnVz-uh4',
        durationMinutes: 48,
        author: 'Prof. Erik Demaine',
      },
      {
        topicId: topic1_2.id,
        title: 'Visualizing Single-Source Shortest Paths & Negative Cycles',
        type: 'PRACTICE',
        url: 'https://visualgo.net/en/sssp',
        durationMinutes: 30,
        author: 'VisuAlgo Team',
      },
      {
        topicId: topic1_2.id,
        title: 'Formal Proof of Greedy Choice in Dijkstra’s Algorithm',
        type: 'PDF',
        url: 'https://inst.eecs.berkeley.edu/~cs170/fa21/resources/notes/note7.pdf',
        durationMinutes: 25,
        author: 'UC Berkeley CS170',
      },
      {
        topicId: topic2_1.id,
        title: 'Dynamic Programming Patterns: 0/1 Knapsack Demystified',
        type: 'ARTICLE',
        url: 'https://web.stanford.edu/class/cs97si/04-dynamic-programming.pdf',
        durationMinutes: 35,
        author: 'Stanford CS97SI',
      },
    ],
  })

  console.log('🔔 Creating System Notifications & Audit Logs...')
  await prisma.notification.createMany({
    data: [
      {
        userId: facultyUser1.id,
        title: 'Pending Subjective Evaluation',
        message: '1 student submission in "Unit 1: Graph Invariants & Shortest Paths" is awaiting grading.',
        type: 'ASSESSMENT',
        linkUrl: '/faculty/evaluation',
      },
      {
        userId: facultyUser1.id,
        title: 'Critical Attendance Alert',
        message: 'Rahul Verma (23CS01) has dropped to 48.5% attendance in CS501.',
        type: 'RISK',
        linkUrl: '/faculty/academic-risk',
      },
      {
        userId: facultyUser1.id,
        title: 'Live Attendance Session Started',
        message: 'CS501 Section A attendance session is active with 1 checked in so far.',
        type: 'ATTENDANCE',
        linkUrl: '/faculty/attendance',
      },
    ],
  })

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: facultyUser1.id,
        actorRole: 'FACULTY',
        action: 'ASSESSMENT_PUBLISHED',
        entityType: 'Assessment',
        entityId: assessment1.id,
        newValue: 'PUBLISHED',
        reason: 'Unit 1 curriculum completion scheduled benchmark',
      },
      {
        actorId: facultyUser1.id,
        actorRole: 'FACULTY',
        action: 'INTERVENTION_CREATED',
        entityType: 'FacultyIntervention',
        entityId: riskRahul.id,
        newValue: 'PARENT_MEETING',
        reason: 'Attendance below 50% critical threshold',
      },
    ],
  })

  console.log('✅ Seed completed successfully! All relational entities initialized.')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
