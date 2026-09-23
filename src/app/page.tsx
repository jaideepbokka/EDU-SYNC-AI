import React from 'react'
import { LoginDashboardClient } from './LoginDashboardClient'

export const metadata = {
  title: 'Sign In | EduSync AI Faculty & Student Portal',
  description: 'Single sign-on authentication terminal for faculty operations and student biometric attendance.',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const query = await searchParams
  const roleParam = typeof query.role === 'string' ? query.role.toUpperCase() : 'FACULTY'
  const errorParam = typeof query.error === 'string' ? query.error : undefined

  let errorMsg = ''
  if (errorParam === 'login_required') {
    errorMsg = 'Authentication required. Please sign in to access this portal.'
  } else if (errorParam === 'unauthorized') {
    errorMsg = 'Session expired or unauthorized. Please authenticate with institutional credentials.'
  } else if (errorParam === 'faculty_access_only') {
    errorMsg = 'Access Denied: This area is restricted to faculty members only.'
  } else if (errorParam === 'student_access_only') {
    errorMsg = 'Access Denied: This area is restricted to enrolled students only.'
  }

  return (
    <LoginDashboardClient
      initialRole={roleParam === 'STUDENT' ? 'STUDENT' : 'FACULTY'}
      errorMessage={errorMsg}
    />
  )
}
