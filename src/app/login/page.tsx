import React from 'react'
import { LoginDashboardClient } from '../LoginDashboardClient'

export const metadata = {
  title: 'Sign In | EduSync AI Faculty & Student Portal',
  description: 'Single sign-on authentication terminal for faculty operations and student biometric attendance.',
}

export default async function LoginPage({
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
