'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UsuarioConfig } from '@/types'

interface AuthState {
  session: Session | null
  authUser: User | null
  usuario: UsuarioConfig | null
  loading: boolean
}

function translateAuthError(message: string): string {
  const errors: Record<string, string> = {
    'invalid login credentials': 'E-mail ou senha incorretos.',
    'email not confirmed': 'Confirme seu e-mail antes de entrar.',
    'user already registered': 'Este e-mail já está cadastrado.',
    'password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'signup requires a valid password': 'Informe uma senha válida.',
    'unable to validate email address: invalid format': 'Formato de e-mail inválido.',
    'email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  }
  return errors[message.toLowerCase()] || `Erro: ${message}`
}

async function fetchUsuario(authId: string): Promise<UsuarioConfig | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authId)
    .maybeSingle()
  if (error || !data) return null
  return data as UsuarioConfig
}

async function provisionUser(authUser: User): Promise<UsuarioConfig | null> {
  const meta = authUser.user_metadata
  if (!meta?.nome) return null

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        id: authUser.id,
        nome: meta.nome,
        email: authUser.email,
        telefone: meta.telefone || null,
        empresa_nome: meta.empresa_nome || null,
      })
      .select('*')
      .single()

    if (error || !data) return null
    return data as UsuarioConfig
  } catch {
    return null
  }
}

async function resolveUsuario(authUser: User): Promise<UsuarioConfig | null> {
  const existing = await fetchUsuario(authUser.id)
  if (existing) return existing
  return provisionUser(authUser)
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    authUser: null,
    usuario: null,
    loading: true,
  })
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const usuario = await resolveUsuario(session.user)
          setState({ session, authUser: session.user, usuario, loading: false })
        } catch {
          setState({ session, authUser: session.user, usuario: null, loading: false })
        }
      } else {
        setState({ session: null, authUser: null, usuario: null, loading: false })
      }
    }).catch(() => {
      setState({ session: null, authUser: null, usuario: null, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          try {
            const usuario = await resolveUsuario(session.user)
            setState({ session, authUser: session.user, usuario, loading: false })
          } catch {
            setState({ session, authUser: session.user, usuario: null, loading: false })
          }
        } else {
          setState({ session: null, authUser: null, usuario: null, loading: false })
        }
      }
    )

    return () => { subscription.unsubscribe() }
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: translateAuthError(error.message) }
    return { error: null }
  }

  const signup = async (params: {
    email: string
    password: string
    nome: string
    telefone?: string
    empresaNome?: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          nome: params.nome,
          telefone: params.telefone || '',
          empresa_nome: params.empresaNome || '',
        },
      },
    })

    if (error) return { error: translateAuthError(error.message) }
    if (!data.user) return { error: 'Erro ao criar conta.' }

    if (data.session) {
      await provisionUser(data.user)
    }

    return { error: null }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setState({ session: null, authUser: null, usuario: null, loading: false })
  }

  return {
    session: state.session,
    authUser: state.authUser,
    usuario: state.usuario,
    loading: state.loading,
    isAuthenticated: !!state.session,
    login,
    signup,
    logout,
  }
}
