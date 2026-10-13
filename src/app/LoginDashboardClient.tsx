'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Camera,
  AlertTriangle,
  KeyRound,
  Building2,
  CheckCircle2,
  Play,
  Plus,
  Film,
} from 'lucide-react'
import { CustomVideoModal } from '@/components/CustomVideoModal'
import { hasCustomVideoSync } from '@/lib/customVideoStorage'

interface LoginDashboardClientProps {
  initialRole?: 'HOD' | 'FACULTY' | 'STUDENT'
  errorMessage?: string
}

export function LoginDashboardClient({
  initialRole = 'HOD',
  errorMessage,
}: LoginDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'HOD' | 'FACULTY' | 'STUDENT'>(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorMessage || '')
  const [showCustomVideoModal, setShowCustomVideoModal] = useState(false)
  const [hasCustomVideo, setHasCustomVideo] = useState(false)

  useEffect(() => {
    setHasCustomVideo(hasCustomVideoSync())
  }, [])

  const handleLogin = async (loginEmail: string, loginPass?: string, role = activeTab) => {
    setError('')
    setLoading(true)

    const finalEmail = (loginEmail || '').trim()
    const finalPass = loginPass || ''

    if (!finalEmail || !finalPass) {
      setError('Please enter both your institutional ID/email and password.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          password: finalPass,
          role,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.')
      }

      // Hard redirect to load role layouts cleanly
      window.location.href = data.redirectUrl || (role === 'STUDENT' ? '/student' : role === 'HOD' ? '/hod' : '/faculty')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(email, password, activeTab)
  }

  const fillHodDemo = () => {
    setEmail('HODCSE001@gmail.com')
    setPassword('HOD001')
    setError('')
  }

  const fillStudentDemo = () => {
    setEmail('24221A0519')
    setPassword('24221A0519')
    setError('')
  }

  const fillFacultyDemo = () => {
    setEmail('FAC101EDUSYNC@gmail.com')
    setPassword('101')
    setError('')
  }

  return (
    <div className="relative min-h-screen bg-[#F2F3F5] text-[#292C32] flex flex-col justify-between overflow-x-hidden selection:bg-[#8B6DE9] selection:text-white animate-in fade-in duration-500">
      {/* Ambient background decoration with subtle image blend */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/campus-hero.jpg"
          alt="Campus Ambient Background"
          className="w-full h-full object-cover opacity-[0.035] filter blur-xs scale-105"
        />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#A99AE8]/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#D9D1F5]/25 blur-3xl" />
      </div>

      {/* Top Global Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white font-bold shadow-lg shadow-[#8B6DE9]/25">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-[#292C32] flex items-center gap-2">
              EduSync <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-lg bg-[#D9D1F5]/60 text-[#625BEB] font-bold border border-[#A99AE8]/40">AI</span>
            </span>
            <p className="text-[10px] sm:text-[11px] text-[#85878F] font-medium hidden xs:block">
              Academic Management & Student Biometric Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <a
            href="/welcome"
            title="Watch Welcome Video"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] border border-[#C4B5FD] transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-[#6D28D9]" />
            <span>10s Intro</span>
          </a>

          <button
            type="button"
            onClick={() => setShowCustomVideoModal(true)}
            title="Add or Customize Welcome Video"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white hover:bg-[#F2F3F5] text-[#292C32] border border-[#E9EAF0] hover:border-[#8B6DE9]/40 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#625BEB]" />
            <span>Add Video</span>
            {hasCustomVideo && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Custom Video Active" />
            )}
          </button>

          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-[#E9EAF0] shadow-xs text-[#292C32]">
            <span className="w-2 h-2 rounded-full bg-[#35C979] animate-pulse" />
            <span className="hidden sm:inline">Institutional SSO •</span>
            <span>AY 2025-26</span>
          </div>
        </div>
      </header>

      {/* Main Container: Split Desktop & Clean Mobile Presentation */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-center my-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-stretch">
          
          {/* ============================================================ */}
          {/* MOBILE PHONE VIEW: Clean, Sharp & Vivid Campus Hero Card     */}
          {/* Visible on mobile / phone screens (< lg), hidden on desktop   */}
          {/* ============================================================ */}
          <div className="lg:hidden w-full max-w-md mx-auto">
            <div className="relative w-full h-52 sm:h-64 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 group">
              <img
                src="/campus-hero.jpg"
                alt="EduSync University Campus Clock Tower"
                className="w-full h-full object-cover object-[center_32%]"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-black/20" />
              
              {/* Top Badges */}
              <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#292C32] text-[10px] font-black shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Campus Portal Live
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-xs">
                  AY 2025-26
                </span>
              </div>

              {/* Bottom Campus Title Banner */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#8B6DE9]/80 backdrop-blur-md text-white text-[9px] font-black mb-1 border border-white/20">
                  <Building2 className="w-3 h-3 text-amber-200" />
                  <span>Main University Building</span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-md leading-tight">
                  Department of Computer Science & Engineering
                </h2>
                <p className="text-[11px] text-slate-200 font-medium drop-shadow-xs mt-0.5">
                  Single Sign-On for Students, Faculty & Leadership
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DESKTOP VIEW: High-Resolution Immersive Campus Showcase     */}
          {/* Hidden on mobile, visible on desktop / large displays        */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 xl:col-span-7 hidden lg:flex flex-col justify-between relative h-[650px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 p-8 text-white group">
            <img
              src="/campus-hero.jpg"
              alt="EduSync University Clock Tower Campus"
              className="absolute inset-0 w-full h-full object-cover object-[center_34%] transition-transform duration-1000 group-hover:scale-105"
              loading="eager"
              fetchPriority="high"
            />
            {/* Elegant contrast scrim that keeps architecture crisp */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/25" />

            {/* Top Showcase Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 shadow-md">
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>University Academic Block • Estd. 1998</span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                SSO Gateway Active
              </span>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/30 backdrop-blur-md border border-purple-300/40 text-purple-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Department of Computer Science & Engineering</span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                Welcome to EduSync AI University Campus
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl drop-shadow-sm font-medium">
                Unified institutional operating terminal supporting real-time 3D facial verification, geofenced lecture sessions, and autonomous academic mastery.
              </p>

              {/* 3 Frosted Feature Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-md">
                  <Camera className="w-5 h-5 text-emerald-400 mb-1.5" />
                  <p className="text-xs font-bold text-white leading-tight">Biometric Liveness</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">3D Face & Geofence GPS</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-md">
                  <Sparkles className="w-5 h-5 text-purple-400 mb-1.5" />
                  <p className="text-xs font-bold text-white leading-tight">Gemini AI Engine</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Bloom's Cognitive Tests</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-md">
                  <ShieldCheck className="w-5 h-5 text-amber-400 mb-1.5" />
                  <p className="text-xs font-bold text-white leading-tight">Zero-Trust SSO</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Encrypted Credentials</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT / MAIN: Clean, Polished White Login Card               */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 xl:col-span-5 w-full max-w-md mx-auto flex flex-col justify-center">
            <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 shadow-xl shadow-[#292C32]/5 space-y-5">
              {/* Role Switcher Tabs */}
              <div className="flex rounded-2xl bg-[#F2F3F5] p-1.5 border border-[#E9EAF0] gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('HOD')
                    setEmail('HODCSE001@gmail.com')
                    setPassword('HOD001')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'HOD'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HOD</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('FACULTY')
                    setEmail('')
                    setPassword('')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'FACULTY'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Faculty</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('STUDENT')
                    setEmail('')
                    setPassword('')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'STUDENT'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
              </div>

              {/* Portal Header & Demo Fill Shortcut */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#292C32]">
                    {activeTab === 'HOD' ? 'HOD Department Terminal' : activeTab === 'FACULTY' ? 'Faculty Sign-In' : 'Student Portal Sign-In'}
                  </h2>
                  {activeTab === 'HOD' && (
                    <button
                      type="button"
                      onClick={fillHodDemo}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer shrink-0"
                    >
                      Fill Demo
                    </button>
                  )}
                  {activeTab === 'STUDENT' && (
                    <button
                      type="button"
                      onClick={fillStudentDemo}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer shrink-0"
                    >
                      Demo: Jaideep
                    </button>
                  )}
                  {activeTab === 'FACULTY' && (
                    <button
                      type="button"
                      onClick={fillFacultyDemo}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
                    >
                      Fill Demo
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#85878F] mt-1">
                  {activeTab === 'HOD'
                    ? 'Official HOD credential access for Computer Science & Engineering.'
                    : activeTab === 'FACULTY'
                    ? 'Enter your institutional faculty email or Faculty ID.'
                    : 'Enter your registered Roll Number (e.g., 24221A0519) or email.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Sign-In Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#292C32] mb-1.5">
                    {activeTab === 'STUDENT' ? 'Roll No or Institutional Email *' : 'Institutional Email or Employee ID *'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878F]" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeTab === 'STUDENT' ? '24221A0519 or student email' : 'faculty@edusync.ai or FAC101'}
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E9EAF0] bg-[#F8F9FA] text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:border-[#8B6DE9] focus:bg-white focus:ring-2 focus:ring-[#8B6DE9]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292C32] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878F]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-[#E9EAF0] bg-[#F8F9FA] text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:border-[#8B6DE9] focus:bg-white focus:ring-2 focus:ring-[#8B6DE9]/20 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85878F] hover:text-[#292C32] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#85878F]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-[#8B6DE9] rounded-sm cursor-pointer"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[#8B6DE9] hover:underline cursor-pointer font-semibold">
                    Forgot Password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] active:scale-[0.98] shadow-md shadow-[#292C32]/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>
                        {activeTab === 'HOD'
                          ? 'Sign In to HOD Department Portal'
                          : activeTab === 'FACULTY'
                          ? 'Sign In to Faculty Portal'
                          : 'Sign In to Student Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Badge */}
              <div className="pt-3 border-t border-[#E9EAF0] flex items-center justify-center gap-2 text-[11px] text-[#85878F]">
                <KeyRound className="w-3.5 h-3.5 text-[#8B6DE9]" />
                <span>End-to-End Encrypted Session • Zero-Trust SSO</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Global Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#85878F] border-t border-[#E9EAF0]">
        <p>© 2026 EduSync AI Academic Operations. All rights reserved.</p>
        <p className="text-[11px] text-[#85878F]">
          Authorized institutional access only. Protected by biometric verification and audit ledger.
        </p>
      </footer>

      {/* Custom Welcome Video Modal Dialog */}
      <CustomVideoModal
        isOpen={showCustomVideoModal}
        onClose={() => setShowCustomVideoModal(false)}
        onVideoUpdated={() => setHasCustomVideo(hasCustomVideoSync())}
      />
    </div>
  )
}
