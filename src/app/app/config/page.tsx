'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Building2, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ConfigPage() {
  const { usuario, logout } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    router.replace('/')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

      {/* Perfil */}
      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{usuario?.nome || '—'}</p>
            <p className="text-sm text-gray-500">{usuario?.email || ''}</p>
            {usuario?.telefone && (
              <p className="text-sm text-gray-500">{usuario.telefone}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Empresa */}
      {usuario?.empresa_nome && (
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium text-gray-900">{usuario.empresa_nome}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Sync status */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          {navigator.onLine ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium text-gray-900">
              {navigator.onLine ? 'Online — dados sincronizados' : 'Offline — sincroniza ao reconectar'}
            </p>
          </div>
        </div>
      </Card>

      {/* Sobre */}
      <Card className="mb-6">
        <p className="text-sm text-gray-500">Farmstrong v1.0</p>
        <p className="text-xs text-gray-400 mt-1">Registre visitas de campo. Consulte o histórico. Recomende com segurança.</p>
      </Card>

      {/* Logout */}
      <Button variant="danger" fullWidth size="lg" onClick={handleLogout} loading={loggingOut}>
        <LogOut className="w-5 h-5" /> Sair da conta
      </Button>
    </div>
  )
}
