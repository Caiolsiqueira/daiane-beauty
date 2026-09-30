# Daiane Stefani - Studio & Beauty 💄✨

Aplicação web responsiva (Mobile-First / PWA-ready) de agendamento online e gestão para a profissional **Daiane Stefani**.

---

## 🎨 Identidade Visual e Paleta de Cores
- **Fundo Principal / Superfície clara:** `#feebd6` (creme suave e acolhedor)
- **Cor Primária / Cabeçalhos e destaques:** `#610002` (vinho nobre elegante)
- **Cor Secundária / Badges e acentos:** `#ff8f80` (coral suave)
- **Cor de Destaque CTA:** `#0059cc` (azul sofisticado de alto contraste)
- **Moldura Premium:** Foto oficial da Daiane Stefani (`assets/daiane.jpg`) em moldura circular com borda premium de alto relevo e iluminação suave.

---

## 🚀 Funcionalidades Principais

### 1. Fluxo do Cliente (Home / Agendamento)
- **Seleção Dinâmica de Serviços:**
  - Maquiagem Profissional (R$ 120,00 | 30 min)
  - Design de Sobrancelhas (R$ 25,00 | 30 min)
  - Extensão de Cílios (R$ 50,00 | 30 min)
- **Regras Estritas de Data:**
  - Terça a Sábado (09:00 às 17:30)
  - **Domingo e Segunda-feira bloqueados** (estúdio fechado)
  - Bloqueio de datas passadas
- **Seleção Dinâmica de Horários:**
  - Intervalos de 30 em 30 minutos (09:00, 09:30, 10:00, ..., 17:30)
  - Consulta em tempo real com bloqueio de horários ocupados
  - Fuso horário configurado estritamente como `America/Sao_Paulo`
- **Validação e Máscara Automática:**
  - Nome e Sobrenome obrigatórios
  - WhatsApp formatado automaticamente: `(XX) XXXXX-XXXX`
- **Confirmação Multicanal:**
  - Resumo completo da reserva
  - Botão para envio direto no WhatsApp com mensagem formatada
  - Botão para adicionar ao Google Agenda
  - Download de arquivo `.ics` (iPhone/iOS Calendar, Outlook e Mac)

### 2. Galeria e Portfólio de Trabalhos (9:16, 4:3 e 1:1)
- Grade responsiva / Masonry layout
- Suporte a 3 proporções de tela:
  - **9:16:** Formato vertical (Stories / Reels)
  - **4:3:** Formato retrato tradicional (Câmera)
  - **1:1:** Formato quadrado (Feed)
- Filtros por categoria: *Todos, Maquiagem, Sobrancelhas e Extensão de Cílios*
- Lightbox / Zoom interativo com informações do trabalho

### 3. Painel Administrativo Exclusivo (/admin)
- **Autenticação:**
  - Usuário: `daiane`
  - Senha: `Daiane123`
- **Gestão da Agenda:**
  - Visualização cronológica do dia
  - Ações rápidas: *Concluir atendimento*, *Cancelar*, *Chamar no WhatsApp*
  - **Agendamento Manual (Encaixe)** presencial ou por ligação
- **Ajuste Dinâmico de Valores:**
  - Altere os preços dos 3 serviços com 1 clique. As alterações são sincronizadas imediatamente na página inicial do cliente
- **Dashboard Financeiro e KPIs:**
  - Faturamento Total, Serviços Realizados, Ticket Médio e Receita Prevista
  - **Gráfico Interativo (Chart.js):**
    - Filtros por período: Dia, Semana, Mês e Ano
    - **Toggle de 1 clique:** Modo **Faturamento (R$)** vs Modo **Quantidade de Clientes**
- **Top 10 Clientes Frequentes:**
  - Agrupamento por telefone limpo (apenas dígitos)
  - Ranking de visitas, total investido e atalho direto para WhatsApp

---

## 🗄️ Arquitetura de Dados (Supabase + LocalStorage Fallback)
A aplicação possui suporte nativo à API REST do **Supabase (PostgreSQL)** e contempla um **fallback transparente em localStorage**:
- Se configurado, lê e salva no Supabase.
- Se não configurado ou offline, o sistema opera de forma independente no navegador sem travar nada!

### Estrutura de Arquivos
```
daiane_beauty/
├── index.html              # Interface unificada (Cliente + Admin)
├── manifest.json           # Manifesto PWA
├── sw.js                   # Service Worker offline
├── server.py               # Servidor local de desenvolvimento
├── css/
│   └── styles.css          # Design system e folhas de estilo
├── js/
│   ├── config.js           # Constantes e configurações
│   ├── supabaseClient.js   # Provedor de dados (Supabase + LocalStorage)
│   ├── booking.js          # Lógica do fluxo de agendamento
│   ├── admin.js            # Lógica do painel de controle
│   ├── portfolio.js        # Lógica da galeria e lightbox
│   └── charts.js           # Lógica dos gráficos Chart.js
├── assets/
│   ├── daiane.jpg          # Foto de perfil oficial da Daiane
│   ├── icon.svg            # Ícone do app / PWA
│   ├── logo.svg            # Logo da marca
│   └── portfolio/          # Imagens reais nos formatos 9:16, 4:3 e 1:1
└── supabase/
    ├── schema.sql          # Estrutura de tabelas e RLS
    └── seed.sql            # Dados iniciais de demonstração
```

---

## ⚡ Como Executar Localmente

### Opção 1: Com o Python
No terminal, execute:
```bash
python server.py --open
```
Acesse no computador: `http://localhost:8000`  
Ou acesse direto o painel admin: `http://localhost:8000#admin`

### Opção 2: Testando no Celular
Basta estar na mesma rede Wi-Fi e abrir o endereço exibido pelo script (ex: `http://192.168.X.X:8000`).
