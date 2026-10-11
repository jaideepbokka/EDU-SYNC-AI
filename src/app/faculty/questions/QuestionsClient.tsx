'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import { StatusBadge } from '@/components/StatusBadge'
import {
  FileQuestion,
  Plus,
  Sparkles,
  Filter,
  CheckCircle2,
  Code,
  Layers,
  Award,
  BookOpen,
  Trash2,
  Check,
} from 'lucide-react'

interface QuestionsClientProps {
  questions: any[]
  topics: any[]
}

export function QuestionsClient({ questions: initialQuestions, topics }: QuestionsClientProps) {
  const router = useRouter()
  const [questionList, setQuestionList] = useState<any[]>(initialQuestions)
  const [selectedTopic, setSelectedTopic] = useState('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setQuestionList(initialQuestions)
  }, [initialQuestions])

  // Form State
  const [formData, setFormData] = useState({
    topicId: topics[0]?.id || '',
    type: 'MCQ',
    questionText: '',
    explanation: '',
    difficulty: 'MEDIUM',
    marks: 2,
    bloomLevel: 'APPLY',
    options: [
      { optionKey: 'A', optionText: '', isCorrect: true },
      { optionKey: 'B', optionText: '', isCorrect: false },
      { optionKey: 'C', optionText: '', isCorrect: false },
      { optionKey: 'D', optionText: '', isCorrect: false },
    ],
    correctAnswer: 'True',
    sampleAnswer: '',
  })

  const filteredQuestions = questionList.filter((q) => {
    if (selectedTopic !== 'ALL' && q.topicId !== selectedTopic) return false
    if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false
    if (selectedType !== 'ALL' && q.type !== selectedType) return false
    return true
  })

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create question')

      setIsModalOpen(false)
      setFormData({
        topicId: topics[0]?.id || '',
        type: 'MCQ',
        questionText: '',
        explanation: '',
        difficulty: 'MEDIUM',
        marks: 2,
        bloomLevel: 'APPLY',
        options: [
          { optionKey: 'A', optionText: '', isCorrect: true },
          { optionKey: 'B', optionText: '', isCorrect: false },
          { optionKey: 'C', optionText: '', isCorrect: false },
          { optionKey: 'D', optionText: '', isCorrect: false },
        ],
        correctAnswer: 'True',
        sampleAnswer: '',
      })
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (id: string, text: string) => {
    const preview = text.length > 70 ? text.substring(0, 70) + '...' : text
    const isConfirmed = confirm(
      `Are you sure you want to delete this question from the Question Bank?\n\n"${preview}"`
    )
    if (!isConfirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/questions?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete question')

      setQuestionList((prev) => prev.filter((q) => q.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete question')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Curated Bloom’s Taxonomies & Evaluation Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <FileQuestion className="w-7 h-7 text-white" />
            <span>Question Bank Repository</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Curated Bloom’s-aligned question items across MCQs, True/False, Short Answer rubrics, and Coding problems. Delete or manage items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/faculty/quiz-generator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all hover:scale-105 shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>AI Quiz Generator</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Question</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-3xl bg-white border border-[#E9EAF0] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#292C32] pl-2">
          <Filter className="w-4 h-4 text-[#8B6DE9]" />
          <span>Filters:</span>
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="text-xs font-medium rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
        >
          <option value="ALL">All Topics ({questionList.length})</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id} className="bg-white text-[#292C32]">
              {t.title}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 bg-[#F2F3F5] border border-[#E9EAF0] p-1 rounded-xl">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-[#292C32] text-white font-bold shadow-xs'
                  : 'text-[#85878F] hover:text-[#292C32]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-[#F2F3F5] border border-[#E9EAF0] p-1 rounded-xl overflow-x-auto">
          {['ALL', 'MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'CODING'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-[#292C32] text-white font-bold shadow-xs'
                  : 'text-[#85878F] hover:text-[#292C32]'
              }`}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs font-semibold text-[#85878F] pr-2">
          Showing <strong>{filteredQuestions.length}</strong> questions
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4 hover:border-[#A99AE8] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9EAF0] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-[#8B6DE9] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F2F3F5] text-[10px] font-bold uppercase text-[#292C32]">
                    {q.type.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#D9D1F5]/50 text-[#625BEB] border border-[#D9D1F5] text-[10px] font-bold uppercase">
                    Bloom: {q.bloomLevel}
                  </span>
                  <StatusBadge status={q.difficulty} />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-[#292C32] px-2.5 py-1 rounded-full bg-[#F2F3F5]">
                    {q.marks} Marks
                  </span>
                  <span className="text-[#8B6DE9] font-medium text-xs hidden sm:inline">
                    {q.topic?.title}
                  </span>

                  {/* Delete Option */}
                  <button
                    onClick={() => handleDeleteQuestion(q.id, q.questionText)}
                    disabled={deletingId === q.id}
                    title="Delete question from repository"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === q.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-[#292C32] leading-relaxed">
                {q.questionText}
              </p>

              {/* Code snippet if present */}
              {q.codeSnippet && (
                <div className="p-3.5 rounded-xl bg-[#292C32] text-white font-mono text-xs overflow-x-auto border border-[#E9EAF0]">
                  <pre>{q.codeSnippet}</pre>
                </div>
              )}

              {/* Options Preview for MCQs */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
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
                      {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-[#35C979] ml-auto shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Answer / Explanation */}
              {q.explanation && (
                <div className="p-3.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-xs text-[#85878F]">
                  <strong className="text-[#292C32] font-bold">Explanation & Proof: </strong>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#E9EAF0] space-y-3">
            <FileQuestion className="w-10 h-10 text-[#85878F] mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#292C32]">No questions match current filter criteria.</p>
            <p className="text-xs text-[#85878F]">
              Try selecting &quot;All Topics&quot; or click &quot;+ Add Question&quot; to expand the question bank.
            </p>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Question to Question Bank"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Topic *
              </label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white text-[#292C32]">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              >
                <option value="MCQ" className="bg-white text-[#292C32]">Multiple Choice (MCQ)</option>
                <option value="TRUE_FALSE" className="bg-white text-[#292C32]">True / False</option>
                <option value="SHORT_ANSWER" className="bg-white text-[#292C32]">Short Answer / Subjective</option>
                <option value="CODING" className="bg-white text-[#292C32]">Coding Implementation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              >
                <option value="EASY" className="bg-white text-[#292C32]">EASY</option>
                <option value="MEDIUM" className="bg-white text-[#292C32]">MEDIUM</option>
                <option value="HARD" className="bg-white text-[#292C32]">HARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Question Prompt *
            </label>
            <textarea
              rows={3}
              required
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="State the academic question clearly..."
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          {/* MCQ Options Builder */}
          {formData.type === 'MCQ' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#292C32]">
                Options (Mark the correct answer)
              </label>
              {formData.options.map((opt, idx) => (
                <div key={opt.optionKey} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => {
                      const updated = formData.options.map((o, i) => ({
                        ...o,
                        isCorrect: i === idx,
                      }))
                      setFormData({ ...formData, options: updated })
                    }}
                    className="accent-[#8B6DE9] w-4 h-4 cursor-pointer"
                  />
                  <span className="w-6 text-xs font-bold text-[#85878F]">{opt.optionKey}:</span>
                  <input
                    type="text"
                    required
                    value={opt.optionText}
                    onChange={(e) => {
                      const updated = [...formData.options]
                      updated[idx].optionText = e.target.value
                      setFormData({ ...formData, options: updated })
                    }}
                    placeholder={`Option ${opt.optionKey} text...`}
                    className="flex-1 text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Explanation / Evaluation Rubric
            </label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Rationale for the correct answer..."
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E9EAF0]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            >
              {loading ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
