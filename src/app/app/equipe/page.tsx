'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, Phone, Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { CARGOS_MAP } from '@/lib/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Membro {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  cargo: string
  ativo: boolean
}

export default function EquipeListPage() {
  const { usuario } = useAuth()
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    async function load() {
      const { data } = await supabase
        .from('equipe')
        .select('*')
        .eq('usuario_id', usuario!.id)
        .order('nome')
      setMembros((data || []) as Membro[])
      setLoading(false)
    }
    load()
  }, [usuario])

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('equipe').update({ ativo: !ativo }).eq('id', id)
    setMembros((prev) => prev.map((m) => m.id === id ? { ...m, ativo: !ativo } : m))
  }

  const ativos = membros.filter((m) => m.ativo)
  const inativos = membros.filter((m) => !m.ativo)

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/atividades" className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Equipe</h1>
          <p className="text-sm text-gray-500">{ativos.length} ativos</p>
        </div>
        <Link href="/app/equipe/novo">
          <button className="bg-primary text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : membros.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-500 text-sm">Nenhum membro cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ativos.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ativos</p>
              {ativos.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{m.nome}</p>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        {CARGOS_MAP[m.cargo] || m.cargo}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleAtivo(m.id, m.ativo)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Desativar
                    </button>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {m.telefone && (
                      <a href={`tel:${m.telefone}`} className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {m.telefone}
                      </a>
                    )}
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {m.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {inativos.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inativos</p>
              {inativos.map((m) => (
                <div key={m.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-700">{m.nome}</p>
                      <span className="text-xs text-gray-500">
                        {CARGOS_MAP[m.cargo] || m.cargo}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleAtivo(m.id, m.ativo)}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Reativar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
