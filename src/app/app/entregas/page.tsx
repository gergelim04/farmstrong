'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Truck, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface EntregaFeed {
  id: string
  data_entrega: string
  destino: string
  quantidade_kg: number
  preco_por_kg: number | null
  nota_fiscal: string | null
  observacoes: string | null
  safra: {
    cultura: string
    fazenda: {
      nome: string
      produtor: { nome: string }
    }
  }
}

export default function EntregasListPage() {
  const { usuario } = useAuth()
  const [entregas, setEntregas] = useState<EntregaFeed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    async function load() {
      const { data } = await supabase
        .from('entregas')
        .select(`
          id, data_entrega, destino, quantidade_kg, preco_por_kg, nota_fiscal, observacoes,
          safra:safras(
            cultura,
            fazenda:fazendas(nome, produtor:produtores(nome))
          )
        `)
        .eq('usuario_id', usuario!.id)
        .order('data_entrega', { ascending: false })
        .limit(50)
      setEntregas((data || []) as unknown as EntregaFeed[])
      setLoading(false)
    }
    load()
  }, [usuario])

  const totalKg = entregas.reduce((acc, e) => acc + e.quantidade_kg, 0)

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/atividades" className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Entregas</h1>
          <p className="text-sm text-gray-500">{entregas.length} entregas — {(totalKg / 1000).toFixed(1)} ton</p>
        </div>
        <Link href="/app/entregas/novo">
          <button className="bg-primary text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm">
            <Plus className="w-4 h-4" /> Nova
          </button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : entregas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Truck className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-500 text-sm">Nenhuma entrega registrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entregas.map((e) => {
            const safra = e.safra as unknown as EntregaFeed['safra']
            const valorTotal = e.preco_por_kg ? e.quantidade_kg * e.preco_por_kg : null
            return (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{e.destino}</p>
                    <p className="text-sm text-gray-500">
                      {safra?.fazenda?.produtor?.nome} — {safra?.cultura}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(e.data_entrega).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="font-medium text-blue-700">{(e.quantidade_kg / 1000).toFixed(1)} ton</span>
                  {e.preco_por_kg && <span className="text-gray-600">R$ {e.preco_por_kg.toFixed(2)}/kg</span>}
                  {valorTotal && <span className="text-green-700 font-medium">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
                </div>
                {e.nota_fiscal && (
                  <p className="text-xs text-gray-400 mt-1">NF: {e.nota_fiscal}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
