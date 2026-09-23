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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-600" />
            <span>Academic Notifications & System Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time triggers for attendance anomalies, assessment submissions, and critical student risks.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs w-fit">
        {['ALL', 'RISK', 'ATTENDANCE', 'ASSESSMENT'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === t
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                {notif.type === 'RISK' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                ) : notif.type === 'ATTENDANCE' ? (
                  <CalendarCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Award className="w-5 h-5 text-indigo-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {notif.title}
                  </h3>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {notif.message}
                </p>
                <span className="text-[10px] text-slate-400 block mt-2">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {notif.linkUrl && (
              <Link
                href={notif.linkUrl}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
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
