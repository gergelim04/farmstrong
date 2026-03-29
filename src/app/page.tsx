'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/app')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🌾</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Farmstrong
        </h1>
        <p className="text-lg mt-2 text-white/70">
          Registre. Consulte. Recomende.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Link href="/setup">
          <Button variant="accent" size="lg" fullWidth>
            Começar agora
          </Button>
        </Link>
        <Link href="/login" className="block mt-3">
          <Button variant="ghost" size="lg" fullWidth className="!text-white/80 hover:!bg-white/10">
            Já tenho conta
          </Button>
        </Link>
      </div>
    </div>
  )
}
