import React from 'react'
import { requireHodUser } from '@/lib/auth'
import { HodLayoutWrapper } from '@/components/HodLayoutWrapper'

export const metadata = {
  title: 'HOD Portal | EduSync AI',
  description: 'Head of Department Administrative Suite for Faculty Management and Academic Operations.',
}

export default async function HodLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireHodUser()

  return (
    <HodLayoutWrapper user={user}>
      {children}
    </HodLayoutWrapper>
  )
}
