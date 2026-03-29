'use client'

import AuthGuard from '@/components/layout/AuthGuard'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        {children}
      </div>
      <BottomNav />
    </AuthGuard>
  )
}
