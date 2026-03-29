// ============================
// FARMSTRONG — Tipos
// ============================

export interface Produtor {
  id: string
  usuario_id: string
  nome: string
  apelido: string | null
  telefone: string | null
  municipio: string | null
  estado: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface Fazenda {
  id: string
  produtor_id: string
  usuario_id: string
  nome: string
  latitude: number | null
  longitude: number | null
  area_total_ha: number | null
  created_at: string
  updated_at: string
}

export interface Safra {
  id: string
  produtor_id: string
  fazenda_id: string
  usuario_id: string
  cultura: string
  variedade: string | null
  area_ha: number | null
  data_plantio: string | null
  safra_label: string | null
  status: 'plantando' | 'em_desenvolvimento' | 'dessecando' | 'colhendo' | 'finalizado'
  created_at: string
  updated_at: string
}

export type EstagioFenologico =
  | 'emergencia'
  | 'vegetativo'
  | 'florescimento'
  | 'enchimento'
  | 'maturacao'
  | 'senescencia'

export type NivelFitossanidade = 'nenhum' | 'baixo' | 'medio' | 'alto'

export interface Visita {
  id: string
  safra_id: string
  usuario_id: string
  data_hora: string
  latitude: number | null
  longitude: number | null

  // Bloco 2 — O que viu
  estagio_fenologico: EstagioFenologico | null
  stand_plantas: number | null
  stand_unidade: 'por_metro' | 'por_m2' | null
  condicao_geral: number | null // 1 a 5
  observacao_lavoura: string // obrigatório

  // Bloco 2b — Fitossanidade
  pragas: string | null
  pragas_nivel: NivelFitossanidade
  doencas: string | null
  doencas_nivel: NivelFitossanidade
  daninhas: string | null
  daninhas_nivel: NivelFitossanidade

  // Bloco 3 — O que o produtor fez
  manejos_realizados: string | null

  // Bloco 4 — Recomendação
  recomendacao: string | null

  // Bloco 5 — Estimativas
  estimativa_produtividade_kg_ha: number | null
  previsao_dessecacao: string | null
  previsao_colheita: string | null

  created_at: string
  updated_at: string
}

export interface Foto {
  id: string
  visita_id: string
  usuario_id: string
  url: string
  latitude: number | null
  longitude: number | null
  legenda: string | null
  ordem: number
  created_at: string
}

// Joins para queries
export interface VisitaComRelacoes extends Visita {
  safra?: Safra & {
    fazenda?: Fazenda
    produtor?: Produtor
  }
  fotos?: Foto[]
}

export interface ProdutorComFazendas extends Produtor {
  fazendas?: Fazenda[]
}

// Configurações do usuário
export interface UsuarioConfig {
  id: string
  nome: string
  telefone: string | null
  empresa_nome: string | null
  empresa_logo_url: string | null
  email: string
  created_at: string
}
