// ============================
// FARMSTRONG — Constantes
// ============================

import type { EstagioFenologico, NivelFitossanidade } from '@/types'

// Estágios fenológicos
export const ESTAGIOS: { value: EstagioFenologico; label: string; short: string }[] = [
  { value: 'emergencia', label: 'Emergência', short: 'Emerg.' },
  { value: 'vegetativo', label: 'Vegetativo', short: 'Veget.' },
  { value: 'florescimento', label: 'Florescimento', short: 'Flor.' },
  { value: 'enchimento', label: 'Enchimento', short: 'Ench.' },
  { value: 'maturacao', label: 'Maturação', short: 'Matur.' },
  { value: 'senescencia', label: 'Senescência', short: 'Senesc.' },
]

export const ESTAGIOS_MAP: Record<EstagioFenologico, string> = {
  emergencia: 'Emergência',
  vegetativo: 'Vegetativo',
  florescimento: 'Florescimento',
  enchimento: 'Enchimento',
  maturacao: 'Maturação',
  senescencia: 'Senescência',
}

// Níveis de fitossanidade
export const NIVEIS_FITOSSANIDADE: { value: NivelFitossanidade; label: string }[] = [
  { value: 'nenhum', label: 'Nenhum' },
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Médio' },
  { value: 'alto', label: 'Alto' },
]

// Status da safra
export const STATUS_SAFRA: Record<string, { label: string; color: string }> = {
  plantando: { label: 'Plantando', color: 'bg-blue-100 text-blue-800' },
  em_desenvolvimento: { label: 'Em desenvolvimento', color: 'bg-green-100 text-green-800' },
  dessecando: { label: 'Dessecando', color: 'bg-yellow-100 text-yellow-800' },
  colhendo: { label: 'Colhendo', color: 'bg-orange-100 text-orange-800' },
  finalizado: { label: 'Finalizado', color: 'bg-gray-100 text-gray-600' },
}

// Culturas comuns
export const CULTURAS_COMUNS = [
  'Soja', 'Milho', 'Gergelim', 'Algodão', 'Feijão', 'Sorgo',
  'Arroz', 'Trigo', 'Girassol', 'Amendoim', 'Café', 'Cana-de-açúcar',
]

// Autocomplete — pragas
export const PRAGAS_COMUNS = [
  'Lagarta (Spodoptera)', 'Lagarta Elasmo', 'Falsa-medideira', 'Mosca branca',
  'Vaquinha', 'Percevejo', 'Trips', 'Grilo', 'Ácaro', 'Cigarrinha', 'Pulgão',
]

// Autocomplete — doenças
export const DOENCAS_COMUNS = [
  'Cercosporiose', 'Rizoctonia', 'Fusariose', 'Oídio',
  'Antracnose', 'Mancha foliar', 'Mofo branco', 'Ferrugem',
]

// Autocomplete — daninhas
export const DANINHAS_COMUNS = [
  'Pé de galinha', 'Soja tiguera', 'Corda de viola', 'Braquiária',
  'Capim amargoso', 'Leiteiro', 'Erva quente', 'Buva',
  'Caruru', 'Trapoeraba', 'Picão preto',
]

// Condições climáticas
export const CONDICOES_CLIMA: { value: string; label: string; icon: string }[] = [
  { value: 'sol', label: 'Sol', icon: '☀️' },
  { value: 'parcialmente_nublado', label: 'Parcialmente nublado', icon: '⛅' },
  { value: 'nublado', label: 'Nublado', icon: '☁️' },
  { value: 'chuva', label: 'Chuva', icon: '🌧️' },
  { value: 'chuva_forte', label: 'Chuva forte', icon: '🌧️' },
  { value: 'tempestade', label: 'Tempestade', icon: '⛈️' },
]

export const CONDICOES_CLIMA_MAP: Record<string, { label: string; icon: string }> = {
  sol: { label: 'Sol', icon: '☀️' },
  parcialmente_nublado: { label: 'Parc. nublado', icon: '⛅' },
  nublado: { label: 'Nublado', icon: '☁️' },
  chuva: { label: 'Chuva', icon: '🌧️' },
  chuva_forte: { label: 'Chuva forte', icon: '🌧️' },
  tempestade: { label: 'Tempestade', icon: '⛈️' },
}

// Cargos da equipe
export const CARGOS_EQUIPE: { value: string; label: string }[] = [
  { value: 'agronomo', label: 'Agrônomo' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'estagiario', label: 'Estagiário' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'outro', label: 'Outro' },
]

export const CARGOS_MAP: Record<string, string> = {
  agronomo: 'Agrônomo',
  tecnico: 'Técnico',
  estagiario: 'Estagiário',
  gerente: 'Gerente',
  outro: 'Outro',
}

// Gera label da safra baseado na data
export function gerarSafraLabel(dataPlantio?: string): string {
  const now = dataPlantio ? new Date(dataPlantio) : new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  if (month <= 6) return `Safrinha ${year}`
  return `Safra ${year}/${(year + 1).toString().slice(2)}`
}
