'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Wheat, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ColheitaFeed {
  id: string
  data_colheita: string
  area_colhida_ha: number | null
  produtividade_kg_ha: number | null
  umidade_percent: number | null
  observacoes: string | null
  safra: {
    cultura: string
    variedade: string | null
    fazenda: {
      nome: string
      produtor: { nome: string }
    }
  }
}

export default function ColheitaListPage() {
  const { usuario } = useAuth()
  const [colheitas, setColheitas] = useState<ColheitaFeed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    async function load() {
      const { data } = await supabase
        .from('colheitas')
        .select(`
          id, data_colheita, area_colhida_ha, produtividade_kg_ha, umidade_percent, observacoes,
          safra:safras(
            cultura, variedade,
            fazenda:fazendas(nome, produtor:produtores(nome))
          )
        `)
        .eq('usuario_id', usuario!.id)
        .order('data_colheita', { ascending: false })
        .limit(50)
      setColheitas((data || []) as unknown as ColheitaFeed[])
      setLoading(false)
    }
    load()
  }, [usuario])

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/atividades" className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Colheita</h1>
          <p className="text-sm text-gray-500">{colheitas.length} registros</p>
        </div>
        <Link href="/app/colheita/novo">
          <button className="bg-primary text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm">
            <Plus className="w-4 h-4" /> Nova
          </button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : colheitas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Wheat className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-gray-500 text-sm">Nenhuma colheita registrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {colheitas.map((c) => {
            const safra = c.safra as unknown as ColheitaFeed['safra']
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{safra?.fazenda?.produtor?.nome}</p>
                    <p className="text-sm text-gray-500">
                      {safra?.fazenda?.nome} — {safra?.cultura}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(c.data_colheita).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  {c.produtividade_kg_ha && <span className="font-medium text-amber-700">{c.produtividade_kg_ha} kg/ha</span>}
                  {c.area_colhida_ha && <span>{c.area_colhida_ha} ha</span>}
                  {c.umidade_percent && <span>{c.umidade_percent}% umidade</span>}
                </div>
                {c.observacoes && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.observacoes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
