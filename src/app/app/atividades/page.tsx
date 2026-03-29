'use client'

import Link from 'next/link'
import {
  Sprout, Wheat, Truck, CloudSun, Users, BarChart3,
  ChevronRight, ClipboardList,
} from 'lucide-react'

const modules = [
  {
    href: '/app/visita/nova',
    icon: ClipboardList,
    label: 'Nova Visita',
    desc: 'Registrar visita de campo',
    color: 'bg-accent/10 text-accent',
  },
  {
    href: '/app/plantio',
    icon: Sprout,
    label: 'Plantio',
    desc: 'Registros de plantio',
    color: 'bg-green-100 text-green-700',
  },
  {
    href: '/app/colheita',
    icon: Wheat,
    label: 'Colheita',
    desc: 'Registros de colheita',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    href: '/app/entregas',
    icon: Truck,
    label: 'Entregas',
    desc: 'Entregas de grãos',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    href: '/app/clima',
    icon: CloudSun,
    label: 'Clima',
    desc: 'Registros meteorológicos',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    href: '/app/equipe',
    icon: Users,
    label: 'Equipe',
    desc: 'Gerenciar membros',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    href: '/app/dashboard',
    icon: BarChart3,
    label: 'Dashboard',
    desc: 'Resumos e indicadores',
    color: 'bg-primary/10 text-primary',
  },
]

export default function AtividadesPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Atividades</h1>
      <p className="text-sm text-gray-500 mb-6">Acesse todos os módulos do sistema</p>

      <div className="space-y-3">
        {modules.map((m) => (
          <Link key={m.href} href={m.href}>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm active:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color}`}>
                <m.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{m.label}</p>
                <p className="text-sm text-gray-500">{m.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
