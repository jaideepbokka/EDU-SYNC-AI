'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CalendarCheck,
  Award,
  ArrowRight,
  Sparkles,
  Mail,
  ShieldCheck,
  X,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'

interface NotificationsClientProps {
  initialNotifications: any[]
}

export function NotificationsClient({
  initialNotifications,
}: NotificationsClientProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState('ALL')
  const [selectedNotif, setSelectedNotif] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNotif(null)
      }
    }
    if (selectedNotif) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNotif])

  const filtered = notifications.filter((n) => {
    if (filter !== 'ALL' && n.type !== filter) return false
    return true
  })

  const markAllRead = async () => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    router.refresh()
  }

  const handleOpenDetails = async (notif: any) => {
    setSelectedNotif(notif)
    setCopied(false)

    if (!notif.isRead) {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id }),
        })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }
  }

  const handleCopy = () => {
    if (!selectedNotif) return
    const text = `${selectedNotif.title}\n\n${selectedNotif.message}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Real-Time Alert Feed • Action Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-white" />
            <span>Academic Notifications & System Alerts</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Real-time triggers for attendance anomalies, assessment submissions, and critical student risks.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs w-fit flex-wrap">
        {['ALL', 'HOD_MAIL', 'RISK', 'ATTENDANCE', 'ASSESSMENT'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === t
                ? 'bg-[#292C32] text-white shadow-xs'
                : 'text-[#85878F] hover:bg-[#F2F3F5]'
            }`}
          >
            {t === 'HOD_MAIL' ? '✉ HOD Circulars' : t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleOpenDetails(notif)}
            className={`p-5 rounded-3xl border flex items-start justify-between gap-4 transition-all cursor-pointer hover:shadow-md ${
              notif.type === 'HOD_MAIL'
                ? notif.isRead
                  ? 'bg-teal-50/50 border-teal-200 hover:border-teal-300'
                  : 'bg-teal-50 border-teal-300 shadow-sm hover:border-teal-400'
                : notif.isRead
                ? 'bg-white border-[#E9EAF0] opacity-85 hover:border-[#625BEB]/30'
                : 'bg-[#D9D1F5]/25 border-[#A99AE8]/40 shadow-xs hover:border-[#625BEB]/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-2.5 rounded-2xl shrink-0 mt-0.5 border ${
                  notif.type === 'HOD_MAIL'
                    ? 'bg-teal-100 text-teal-800 border-teal-300'
                    : 'bg-[#D9D1F5]/60 text-[#625BEB] border-[#A99AE8]/40'
                }`}
              >
                {notif.type === 'HOD_MAIL' ? (
                  <Mail className="w-5 h-5 text-teal-700" />
                ) : notif.type === 'RISK' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                ) : notif.type === 'ATTENDANCE' ? (
                  <CalendarCheck className="w-5 h-5 text-[#35C979]" />
                ) : (
                  <Award className="w-5 h-5 text-[#625BEB]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#292C32]">
                    {notif.title}
                  </h3>
                  {notif.type === 'HOD_MAIL' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-300">
                      HOD Official Mail
                    </span>
                  )}
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#8B6DE9]" />
                  )}
                </div>
                <p className="text-xs text-[#85878F] mt-1 leading-relaxed line-clamp-2">
                  {notif.message}
                </p>
                <span className="text-[10px] text-[#85878F] block mt-2 font-mono">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* View Details Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenDetails(notif)
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#292C32] hover:text-white text-[#292C32] border border-[#E9EAF0] text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-100">
            No notifications found under this category.
          </div>
        )}
      </div>

      {/* Notification / Memo Reader Modal */}
      {selectedNotif && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedNotif(null)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E9EAF0] space-y-5 animate-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E9EAF0] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    selectedNotif.type === 'HOD_MAIL'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-purple-100 text-[#625BEB]'
                  }`}
                >
                  {selectedNotif.type === 'HOD_MAIL' ? (
                    <Mail className="w-6 h-6 text-teal-700" />
                  ) : (
                    <Bell className="w-6 h-6 text-[#625BEB]" />
                  )}
                </div>
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-1 ${
                      selectedNotif.type === 'HOD_MAIL'
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : 'bg-purple-100 text-[#625BEB]'
                    }`}
                  >
                    {selectedNotif.type === 'HOD_MAIL'
                      ? 'Official HOD Circular'
                      : `${selectedNotif.type} ALERT`}
                  </span>
                  <h3 className="text-base font-black text-[#292C32] leading-snug">
                    {selectedNotif.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 rounded-lg text-[#85878F] hover:bg-[#F2F3F5] hover:text-[#292C32] cursor-pointer transition-colors"
                aria-label="Close memo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Bar */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9EAF0] flex items-center justify-between text-xs text-[#85878F]">
              <span>
                Timestamp:{' '}
                <strong className="text-[#292C32]">
                  {new Date(selectedNotif.createdAt).toLocaleString()}
                </strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                ✓ Read & Acknowledged
              </span>
            </div>

            {/* Memo Message Content */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#292C32] leading-relaxed whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
              {selectedNotif.message}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-[#E9EAF0]">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl border border-[#E9EAF0] hover:bg-[#F2F3F5] text-xs font-bold text-[#292C32] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy notification text"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#85878F]" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              {selectedNotif.linkUrl &&
                selectedNotif.linkUrl !== '/faculty/notifications' && (
                  <Link
                    href={selectedNotif.linkUrl}
                    onClick={() => setSelectedNotif(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[#625BEB] hover:bg-[#5249D8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open Module Action</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}

              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Close Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

