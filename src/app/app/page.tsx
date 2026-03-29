'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, MapPin, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ESTAGIOS_MAP } from '@/lib/constants'
import StarRating from '@/components/ui/StarRating'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { EstagioFenologico } from '@/types'

interface VisitaFeed {
  id: string
  data_hora: string
  estagio_fenologico: EstagioFenologico | null
  condicao_geral: number | null
  observacao_lavoura: string
  safra: {
    cultura: string
    fazenda: {
      nome: string
      produtor: {
        id: string
        nome: string
      }
    }
  }
}

export default function HomePage() {
  const { usuario } = useAuth()
  const [visitas, setVisitas] = useState<VisitaFeed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return

    async function loadVisitas() {
      const { data } = await supabase
        .from('visitas')
        .select(`
          id, data_hora, estagio_fenologico, condicao_geral, observacao_lavoura,
          safra:safras(
            cultura,
            fazenda:fazendas(
              nome,
              produtor:produtores(id, nome)
            )
          )
        `)
        .eq('usuario_id', usuario!.id)
        .order('data_hora', { ascending: false })
        .limit(20)

      setVisitas((data || []) as unknown as VisitaFeed[])
      setLoading(false)
    }

    loadVisitas()
  }, [usuario])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{greeting()},</p>
        <h1 className="text-2xl font-bold text-gray-900">{usuario?.nome?.split(' ')[0] || 'Agrônomo'}</h1>
      </div>

      {/* Botão Nova Visita */}
      <Link href="/app/visita/nova">
        <button className="w-full bg-accent text-white font-bold text-lg rounded-2xl px-6 py-5 flex items-center justify-center gap-3 shadow-lg shadow-accent/25 active:bg-accent-dark transition-colors mb-6">
          <Plus className="w-6 h-6" />
          Nova Visita
        </button>
      </Link>

      {/* Feed de visitas */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Últimas visitas
      </h2>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : visitas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Nenhuma visita registrada ainda.</p>
          <p className="text-gray-400 text-xs mt-1">Toque em &quot;Nova Visita&quot; para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visitas.map((v) => {
            const safra = v.safra as unknown as VisitaFeed['safra']
            const produtor = safra?.fazenda?.produtor
            const fazenda = safra?.fazenda
            const dataFormatted = new Date(v.data_hora).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })

            return (
              <Link key={v.id} href={`/app/visita/${v.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{produtor?.nome || '—'}</p>
                      <p className="text-sm text-gray-500">
                        {fazenda?.nome || '—'} — {safra?.cultura || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {dataFormatted}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {v.estagio_fenologico && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {ESTAGIOS_MAP[v.estagio_fenologico]}
                      </span>
                    )}
                    <StarRating value={v.condicao_geral} size="sm" readonly />
                  </div>
                  {v.observacao_lavoura && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {v.observacao_lavoura}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
