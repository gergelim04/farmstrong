'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { CARGOS_EQUIPE } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Input, { Select } from '@/components/ui/Input'

export default function NovoMembroPage() {
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cargo, setCargo] = useState('tecnico')

  async function handleSave() {
    if (!nome.trim()) { showToast('error', 'Informe o nome.'); return }
    if (!usuario) return

    setSaving(true)
    const { error } = await supabase.from('equipe').insert({
      usuario_id: usuario.id,
      nome: nome.trim(),
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      cargo,
      ativo: true,
    })

    if (error) {
      showToast('error', 'Erro ao cadastrar membro.')
      setSaving(false)
      return
    }

    showToast('success', 'Membro adicionado!')
    router.push('/app/equipe')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Novo Membro</h1>
      </div>

      <div className="space-y-5">
        <Input
          label="Nome *"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoFocus
        />

        <Select
          label="Cargo"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          options={CARGOS_EQUIPE.map((c) => ({ value: c.value, label: c.label }))}
        />

        <Input
          label="Telefone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button variant="accent" onClick={handleSave} fullWidth size="lg" loading={saving}>
          <Check className="w-5 h-5" /> Salvar Membro
        </Button>
      </div>
    </div>
  )
}
