'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input, { Textarea, Select } from '@/components/ui/Input'
import type { Safra } from '@/types'

interface SafraOption extends Safra {
  fazenda_nome: string
  produtor_nome: string
}

export default function NovaColheitaPage() {
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [safras, setSafras] = useState<SafraOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [safraId, setSafraId] = useState('')
  const [dataColheita, setDataColheita] = useState(new Date().toISOString().split('T')[0])
  const [areaColhida, setAreaColhida] = useState('')
  const [produtividade, setProdutividade] = useState('')
  const [umidade, setUmidade] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (!usuario) return
    async function loadSafras() {
      const { data } = await supabase
        .from('safras')
        .select(`
          *,
          fazenda:fazendas(nome, produtor:produtores(nome))
        `)
        .eq('usuario_id', usuario!.id)
        .neq('status', 'finalizado')
        .order('created_at', { ascending: false })

      const mapped = (data || []).map((s: Record<string, unknown>) => {
        const fazenda = s.fazenda as Record<string, unknown> | null
        const produtor = fazenda?.produtor as Record<string, unknown> | null
        return {
          ...s,
          fazenda_nome: (fazenda?.nome as string) || '',
          produtor_nome: (produtor?.nome as string) || '',
        }
      }) as SafraOption[]
      setSafras(mapped)
      setLoading(false)
    }
    loadSafras()
  }, [usuario])

  async function handleSave() {
    if (!safraId) { showToast('error', 'Selecione uma safra.'); return }
    if (!dataColheita) { showToast('error', 'Informe a data de colheita.'); return }
    if (!usuario) return

    setSaving(true)
    const { error } = await supabase.from('colheitas').insert({
      safra_id: safraId,
      usuario_id: usuario.id,
      data_colheita: dataColheita,
      area_colhida_ha: areaColhida ? Number(areaColhida) : null,
      produtividade_kg_ha: produtividade ? Number(produtividade) : null,
      umidade_percent: umidade ? Number(umidade) : null,
      observacoes: observacoes.trim() || null,
    })

    if (error) {
      showToast('error', 'Erro ao salvar colheita.')
      setSaving(false)
      return
    }

    // Atualizar status da safra
    await supabase
      .from('safras')
      .update({ status: 'colhendo' })
      .eq('id', safraId)

    showToast('success', 'Colheita registrada!')
    router.push('/app/colheita')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Nova Colheita</h1>
      </div>

      <div className="space-y-5">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Carregando safras...</p>
        ) : (
          <Select
            label="Safra *"
            value={safraId}
            onChange={(e) => setSafraId(e.target.value)}
            options={safras.map((s) => ({
              value: s.id,
              label: `${s.produtor_nome} — ${s.fazenda_nome} — ${s.cultura}`,
            }))}
            placeholder="Selecione a safra..."
          />
        )}

        <Input
          label="Data da colheita *"
          type="date"
          value={dataColheita}
          onChange={(e) => setDataColheita(e.target.value)}
        />

        <Input
          label="Área colhida (ha)"
          type="number"
          placeholder="Ex: 120"
          value={areaColhida}
          onChange={(e) => setAreaColhida(e.target.value)}
        />

        <Input
          label="Produtividade (kg/ha)"
          type="number"
          placeholder="Ex: 3600"
          value={produtividade}
          onChange={(e) => setProdutividade(e.target.value)}
        />

        <Input
          label="Umidade (%)"
          type="number"
          placeholder="Ex: 14"
          value={umidade}
          onChange={(e) => setUmidade(e.target.value)}
        />

        <Textarea
          label="Observações"
          placeholder="Condições da colheita, perdas..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
        />

        <Button variant="accent" onClick={handleSave} fullWidth size="lg" loading={saving}>
          <Check className="w-5 h-5" /> Salvar Colheita
        </Button>
      </div>
    </div>
  )
}
