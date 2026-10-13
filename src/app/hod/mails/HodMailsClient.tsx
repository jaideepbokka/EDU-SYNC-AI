'use client'

import React, { useState } from 'react'
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  Sparkles,
  Inbox,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

interface HodMailsClientProps {
  facultyList: any[]
  initialSentMails: any[]
  hodUser: any
}

export function HodMailsClient({
  facultyList,
  initialSentMails,
  hodUser,
}: HodMailsClientProps) {
  const [recipientType, setRecipientType] = useState<'ALL' | 'FACULTY'>('ALL')
  const [selectedFacultyId, setSelectedFacultyId] = useState(facultyList[0]?.id || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [sentMails, setSentMails] = useState(initialSentMails)

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/hod/mails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          facultyId: recipientType === 'FACULTY' ? selectedFacultyId : undefined,
          subject,
          message,
          priority,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email')

      setFeedback({
        type: 'success',
        text: data.message || `Dispatched to ${data.recipientCount} faculty member(s)!`,
      })

      // Reset form
      setSubject('')
      setMessage('')

      // Refresh sent list
      const updatedListRes = await fetch('/api/hod/mails')
      const updatedData = await updatedListRes.json()
      if (updatedData.mails) {
        setSentMails(updatedData.mails)
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error sending mail' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#D9EFEA] pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#134E4A] tracking-tight flex items-center gap-2.5">
          <Mail className="w-7 h-7 text-[#0D9488]" />
          <span>Faculty Communication & Institutional Circulars</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#0D9488] font-medium mt-0.5">
          Send official departmental memos and notices. Delivered instantly to faculty notifications.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Grid: Mail Composer & Delivery Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Compose Mail */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D9EFEA] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-[#1E293B] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0D9488]" />
              <span>Compose Department Circular / Mail</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0D9488] border border-teal-200">
              Direct Push Notification
            </span>
          </div>

          <form onSubmit={handleSendMail} className="space-y-4 text-xs">
            {/* Recipient Selection */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-1.5">
                Target Recipient(s) *
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setRecipientType('ALL')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    recipientType === 'ALL'
                      ? 'border-[#0D9488] bg-teal-50 text-[#0D9488]'
                      : 'border-slate-200 text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All CSE Faculty ({facultyList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('FACULTY')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    recipientType === 'FACULTY'
                      ? 'border-[#0D9488] bg-teal-50 text-[#0D9488]'
                      : 'border-slate-200 text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  <span>Individual Faculty</span>
                </button>
              </div>

              {recipientType === 'FACULTY' && (
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-[#1E293B] focus:border-[#0D9488] focus:outline-hidden"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.user.name} ({f.designation}) - {f.user.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Priority selection */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-1">
                Notice Classification / Urgency
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'NORMAL'}
                    onChange={() => setPriority('NORMAL')}
                    className="accent-[#0D9488]"
                  />
                  <span className="font-bold text-[#1E293B]">Normal Academic Notice</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'URGENT'}
                    onChange={() => setPriority('URGENT')}
                    className="accent-[#0D9488]"
                  />
                  <span className="font-bold text-rose-600">🚨 Urgent Action Memo</span>
                </label>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-1">
                Subject Line *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Submission of Mid-Term Question Papers & Answer Keys"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-1">
                Circular Message Body *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Write the official memo content here... All designated faculty will receive an immediate push alert in their notifications inbox."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-black shadow-md shadow-[#0D9488]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting Memo...' : 'Send Official Mail / Notice'}</span>
            </button>
          </form>
        </div>

        {/* Right Column (5 cols): Outbox Feed & Verification Notice */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#E6F7F3] border border-[#99F6E4] text-[#0F766E] space-y-2">
            <h3 className="text-xs font-black flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Faculty Notification Sync System</span>
            </h3>
            <p className="text-[11px] leading-relaxed">
              When you send a mail here, it is directly registered in the institutional notification ledger. When faculty log in to their portal and open their <strong>Notifications section</strong>, this mail will appear under <strong>✉ HOD Circulars</strong> with priority highlighting.
            </p>
          </div>

          {/* Outbox List */}
          <div className="bg-white rounded-3xl border border-[#D9EFEA] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-black text-[#1E293B] flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-[#0D9488]" />
                <span>Recent Dispatched Circulars</span>
              </h3>
              <span className="text-[10px] text-[#64748B] font-bold">
                {sentMails.length} Total
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {sentMails.map((mail) => (
                <div
                  key={mail.id}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1 hover:border-teal-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#1E293B] truncate flex-1">
                      {mail.title}
                    </p>
                    <span className="text-[9px] font-mono text-[#64748B] shrink-0">
                      {new Date(mail.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] line-clamp-2">
                    {mail.message}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-[#0D9488] font-bold">
                    <span>Delivered to: {mail.user?.name || 'Faculty Member'}</span>
                    <span className="text-[9px] text-slate-400">
                      {mail.isRead ? 'Read by Faculty' : 'Unread'}
                    </span>
                  </div>
                </div>
              ))}

              {sentMails.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  No circulars dispatched yet. Compose your first message above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
