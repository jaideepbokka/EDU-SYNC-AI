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
    errorMsg = 'Please sign in to access this portal.'
  } else if (errorParam === 'faculty_access_only') {
    errorMsg = 'Faculty access required. Please sign in with your Faculty ID.'
  } else if (errorParam === 'student_access_only') {
    errorMsg = 'Student access required. Please sign in with your Roll Number.'
  } else if (errorParam === 'unauthorized') {
    errorMsg = 'Session expired. Please sign in to continue.'
  }

  return (
    <LoginDashboardClient
      initialRole={roleParam === 'STUDENT' ? 'STUDENT' : 'FACULTY'}
      errorMessage={errorMsg}
    />
  )
}
