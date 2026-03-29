'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Sprout, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface PlantioFeed {
  id: string
  data_plantio: string
  area_plantada_ha: number | null
  populacao_sementes_ha: number | null
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

export default function PlantioListPage() {
  const { usuario } = useAuth()
  const [plantios, setPlantios] = useState<PlantioFeed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    async function load() {
      const { data } = await supabase
        .from('plantios')
        .select(`
          id, data_plantio, area_plantada_ha, populacao_sementes_ha, observacoes,
          safra:safras(
            cultura, variedade,
            fazenda:fazendas(nome, produtor:produtores(nome))
          )
        `)
        .eq('usuario_id', usuario!.id)
        .order('data_plantio', { ascending: false })
        .limit(50)
      setPlantios((data || []) as unknown as PlantioFeed[])
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
          <h1 className="text-xl font-bold text-gray-900">Plantio</h1>
          <p className="text-sm text-gray-500">{plantios.length} registros</p>
        </div>
        <Link href="/app/plantio/novo">
          <button className="bg-primary text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : plantios.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sprout className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-gray-500 text-sm">Nenhum plantio registrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plantios.map((p) => {
            const safra = p.safra as unknown as PlantioFeed['safra']
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{safra?.fazenda?.produtor?.nome}</p>
                    <p className="text-sm text-gray-500">
                      {safra?.fazenda?.nome} — {safra?.cultura} {safra?.variedade ? `(${safra.variedade})` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(p.data_plantio).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  {p.area_plantada_ha && <span>{p.area_plantada_ha} ha</span>}
                  {p.populacao_sementes_ha && <span>{p.populacao_sementes_ha.toLocaleString()} sem/ha</span>}
                </div>
                {p.observacoes && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.observacoes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
