'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ESTAGIOS_MAP } from '@/lib/constants'
import StarRating from '@/components/ui/StarRating'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import type { Produtor, Fazenda, Safra, EstagioFenologico } from '@/types'

interface TimelineVisita {
  id: string
  data_hora: string
  estagio_fenologico: EstagioFenologico | null
  condicao_geral: number | null
  stand_plantas: number | null
  stand_unidade: string | null
  observacao_lavoura: string
  pragas: string | null
  pragas_nivel: string
  recomendacao: string | null
  estimativa_produtividade_kg_ha: number | null
  fotos: { id: string; url: string }[]
}

interface SafraComVisitas extends Safra {
  fazenda: Fazenda
  visitas: TimelineVisita[]
}

export default function ProdutorTimelinePage() {
  const { id } = useParams()
  const router = useRouter()
  const [produtor, setProdutor] = useState<Produtor | null>(null)
  const [safras, setSafras] = useState<SafraComVisitas[]>([])
  const [selectedSafraId, setSelectedSafraId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedVisita, setExpandedVisita] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Buscar produtor
      const { data: prod } = await supabase
        .from('produtores')
        .select('*')
        .eq('id', id)
        .single()
      setProdutor(prod as Produtor)

      // Buscar safras com visitas
      const { data: safrasData } = await supabase
        .from('safras')
        .select(`
          *,
          fazenda:fazendas(*),
          visitas(
            id, data_hora, estagio_fenologico, condicao_geral, stand_plantas, stand_unidade,
            observacao_lavoura, pragas, pragas_nivel, recomendacao, estimativa_produtividade_kg_ha,
            fotos(id, url)
          )
        `)
        .eq('produtor_id', id)
        .order('created_at', { ascending: false })

      const list = (safrasData || []) as unknown as SafraComVisitas[]
      // Ordenar visitas dentro de cada safra
      list.forEach((s) => {
        if (s.visitas) {
          s.visitas.sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime())
        }
      })
      setSafras(list)
      if (list.length > 0) setSelectedSafraId(list[0].id)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="pt-20"><LoadingSpinner size="lg" /></div>
  if (!produtor) return <div className="pt-20 text-center text-gray-500">Produtor não encontrado.</div>

  const activeSafra = safras.find((s) => s.id === selectedSafraId)

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{produtor.nome}</h1>
          {produtor.municipio && (
            <p className="text-sm text-gray-500">{produtor.municipio}{produtor.estado ? `, ${produtor.estado}` : ''}</p>
          )}
        </div>
      </div>

      {/* Seletor de safra */}
      {safras.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          {safras.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSafraId(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedSafraId === s.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s.cultura} {s.safra_label ? `(${s.safra_label})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Info da safra ativa */}
      {activeSafra && (
        <div className="bg-field rounded-xl px-4 py-3 mb-5 text-sm">
          <p className="font-medium text-gray-900">
            {activeSafra.fazenda?.nome} — {activeSafra.cultura}
            {activeSafra.variedade ? ` (${activeSafra.variedade})` : ''}
          </p>
          <p className="text-gray-500">
            {activeSafra.area_ha ? `${activeSafra.area_ha} ha` : ''}
            {activeSafra.safra_label ? ` — ${activeSafra.safra_label}` : ''}
          </p>
        </div>
      )}

      {/* Timeline */}
      {!activeSafra || !activeSafra.visitas || activeSafra.visitas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">Nenhuma visita nesta safra.</p>
          <Link href="/app/visita/nova" className="text-primary font-medium text-sm mt-2 inline-block">
            + Registrar visita
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSafra.visitas.map((v) => {
            const dataFormatted = new Date(v.data_hora).toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit',
            })
            const isExpanded = expandedVisita === v.id

            return (
              <div key={v.id} className="relative">
                {/* Linha da timeline */}
                <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />

                <button
                  onClick={() => setExpandedVisita(isExpanded ? null : v.id)}
                  className="w-full text-left"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm relative">
                    {/* Bolinha da timeline */}
                    <div className="absolute -left-2 top-4 w-4 h-4 rounded-full bg-primary border-2 border-white" />

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{dataFormatted}</span>
                        {v.estagio_fenologico && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {ESTAGIOS_MAP[v.estagio_fenologico]}
                          </span>
                        )}
                      </div>
                      <StarRating value={v.condicao_geral} size="sm" readonly />
                    </div>

                    {v.stand_plantas && (
                      <p className="text-xs text-gray-500 mb-1">
                        Stand: {v.stand_plantas} pl/{v.stand_unidade === 'por_m2' ? 'm²' : 'm'}
                      </p>
                    )}

                    {v.pragas && (
                      <p className="text-xs text-gray-500 mb-1">
                        Pragas: {v.pragas} ({v.pragas_nivel})
                      </p>
                    )}

                    <p className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {v.observacao_lavoura}
                    </p>

                    {isExpanded && (
                      <>
                        {v.recomendacao && (
                          <div className="mt-3 bg-accent/5 border border-accent/20 rounded-xl px-3 py-2">
                            <p className="text-xs font-semibold text-accent mb-1">Recomendação:</p>
                            <p className="text-sm text-gray-700">{v.recomendacao}</p>
                          </div>
                        )}

                        {v.estimativa_produtividade_kg_ha && (
                          <p className="text-xs text-gray-500 mt-2">
                            Est. produtividade: {v.estimativa_produtividade_kg_ha} kg/ha
                          </p>
                        )}

                        {v.fotos && v.fotos.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto">
                            {v.fotos.map((f) => (
                              <div key={f.id} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                <img src={f.url} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        <Link href={`/app/visita/${v.id}`}
                          className="text-primary text-xs font-medium mt-2 inline-block">
                          Ver completo →
                        </Link>
                      </>
                    )}

                    {!isExpanded && v.fotos && v.fotos.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">📸 {v.fotos.length} foto{v.fotos.length > 1 ? 's' : ''}</p>
                    )}
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
