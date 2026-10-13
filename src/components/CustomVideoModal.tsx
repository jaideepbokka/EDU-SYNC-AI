'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Upload,
  Film,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  HardDrive,
  Check,
  Loader2,
} from 'lucide-react'
import {
  saveCustomVideo,
  saveCustomVideoUrl,
  getCustomVideo,
  removeCustomVideo,
  CustomVideoData,
} from '@/lib/customVideoStorage'

interface CustomVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onVideoUpdated?: () => void
}

export function CustomVideoModal({ isOpen, onClose, onVideoUpdated }: CustomVideoModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentVideoName, setCurrentVideoName] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  // Load existing video on open
  useEffect(() => {
    if (!isOpen) return
    setStatusMessage(null)
    setSelectedFile(null)

    getCustomVideo().then((result) => {
      if (result) {
        setPreviewUrl(result.url)
        setCurrentVideoName(result.data.name)
      } else {
        setPreviewUrl(null)
        setCurrentVideoName(null)
      }
    })
  }, [isOpen])

  if (!isOpen) return null

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid video file (.mp4, .webm, .mov, etc.)' })
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStatusMessage(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSaveVideo = async () => {
    setIsSaving(true)
    setStatusMessage(null)

    try {
      if (activeTab === 'upload') {
        if (!selectedFile) {
          setStatusMessage({ type: 'error', text: 'Please choose a video file first.' })
          setIsSaving(false)
          return
        }

        // 1. Save to local IndexedDB for immediate, unlimited-size playback
        await saveCustomVideo(selectedFile)

        // 2. Also try uploading to server for backup persistence (if < 50MB)
        if (selectedFile.size < 50 * 1024 * 1024) {
          try {
            const form = new FormData()
            form.append('video', selectedFile)
            await fetch('/api/custom-welcome-video', {
              method: 'POST',
              body: form,
            })
          } catch (e) {
            console.warn('Server upload fallback error:', e)
          }
        }

        setCurrentVideoName(selectedFile.name)
        setStatusMessage({ type: 'success', text: `"${selectedFile.name}" set as active welcome video!` })
      } else {
        if (!videoUrlInput.trim()) {
          setStatusMessage({ type: 'error', text: 'Please enter a valid video URL.' })
          setIsSaving(false)
          return
        }

        saveCustomVideoUrl(videoUrlInput.trim())
        setCurrentVideoName('Remote Video URL')
        setPreviewUrl(videoUrlInput.trim())
        setStatusMessage({ type: 'success', text: 'Custom video URL set successfully!' })
      }

      if (onVideoUpdated) onVideoUpdated()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save video.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = async () => {
    try {
      await removeCustomVideo()
      try {
        await fetch('/api/custom-welcome-video', { method: 'DELETE' })
      } catch (e) {}

      setSelectedFile(null)
      setPreviewUrl(null)
      setCurrentVideoName(null)
      setStatusMessage({ type: 'success', text: 'Reset to default 3D motion graphics animation.' })
      if (onVideoUpdated) onVideoUpdated()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Could not reset video.' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white shadow-md shadow-[#8B6DE9]/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-[#292C32] flex items-center gap-2">
                Custom Welcome Video
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                  MP4 / WebM
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Choose any video to play as the welcome sequence before login.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Status Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${currentVideoName ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
              <div>
                <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider">Active Mode</span>
                <span className="font-bold text-slate-800">
                  {currentVideoName ? `Custom: ${currentVideoName}` : 'Default 3D WebGL Motion Graphics'}
                </span>
              </div>
            </div>

            {currentVideoName && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                title="Revert to default 3D animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Upload Video File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Web Video URL</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#8B6DE9] bg-purple-50/50 scale-[1.01]'
                    : 'border-slate-200 hover:border-[#8B6DE9]/60 hover:bg-slate-50/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100/70 text-[#6D28D9] flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to browse or drop your video file here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports MP4, WebM, MOV, and MKV • Full HD & 4K supported
                  </p>
                </div>
                {selectedFile && (
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to Apply
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Direct Video URL (.mp4 or .webm)</label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://example.com/videos/welcome-intro.mp4"
                  value={videoUrlInput}
                  onChange={(e) => {
                    setVideoUrlInput(e.target.value)
                    setPreviewUrl(e.target.value)
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]/30 focus:border-[#8B6DE9]"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Paste any direct HTTPS URL linking to a playable video file.
              </p>
            </div>
          )}

          {/* Video Preview Player */}
          {previewUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Preview:</span>
                <span className="text-[11px] text-slate-400 font-normal">Plays full-screen on `/welcome`</span>
              </div>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-md">
                <video
                  ref={videoPreviewRef}
                  src={previewUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Feedback status message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <a
            href="/welcome"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-700" />
            <span>Test / Watch Welcome</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveVideo}
              disabled={isSaving || (activeTab === 'upload' && !selectedFile) || (activeTab === 'url' && !videoUrlInput)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B6DE9] to-[#625BEB] hover:brightness-110 active:scale-95 shadow-md shadow-[#8B6DE9]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Set as Welcome Video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
