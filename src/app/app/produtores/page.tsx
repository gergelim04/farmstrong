'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProdutorItem {
  id: string
  nome: string
  apelido: string | null
  municipio: string | null
  fazendas: { nome: string }[]
  ultima_visita?: string
}

export default function ProdutoresPage() {
  const { usuario } = useAuth()
  const [produtores, setProdutores] = useState<ProdutorItem[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return

    async function load() {
      const { data } = await supabase
        .from('produtores')
        .select('id, nome, apelido, municipio, fazendas(nome)')
        .eq('usuario_id', usuario!.id)
        .order('nome')

      const list = (data || []) as ProdutorItem[]

      // Buscar última visita de cada produtor
      for (const p of list) {
        const { data: visitas } = await supabase
          .from('visitas')
          .select('data_hora, safra:safras!inner(produtor_id)')
          .eq('safra.produtor_id', p.id)
          .order('data_hora', { ascending: false })
          .limit(1)

        if (visitas && visitas.length > 0) {
          p.ultima_visita = (visitas[0] as { data_hora: string }).data_hora
        }
      }

      setProdutores(list)
      setLoading(false)
    }

    load()
  }, [usuario])

  const filtered = produtores.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.apelido && p.apelido.toLowerCase().includes(busca.toLowerCase()))
  )

  function diasDesdeVisita(dataHora?: string): string {
    if (!dataHora) return 'Sem visitas'
    const diff = Math.floor((Date.now() - new Date(dataHora).getTime()) / 86400000)
    if (diff === 0) return 'Hoje'
    if (diff === 1) return '1 dia'
    return `${diff} dias`
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Produtores</h1>
        <Link href="/app/produtores/novo"
          className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <Plus className="w-5 h-5 text-white" />
        </Link>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            {busca ? 'Nenhum resultado.' : 'Nenhum produtor cadastrado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Link key={p.id} href={`/app/produtores/${p.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{p.nome}</p>
                    <p className="text-sm text-gray-500">
                      {p.fazendas.length > 0 ? p.fazendas.map((f) => f.nome).join(', ') : 'Sem fazenda'}
                      {p.municipio ? ` — ${p.municipio}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {diasDesdeVisita(p.ultima_visita)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
