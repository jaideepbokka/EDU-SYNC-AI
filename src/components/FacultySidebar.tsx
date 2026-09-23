'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
          badgeColor: 'bg-emerald-500 text-white animate-pulse',
        },
        {
          label: 'Face ID Generator',
          href: '/faculty/face-id',
          icon: KeyRound,
          badge: 'NEW',
          badgeColor: 'bg-[#E5CB90] text-[#151718] font-black',
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
          badgeColor: 'bg-indigo-600 text-white',
        },
        { label: 'Assessments Builder', href: '/faculty/assessments', icon: Award },
        {
          label: 'Evaluation Suite',
          href: '/faculty/evaluation',
          icon: CheckCircle2,
          badge: pendingEvaluationsCount > 0 ? `${pendingEvaluationsCount}` : undefined,
          badgeColor: 'bg-sky-500 text-white',
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#151718] text-[#D8D4CA] flex flex-col border-r border-[#383C3F] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#383C3F] bg-[#151718]">
          <Link href="/faculty" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E5CB90] via-[#EBD4A4] to-[#FFF3C8] flex items-center justify-center text-[#151718] font-bold shadow-md shadow-[#E5CB90]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#FCFBF7] flex items-center gap-1.5">
                EduSync <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] font-bold border border-[#E5CB90]/30">AI</span>
              </span>
              <p className="text-[10px] text-[#A8ACAF] font-medium">Faculty Operations Suite</p>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-black tracking-wider text-[#E5CB90] uppercase">
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
                          ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black shadow-md shadow-[#E5CB90]/25'
                          : 'text-[#A8ACAF] hover:text-[#FCFBF7] hover:bg-[#222527]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#151718]' : 'text-[#A8ACAF] group-hover:text-[#FCFBF7]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.badgeColor || 'bg-[#222527] text-[#FCFBF7]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!isActive && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#6A6E72]" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Student Switcher Helper */}
        <div className="p-4 border-t border-[#383C3F] bg-[#151718]">
          <div className="rounded-xl bg-[#222527] border border-[#383C3F] p-3 shadow-inner">
            <p className="text-[11px] font-bold text-[#FCFBF7]">Student Simulation Room</p>
            <p className="text-[10px] text-[#A8ACAF] mt-0.5">
              Experience the student check-in webcam & quiz attempt workflow directly.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <Link
                href="/student/attendance"
                className="flex-1 text-center py-1.5 px-2 rounded-lg bg-[#E5CB90]/15 hover:bg-[#E5CB90]/30 text-[#FFF3C8] text-[10px] font-bold border border-[#E5CB90]/30 transition-colors"
              >
                Face GPS Check-in
              </Link>
              <Link
                href="/student/courses"
                className="flex-1 text-center py-1.5 px-2 rounded-lg bg-[#FFF3C8]/15 hover:bg-[#FFF3C8]/30 text-[#FFF3C8] text-[10px] font-bold border border-[#FFF3C8]/30 transition-colors"
              >
                Learning Courses
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
