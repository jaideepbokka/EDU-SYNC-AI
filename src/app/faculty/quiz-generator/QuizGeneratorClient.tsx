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
  HelpCircle,
  GraduationCap,
  Layers,
  Code2,
  Shuffle,
  AlertCircle,
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
  const [isRefreshingAll, setIsRefreshingAll] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [currentTopicMeta, setCurrentTopicMeta] = useState<any>(null)
  const [savingIndices, setSavingIndices] = useState<Record<number, boolean>>({})
  const [savedIndices, setSavedIndices] = useState<Record<number, boolean>>({})
  const [refreshingIndices, setRefreshingIndices] = useState<Record<number, boolean>>({})
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [statusNotification, setStatusNotification] = useState<string | null>(null)

  // Find currently selected topic object
  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0]

  const handleGenerate = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingAll(true)
    } else {
      setIsGenerating(true)
    }
    setSavedIndices({})
    setStatusNotification(null)

    try {
      const res = await fetch('/api/questions/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopicId,
          difficulty,
          count,
          bloomLevel,
          seedOffset: Math.floor(Math.random() * 100000) + Date.now(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions')

      setGeneratedQuestions(data.questions || [])
      setCurrentTopicMeta(data.topic)
      setStatusNotification(
        isRefresh
          ? `🔄 Refreshed ${data.questions.length} questions for ${data.topic?.subjectName || 'Curriculum'}`
          : `✨ Successfully synthesized ${data.questions.length} questions for ${data.topic?.subjectName || 'Curriculum'}`
      )
    } catch (err: any) {
      alert(err.message || 'Error generating questions')
    } finally {
      setIsGenerating(false)
      setIsRefreshingAll(false)
    }
  }

  // Single Question Refresh / Re-roll
  const handleRefreshSingleQuestion = async (index: number) => {
    setRefreshingIndices((prev) => ({ ...prev, [index]: true }))

    try {
      const res = await fetch('/api/questions/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopicId,
          difficulty,
          count: 1,
          bloomLevel,
          seedOffset: Math.floor(Math.random() * 50000) + (index + 1) * 1337 + Date.now(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to refresh question')

      if (data.questions && data.questions.length > 0) {
        const newQuestion = data.questions[0]
        setGeneratedQuestions((prev) => {
          const updated = [...prev]
          updated[index] = newQuestion
          return updated
        })
        // Reset saved status for this single re-rolled question
        setSavedIndices((prev) => ({ ...prev, [index]: false }))
      }
    } catch (err: any) {
      alert(err.message || 'Error refreshing question')
    } finally {
      setRefreshingIndices((prev) => ({ ...prev, [index]: false }))
    }
  }

  // Remove question from review list
  const handleDeleteFromList = (index: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, idx) => idx !== index))
    // Remap savedIndices
    setSavedIndices((prev) => {
      const updated: Record<number, boolean> = {}
      let newIdx = 0
      generatedQuestions.forEach((_, idx) => {
        if (idx !== index) {
          if (prev[idx]) updated[newIdx] = true
          newIdx++
        }
      })
      return updated
    })
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
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Subject Synthesis Engine & Question Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI Assessment Question Synthesizer
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Generate Bloom’s Taxonomy mapped examination questions tailored specifically to each subject (English, Python, Quantum Computing, DWDM, Mathematics) with instant refresh & rubrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/faculty/questions"
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 shadow-sm transition-all hover:scale-105 whitespace-nowrap"
          >
            Open Question Bank
          </Link>
        </div>
      </div>

      {/* Generator Controls Card */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EAF0] pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#292C32]">
            <Sliders className="w-4 h-4 text-[#8B6DE9]" />
            <span>Synthesis Parameters & Topic Alignment</span>
          </div>

          {activeTopic && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D9D1F5]/50 border border-[#D9D1F5] text-xs font-semibold text-[#625BEB]">
              <GraduationCap className="w-4 h-4 text-[#625BEB]" />
              <span>
                Subject: <strong className="font-bold">{activeTopic.unit?.subject?.name || activeTopic.unit?.subject?.code}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1.5">
              Target Curriculum Topic *
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 font-medium text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-white text-[#292C32]">
                  {t.unit?.subject?.code}: {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1.5">
              Difficulty Rigour
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 font-medium text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
            >
              <option value="EASY">EASY (Foundational Concepts)</option>
              <option value="MEDIUM">MEDIUM (Standard University Exam)</option>
              <option value="HARD">HARD (Advanced Application & Proofs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1.5">
              Bloom’s Taxonomy Target
            </label>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 font-medium text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
            >
              <option value="UNDERSTAND">Understand (Definitions & Concepts)</option>
              <option value="APPLY">Apply (Problem Solving & Analysis)</option>
              <option value="ANALYZE">Analyze (Mechanics & Edge Cases)</option>
              <option value="EVALUATE">Evaluate (Evaluation & Trade-offs)</option>
              <option value="CREATE">Create (Formulation & Synthesis)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1.5">
              Number of Questions
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 font-medium text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num} className="bg-white text-[#292C32]">
                  {num} {num === 1 ? 'Question' : 'Questions'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#85878F] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#8B6DE9]" />
            <span>
              Curriculum Unit: <strong className="text-[#292C32]">{activeTopic?.unit?.title || 'Active Unit'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {generatedQuestions.length > 0 && (
              <button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating || isRefreshingAll}
                className="px-5 py-3 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] text-xs font-bold border border-[#E9EAF0] transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 text-[#8B6DE9] ${isRefreshingAll ? 'animate-spin' : ''}`} />
                <span>{isRefreshingAll ? 'Refreshing Questions...' : 'Refresh All Questions'}</span>
              </button>
            )}

            <button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || isRefreshingAll}
              className="px-6 py-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing ({count} Questions)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {count} Questions with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Notification */}
      {statusNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#35C979] shrink-0" />
            <span>{statusNotification}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="text-emerald-600 hover:underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Generated Questions Review Section */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0]">
            <div>
              <h3 className="text-base font-bold text-[#292C32] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#35C979]" />
                <span>Synthesized Questions ({generatedQuestions.length})</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D9D1F5]/60 text-[#625BEB] font-semibold border border-[#D9D1F5]">
                  {Object.values(savedIndices).filter(Boolean).length} / {generatedQuestions.length} Approved
                </span>
              </h3>
              <p className="text-xs text-[#85878F] mt-1">
                Subject-aligned questions for <strong>{currentTopicMeta?.subjectName || activeTopic?.unit?.subject?.name || 'Selected Subject'}</strong>. Use the refresh buttons to re-roll questions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Refresh All */}
              <button
                onClick={() => handleGenerate(true)}
                disabled={isRefreshingAll || isGenerating}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2F3F5] text-[#292C32] font-bold text-xs border border-[#E9EAF0] shadow-xs transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Regenerate all questions with new AI variations"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#8B6DE9] ${isRefreshingAll ? 'animate-spin' : ''}`} />
                <span>{isRefreshingAll ? 'Refreshing...' : 'Refresh All'}</span>
              </button>

              {/* Bulk Approve All Button */}
              {generatedQuestions.some((_, idx) => !savedIndices[idx]) ? (
                <button
                  onClick={handleApproveAllIntoBank}
                  disabled={isSavingAll}
                  className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  {isSavingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Bank...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#35C979]" />
                      <span>
                        Approve All (
                        {generatedQuestions.filter((_, idx) => !savedIndices[idx]).length}
                        ) into Bank
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                  <Check className="w-4 h-4 text-[#35C979]" />
                  <span>All {generatedQuestions.length} Questions Saved in Bank</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {generatedQuestions.map((q, idx) => {
              const isSaving = savingIndices[idx]
              const isSaved = savedIndices[idx]
              const isRefreshing = refreshingIndices[idx]

              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4 transition-all hover:border-[#A99AE8]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9EAF0] pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-[#8B6DE9] text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#F2F3F5] text-[10px] font-bold uppercase text-[#292C32]">
                        {q.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#D9D1F5]/50 text-[10px] font-bold uppercase text-[#625BEB] border border-[#D9D1F5]">
                        Bloom: {q.bloomLevel || bloomLevel}
                      </span>
                      <StatusBadge status={q.difficulty || difficulty} />
                      <span className="text-[11px] font-bold text-[#85878F] ml-1">
                        {q.marks || 2} Marks
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Individual Question Refresh Button */}
                      <button
                        onClick={() => handleRefreshSingleQuestion(idx)}
                        disabled={isRefreshing || isSaving}
                        className="px-3 py-1.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] font-bold text-xs border border-[#E9EAF0] transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        title="Regenerate only this question"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-[#8B6DE9] ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Re-rolling...' : 'Refresh'}</span>
                      </button>

                      {/* Remove question */}
                      <button
                        onClick={() => handleDeleteFromList(idx)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-[#85878F] hover:text-rose-600 transition-colors"
                        title="Remove question from list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Approve into Question Bank */}
                      {isSaved ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          <Check className="w-4 h-4 text-[#35C979]" />
                          <span>Saved in Bank</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveIntoBank(q, idx)}
                          disabled={isSaving}
                          className="px-4 py-1.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Approve into Bank</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-[#292C32] leading-relaxed whitespace-pre-wrap">
                    {q.questionText}
                  </p>

                  {/* Code snippet display if present */}
                  {q.codeSnippet && (
                    <div className="p-3.5 rounded-xl bg-[#292C32] text-white font-mono text-xs overflow-x-auto border border-[#E9EAF0]">
                      <pre>{q.codeSnippet}</pre>
                    </div>
                  )}

                  {/* MCQ Options Display */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt: any, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                            opt.isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                              : 'bg-[#F2F3F5] border-[#E9EAF0] text-[#292C32]'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            opt.isCorrect
                              ? 'bg-[#35C979] text-white'
                              : 'bg-white text-[#292C32] border border-[#E9EAF0] shadow-xs'
                          }`}>
                            {opt.optionKey}
                          </span>
                          <span className="truncate">{opt.optionText}</span>
                          {opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-[#35C979] ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sample Answer for Short Answer / Coding */}
                  {q.sampleAnswer && (
                    <div className="p-3.5 rounded-xl bg-[#D9D1F5]/30 border border-[#D9D1F5] text-xs text-[#292C32]">
                      <strong className="text-[#625BEB] font-bold block mb-1">
                        Evaluation Rubric / Sample Answer:
                      </strong>
                      <span className="whitespace-pre-wrap">{q.sampleAnswer}</span>
                    </div>
                  )}

                  {/* Explanation & Proof */}
                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-xs text-[#85878F]">
                      <strong className="text-[#292C32] font-bold">Explanation & Proof: </strong>
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
