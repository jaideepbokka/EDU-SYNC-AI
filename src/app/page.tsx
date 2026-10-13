import React from 'react'
import { redirect } from 'next/navigation'
import { LandingVideoClient } from './landing/LandingVideoClient'
import { LoginDashboardClient } from './LoginDashboardClient'

export const metadata = {
  title: 'Welcome to EduSync AI | Next-Gen Academic Platform',
  description: 'Interactive introduction to EduSync AI - Intelligent campus attendance, semester analytics, and faculty portal.',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const query = await searchParams

  // If specific auth query parameters are present (e.g. from logout, unauthorized redirect, or direct role switch),
  // immediately serve the authentication dashboard
  if (query.error || query.role || query.auth === 'login') {
    const roleParam = typeof query.role === 'string' ? query.role.toUpperCase() : 'FACULTY'
    const errorParam = typeof query.error === 'string' ? query.error : undefined

    let errorMsg = ''
    if (errorParam === 'login_required') {
      errorMsg = 'Please sign in to access this portal.'
    } else if (
      errorParam === 'unauthorized' ||
      errorParam === 'faculty_access_only' ||
      errorParam === 'student_access_only'
    ) {
      errorMsg = 'Access denied'
    }

    return (
      <LoginDashboardClient
        initialRole={roleParam === 'STUDENT' ? 'STUDENT' : roleParam === 'HOD' ? 'HOD' : 'FACULTY'}
        errorMessage={errorMsg}
      />
    )
  }

  // Default entry: Experience the cinematic video landing page with automatic redirection to main portal
  return <LandingVideoClient />
}
