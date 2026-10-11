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
      {/* Page Header with Lavender/Purple Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Faculty Curated • Live Synced with Student Dashboard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-white" />
            <span>Learning Courses & Topic Videos</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Post topic-specific lecture videos for your curriculum. All posted videos are instantly accessible in the student portal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilterTopic === 'ALL'
                ? 'bg-[#292C32] text-white shadow-xs'
                : 'bg-white text-[#85878F] hover:text-[#292C32] border border-[#E9EAF0]'
            }`}
          >
            All Topics ({resources.length})
          </button>
          {topics.slice(0, 8).map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedFilterTopic(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilterTopic === t.id
                  ? 'bg-[#292C32] text-white font-bold shadow-xs'
                  : 'bg-white text-[#85878F] hover:text-[#292C32] border border-[#E9EAF0]'
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
            const topicTitle = res.topic?.title || 'Core Topic'

            return (
              <div
                key={res.id}
                className="group rounded-3xl bg-white border border-[#E9EAF0] hover:border-[#8B6DE9] p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-lg"
              >
                <div className="space-y-3">
                  {/* Subject and Topic Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 font-mono font-bold text-[10px]">
                      {subjectCode}
                    </span>
                    <span className="text-[11px] text-[#85878F] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#8B6DE9]" />
                      <span>{res.durationMinutes} Mins</span>
                    </span>
                  </div>

                  {/* Topic Tag */}
                  <div>
                    <span className="text-[11px] font-bold text-[#8B6DE9]">
                      Topic: {topicTitle}
                    </span>
                    <h3 className="text-sm font-bold text-[#292C32] mt-1 line-clamp-2 leading-snug">
                      {res.title}
                    </h3>
                  </div>

                  {/* Description / Content */}
                  {res.content && (
                    <p className="text-xs text-[#85878F] line-clamp-2 leading-relaxed">
                      {res.content}
                    </p>
                  )}

                  {/* Instructor / Sync Status */}
                  <div className="pt-2 border-t border-[#E9EAF0] flex items-center justify-between text-[11px] text-[#85878F]">
                    <span>By: {res.author || 'Department Faculty'}</span>
                    <span className="flex items-center gap-1 text-[#35C979] font-semibold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-[#35C979]" />
                      <span>Synced to Student Portal</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 flex items-center gap-2 border-t border-[#E9EAF0]">
                  <button
                    onClick={() => setActiveVideoToPlay(res)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Lecture</span>
                  </button>

                  <button
                    onClick={() => handleDeleteResource(res.id, res.title)}
                    title="Remove Video"
                    className="p-2 rounded-xl text-[#85878F] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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
        <div className="p-12 text-center rounded-3xl bg-white border-2 border-dashed border-[#E9EAF0] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#D9D1F5]/60 text-[#625BEB] flex items-center justify-center mx-auto shadow-sm">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#292C32]">No Learning Videos in this Topic</h3>
            <p className="text-xs text-[#85878F] max-w-xs mx-auto mt-1">
              Add your first topic-based lecture video to publish it directly to your students.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
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
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Select Curriculum Topic *
            </label>
            <select
              value={formData.topicId}
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
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
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Lecture Video Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Masterclass: Dijkstra Shortest Path Algorithm in Graphs"
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Video URL (YouTube / Embed) *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Instructor / Faculty Name
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 text-[#292C32] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Key Concepts Covered & Description
            </label>
            <textarea
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Summary of algorithms, proofs, time complexity analysis, or implementation walkthrough covered in this lecture video..."
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
            />
          </div>

          {/* Quick preset chips to help fill quickly */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#85878F]">
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
                  className="px-2.5 py-1 rounded-lg bg-[#D9D1F5]/40 hover:bg-[#D9D1F5]/70 text-[11px] text-[#625BEB] border border-[#A99AE8]/40 transition-colors cursor-pointer"
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
              className="px-4 py-2 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-xs font-bold text-[#292C32] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Publishing Video...' : 'Publish & Sync to Student Portal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Video Player Modal */}
      {activeVideoToPlay && (
        <div className="fixed inset-0 z-50 bg-[#292C32]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-[#E9EAF0] overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8B6DE9]">
                  {activeVideoToPlay.topic?.title}
                </span>
                <h3 className="text-base font-black text-[#292C32] mt-0.5">
                  {activeVideoToPlay.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoToPlay(null)}
                className="p-2 rounded-full bg-[#F2F3F5] text-[#85878F] hover:text-[#292C32] hover:bg-[#E9EAF0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#E9EAF0]">
              {getEmbedUrl(activeVideoToPlay.url) ? (
                <iframe
                  src={getEmbedUrl(activeVideoToPlay.url)!}
                  title={activeVideoToPlay.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-[#85878F]">
                  Video link unavailable
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[#85878F] pt-2">
              <p>{activeVideoToPlay.content || 'Lecture material for curriculum study.'}</p>
              <a
                href={activeVideoToPlay.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] font-semibold border border-[#E9EAF0]"
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

