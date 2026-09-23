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

export async function generateAiQuiz(params: {
  subjectName: string
  topicTitle: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  count: number
  bloomsLevel?: string
}): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const prompt = `You are a university professor designing rigorous academic assessment questions.
Generate exactly ${params.count} questions for the subject "${params.subjectName}" on the topic "${params.topicTitle}".
Difficulty level: ${params.difficulty}. Bloom's Taxonomy: ${params.bloomsLevel || 'Apply/Analyze'}.

Respond ONLY with a valid JSON array containing objects matching this schema:
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to academic rules engine:', err)
    }
  }

  // Domain-rich fallback questions tailored for university engineering curricula
  return generateFallbackQuestions(params)
}

export async function generateAiLearningPath(params: {
  subjectName: string
  weakTopics: string[]
  currentAccuracy: number
  targetGoal: string
}): Promise<GeneratedLearningPath> {
  const apiKey = process.env.GEMINI_API_KEY

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
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
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
    summary: `Structured academic remediation plan for ${params.weakTopics.join(' & ')} to bridge foundational gaps.`,
    steps: params.weakTopics.map((topic, index) => ({
      topicTitle: topic,
      description: `Review fundamental core theorems, algorithmic invariants, and common edge cases in ${topic}.`,
      estimatedMinutes: 30 + index * 15,
      recommendedResourceType: index % 2 === 0 ? 'VIDEO' : 'PRACTICE',
      actionableTask: `Solve 3 targeted benchmark problems on ${topic} and submit for faculty review.`,
    })),
  }
}

function generateFallbackQuestions(params: {
  subjectName: string
  topicTitle: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  count: number
}): GeneratedQuestion[] {
  const templates: GeneratedQuestion[] = [
    {
      questionText: `In the context of ${params.topicTitle} (${params.subjectName}), what is the primary algorithmic time complexity constraint under worst-case input scenarios?`,
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'O(log n) logarithmic scaling', isCorrect: false },
        { optionKey: 'B', optionText: 'O(n) linear scanning', isCorrect: false },
        { optionKey: 'C', optionText: 'O(n log n) divide-and-conquer upper bound', isCorrect: true },
        { optionKey: 'D', optionText: 'O(n^2) quadratic nested iteration', isCorrect: false },
      ],
      correctAnswer: 'C',
      explanation:
        'Standard optimal divide-and-conquer solutions satisfy T(n) = 2T(n/2) + O(n), which resolves to O(n log n) by the Master Theorem Case 2.',
      difficulty: params.difficulty,
      marks: 2,
      bloomLevel: 'ANALYZE',
    },
    {
      questionText: `Which of the following invariants MUST hold true during the execution phase in ${params.topicTitle}?`,
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Subproblem optimal substructure must remain independent of state memoization', isCorrect: false },
        { optionKey: 'B', optionText: 'Structural integrity and cycle avoidance must be maintained across all state transitions', isCorrect: true },
        { optionKey: 'C', optionText: 'Memory overhead cannot exceed constant auxiliary space O(1)', isCorrect: false },
        { optionKey: 'D', optionText: 'Every recursive stack frame must terminate within constant operations', isCorrect: false },
      ],
      correctAnswer: 'B',
      explanation:
        'State transitions require acyclic progression to prevent infinite recurrence and ensure strict correctness across all subgraphs.',
      difficulty: params.difficulty,
      marks: 2,
      bloomLevel: 'APPLY',
    },
    {
      questionText: `True or False: In ${params.topicTitle}, a greedy heuristic will ALWAYS converge to the global optimum regardless of matroid properties.`,
      type: 'TRUE_FALSE',
      options: [
        { optionKey: 'A', optionText: 'True', isCorrect: false },
        { optionKey: 'B', optionText: 'False', isCorrect: true },
      ],
      correctAnswer: 'B',
      explanation:
        'Greedy algorithms only guarantee a global optimum when the problem exhibits the greedy-choice property and optimal substructure (e.g. Matroid theory). Without these, greedy choices often trap the search in local optima.',
      difficulty: params.difficulty,
      marks: 2,
      bloomLevel: 'EVALUATE',
    },
    {
      questionText: `Explain how cache locality and memory hierarchy affect real-world throughput in ${params.topicTitle}, contrasting contiguous vs node-based representations.`,
      type: 'SHORT_ANSWER',
      options: [],
      sampleAnswer:
        'Contiguous representations (e.g., arrays, flat buffers) maximize spatial and temporal CPU cache line utilization, minimizing L1/L2 cache misses. In contrast, node-based pointer-chasing structures suffer from cache thrashing and pointer indirection overhead.',
      explanation: 'Evaluates Bloom Level: Understand & Evaluate hardware-software co-design.',
      difficulty: params.difficulty,
      marks: 5,
      bloomLevel: 'EVALUATE',
    },
    {
      questionText: `Given a set of elements under ${params.topicTitle}, implement or identify the critical termination condition to avoid stack overflow under edge-case degeneracies:`,
      type: 'CODING',
      options: [],
      codeSnippet: `function solve(elements: number[]): number {\n  if (elements.length <= 1) return elements[0] ?? 0;\n  // Critical invariant check\n  const pivot = elements[Math.floor(elements.length / 2)];\n  return partitionAndRecurse(elements, pivot);\n}`,
      sampleAnswer: 'Base case must handle elements.length <= 1 and handle duplicate pivot values to prevent infinite partitioning.',
      explanation: 'Tests defensive programming and boundary case handling.',
      difficulty: params.difficulty,
      marks: 5,
      bloomLevel: 'CREATE',
    },
    {
      questionText: `When designing high-throughput systems utilizing ${params.topicTitle}, which concurrency or synchronization pattern minimizes contention while preserving correctness?`,
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Coarse-grained global locking', isCorrect: false },
        { optionKey: 'B', optionText: 'Optimistic lock-free atomic compare-and-swap (CAS)', isCorrect: true },
        { optionKey: 'C', optionText: 'Spinlocks with busy-waiting loops', isCorrect: false },
        { optionKey: 'D', optionText: 'Sequential unpipelined barrier synchronization', isCorrect: false },
      ],
      correctAnswer: 'B',
      explanation: `Lock-free and fine-grained schemes with CAS prevent convoying and thread starvation under heavy concurrent workloads in ${params.subjectName}.`,
      difficulty: params.difficulty,
      marks: 2,
      bloomLevel: 'ANALYZE',
    },
    {
      questionText: `In ${params.topicTitle}, what is the consequence of violating the principle of idempotency or deterministic state initialization?`,
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Re-entrant execution leads to inconsistent state divergence or cascade failures', isCorrect: true },
        { optionKey: 'B', optionText: 'Compile-time syntax errors are automatically raised', isCorrect: false },
        { optionKey: 'C', optionText: 'Asymptotic runtime is reduced by half', isCorrect: false },
        { optionKey: 'D', optionText: 'Memory overhead becomes strictly zero', isCorrect: false },
      ],
      correctAnswer: 'A',
      explanation: 'Non-idempotent operations cause divergent mutations upon retry or concurrent replay, breaking reproducible execution.',
      difficulty: params.difficulty,
      marks: 2,
      bloomLevel: 'UNDERSTAND',
    },
    {
      questionText: `True or False: Under ${params.topicTitle}, amortized complexity analysis guarantees that EVERY individual operation will strictly finish within the stated bound.`,
      type: 'TRUE_FALSE',
      options: [
        { optionKey: 'A', optionText: 'True', isCorrect: false },
        { optionKey: 'B', optionText: 'False', isCorrect: true },
      ],
      correctAnswer: 'B',
      explanation: 'Amortized bounds average time over a sequence of N operations. Occasional individual operations may be significantly more expensive (e.g., dynamic array resizing).',
      difficulty: params.difficulty,
      marks: 2,
      bloomLevel: 'EVALUATE',
    },
    {
      questionText: `Which evaluation metric or statistical criterion provides the most robust assessment of performance in ${params.topicTitle} when dealing with skewed or non-uniform data distributions?`,
      type: 'MCQ',
      options: [
        { optionKey: 'A', optionText: 'Arithmetic Mean only', isCorrect: false },
        { optionKey: 'B', optionText: 'Median, Interquartile Range (IQR), and Percentile latencies (P99)', isCorrect: true },
        { optionKey: 'C', optionText: 'Raw maximum sample value alone', isCorrect: false },
        { optionKey: 'D', optionText: 'Range (Max - Min)', isCorrect: false },
      ],
      correctAnswer: 'B',
      explanation: 'Skewed distributions require non-parametric measures like Median and 99th percentile (P99) tail latency to accurately reflect operational behavior.',
      difficulty: params.difficulty,
      marks: 2,
      bloomLevel: 'APPLY',
    },
    {
      questionText: `Describe the end-to-end operational pipeline for ${params.topicTitle} in ${params.subjectName}, detailing preprocessing, core execution, validation, and error recovery.`,
      type: 'SHORT_ANSWER',
      options: [],
      sampleAnswer: `1. Ingestion & Preprocessing: Validate inputs, format schema, normalize values.\n2. Core Execution: Execute primary transformation/algorithm with state monitoring.\n3. Validation: Verify mathematical/structural invariants and post-conditions.\n4. Recovery: Handle edge cases gracefully through fallback or rollback mechanisms.`,
      explanation: 'Comprehensive architectural evaluation measuring synthetic mastery of the complete pipeline.',
      difficulty: params.difficulty,
      marks: 5,
      bloomLevel: 'CREATE',
    },
  ]

  // Return requested count (up to available templates)
  return templates.slice(0, Math.min(params.count, templates.length))
}
