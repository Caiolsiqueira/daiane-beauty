/**
 * Daiane Stefani - Studio & Beauty
 * Configuração Global do Sistema
 */

const DAIANE_CONFIG = {
  // Configuração Supabase (permite preenchimento via painel ou variáveis)
  SUPABASE_URL: (localStorage.getItem('DAIANE_SUPABASE_URL') || '').trim(),
  SUPABASE_ANON_KEY: (localStorage.getItem('DAIANE_SUPABASE_ANON_KEY') || '').trim(),

  // Identidade do Studio
  STUDIO: {
    name: 'Daiane Stefani - Studio & Beauty',
    shortName: 'Daiane Stefani',
    professionalName: 'Daiane Stefani',
    avatar: './assets/daiane.jpg',
    defaultLogin: 'daiane',
    defaultSenha: 'Daiane123',
    whatsapp: '32984561005',
    whatsappFormatted: '(32) 98456-1005',
    instagram: '@daianestefanibeauty',
    address: 'Studio Daiane Stefani - Atendimento com hora marcada',
    timezone: 'America/Sao_Paulo'
  },

  // Horários de Atendimento: Terça a Sábado das 09:00 às 17:30
  SCHEDULE: {
    // 0 = Domingo (Fechado), 1 = Segunda (Fechado), 2 = Terça a 6 = Sábado (Aberto)
    OPEN_DAYS: [2, 3, 4, 5, 6],
    DAY_NAMES: {
      0: 'Domingo',
      1: 'Segunda-feira',
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado'
    },
    START_TIME: '09:00',
    END_TIME: '17:30',
    SLOT_DURATION_MINUTES: 30,
    ALL_SLOTS: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ]
  },

  // Catálogo de Serviços Padrão (Preços dinâmicos vêm do banco ou localStorage)
  SERVICES: [
    {
      id: 'maquiagem',
      nome: 'Maquiagem Profissional',
      precoPadrao: 120.00,
      duracaoMin: 30,
      duracaoTexto: '30 min',
      icone: 'sparkles',
      descricao: 'Maquiagem sofisticada com pele blindada, contorno harmônico e acabamento de alta durabilidade para eventos, noivas e festas.',
      destaque: 'Mais Procurado'
    },
    {
      id: 'sobrancelhas',
      nome: 'Design de Sobrancelhas',
      precoPadrao: 25.00,
      duracaoMin: 30,
      duracaoTexto: '30 min',
      icone: 'eye',
      descricao: 'Visagismo e mapeamento facial personalizado, alinhamento milimétrico e desenho que realça a harmonia natural do olhar.',
      destaque: 'Harmonia Facial'
    },
    {
      id: 'cilios',
      nome: 'Extensão de Cílios',
      precoPadrao: 50.00,
      duracaoMin: 30,
      duracaoTexto: '30 min',
      icone: 'sparkles-double',
      descricao: 'Alongamento fio a fio super leve, curvatura perfeita, praticidade no dia a dia e olhar marcante sem necessidade de rímel.',
      destaque: 'Olhar Marcante'
    }
  ],

  // Portfólio Inicial de Demonstração (Formatos 9:16, 4:3 e 1:1)
  DEFAULT_PORTFOLIO: [
    {
      id: 'port-1',
      titulo: 'Glow Glam para Formatura',
      categoria: 'maquiagem',
      imagem_url: './assets/portfolio/make_story_9_16.jpg',
      aspect_ratio: '9:16',
      descricao: 'Pele iluminada e esfumado clássico com acabamento duradouro.'
    },
    {
      id: 'port-2',
      titulo: 'Noiva Clássica & Pele Blindada',
      categoria: 'maquiagem',
      imagem_url: './assets/portfolio/make_portrait_4_3.jpg',
      aspect_ratio: '4:3',
      descricao: 'Produção bridal com tons neutros elegantes e alta fixação.'
    },
    {
      id: 'port-3',
      titulo: 'Make Social com Delineado Marcante',
      categoria: 'maquiagem',
      imagem_url: './assets/portfolio/make_square_1_1.jpg',
      aspect_ratio: '1:1',
      descricao: 'Contorno suave e delineado gráfico para eventos especiais.'
    },
    {
      id: 'port-4',
      titulo: 'Design com Mapeamento Geométrico',
      categoria: 'sobrancelhas',
      imagem_url: './assets/portfolio/sobrancelha_story_9_16.jpg',
      aspect_ratio: '9:16',
      descricao: 'Simetria e alinhamento milimétrico baseado na estrutura óssea.'
    },
    {
      id: 'port-5',
      titulo: 'Alinhamento Natural Fio a Fio',
      categoria: 'sobrancelhas',
      imagem_url: './assets/portfolio/sobrancelha_portrait_4_3.jpg',
      aspect_ratio: '4:3',
      descricao: 'Design limpo respeitando o crescimento e volume dos fios.'
    },
    {
      id: 'port-6',
      titulo: 'Sobrancelhas com Henna Suave',
      categoria: 'sobrancelhas',
      imagem_url: './assets/portfolio/sobrancelha_square_1_1.jpg',
      aspect_ratio: '1:1',
      descricao: 'Preenchimento de falhas com tonalidade natural e acabamento ombré.'
    },
    {
      id: 'port-7',
      titulo: 'Extensão Efeito Rímel Elegante',
      categoria: 'cilios',
      imagem_url: './assets/portfolio/cilios_story_9_16.jpg',
      aspect_ratio: '9:16',
      descricao: 'Fios ultrafinos com curvatura D para máxima definição.'
    },
    {
      id: 'port-8',
      titulo: 'Volume Brasileiro Super Natural',
      categoria: 'cilios',
      imagem_url: './assets/portfolio/cilios_portrait_4_3.jpg',
      aspect_ratio: '4:3',
      descricao: 'Preenchimento leve em formato Y com retenção excelente.'
    },
    {
      id: 'port-9',
      titulo: 'Cílios Híbridos com Curvatura D',
      categoria: 'cilios',
      imagem_url: './assets/portfolio/cilios_square_1_1.jpg',
      aspect_ratio: '1:1',
      descricao: 'Combinação perfeita entre fios clássicos e leques delicados.'
    }
  ],

  // Paleta de Cores Oficial
  COLORS: {
    bgLight: '#feebd6',        // Fundo principal / superfície clara
    primaryWine: '#610002',    // Cor primária / cabeçalhos / destaques profundos
    secondaryCoral: '#ff8f80', // Cor secundária / acentos quentes / badges
    accentBlue: '#0059cc',     // Cor de destaque CTA / botões de ação
    cardBg: '#ffffff',
    textDark: '#361516',
    borderMuted: 'rgba(97, 0, 2, 0.12)'
  }
};

window.DAIANE_CONFIG = DAIANE_CONFIG;
