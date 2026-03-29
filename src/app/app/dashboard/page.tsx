'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Sprout, Wheat, Truck, Users, MapPin, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DashboardStats {
  totalProdutores: number
  totalFazendas: number
  totalSafrasAtivas: number
  totalVisitas: number
  totalPlantios: number
  totalColheitas: number
  totalEntregas: number
  totalEntregaKg: number
  totalEquipe: number
  areaTotal: number
  visitasUltimos30: number
}

export default function DashboardPage() {
  const { usuario } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return

    async function loadStats() {
      const uid = usuario!.id

      const [
        { count: totalProdutores },
        { count: totalFazendas },
        { count: totalSafrasAtivas },
        { count: totalVisitas },
        { count: totalPlantios },
        { count: totalColheitas },
        { data: entregasData },
        { count: totalEquipe },
        { data: safrasData },
        { count: visitasUltimos30 },
      ] = await Promise.all([
        supabase.from('produtores').select('*', { count: 'exact', head: true }).eq('usuario_id', uid),
        supabase.from('fazendas').select('*', { count: 'exact', head: true }).eq('usuario_id', uid),
        supabase.from('safras').select('*', { count: 'exact', head: true }).eq('usuario_id', uid).neq('status', 'finalizado'),
        supabase.from('visitas').select('*', { count: 'exact', head: true }).eq('usuario_id', uid),
        supabase.from('plantios').select('*', { count: 'exact', head: true }).eq('usuario_id', uid),
        supabase.from('colheitas').select('*', { count: 'exact', head: true }).eq('usuario_id', uid),
        supabase.from('entregas').select('quantidade_kg').eq('usuario_id', uid),
        supabase.from('equipe').select('*', { count: 'exact', head: true }).eq('usuario_id', uid).eq('ativo', true),
        supabase.from('safras').select('area_ha').eq('usuario_id', uid).neq('status', 'finalizado'),
        supabase.from('visitas').select('*', { count: 'exact', head: true }).eq('usuario_id', uid)
          .gte('data_hora', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      const totalEntregaKg = (entregasData || []).reduce((acc: number, e: Record<string, number>) => acc + (e.quantidade_kg || 0), 0)
      const areaTotal = (safrasData || []).reduce((acc: number, s: Record<string, number | null>) => acc + (s.area_ha || 0), 0)

      setStats({
        totalProdutores: totalProdutores || 0,
        totalFazendas: totalFazendas || 0,
        totalSafrasAtivas: totalSafrasAtivas || 0,
        totalVisitas: totalVisitas || 0,
        totalPlantios: totalPlantios || 0,
        totalColheitas: totalColheitas || 0,
        totalEntregas: (entregasData || []).length,
        totalEntregaKg,
        totalEquipe: totalEquipe || 0,
        areaTotal,
        visitasUltimos30: visitasUltimos30 || 0,
      })
      setLoading(false)
    }

    loadStats()
  }, [usuario])

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      label: 'Produtores',
      value: stats.totalProdutores,
      icon: Users,
      color: 'bg-primary/10 text-primary',
      href: '/app/produtores',
    },
    {
      label: 'Fazendas',
      value: stats.totalFazendas,
      icon: MapPin,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Safras ativas',
      value: stats.totalSafrasAtivas,
      icon: Sprout,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Área total (ha)',
      value: stats.areaTotal.toLocaleString('pt-BR'),
      icon: TrendingUp,
      color: 'bg-lime-100 text-lime-700',
    },
    {
      label: 'Visitas (total)',
      value: stats.totalVisitas,
      icon: ClipboardList,
      color: 'bg-accent/10 text-accent',
    },
    {
      label: 'Visitas (30 dias)',
      value: stats.visitasUltimos30,
      icon: ClipboardList,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Plantios',
      value: stats.totalPlantios,
      icon: Sprout,
      color: 'bg-green-100 text-green-700',
      href: '/app/plantio',
    },
    {
      label: 'Colheitas',
      value: stats.totalColheitas,
      icon: Wheat,
      color: 'bg-amber-100 text-amber-700',
      href: '/app/colheita',
    },
    {
      label: 'Entregas',
      value: `${stats.totalEntregas} (${(stats.totalEntregaKg / 1000).toFixed(1)} ton)`,
      icon: Truck,
      color: 'bg-blue-100 text-blue-700',
      href: '/app/entregas',
    },
    {
      label: 'Equipe ativa',
      value: stats.totalEquipe,
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
      href: '/app/equipe',
    },
  ]

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/atividades" className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const content = (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          )

          if (card.href) {
            return <Link key={card.label} href={card.href}>{content}</Link>
          }
          return <div key={card.label}>{content}</div>
        })}
      </div>
    </div>
  )
}
