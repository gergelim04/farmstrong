'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!email.trim() || !senha) return

    setLoading(true)
    const result = await login(email.trim(), senha)

    if (result.error) {
      showToast('error', result.error)
      setLoading(false)
      return
    }

    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-sm mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-gray-500 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
        <p className="text-gray-500 text-sm mb-6">Bem-vindo de volta.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Entrar
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem conta?{' '}
          <Link href="/setup" className="text-primary font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
