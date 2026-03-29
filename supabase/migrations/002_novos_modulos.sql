-- ============================
-- FARMSTRONG — Novos Módulos
-- Plantio, Colheita, Entregas, Clima, Equipe
-- ============================

-- ============================
-- PLANTIOS
-- ============================
CREATE TABLE IF NOT EXISTS plantios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safra_id UUID NOT NULL REFERENCES safras(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_plantio DATE NOT NULL,
  area_plantada_ha NUMERIC(10,2),
  populacao_sementes_ha INTEGER,
  espacamento_cm NUMERIC(6,1),
  tratamento_sementes TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE plantios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê seus plantios"
  ON plantios FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário cria plantios"
  ON plantios FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuário edita seus plantios"
  ON plantios FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário deleta seus plantios"
  ON plantios FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================
-- COLHEITAS
-- ============================
CREATE TABLE IF NOT EXISTS colheitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safra_id UUID NOT NULL REFERENCES safras(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_colheita DATE NOT NULL,
  area_colhida_ha NUMERIC(10,2),
  produtividade_kg_ha NUMERIC(10,2),
  umidade_percent NUMERIC(5,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE colheitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas colheitas"
  ON colheitas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário cria colheitas"
  ON colheitas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuário edita suas colheitas"
  ON colheitas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário deleta suas colheitas"
  ON colheitas FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================
-- ENTREGAS
-- ============================
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safra_id UUID NOT NULL REFERENCES safras(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_entrega DATE NOT NULL,
  destino TEXT NOT NULL,
  quantidade_kg NUMERIC(12,2) NOT NULL,
  preco_por_kg NUMERIC(10,4),
  nota_fiscal TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas entregas"
  ON entregas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário cria entregas"
  ON entregas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuário edita suas entregas"
  ON entregas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário deleta suas entregas"
  ON entregas FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================
-- REGISTROS_CLIMA
-- ============================
CREATE TABLE IF NOT EXISTS registros_clima (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id UUID NOT NULL REFERENCES fazendas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  temperatura_max NUMERIC(5,1),
  temperatura_min NUMERIC(5,1),
  precipitacao_mm NUMERIC(8,1),
  umidade_percent NUMERIC(5,1),
  condicao TEXT NOT NULL DEFAULT 'sol',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE registros_clima ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê seus registros clima"
  ON registros_clima FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário cria registros clima"
  ON registros_clima FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuário edita seus registros clima"
  ON registros_clima FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário deleta seus registros clima"
  ON registros_clima FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================
-- EQUIPE
-- ============================
CREATE TABLE IF NOT EXISTS equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cargo TEXT NOT NULL DEFAULT 'tecnico',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê sua equipe"
  ON equipe FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário cria membros"
  ON equipe FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuário edita sua equipe"
  ON equipe FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário deleta membros"
  ON equipe FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================
-- ÍNDICES
-- ============================
CREATE INDEX IF NOT EXISTS idx_plantios_safra ON plantios(safra_id);
CREATE INDEX IF NOT EXISTS idx_plantios_usuario ON plantios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_colheitas_safra ON colheitas(safra_id);
CREATE INDEX IF NOT EXISTS idx_colheitas_usuario ON colheitas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entregas_safra ON entregas(safra_id);
CREATE INDEX IF NOT EXISTS idx_entregas_usuario ON entregas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clima_fazenda ON registros_clima(fazenda_id);
CREATE INDEX IF NOT EXISTS idx_clima_usuario ON registros_clima(usuario_id);
CREATE INDEX IF NOT EXISTS idx_equipe_usuario ON equipe(usuario_id);

-- ============================
-- TRIGGERS updated_at
-- ============================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_plantios_updated_at') THEN
    CREATE TRIGGER set_plantios_updated_at BEFORE UPDATE ON plantios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_colheitas_updated_at') THEN
    CREATE TRIGGER set_colheitas_updated_at BEFORE UPDATE ON colheitas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_entregas_updated_at') THEN
    CREATE TRIGGER set_entregas_updated_at BEFORE UPDATE ON entregas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_equipe_updated_at') THEN
    CREATE TRIGGER set_equipe_updated_at BEFORE UPDATE ON equipe FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END$$;

-- ============================
-- BUCKET DE FOTOS (Storage)
-- Executar separadamente se necessário:
-- ============================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('fotos', 'fotos', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Usuário faz upload de fotos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Fotos são públicas"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'fotos');
