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
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Faculty Video Lectures • Live Synchronized</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-white" />
            <span>Learning Courses & Topic Videos</span>
          </h1>
          <p className="text-xs text-purple-100 mt-1 max-w-2xl">
            Access curriculum video masterclasses posted by your professors, mapped directly to syllabus topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white">
            {resources.length} Videos Available
          </span>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSubject('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedSubject === 'ALL'
              ? 'bg-[#292C32] text-white shadow-xs'
              : 'bg-white text-[#85878F] hover:text-[#292C32] border border-[#E9EAF0]'
          }`}
        >
          All Subjects ({resources.length})
        </button>

        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.code)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubject === sub.code
                ? 'bg-[#292C32] text-white font-bold shadow-xs'
                : 'bg-white text-[#85878F] hover:text-[#292C32] border border-[#E9EAF0]'
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
                className="group rounded-3xl bg-white border border-[#E9EAF0] hover:border-[#A99AE8] p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-[#8B6DE9]/5"
              >
                <div className="space-y-3">
                  {/* Subject and Duration header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 font-mono font-bold text-[10px]">
                      {subjectCode}
                    </span>
                    <span className="text-[11px] text-[#85878F] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#625BEB]" />
                      <span>{res.durationMinutes} Mins</span>
                    </span>
                  </div>

                  {/* Topic & Title */}
                  <div>
                    <span className="text-[11px] font-bold text-[#625BEB]">
                      Topic: {topicTitle}
                    </span>
                    <h3 className="text-sm font-bold text-[#292C32] mt-1 line-clamp-2 leading-snug">
                      {res.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {res.content && (
                    <p className="text-xs text-[#85878F] line-clamp-2 leading-relaxed">
                      {res.content}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#E9EAF0] flex items-center justify-between text-[11px] text-[#85878F]">
                    <span>Faculty: {res.author || 'Department Instructor'}</span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[#35C979] font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#35C979]" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Actions */}
                <div className="pt-4 mt-3 flex items-center gap-2 border-t border-[#E9EAF0]">
                  <button
                    onClick={() => setActiveVideo(res)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white text-[#A99AE8]" />
                    <span>Watch Video</span>
                  </button>

                  <button
                    onClick={() => toggleCompleted(res.id)}
                    title={isCompleted ? 'Mark as unwatched' : 'Mark as watched'}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-[#F2F3F5] border-[#E9EAF0] text-[#85878F] hover:text-[#292C32]'
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
        <div className="p-12 text-center rounded-3xl bg-white border-2 border-dashed border-[#E9EAF0] space-y-3 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#D9D1F5]/40 text-[#625BEB] flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[#292C32]">No Videos for this Subject</h3>
          <p className="text-xs text-[#85878F]">
            Your faculty has not posted any video lectures for this subject yet.
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-[#292C32]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-[#E9EAF0] overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#625BEB]">
                  {activeVideo.topic?.title}
                </span>
                <h3 className="text-base font-black text-[#292C32] mt-0.5">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-full bg-[#F2F3F5] text-[#85878F] hover:text-[#292C32] hover:bg-[#E9EAF0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#E9EAF0]">
              {getEmbedUrl(activeVideo.url) ? (
                <iframe
                  src={getEmbedUrl(activeVideo.url)!}
                  title={activeVideo.title}
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
              <p>{activeVideo.content || 'Lecture material for curriculum study.'}</p>
              <a
                href={activeVideo.url}
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
