'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, CloudSun, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { CONDICOES_CLIMA_MAP } from '@/lib/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ClimaFeed {
  id: string
  data: string
  temperatura_max: number | null
  temperatura_min: number | null
  precipitacao_mm: number | null
  umidade_percent: number | null
  condicao: string
  observacoes: string | null
  fazenda: {
    nome: string
    produtor: { nome: string }
  }
}

export default function ClimaListPage() {
  const { usuario } = useAuth()
  const [registros, setRegistros] = useState<ClimaFeed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    async function load() {
      const { data } = await supabase
        .from('registros_clima')
        .select(`
          id, data, temperatura_max, temperatura_min, precipitacao_mm, umidade_percent, condicao, observacoes,
          fazenda:fazendas(nome, produtor:produtores(nome))
        `)
        .eq('usuario_id', usuario!.id)
        .order('data', { ascending: false })
        .limit(50)
      setRegistros((data || []) as unknown as ClimaFeed[])
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
          <h1 className="text-xl font-bold text-gray-900">Clima</h1>
          <p className="text-sm text-gray-500">{registros.length} registros</p>
        </div>
        <Link href="/app/clima/novo">
          <button className="bg-primary text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : registros.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CloudSun className="w-8 h-8 text-sky-400" />
          </div>
          <p className="text-gray-500 text-sm">Nenhum registro climático.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registros.map((r) => {
            const fazenda = r.fazenda as unknown as ClimaFeed['fazenda']
            const condicao = CONDICOES_CLIMA_MAP[r.condicao] || { label: r.condicao, icon: '' }
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{condicao.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{fazenda?.nome}</p>
                      <p className="text-sm text-gray-500">{fazenda?.produtor?.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(r.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                  {r.temperatura_max != null && r.temperatura_min != null && (
                    <span>{r.temperatura_min}° — {r.temperatura_max}°C</span>
                  )}
                  {r.precipitacao_mm != null && r.precipitacao_mm > 0 && (
                    <span className="text-blue-600">{r.precipitacao_mm} mm</span>
                  )}
                  {r.umidade_percent != null && (
                    <span>{r.umidade_percent}% umid.</span>
                  )}
                  <span className="text-gray-500">{condicao.label}</span>
                </div>
                {r.observacoes && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{r.observacoes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
