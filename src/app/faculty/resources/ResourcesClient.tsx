'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/Modal'
import {
  Video,
  Plus,
  Play,
  Trash2,
  BookOpen,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react'

interface ResourcesClientProps {
  resources: any[]
  topics: any[]
}

export function ResourcesClient({ resources: initialResources, topics }: ResourcesClientProps) {
  const [resources, setResources] = useState<any[]>(initialResources)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeVideoToPlay, setActiveVideoToPlay] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFilterTopic, setSelectedFilterTopic] = useState<string>('ALL')

  const [formData, setFormData] = useState({
    topicId: topics[0]?.id || '',
    title: '',
    url: '',
    durationMinutes: 30,
    content: '',
    author: 'Dr. Arvind Sharma (CSE HOD)',
  })

  const filteredResources = resources.filter((r) => {
    if (selectedFilterTopic === 'ALL') return true
    return r.topicId === selectedFilterTopic
  })

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: formData.topicId,
          title: formData.title,
          type: 'VIDEO',
          url: formData.url,
          durationMinutes: Number(formData.durationMinutes),
          content: formData.content,
          author: formData.author,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to post learning video')

      setResources([data.resource, ...resources])
      setIsAddModalOpen(false)
      setFormData({
        topicId: topics[0]?.id || '',
        title: '',
        url: '',
        durationMinutes: 30,
        content: '',
        author: 'Dr. Arvind Sharma (CSE HOD)',
      })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the video "${title}"? It will also be removed from the student dashboard.`)) {
      return
    }

    try {
      const res = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete learning video')
      setResources(resources.filter((r) => r.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Helper to convert standard YouTube URL to embed URL
  const getEmbedUrl = (url?: string | null) => {
    if (!url) return null
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${id}`
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${id}`
    }
    return url
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Palette Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Faculty Curated • Live Synced with Student Dashboard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <Video className="w-6 h-6 text-[#E5CB90]" />
            <span>Learning Courses & Topic Videos</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Post topic-specific lecture videos for your curriculum. All posted videos are instantly accessible in the student portal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Learning Video</span>
        </button>
      </div>

      {/* Topic Filter Pills */}
      {topics.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedFilterTopic('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilterTopic === 'ALL'
                ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] shadow-xs'
                : 'bg-[#222527] text-[#D8D4CA] hover:text-[#FCFBF7] border border-[#383C3F]'
            }`}
          >
            All Topics ({resources.length})
          </button>
          {topics.slice(0, 8).map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedFilterTopic(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedFilterTopic === t.id
                  ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black shadow-xs'
                  : 'bg-[#222527] text-[#A8ACAF] hover:text-[#FCFBF7] border border-[#383C3F]'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      {/* Video Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const subjectCode = res.topic?.unit?.subject?.code || 'CS501'
            const subjectName = res.topic?.unit?.subject?.name || 'Computer Science'
            const topicTitle = res.topic?.title || 'Core Topic'

            return (
              <div
                key={res.id}
                className="group rounded-3xl bg-[#222527] border border-[#383C3F] hover:border-[#E5CB90]/60 p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-[#E5CB90]/5"
              >
                <div className="space-y-3">
                  {/* Subject and Topic Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#E5CB90]/20 text-[#FFF3C8] border border-[#E5CB90]/30 font-mono font-bold text-[10px]">
                      {subjectCode}
                    </span>
                    <span className="text-[11px] text-[#A8ACAF] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#E5CB90]" />
                      <span>{res.durationMinutes} Mins</span>
                    </span>
                  </div>

                  {/* Topic Tag */}
                  <div>
                    <span className="text-[11px] font-bold text-[#E5CB90]">
                      Topic: {topicTitle}
                    </span>
                    <h3 className="text-sm font-black text-[#FCFBF7] mt-1 line-clamp-2 leading-snug">
                      {res.title}
                    </h3>
                  </div>

                  {/* Description / Content */}
                  {res.content && (
                    <p className="text-xs text-[#A8ACAF] line-clamp-2 leading-relaxed">
                      {res.content}
                    </p>
                  )}

                  {/* Instructor / Sync Status */}
                  <div className="pt-2 border-t border-[#383C3F]/70 flex items-center justify-between text-[11px] text-[#A8ACAF]">
                    <span>By: {res.author || 'Department Faculty'}</span>
                    <span className="flex items-center gap-1 text-[#E5CB90] font-semibold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-[#E5CB90]" />
                      <span>Synced to Student Portal</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-3 flex items-center gap-2 border-t border-[#383C3F]">
                  <button
                    onClick={() => setActiveVideoToPlay(res)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#151718]" />
                    <span>Watch Lecture</span>
                  </button>

                  <button
                    onClick={() => handleDeleteResource(res.id, res.title)}
                    title="Remove Video"
                    className="p-2 rounded-xl text-[#A8ACAF] hover:text-rose-400 hover:bg-[#2E3235] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-[#222527] border-2 border-dashed border-[#383C3F] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#E5CB90]/20 text-[#E5CB90] flex items-center justify-center mx-auto shadow-lg shadow-[#E5CB90]/10">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#FCFBF7]">No Learning Videos in this Topic</h3>
            <p className="text-xs text-[#A8ACAF] max-w-xs mx-auto mt-1">
              Add your first topic-based lecture video to publish it directly to your students.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black text-xs shadow-md shadow-[#E5CB90]/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Learning Video</span>
          </button>
        </div>
      )}

      {/* Add Learning Video Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Learning Video for Topic"
      >
        <form onSubmit={handleAddVideo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#FCFBF7] mb-1">
              Select Curriculum Topic *
            </label>
            <select
              value={formData.topicId}
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-3 text-[#FCFBF7] focus:outline-hidden focus:border-[#E5CB90]"
              required
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.unit?.subject?.code ? `[${t.unit.subject.code}] ` : ''}
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#FCFBF7] mb-1">
              Lecture Video Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Masterclass: Dijkstra Shortest Path Algorithm in Graphs"
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-3 text-[#FCFBF7] placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#FCFBF7] mb-1">
                Video URL (YouTube / Embed) *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-3 text-[#FCFBF7] placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FCFBF7] mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-3 text-[#FCFBF7] focus:outline-hidden focus:border-[#E5CB90]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#FCFBF7] mb-1">
              Instructor / Faculty Name
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-3 text-[#FCFBF7] focus:outline-hidden focus:border-[#E5CB90]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#FCFBF7] mb-1">
              Key Concepts Covered & Description
            </label>
            <textarea
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Summary of algorithms, proofs, time complexity analysis, or implementation walkthrough covered in this lecture video..."
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-3 text-[#FCFBF7] placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
            />
          </div>

          {/* Quick preset chips to help fill quickly */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A8ACAF]">
              Quick Fill Inspiration:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                { title: 'Dijkstra Priority Queue Implementation', url: 'https://www.youtube.com/watch?v=bZkzH5x0Ikk' },
                { title: 'Dynamic Programming 0/1 Knapsack Solution', url: 'https://www.youtube.com/watch?v=8LusJS5-AGo' },
                { title: 'Binary Search Tree Balancing & Rotations', url: 'https://www.youtube.com/watch?v=vRwi_UCVr-k' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, title: preset.title, url: preset.url })}
                  className="px-2.5 py-1 rounded-lg bg-[#2E3235] hover:bg-[#383C3F] text-[11px] text-[#FFF3C8] border border-[#383C3F] transition-colors cursor-pointer"
                >
                  + {preset.title.slice(0, 26)}...
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#2E3235] hover:bg-[#383C3F] text-xs font-bold text-[#FCFBF7] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] font-black text-xs shadow-md shadow-[#E5CB90]/20 transition-all cursor-pointer"
            >
              {loading ? 'Publishing Video...' : 'Publish & Sync to Student Portal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Video Player Modal */}
      {activeVideoToPlay && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#151718] border border-[#383C3F] overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#E5CB90]">
                  {activeVideoToPlay.topic?.title}
                </span>
                <h3 className="text-base font-black text-[#FCFBF7] mt-0.5">
                  {activeVideoToPlay.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoToPlay(null)}
                className="p-2 rounded-full bg-[#222527] text-[#A8ACAF] hover:text-[#FCFBF7] hover:bg-[#2E3235] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#383C3F]">
              {getEmbedUrl(activeVideoToPlay.url) ? (
                <iframe
                  src={getEmbedUrl(activeVideoToPlay.url)!}
                  title={activeVideoToPlay.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-[#A8ACAF]">
                  Video link unavailable
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[#A8ACAF] pt-2">
              <p>{activeVideoToPlay.content || 'Lecture material for curriculum study.'}</p>
              <a
                href={activeVideoToPlay.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222527] hover:bg-[#2E3235] text-[#FFF3C8] font-semibold border border-[#383C3F]"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
