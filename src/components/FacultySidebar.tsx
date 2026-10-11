'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Calendar,
  BookOpen,
  GitFork,
  GraduationCap,
  FileQuestion,
  Sparkles,
  CheckCircle2,
  BarChart3,
  History,
  TrendingUp,
  Compass,
  FolderArchive,
  AlertTriangle,
  FileSpreadsheet,
  Bell,
  UserCheck,
  Settings,
  Award,
  ChevronRight,
  ShieldCheck,
  Video,
  KeyRound,
  LogOut,
} from 'lucide-react'

interface FacultySidebarProps {
  isOpen: boolean
  onClose: () => void
  pendingEvaluationsCount?: number
  atRiskCount?: number
  activeSessionExists?: boolean
}

export function FacultySidebar({
  isOpen,
  onClose,
  pendingEvaluationsCount = 1,
  atRiskCount = 3,
  activeSessionExists = true,
}: FacultySidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      onClose()
      router.push('/?logged_out=1')
      router.refresh()
    } catch (e) {
      console.error(e)
      window.location.href = '/'
    } finally {
      setLoggingOut(false)
    }
  }

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/faculty', icon: LayoutDashboard },
      ],
    },
    {
      title: 'ACADEMIC OPERATIONS',
      items: [
        {
          label: 'Attendance Engine',
          href: '/faculty/attendance',
          icon: CalendarCheck,
          badge: activeSessionExists ? 'LIVE' : undefined,
          badgeColor: 'bg-[#35C979] text-white animate-pulse',
        },
        {
          label: 'Face ID Generator',
          href: '/faculty/face-id',
          icon: KeyRound,
          badge: 'NEW',
          badgeColor: 'bg-[#D9D1F5] text-[#625BEB] font-bold',
        },
        { label: 'Weekly Timetable', href: '/faculty/timetable', icon: Calendar },
        { label: 'Subjects & Credits', href: '/faculty/subjects', icon: BookOpen },
        { label: 'Syllabus Hierarchy', href: '/faculty/syllabus', icon: GitFork },
      ],
    },
    {
      title: 'STUDENTS & MENTORSHIP',
      items: [
        { label: 'Student Directory', href: '/faculty/students', icon: Users },
        { label: 'Topic & Subject Mastery', href: '/faculty/progress', icon: TrendingUp },
        {
          label: 'Academic Risk Engine',
          href: '/faculty/academic-risk',
          icon: AlertTriangle,
          badge: atRiskCount > 0 ? `${atRiskCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { label: 'AI Learning Paths', href: '/faculty/learning-paths', icon: Compass },
      ],
    },
    {
      title: 'ASSESSMENTS & EVALUATION',
      items: [
        { label: 'Question Bank', href: '/faculty/questions', icon: FileQuestion },
        {
          label: 'AI Quiz Generator',
          href: '/faculty/quiz-generator',
          icon: Sparkles,
          badge: 'Gemini',
          badgeColor: 'bg-[#8B6DE9] text-white',
        },
        { label: 'Assessments Builder', href: '/faculty/assessments', icon: Award },
        {
          label: 'Evaluation Suite',
          href: '/faculty/evaluation',
          icon: CheckCircle2,
          badge: pendingEvaluationsCount > 0 ? `${pendingEvaluationsCount}` : undefined,
          badgeColor: 'bg-[#625BEB] text-white',
        },
        { label: 'Quiz & Topic Analysis', href: '/faculty/quiz-analysis', icon: BarChart3 },
        { label: 'Test History Log', href: '/faculty/test-history', icon: History },
      ],
    },
    {
      title: 'RECORDS & ANALYTICS',
      items: [
        { label: 'Semester Results', href: '/faculty/results', icon: GraduationCap },
        { label: 'Reports & Exports', href: '/faculty/reports', icon: FileSpreadsheet },
        { label: 'Learning Courses', href: '/faculty/resources', icon: Video },
      ],
    },
    {
      title: 'SYSTEM & PROFILE',
      items: [
        { label: 'Notifications', href: '/faculty/notifications', icon: Bell },
        { label: 'Personal Details & Profile', href: '/faculty/profile', icon: UserCheck },
      ],
    },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-[#292C32] flex flex-col border-r border-[#E9EAF0] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#E9EAF0] bg-white">
          <Link href="/faculty" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white font-bold shadow-md shadow-[#8B6DE9]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#292C32] flex items-center gap-1.5">
                EduSync <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#D9D1F5]/50 text-[#625BEB] font-bold border border-[#D9D1F5]">AI</span>
              </span>
              <p className="text-[10px] text-[#85878F] font-medium">Faculty Operations Suite</p>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-black tracking-wider text-[#8B6DE9] uppercase">
                {section.title}
              </p>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/faculty' && pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#8B6DE9] text-white font-bold shadow-md shadow-[#8B6DE9]/20'
                          : 'text-[#292C32] hover:text-[#292C32] hover:bg-[#F2F3F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-[#85878F] group-hover:text-[#292C32]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.badgeColor || (isActive ? 'bg-[#625BEB] text-white' : 'bg-[#F2F3F5] text-[#292C32]')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!isActive && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#85878F]" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Direct Mobile Sign Out button */}
          <div className="pt-3 pb-2 border-t border-[#E9EAF0]">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-200/60 bg-rose-50/40 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>{loggingOut ? 'Signing out...' : 'Sign Out of Faculty Portal'}</span>
              </div>
              <span className="text-[10px] text-rose-400 font-normal">End session</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}
