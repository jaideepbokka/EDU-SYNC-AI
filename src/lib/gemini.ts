export interface GeneratedQuestion {
  questionText: string
  type: 'MCQ' | 'MULTIPLE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'CODING'
  options: { optionKey: string; optionText: string; isCorrect: boolean }[]
  correctAnswer?: string
  sampleAnswer?: string
  explanation: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  marks: number
  bloomLevel: string
  codeSnippet?: string
}

export interface GeneratedLearningPath {
  title: string
  summary: string
  steps: {
    topicTitle: string
    description: string
    estimatedMinutes: number
    recommendedResourceType: 'VIDEO' | 'ARTICLE' | 'PRACTICE' | 'CODE'
    actionableTask: string
  }[]
}

type QuestionTemplate = Omit<GeneratedQuestion, 'difficulty' | 'marks' | 'bloomLevel'> & {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  bloomLevel?: string
  marks?: number
}

// =========================================================================
// 1. ENGLISH & COMMUNICATION QUESTION POOL
// =========================================================================
const ENGLISH_QUESTIONS: Record<string, QuestionTemplate[]> = {
  'parts of speech and tenses': [
    {
      questionText: 'Identify the part of speech of the capitalized word in the sentence: "The lead researcher presented a REMARKABLY innovative methodology."',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Adjective', isCorrect: false },
        { optionKey: 'B', optionText: 'Adverb of Degree', isCorrect: true },
        { optionKey: 'C', optionText: 'Abstract Noun', isCorrect: false },
        { optionKey: 'D', optionText: 'Participle', isCorrect: false },
      ],
      correctAnswer: 'B',
      explanation: '"Remarkably" modifies the adjective "innovative", indicating degree; hence, it functions as an adverb of degree.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'Which sentence correctly demonstrates the usage of the Present Perfect Tense?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Dr. Sharma has submitted the departmental report yesterday.', isCorrect: false },
        { optionKey: 'B', optionText: 'Dr. Sharma has already submitted the departmental report.', isCorrect: true },
        { optionKey: 'C', optionText: 'Dr. Sharma had submit the report on time.', isCorrect: false },
        { optionKey: 'D', optionText: 'Dr. Sharma is submitting the report since morning.', isCorrect: false },
      ],
      correctAnswer: 'B',
      explanation: 'The Present Perfect Tense ("has submitted") connects a past completed action to the present and cannot be used with specific past-time adverbs like "yesterday".',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'Select the sentence with correct Subject-Verb Agreement when using collective nouns and phrases:',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'The committee have decided to postpone the final examination.', isCorrect: false },
        { optionKey: 'B', optionText: 'The committee has unanimously decided to approve the new syllabus.', isCorrect: true },
        { optionKey: 'C', optionText: 'A bouquet of yellow roses were delivered to the faculty cabin.', isCorrect: false },
        { optionKey: 'D', optionText: 'Neither the professor nor the students was aware of the schedule change.', isCorrect: false },
      ],
      correctAnswer: 'B',
      explanation: 'When a collective noun acts as a unified entity ("unanimously"), it takes a singular verb ("has decided").',
      bloomLevel: 'ANALYZE',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'Convert the following Active Voice sentence into Passive Voice: "The department chairperson will inaugurate the international symposium tomorrow."',
      type: 'SHORT_ANSWER',
      options: [],
      sampleAnswer: 'The international symposium will be inaugurated by the department chairperson tomorrow.',
      explanation: 'Future simple passive structure: Object ("The international symposium") + "will be" + past participle ("inaugurated") + by-agent + time adverb.',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 3,
    },
    {
      questionText: 'Which modal verb expresses logical necessity or strong deduction in: "The laboratory lights are on; Dr. Anil ___ still be working."',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'must', isCorrect: true },
        { optionKey: 'B', optionText: 'might', isCorrect: false },
        { optionKey: 'C', optionText: 'shall', isCorrect: false },
        { optionKey: 'D', optionText: 'can', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: '"Must" expresses high certainty and logical deduction based on available visual evidence.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'True or False: In English grammar, a gerund and a present participle share the exact same suffix "-ing" but perform entirely distinct syntactic functions.',
      type: 'TRUE_FALSE',
      options: [
        { optionKey: 'A', optionText: 'True', isCorrect: true },
        { optionKey: 'B', optionText: 'False', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'A gerund functions as a noun (subject/object), whereas a present participle functions as a verb or modifier/adjective.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'Fill in the blank with the correct conditional structure: "If the temperature falls below zero degrees Celsius, water ___ into ice."',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'freezes', isCorrect: true },
        { optionKey: 'B', optionText: 'would freeze', isCorrect: false },
        { optionKey: 'C', optionText: 'would have frozen', isCorrect: false },
        { optionKey: 'D', optionText: 'frozen', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Zero conditional represents universal scientific facts using present simple in both the condition and the consequence.',
      bloomLevel: 'APPLY',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'Identify the tense in: "By next September, she will have been teaching computational linguistics for a decade."',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Future Perfect Continuous', isCorrect: true },
        { optionKey: 'B', optionText: 'Future Continuous', isCorrect: false },
        { optionKey: 'C', optionText: 'Present Perfect Continuous', isCorrect: false },
        { optionKey: 'D', optionText: 'Future Perfect Simple', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: '"Will have been + verb-ing" expresses an action that will continue up to a designated future milestone.',
      bloomLevel: 'ANALYZE',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'Explain the grammatical distinction between transitive and intransitive verbs, providing an illustrative example for each.',
      type: 'SHORT_ANSWER',
      options: [],
      sampleAnswer: 'A transitive verb requires a direct object to complete its meaning (e.g., "The student wrote a paper."). An intransitive verb does not take a direct object (e.g., "The bell rang loudly.").',
      explanation: 'Tests syntactic verb valency and clause construction.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'MEDIUM',
      marks: 4,
    },
    {
      questionText: 'Identify the error in the sentence: "Each of the participants were given a certificate of appreciation."',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '"were" should be replaced with "was"', isCorrect: true },
        { optionKey: 'B', optionText: '"given" should be replaced with "gave"', isCorrect: false },
        { optionKey: 'C', optionText: '"Each" should be replaced with "All of"', isCorrect: false },
        { optionKey: 'D', optionText: '"appreciation" should be "appreciations"', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'The indefinite pronoun "Each" is singular and governs a singular verb ("was given"), regardless of the intervening plural prepositional phrase ("of the participants").',
      bloomLevel: 'ANALYZE',
      difficulty: 'MEDIUM',
      marks: 2,
    },
  ],
  'sentence structure and error correction': [
    {
      questionText: 'Identify the syntactic error in: "Walking through the engineering campus, the newly constructed library building appeared magnificent."',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Dangling / Unattached Participial Modifier', isCorrect: true },
        { optionKey: 'B', optionText: 'Comma Splice', isCorrect: false },
        { optionKey: 'C', optionText: 'Tautology', isCorrect: false },
        { optionKey: 'D', optionText: 'Split Infinitive', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'The introductory participle "Walking..." improperly modifies the inanimate subject "the library building" rather than the person walking.',
      bloomLevel: 'ANALYZE',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'Which option correctly repairs the comma splice in: "The algorithms were efficient, they finished execution in linear time."',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'The algorithms were efficient; they finished execution in linear time.', isCorrect: true },
        { optionKey: 'B', optionText: 'The algorithms were efficient, so they finished execution in linear time.', isCorrect: false },
        { optionKey: 'C', optionText: 'The algorithms were efficient they finished execution in linear time.', isCorrect: false },
        { optionKey: 'D', optionText: 'The algorithms were efficient, whereas they finished execution.', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'A semicolon correctly joins two related independent clauses without coordinating conjunctions.',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'Choose the sentence demonstrating correct parallel structure:',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'The internship involves data extraction, cleaning datasets, and to visualize results.', isCorrect: false },
        { optionKey: 'B', optionText: 'The internship involves extracting data, cleaning datasets, and visualizing results.', isCorrect: true },
        { optionKey: 'C', optionText: 'The internship involves extract data, cleaning datasets, and visualization of results.', isCorrect: false },
        { optionKey: 'D', optionText: 'The internship involves extracting data, to clean datasets, and visualize results.', isCorrect: false },
      ],
      correctAnswer: 'B',
      explanation: 'All elements in the series follow the parallel gerund form ("extracting", "cleaning", "visualizing").',
      bloomLevel: 'APPLY',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'True or False: A run-on sentence occurs when two or more independent clauses are joined without adequate punctuation or coordinating conjunctions.',
      type: 'TRUE_FALSE',
      options: [
        { optionKey: 'A', optionText: 'True', isCorrect: true },
        { optionKey: 'B', optionText: 'False', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Run-on sentences (fused sentences) lack punctuation or connecting conjunctions between main clauses.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
  ],
  'fundamentals of communication': [
    {
      questionText: 'Which of the following represents a psychological barrier in the interpersonal communication process?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Cognitive bias, emotional distress, or selective perception', isCorrect: true },
        { optionKey: 'B', optionText: 'High ambient acoustic noise in a lecture auditorium', isCorrect: false },
        { optionKey: 'C', optionText: 'Network latency during a video conference', isCorrect: false },
        { optionKey: 'D', optionText: 'Hearing impairment', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Psychological barriers arise from internal mental states, biases, prejudices, and emotional disturbances that filter message interpretation.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'In business and academic communication, what does the 7 Cs principle of "Conciseness" mandate?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Expressing the full intended message in the fewest necessary words without sacrificing clarity', isCorrect: true },
        { optionKey: 'B', optionText: 'Omitting technical terminology completely', isCorrect: false },
        { optionKey: 'C', optionText: 'Using abbreviations for all proper nouns', isCorrect: false },
        { optionKey: 'D', optionText: 'Restricting all paragraphs to single-sentence statements', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Conciseness avoids wordiness and redundancy while preserving essential information and courteous tone.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'Explain the difference between Kinesics, Proxemics, and Paralanguage in non-verbal communication.',
      type: 'SHORT_ANSWER',
      options: [],
      sampleAnswer: '1. Kinesics: Study of body movement, gestures, posture, and facial expressions.\n2. Proxemics: Study of spatial distance and personal space orientation in social interactions.\n3. Paralanguage: Vocal elements accompanying speech (pitch, intonation, cadence, volume, pauses) that convey meaning without words.',
      explanation: 'Tests taxonomic mastery of non-verbal communication dimensions.',
      bloomLevel: 'ANALYZE',
      difficulty: 'HARD',
      marks: 5,
    },
  ],
  'resume and cover letter writing': [
    {
      questionText: 'Which action verb and structure provides the strongest impact for an ATS-optimized software engineering resume?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '"Architected and deployed microservices reducing API latency by 42% across 50,000 daily active users"', isCorrect: true },
        { optionKey: 'B', optionText: '"Was responsible for helping with backend development and database tasks"', isCorrect: false },
        { optionKey: 'C', optionText: '"Worked on some code with team members on daily basis"', isCorrect: false },
        { optionKey: 'D', optionText: '"Participated in programming meetings and discussed tech stacks"', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Strong resumes use active power verbs combined with quantifiable outcomes (metrics) demonstrating concrete technical impact.',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'True or False: A functional resume format is best suited for candidates with consistent, unbroken career progression in the same industry.',
      type: 'TRUE_FALSE',
      options: [
        { optionKey: 'A', optionText: 'True', isCorrect: false },
        { optionKey: 'B', optionText: 'False', isCorrect: true },
      ],
      correctAnswer: 'B',
      explanation: 'A chronological resume is standard for continuous progression, whereas a functional resume emphasizes skill sets and is used for career transitions or gaps.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'MEDIUM',
      marks: 2,
    },
  ],
}

// =========================================================================
// 2. PYTHON PROGRAMMING QUESTION POOL
// =========================================================================
const PYTHON_QUESTIONS: Record<string, QuestionTemplate[]> = {
  'variables, data types and operators': [
    {
      questionText: 'What is the output of `type(3 / 2)` versus `type(3 // 2)` in Python 3?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '<class "float"> and <class "int">', isCorrect: true },
        { optionKey: 'B', optionText: '<class "int"> and <class "int">', isCorrect: false },
        { optionKey: 'C', optionText: '<class "float"> and <class "float">', isCorrect: false },
        { optionKey: 'D', optionText: '<class "number"> and <class "int">', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'The true division operator `/` always yields a `float`, while floor division `//` discards fractional remainders and yields an `int`.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'Which Python data types are strictly immutable?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'int, float, str, tuple, frozenset', isCorrect: true },
        { optionKey: 'B', optionText: 'list, dict, set, bytearray', isCorrect: false },
        { optionKey: 'C', optionText: 'str, list, tuple, dict', isCorrect: false },
        { optionKey: 'D', optionText: 'tuple, set, list, int', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'In Python, primitive numbers, strings, tuples, and frozensets cannot be mutated in place; any modification creates a new object.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
  ],
  'lists and tuples': [
    {
      questionText: 'What is the value of `a` after executing:\n`a = [1, 2, 3]`\n`b = a`\n`b.append(4)`',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '[1, 2, 3, 4]', isCorrect: true },
        { optionKey: 'B', optionText: '[1, 2, 3]', isCorrect: false },
        { optionKey: 'C', optionText: 'Error: Cannot mutate referenced list', isCorrect: false },
        { optionKey: 'D', optionText: 'None', isCorrect: false },
      ],
      correctAnswer: 'A',
      codeSnippet: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)',
      explanation: 'Variables in Python hold object references. `b = a` assigns the same memory address, so mutating `b` mutates the list object referenced by `a`.',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'What is the output of the list slicing operation: `data = [10, 20, 30, 40, 50, 60]; print(data[::-2])`?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '[60, 40, 20]', isCorrect: true },
        { optionKey: 'B', optionText: '[10, 30, 50]', isCorrect: false },
        { optionKey: 'C', optionText: '[60, 50, 40]', isCorrect: false },
        { optionKey: 'D', optionText: '[50, 30, 10]', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'A step of -2 traverses the list in reverse order starting from the last element (60), skipping every other element (yielding 60, 40, 20).',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'Write a concise Python list comprehension that filters a list of strings `words` to include only strings with length >= 5, converted to uppercase.',
      type: 'CODING',
      options: [],
      codeSnippet: 'words = ["python", "ai", "algorithm", "code", "database"]\n# Expected: ["PYTHON", "ALGORITHM", "DATABASE"]',
      sampleAnswer: '[w.upper() for w in words if len(w) >= 5]',
      explanation: 'Applies transform `.upper()` and predicate filter `len(w) >= 5` inside list comprehension syntax.',
      bloomLevel: 'CREATE',
      difficulty: 'MEDIUM',
      marks: 4,
    },
  ],
  'dictionaries and sets': [
    {
      questionText: 'Why does attempting to use a Python list as a dictionary key raise a `TypeError: unhashable type: "list"`?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Lists are mutable, so their memory address and contents can change, making deterministic hash calculation impossible', isCorrect: true },
        { optionKey: 'B', optionText: 'Dictionary keys can only be strings', isCorrect: false },
        { optionKey: 'C', optionText: 'Lists exceed the 64-bit integer limit of hash buckets', isCorrect: false },
        { optionKey: 'D', optionText: 'Lists do not implement the `__eq__` method', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Dictionary hash tables require keys to implement an immutable `__hash__` method that remains invariant throughout the object lifetime.',
      bloomLevel: 'ANALYZE',
      difficulty: 'HARD',
      marks: 2,
    },
  ],
  'object-oriented programming': [
    {
      questionText: 'In Python OOP, what is the role of the `super().__init__()` call inside a subclass constructor?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Delegates initialization to parent class constructors following the Method Resolution Order (MRO)', isCorrect: true },
        { optionKey: 'B', optionText: 'Overwrites all subclass instance attributes with global variables', isCorrect: false },
        { optionKey: 'C', optionText: 'Compiles the Python class into C bytecode', isCorrect: false },
        { optionKey: 'D', optionText: 'Creates a static singleton instance', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: '`super()` dynamically resolves the parent class according to the C3 MRO and invokes its constructor to properly initialize inherited state.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'MEDIUM',
      marks: 2,
    },
  ],
}

// =========================================================================
// 3. QUANTUM COMPUTING QUESTION POOL
// =========================================================================
const QUANTUM_QUESTIONS: Record<string, QuestionTemplate[]> = {
  'qubits and superposition': [
    {
      questionText: 'Given the single-qubit state |ψ⟩ = (1/√2)|0⟩ + (i/√2)|1⟩, what is the probability of measuring the state in the computational basis |1⟩?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '0.5 (50%)', isCorrect: true },
        { optionKey: 'B', optionText: '1.0 (100%)', isCorrect: false },
        { optionKey: 'C', optionText: '0.25 (25%)', isCorrect: false },
        { optionKey: 'D', optionText: 'i/2', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'By the Born rule, P(|1⟩) = |β|^2 = |i/√2|^2 = (1/2) = 0.5.',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
    {
      questionText: 'Which physical principle prohibits creating an identical, independent copy of an unknown arbitrary quantum state?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'No-Cloning Theorem', isCorrect: true },
        { optionKey: 'B', optionText: 'Heisenberg Uncertainty Principle', isCorrect: false },
        { optionKey: 'C', optionText: 'Pauli Exclusion Principle', isCorrect: false },
        { optionKey: 'D', optionText: 'Bell Inequality', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'The No-Cloning Theorem proves that the linearity of quantum mechanics prevents unitary operations from copying unknown superposed quantum states.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
  ],
  'quantum gates': [
    {
      questionText: 'What is the matrix representation of the Pauli-X quantum logic gate?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '[[0, 1], [1, 0]]', isCorrect: true },
        { optionKey: 'B', optionText: '[[1, 0], [0, -1]]', isCorrect: false },
        { optionKey: 'C', optionText: '[[0, -i], [i, 0]]', isCorrect: false },
        { optionKey: 'D', optionText: '[[1, 0], [0, 1]]', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'The Pauli-X gate acts as a quantum NOT gate, flipping |0⟩ to |1⟩ and |1⟩ to |0⟩, represented by the matrix [[0, 1], [1, 0]].',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'Which 2-qubit entangling gate performs a NOT operation on the target qubit if and only if the control qubit is in state |1⟩?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'CNOT (Controlled-NOT / CX) Gate', isCorrect: true },
        { optionKey: 'B', optionText: 'Hadamard Gate', isCorrect: false },
        { optionKey: 'C', optionText: 'Toffoli Gate', isCorrect: false },
        { optionKey: 'D', optionText: 'Swap Gate', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'The CNOT gate is a fundamental 2-qubit entangling gate that flips the target qubit contingent on the control qubit state.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
  ],
}

// =========================================================================
// 4. DATA WAREHOUSING & DATA MINING (DWDM) QUESTION POOL
// =========================================================================
const DWDM_QUESTIONS: Record<string, QuestionTemplate[]> = {
  'introduction to data warehousing': [
    {
      questionText: 'What is the primary difference between OLTP (Online Transaction Processing) and OLAP (Online Analytical Processing)?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'OLTP is optimized for high-volume fast transactional writes (normalized); OLAP is optimized for complex historical analytical aggregation (denormalized multidimensional)', isCorrect: true },
        { optionKey: 'B', optionText: 'OLTP uses Star Schemas while OLAP uses 3NF', isCorrect: false },
        { optionKey: 'C', optionText: 'OLAP is solely used for real-time sensor streams', isCorrect: false },
        { optionKey: 'D', optionText: 'OLTP stores aggregated historical summaries only', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'OLTP handles day-to-day relational transactions with normalized schemas, while OLAP supports multi-dimensional decision analysis across aggregated data marts.',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
    {
      questionText: 'In OLAP cube operations, what operation transitions from a higher summary level to a more detailed granular view?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Drill-Down', isCorrect: true },
        { optionKey: 'B', optionText: 'Roll-Up', isCorrect: false },
        { optionKey: 'C', optionText: 'Slice', isCorrect: false },
        { optionKey: 'D', optionText: 'Pivot / Rotate', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Drill-down navigates from less detailed data to more granular data (e.g., from quarterly sales to monthly or daily transactions).',
      bloomLevel: 'UNDERSTAND',
      difficulty: 'EASY',
      marks: 2,
    },
  ],
  'association rule mining': [
    {
      questionText: 'If a database has 10,000 transactions, itemset {Laptop, Mouse} appears in 800 transactions, and {Laptop} appears in 1,000 transactions. What are the Support and Confidence of the rule Laptop => Mouse?',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Support = 8.0%, Confidence = 80.0%', isCorrect: true },
        { optionKey: 'B', optionText: 'Support = 10.0%, Confidence = 8.0%', isCorrect: false },
        { optionKey: 'C', optionText: 'Support = 80.0%, Confidence = 8.0%', isCorrect: false },
        { optionKey: 'D', optionText: 'Support = 0.8%, Confidence = 100.0%', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Support = 800 / 10,000 = 8.0%. Confidence = Support(Laptop ∪ Mouse) / Support(Laptop) = 800 / 1,000 = 80.0%.',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
  ],
}

// =========================================================================
// 5. MATHEMATICS & STATISTICS QUESTION POOL
// =========================================================================
const MATH_QUESTIONS: Record<string, QuestionTemplate[]> = {
  'limits and continuity': [
    {
      questionText: 'Compute the limit: lim(x -> 0) [(e^(2x) - 1) / x].',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '2', isCorrect: true },
        { optionKey: 'B', optionText: '1', isCorrect: false },
        { optionKey: 'C', optionText: '0', isCorrect: false },
        { optionKey: 'D', optionText: 'e^2', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Applying L’Hôpital’s rule to the 0/0 form: lim(x -> 0) [2e^(2x) / 1] = 2(1) = 2.',
      bloomLevel: 'APPLY',
      difficulty: 'EASY',
      marks: 2,
    },
  ],
  'differentiation': [
    {
      questionText: 'Find the derivative of f(x) = x^3 * ln(x) using the product rule.',
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: '3x^2 * ln(x) + x^2', isCorrect: true },
        { optionKey: 'B', optionText: '3x^2 / x', isCorrect: false },
        { optionKey: 'C', optionText: 'x^2 * ln(x)', isCorrect: false },
        { optionKey: 'D', optionText: '3x^2 * (1/x)', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'f\'(x) = (x^3)\' * ln(x) + x^3 * (ln x)\' = 3x^2 * ln(x) + x^3 * (1/x) = 3x^2 * ln(x) + x^2.',
      bloomLevel: 'APPLY',
      difficulty: 'MEDIUM',
      marks: 2,
    },
  ],
}

// -------------------------------------------------------------
// DYNAMIC PROCEDURAL GENERATOR FOR ANY SUBJECT & TOPIC
// -------------------------------------------------------------

function generateDynamicSubjectQuestions(params: {
  subjectName: string
  topicTitle: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  count: number
  bloomsLevel?: string
  seedOffset?: number
}): GeneratedQuestion[] {
  const { subjectName, topicTitle, difficulty, count, bloomsLevel } = params
  const seed = (params.seedOffset || 0) + Date.now()

  const topicKey = topicTitle.toLowerCase().trim()
  const subjectKey = subjectName.toLowerCase().trim()

  const candidatePool: QuestionTemplate[] = []

  // Domain search matching
  if (subjectKey.includes('english') || subjectKey.includes('communication') || subjectKey.includes('writing')) {
    for (const [key, qList] of Object.entries(ENGLISH_QUESTIONS)) {
      if (topicKey.includes(key) || key.includes(topicKey)) {
        candidatePool.push(...qList)
      }
    }
    if (candidatePool.length === 0) {
      candidatePool.push(...Object.values(ENGLISH_QUESTIONS).flat())
    }
  } else if (subjectKey.includes('python')) {
    for (const [key, qList] of Object.entries(PYTHON_QUESTIONS)) {
      if (topicKey.includes(key) || key.includes(topicKey)) {
        candidatePool.push(...qList)
      }
    }
    if (candidatePool.length === 0) {
      candidatePool.push(...Object.values(PYTHON_QUESTIONS).flat())
    }
  } else if (subjectKey.includes('quantum') || subjectKey.includes('qc')) {
    for (const [key, qList] of Object.entries(QUANTUM_QUESTIONS)) {
      if (topicKey.includes(key) || key.includes(topicKey)) {
        candidatePool.push(...qList)
      }
    }
    if (candidatePool.length === 0) {
      candidatePool.push(...Object.values(QUANTUM_QUESTIONS).flat())
    }
  } else if (subjectKey.includes('dwdm') || subjectKey.includes('warehouse') || subjectKey.includes('mining')) {
    for (const [key, qList] of Object.entries(DWDM_QUESTIONS)) {
      if (topicKey.includes(key) || key.includes(topicKey)) {
        candidatePool.push(...qList)
      }
    }
    if (candidatePool.length === 0) {
      candidatePool.push(...Object.values(DWDM_QUESTIONS).flat())
    }
  } else if (subjectKey.includes('math') || subjectKey.includes('calculus') || subjectKey.includes('statistics')) {
    for (const [key, qList] of Object.entries(MATH_QUESTIONS)) {
      if (topicKey.includes(key) || key.includes(topicKey)) {
        candidatePool.push(...qList)
      }
    }
    if (candidatePool.length === 0) {
      candidatePool.push(...Object.values(MATH_QUESTIONS).flat())
    }
  }

  // Procedural generation tailored to subject and topic
  const proceduralBank: GeneratedQuestion[] = [
    {
      questionText: `Which of the following principles forms the primary foundation of "${topicTitle}" within ${subjectName}?`,
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: `Systematic adherence to domain rules, invariant structures, and analytical models in ${topicTitle}`, isCorrect: true },
        { optionKey: 'B', optionText: `Arbitrary heuristic estimation without validation`, isCorrect: false },
        { optionKey: 'C', optionText: `Skipping foundational prerequisites and syntactic rules`, isCorrect: false },
        { optionKey: 'D', optionText: `Unverified empirical assumptions`, isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: `In ${subjectName}, "${topicTitle}" mandates systematic adherence to established foundational theorems and verifiable methodologies.`,
      difficulty,
      marks: 2,
      bloomLevel: bloomsLevel || 'UNDERSTAND',
    },
    {
      questionText: `When solving problems involving "${topicTitle}" (${subjectName}), what critical factor prevents errors and ensures valid outcomes?`,
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Strict verification of boundary conditions, axioms, and constraints', isCorrect: true },
        { optionKey: 'B', optionText: 'Ignoring edge cases and singular inputs', isCorrect: false },
        { optionKey: 'C', optionText: 'Relying exclusively on uncalibrated defaults', isCorrect: false },
        { optionKey: 'D', optionText: 'Treating distinct domain states as interchangeable', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: `Correct execution of ${topicTitle} requires boundary verification and consistency checks across all state transitions.`,
      difficulty,
      marks: 2,
      bloomLevel: bloomsLevel || 'ANALYZE',
    },
    {
      questionText: `True or False: In ${subjectName}, the rules and mechanisms governed by "${topicTitle}" must be applied systematically according to contextual constraints.`,
      type: 'TRUE_FALSE',
      options: [
        { optionKey: 'A', optionText: 'True', isCorrect: true },
        { optionKey: 'B', optionText: 'False', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: `Contextual constraints and structural rules in ${topicTitle} must be rigorously preserved to maintain integrity in ${subjectName}.`,
      difficulty,
      marks: 2,
      bloomLevel: bloomsLevel || 'UNDERSTAND',
    },
    {
      questionText: `Explain the core concepts, standard problem-solving techniques, and evaluation criteria for "${topicTitle}" in ${subjectName}.`,
      type: 'SHORT_ANSWER',
      options: [],
      sampleAnswer: `1. Core Definitions: Clarifies foundational terminology and relations in ${topicTitle}.\n2. Analytical Methodology: Applies structured rules and standard models.\n3. Evaluation Criteria: Verifies correctness against benchmarks and rubrics in ${subjectName}.`,
      explanation: `Comprehensive rubric assessing conceptual understanding and synthetic mastery of ${topicTitle}.`,
      difficulty,
      marks: 5,
      bloomLevel: bloomsLevel || 'CREATE',
    },
  ]

  // Format candidates from domain pool
  const formattedCandidates: GeneratedQuestion[] = candidatePool.map((q) => ({
    ...q,
    difficulty: q.difficulty || difficulty,
    marks: q.marks || 2,
    bloomLevel: q.bloomLevel || bloomsLevel || 'APPLY',
  }))

  // Seeded Fisher-Yates shuffle for domain candidates
  const shuffledCandidates = [...formattedCandidates]
  let currentSeed = seed
  for (let i = shuffledCandidates.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    const j = Math.floor((currentSeed / 233280) * (i + 1))
    const temp = shuffledCandidates[i]
    shuffledCandidates[i] = shuffledCandidates[j]
    shuffledCandidates[j] = temp
  }

  // Shuffle procedural items as backup
  const shuffledProcedural = [...proceduralBank]
  for (let i = shuffledProcedural.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    const j = Math.floor((currentSeed / 233280) * (i + 1))
    const temp = shuffledProcedural[i]
    shuffledProcedural[i] = shuffledProcedural[j]
    shuffledProcedural[j] = temp
  }

  const allAvailable = [...shuffledCandidates, ...shuffledProcedural]

  // Deduplicate and return requested count
  const seenTexts = new Set<string>()
  const result: GeneratedQuestion[] = []

  for (const q of allAvailable) {
    if (!seenTexts.has(q.questionText)) {
      seenTexts.add(q.questionText)
      result.push(q)
    }
    if (result.length >= count) break
  }

  // If still fewer than count, duplicate with variant tag
  while (result.length < count) {
    const base = proceduralBank[result.length % proceduralBank.length]
    result.push({
      ...base,
      questionText: `[Variant ${result.length + 1}] ${base.questionText}`,
    })
  }

  return result
}

// -------------------------------------------------------------
// CORE AI GENERATION ENGINE
// -------------------------------------------------------------

export async function generateAiQuiz(params: {
  subjectName: string
  topicTitle: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  count: number
  bloomsLevel?: string
  seedOffset?: number
}): Promise<GeneratedQuestion[]> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_AI_KEY

  if (apiKey) {
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']
    const promptSeed = `[Timestamp: ${Date.now()}-${Math.random().toString(36).substring(2, 9)}]`
    const prompt = `You are a distinguished university professor designing rigorous academic assessment questions for an undergraduate course.

SUBJECT: "${params.subjectName}"
CURRICULUM TOPIC: "${params.topicTitle}"
DIFFICULTY LEVEL: ${params.difficulty}
BLOOM'S TAXONOMY LEVEL: ${params.bloomsLevel || 'APPLY/ANALYZE'}
QUESTION COUNT: Exactly ${params.count} questions.
GENERATION NONCE: ${promptSeed}

CRITICAL REQUIREMENT:
- All questions MUST be strictly, authentically focused on "${params.topicTitle}" within the domain of "${params.subjectName}".
- If the subject is English, generate actual English grammar, syntax, communication, or literature questions.
- If Python, generate authentic Python syntax, data structure, and OOP questions.
- If Mathematics, generate real calculus/statistics problems.
- If Quantum Computing, generate authentic quantum mechanics/circuits/algorithm questions.
- Ensure every single question is unique, fresh, and newly generated.

Respond ONLY with a valid JSON array matching this exact schema:
[
  {
    "questionText": "Detailed question prompt",
    "type": "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "CODING",
    "options": [
      {"optionKey": "A", "optionText": "Option A text", "isCorrect": true},
      {"optionKey": "B", "optionText": "Option B text", "isCorrect": false},
      {"optionKey": "C", "optionText": "Option C text", "isCorrect": false},
      {"optionKey": "D", "optionText": "Option D text", "isCorrect": false}
    ],
    "correctAnswer": "A",
    "sampleAnswer": "Comprehensive rubric answer for evaluation",
    "explanation": "Why the correct answer is correct and others are incorrect",
    "difficulty": "${params.difficulty}",
    "marks": 2,
    "bloomLevel": "${params.bloomsLevel || 'APPLY'}",
    "codeSnippet": "optional code snippet if applicable"
  }
]
Do not wrap in markdown quotes if possible, output pure JSON.`

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.85,
                topP: 0.95,
                responseMimeType: 'application/json',
              },
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
            const parsed = JSON.parse(cleanJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.slice(0, params.count)
            }
          }
        }
      } catch (err) {
        console.warn(`Gemini API call with ${modelName} failed, trying next option:`, err)
      }
    }
  }

  // Dynamic subject-accurate procedural generator fallback
  return generateDynamicSubjectQuestions(params)
}

export async function generateAiLearningPath(params: {
  subjectName: string
  weakTopics: string[]
  currentAccuracy: number
  targetGoal: string
}): Promise<GeneratedLearningPath> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_AI_KEY

  if (apiKey) {
    try {
      const prompt = `You are an AI Academic Advisor at an accredited university.
Design an intensive remedial and mastery learning path for a student struggling with subject "${params.subjectName}".
Student identified weak topics: ${params.weakTopics.join(', ')}.
Current topic accuracy: ${params.currentAccuracy}%. Target goal: ${params.targetGoal}.

Output ONLY a valid JSON object matching this schema:
{
  "title": "Remedial Mastery Path: ${params.subjectName}",
  "summary": "Targeted remediation plan focusing on foundational prerequisites and progressive problem-solving.",
  "steps": [
    {
      "topicTitle": "Topic name",
      "description": "Specific conceptual focus and what to review",
      "estimatedMinutes": 45,
      "recommendedResourceType": "ARTICLE",
      "actionableTask": "Specific practice exercise to solidify understanding"
    }
  ]
}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
          const parsed = JSON.parse(cleanJson)
          if (parsed.steps && parsed.steps.length > 0) {
            return parsed
          }
        }
      }
    } catch (err) {
      console.warn('Gemini learning path call failed, using rule engine:', err)
    }
  }

  // Fallback high-quality learning path
  return {
    title: `Remedial Mastery Path: ${params.subjectName}`,
    summary: `Structured academic remediation plan for ${params.weakTopics.join(' & ')} to bridge foundational gaps in ${params.subjectName}.`,
    steps: params.weakTopics.map((topic, index) => ({
      topicTitle: topic,
      description: `Review fundamental core concepts, essential theorems, and common problem-solving edge cases in ${topic}.`,
      estimatedMinutes: 30 + index * 15,
      recommendedResourceType: index % 2 === 0 ? 'VIDEO' : 'PRACTICE',
      actionableTask: `Solve 3 targeted benchmark exercises on ${topic} and review solution rubrics.`,
    })),
  }
}
