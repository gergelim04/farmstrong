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

export default function NovoPlantioPage() {
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [safras, setSafras] = useState<SafraOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [safraId, setSafraId] = useState('')
  const [dataPlantio, setDataPlantio] = useState(new Date().toISOString().split('T')[0])
  const [areaPlantada, setAreaPlantada] = useState('')
  const [populacao, setPopulacao] = useState('')
  const [espacamento, setEspacamento] = useState('')
  const [tratamento, setTratamento] = useState('')
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
    if (!dataPlantio) { showToast('error', 'Informe a data de plantio.'); return }
    if (!usuario) return

    setSaving(true)
    const { error } = await supabase.from('plantios').insert({
      safra_id: safraId,
      usuario_id: usuario.id,
      data_plantio: dataPlantio,
      area_plantada_ha: areaPlantada ? Number(areaPlantada) : null,
      populacao_sementes_ha: populacao ? Number(populacao) : null,
      espacamento_cm: espacamento ? Number(espacamento) : null,
      tratamento_sementes: tratamento.trim() || null,
      observacoes: observacoes.trim() || null,
    })

    if (error) {
      showToast('error', 'Erro ao salvar plantio.')
      setSaving(false)
      return
    }

    // Atualizar status da safra para plantando se necessário
    await supabase
      .from('safras')
      .update({ status: 'plantando', data_plantio: dataPlantio })
      .eq('id', safraId)

    showToast('success', 'Plantio registrado!')
    router.push('/app/plantio')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Novo Plantio</h1>
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
              label: `${s.produtor_nome} — ${s.fazenda_nome} — ${s.cultura}${s.variedade ? ` (${s.variedade})` : ''}`,
            }))}
            placeholder="Selecione a safra..."
          />
        )}

        <Input
          label="Data do plantio *"
          type="date"
          value={dataPlantio}
          onChange={(e) => setDataPlantio(e.target.value)}
        />

        <Input
          label="Área plantada (ha)"
          type="number"
          placeholder="Ex: 120"
          value={areaPlantada}
          onChange={(e) => setAreaPlantada(e.target.value)}
        />

        <Input
          label="População de sementes (sem/ha)"
          type="number"
          placeholder="Ex: 300000"
          value={populacao}
          onChange={(e) => setPopulacao(e.target.value)}
        />

        <Input
          label="Espaçamento (cm)"
          type="number"
          placeholder="Ex: 50"
          value={espacamento}
          onChange={(e) => setEspacamento(e.target.value)}
        />

        <Input
          label="Tratamento de sementes"
          placeholder="Produtos utilizados..."
          value={tratamento}
          onChange={(e) => setTratamento(e.target.value)}
        />

        <Textarea
          label="Observações"
          placeholder="Condições do solo, clima no dia..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
        />

        <Button variant="accent" onClick={handleSave} fullWidth size="lg" loading={saving}>
          <Check className="w-5 h-5" /> Salvar Plantio
        </Button>
      </div>
    </div>
  )
}
