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

export default function NovaEntregaPage() {
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [safras, setSafras] = useState<SafraOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [safraId, setSafraId] = useState('')
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split('T')[0])
  const [destino, setDestino] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [preco, setPreco] = useState('')
  const [notaFiscal, setNotaFiscal] = useState('')
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
    if (!destino.trim()) { showToast('error', 'Informe o destino.'); return }
    if (!quantidade || Number(quantidade) <= 0) { showToast('error', 'Informe a quantidade.'); return }
    if (!usuario) return

    setSaving(true)
    const { error } = await supabase.from('entregas').insert({
      safra_id: safraId,
      usuario_id: usuario.id,
      data_entrega: dataEntrega,
      destino: destino.trim(),
      quantidade_kg: Number(quantidade),
      preco_por_kg: preco ? Number(preco) : null,
      nota_fiscal: notaFiscal.trim() || null,
      observacoes: observacoes.trim() || null,
    })

    if (error) {
      showToast('error', 'Erro ao salvar entrega.')
      setSaving(false)
      return
    }

    showToast('success', 'Entrega registrada!')
    router.push('/app/entregas')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Nova Entrega</h1>
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
          label="Data da entrega *"
          type="date"
          value={dataEntrega}
          onChange={(e) => setDataEntrega(e.target.value)}
        />

        <Input
          label="Destino / Comprador *"
          placeholder="Ex: Cargill, Bunge, Amaggi..."
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />

        <Input
          label="Quantidade (kg) *"
          type="number"
          placeholder="Ex: 30000"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />

        <Input
          label="Preço por kg (R$)"
          type="number"
          step="0.01"
          placeholder="Ex: 1.85"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <Input
          label="Nota Fiscal"
          placeholder="Número da NF"
          value={notaFiscal}
          onChange={(e) => setNotaFiscal(e.target.value)}
        />

        <Textarea
          label="Observações"
          placeholder="Detalhes da entrega..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
        />

        <Button variant="accent" onClick={handleSave} fullWidth size="lg" loading={saving}>
          <Check className="w-5 h-5" /> Salvar Entrega
        </Button>
      </div>
    </div>
  )
}
