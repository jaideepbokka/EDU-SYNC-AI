'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Video,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  ExternalLink,
  Layers,
  X,
  Check,
} from 'lucide-react'

interface StudentCoursesClientProps {
  resources: any[]
  subjects: any[]
  studentName: string
}

export function StudentCoursesClient({
  resources,
  subjects,
  studentName,
}: StudentCoursesClientProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL')
  const [activeVideo, setActiveVideo] = useState<any | null>(null)
  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({})

  const toggleCompleted = (id: string) => {
    setCompletedVideos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filtered = resources.filter((r) => {
    if (selectedSubject === 'ALL') return true
    const code = r.topic?.unit?.subject?.code
    return code === selectedSubject
  })

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
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header Banner with Palette Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Faculty Video Lectures • Live Synchronized</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <Video className="w-6 h-6 text-[#E5CB90]" />
            <span>Learning Courses & Topic Videos</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Access curriculum video masterclasses posted by your professors, mapped directly to syllabus topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#222527] border border-[#383C3F] text-xs font-bold text-[#FFF3C8]">
            {resources.length} Videos Available
          </span>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSubject('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedSubject === 'ALL'
              ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black shadow-xs'
              : 'bg-[#222527] text-[#D8D4CA] hover:text-[#FCFBF7] border border-[#383C3F]'
          }`}
        >
          All Subjects ({resources.length})
        </button>

        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.code)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedSubject === sub.code
                ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black shadow-xs'
                : 'bg-[#222527] text-[#A8ACAF] hover:text-[#FCFBF7] border border-[#383C3F]'
            }`}
          >
            {sub.code}: {sub.name.slice(0, 18)}...
          </button>
        ))}
      </div>

      {/* Videos List Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => {
            const subjectCode = res.topic?.unit?.subject?.code || 'CS501'
            const topicTitle = res.topic?.title || 'Course Topic'
            const isCompleted = !!completedVideos[res.id]

            return (
              <div
                key={res.id}
                className="group rounded-3xl bg-[#222527] border border-[#383C3F] hover:border-[#E5CB90]/60 p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-[#E5CB90]/5"
              >
                <div className="space-y-3">
                  {/* Subject and Duration header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#E5CB90]/20 text-[#FFF3C8] border border-[#E5CB90]/30 font-mono font-bold text-[10px]">
                      {subjectCode}
                    </span>
                    <span className="text-[11px] text-[#A8ACAF] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#E5CB90]" />
                      <span>{res.durationMinutes} Mins</span>
                    </span>
                  </div>

                  {/* Topic & Title */}
                  <div>
                    <span className="text-[11px] font-bold text-[#E5CB90]">
                      Topic: {topicTitle}
                    </span>
                    <h3 className="text-sm font-black text-[#FCFBF7] mt-1 line-clamp-2 leading-snug">
                      {res.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {res.content && (
                    <p className="text-xs text-[#A8ACAF] line-clamp-2 leading-relaxed">
                      {res.content}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#383C3F]/70 flex items-center justify-between text-[11px] text-[#A8ACAF]">
                    <span>Faculty: {res.author || 'Department Instructor'}</span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[#E5CB90] font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E5CB90]" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Actions */}
                <div className="pt-4 mt-3 flex items-center gap-2 border-t border-[#383C3F]">
                  <button
                    onClick={() => setActiveVideo(res)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#151718]" />
                    <span>Watch Video</span>
                  </button>

                  <button
                    onClick={() => toggleCompleted(res.id)}
                    title={isCompleted ? 'Mark as unwatched' : 'Mark as watched'}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-[#E5CB90]/20 border-[#E5CB90]/40 text-[#E5CB90]'
                        : 'bg-[#151718] border-[#383C3F] text-[#A8ACAF] hover:text-[#FCFBF7]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#222527] border-2 border-dashed border-[#383C3F] space-y-3 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#E5CB90]/20 text-[#E5CB90] flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[#FCFBF7]">No Videos for this Subject</h3>
          <p className="text-xs text-[#A8ACAF]">
            Your faculty has not posted any video lectures for this subject yet.
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#151718] border border-[#383C3F] overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#E5CB90]">
                  {activeVideo.topic?.title}
                </span>
                <h3 className="text-base font-black text-[#FCFBF7] mt-0.5">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-full bg-[#222527] text-[#A8ACAF] hover:text-[#FCFBF7] hover:bg-[#2E3235] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#383C3F]">
              {getEmbedUrl(activeVideo.url) ? (
                <iframe
                  src={getEmbedUrl(activeVideo.url)!}
                  title={activeVideo.title}
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
              <p>{activeVideo.content || 'Lecture material for curriculum study.'}</p>
              <a
                href={activeVideo.url}
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
