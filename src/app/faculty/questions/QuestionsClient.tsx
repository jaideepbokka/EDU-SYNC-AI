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

      // Optimistically remove from state
      setQuestionList((prev) => prev.filter((q) => q.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete question')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Curated Bloom’s Taxonomies & Evaluation Bank</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <FileQuestion className="w-6 h-6 text-[#E5CB90]" />
            <span>Question Bank Repository</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Curated Bloom’s-aligned question items across MCQs, True/False, Short Answer rubrics, and Coding problems. Delete or manage items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/faculty/quiz-generator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-[#D8D4CA] hover:text-[#FCFBF7] text-xs font-bold border border-[#383C3F] transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#E5CB90]" />
            <span>AI Quiz Generator</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Question</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-[#222527] border border-[#383C3F] shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#A8ACAF] pl-2">
          <Filter className="w-4 h-4 text-[#E5CB90]" />
          <span>Filters:</span>
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="text-xs font-semibold rounded-xl border border-[#383C3F] bg-[#151718] p-2 text-[#FCFBF7] focus:outline-hidden focus:border-[#E5CB90]"
        >
          <option value="ALL">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id} className="bg-[#151718]">
              {t.title}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 bg-[#151718] border border-[#383C3F] p-1 rounded-xl">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedDifficulty === diff
                  ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-bold shadow-xs'
                  : 'text-[#A8ACAF] hover:text-[#FCFBF7]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-[#151718] border border-[#383C3F] p-1 rounded-xl overflow-x-auto">
          {['ALL', 'MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'CODING'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedType === type
                  ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-bold shadow-xs'
                  : 'text-[#A8ACAF] hover:text-[#FCFBF7]'
              }`}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xl space-y-4 hover:border-[#E5CB90]/60 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E5CB90]/20 text-[#FFF3C8] font-black text-xs flex items-center justify-center border border-[#E5CB90]/30">
                    Q{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#151718] border border-[#383C3F] text-[10px] font-bold uppercase text-[#FCFBF7]">
                    {q.type.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#E5CB90]/15 text-[#FFF3C8] border border-[#E5CB90]/30 text-[10px] font-bold uppercase">
                    Bloom: {q.bloomLevel}
                  </span>
                  <StatusBadge status={q.difficulty} />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-[#FCFBF7]">
                    {q.marks} Marks
                  </span>
                  <span className="text-[#A8ACAF] font-mono text-[10px] hidden sm:inline">
                    {q.topic?.title}
                  </span>

                  {/* Delete Option for Question */}
                  <button
                    onClick={() => handleDeleteQuestion(q.id, q.questionText)}
                    disabled={deletingId === q.id}
                    title="Delete question from repository"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === q.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-[#FCFBF7] leading-relaxed">
                {q.questionText}
              </p>

              {/* Options Preview for MCQs */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                        opt.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 font-semibold'
                          : 'bg-[#151718] border-[#383C3F] text-[#A8ACAF]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-[#222527] text-[#FCFBF7] shadow-xs shrink-0">
                        {opt.optionKey}
                      </span>
                      <span className="truncate">{opt.optionText}</span>
                      {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Answer / Explanation */}
              {q.explanation && (
                <div className="p-3 rounded-xl bg-[#151718] border border-[#383C3F] text-xs text-[#A8ACAF]">
                  <strong className="text-[#FFF3C8]">Explanation: </strong>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#222527] border border-[#383C3F] space-y-3">
            <FileQuestion className="w-10 h-10 text-[#A8ACAF] mx-auto opacity-40" />
            <p className="text-sm font-bold text-[#FCFBF7]">No questions match current filter criteria.</p>
            <p className="text-xs text-[#A8ACAF]">
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
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Topic *
              </label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#151718]">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
              >
                <option value="MCQ" className="bg-[#151718]">Multiple Choice (MCQ)</option>
                <option value="TRUE_FALSE" className="bg-[#151718]">True / False</option>
                <option value="SHORT_ANSWER" className="bg-[#151718]">Short Answer / Subjective</option>
                <option value="CODING" className="bg-[#151718]">Coding Implementation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
              >
                <option value="EASY" className="bg-[#151718]">EASY</option>
                <option value="MEDIUM" className="bg-[#151718]">MEDIUM</option>
                <option value="HARD" className="bg-[#151718]">HARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Question Prompt *
            </label>
            <textarea
              rows={3}
              required
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="State the academic question clearly..."
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 placeholder:text-[#6A6E72] focus:border-[#E5CB90]"
            />
          </div>

          {/* MCQ Options Builder */}
          {formData.type === 'MCQ' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#D8D4CA]">
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
                    className="accent-[#E5CB90] w-4 h-4 cursor-pointer"
                  />
                  <span className="w-6 text-xs font-bold text-[#A8ACAF]">{opt.optionKey}:</span>
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
                    className="flex-1 text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2 placeholder:text-[#6A6E72] focus:border-[#E5CB90]"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Explanation / Evaluation Rubric
            </label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Rationale for the correct answer..."
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 placeholder:text-[#6A6E72] focus:border-[#E5CB90]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-black text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
