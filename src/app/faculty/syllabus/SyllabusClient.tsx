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

      // Optimistically remove unit from local state
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== selectedSubjectId) return s
          return {
            ...s,
            units: (s.units || []).filter((u: any) => u.id !== unitId),
          }
        })
      )
      router.refresh()
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

      // Optimistically remove topic from local state
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
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete topic')
    } finally {
      setDeletingTopicId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Academic Curriculum Hierarchy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-[#E5CB90]" />
            <span>Hierarchical Syllabus Tree</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Maintain nested Unit → Topic → Learning Objective tree aligned with Bloom’s Taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90] outline-hidden cursor-pointer"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id} className="bg-[#151718] text-[#FCFBF7]">
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
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
                className="rounded-3xl bg-[#222527] border border-[#383C3F] shadow-xl overflow-hidden hover:border-[#E5CB90]/40 transition-colors"
              >
                {/* Unit Header */}
                <div
                  onClick={() => toggleUnit(unit.id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#2E3235]/60 transition-colors border-b border-[#383C3F]"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      aria-label="Toggle Unit Accordion"
                      className="p-1 rounded-lg hover:bg-[#151718] text-[#A8ACAF] transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-[#E5CB90]/20 text-[#FFF3C8] border border-[#E5CB90]/30 flex items-center justify-center font-black text-xs">
                      U{unit.unitNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#FCFBF7]">
                        {unit.title?.toLowerCase().startsWith('unit') ? unit.title : `Unit ${unit.unitNumber}: ${unit.title}`}
                      </h3>
                      <p className="text-xs text-[#A8ACAF] mt-0.5">{unit.description || 'Core theoretical unit'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#151718] text-[#A8ACAF] border border-[#383C3F]">
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
                      className="px-3 py-1.5 rounded-xl bg-[#E5CB90]/15 hover:bg-[#E5CB90]/25 text-[#FFF3C8] border border-[#E5CB90]/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E5CB90]" />
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingUnitId === unit.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>

                {/* Nested Topics Accordion */}
                {isExpanded && (
                  <div className="p-5 space-y-4 bg-[#151718]/60">
                    {unit.topics && unit.topics.length > 0 ? (
                      unit.topics.map((topic: any) => (
                        <div
                          key={topic.id}
                          className="rounded-2xl bg-[#222527] border border-[#383C3F] p-4 shadow-md space-y-3 hover:border-[#E5CB90]/30 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-[#151718] border border-[#383C3F] text-[#FFF3C8] text-xs font-bold flex items-center justify-center">
                                {topic.topicNumber}
                              </span>
                              <h4 className="text-xs font-bold text-[#FCFBF7]">
                                {topic.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="flex items-center gap-1 text-[#A8ACAF] px-2 py-0.5 rounded-md bg-[#151718] border border-[#383C3F]">
                                <Clock className="w-3.5 h-3.5 text-[#E5CB90]" />
                                <span>{topic.estimatedHours} Hours</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] border border-[#E5CB90]/30 text-[10px] font-bold">
                                {topic.difficulty}
                              </span>

                              {/* Delete Topic button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTopic(topic.id, topic.topicNumber, topic.title, unit.id)}
                                disabled={deletingTopicId === topic.id}
                                title={`Delete Topic ${topic.topicNumber}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{deletingTopicId === topic.id ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Learning Objectives List */}
                          {topic.learningObjectives && topic.learningObjectives.length > 0 && (
                            <div className="pt-2 border-t border-[#383C3F] space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A8ACAF]">
                                Learning Objectives & Bloom Level
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {topic.learningObjectives.map((lo: any) => (
                                  <div
                                    key={lo.id}
                                    className="p-2.5 rounded-xl bg-[#151718] border border-[#383C3F] flex items-start justify-between gap-2 text-xs"
                                  >
                                    <div>
                                      <span className="font-mono font-bold text-[#E5CB90] mr-1.5">
                                        {lo.code}
                                      </span>
                                      <span className="text-[#D8D4CA] leading-snug">
                                        {lo.description}
                                      </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold uppercase shrink-0">
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
                      <div className="p-4 rounded-xl bg-[#222527] border border-dashed border-[#383C3F] text-center text-xs text-[#A8ACAF]">
                        No topics defined in this unit yet. Click &quot;+ Add Topic&quot; above to create one.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#222527] border border-[#383C3F] space-y-3">
            <BookOpen className="w-10 h-10 text-[#A8ACAF] mx-auto opacity-40" />
            <p className="text-sm font-bold text-[#FCFBF7]">No units found for this course.</p>
            <p className="text-xs text-[#A8ACAF]">
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
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Unit Number *
            </label>
            <input
              type="number"
              required
              value={unitForm.unitNumber}
              onChange={(e) => setUnitForm({ ...unitForm, unitNumber: Number(e.target.value) })}
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Unit Title *
            </label>
            <input
              type="text"
              required
              value={unitForm.title}
              onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
              placeholder="e.g. Greedy Algorithms & Matroid Theory"
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={unitForm.description}
              onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
              placeholder="Unit curriculum scope and focus areas..."
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUnitModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-black text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
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
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Topic Number *
              </label>
              <input
                type="number"
                required
                value={topicForm.topicNumber}
                onChange={(e) => setTopicForm({ ...topicForm, topicNumber: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={topicForm.estimatedHours}
                onChange={(e) => setTopicForm({ ...topicForm, estimatedHours: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Topic Title *
            </label>
            <input
              type="text"
              required
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              placeholder="e.g. Huffman Coding & Prefix Codes"
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Difficulty
            </label>
            <select
              value={topicForm.difficulty}
              onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
            >
              <option value="EASY" className="bg-[#151718]">EASY</option>
              <option value="MEDIUM" className="bg-[#151718]">MEDIUM</option>
              <option value="HARD" className="bg-[#151718]">HARD</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsTopicModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-black text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Topic'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
