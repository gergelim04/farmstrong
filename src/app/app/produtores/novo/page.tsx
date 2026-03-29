'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function NovoProdutorPage() {
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [apelido, setApelido] = useState('')
  const [telefone, setTelefone] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [estado, setEstado] = useState('')
  const [fazendaNome, setFazendaNome] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !usuario) {
      showToast('error', 'Informe o nome do produtor.')
      return
    }

    setSaving(true)

    // Criar produtor
    const { data: prod, error: e1 } = await supabase
      .from('produtores')
      .insert({
        usuario_id: usuario.id,
        nome: nome.trim(),
        apelido: apelido.trim() || null,
        telefone: telefone.trim() || null,
        municipio: municipio.trim() || null,
        estado: estado.trim() || null,
      })
      .select('id')
      .single()

    if (e1 || !prod) {
      showToast('error', 'Erro ao salvar produtor.')
      setSaving(false)
      return
    }

    // Se informou fazenda, criar
    if (fazendaNome.trim()) {
      await supabase.from('fazendas').insert({
        produtor_id: prod.id,
        usuario_id: usuario.id,
        nome: fazendaNome.trim(),
      })
    }

    showToast('success', 'Produtor cadastrado!')
    router.push('/app/produtores')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Novo Produtor</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome *" placeholder="Ex: Itacir Zanatta" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        <Input label="Apelido" placeholder="Como você chama no dia-a-dia" value={apelido} onChange={(e) => setApelido(e.target.value)} />
        <Input label="Telefone" type="tel" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Município" placeholder="Ex: Canarana" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
          </div>
          <div className="w-24">
            <Input label="UF" placeholder="MT" value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} />
          </div>
        </div>

        <hr className="border-gray-200" />

        <Input label="Nome da fazenda" placeholder="Ex: Faz. São Marcos" value={fazendaNome} onChange={(e) => setFazendaNome(e.target.value)} />
        <p className="text-xs text-gray-400">Opcional. Você pode adicionar fazendas depois.</p>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" loading={saving}>
            Salvar produtor
          </Button>
        </div>
      </form>
    </div>
  )
}
