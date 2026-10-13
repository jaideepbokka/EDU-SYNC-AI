'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShieldCheck,
  LayoutDashboard,
  Video,
  Camera,
  Award,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  User,
  CreditCard,
} from 'lucide-react'

interface StudentNavProps {
  user: any
}

export function StudentNav({ user }: StudentNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  // Close drawer on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch {
      window.location.href = '/'
    }
  }

  const navLinks = [
    {
      label: 'Student Dashboard',
      href: '/student',
      icon: LayoutDashboard,
      description: 'Overview, CGPA & attendance stats',
    },
    {
      label: 'Learning Courses',
      href: '/student/courses',
      icon: Video,
      description: 'Faculty masterclasses & video modules',
    },
    {
      label: 'Face GPS Check-In',
      href: '/student/attendance',
      icon: Camera,
      description: 'Biometric 3D face verification',
      badge: 'LIVE NOW',
      badgeColor: 'bg-[#35C979] text-white animate-pulse',
    },
    {
      label: 'Assessments Room',
      href: '/student/assessments',
      icon: Award,
      description: 'Scheduled quizzes & AI instant grading',
    },
    {
      label: 'Fees Details',
      href: '/student/fees',
      icon: CreditCard,
      description: 'Semester tuition fees & receipts',
      badge: 'MIN ₹55,000',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 font-bold',
    },
  ]

  const enrolledSubjects = [
    { code: 'DWDM', name: 'Data Warehousing & Data Mining', status: 'Live Session' },
    { code: 'CC', name: 'Cloud Computing & Services', status: 'Units 1-4' },
    { code: 'AI', name: 'Artificial Intelligence & ML', status: 'Quiz Active' },
  ]

  const studentName = user?.name || 'Aarav Reddy'
  const studentInitial = studentName.charAt(0).toUpperCase()
  const studentRoll = user?.designation || 'Roll No: 101 • Semester 6 (Sec A)'
  const deptCode = user?.departmentCode || 'CSE'

  const drawerContent = (
    <div className="h-full flex flex-col justify-between bg-white overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#E9EAF0] flex items-center justify-between bg-[#F8F9FA]">
          <Link
            href="/student"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white shadow-md shadow-[#8B6DE9]/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[#292C32]">EduSync</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] font-bold border border-[#A99AE8]/40">
                  STUDENT
                </span>
              </div>
              <p className="text-[10px] font-bold text-[#85878F] uppercase tracking-wider">
                Academic Portal
              </p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation menu"
            className="md:hidden p-2.5 rounded-xl text-[#85878F] hover:text-[#292C32] hover:bg-white border border-transparent hover:border-[#E9EAF0] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Quick Profile Card */}
        <div className="p-4 sm:p-5 border-b border-[#E9EAF0] bg-gradient-to-b from-[#FAF9FF] to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-[#8B6DE9]/20">
              {studentInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#292C32] truncate">{studentName}</p>
              <p className="text-[11px] text-[#85878F] truncate font-medium">{studentRoll}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-[#D9D1F5]/70 text-[#625BEB] border border-[#A99AE8]/40">
              {deptCode}
            </span>
          </div>

          {/* Mini Academic Stats Row */}
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-[#E9EAF0] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase font-black text-[#85878F] tracking-wider">Attendance</p>
                <p className="text-sm font-black text-[#35C979]">100%</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#35C979] animate-pulse" />
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E9EAF0] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase font-black text-[#85878F] tracking-wider">CGPA</p>
                <p className="text-sm font-black text-[#8B6DE9]">7.80</p>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-[#8B6DE9]" />
            </div>
          </div>
        </div>

        {/* Live Attendance Shortcut Banner */}
        <div className="p-4 sm:p-5 border-b border-[#E9EAF0]">
          <Link
            href="/student/attendance"
            onClick={() => setIsMobileOpen(false)}
            className="block p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 hover:border-emerald-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Live Attendance Active
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-bold text-[#292C32]">DWDM Lecture in Progress</p>
            <p className="text-[10px] text-[#85878F] mt-0.5">Tap here to verify Face & Geofence now</p>
          </Link>
        </div>

        {/* Section: Main Student Navigation Menu */}
        <div className="p-4 sm:p-5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#85878F] px-1 mb-2">
            Student Portal Contents
          </p>

          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8B6DE9] text-white font-bold shadow-md shadow-[#8B6DE9]/25'
                      : 'text-[#292C32] hover:bg-[#F2F3F5]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F2F3F5] text-[#625BEB] group-hover:bg-[#D9D1F5]/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : 'text-[#292C32]'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] leading-tight mt-0.5 truncate ${isActive ? 'text-purple-100' : 'text-[#85878F]'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.badge ? (
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'text-white opacity-100' : 'text-[#85878F]'
                      }`}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Section: Enrolled Subjects Directory */}
        <div className="p-4 sm:p-5 border-t border-[#E9EAF0] space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#85878F] px-1 mb-2">
            Enrolled Courses (Sem VI)
          </p>

          <div className="space-y-1.5">
            {enrolledSubjects.map((subject) => (
              <Link
                key={subject.code}
                href="/student/courses"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2F3F5] border border-transparent hover:border-[#E9EAF0] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-[#D9D1F5]/50 text-[#625BEB] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {subject.code}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#292C32] truncate">{subject.name}</p>
                    <p className="text-[10px] text-[#85878F]">{subject.status}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#85878F] shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Logout */}
      <div className="p-4 sm:p-5 border-t border-[#E9EAF0] bg-[#FAF9FF] space-y-3">
        <div className="flex items-center justify-between text-[11px] text-[#85878F]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#35C979]" />
            <strong className="text-[#292C32]">Zero-Trust SSO</strong>
          </span>
          <span className="font-mono text-[10px] font-bold text-[#625BEB]">AY 2025-26</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white hover:bg-rose-50 border border-[#E9EAF0] hover:border-rose-200 text-rose-600 font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Student Portal</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex w-72 h-screen sticky top-0 shrink-0 flex-col z-30 border-r border-[#E9EAF0]">
        {drawerContent}
      </aside>

      {/* Mobile Top Navbar with Hamburger Toggle */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9EAF0] px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/student" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-[#292C32]">EduSync Student</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#35C979] animate-pulse" />
            </div>
            <p className="text-[9px] font-bold text-[#85878F] -mt-0.5">Academic Portal</p>
          </div>
        </Link>

        {/* The Three Lines Hamburger Button */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Toggle student portal contents menu"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] active:scale-95 text-[#292C32] border border-[#E9EAF0] transition-all cursor-pointer shadow-xs"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5 text-[#625BEB]" />
          ) : (
            <Menu className="w-5 h-5 text-[#292C32]" />
          )}
          <span className="text-xs font-bold text-[#292C32]">Menu</span>
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[9999] flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#292C32]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Slide-in Navigation Panel */}
          <div className="relative w-[85vw] max-w-xs h-full bg-white shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200">
            {drawerContent}
          </div>
        </div>
      )}
    </>
  )
}
