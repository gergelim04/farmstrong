'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { CONDICOES_CLIMA } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Input, { Textarea, Select } from '@/components/ui/Input'
import type { Fazenda } from '@/types'

interface FazendaOption extends Fazenda {
  produtor_nome: string
}

export default function NovoClimaPage() {
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [fazendas, setFazendas] = useState<FazendaOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fazendaId, setFazendaId] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [tempMax, setTempMax] = useState('')
  const [tempMin, setTempMin] = useState('')
  const [precipitacao, setPrecipitacao] = useState('')
  const [umidade, setUmidade] = useState('')
  const [condicao, setCondicao] = useState('sol')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (!usuario) return
    async function loadFazendas() {
      const { data } = await supabase
        .from('fazendas')
        .select('*, produtor:produtores(nome)')
        .eq('usuario_id', usuario!.id)
        .order('nome')

      const mapped = (data || []).map((f: Record<string, unknown>) => {
        const produtor = f.produtor as Record<string, unknown> | null
        return { ...f, produtor_nome: (produtor?.nome as string) || '' }
      }) as FazendaOption[]
      setFazendas(mapped)
      setLoading(false)
    }
    loadFazendas()
  }, [usuario])

  async function handleSave() {
    if (!fazendaId) { showToast('error', 'Selecione uma fazenda.'); return }
    if (!data) { showToast('error', 'Informe a data.'); return }
    if (!usuario) return

    setSaving(true)
    const { error } = await supabase.from('registros_clima').insert({
      fazenda_id: fazendaId,
      usuario_id: usuario.id,
      data,
      temperatura_max: tempMax ? Number(tempMax) : null,
      temperatura_min: tempMin ? Number(tempMin) : null,
      precipitacao_mm: precipitacao ? Number(precipitacao) : null,
      umidade_percent: umidade ? Number(umidade) : null,
      condicao,
      observacoes: observacoes.trim() || null,
    })

    if (error) {
      showToast('error', 'Erro ao salvar registro climático.')
      setSaving(false)
      return
    }

    showToast('success', 'Clima registrado!')
    router.push('/app/clima')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Novo Registro Climático</h1>
      </div>

      <div className="space-y-5">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Carregando fazendas...</p>
        ) : (
          <Select
            label="Fazenda *"
            value={fazendaId}
            onChange={(e) => setFazendaId(e.target.value)}
            options={fazendas.map((f) => ({
              value: f.id,
              label: `${f.produtor_nome} — ${f.nome}`,
            }))}
            placeholder="Selecione a fazenda..."
          />
        )}

        <Input
          label="Data *"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <Select
          label="Condição *"
          value={condicao}
          onChange={(e) => setCondicao(e.target.value)}
          options={CONDICOES_CLIMA.map((c) => ({
            value: c.value,
            label: `${c.icon} ${c.label}`,
          }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Temp. mínima (°C)"
            type="number"
            placeholder="Ex: 18"
            value={tempMin}
            onChange={(e) => setTempMin(e.target.value)}
          />
          <Input
            label="Temp. máxima (°C)"
            type="number"
            placeholder="Ex: 34"
            value={tempMax}
            onChange={(e) => setTempMax(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Precipitação (mm)"
            type="number"
            placeholder="Ex: 12"
            value={precipitacao}
            onChange={(e) => setPrecipitacao(e.target.value)}
          />
          <Input
            label="Umidade (%)"
            type="number"
            placeholder="Ex: 65"
            value={umidade}
            onChange={(e) => setUmidade(e.target.value)}
          />
        </div>

        <Textarea
          label="Observações"
          placeholder="Ventos fortes, geada, granizo..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
        />

        <Button variant="accent" onClick={handleSave} fullWidth size="lg" loading={saving}>
          <Check className="w-5 h-5" /> Salvar Clima
        </Button>
      </div>
    </div>
  )
}
