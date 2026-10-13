'use client'

import React, { useState, useEffect } from 'react'
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
  X,
  Copy,
  Check,
  Trash2,
  Square,
  CheckSquare,
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

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

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'VERIFIED') return n.isRead
    if (filter === 'UNVERIFIED') return !n.isRead
    if (filter !== 'ALL' && n.type !== filter) return false
    return true
  })

  // Toggle Verified Checkbox for a notification
  const handleToggleVerified = async (notifId: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const newStatus = !currentStatus

    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: newStatus } : n))
    )

    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notifId, isRead: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      showFeedback(newStatus ? 'Message marked as Verified ✓' : 'Message marked as Unverified')
    } catch {
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: currentStatus } : n))
      )
      alert('Failed to update verification status.')
    }
  }

  // Delete a single notification
  const handleDelete = async (notifId: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const isConfirmed = confirm(`Delete this message?\n\n"${title}"`)
    if (!isConfirmed) return

    setDeletingId(notifId)
    try {
      const res = await fetch(`/api/notifications?id=${notifId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete message')
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notifId))
      if (selectedNotif?.id === notifId) {
        setSelectedNotif(null)
      }
      showFeedback('Message permanently deleted.')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete notification')
    } finally {
      setDeletingId(null)
    }
  }

  // Delete all verified/read notifications
  const handleDeleteAllRead = async () => {
    const verifiedCount = notifications.filter((n) => n.isRead).length
    if (verifiedCount === 0) {
      alert('There are no verified messages to delete.')
      return
    }

    const isConfirmed = confirm(`Are you sure you want to delete all ${verifiedCount} verified message(s)?`)
    if (!isConfirmed) return

    try {
      const res = await fetch('/api/notifications?allRead=true', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete verified messages')

      setNotifications((prev) => prev.filter((n) => !n.isRead))
      showFeedback(`Successfully deleted ${verifiedCount} verified message(s).`)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete verified messages')
    }
  }

  // Mark all as read/verified
  const markAllRead = async () => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    showFeedback('All messages verified ✓')
    router.refresh()
  }

  const handleOpenDetails = async (notif: any) => {
    setSelectedNotif(notif)
    setCopied(false)

    if (!notif.isRead) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id, isRead: true }),
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
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E293B] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {feedback}
        </div>
      )}

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
            Real-time verified triggers for departmental circulars, attendance notices, and academic memos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 backdrop-blur-md transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Verify All</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>Delete Verified</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs w-fit flex-wrap">
        {[
          { key: 'ALL', label: 'All Alerts' },
          { key: 'HOD_MAIL', label: '✉ HOD Circulars' },
          { key: 'RISK', label: '⚠ Risk Warnings' },
          { key: 'ATTENDANCE', label: '📅 Attendance' },
          { key: 'ASSESSMENT', label: '🏆 Assessment' },
          { key: 'VERIFIED', label: '✓ Verified' },
          { key: 'UNVERIFIED', label: 'Pending' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => {
          const isVerified = notif.isRead

          return (
            <div
              key={notif.id}
              onClick={() => handleOpenDetails(notif)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isVerified
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400 shadow-xs'
              }`}
            >
              {/* Left Column: Checkbox, Icon, Content */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Verified Checkbox */}
                <button
                  type="button"
                  title={isVerified ? 'Click to unverify' : 'Click to verify message'}
                  onClick={(e) => handleToggleVerified(notif.id, isVerified, e)}
                  className="mt-1 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  {isVerified ? (
                    <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-emerald-500 bg-white" />
                  )}
                </button>

                {/* Type Icon */}
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                    notif.type === 'HOD_MAIL'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : notif.type === 'RISK'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : notif.type === 'ATTENDANCE'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-purple-50 text-purple-600 border-purple-200'
                  }`}
                >
                  {notif.type === 'HOD_MAIL' ? (
                    <Mail className="w-4 h-4" />
                  ) : notif.type === 'RISK' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : notif.type === 'ATTENDANCE' ? (
                    <CalendarCheck className="w-4 h-4" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                </div>

                {/* Message Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      {notif.title}
                    </h3>

                    {notif.type === 'HOD_MAIL' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                        HOD Official Mail
                      </span>
                    )}

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  {/* Message Body - Clear, crisp, 100% readable text */}
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                    {notif.message}
                  </p>

                  <span className="text-[11px] text-slate-500 block mt-1.5 font-mono">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Right Column: Actions (Details & Delete) */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenDetails(notif)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  title="Delete message"
                  disabled={deletingId === notif.id}
                  onClick={(e) => handleDelete(notif.id, notif.title, e)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
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
                      : selectedNotif.type}
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedNotif.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>Received: {new Date(selectedNotif.createdAt).toLocaleString()}</span>
                <span className="font-bold text-slate-700">Ref #{selectedNotif.id.slice(-6)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap font-sans text-xs">
                {selectedNotif.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedNotif.id, selectedNotif.title)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#1E293B] hover:bg-black text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
