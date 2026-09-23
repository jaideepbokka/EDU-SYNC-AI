'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sliders,
  Check,
  Edit3,
  Trash2,
} from 'lucide-react'

interface QuizGeneratorClientProps {
  topics: any[]
}

export function QuizGeneratorClient({ topics }: QuizGeneratorClientProps) {
  const router = useRouter()
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || '')
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [count, setCount] = useState(10)
  const [bloomLevel, setBloomLevel] = useState('ANALYZE')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [savingIndices, setSavingIndices] = useState<Record<number, boolean>>({})
  const [savedIndices, setSavedIndices] = useState<Record<number, boolean>>({})
  const [isSavingAll, setIsSavingAll] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGeneratedQuestions([])
    setSavedIndices({})

    try {
      const res = await fetch('/api/questions/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopicId,
          difficulty,
          count,
          bloomLevel,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions')

      setGeneratedQuestions(data.questions)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApproveIntoBank = async (q: any, index: number) => {
    setSavingIndices((prev) => ({ ...prev, [index]: true }))

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopicId,
          type: q.type || 'MCQ',
          questionText: q.questionText,
          explanation: q.explanation,
          difficulty: q.difficulty || difficulty,
          marks: q.marks || 2,
          bloomLevel: q.bloomLevel || bloomLevel,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          sampleAnswer: q.sampleAnswer,
          codeSnippet: q.codeSnippet,
        }),
      })

      if (!res.ok) throw new Error('Failed to approve question')

      setSavedIndices((prev) => ({ ...prev, [index]: true }))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSavingIndices((prev) => ({ ...prev, [index]: false }))
    }
  }

  const handleApproveAllIntoBank = async () => {
    const unapproved = generatedQuestions
      .map((q, idx) => ({ q, idx }))
      .filter(({ idx }) => !savedIndices[idx])

    if (unapproved.length === 0) return

    setIsSavingAll(true)
    try {
      const payload = unapproved.map(({ q }) => ({
        topicId: selectedTopicId,
        type: q.type || 'MCQ',
        questionText: q.questionText,
        explanation: q.explanation,
        difficulty: q.difficulty || difficulty,
        marks: q.marks || 2,
        bloomLevel: q.bloomLevel || bloomLevel,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        sampleAnswer: q.sampleAnswer,
        codeSnippet: q.codeSnippet,
      }))

      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: payload }),
      })

      if (!res.ok) throw new Error('Failed to approve questions into bank')

      const newSaved: Record<number, boolean> = { ...savedIndices }
      unapproved.forEach(({ idx }) => {
        newSaved[idx] = true
      })
      setSavedIndices(newSaved)
    } catch (err: any) {
      alert(err.message || 'Failed to approve questions into bank')
    } finally {
      setIsSavingAll(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-800/60 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Gemini Model Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI Assessment Question Synthesizer
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Generate Bloom’s Taxonomy mapped examination questions with instant mathematical & conceptual rubrics. Faculty always retain human-in-the-loop approval before items enter the bank.
          </p>
        </div>

        <Link
          href="/faculty/questions"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 whitespace-nowrap"
        >
          Open Question Bank
        </Link>
      </div>

      {/* Generator Controls Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Synthesis Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Curriculum Topic *
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.unit.subject.code}: {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Difficulty Rigour
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium"
            >
              <option value="EASY">EASY (Foundational Invariants)</option>
              <option value="MEDIUM">MEDIUM (Standard University Exam)</option>
              <option value="HARD">HARD (Competitive / Advanced Proofs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bloom’s Taxonomy Target
            </label>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium"
            >
              <option value="UNDERSTAND">Understand (Explanations)</option>
              <option value="APPLY">Apply (Problem Solving)</option>
              <option value="ANALYZE">Analyze (Complexity & Edge Cases)</option>
              <option value="EVALUATE">Evaluate (Trade-off Justifications)</option>
              <option value="CREATE">Create (Algorithmic Construction)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Number of Questions
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Question' : 'Questions'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Academic Assessment ({count} Questions)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {count} Questions with Gemini AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Questions Review Section */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Synthesized Questions ({generatedQuestions.length})</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {Object.values(savedIndices).filter(Boolean).length} / {generatedQuestions.length} Approved
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review and approve questions individually or approve all {generatedQuestions.length} into your Question Bank at once.
              </p>
            </div>

            {/* Bulk Approve All Button */}
            {generatedQuestions.some((_, idx) => !savedIndices[idx]) ? (
              <button
                onClick={handleApproveAllIntoBank}
                disabled={isSavingAll}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {isSavingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Adding to Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Approve All (
                      {generatedQuestions.filter((_, idx) => !savedIndices[idx]).length}
                      ) into Bank
                    </span>
                  </>
                )}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                <Check className="w-4 h-4" />
                <span>All {generatedQuestions.length} Questions Saved in Bank</span>
              </span>
            )}
          </div>

          <div className="space-y-5">
            {generatedQuestions.map((q, idx) => {
              const isSaving = savingIndices[idx]
              const isSaved = savedIndices[idx]

              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/60 p-6 shadow-md space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300">
                        {q.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400">
                        Bloom: {q.bloomLevel}
                      </span>
                      <StatusBadge status={q.difficulty} />
                    </div>

                    <div>
                      {isSaved ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-xs border border-emerald-200">
                          <Check className="w-4 h-4" />
                          <span>Approved & Saved to Bank</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveIntoBank(q, idx)}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Approve into Question Bank</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* MCQ Options Display */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt: any, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                            opt.isCorrect
                              ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-white dark:bg-slate-700 shadow-xs shrink-0">
                            {opt.optionKey}
                          </span>
                          <span className="truncate">{opt.optionText}</span>
                          {opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sample Answer / Explanation */}
                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">Explanation & Proof: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
