'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Bug, Leaf, Sprout, Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ESTAGIOS_MAP, NIVEIS_FITOSSANIDADE } from '@/lib/constants'
import StarRating from '@/components/ui/StarRating'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Card from '@/components/ui/Card'
import type { EstagioFenologico, NivelFitossanidade } from '@/types'

interface VisitaDetail {
  id: string
  data_hora: string
  latitude: number | null
  longitude: number | null
  estagio_fenologico: EstagioFenologico | null
  stand_plantas: number | null
  stand_unidade: string | null
  condicao_geral: number | null
  observacao_lavoura: string
  pragas: string | null
  pragas_nivel: NivelFitossanidade
  doencas: string | null
  doencas_nivel: NivelFitossanidade
  daninhas: string | null
  daninhas_nivel: NivelFitossanidade
  manejos_realizados: string | null
  recomendacao: string | null
  estimativa_produtividade_kg_ha: number | null
  safra: {
    id: string
    cultura: string
    variedade: string | null
    safra_label: string | null
    fazenda: {
      nome: string
      produtor: { id: string; nome: string }
    }
  }
  fotos: { id: string; url: string; legenda: string | null }[]
}

function NivelBadge({ nivel }: { nivel: NivelFitossanidade }) {
  const colors: Record<NivelFitossanidade, string> = {
    nenhum: 'bg-gray-100 text-gray-500',
    baixo: 'bg-yellow-100 text-yellow-700',
    medio: 'bg-orange-100 text-orange-700',
    alto: 'bg-red-100 text-red-700',
  }
  const labels = Object.fromEntries(NIVEIS_FITOSSANIDADE.map((n) => [n.value, n.label]))
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[nivel]}`}>
      {labels[nivel]}
    </span>
  )
}

export default function VisitaDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [visita, setVisita] = useState<VisitaDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('visitas')
        .select(`
          *,
          safra:safras(id, cultura, variedade, safra_label,
            fazenda:fazendas(nome,
              produtor:produtores(id, nome)
            )
          ),
          fotos(id, url, legenda)
        `)
        .eq('id', id)
        .single()

      setVisita(data as unknown as VisitaDetail)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="pt-20"><LoadingSpinner size="lg" /></div>
  if (!visita) return <div className="pt-20 text-center text-gray-500">Visita não encontrada.</div>

  const safra = visita.safra as VisitaDetail['safra']
  const produtor = safra?.fazenda?.produtor
  const fazenda = safra?.fazenda
  const dataFormatted = new Date(visita.data_hora).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{produtor?.nome}</h1>
          <p className="text-sm text-gray-500">{fazenda?.nome} — {safra?.cultura}</p>
        </div>
      </div>

      {/* Data e localização */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {dataFormatted}</span>
        {visita.latitude && (
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> GPS</span>
        )}
      </div>

      {/* Condição + Estágio */}
      <div className="flex items-center gap-4 mb-5">
        {visita.estagio_fenologico && (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {ESTAGIOS_MAP[visita.estagio_fenologico]}
          </span>
        )}
        <StarRating value={visita.condicao_geral} size="md" readonly />
        {visita.stand_plantas && (
          <span className="text-sm text-gray-600">
            {visita.stand_plantas} pl/{visita.stand_unidade === 'por_m2' ? 'm²' : 'm'}
          </span>
        )}
      </div>

      {/* Observação */}
      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Observação</h3>
        <p className="text-gray-800 whitespace-pre-wrap">{visita.observacao_lavoura}</p>
      </Card>

      {/* Fitossanidade */}
      {(visita.pragas || visita.doencas || visita.daninhas) && (
        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Fitossanidade</h3>
          <div className="space-y-2">
            {visita.pragas && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700"><Bug className="w-4 h-4 inline mr-1" />Pragas: {visita.pragas}</span>
                <NivelBadge nivel={visita.pragas_nivel} />
              </div>
            )}
            {visita.doencas && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700"><Leaf className="w-4 h-4 inline mr-1" />Doenças: {visita.doencas}</span>
                <NivelBadge nivel={visita.doencas_nivel} />
              </div>
            )}
            {visita.daninhas && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700"><Sprout className="w-4 h-4 inline mr-1" />Daninhas: {visita.daninhas}</span>
                <NivelBadge nivel={visita.daninhas_nivel} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Manejos */}
      {visita.manejos_realizados && (
        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">O que o produtor fez</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{visita.manejos_realizados}</p>
        </Card>
      )}

      {/* Recomendação */}
      {visita.recomendacao && (
        <Card className="mb-4 !border-accent/30 !bg-accent/5">
          <h3 className="text-sm font-semibold text-accent uppercase mb-2">Recomendação</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{visita.recomendacao}</p>
        </Card>
      )}

      {/* Estimativa */}
      {visita.estimativa_produtividade_kg_ha && (
        <div className="bg-field rounded-xl px-4 py-3 mb-4 text-sm">
          <span className="text-gray-500">Produtividade estimada: </span>
          <span className="font-semibold text-gray-900">{visita.estimativa_produtividade_kg_ha} kg/ha</span>
        </div>
      )}

      {/* Fotos */}
      {visita.fotos && visita.fotos.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Fotos ({visita.fotos.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {visita.fotos.map((f) => (
              <div key={f.id} className="rounded-xl overflow-hidden bg-gray-100 aspect-square">
                <img src={f.url} alt={f.legenda || ''} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
