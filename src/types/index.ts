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

// ============================
// Plantio — Registro de plantio
// ============================
export interface Plantio {
  id: string
  safra_id: string
  usuario_id: string
  data_plantio: string
  area_plantada_ha: number | null
  populacao_sementes_ha: number | null
  espacamento_cm: number | null
  tratamento_sementes: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

// ============================
// Colheita — Registro de colheita
// ============================
export interface Colheita {
  id: string
  safra_id: string
  usuario_id: string
  data_colheita: string
  area_colhida_ha: number | null
  produtividade_kg_ha: number | null
  umidade_percent: number | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

// ============================
// Entrega — Registro de entrega
// ============================
export interface Entrega {
  id: string
  safra_id: string
  usuario_id: string
  data_entrega: string
  destino: string
  quantidade_kg: number
  preco_por_kg: number | null
  nota_fiscal: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

// ============================
// Clima — Registro de clima
// ============================
export type CondicaoClima = 'sol' | 'parcialmente_nublado' | 'nublado' | 'chuva' | 'chuva_forte' | 'tempestade'

export interface RegistroClima {
  id: string
  fazenda_id: string
  usuario_id: string
  data: string
  temperatura_max: number | null
  temperatura_min: number | null
  precipitacao_mm: number | null
  umidade_percent: number | null
  condicao: CondicaoClima
  observacoes: string | null
  created_at: string
}

// ============================
// Equipe — Membros da equipe
// ============================
export type CargoEquipe = 'agronomo' | 'tecnico' | 'estagiario' | 'gerente' | 'outro'

export interface MembroEquipe {
  id: string
  usuario_id: string
  nome: string
  email: string | null
  telefone: string | null
  cargo: CargoEquipe
  ativo: boolean
  created_at: string
  updated_at: string
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

export interface PlantioComRelacoes extends Plantio {
  safra?: Safra & {
    fazenda?: Fazenda & {
      produtor?: Produtor
    }
  }
}

export interface ColheitaComRelacoes extends Colheita {
  safra?: Safra & {
    fazenda?: Fazenda & {
      produtor?: Produtor
    }
  }
}

export interface EntregaComRelacoes extends Entrega {
  safra?: Safra & {
    fazenda?: Fazenda & {
      produtor?: Produtor
    }
  }
}

export interface RegistroClimaComRelacoes extends RegistroClima {
  fazenda?: Fazenda & {
    produtor?: Produtor
  }
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
