/**
 * Daiane Stefani - Studio & Beauty
 * Painel Administrativo Exclusivo da Daiane
 */

class DaianeAdmin {
  constructor() {
    this.isAuthenticated = false;
    this.currentTab = 'agenda'; // 'agenda', 'precos', 'dashboard', 'portfolio'
    this.agendaSelectedDate = this.getTodayDateString();
    this.agendaStatusFilter = 'todos';
    this.dashboardPeriod = 'mes';
    this.chartMode = 'faturamento'; // 'faturamento' ou 'atendimentos'
    this.selectedPortfolioFile = null;
  }

  getTodayDateString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async init() {
    this.checkSession();
    this.bindEvents();
    if (this.isAuthenticated) {
      await this.loadAdminData();
    }
  }

  checkSession() {
    const logged = sessionStorage.getItem('DAIANE_AUTH_LOGGED') === 'true';
    this.isAuthenticated = logged;
    this.updateAuthView();
  }

  updateAuthView() {
    const loginCard = document.getElementById('adminLoginCard');
    const panelWrap = document.getElementById('adminDashboardPanel');
    const headerAdminBadge = document.getElementById('headerAdminBadge');

    if (this.isAuthenticated) {
      if (loginCard) loginCard.style.display = 'none';
      if (panelWrap) panelWrap.style.display = 'block';
      if (headerAdminBadge) headerAdminBadge.style.display = 'inline-flex';
    } else {
      if (loginCard) loginCard.style.display = 'block';
      if (panelWrap) panelWrap.style.display = 'none';
      if (headerAdminBadge) headerAdminBadge.style.display = 'none';
    }
  }

  bindEvents() {
    // Formulário de Login
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Botão de Logout
    const btnLogout = document.getElementById('adminLogoutBtn');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.handleLogout());
    }

    // Navegação de Abas do Admin
    const tabBtns = document.querySelectorAll('.admin-nav-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Filtros da Agenda
    const agendaDateInput = document.getElementById('adminAgendaDate');
    if (agendaDateInput) {
      agendaDateInput.value = this.agendaSelectedDate;
      agendaDateInput.addEventListener('change', (e) => {
        this.agendaSelectedDate = e.target.value;
        this.loadAgenda();
      });
    }

    const agendaStatusSelect = document.getElementById('adminAgendaStatusFilter');
    if (agendaStatusSelect) {
      agendaStatusSelect.addEventListener('change', (e) => {
        this.agendaStatusFilter = e.target.value;
        this.loadAgenda();
      });
    }

    // Formulário de Ajuste de Preços
    const pricesForm = document.getElementById('adminPricesForm');
    if (pricesForm) {
      pricesForm.addEventListener('submit', (e) => this.handleSavePrices(e));
    }

    // Período do Dashboard
    const periodButtons = document.querySelectorAll('.chart-period-btn');
    periodButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        periodButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.dashboardPeriod = e.currentTarget.getAttribute('data-period');
        this.loadDashboard();
      });
    });

    // Toggle de Modo do Gráfico (Faturamento vs Atendimentos)
    const toggleFaturamento = document.getElementById('toggleModeFaturamento');
    const toggleAtendimentos = document.getElementById('toggleModeAtendimentos');

    if (toggleFaturamento && toggleAtendimentos) {
      toggleFaturamento.addEventListener('click', () => {
        toggleFaturamento.classList.add('active');
        toggleAtendimentos.classList.remove('active');
        this.chartMode = 'faturamento';
        window.DAIANE_CHARTS.setMode('faturamento');
      });

      toggleAtendimentos.addEventListener('click', () => {
        toggleAtendimentos.classList.add('active');
        toggleFaturamento.classList.remove('active');
        this.chartMode = 'atendimentos';
        window.DAIANE_CHARTS.setMode('atendimentos');
      });
    }

    // Modal de Agendamento Manual (Encaixe)
    const btnOpenManual = document.getElementById('btnOpenManualBookingModal');
    const manualModal = document.getElementById('manualBookingModal');
    const closeManualBtn = document.getElementById('closeManualBookingBtn');
    const manualForm = document.getElementById('manualBookingForm');

    if (btnOpenManual && manualModal) {
      btnOpenManual.addEventListener('click', () => {
        this.openManualBookingModal();
      });
    }

    if (manualModal && closeManualBtn) {
      closeManualBtn.addEventListener('click', () => {
        manualModal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    }

    if (manualForm) {
      manualForm.addEventListener('submit', (e) => this.handleManualBookingSubmit(e));
    }

    // Modal de Adicionar Item ao Portfólio
    const btnOpenPortfolioModal = document.getElementById('btnOpenPortfolioModal');
    const portfolioModal = document.getElementById('addPortfolioModal');
    const closePortfolioModalBtn = document.getElementById('closeAddPortfolioBtn');
    const portfolioForm = document.getElementById('addPortfolioForm');
    const fileInput = document.getElementById('newPortFileInput');
    const dropzone = document.getElementById('portfolioUploadDropzone');
    const btnRemovePreview = document.getElementById('btnRemovePreview');
    const btnChangePhoto = document.getElementById('btnChangePhoto');
    const selectRatio = document.getElementById('newPortRatio');

    if (btnOpenPortfolioModal && portfolioModal) {
      btnOpenPortfolioModal.addEventListener('click', () => {
        this.resetPortfolioForm();
        portfolioModal.classList.add('active');
        document.body.classList.add('modal-open');
      });
    }

    if (portfolioModal && closePortfolioModalBtn) {
      closePortfolioModalBtn.addEventListener('click', () => {
        this.resetPortfolioForm();
        portfolioModal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelect(e.target.files[0]);
        }
      });
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileSelect(e.dataTransfer.files[0]);
        }
      });
    }

    if (btnRemovePreview) {
      btnRemovePreview.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetPortfolioPreview();
      });
    }

    if (btnChangePhoto && fileInput) {
      btnChangePhoto.addEventListener('click', () => {
        fileInput.click();
      });
    }

    if (selectRatio) {
      selectRatio.addEventListener('change', (e) => {
        this.updatePreviewAspectRatio(e.target.value);
      });
    }

    if (portfolioForm) {
      portfolioForm.addEventListener('submit', (e) => this.handleAddPortfolioSubmit(e));
    }

    // Modal de Configurações do Supabase
    const btnOpenSettings = document.getElementById('btnOpenSettingsModal');
    const settingsModal = document.getElementById('supabaseSettingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const settingsForm = document.getElementById('supabaseSettingsForm');

    if (btnOpenSettings && settingsModal) {
      btnOpenSettings.addEventListener('click', () => {
        const urlInput = document.getElementById('settingSupabaseUrl');
        const keyInput = document.getElementById('settingSupabaseKey');
        if (urlInput) urlInput.value = window.DAIANE_DB.supabaseUrl || '';
        if (keyInput) keyInput.value = window.DAIANE_DB.supabaseKey || '';
        settingsModal.classList.add('active');
        document.body.classList.add('modal-open');
      });
    }

    if (settingsModal && closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    }

    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => this.handleSaveSettings(e));
    }
  }

  // ============================================================================
  // AUTENTICAÇÃO
  // ============================================================================
  async handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value.trim();
    const pass = document.getElementById('adminPassword').value.trim();
    const errorEl = document.getElementById('adminLoginError');

    // Validação de credenciais exclusivas da Daiane
    const profile = await window.DAIANE_DB.getProfessionalProfile();
    const validLogin = profile.login || window.DAIANE_CONFIG.STUDIO.defaultLogin;
    const validPass = profile.senha || window.DAIANE_CONFIG.STUDIO.defaultSenha;

    if (user === validLogin && pass === validPass) {
      this.isAuthenticated = true;
      sessionStorage.setItem('DAIANE_AUTH_LOGGED', 'true');
      if (errorEl) errorEl.style.display = 'none';
      this.updateAuthView();
      await this.loadAdminData();
      this.showToast('Bem-vinda, Daiane! Painel de gestão carregado.', 'success');
    } else {
      if (errorEl) {
        errorEl.textContent = 'Usuário ou senha incorretos. Verifique suas credenciais.';
        errorEl.style.display = 'block';
      }
    }
  }

  handleLogout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('DAIANE_AUTH_LOGGED');
    this.updateAuthView();
    this.showToast('Sessão encerrada com sucesso.', 'info');
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Atualiza botões
    const tabBtns = document.querySelectorAll('.admin-nav-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Atualiza seções
    const tabSections = document.querySelectorAll('.admin-tab-section');
    tabSections.forEach(sec => {
      if (sec.id === `tab-${tab}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Carrega dados da aba
    if (tab === 'agenda') {
      this.loadAgenda();
    } else if (tab === 'precos') {
      this.loadPrices();
    } else if (tab === 'dashboard') {
      this.loadDashboard();
    } else if (tab === 'portfolio') {
      this.loadAdminPortfolio();
    }
  }

  async loadAdminData() {
    await this.loadPrices();
    await this.loadAgenda();
    await this.loadDashboard();
  }

  // ============================================================================
  // 1. GESTÃO DA AGENDA
  // ============================================================================
  async loadAgenda() {
    const listContainer = document.getElementById('adminAgendaList');
    const countBadge = document.getElementById('adminAgendaCountBadge');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="loading-state">Carregando agendamentos...</div>';

    try {
      const appointments = await window.DAIANE_DB.getAppointments({
        data: this.agendaSelectedDate,
        status: this.agendaStatusFilter
      });

      if (countBadge) {
        countBadge.textContent = `${appointments.length} agendamento(s)`;
      }

      if (appointments.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-agenda-card">
            <span class="empty-icon">📅</span>
            <h3>Nenhum atendimento encontrado para esta data</h3>
            <p>Selecione outra data ou clique em <strong>Novo Agendamento</strong> para realizar um encaixe.</p>
          </div>
        `;
        return;
      }

      const serviceLabels = {
        maquiagem: 'Maquiagem Profissional',
        sobrancelhas: 'Design de Sobrancelhas',
        cilios: 'Extensão de Cílios'
      };

      const statusLabels = {
        agendado: '<span class="status-pill status-agendado">Agendado</span>',
        concluido: '<span class="status-pill status-concluido">Concluído</span>',
        cancelado: '<span class="status-pill status-cancelado">Cancelado</span>'
      };

      listContainer.innerHTML = appointments.map(apt => {
        const cleanPhone = (apt.cliente_telefone || '').replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${apt.cliente_nome}! Aqui é a Daiane Stefani do Studio & Beauty. Entrando em contato sobre seu agendamento no dia ${this.formatDateBR(apt.data)} às ${apt.horario}.`)}`;
        const formattedValor = Number(apt.valor_cobrado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        return `
          <article class="appointment-admin-card status-${apt.status}" data-id="${apt.id}">
            <div class="apt-time-badge">
              <span class="apt-time-icon">⏰</span>
              <span class="apt-time-text">${apt.horario}</span>
            </div>

            <div class="apt-info-block">
              <div class="apt-client-header">
                <h4 class="apt-client-name">${apt.cliente_nome}</h4>
                ${statusLabels[apt.status] || apt.status}
              </div>

              <div class="apt-details-meta">
                <span class="apt-service-tag">💄 ${serviceLabels[apt.servico] || apt.servico}</span>
                <span class="apt-price-tag">💰 ${formattedValor}</span>
                <a href="${whatsappUrl}" target="_blank" class="apt-phone-link" title="Conversar no WhatsApp">
                  📱 ${apt.cliente_telefone}
                </a>
              </div>
            </div>

            <div class="apt-actions-toolbar">
              <a href="${whatsappUrl}" target="_blank" class="btn-action-icon btn-action-wa" title="Chamar no WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                <span>WhatsApp</span>
              </a>

              ${apt.status !== 'concluido' ? `
                <button type="button" class="btn-action-icon btn-action-done" title="Marcar como Concluído" onclick="window.DAIANE_ADMIN.changeAppointmentStatus('${apt.id}', 'concluido')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Concluir</span>
                </button>
              ` : ''}

              ${apt.status !== 'cancelado' ? `
                <button type="button" class="btn-action-icon btn-action-cancel" title="Cancelar Agendamento" onclick="window.DAIANE_ADMIN.changeAppointmentStatus('${apt.id}', 'cancelado')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>Cancelar</span>
                </button>
              ` : `
                <button type="button" class="btn-action-icon btn-action-restore" title="Reativar Agendamento" onclick="window.DAIANE_ADMIN.changeAppointmentStatus('${apt.id}', 'agendado')">
                  <span>Reativar</span>
                </button>
              `}
            </div>
          </article>
        `;
      }).join('');
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
      listContainer.innerHTML = '<div class="error-msg">Erro ao carregar a agenda.</div>';
    }
  }

  async changeAppointmentStatus(aptId, newStatus) {
    try {
      await window.DAIANE_DB.updateAppointmentStatus(aptId, newStatus);
      this.showToast(`Status atualizado para: ${newStatus.toUpperCase()}`, 'success');
      await this.loadAgenda();
      await this.loadDashboard();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      this.showToast('Erro ao atualizar status.', 'error');
    }
  }

  // ============================================================================
  // AGENDAMENTO MANUAL (ENCAIXE)
  // ============================================================================
  openManualBookingModal() {
    const modal = document.getElementById('manualBookingModal');
    const dateInput = document.getElementById('manualDate');
    const slotSelect = document.getElementById('manualHorario');
    const serviceSelect = document.getElementById('manualServico');
    const valorInput = document.getElementById('manualValor');

    if (!modal) return;

    if (dateInput) dateInput.value = this.agendaSelectedDate;

    // Popula horários
    if (slotSelect) {
      slotSelect.innerHTML = window.DAIANE_CONFIG.SCHEDULE.ALL_SLOTS.map(s => `
        <option value="${s}">${s}</option>
      `).join('');
    }

    // Atualiza preço padrão no input
    const updateDefaultPrice = async () => {
      const services = await window.DAIANE_DB.getServices();
      const chosen = services.find(s => s.id === serviceSelect.value);
      if (chosen && valorInput) {
        valorInput.value = chosen.precoAtual.toFixed(2);
      }
    };

    if (serviceSelect) {
      serviceSelect.addEventListener('change', updateDefaultPrice);
      updateDefaultPrice();
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  async handleManualBookingSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('manualNome').value.trim();
    const tel = document.getElementById('manualTelefone').value.trim();
    const servico = document.getElementById('manualServico').value;
    const data = document.getElementById('manualDate').value;
    const horario = document.getElementById('manualHorario').value;
    const valor = parseFloat(document.getElementById('manualValor').value || 0);

    try {
      await window.DAIANE_DB.createAppointment({
        cliente_nome: nome,
        cliente_telefone: tel,
        servico,
        data,
        horario,
        valor_cobrado: valor,
        observacoes: 'Agendamento manual / Encaixe'
      });

      this.showToast('Encaixe agendado com sucesso!', 'success');
      const modal = document.getElementById('manualBookingModal');
      if (modal) modal.classList.remove('active');
      document.body.classList.remove('modal-open');

      this.agendaSelectedDate = data;
      const agendaDateInput = document.getElementById('adminAgendaDate');
      if (agendaDateInput) agendaDateInput.value = data;

      await this.loadAgenda();
      await this.loadDashboard();
    } catch (err) {
      alert(err.message || 'Erro ao realizar agendamento manual.');
    }
  }

  // ============================================================================
  // 2. AJUSTE DINÂMICO DE VALORES
  // ============================================================================
  async loadPrices() {
    try {
      const profile = await window.DAIANE_DB.getProfessionalProfile();
      const inMake = document.getElementById('priceMaquiagem');
      const inBrow = document.getElementById('priceSobrancelhas');
      const inLash = document.getElementById('priceCilios');

      if (inMake) inMake.value = Number(profile.preco_maquiagem || 120).toFixed(2);
      if (inBrow) inBrow.value = Number(profile.preco_sobrancelhas || 25).toFixed(2);
      if (inLash) inLash.value = Number(profile.preco_cilios || 50).toFixed(2);
    } catch (err) {
      console.error('Erro ao carregar preços:', err);
    }
  }

  async handleSavePrices(e) {
    e.preventDefault();
    const inMake = document.getElementById('priceMaquiagem').value;
    const inBrow = document.getElementById('priceSobrancelhas').value;
    const inLash = document.getElementById('priceCilios').value;
    const submitBtn = document.getElementById('btnSavePrices');

    try {
      if (submitBtn) submitBtn.disabled = true;

      await window.DAIANE_DB.updateProfessionalPrices(inMake, inBrow, inLash);
      this.showToast('Preços atualizados com sucesso e já sincronizados na página inicial!', 'success');
    } catch (err) {
      alert(err.message || 'Erro ao salvar preços.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // ============================================================================
  // 3. DASHBOARD E RELATÓRIOS FINANCEIROS
  // ============================================================================
  async loadDashboard() {
    try {
      const kpis = await window.DAIANE_DB.getDashboardData(this.dashboardPeriod);

      // Atualiza KPI cards
      const elFaturamento = document.getElementById('kpiFaturamentoTotal');
      const elServicos = document.getElementById('kpiServicosRealizados');
      const elTicket = document.getElementById('kpiTicketMedio');
      const elPrevisto = document.getElementById('kpiFaturamentoPrevisto');

      if (elFaturamento) {
        elFaturamento.textContent = kpis.totalFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      if (elServicos) {
        elServicos.textContent = `${kpis.totalServicosRealizados} concluídos`;
      }
      if (elTicket) {
        elTicket.textContent = kpis.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      if (elPrevisto) {
        elPrevisto.textContent = `${kpis.faturamentoPrevisto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${kpis.agendadosCount} agendados)`;
      }

      // Atualiza Gráfico de Barras com Chart.js
      window.DAIANE_CHARTS.setPeriod(this.dashboardPeriod);
      window.DAIANE_CHARTS.setMode(this.chartMode);

      // Atualiza Top 10 Clientes
      await this.loadTopClients();
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  }

  // ============================================================================
  // TOP 10 CLIENTES FREQUENTES
  // ============================================================================
  async loadTopClients() {
    const container = document.getElementById('topClientsTableBody');
    if (!container) return;

    try {
      const topList = await window.DAIANE_DB.getTopClients(10);

      if (topList.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum cliente registrado ainda.</td></tr>`;
        return;
      }

      container.innerHTML = topList.map((client, idx) => {
        let badgeRank = `<span class="rank-number">${idx + 1}º</span>`;
        if (idx === 0) badgeRank = `<span class="rank-medal rank-1">🥇 1º</span>`;
        if (idx === 1) badgeRank = `<span class="rank-medal rank-2">🥈 2º</span>`;
        if (idx === 2) badgeRank = `<span class="rank-medal rank-3">🥉 3º</span>`;

        const waLink = `https://wa.me/55${client.telefoneLimpo}?text=${encodeURIComponent(`Olá ${client.nome}! A Daiane Stefani do Studio & Beauty passando para agradecer seu carinho e preferência!`)}`;

        return `
          <tr>
            <td>${badgeRank}</td>
            <td><strong>${client.nome}</strong></td>
            <td>
              <a href="${waLink}" target="_blank" class="client-phone-btn" title="Falar no WhatsApp">
                📱 ${client.telefone}
              </a>
            </td>
            <td><span class="badge-visits">${client.totalVisitas} atendimento(s)</span></td>
            <td><strong class="text-wine">${client.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('Erro ao carregar top clientes:', err);
    }
  }

  // ============================================================================
  // 4. GESTÃO DO PORTFÓLIO NO ADMIN & UPLOAD DE FOTOS DO DISPOSITIVO
  // ============================================================================
  handleFileSelect(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    this.selectedPortfolioFile = file;

    const dropzone = document.getElementById('portfolioUploadDropzone');
    const previewArea = document.getElementById('portfolioPreviewArea');
    const previewImg = document.getElementById('portfolioPreviewImg');
    const fileNameEl = document.getElementById('previewFileName');
    const fileSizeEl = document.getElementById('previewFileSize');
    const ratioSelect = document.getElementById('newPortRatio');

    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) {
      const kb = (file.size / 1024).toFixed(1);
      fileSizeEl.textContent = `${kb} KB`;
    }

    // Leitura e exibição da pré-visualização instantânea
    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewImg) previewImg.src = e.target.result;
      if (dropzone) dropzone.style.display = 'none';
      if (previewArea) previewArea.style.display = 'flex';
      if (ratioSelect) this.updatePreviewAspectRatio(ratioSelect.value);
    };
    reader.readAsDataURL(file);
  }

  updatePreviewAspectRatio(ratio) {
    const container = document.getElementById('previewImgContainer');
    if (!container) return;
    container.classList.remove('ratio-9-16', 'ratio-4-3', 'ratio-1-1');
    if (ratio === '9:16') container.classList.add('ratio-9-16');
    else if (ratio === '4:3') container.classList.add('ratio-4-3');
    else if (ratio === '1:1') container.classList.add('ratio-1-1');
  }

  resetPortfolioPreview() {
    this.selectedPortfolioFile = null;
    const fileInput = document.getElementById('newPortFileInput');
    if (fileInput) fileInput.value = '';

    const dropzone = document.getElementById('portfolioUploadDropzone');
    const previewArea = document.getElementById('portfolioPreviewArea');
    const previewImg = document.getElementById('portfolioPreviewImg');

    if (previewImg) previewImg.src = '';
    if (previewArea) previewArea.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
  }

  resetPortfolioForm() {
    const form = document.getElementById('addPortfolioForm');
    if (form) form.reset();
    this.resetPortfolioPreview();
  }

  async loadAdminPortfolio() {
    const grid = document.getElementById('adminPortfolioGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading-state">Carregando fotos...</div>';

    try {
      const items = await window.DAIANE_DB.getPortfolio('todos');

      if (items.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary); background: #ffffff; border-radius: var(--radius-md); border: 1.5px dashed var(--border-light);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🖼️</div>
            <h4 style="color: var(--primary-wine); margin-bottom: 0.25rem;">Nenhum trabalho no portfólio</h4>
            <p style="font-size: 0.88rem;">Clique no botão "+ Adicionar Trabalho" acima para enviar sua primeira foto da galeria ou câmera.</p>
          </div>
        `;
        return;
      }

      const catLabels = {
        maquiagem: 'Maquiagem',
        sobrancelhas: 'Sobrancelhas',
        cilios: 'Cílios'
      };

      grid.innerHTML = items.map(item => `
        <div class="admin-portfolio-card" data-id="${item.id}">
          <div class="admin-port-thumb">
            <img src="${item.imagem_url}" alt="${item.titulo}" loading="lazy" onerror="this.src='assets/daiane.jpg'">
            <span class="admin-port-ratio">${item.aspect_ratio}</span>
          </div>
          <div class="admin-port-info">
            <h5>${item.titulo}</h5>
            <span class="admin-port-cat">${catLabels[item.categoria] || item.categoria}</span>
          </div>
          <button type="button" class="btn-delete-port" onclick="window.DAIANE_ADMIN.deletePortfolioItem('${item.id}')" title="Excluir foto">
            🗑️ Excluir Foto
          </button>
        </div>
      `).join('');
    } catch (err) {
      console.error('Erro ao carregar portfólio no admin:', err);
      grid.innerHTML = '<div class="error-msg">Erro ao carregar portfólio.</div>';
    }
  }

  async handleAddPortfolioSubmit(e) {
    e.preventDefault();

    if (!this.selectedPortfolioFile) {
      this.showToast('Por favor, selecione uma foto do seu dispositivo.', 'error');
      return;
    }

    const titulo = document.getElementById('newPortTitulo').value.trim();
    const categoria = document.getElementById('newPortCategoria').value;
    const ratio = document.getElementById('newPortRatio').value;

    const btnSubmit = document.getElementById('btnSubmitPortfolio');
    const btnText = document.getElementById('btnSubmitPortfolioText');

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnText) btnText.innerHTML = '⏳ Enviando foto...';

      // 1. Upload para o Supabase Storage (com fallback Base64 se offline/erro)
      const uploadResult = await window.DAIANE_DB.uploadPortfolioImage(this.selectedPortfolioFile);

      // 2. Registro do trabalho no banco
      await window.DAIANE_DB.addPortfolioItem({
        titulo,
        categoria,
        imagem_url: uploadResult.url,
        aspect_ratio: ratio
      });

      const msgSuccess = uploadResult.storage === 'supabase'
        ? 'Foto publicada e sincronizada na nuvem com sucesso!'
        : 'Foto adicionada ao portfólio com sucesso!';
      this.showToast(msgSuccess, 'success');

      // Fecha o modal e limpa estado
      const modal = document.getElementById('addPortfolioModal');
      if (modal) modal.classList.remove('active');
      document.body.classList.remove('modal-open');
      this.resetPortfolioForm();

      // Recarrega o portfólio no admin e na página pública
      await this.loadAdminPortfolio();
      await window.DAIANE_PORTFOLIO.loadGallery();
    } catch (err) {
      console.error('Erro ao adicionar foto:', err);
      alert(err.message || 'Erro ao processar imagem.');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Publicar no Portfólio';
    }
  }

  async deletePortfolioItem(id) {
    if (!confirm('Deseja realmente remover esta foto do portfólio?')) return;

    try {
      await window.DAIANE_DB.deletePortfolioItem(id);
      this.showToast('Foto removida do portfólio com sucesso.', 'info');
      await this.loadAdminPortfolio();
      await window.DAIANE_PORTFOLIO.loadGallery();
    } catch (err) {
      console.error('Erro ao excluir foto:', err);
      alert(err.message || 'Erro ao excluir item.');
    }
  }

  // ============================================================================
  // CONFIGURAÇÕES SUPABASE
  // ============================================================================
  handleSaveSettings(e) {
    e.preventDefault();
    const url = document.getElementById('settingSupabaseUrl').value.trim();
    const key = document.getElementById('settingSupabaseKey').value.trim();

    window.DAIANE_DB.setCredentials(url, key);
    this.showToast('Configurações do Supabase salvas!', 'success');

    const modal = document.getElementById('supabaseSettingsModal');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  // Helpers
  formatDateBR(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('appToast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `app-toast show ${type}`;

    setTimeout(() => {
      toast.className = 'app-toast';
    }, 4000);
  }
}

window.DAIANE_ADMIN = new DaianeAdmin();
