'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SetupPage() {
  const { signup } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [empresaNome, setEmpresaNome] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Informe seu nome.'
    if (!email.trim()) e.email = 'Informe seu e-mail.'
    if (!senha || senha.length < 6) e.senha = 'Mínimo 6 caracteres.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return

    setLoading(true)
    const result = await signup({
      email: email.trim(),
      password: senha,
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      empresaNome: empresaNome.trim() || undefined,
    })

    if (result.error) {
      showToast('error', result.error)
      setLoading(false)
      return
    }

    showToast('success', 'Conta criada! Entrando...')
    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-sm mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-gray-500 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar conta</h1>
        <p className="text-gray-500 text-sm mb-6">Preencha o básico e comece a registrar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Seu nome *"
            placeholder="Ex: Jonas Barros"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={errors.nome}
            autoFocus
          />
          <Input
            label="E-mail *"
            type="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Senha *"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={errors.senha}
          />
          <Input
            label="Telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <Input
            label="Nome da empresa"
            placeholder="Ex: AgroPlan Consultoria"
            value={empresaNome}
            onChange={(e) => setEmpresaNome(e.target.value)}
          />
          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Criar conta e entrar
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
