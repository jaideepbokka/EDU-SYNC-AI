'use client'

import React, { useState } from 'react'
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
          onClick={markAllRead}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs w-fit">
        {['ALL', 'RISK', 'ATTENDANCE', 'ASSESSMENT'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === t
                ? 'bg-[#292C32] text-white shadow-xs'
                : 'text-[#85878F] hover:bg-[#F2F3F5]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => (
          <div
            key={notif.id}
            className={`p-5 rounded-3xl border flex items-start justify-between gap-4 transition-all ${
              notif.isRead
                ? 'bg-white border-[#E9EAF0] opacity-80'
                : 'bg-[#D9D1F5]/25 border-[#A99AE8]/40 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-2xl bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 shrink-0 mt-0.5">
                {notif.type === 'RISK' ? (
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
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#8B6DE9]" />
                  )}
                </div>
                <p className="text-xs text-[#85878F] mt-1 leading-relaxed">
                  {notif.message}
                </p>
                <span className="text-[10px] text-[#85878F] block mt-2">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {notif.linkUrl && (
              <Link
                href={notif.linkUrl}
                className="px-3.5 py-1.5 rounded-xl bg-[#F2F3F5] hover:bg-[#292C32] hover:text-white text-[#292C32] border border-[#E9EAF0] text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

