/**
 * Daiane Stefani - Studio & Beauty
 * Camada de Dados Unificada: Supabase REST API + LocalStorage Fallback Instantâneo
 */

class DaianeDataProvider {
  constructor() {
    this.config = window.DAIANE_CONFIG || window.CONFIG;

    // Assegura e força o banco oficial da Daiane
    const officialUrl = 'https://bxgoiafsaddrqnisqvso.supabase.co';
    const officialKey = 'sb_publishable_-bszqnx2p95TgYlYvo742A_Ub0PX_ar';

    const storedUrl = (localStorage.getItem('DAIANE_SUPABASE_URL') || '').trim();
    if (!storedUrl || storedUrl !== officialUrl) {
      localStorage.setItem('DAIANE_SUPABASE_URL', officialUrl);
      localStorage.setItem('DAIANE_SUPABASE_ANON_KEY', officialKey);
      this.supabaseUrl = officialUrl;
      this.supabaseKey = officialKey;
    } else {
      this.supabaseUrl = storedUrl;
      this.supabaseKey = (localStorage.getItem('DAIANE_SUPABASE_ANON_KEY') || officialKey).trim();
    }

    this.storageKey = 'DAIANE_BEAUTY_DB_V1';
    this._supabaseClient = null;

    // Log de inicialização do Supabase Oficial
    if (this.isSupabaseConfigured() && this.supabaseUrl.includes('bxgoiafsaddrqnisqvso')) {
      console.log('%c[Supabase] Conectado ao banco oficial da Daiane Stefani (bxgoiafsaddrqnisqvso)', 'color: #2b8a3e; font-weight: bold; font-size: 13px;');
    } else {
      console.log('[Supabase] Inicializado em modo de contingência local.');
    }

    this.initLocalStorage();
  }

  getSupabaseClient() {
    if (!this._supabaseClient && window.supabase && this.isSupabaseConfigured()) {
      try {
        this._supabaseClient = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
      } catch (e) {
        console.warn('Erro ao inicializar Supabase SDK client:', e);
      }
    }
    return this._supabaseClient;
  }

  isSupabaseConfigured() {
    return Boolean(
      this.supabaseUrl &&
      this.supabaseKey &&
      this.supabaseUrl.startsWith('http') &&
      !this.supabaseUrl.includes('placeholder')
    );
  }

  setCredentials(url, key) {
    this.supabaseUrl = (url || '').trim();
    this.supabaseKey = (key || '').trim();
    this._supabaseClient = null;
    localStorage.setItem('DAIANE_SUPABASE_URL', this.supabaseUrl);
    localStorage.setItem('DAIANE_SUPABASE_ANON_KEY', this.supabaseKey);
  }

  clearCredentials() {
    this.supabaseUrl = '';
    this.supabaseKey = '';
    this._supabaseClient = null;
    localStorage.removeItem('DAIANE_SUPABASE_URL');
    localStorage.removeItem('DAIANE_SUPABASE_ANON_KEY');
  }

  async resetToOfficialDefaults() {
    const officialUrl = 'https://bxgoiafsaddrqnisqvso.supabase.co';
    const officialKey = 'sb_publishable_-bszqnx2p95TgYlYvo742A_Ub0PX_ar';

    localStorage.setItem('DAIANE_SUPABASE_URL', officialUrl);
    localStorage.setItem('DAIANE_SUPABASE_ANON_KEY', officialKey);
    localStorage.removeItem('DAIANE_BEAUTY_DB_V1');
    localStorage.removeItem('JR_BARBEARIA_DB_V1');
    localStorage.removeItem('JR_SUPABASE_URL');
    localStorage.removeItem('JR_SUPABASE_ANON_KEY');
    sessionStorage.clear();

    if ('caches' in window) {
      try {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
      } catch (err) {
        console.warn('Erro ao limpar cache:', err);
      }
    }

    window.location.reload();
  }

  // ============================================================================
  // BANCO LOCAL (LOCALSTORAGE ENGINE & SEED)
  // ============================================================================
  initLocalStorage() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      this.resetToSeedData();
    } else {
      try {
        const db = JSON.parse(raw);
        if (db && db.perfil) {
          db.perfil.telefone_whatsapp = this.config.STUDIO.whatsapp;
          this.saveLocalDb(db);
        }
      } catch (e) {
        console.warn('Erro ao atualizar perfil local:', e);
      }
    }
  }

  resetToSeedData() {
    const now = new Date();
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const addDays = (d, n) => {
      const res = new Date(d);
      res.setDate(res.getDate() + n);
      return res;
    };

    // Amostras de agendamentos para relatórios e top clientes ricos
    const sampleAppointments = [
      {
        id: 'apt-seed-1',
        cliente_nome: 'Camila Rodrigues',
        cliente_telefone: '(11) 98111-2233',
        servico: 'maquiagem',
        data: formatDate(addDays(now, -1)),
        horario: '09:30',
        valor_cobrado: 120.00,
        status: 'concluido',
        created_at: addDays(now, -1).toISOString()
      },
      {
        id: 'apt-seed-2',
        cliente_nome: 'Beatriz Lima',
        cliente_telefone: '(11) 98222-3344',
        servico: 'cilios',
        data: formatDate(addDays(now, -1)),
        horario: '10:30',
        valor_cobrado: 50.00,
        status: 'concluido',
        created_at: addDays(now, -1).toISOString()
      },
      {
        id: 'apt-seed-3',
        cliente_nome: 'Juliana Martins',
        cliente_telefone: '(11) 98333-4455',
        servico: 'sobrancelhas',
        data: formatDate(addDays(now, -2)),
        horario: '11:00',
        valor_cobrado: 25.00,
        status: 'concluido',
        created_at: addDays(now, -2).toISOString()
      },
      {
        id: 'apt-seed-4',
        cliente_nome: 'Camila Rodrigues',
        cliente_telefone: '(11) 98111-2233',
        servico: 'cilios',
        data: formatDate(addDays(now, -4)),
        horario: '14:00',
        valor_cobrado: 50.00,
        status: 'concluido',
        created_at: addDays(now, -4).toISOString()
      },
      {
        id: 'apt-seed-5',
        cliente_nome: 'Fernanda Souza',
        cliente_telefone: '(11) 98444-5566',
        servico: 'maquiagem',
        data: formatDate(addDays(now, -6)),
        horario: '15:30',
        valor_cobrado: 120.00,
        status: 'concluido',
        created_at: addDays(now, -6).toISOString()
      },
      {
        id: 'apt-seed-6',
        cliente_nome: 'Mariana Alves',
        cliente_telefone: '(11) 98555-6677',
        servico: 'sobrancelhas',
        data: formatDate(addDays(now, -8)),
        horario: '16:00',
        valor_cobrado: 25.00,
        status: 'concluido',
        created_at: addDays(now, -8).toISOString()
      },
      {
        id: 'apt-seed-7',
        cliente_nome: 'Camila Rodrigues',
        cliente_telefone: '(11) 98111-2233',
        servico: 'sobrancelhas',
        data: formatDate(addDays(now, -12)),
        horario: '10:00',
        valor_cobrado: 25.00,
        status: 'concluido',
        created_at: addDays(now, -12).toISOString()
      },
      {
        id: 'apt-seed-8',
        cliente_nome: 'Larissa Castro',
        cliente_telefone: '(11) 98666-7788',
        servico: 'maquiagem',
        data: formatDate(addDays(now, -15)),
        horario: '14:30',
        valor_cobrado: 120.00,
        status: 'concluido',
        created_at: addDays(now, -15).toISOString()
      },
      {
        id: 'apt-seed-9',
        cliente_nome: 'Beatriz Lima',
        cliente_telefone: '(11) 98222-3344',
        servico: 'sobrancelhas',
        data: formatDate(addDays(now, -18)),
        horario: '09:00',
        valor_cobrado: 25.00,
        status: 'concluido',
        created_at: addDays(now, -18).toISOString()
      },
      {
        id: 'apt-seed-10',
        cliente_nome: 'Aline Ferreira',
        cliente_telefone: '(11) 98777-8899',
        servico: 'cilios',
        data: formatDate(addDays(now, -21)),
        horario: '11:00',
        valor_cobrado: 50.00,
        status: 'concluido',
        created_at: addDays(now, -21).toISOString()
      },
      {
        id: 'apt-seed-11',
        cliente_nome: 'Camila Rodrigues',
        cliente_telefone: '(11) 98111-2233',
        servico: 'maquiagem',
        data: formatDate(addDays(now, -28)),
        horario: '15:00',
        valor_cobrado: 120.00,
        status: 'concluido',
        created_at: addDays(now, -28).toISOString()
      },
      {
        id: 'apt-seed-12',
        cliente_nome: 'Patricia Rocha',
        cliente_telefone: '(11) 98888-9900',
        servico: 'maquiagem',
        data: formatDate(now),
        horario: '10:00',
        valor_cobrado: 120.00,
        status: 'agendado',
        created_at: now.toISOString()
      },
      {
        id: 'apt-seed-13',
        cliente_nome: 'Gabriela Mendes',
        cliente_telefone: '(11) 98999-0011',
        servico: 'sobrancelhas',
        data: formatDate(now),
        horario: '11:30',
        valor_cobrado: 25.00,
        status: 'agendado',
        created_at: now.toISOString()
      },
      {
        id: 'apt-seed-14',
        cliente_nome: 'Beatriz Lima',
        cliente_telefone: '(11) 98222-3344',
        servico: 'cilios',
        data: formatDate(now),
        horario: '14:30',
        valor_cobrado: 50.00,
        status: 'agendado',
        created_at: now.toISOString()
      }
    ];

    const initialDb = {
      perfil: {
        id: 'daiane',
        nome: this.config.STUDIO.professionalName,
        login: this.config.STUDIO.defaultLogin,
        senha: this.config.STUDIO.defaultSenha,
        preco_maquiagem: 120.00,
        preco_sobrancelhas: 25.00,
        preco_cilios: 50.00,
        telefone_whatsapp: this.config.STUDIO.whatsapp,
        bio: 'Especialista em visagismo facial, maquiagens de noivas e eventos, design de sobrancelhas e extensão de cílios fio a fio com acabamento impecável.',
        avatar_url: this.config.STUDIO.avatar
      },
      servicos: JSON.parse(JSON.stringify(this.config.SERVICES)),
      portfolio: JSON.parse(JSON.stringify(this.config.DEFAULT_PORTFOLIO)),
      agendamentos: sampleAppointments
    };

    localStorage.setItem(this.storageKey, JSON.stringify(initialDb));
    return initialDb;
  }

  getLocalDb() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return this.resetToSeedData();
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao carregar banco local. Resetando.', e);
      return this.resetToSeedData();
    }
  }

  saveLocalDb(db) {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  // ============================================================================
  // 1. PERFIL PROFISSIONAL & PREÇOS DINÂMICOS
  // ============================================================================
  async getProfessionalProfile() {
    if (this.isSupabaseConfigured()) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/perfil_profissional?id=eq.daiane&select=*`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) return list[0];
        }
      } catch (err) {
        console.warn('Supabase offline. Carregando perfil do banco local.', err);
      }
    }

    const db = this.getLocalDb();
    return db.perfil;
  }

  async updateProfessionalPrices(precoMaquiagem, precoSobrancelhas, precoCilios) {
    const make = parseFloat(precoMaquiagem);
    const brow = parseFloat(precoSobrancelhas);
    const lash = parseFloat(precoCilios);

    if (isNaN(make) || isNaN(brow) || isNaN(lash) || make < 0 || brow < 0 || lash < 0) {
      throw new Error('Por favor, informe valores monetários válidos para todos os serviços.');
    }

    // Salva localmente
    const db = this.getLocalDb();
    db.perfil.preco_maquiagem = make;
    db.perfil.preco_sobrancelhas = brow;
    db.perfil.preco_cilios = lash;

    // Atualiza também os serviços locais
    if (db.servicos) {
      const sMake = db.servicos.find(s => s.id === 'maquiagem');
      if (sMake) sMake.precoPadrao = make;
      const sBrow = db.servicos.find(s => s.id === 'sobrancelhas');
      if (sBrow) sBrow.precoPadrao = brow;
      const sLash = db.servicos.find(s => s.id === 'cilios');
      if (sLash) sLash.precoPadrao = lash;
    }

    this.saveLocalDb(db);

    // Salva no Supabase se configurado
    if (this.isSupabaseConfigured()) {
      try {
        await fetch(`${this.supabaseUrl}/rest/v1/perfil_profissional?id=eq.daiane`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preco_maquiagem: make,
            preco_sobrancelhas: brow,
            preco_cilios: lash
          })
        });
      } catch (err) {
        console.warn('Falha ao salvar preços no Supabase (salvo localmente):', err);
      }
    }

    // Dispara evento para interface reagir instantaneamente
    window.dispatchEvent(new CustomEvent('daiane:prices-updated', {
      detail: { preco_maquiagem: make, preco_sobrancelhas: brow, preco_cilios: lash }
    }));

    return { success: true, preco_maquiagem: make, preco_sobrancelhas: brow, preco_cilios: lash };
  }

  // ============================================================================
  // 2. CATÁLOGO DE SERVIÇOS
  // ============================================================================
  async getServices() {
    const profile = await this.getProfessionalProfile();
    const db = this.getLocalDb();
    const services = db.servicos || JSON.parse(JSON.stringify(this.config.SERVICES));

    return services.map(s => {
      let currentPrice = s.precoPadrao;
      if (s.id === 'maquiagem' && profile.preco_maquiagem) currentPrice = Number(profile.preco_maquiagem);
      if (s.id === 'sobrancelhas' && profile.preco_sobrancelhas) currentPrice = Number(profile.preco_sobrancelhas);
      if (s.id === 'cilios' && profile.preco_cilios) currentPrice = Number(profile.preco_cilios);

      return {
        ...s,
        precoAtual: currentPrice
      };
    });
  }

  // ============================================================================
  // 3. AGENDAMENTOS & VERIFICAÇÃO DE HORÁRIOS ÚNICOS
  // ============================================================================
  async getAppointments(filter = {}) {
    let appointments = [];

    if (this.isSupabaseConfigured()) {
      try {
        let params = ['select=*', 'order=data.desc,horario.asc'];
        if (filter.data) params.push(`data=eq.${filter.data}`);
        if (filter.status) params.push(`status=eq.${filter.status}`);
        if (filter.servico) params.push(`servico=eq.${filter.servico}`);

        const res = await fetch(`${this.supabaseUrl}/rest/v1/agendamentos?${params.join('&')}`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        if (res.ok) {
          appointments = await res.json();
          return appointments.map(a => ({
            ...a,
            horario: a.horario ? a.horario.slice(0, 5) : a.horario
          }));
        }
      } catch (err) {
        console.warn('Falha no Supabase ao buscar agendamentos. Usando local.', err);
      }
    }

    const db = this.getLocalDb();
    appointments = db.agendamentos || [];

    if (filter.data) {
      appointments = appointments.filter(a => a.data === filter.data);
    }
    if (filter.status && filter.status !== 'todos') {
      appointments = appointments.filter(a => a.status === filter.status);
    }
    if (filter.servico && filter.servico !== 'todos') {
      appointments = appointments.filter(a => a.servico === filter.servico);
    }

    return appointments.sort((a, b) => {
      if (a.data !== b.data) return b.data.localeCompare(a.data);
      return a.horario.localeCompare(b.horario);
    });
  }

  async getBookedSlots(dataStr) {
    const list = await this.getAppointments({ data: dataStr });
    // Horários ocupados válidos são os agendados ou concluídos (cancelados liberam o horário)
    return list
      .filter(a => a.status !== 'cancelado')
      .map(a => a.horario.slice(0, 5));
  }

  async createAppointment(data) {
    const { cliente_nome, cliente_telefone, servico, data: dataStr, horario, valor_cobrado, observacoes } = data;

    if (!cliente_nome || !cliente_telefone || !servico || !dataStr || !horario) {
      throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
    }

    const normalizedHorario = horario.slice(0, 5);

    // Validação estrita da regra de profissional única: verificar se já está agendado
    const booked = await this.getBookedSlots(dataStr);
    if (booked.includes(normalizedHorario)) {
      throw new Error(`O horário ${normalizedHorario} já está reservado para ${dataStr}. Por favor, escolha outro horário.`);
    }

    const newAppointment = {
      id: 'apt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      cliente_nome: cliente_nome.trim(),
      cliente_telefone: cliente_telefone.trim(),
      servico,
      data: dataStr,
      horario: normalizedHorario,
      valor_cobrado: parseFloat(valor_cobrado || 0),
      status: 'agendado',
      observacoes: observacoes || '',
      created_at: new Date().toISOString()
    };

    // Supabase
    if (this.isSupabaseConfigured()) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/agendamentos`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            cliente_nome: newAppointment.cliente_nome,
            cliente_telefone: newAppointment.cliente_telefone,
            servico: newAppointment.servico,
            data: newAppointment.data,
            horario: newAppointment.horario + ':00',
            valor_cobrado: newAppointment.valor_cobrado,
            status: newAppointment.status,
            observacoes: newAppointment.observacoes
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (errData.message && errData.message.includes('unique')) {
            throw new Error(`O horário ${normalizedHorario} acabou de ser reservado. Por favor, selecione outro.`);
          }
        }
      } catch (err) {
        console.warn('Erro ao inserir no Supabase (salvo localmente):', err);
      }
    }

    // LocalStorage
    const db = this.getLocalDb();
    db.agendamentos.push(newAppointment);
    this.saveLocalDb(db);

    return newAppointment;
  }

  async updateAppointmentStatus(id, newStatus) {
    if (!['agendado', 'concluido', 'cancelado'].includes(newStatus)) {
      throw new Error('Status inválido.');
    }

    const db = this.getLocalDb();
    const idx = db.agendamentos.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.agendamentos[idx].status = newStatus;
      this.saveLocalDb(db);
    }

    if (this.isSupabaseConfigured()) {
      try {
        await fetch(`${this.supabaseUrl}/rest/v1/agendamentos?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.warn('Erro ao atualizar status no Supabase:', err);
      }
    }

    return { success: true, id, status: newStatus };
  }

  // ============================================================================
  // 4. PORTFÓLIO
  // ============================================================================
  async getPortfolio(categoria = 'todos') {
    if (this.isSupabaseConfigured()) {
      try {
        let url = `${this.supabaseUrl}/rest/v1/portfolio?select=*&order=created_at.desc`;
        if (categoria && categoria !== 'todos') {
          url += `&categoria=eq.${categoria}`;
        }
        const res = await fetch(url, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        if (res.ok) {
          const items = await res.json();
          if (items && items.length > 0) return items;
        }
      } catch (err) {
        console.warn('Falha no Supabase ao buscar portfólio. Usando local.', err);
      }
    }

    const db = this.getLocalDb();
    let list = db.portfolio || [];
    if (categoria && categoria !== 'todos') {
      list = list.filter(item => item.categoria === categoria);
    }
    return list;
  }

  /**
   * Upload de imagem para o bucket 'portfolio' do Supabase Storage
   * com fallback transparente para Base64 local caso haja erro ou offline
   */
  async uploadPortfolioImage(file) {
    if (!file) {
      throw new Error('Nenhum arquivo de imagem foi selecionado.');
    }

    // Sanitiza e gera nome único para o arquivo
    const originalName = file.name || 'foto.jpg';
    const lastDotIndex = originalName.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? originalName.substring(lastDotIndex).toLowerCase() : '.jpg';
    const rawBaseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
    const cleanBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueFileName = `${Date.now()}_${cleanBaseName}${ext}`;

    // 1. Tenta envio pelo Supabase Storage SDK
    const client = this.getSupabaseClient();
    if (client && this.isSupabaseConfigured()) {
      try {
        console.log(`[Supabase Storage] Enviando arquivo ${uniqueFileName} (${file.size} bytes)...`);
        const { data, error } = await client.storage
          .from('portfolio')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (!error && data) {
          const { data: publicUrlData } = client.storage
            .from('portfolio')
            .getPublicUrl(uniqueFileName);

          if (publicUrlData && publicUrlData.publicUrl) {
            console.log('%c[Supabase Storage] Upload concluído com sucesso!', 'color: #2b8a3e; font-weight: bold;', publicUrlData.publicUrl);
            return {
              url: publicUrlData.publicUrl,
              fileName: uniqueFileName,
              storage: 'supabase',
              success: true
            };
          }
        } else {
          console.warn('[Supabase Storage] Erro no upload:', error ? (error.message || error) : 'Sem dados retornados');
        }
      } catch (err) {
        console.warn('[Supabase Storage] Exceção durante upload (ativando fallback local):', err);
      }
    }

    // 2. Fallback Local: Converte arquivo em Base64 DataURL
    console.log('[Supabase Storage] Ativando fallback local para Base64...');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result,
          fileName: uniqueFileName,
          storage: 'local_base64',
          success: true
        });
      };
      reader.onerror = (e) => {
        reject(new Error('Erro ao ler imagem localmente: ' + (e.message || e)));
      };
      reader.readAsDataURL(file);
    });
  }

  async deletePortfolioImageFromStorage(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') return;

    const bucketMarker = '/storage/v1/object/public/portfolio/';
    if (imageUrl.includes(bucketMarker)) {
      const fileName = imageUrl.substring(imageUrl.indexOf(bucketMarker) + bucketMarker.length).split('?')[0];
      const client = this.getSupabaseClient();
      if (client && fileName) {
        try {
          await client.storage.from('portfolio').remove([fileName]);
          console.log('[Supabase Storage] Arquivo removido do bucket:', fileName);
        } catch (err) {
          console.warn('[Supabase Storage] Falha ao remover arquivo do bucket:', err);
        }
      }
    }
  }

  async addPortfolioItem(item) {
    const newItem = {
      id: 'port-' + Date.now(),
      titulo: item.titulo.trim(),
      categoria: item.categoria,
      imagem_url: item.imagem_url.trim(),
      aspect_ratio: item.aspect_ratio || '1:1',
      created_at: new Date().toISOString()
    };

    const db = this.getLocalDb();
    db.portfolio = db.portfolio || [];
    db.portfolio.unshift(newItem);
    this.saveLocalDb(db);

    if (this.isSupabaseConfigured()) {
      try {
        await fetch(`${this.supabaseUrl}/rest/v1/portfolio`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(newItem)
        });
      } catch (err) {
        console.warn('Erro ao inserir item no Supabase (salvo local):', err);
      }
    }

    return newItem;
  }

  async deletePortfolioItem(id) {
    const db = this.getLocalDb();
    const existing = (db.portfolio || []).find(p => p.id === id);
    if (existing && existing.imagem_url) {
      await this.deletePortfolioImageFromStorage(existing.imagem_url);
    }

    db.portfolio = (db.portfolio || []).filter(p => p.id !== id);
    this.saveLocalDb(db);

    if (this.isSupabaseConfigured()) {
      try {
        await fetch(`${this.supabaseUrl}/rest/v1/portfolio?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
      } catch (err) {
        console.warn('Erro ao deletar no Supabase:', err);
      }
    }

    return { success: true, id };
  }

  // ============================================================================
  // 5. DASHBOARD & MÉTRICAS FINANCEIRAS
  // ============================================================================
  async getDashboardData(period = 'mes') {
    const appointments = await this.getAppointments({});
    const now = new Date();

    const parseDate = (dStr) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    // Filtra pelo período selecionado
    const filtered = appointments.filter(a => {
      const aptDate = parseDate(a.data);
      const diffTime = now.getTime() - aptDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (period === 'dia' || period === 'hoje') {
        return aptDate.toDateString() === now.toDateString();
      } else if (period === 'semana') {
        return Math.abs(diffDays) <= 7;
      } else if (period === 'mes') {
        return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
      } else if (period === 'ano') {
        return aptDate.getFullYear() === now.getFullYear();
      }
      return true; // 'todos'
    });

    const concluidos = filtered.filter(a => a.status === 'concluido');
    const agendados = filtered.filter(a => a.status === 'agendado');
    const cancelados = filtered.filter(a => a.status === 'cancelado');

    const totalFaturamento = concluidos.reduce((acc, cur) => acc + Number(cur.valor_cobrado || 0), 0);
    const faturamentoPrevisto = agendados.reduce((acc, cur) => acc + Number(cur.valor_cobrado || 0), 0);
    const totalServicosRealizados = concluidos.length;
    const totalAtendimentos = concluidos.length + agendados.length;
    const ticketMedio = concluidos.length > 0 ? totalFaturamento / concluidos.length : 0;

    return {
      period,
      totalFaturamento,
      faturamentoPrevisto,
      totalServicosRealizados,
      totalAtendimentos,
      concluidosCount: concluidos.length,
      agendadosCount: agendados.length,
      canceladosCount: cancelados.length,
      ticketMedio,
      appointments: filtered
    };
  }

  // ============================================================================
  // 6. TOP 10 CLIENTES FREQUENTES
  // ============================================================================
  async getTopClients(limit = 10) {
    const appointments = await this.getAppointments({});
    const clientMap = {};

    appointments.forEach(apt => {
      // Sanitização de telefone (apenas números para agrupamento confiável)
      const cleanPhone = (apt.cliente_telefone || '').replace(/\D/g, '');
      const key = cleanPhone || apt.cliente_nome.toLowerCase().trim();

      if (!clientMap[key]) {
        clientMap[key] = {
          nome: apt.cliente_nome,
          telefone: apt.cliente_telefone,
          telefoneLimpo: cleanPhone,
          totalVisitas: 0,
          valorTotal: 0,
          ultimoAgendamento: apt.data,
          servicosFreq: {}
        };
      }

      if (apt.status !== 'cancelado') {
        clientMap[key].totalVisitas += 1;
        clientMap[key].valorTotal += Number(apt.valor_cobrado || 0);

        const serv = apt.servico || 'outros';
        clientMap[key].servicosFreq[serv] = (clientMap[key].servicosFreq[serv] || 0) + 1;

        if (apt.data > clientMap[key].ultimoAgendamento) {
          clientMap[key].ultimoAgendamento = apt.data;
        }
      }
    });

    const topList = Object.values(clientMap)
      .sort((a, b) => b.totalVisitas - a.totalVisitas || b.valorTotal - a.valorTotal)
      .slice(0, limit);

    return topList;
  }
}

window.DAIANE_DB = new DaianeDataProvider();
