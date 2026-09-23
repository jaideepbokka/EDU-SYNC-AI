'use client'

import React, { useState } from 'react'
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
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react'

interface LoginDashboardClientProps {
  initialRole?: 'FACULTY' | 'STUDENT'
  errorMessage?: string
}

export function LoginDashboardClient({
  initialRole = 'FACULTY',
  errorMessage,
}: LoginDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'FACULTY' | 'STUDENT'>(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorMessage || '')

  const handleLogin = async (loginEmail: string, loginPass?: string, role = activeTab) => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPass || 'faculty123',
          role,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.')
      }

      // Hard redirect to load role layouts cleanly
      window.location.href = data.redirectUrl || (role === 'STUDENT' ? '/student' : '/faculty')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(email, password, activeTab)
  }

  return (
    <div className="relative min-h-screen bg-[#1B1D1F] text-[#FCF6F5] flex flex-col justify-between overflow-hidden selection:bg-[#DE9EAE] selection:text-[#1B1D1F]">
      {/* Real-time Cinematic Background Image with Curated Palette Tint */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/campus_modern_glass.jpg"
          alt="Modern Campus Architecture"
          className="w-full h-full object-cover object-center filter brightness-35 contrast-110 scale-105 transform animate-in fade-in duration-1000"
        />
        {/* Palette-matched deep charcoal + warm dusty rose atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1D1F] via-[#272A2C]/85 to-[#1B1D1F]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DE9EAE]/15 via-transparent to-[#1B1D1F]/90" />
      </div>

      {/* Top Global Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#DE9EAE] via-[#E6ABB8] to-[#F8D8D3] flex items-center justify-center text-[#1B1D1F] font-bold shadow-xl shadow-[#DE9EAE]/20 border border-[#FCF6F5]/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#FCF6F5] flex items-center gap-2">
              EduSync <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#DE9EAE]/25 text-[#FCF6F5] font-bold border border-[#DE9EAE]/40">AI</span>
            </span>
            <p className="text-[11px] text-[#F8D8D3]/80 font-medium">Academic Management & Student Biometric Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#272A2C]/80 border border-[#3D4042] backdrop-blur-md text-[#F8D8D3]">
          <span className="w-2 h-2 rounded-full bg-[#DE9EAE] animate-pulse" />
          <span>Institutional SSO • AY 2025-26</span>
        </div>
      </header>

      {/* Centerpiece: Dual Login Dashboard */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center my-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual System Highlights */}
          <div className="lg:col-span-5 space-y-6 text-left hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DE9EAE]/15 border border-[#DE9EAE]/30 text-[#F8D8D3] text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#DE9EAE]" />
              <span>Institutional University Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#FCF6F5] leading-tight tracking-tight">
              Single Sign-On for Campus Operations
            </h1>

            <p className="text-xs text-[#E5CDC8] leading-relaxed">
              Authenticate with your verified university credentials to access the academic operations dashboard or student biometric classroom.
            </p>

            {/* Feature Cards styled with Palette */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#272A2C]/75 border border-[#3D4042] backdrop-blur-md flex items-center gap-3.5 shadow-lg">
                <div className="p-2 rounded-xl bg-[#DE9EAE]/20 text-[#DE9EAE]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#FCF6F5]">Biometric Facial Verification</h4>
                  <p className="text-[11px] text-[#A8ACAF]">Anti-spoofing liveness audit with campus GPS bounds</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#272A2C]/75 border border-[#3D4042] backdrop-blur-md flex items-center gap-3.5 shadow-lg">
                <div className="p-2 rounded-xl bg-[#F8D8D3]/20 text-[#F8D8D3]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#FCF6F5]">Bloom's AI Question Engine</h4>
                  <p className="text-[11px] text-[#A8ACAF]">Cognitive assessment generation with rubrics</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#272A2C]/75 border border-[#3D4042] backdrop-blur-md flex items-center gap-3.5 shadow-lg">
                <div className="p-2 rounded-xl bg-[#DE9EAE]/20 text-[#DE9EAE]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#FCF6F5]">Zero-Trust Access Control</h4>
                  <p className="text-[11px] text-[#A8ACAF]">Strict session cryptographic signing on every request</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Palette-Engineered Login Card (No Demo Profiles) */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="rounded-3xl bg-[#272A2C]/90 backdrop-blur-2xl border border-[#3D4042] p-7 sm:p-9 shadow-2xl shadow-black/40 space-y-6">
              {/* Tab Selector */}
              <div className="flex rounded-2xl bg-[#1B1D1F]/90 p-1.5 border border-[#3D4042]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('FACULTY')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === 'FACULTY'
                      ? 'bg-gradient-to-r from-[#DE9EAE] to-[#CE8C9C] text-[#1B1D1F] shadow-lg shadow-[#DE9EAE]/25'
                      : 'text-[#E5CDC8] hover:text-[#FCF6F5]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Faculty Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('STUDENT')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === 'STUDENT'
                      ? 'bg-gradient-to-r from-[#F8D8D3] to-[#DE9EAE] text-[#1B1D1F] shadow-lg shadow-[#F8D8D3]/25'
                      : 'text-[#E5CDC8] hover:text-[#FCF6F5]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Student Portal</span>
                </button>
              </div>

              {/* Header Title */}
              <div>
                <h2 className="text-xl font-black text-[#FCF6F5]">
                  {activeTab === 'FACULTY' ? 'Faculty Sign-In' : 'Student Sign-In'}
                </h2>
                <p className="text-xs text-[#A8ACAF] mt-1">
                  {activeTab === 'FACULTY'
                    ? 'Enter your institutional email (FAC101EDUSYNC@gmail.com) or Faculty ID (FAC101 - FAC105).'
                    : 'Enter your student email (26CSE101@edusync.edu) or Roll Number (101 - 140).'}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-[#3D4042]/80 text-[#F8D8D3] border border-[#DE9EAE]/60 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#DE9EAE]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#FCF6F5] mb-1.5">
                    Institutional Email or ID *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ACAF]" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        activeTab === 'FACULTY'
                          ? 'FAC101EDUSYNC@gmail.com or FAC101'
                          : '26CSE101@edusync.edu or 101'
                      }
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#3D4042] bg-[#1B1D1F]/90 text-[#FCF6F5] placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#DE9EAE] focus:ring-2 focus:ring-[#DE9EAE]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#FCF6F5] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ACAF]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-[#3D4042] bg-[#1B1D1F]/90 text-[#FCF6F5] placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#DE9EAE] focus:ring-2 focus:ring-[#DE9EAE]/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ACAF] hover:text-[#FCF6F5] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A8ACAF]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-[#DE9EAE] rounded-sm"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[#DE9EAE] hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-[#1B1D1F] bg-gradient-to-r from-[#DE9EAE] via-[#E6B2BF] to-[#F8D8D3] hover:brightness-105 active:scale-[0.99] shadow-xl shadow-[#DE9EAE]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>
                        {activeTab === 'FACULTY' ? 'Sign In to Faculty Portal' : 'Sign In to Student Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Clean Footer Notice (Zero Demo Profiles Clutter) */}
              <div className="pt-4 border-t border-[#3D4042]/70 flex items-center justify-center gap-2 text-[11px] text-[#A8ACAF]">
                <KeyRound className="w-3.5 h-3.5 text-[#DE9EAE]" />
                <span>End-to-end encrypted session • Institutional Zero-Trust SSO</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#A8ACAF] border-t border-[#3D4042]/50">
        <p>© 2026 EduSync AI Academic Operations. All rights reserved.</p>
        <p className="text-[11px] text-[#A8ACAF]">
          Strict role-based access control. Unauthorized access prohibited.
        </p>
      </footer>
    </div>
  )
}
