-- ==============================================================================
-- DAIANE STEFANI - STUDIO & BEAUTY
-- SEED SQL INICIAL PARA POPULAR BANCO DE DADOS
-- ==============================================================================

-- 1. Perfil Profissional
INSERT INTO perfil_profissional (id, nome, login, senha, preco_maquiagem, preco_sobrancelhas, preco_cilios, telefone_whatsapp, bio, avatar_url)
VALUES (
    'daiane',
    'Daiane Stefani',
    'daiane',
    'Daiane123',
    120.00,
    25.00,
    50.00,
    '32984561005',
    'Especialista em realçar a beleza feminina através de maquiagens sofisticadas, design e alinhamento de sobrancelhas e extensão de cílios fio a fio com técnicas exclusivas e atendimento personalizado.',
    'assets/daiane.jpg'
) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    login = EXCLUDED.login,
    senha = EXCLUDED.senha,
    preco_maquiagem = EXCLUDED.preco_maquiagem,
    preco_sobrancelhas = EXCLUDED.preco_sobrancelhas,
    preco_cilios = EXCLUDED.preco_cilios,
    telefone_whatsapp = EXCLUDED.telefone_whatsapp,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

-- 2. Catálogo de Serviços
INSERT INTO servicos (id, nome, duracao_min, descricao, icone, ordem)
VALUES
    ('maquiagem', 'Maquiagem Profissional', 30, 'Produção elegante para noivas, formandas, festas ou eventos sociais com produtos de alta fixação e acabamento acetinado.', 'sparkles', 1),
    ('sobrancelhas', 'Design de Sobrancelhas', 30, 'Visagismo e mapeamento facial sob medida, limpeza precisa e finalização que valoriza o seu olhar natural.', 'eye', 2),
    ('cilios', 'Extensão de Cílios', 30, 'Alongamento fio a fio leve e confortável, proporcionando curvatura, volume elegante e praticidade diária sem pesar.', 'sparkles-double', 3)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    duracao_min = EXCLUDED.duracao_min,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ordem = EXCLUDED.ordem;

-- 3. Portfólio de Trabalhos (Formatos 9:16, 4:3 e 1:1)
INSERT INTO portfolio (titulo, categoria, imagem_url, aspect_ratio)
VALUES
    ('Glow Glam para Formatura', 'maquiagem', 'assets/portfolio/make_story_9_16.jpg', '9:16'),
    ('Noiva Clássica & Pele Blindada', 'maquiagem', 'assets/portfolio/make_portrait_4_3.jpg', '4:3'),
    ('Make Social com Delineado Marcante', 'maquiagem', 'assets/portfolio/make_square_1_1.jpg', '1:1'),
    ('Design com Mapeamento Geométrico', 'sobrancelhas', 'assets/portfolio/sobrancelha_story_9_16.jpg', '9:16'),
    ('Alinhamento Natural Fio a Fio', 'sobrancelhas', 'assets/portfolio/sobrancelha_portrait_4_3.jpg', '4:3'),
    ('Sobrancelhas Perfeitas com Henna Suave', 'sobrancelhas', 'assets/portfolio/sobrancelha_square_1_1.jpg', '1:1'),
    ('Extensão Efeito Rímel Elegante', 'cilios', 'assets/portfolio/cilios_story_9_16.jpg', '9:16'),
    ('Volume Brasileiro Super Natural', 'cilios', 'assets/portfolio/cilios_portrait_4_3.jpg', '4:3'),
    ('Cílios Híbridos com Curvatura D', 'cilios', 'assets/portfolio/cilios_square_1_1.jpg', '1:1');

-- 4. Agendamentos Demonstrativos
INSERT INTO agendamentos (cliente_nome, cliente_telefone, servico, data, horario, valor_cobrado, status)
VALUES
    ('Camila Rodrigues', '(11) 98111-2233', 'maquiagem', CURRENT_DATE - INTERVAL '1 day', '09:30:00', 120.00, 'concluido'),
    ('Beatriz Lima', '(11) 98222-3344', 'cilios', CURRENT_DATE - INTERVAL '1 day', '10:30:00', 50.00, 'concluido'),
    ('Juliana Martins', '(11) 98333-4455', 'sobrancelhas', CURRENT_DATE - INTERVAL '1 day', '11:30:00', 25.00, 'concluido'),
    ('Camila Rodrigues', '(11) 98111-2233', 'cilios', CURRENT_DATE - INTERVAL '3 day', '14:00:00', 50.00, 'concluido'),
    ('Fernanda Souza', '(11) 98444-5566', 'maquiagem', CURRENT_DATE - INTERVAL '4 day', '15:00:00', 120.00, 'concluido'),
    ('Mariana Alves', '(11) 98555-6677', 'sobrancelhas', CURRENT_DATE - INTERVAL '5 day', '16:00:00', 25.00, 'concluido'),
    ('Camila Rodrigues', '(11) 98111-2233', 'sobrancelhas', CURRENT_DATE - INTERVAL '10 day', '10:00:00', 25.00, 'concluido'),
    ('Larissa Castro', '(11) 98666-7788', 'maquiagem', CURRENT_DATE - INTERVAL '12 day', '14:30:00', 120.00, 'concluido'),
    ('Beatriz Lima', '(11) 98222-3344', 'sobrancelhas', CURRENT_DATE - INTERVAL '15 day', '09:00:00', 25.00, 'concluido'),
    ('Aline Ferreira', '(11) 98777-8899', 'cilios', CURRENT_DATE - INTERVAL '18 day', '11:00:00', 50.00, 'concluido'),
    ('Camila Rodrigues', '(11) 98111-2233', 'maquiagem', CURRENT_DATE - INTERVAL '24 day', '15:30:00', 120.00, 'concluido'),
    ('Patricia Rocha', '(11) 98888-9900', 'maquiagem', CURRENT_DATE, '10:00:00', 120.00, 'agendado'),
    ('Gabriela Mendes', '(11) 98999-0011', 'sobrancelhas', CURRENT_DATE, '11:00:00', 25.00, 'agendado'),
    ('Beatriz Lima', '(11) 98222-3344', 'cilios', CURRENT_DATE, '14:30:00', 50.00, 'agendado');
