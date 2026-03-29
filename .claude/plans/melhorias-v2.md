# Farmview v2 — Plano de Melhorias

## Resumo das mudanças
1. **Novo modelo de dados**: Produtor → Fazendas (1:N). Safra = ano/período, não entidade principal
2. **Plano Free**: 10 produtores, grátis por 1 ano e 9 meses
3. **Tela Admin**: CRUD de usuários + relatórios consolidados por agrônomo
4. **Simplificação geral**: foco na safra atual, safras antigas são histórico consultável

---

## Fase 1 — Modelo de Dados (types + banco)

### 1.1 Nova interface `Fazenda`
Criar em `src/types/index.ts`:
```ts
export interface Fazenda {
  id: string
  produtor_id: string
  empresa_id: string
  nome: string              // "Fazenda São José"
  cidade: string | null
  estado: string | null
  latitude: number | null
  longitude: number | null
  area_total_hectares: number | null
  ativo: boolean
  created_at: string
  updated_at: string
}
```

### 1.2 Atualizar `Produtor` — remover campos de fazenda
Remover de Produtor: `propriedade`, `endereco`, `cidade`, `estado`, `latitude`, `longitude`, `area_total_hectares`
Produtor fica só com dados pessoais: nome, cpf_cnpj, telefone, email, observacoes

### 1.3 Atualizar `Safra` — vincular a Fazenda, não a Produtor
```ts
export interface Safra {
  id: string
  fazenda_id: string        // era produtor_id
  empresa_id: string
  ano_safra: string         // "2025", "2025/2026"
  cultura: string
  variedade: string | null
  area_hectares: number
  data_plantio: string | null
  data_colheita_prevista: string | null
  data_colheita_real: string | null
  status: 'planejada' | 'plantada' | 'em_desenvolvimento' | 'colhida' | 'cancelada'
  observacoes: string | null
  created_at: string
  updated_at: string
}
```

### 1.4 Atualizar `Empresa` — adicionar campos de plano
```ts
export interface Empresa {
  id: string
  nome: string
  cnpj: string | null       // era obrigatório, agora opcional
  plano: 'free' | 'pro'
  data_inicio_trial: string  // data que criou a conta
  // ... demais campos iguais
}
```

### 1.5 Atualizar `Visita` — vincular a safra (que agora vincula a fazenda)
Sem mudanças estruturais, `safra_id` continua existindo.

### 1.6 SQL para criar tabela `fazendas` no Supabase
Instruir o usuário a rodar no SQL Editor:
```sql
CREATE TABLE fazendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produtor_id UUID REFERENCES produtores(id) ON DELETE CASCADE NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  area_total_hectares DOUBLE PRECISION,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar fazenda_id na safras
ALTER TABLE safras ADD COLUMN fazenda_id UUID REFERENCES fazendas(id);
-- Adicionar ano_safra na safras
ALTER TABLE safras ADD COLUMN ano_safra TEXT;
-- Adicionar data_inicio_trial na empresas
ALTER TABLE empresas ADD COLUMN data_inicio_trial TIMESTAMPTZ DEFAULT now();

-- RLS para fazendas
ALTER TABLE fazendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD fazendas of own empresa" ON fazendas
  FOR ALL TO authenticated
  USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()))
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));
```

---

## Fase 2 — Plano Free (10 produtores, 1a9m grátis)

### 2.1 Atualizar `src/lib/constants.ts`
```ts
export const FREE_PLAN_LIMITS = {
  maxProdutores: 10,
  trialDurationMonths: 21,  // 1 ano e 9 meses
}
```
Remover `maxSafrasPorProdutor` — sem limite de safras.

### 2.2 Atualizar `src/hooks/usePlano.ts`
- Remover `checkCanAddSafra`
- Manter `checkCanAddProdutor` com limite 10
- Adicionar `checkTrialExpired()`: compara `data_inicio_trial` da empresa com data atual
- Se trial expirou E plano é free → mostrar aviso "Seu período gratuito expirou"
- `checkCanGeneratePDF` e `checkCanMeasureArea` continuam Pro-only

### 2.3 Atualizar página de Planos (`/dashboard/planos`)
- Free: 10 produtores, safras ilimitadas, 1 ano e 9 meses grátis
- Pro: R$ 49,90/mês, produtores ilimitados, dossiê PDF, medição GPS

---

## Fase 3 — Páginas de Produtores (simplificar)

### 3.1 Lista de produtores (`/dashboard/produtores`)
- Card mostra: nome do produtor, quantidade de fazendas, telefone
- Não mostra mais "propriedade" (agora são fazendas separadas)

### 3.2 Cadastro de produtor (`/dashboard/produtores/novo`)
- Campos: nome (obrigatório), cpf/cnpj (opcional), telefone, email
- Sem campos de fazenda — fazendas são criadas depois, dentro do perfil do produtor

### 3.3 Perfil do produtor (`/dashboard/produtores/[id]`)
- Dados pessoais no topo
- Seção "Fazendas" — lista de fazendas do produtor
  - Cada fazenda mostra: nome, cidade/estado, área, safra atual (se houver)
  - Botão "+ Nova Fazenda"
- Botão "Editar Produtor" (dados pessoais)

### 3.4 Novas páginas de Fazenda
- `/dashboard/produtores/[id]/fazendas/nova` — Cadastro de fazenda
  - Campos: nome, cidade, estado, área em hectares
  - Botão "Capturar GPS"
- `/dashboard/produtores/[id]/fazendas/[fazendaId]` — Perfil da fazenda
  - Dados da fazenda + mapa com localização
  - Lista de safras (safra atual em destaque, históricas abaixo)
  - Botão "+ Nova Safra"

---

## Fase 4 — Safras (simplificar, foco na atual)

### 4.1 Lista de safras (`/dashboard/safras`)
- Filtro principal: Ano da Safra (default: ano atual)
- Mostra: cultura, fazenda, produtor, status
- Safras antigas acessíveis mudando o filtro de ano

### 4.2 Criar safra (`/dashboard/safras/nova`)
- Selecionar Produtor → Fazenda → preencher dados
- Campo "Ano da Safra" (ex: "2025" ou "2025/2026") — default ano atual
- Demais campos: cultura, variedade, área, datas

### 4.3 Detalhe da safra (`/dashboard/safras/[id]`)
- Sem mudanças significativas, apenas refletir novo modelo

---

## Fase 5 — Tela Admin

### 5.1 Rota `/dashboard/admin` — só acessível por role='admin'

### 5.2 Página principal do admin (`/dashboard/admin/page.tsx`)
**Painel de resumo:**
- Total de agrônomos na equipe
- Total de produtores da empresa
- Total de visitas (mês atual)
- Total de safras ativas

**Tabela de agrônomos:**
- Nome, email, CREA, status (ativo/inativo), total de produtores, total de visitas (mês)
- Clicar num agrônomo → ver detalhe

### 5.3 Gerenciar usuários (`/dashboard/admin/usuarios`)
- Lista de usuários da empresa
- Botão "+ Convidar Agrônomo"
- Para cada usuário: nome, email, role, ativo
- Ações: ativar/desativar, remover

### 5.4 Convidar agrônomo (`/dashboard/admin/usuarios/convidar`)
- Campos: nome, email, CREA (opcional)
- Cria usuário no Supabase Auth (via admin ou invite)
- Cria registro em `usuarios` vinculado à mesma empresa com role='agronomo'

### 5.5 Detalhe do agrônomo (`/dashboard/admin/usuarios/[id]`)
- Dados do agrônomo
- Relatório: seus produtores, safras, visitas recentes
- Poder desativar

### 5.6 Atualizar navegação
- No Sidebar e BottomNav (menu "Menu"): mostrar "Administração" apenas se role='admin'
- No AuthGuard: verificar role para rotas /dashboard/admin/*

---

## Fase 6 — Ajustes gerais

### 6.1 Atualizar Dashboard
- Remover referências a limites de safra por produtor
- Ajustar cards para refletir novo modelo

### 6.2 Atualizar IndexedDB (`src/lib/db.ts`)
- Adicionar tabela `fazendas` no Dexie schema

### 6.3 Atualizar sync (`src/lib/sync.ts`)
- Adicionar sincronização de fazendas

---

## Ordem de execução
1. Fase 1 — Modelo de dados (types + SQL para usuário rodar)
2. Fase 2 — Plano Free atualizado
3. Fase 3 — Páginas de Produtores refatoradas
4. Fase 4 — Safras simplificadas
5. Fase 5 — Tela Admin completa
6. Fase 6 — Ajustes e build
