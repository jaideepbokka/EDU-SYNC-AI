'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BookOpen,
  GraduationCap,
  Settings,
  FileSpreadsheet,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Building2,
  FolderOpen,
} from 'lucide-react'

interface HodNavProps {
  user: any
}

export function HodNav({ user }: HodNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    window.location.href = '/'
  }

  const navItems = [
    {
      label: 'Department Overview',
      href: '/hod',
      icon: LayoutDashboard,
    },
    {
      label: 'CSE Student Directory',
      href: '/hod/students',
      icon: Users,
    },
    {
      label: 'Section-wise Analytics',
      href: '/hod/analytics',
      icon: BarChart3,
    },
    {
      label: 'Faculty Management',
      href: '/hod/faculty',
      icon: BookOpen,
    },
    {
      label: 'Teaching Assignments',
      href: '/hod/assignments',
      icon: Settings,
    },
    {
      label: 'Faculty Mails & Notices',
      href: '/hod/mails',
      icon: Mail,
    },
    {
      label: 'Export Reports (CSV/PDF)',
      href: '/hod/reports',
      icon: FileSpreadsheet,
    },
  ]

  const userName = user?.name || 'karthikeya'
  const userInitial = userName.charAt(0).toLowerCase()

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#F4FBF9] text-[#292C32] border-r border-[#D9EFEA]">
      <div className="p-5 space-y-6">
        {/* HOD Profile Header */}
        <div className="pt-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#0F766E]/80">
            HOD PORTAL
          </p>
          <h2 className="text-xl font-black text-[#134E4A] tracking-tight mt-0.5">
            {userName}
          </h2>
          <p className="text-xs text-[#0D9488] font-medium">
            CSE • Head of Department
          </p>
        </div>

        {/* Navigation items matching user reference image */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#14B8A6] text-white shadow-sm'
                    : 'text-[#334155] hover:bg-[#E6F7F3] hover:text-[#0F766E]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#0D9488]'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-5 border-t border-[#D9EFEA] text-[11px] text-[#64748B] flex flex-col gap-3 bg-[#EAF7F4]">
        <p className="font-bold text-[#0F766E]">EduSync AI • CSE Department</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 border border-[#D9EFEA] hover:border-rose-200 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        {/* Left Brand: EduSync AI */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/hod" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#134E4A] flex items-center gap-1.5">
                  EduSync <span className="text-xs px-2 py-0.5 rounded-md bg-[#CCFBF1] text-[#0D9488] font-black border border-[#99F6E4]">AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100/70 text-[#0F766E] font-bold border border-teal-200">
                  HOD CSE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#64748B] leading-tight">
                Academic Operations & Biometric Management Suite
              </p>
            </div>
          </Link>
        </div>

        {/* Right User Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-black text-[#1E293B]">{userName}</span>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] px-2 py-0.2 rounded-md bg-[#F1F5F9] text-[#475569] font-bold">
                Department HOD
              </span>
              <span className="text-[10px] font-bold text-[#0D9488]">CSE</span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#CCFBF1] text-[#0D9488] font-black text-sm flex items-center justify-center border border-[#99F6E4] shadow-xs">
            {userInitial}
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-[#64748B] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-[calc(100vh-61px)] sticky top-[61px] shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-white z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
