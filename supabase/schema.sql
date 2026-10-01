-- ==============================================================================
-- DAIANE STEFANI - STUDIO & BEAUTY
-- SCHEMA SQL OFICIAL SUPABASE (POSTGRESQL)
-- ==============================================================================

-- Habilita extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA: perfil_profissional
-- Armazena os dados da profissional Daiane Stefani e os preços dinâmicos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfil_profissional (
    id TEXT PRIMARY KEY DEFAULT 'daiane',
    nome TEXT NOT NULL DEFAULT 'Daiane Stefani',
    login TEXT NOT NULL DEFAULT 'daiane',
    senha TEXT NOT NULL DEFAULT 'Daiane123',
    preco_maquiagem NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
    preco_sobrancelhas NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    preco_cilios NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    telefone_whatsapp TEXT NOT NULL DEFAULT '32984561005',
    bio TEXT DEFAULT 'Especialista em visagismo facial, maquiagens de noivas e eventos, design de sobrancelhas e extensão de cílios fio a fio com acabamento impecável.',
    avatar_url TEXT DEFAULT 'assets/daiane.jpg',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('America/Sao_Paulo', NOW())
);

-- ------------------------------------------------------------------------------
-- 2. TABELA: servicos
-- Catálogo de serviços com duração padrão de 30 min
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicos (
    id TEXT PRIMARY KEY, -- 'maquiagem', 'sobrancelhas', 'cilios'
    nome TEXT NOT NULL,
    duracao_min INTEGER NOT NULL DEFAULT 30,
    descricao TEXT,
    icone TEXT,
    ordem INTEGER DEFAULT 1
);

-- ------------------------------------------------------------------------------
-- 3. TABELA: agendamentos
-- Regra estrita de agendamento único por horário (estúdio exclusivo da Daiane)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT NOT NULL,
    servico TEXT NOT NULL REFERENCES servicos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    valor_cobrado NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluido', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('America/Sao_Paulo', NOW()),

    -- Constraint essencial: impede duplicidade de horário no mesmo dia
    CONSTRAINT agendamento_unico_horario UNIQUE (data, horario)
);

-- Índices para performance instantânea de filtros
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_horario ON agendamentos (data, horario);
CREATE INDEX IF NOT EXISTS idx_agendamentos_telefone ON agendamentos (cliente_telefone);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos (status);

-- ------------------------------------------------------------------------------
-- 4. TABELA: portfolio
-- Portfólio visual com suporte aos formatos 9:16, 4:3 e 1:1
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('maquiagem', 'sobrancelhas', 'cilios')),
    imagem_url TEXT NOT NULL,
    aspect_ratio TEXT NOT NULL CHECK (aspect_ratio IN ('9:16', '4:3', '1:1')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('America/Sao_Paulo', NOW())
);

-- ------------------------------------------------------------------------------
-- 5. POLÍTICAS DE ACESSO (Row Level Security - RLS)
-- Permite leitura e agendamento públicos, e gestão completa via anon key / app
-- ------------------------------------------------------------------------------
ALTER TABLE perfil_profissional ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Perfil: leitura pública, atualização permitida
DROP POLICY IF EXISTS "Perfil leitura pública" ON perfil_profissional;
CREATE POLICY "Perfil leitura pública" ON perfil_profissional FOR SELECT USING (true);

DROP POLICY IF EXISTS "Perfil atualização" ON perfil_profissional;
DROP POLICY IF EXISTS "Perfil modificação" ON perfil_profissional;
CREATE POLICY "Perfil modificação" ON perfil_profissional FOR ALL USING (true) WITH CHECK (true);

-- Serviços: leitura pública e atualização permitida
DROP POLICY IF EXISTS "Serviços leitura pública" ON servicos;
CREATE POLICY "Serviços leitura pública" ON servicos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Serviços modificação" ON servicos;
CREATE POLICY "Serviços modificação" ON servicos FOR ALL USING (true);

-- Agendamentos: leitura, inserção e atualização permitidas
DROP POLICY IF EXISTS "Agendamentos leitura" ON agendamentos;
CREATE POLICY "Agendamentos leitura" ON agendamentos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agendamentos inserção" ON agendamentos;
CREATE POLICY "Agendamentos inserção" ON agendamentos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Agendamentos atualização" ON agendamentos;
CREATE POLICY "Agendamentos atualização" ON agendamentos FOR UPDATE USING (true) WITH CHECK (true);

-- Portfólio: leitura e gestão pública
DROP POLICY IF EXISTS "Portfolio leitura pública" ON portfolio;
CREATE POLICY "Portfolio leitura pública" ON portfolio FOR SELECT USING (true);

DROP POLICY IF EXISTS "Portfolio modificação" ON portfolio;
CREATE POLICY "Portfolio modificação" ON portfolio FOR ALL USING (true);
