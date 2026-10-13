import { prisma } from '../src/lib/prisma'

async function seedMissingTopics() {
  console.log('--- Seeding Units & Topics for DBMS, CD, OS, CN ---')

  const subjects = await prisma.subject.findMany()
  const subjectMap = new Map(subjects.map((s) => [s.code.toUpperCase(), s.id]))

  const curriculumData = [
    {
      code: 'DBMS',
      units: [
        {
          unitNumber: 1,
          title: 'Relational Model & Database Design',
          topics: [
            { topicNumber: 1, title: 'ER Modeling, Entities & Constraints' },
            { topicNumber: 2, title: 'Relational Algebra & Tuple Calculus' },
            { topicNumber: 3, title: 'Functional Dependencies & Normalization (1NF, 2NF, 3NF, BCNF)' },
          ],
        },
        {
          unitNumber: 2,
          title: 'Transaction Management & Concurrency',
          topics: [
            { topicNumber: 1, title: 'ACID Properties, Schedules & Serializability' },
            { topicNumber: 2, title: 'Lock-based Protocols & Two-Phase Locking (2PL)' },
            { topicNumber: 3, title: 'Deadlock Detection, Prevention & WAL Recovery' },
          ],
        },
        {
          unitNumber: 3,
          title: 'Storage, Indexing & Query Processing',
          topics: [
            { topicNumber: 1, title: 'File Organization & B+ Tree Indexing' },
            { topicNumber: 2, title: 'Query Optimization, Cost Estimation & Joins' },
            { topicNumber: 3, title: 'Distributed Databases & NoSQL Architecture' },
          ],
        },
      ],
    },
    {
      code: 'CD',
      units: [
        {
          unitNumber: 1,
          title: 'Lexical Analysis & Syntax Analysis',
          topics: [
            { topicNumber: 1, title: 'Lexical Analyzer Generator & Finite Automata' },
            { topicNumber: 2, title: 'Top-Down Parsing & LL(1) Grammars' },
            { topicNumber: 3, title: 'Bottom-Up Parsing: SLR, CLR, and LALR Parsers' },
          ],
        },
        {
          unitNumber: 2,
          title: 'Semantic Analysis & Intermediate Code Generation',
          topics: [
            { topicNumber: 1, title: 'Syntax Directed Definitions & Translation Schemes' },
            { topicNumber: 2, title: 'Symbol Table Management & Type Checking' },
            { topicNumber: 3, title: 'Three-Address Code & Quadruple Generation' },
          ],
        },
        {
          unitNumber: 3,
          title: 'Code Optimization & Code Generation',
          topics: [
            { topicNumber: 1, title: 'Basic Blocks, Flow Graphs & Loop Optimization' },
            { topicNumber: 2, title: 'Data Flow Analysis & Common Subexpression Elimination' },
            { topicNumber: 3, title: 'Target Machine Architecture & Register Allocation' },
          ],
        },
      ],
    },
    {
      code: 'OS',
      units: [
        {
          unitNumber: 1,
          title: 'Process Management & CPU Scheduling',
          topics: [
            { topicNumber: 1, title: 'Process States, PCB & Context Switching' },
            { topicNumber: 2, title: 'Preemptive & Non-preemptive CPU Scheduling' },
            { topicNumber: 3, title: 'Inter-Process Communication & Thread Models' },
          ],
        },
        {
          unitNumber: 2,
          title: 'Synchronization & Deadlocks',
          topics: [
            { topicNumber: 1, title: 'Critical Section Problem, Mutex & Semaphores' },
            { topicNumber: 2, title: 'Classical IPC Problems (Dining Philosophers, Readers-Writers)' },
            { topicNumber: 3, title: 'Banker’s Algorithm & Deadlock Recovery' },
          ],
        },
        {
          unitNumber: 3,
          title: 'Memory Management & Virtual Memory',
          topics: [
            { topicNumber: 1, title: 'Contiguous Allocation, Paging & Segmentation' },
            { topicNumber: 2, title: 'Virtual Memory, Page Faults & LRU/FIFO Replacement' },
            { topicNumber: 3, title: 'Disk Scheduling (SCAN, C-SCAN) & File Systems' },
          ],
        },
      ],
    },
    {
      code: 'CN',
      units: [
        {
          unitNumber: 1,
          title: 'Physical & Data Link Layers',
          topics: [
            { topicNumber: 1, title: 'OSI Reference Model vs TCP/IP Protocol Suite' },
            { topicNumber: 2, title: 'Framing, Error Detection (CRC) & Hamming Code' },
            { topicNumber: 3, title: 'Sliding Window Protocols (Go-Back-N, Selective Repeat)' },
          ],
        },
        {
          unitNumber: 2,
          title: 'Network Layer & Routing Protocols',
          topics: [
            { topicNumber: 1, title: 'IPv4 Classless Addressing (CIDR) & Subnetting' },
            { topicNumber: 2, title: 'Distance Vector (RIP) & Link State (OSPF) Routing' },
            { topicNumber: 3, title: 'BGP Protocol, NAT, ARP & ICMP Control' },
          ],
        },
        {
          unitNumber: 3,
          title: 'Transport & Application Layers',
          topics: [
            { topicNumber: 1, title: 'TCP Connection Management & 3-Way Handshake' },
            { topicNumber: 2, title: 'TCP Congestion Control (Slow Start, Tahoe, Reno)' },
            { topicNumber: 3, title: 'Application Protocols: DNS, HTTP/2, TLS & SMTP' },
          ],
        },
      ],
    },
  ]

  for (const item of curriculumData) {
    const subjectId = subjectMap.get(item.code)
    if (!subjectId) {
      console.warn(`Subject ${item.code} not found in DB!`)
      continue
    }

    console.log(`Processing ${item.code}...`)
    for (const u of item.units) {
      const unit = await prisma.unit.upsert({
        where: {
          subjectId_unitNumber: {
            subjectId,
            unitNumber: u.unitNumber,
          },
        },
        update: {
          title: u.title,
        },
        create: {
          subjectId,
          unitNumber: u.unitNumber,
          title: u.title,
          description: `Core academic syllabus for ${item.code} Unit ${u.unitNumber}`,
        },
      })

      for (const t of u.topics) {
        await prisma.topic.upsert({
          where: {
            unitId_topicNumber: {
              unitId: unit.id,
              topicNumber: t.topicNumber,
            },
          },
          update: {
            title: t.title,
          },
          create: {
            unitId: unit.id,
            topicNumber: t.topicNumber,
            title: t.title,
            description: `Key conceptual focus: ${t.title}`,
            difficulty: 'MEDIUM',
            estimatedHours: 4.0,
          },
        })
      }
    }
    console.log(`✓ Seeded ${item.code} units & topics.`)
  }

  console.log('All missing units and topics have been successfully seeded!')
}

seedMissingTopics()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
