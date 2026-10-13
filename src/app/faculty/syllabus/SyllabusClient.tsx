'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import {
  GitFork,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  Sparkles,
  Layers,
  Clock,
  Trash2,
} from 'lucide-react'

interface SyllabusClientProps {
  subjects: any[]
}

export function SyllabusClient({ subjects: initialSubjects }: SyllabusClientProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>(initialSubjects)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjects[0]?.id || '')
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    [initialSubjects[0]?.units?.[0]?.id]: true,
  })

  // Modals state
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
  const [targetUnitId, setTargetUnitId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null)
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null)

  // Keep subjects in sync with server props
  useEffect(() => {
    setSubjects(initialSubjects)
    if (!selectedSubjectId && initialSubjects.length > 0) {
      setSelectedSubjectId(initialSubjects[0].id)
    }
  }, [initialSubjects])

  // Forms
  const [unitForm, setUnitForm] = useState({ unitNumber: 3, title: '', description: '' })
  const [topicForm, setTopicForm] = useState({
    topicNumber: 1,
    title: '',
    difficulty: 'MEDIUM',
    estimatedHours: 4,
  })

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0]

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }))
  }

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'UNIT',
          subjectId: selectedSubjectId,
          ...unitForm,
        }),
      })
      if (!res.ok) throw new Error('Failed to create unit')
      setIsUnitModalOpen(false)
      setUnitForm({ unitNumber: unitForm.unitNumber + 1, title: '', description: '' })
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUnit = async (unitId: string, unitNumber: number, title: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to delete Unit ${unitNumber}: "${title}"?\n\nThis will permanently remove this unit and all topics/learning objectives nested inside it.`
    )
    if (!isConfirmed) return

    setDeletingUnitId(unitId)
    try {
      const res = await fetch(`/api/syllabus?type=UNIT&id=${unitId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete unit')

      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== selectedSubjectId) return s
          return {
            ...s,
            units: (s.units || []).filter((u: any) => u.id !== unitId),
          }
        })
      )
    } catch (err: any) {
      alert(err.message || 'Failed to delete unit')
    } finally {
      setDeletingUnitId(null)
    }
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TOPIC',
          unitId: targetUnitId,
          ...topicForm,
        }),
      })
      if (!res.ok) throw new Error('Failed to create topic')
      setIsTopicModalOpen(false)
      setTopicForm({ topicNumber: topicForm.topicNumber + 1, title: '', difficulty: 'MEDIUM', estimatedHours: 4 })
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTopic = async (topicId: string, topicNumber: number, title: string, unitId: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to delete Topic ${topicNumber}: "${title}"?\n\nThis will remove this topic and all of its associated learning objectives.`
    )
    if (!isConfirmed) return

    setDeletingTopicId(topicId)
    try {
      const res = await fetch(`/api/syllabus?type=TOPIC&id=${topicId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete topic')

      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== selectedSubjectId) return s
          return {
            ...s,
            units: (s.units || []).map((u: any) => {
              if (u.id !== unitId) return u
              return {
                ...u,
                topics: (u.topics || []).filter((t: any) => t.id !== topicId),
              }
            }),
          }
        })
      )
    } catch (err: any) {
      alert(err.message || 'Failed to delete topic')
    } finally {
      setDeletingTopicId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Academic Curriculum Hierarchy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <GitFork className="w-7 h-7 text-white" />
            <span>Hierarchical Syllabus Tree</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Maintain nested Unit → Topic → Learning Objective tree aligned with Bloom’s Taxonomy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs font-bold rounded-xl border border-white/30 bg-white/20 p-3 text-white focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer shadow-xs"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id} className="bg-[#292C32] text-white">
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Unit</span>
          </button>
        </div>
      </div>

      {/* Syllabus Tree */}
      <div className="space-y-4">
        {currentSubject?.units && currentSubject.units.length > 0 ? (
          currentSubject.units.map((unit: any) => {
            const isExpanded = expandedUnits[unit.id]

            return (
              <div
                key={unit.id}
                className="rounded-3xl bg-white border border-[#E9EAF0] shadow-xs overflow-hidden hover:border-[#A99AE8] transition-colors"
              >
                {/* Unit Header */}
                <div
                  onClick={() => toggleUnit(unit.id)}
                  className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#F2F3F5]/80 transition-colors border-b border-[#E9EAF0]"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      aria-label="Toggle Unit Accordion"
                      className="p-1 rounded-lg text-[#85878F] hover:text-[#292C32] transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="w-10 h-10 rounded-2xl bg-[#D9D1F5]/50 text-[#625BEB] border border-[#D9D1F5] flex items-center justify-center font-black text-xs shadow-xs">
                      U{unit.unitNumber}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#292C32]">
                        {unit.title?.toLowerCase().startsWith('unit') ? unit.title : `Unit ${unit.unitNumber}: ${unit.title}`}
                      </h3>
                      <p className="text-xs text-[#85878F] mt-0.5">{unit.description || 'Core theoretical unit'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-[#F2F3F5] text-[#292C32] border border-[#E9EAF0]">
                      {unit.topics?.length || 0} Topics
                    </span>

                    {/* Add Topic button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTargetUnitId(unit.id)
                        setIsTopicModalOpen(true)
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] border border-[#E9EAF0] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#8B6DE9]" />
                      <span>+ Add Topic</span>
                    </button>

                    {/* Delete Unit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteUnit(unit.id, unit.unitNumber, unit.title)
                      }}
                      disabled={deletingUnitId === unit.id}
                      title={`Delete Unit ${unit.unitNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingUnitId === unit.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>

                {/* Nested Topics Accordion */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-4 bg-[#F2F3F5]/50">
                    {unit.topics && unit.topics.length > 0 ? (
                      unit.topics.map((topic: any) => (
                        <div
                          key={topic.id}
                          className="rounded-2xl bg-white border border-[#E9EAF0] p-4 sm:p-5 shadow-xs space-y-3 hover:border-[#A99AE8] transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-[#D9D1F5]/50 border border-[#D9D1F5] text-[#625BEB] text-xs font-bold flex items-center justify-center">
                                {topic.topicNumber}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-[#292C32]">
                                {topic.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="flex items-center gap-1 text-[#85878F] px-2.5 py-1 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[11px] font-semibold">
                                <Clock className="w-3.5 h-3.5 text-[#8B6DE9]" />
                                <span>{topic.estimatedHours} Hours</span>
                              </span>
                              <span className="px-2.5 py-1 rounded-xl bg-[#D9D1F5]/50 text-[#625BEB] border border-[#D9D1F5] text-[10px] font-bold">
                                {topic.difficulty}
                              </span>

                              {/* Delete Topic button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTopic(topic.id, topic.topicNumber, topic.title, unit.id)}
                                disabled={deletingTopicId === topic.id}
                                title={`Delete Topic ${topic.topicNumber}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{deletingTopicId === topic.id ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Learning Objectives List */}
                          {topic.learningObjectives && topic.learningObjectives.length > 0 && (
                            <div className="pt-3 border-t border-[#E9EAF0] space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#85878F]">
                                Learning Objectives & Bloom Level
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {topic.learningObjectives.map((lo: any) => (
                                  <div
                                    key={lo.id}
                                    className="p-3 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] flex items-start justify-between gap-2 text-xs"
                                  >
                                    <div>
                                      <span className="font-mono font-bold text-[#8B6DE9] mr-1.5">
                                        {lo.code}
                                      </span>
                                      <span className="text-[#292C32] leading-snug">
                                        {lo.description}
                                      </span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md bg-[#D9D1F5]/50 text-[#625BEB] border border-[#D9D1F5] text-[9px] font-bold uppercase shrink-0">
                                      {lo.bloomLevel}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 rounded-2xl bg-white border border-dashed border-[#E9EAF0] text-center text-xs text-[#85878F]">
                        No topics defined in this unit yet. Click &quot;+ Add Topic&quot; above to create one.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#E9EAF0] space-y-3">
            <BookOpen className="w-10 h-10 text-[#85878F] mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#292C32]">No units found for this course.</p>
            <p className="text-xs text-[#85878F]">
              Click &quot;+ Add Unit&quot; above to begin defining the syllabus hierarchy.
            </p>
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title="Add Curriculum Unit"
        description="Add a top-level unit to this course's syllabus structure."
        maxWidth="md"
      >
        <form onSubmit={handleCreateUnit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Unit Number *
            </label>
            <input
              type="number"
              required
              value={unitForm.unitNumber}
              onChange={(e) => setUnitForm({ ...unitForm, unitNumber: Number(e.target.value) })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Unit Title *
            </label>
            <input
              type="text"
              required
              value={unitForm.title}
              onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
              placeholder="e.g. Greedy Algorithms & Matroid Theory"
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={unitForm.description}
              onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
              placeholder="Unit curriculum scope and focus areas..."
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E9EAF0]">
            <button
              type="button"
              onClick={() => setIsUnitModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            >
              {loading ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title="Add Topic to Unit"
        description="Add a specific topic under the selected curriculum unit."
        maxWidth="md"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Topic Number *
              </label>
              <input
                type="number"
                required
                value={topicForm.topicNumber}
                onChange={(e) => setTopicForm({ ...topicForm, topicNumber: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={topicForm.estimatedHours}
                onChange={(e) => setTopicForm({ ...topicForm, estimatedHours: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Topic Title *
            </label>
            <input
              type="text"
              required
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              placeholder="e.g. Huffman Coding & Prefix Codes"
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Difficulty
            </label>
            <select
              value={topicForm.difficulty}
              onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden cursor-pointer"
            >
              <option value="EASY" className="bg-white text-[#292C32]">EASY</option>
              <option value="MEDIUM" className="bg-white text-[#292C32]">MEDIUM</option>
              <option value="HARD" className="bg-white text-[#292C32]">HARD</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E9EAF0]">
            <button
              type="button"
              onClick={() => setIsTopicModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            >
              {loading ? 'Adding...' : 'Add Topic'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
