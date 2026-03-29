'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Search, Plus, Camera, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { ESTAGIOS, NIVEIS_FITOSSANIDADE, CULTURAS_COMUNS } from '@/lib/constants'
import { gerarSafraLabel } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Input, { Textarea, Select } from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import StarRating from '@/components/ui/StarRating'
import ChipSelect from '@/components/ui/ChipSelect'
import type { Produtor, Fazenda, Safra, EstagioFenologico, NivelFitossanidade } from '@/types'

// ============================
// PASSO 1 — Quem
// ============================
function Step1({
  usuario_id,
  selectedProdutor,
  selectedFazenda,
  selectedSafra,
  onSelect,
  onNext,
}: {
  usuario_id: string
  selectedProdutor: Produtor | null
  selectedFazenda: Fazenda | null
  selectedSafra: Safra | null
  onSelect: (p: Produtor, f: Fazenda, s: Safra) => void
  onNext: () => void
}) {
  const { showToast } = useToast()
  const [busca, setBusca] = useState('')
  const [produtores, setProdutores] = useState<(Produtor & { fazendas: Fazenda[] })[]>([])
  const [loading, setLoading] = useState(true)

  // Cadastro rápido
  const [showCadastro, setShowCadastro] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoTel, setNovoTel] = useState('')
  const [novoMunicipio, setNovoMunicipio] = useState('')
  const [novoFazenda, setNovoFazenda] = useState('')
  const [novoCultura, setNovoCultura] = useState('')
  const [saving, setSaving] = useState(false)

  // Seleção de fazenda/safra quando produtor tem múltiplas
  const [choosingFazenda, setChoosingFazenda] = useState<Produtor & { fazendas: Fazenda[] } | null>(null)
  const [fazendaSafras, setFazendaSafras] = useState<Safra[]>([])
  const [choosingSafra, setChoosingSafra] = useState<Fazenda | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('produtores')
        .select('*, fazendas(*)')
        .eq('usuario_id', usuario_id)
        .order('updated_at', { ascending: false })
      setProdutores((data || []) as (Produtor & { fazendas: Fazenda[] })[])
      setLoading(false)
    }
    load()
  }, [usuario_id])

  const filtered = produtores.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.apelido && p.apelido.toLowerCase().includes(busca.toLowerCase()))
  )

  async function handleSelectProdutor(p: Produtor & { fazendas: Fazenda[] }) {
    if (p.fazendas.length === 0) {
      showToast('warning', 'Este produtor não tem fazenda cadastrada.')
      return
    }
    if (p.fazendas.length === 1) {
      await selectFazenda(p, p.fazendas[0])
    } else {
      setChoosingFazenda(p)
    }
  }

  async function selectFazenda(p: Produtor & { fazendas: Fazenda[] }, f: Fazenda) {
    setChoosingFazenda(null)
    // Buscar safras ativas desta fazenda
    const { data: safras } = await supabase
      .from('safras')
      .select('*')
      .eq('fazenda_id', f.id)
      .neq('status', 'finalizado')
      .order('created_at', { ascending: false })

    const safraList = (safras || []) as Safra[]
    if (safraList.length === 0) {
      showToast('warning', 'Esta fazenda não tem safra ativa. Crie uma safra primeiro.')
      return
    }
    if (safraList.length === 1) {
      onSelect(p, f, safraList[0])
    } else {
      setFazendaSafras(safraList)
      setChoosingSafra(f)
    }
  }

  async function handleCadastroRapido() {
    if (!novoNome.trim() || !novoFazenda.trim() || !novoCultura.trim()) {
      showToast('error', 'Preencha nome, fazenda e cultura.')
      return
    }
    setSaving(true)

    // 1. Criar produtor
    const { data: prod, error: e1 } = await supabase
      .from('produtores')
      .insert({ usuario_id, nome: novoNome.trim(), telefone: novoTel.trim() || null, municipio: novoMunicipio.trim() || null })
      .select('*')
      .single()
    if (e1 || !prod) { showToast('error', 'Erro ao criar produtor.'); setSaving(false); return }

    // 2. Criar fazenda
    const { data: faz, error: e2 } = await supabase
      .from('fazendas')
      .insert({ produtor_id: prod.id, usuario_id, nome: novoFazenda.trim() })
      .select('*')
      .single()
    if (e2 || !faz) { showToast('error', 'Erro ao criar fazenda.'); setSaving(false); return }

    // 3. Criar safra
    const { data: saf, error: e3 } = await supabase
      .from('safras')
      .insert({
        produtor_id: prod.id,
        fazenda_id: faz.id,
        usuario_id,
        cultura: novoCultura.trim(),
        safra_label: gerarSafraLabel(),
        status: 'em_desenvolvimento',
      })
      .select('*')
      .single()
    if (e3 || !saf) { showToast('error', 'Erro ao criar safra.'); setSaving(false); return }

    onSelect(prod as Produtor, faz as Fazenda, saf as Safra)
    setSaving(false)
  }

  // Tela de escolha de fazenda
  if (choosingFazenda) {
    return (
      <div className="space-y-4">
        <p className="font-semibold text-gray-900">Escolha a fazenda:</p>
        {choosingFazenda.fazendas.map((f) => (
          <button key={f.id} onClick={() => selectFazenda(choosingFazenda, f)}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50">
            <p className="font-medium text-gray-900">{f.nome}</p>
            {f.area_total_ha && <p className="text-sm text-gray-500">{f.area_total_ha} ha</p>}
          </button>
        ))}
      </div>
    )
  }

  // Tela de escolha de safra
  if (choosingSafra) {
    return (
      <div className="space-y-4">
        <p className="font-semibold text-gray-900">Escolha a safra:</p>
        {fazendaSafras.map((s) => (
          <button key={s.id} onClick={() => { onSelect(selectedProdutor!, choosingSafra, s); setChoosingSafra(null) }}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50">
            <p className="font-medium text-gray-900">{s.cultura} {s.variedade ? `(${s.variedade})` : ''}</p>
            <p className="text-sm text-gray-500">{s.safra_label || ''} — {s.area_ha ? `${s.area_ha} ha` : ''}</p>
          </button>
        ))}
      </div>
    )
  }

  // Cadastro rápido
  if (showCadastro) {
    return (
      <div className="space-y-4">
        <button onClick={() => setShowCadastro(false)} className="text-sm text-gray-500 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar à lista
        </button>
        <h3 className="font-semibold text-gray-900">Cadastro rápido</h3>
        <Input label="Nome do produtor *" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} autoFocus />
        <Input label="Telefone" value={novoTel} onChange={(e) => setNovoTel(e.target.value)} />
        <Input label="Município" value={novoMunicipio} onChange={(e) => setNovoMunicipio(e.target.value)} />
        <Input label="Nome da fazenda *" value={novoFazenda} onChange={(e) => setNovoFazenda(e.target.value)} />
        <Select
          label="Cultura *"
          value={novoCultura}
          onChange={(e) => setNovoCultura(e.target.value)}
          options={CULTURAS_COMUNS.map((c) => ({ value: c, label: c }))}
          placeholder="Selecione..."
        />
        <Button onClick={handleCadastroRapido} fullWidth loading={saving}>Criar e continuar</Button>
      </div>
    )
  }

  // Lista de produtores
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {selectedProdutor && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{selectedProdutor.nome}</p>
            <p className="text-sm text-gray-500">{selectedFazenda?.nome} — {selectedSafra?.cultura}</p>
          </div>
          <Check className="w-5 h-5 text-primary" />
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">Carregando...</p>
      ) : (
        <>
          <p className="text-xs text-gray-400 uppercase font-semibold">
            {busca ? 'Resultados' : 'Recentes'}
          </p>
          <div className="space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProdutor(p)}
                className="w-full text-left bg-white rounded-xl border border-gray-100 p-3 active:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{p.nome}</p>
                <p className="text-sm text-gray-500">
                  {p.fazendas.length > 0 ? p.fazendas.map((f) => f.nome).join(', ') : 'Sem fazenda'}
                  {p.municipio ? ` — ${p.municipio}` : ''}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => setShowCadastro(true)}
        className="w-full flex items-center justify-center gap-2 py-3 text-primary font-medium text-sm"
      >
        <Plus className="w-4 h-4" /> Novo produtor
      </button>

      {selectedProdutor && selectedSafra && (
        <Button onClick={onNext} fullWidth size="lg">
          Próximo <ArrowRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}

// ============================
// PASSO 2 — O que viu
// ============================
function Step2({
  form, setForm, onBack, onNext,
}: {
  form: VisitaForm
  setForm: React.Dispatch<React.SetStateAction<VisitaForm>>
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-5">
      <ChipSelect
        label="Estágio fenológico"
        options={ESTAGIOS.map((e) => ({ value: e.value, label: e.short }))}
        value={form.estagio_fenologico}
        onChange={(v) => setForm((f) => ({ ...f, estagio_fenologico: v }))}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Stand de plantas"
            type="number"
            placeholder="Ex: 34"
            value={form.stand_plantas || ''}
            onChange={(e) => setForm((f) => ({ ...f, stand_plantas: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>
        <div className="w-32">
          <Select
            label="Unidade"
            value={form.stand_unidade || 'por_metro'}
            onChange={(e) => setForm((f) => ({ ...f, stand_unidade: e.target.value as 'por_metro' | 'por_m2' }))}
            options={[
              { value: 'por_metro', label: 'por metro' },
              { value: 'por_m2', label: 'por m²' },
            ]}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Condição geral</p>
        <StarRating
          value={form.condicao_geral}
          onChange={(v) => setForm((f) => ({ ...f, condicao_geral: v }))}
          size="lg"
        />
      </div>

      {/* Fitossanidade */}
      {(['pragas', 'doencas', 'daninhas'] as const).map((field) => (
        <div key={field} className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label={field === 'pragas' ? 'Pragas' : field === 'doencas' ? 'Doenças' : 'Daninhas'}
              placeholder="Ex: mosca branca, lagarta"
              value={form[field] || ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            />
          </div>
          <div className="w-28">
            <Select
              value={form[`${field}_nivel`]}
              onChange={(e) => setForm((f) => ({ ...f, [`${field}_nivel`]: e.target.value }))}
              options={NIVEIS_FITOSSANIDADE.map((n) => ({ value: n.value, label: n.label }))}
            />
          </div>
        </div>
      ))}

      <Textarea
        label="O que você viu *"
        placeholder="Descreva o estado da lavoura..."
        value={form.observacao_lavoura}
        onChange={(e) => setForm((f) => ({ ...f, observacao_lavoura: e.target.value }))}
        rows={5}
      />

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </Button>
        <Button onClick={onNext} className="flex-1">
          Próximo <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

// ============================
// PASSO 3 — Recomendação + Fotos
// ============================
function Step3({
  form, setForm, fotos, setFotos, onBack, onSave, saving,
}: {
  form: VisitaForm
  setForm: React.Dispatch<React.SetStateAction<VisitaForm>>
  fotos: File[]
  setFotos: React.Dispatch<React.SetStateAction<File[]>>
  onBack: () => void
  onSave: () => void
  saving: boolean
}) {
  function handleAddFotos(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFotos((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  function removeFoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-5">
      <Textarea
        label="O que o produtor já fez"
        placeholder="Manejos realizados, aplicações, tratos culturais..."
        value={form.manejos_realizados || ''}
        onChange={(e) => setForm((f) => ({ ...f, manejos_realizados: e.target.value }))}
        rows={4}
      />

      <Textarea
        label="Sua recomendação"
        placeholder="O que você recomendou ao produtor..."
        value={form.recomendacao || ''}
        onChange={(e) => setForm((f) => ({ ...f, recomendacao: e.target.value }))}
        rows={4}
      />

      <Input
        label="Produtividade estimada (kg/ha)"
        type="number"
        placeholder="Ex: 450"
        value={form.estimativa_produtividade_kg_ha || ''}
        onChange={(e) => setForm((f) => ({ ...f, estimativa_produtividade_kg_ha: e.target.value ? Number(e.target.value) : null }))}
      />

      {/* Fotos */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Fotos</p>
        <div className="flex flex-wrap gap-2">
          {fotos.map((foto, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
              <img src={URL.createObjectURL(foto)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFoto(i)}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Camera className="w-6 h-6 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleAddFotos}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </Button>
        <Button variant="accent" onClick={onSave} className="flex-1" loading={saving}>
          <Check className="w-5 h-5" /> Salvar
        </Button>
      </div>
    </div>
  )
}

// ============================
// FORM STATE
// ============================
interface VisitaForm {
  estagio_fenologico: EstagioFenologico | null
  stand_plantas: number | null
  stand_unidade: 'por_metro' | 'por_m2'
  condicao_geral: number | null
  observacao_lavoura: string
  pragas: string
  pragas_nivel: NivelFitossanidade
  doencas: string
  doencas_nivel: NivelFitossanidade
  daninhas: string
  daninhas_nivel: NivelFitossanidade
  manejos_realizados: string
  recomendacao: string
  estimativa_produtividade_kg_ha: number | null
}

const initialForm: VisitaForm = {
  estagio_fenologico: null,
  stand_plantas: null,
  stand_unidade: 'por_metro',
  condicao_geral: null,
  observacao_lavoura: '',
  pragas: '',
  pragas_nivel: 'nenhum',
  doencas: '',
  doencas_nivel: 'nenhum',
  daninhas: '',
  daninhas_nivel: 'nenhum',
  manejos_realizados: '',
  recomendacao: '',
  estimativa_produtividade_kg_ha: null,
}

// ============================
// PÁGINA PRINCIPAL — Wizard
// ============================
export default function NovaVisitaPage() {
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<VisitaForm>(initialForm)
  const [fotos, setFotos] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  const [selectedProdutor, setSelectedProdutor] = useState<Produtor | null>(null)
  const [selectedFazenda, setSelectedFazenda] = useState<Fazenda | null>(null)
  const [selectedSafra, setSelectedSafra] = useState<Safra | null>(null)

  const handleSelect = useCallback((p: Produtor, f: Fazenda, s: Safra) => {
    setSelectedProdutor(p)
    setSelectedFazenda(f)
    setSelectedSafra(s)
  }, [])

  // Captura GPS ao entrar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {})
    }
  }, [])

  async function handleSave() {
    if (!form.observacao_lavoura.trim()) {
      showToast('error', 'Escreva pelo menos a observação da lavoura.')
      return
    }
    if (!selectedSafra || !usuario) return

    setSaving(true)

    // Captura GPS
    let lat: number | null = null
    let lng: number | null = null
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      )
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch { /* GPS opcional */ }

    // Inserir visita
    const { data: visita, error } = await supabase
      .from('visitas')
      .insert({
        safra_id: selectedSafra.id,
        usuario_id: usuario.id,
        data_hora: new Date().toISOString(),
        latitude: lat,
        longitude: lng,
        estagio_fenologico: form.estagio_fenologico,
        stand_plantas: form.stand_plantas,
        stand_unidade: form.stand_unidade,
        condicao_geral: form.condicao_geral,
        observacao_lavoura: form.observacao_lavoura.trim(),
        pragas: form.pragas.trim() || null,
        pragas_nivel: form.pragas_nivel,
        doencas: form.doencas.trim() || null,
        doencas_nivel: form.doencas_nivel,
        daninhas: form.daninhas.trim() || null,
        daninhas_nivel: form.daninhas_nivel,
        manejos_realizados: form.manejos_realizados.trim() || null,
        recomendacao: form.recomendacao.trim() || null,
        estimativa_produtividade_kg_ha: form.estimativa_produtividade_kg_ha,
      })
      .select('id')
      .single()

    if (error || !visita) {
      showToast('error', 'Erro ao salvar visita.')
      setSaving(false)
      return
    }

    // Upload de fotos
    for (let i = 0; i < fotos.length; i++) {
      const file = fotos[i]
      const path = `${usuario.id}/${visita.id}/${crypto.randomUUID()}.jpg`
      const { error: uploadErr } = await supabase.storage
        .from('fotos')
        .upload(path, file, { contentType: file.type })

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(path)
        await supabase.from('fotos').insert({
          visita_id: visita.id,
          usuario_id: usuario.id,
          url: urlData.publicUrl,
          ordem: i,
        })
      }
    }

    showToast('success', 'Visita registrada!')
    router.push('/app')
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => step === 1 ? router.back() : setStep(step - 1)}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Nova Visita</h1>
        <span className="text-sm text-gray-400 font-medium">Passo {step}/3</span>
      </div>

      {/* Subtítulo com produtor selecionado */}
      {selectedProdutor && step > 1 && (
        <div className="bg-field rounded-xl px-3 py-2 mb-4 text-sm text-gray-600">
          {selectedProdutor.nome} — {selectedFazenda?.nome}
        </div>
      )}

      {/* Steps */}
      {step === 1 && usuario && (
        <Step1
          usuario_id={usuario.id}
          selectedProdutor={selectedProdutor}
          selectedFazenda={selectedFazenda}
          selectedSafra={selectedSafra}
          onSelect={handleSelect}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          form={form}
          setForm={setForm}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3
          form={form}
          setForm={setForm}
          fotos={fotos}
          setFotos={setFotos}
          onBack={() => setStep(2)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  )
}
