'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Bell,
  CheckCircle2,
  AlertTriangle,
  CalendarCheck,
  Award,
  ChevronDown,
  User,
  Edit3,
  LogOut,
} from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  linkUrl?: string | null
  createdAt: string | Date
}

interface FacultyHeaderProps {
  onToggleSidebar: () => void
  userRole?: string
  userName?: string
  userDesignation?: string
  userAvatar?: string
  notifications?: NotificationItem[]
}

export function FacultyHeader({
  onToggleSidebar,
  userName = 'Dr. Arvind Sharma',
  userDesignation = 'Professor & HOD, CSE',
  userAvatar,
  notifications = [],
}: FacultyHeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/?logged_out=1')
      router.refresh()
    } catch (e) {
      console.error(e)
      window.location.href = '/'
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#FCFBF7]/90 dark:bg-[#151718]/90 backdrop-blur-md border-b border-[#E8DECE] dark:border-[#383C3F]">
      {/* Left items: Mobile toggle & Academic Session Selector */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-[#6A6E72] hover:text-[#2A2D2F] dark:hover:text-[#FCFBF7] hover:bg-[#FFF3C8]/40 dark:hover:bg-[#222527] lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Academic Session Selector Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF3C8]/40 dark:bg-[#222527] border border-[#E8DECE] dark:border-[#383C3F] text-xs font-semibold text-[#2A2D2F] dark:text-[#FCFBF7]">
          <span className="w-2 h-2 rounded-full bg-[#E5CB90] animate-pulse" />
          <span>AY 2025-26</span>
          <span className="text-[#E5CB90]">•</span>
          <span className="text-[#E5CB90] font-bold">Odd Sem (V)</span>
          <span className="text-[#E5CB90]">•</span>
          <span>Dept. CSE</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Direct Log Out quick button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out of Faculty Portal"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-[#E5CB90] hover:bg-[#E5CB90]/10 border border-[#E5CB90]/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className="relative p-2 rounded-xl text-[#6A6E72] hover:text-[#2A2D2F] dark:hover:text-[#FCFBF7] hover:bg-[#FFF3C8]/40 dark:hover:bg-[#222527] transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E5CB90] text-[#151718] text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FCFBF7] dark:bg-[#222527] border border-[#E8DECE] dark:border-[#383C3F] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8DECE] dark:border-[#383C3F] bg-[#FFF3C8]/30 dark:bg-[#151718]/60">
                <span className="text-xs font-bold text-[#2A2D2F] dark:text-[#FCFBF7]">
                  Notifications ({unreadCount} new)
                </span>
                <Link
                  href="/faculty/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-[#E5CB90] hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E8DECE] dark:divide-[#383C3F]">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.linkUrl || '/faculty/notifications'}
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-3 p-3.5 hover:bg-[#FFF3C8]/20 dark:hover:bg-[#151718]/60 transition-colors"
                    >
                      <div className="p-2 rounded-xl bg-[#E5CB90]/20 text-[#E5CB90] shrink-0 mt-0.5">
                        {notif.type === 'RISK' ? (
                          <AlertTriangle className="w-4 h-4 text-[#E5CB90]" />
                        ) : notif.type === 'ATTENDANCE' ? (
                          <CalendarCheck className="w-4 h-4 text-[#FFF3C8]" />
                        ) : (
                          <Award className="w-4 h-4 text-[#E5CB90]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#2A2D2F] dark:text-[#FCFBF7] truncate">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-[#6A6E72] dark:text-[#A8ACAF] line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#A8ACAF]">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#FFF3C8]/30 dark:hover:bg-[#222527] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-[#E5CB90] to-[#FFF3C8] border border-[#E5CB90]/40 flex items-center justify-center font-black text-[#151718] text-xs shrink-0 shadow-xs">
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0)
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#2A2D2F] dark:text-[#FCFBF7] leading-tight">
                {userName}
              </p>
              <p className="text-[10px] text-[#6A6E72] dark:text-[#A8ACAF] leading-tight">
                {userDesignation}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#A8ACAF] hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FCFBF7] dark:bg-[#222527] border border-[#E8DECE] dark:border-[#383C3F] shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-[#E8DECE] dark:border-[#383C3F]">
                <p className="text-xs font-bold text-[#2A2D2F] dark:text-[#FCFBF7]">{userName}</p>
                <p className="text-[11px] text-[#6A6E72] dark:text-[#A8ACAF] truncate">{userDesignation}</p>
              </div>
              <Link
                href="/faculty/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#2A2D2F] dark:text-[#FCFBF7] hover:bg-[#FFF3C8]/30 dark:hover:bg-[#151718]"
              >
                <User className="w-4 h-4 text-[#E5CB90]" />
                Faculty Profile & Dossier
              </Link>
              <Link
                href="/faculty/profile?edit=true"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#2A2D2F] dark:text-[#FCFBF7] hover:bg-[#FFF3C8]/30 dark:hover:bg-[#151718]"
              >
                <Edit3 className="w-4 h-4 text-[#E5CB90]" />
                Edit Personal Details
              </Link>
              <div className="border-t border-[#E8DECE] dark:border-[#383C3F] my-1" />
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  handleLogout()
                }}
                disabled={loggingOut}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#E5CB90] hover:bg-[#E5CB90]/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="font-bold">{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
