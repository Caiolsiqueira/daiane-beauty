/**
 * Daiane Stefani - Studio & Beauty
 * Fluxo de Agendamento do Cliente (Mobile-First)
 */

class DaianeBooking {
  constructor() {
    this.selectedService = null;
    this.selectedDate = null;
    this.selectedSlot = null;
    this.services = [];
    this.lastCreatedAppointment = null;
    this.redirectTimer = null;
  }

  async init() {
    this.bindEvents();
    await this.loadServices();
    this.initDatePicker();
    this.initMasks();
  }

  bindEvents() {
    // Escuta evento de atualização de preços dinâmicos pela Daiane
    window.addEventListener('daiane:prices-updated', () => {
      this.loadServices();
    });

    // Submissão do formulário
    const form = document.getElementById('bookingForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Modal de confirmação
    const modal = document.getElementById('confirmationModal');
    const closeBtn = document.getElementById('closeConfirmationBtn');
    if (modal && closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (this.redirectTimer) clearTimeout(this.redirectTimer);
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    }

    const btnDirectWa = document.getElementById('btnDirectWhatsappLink');
    if (btnDirectWa) {
      btnDirectWa.addEventListener('click', () => {
        if (this.redirectTimer) clearTimeout(this.redirectTimer);
      });
    }

    // Ações complementares do modal de confirmação
    const btnGCal = document.getElementById('btnGoogleCalendar');
    const btnIcs = document.getElementById('btnDownloadIcs');

    if (btnGCal) {
      btnGCal.addEventListener('click', () => this.addToGoogleCalendar());
    }
    if (btnIcs) {
      btnIcs.addEventListener('click', () => this.downloadIcsFile());
    }
  }

  // ============================================================================
  // CARREGAMENTO DE SERVIÇOS E PREÇOS DINÂMICOS
  // ============================================================================
  async loadServices() {
    try {
      this.services = await window.DAIANE_DB.getServices();
      this.renderServiceCards();
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  }

  renderServiceCards() {
    const container = document.getElementById('servicesList');
    if (!container) return;

    const iconMap = {
      sparkles: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
      eye: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
      'sparkles-double': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`
    };

    container.innerHTML = this.services.map(serv => {
      const isSelected = this.selectedService && this.selectedService.id === serv.id;
      const formattedPrice = serv.precoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      return `
        <div class="service-card ${isSelected ? 'selected' : ''}" data-service-id="${serv.id}" onclick="window.DAIANE_BOOKING.selectService('${serv.id}')">
          <div class="service-card-header">
            <span class="service-badge-pill">${serv.destaque || 'Especialidade'}</span>
            <span class="service-duration">⏱️ ${serv.duracaoTexto || '30 min'}</span>
          </div>
          <div class="service-icon-wrap">
            ${iconMap[serv.icone] || iconMap.sparkles}
          </div>
          <h3 class="service-title">${serv.nome}</h3>
          <p class="service-desc">${serv.descricao}</p>
          <div class="service-price-wrap">
            <span class="price-label">Valor</span>
            <span class="price-value">${formattedPrice}</span>
          </div>
          <div class="service-select-indicator">
            <span class="indicator-radio"></span>
            <span class="indicator-text">${isSelected ? 'Selecionado' : 'Escolher este serviço'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  selectService(serviceId) {
    const serv = this.services.find(s => s.id === serviceId);
    if (!serv) return;
    this.selectedService = serv;
    this.renderServiceCards();
    this.updateSummaryPill();
  }

  // ============================================================================
  // CALENDÁRIO COM BLOQUEIO DE DOMINGO/SEGUNDA E DATAS PASSADAS
  // ============================================================================
  initDatePicker() {
    const dateInput = document.getElementById('bookingDate');
    const dateHelp = document.getElementById('bookingDateHelp');
    if (!dateInput) return;

    // Define data mínima como hoje (fuso horário local Brasil)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDateStr = `${yyyy}-${mm}-${dd}`;
    dateInput.min = minDateStr;

    // Se hoje for domingo (0) ou segunda (1), sugere a próxima terça-feira
    let suggestedDate = new Date();
    if (suggestedDate.getDay() === 0) {
      suggestedDate.setDate(suggestedDate.getDate() + 2); // próxima terça
    } else if (suggestedDate.getDay() === 1) {
      suggestedDate.setDate(suggestedDate.getDate() + 1); // próxima terça
    }

    const sugY = suggestedDate.getFullYear();
    const sugM = String(suggestedDate.getMonth() + 1).padStart(2, '0');
    const sugD = String(suggestedDate.getDate()).padStart(2, '0');
    const defaultVal = `${sugY}-${sugM}-${sugD}`;

    dateInput.value = defaultVal;
    this.handleDateChange(defaultVal);

    dateInput.addEventListener('change', (e) => {
      this.handleDateChange(e.target.value);
    });
  }

  handleDateChange(dateStr) {
    const dateHelp = document.getElementById('bookingDateHelp');
    const slotsContainer = document.getElementById('slotsContainer');
    const slotsMessage = document.getElementById('slotsMessage');

    if (!dateStr) {
      this.selectedDate = null;
      this.selectedSlot = null;
      if (slotsContainer) slotsContainer.innerHTML = '';
      if (slotsMessage) slotsMessage.textContent = 'Selecione uma data para consultar horários disponíveis.';
      return;
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const chosenDate = new Date(year, month - 1, day);
    const dayOfWeek = chosenDate.getDay(); // 0 = Domingo, 1 = Segunda

    // Validação estrita: Domingo e Segunda Fechados
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      this.selectedDate = null;
      this.selectedSlot = null;
      if (dateHelp) {
        dateHelp.innerHTML = `<span class="text-danger">⚠️ O estúdio fica fechado aos domingos e segundas-feiras. Por favor, escolha de <strong>Terça a Sábado</strong>.</span>`;
      }
      if (slotsContainer) slotsContainer.innerHTML = '';
      if (slotsMessage) {
        slotsMessage.innerHTML = `<span class="badge-closed">Studio Fechado neste dia</span>`;
      }
      return;
    }

    const dayName = window.DAIANE_CONFIG.SCHEDULE.DAY_NAMES[dayOfWeek];
    const formattedDisplayDate = `${dayName}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

    if (dateHelp) {
      dateHelp.innerHTML = `<span class="text-success">✨ Data válida: <strong>${formattedDisplayDate}</strong></span>`;
    }

    this.selectedDate = dateStr;
    this.selectedSlot = null;
    this.updateSummaryPill();
    this.loadSlotsForDate(dateStr);
  }

  // ============================================================================
  // CARREGAMENTO DINÂMICO DE HORÁRIOS & BLOQUEIO DE HORÁRIOS OCUPADOS
  // ============================================================================
  async loadSlotsForDate(dateStr) {
    const slotsContainer = document.getElementById('slotsContainer');
    const slotsMessage = document.getElementById('slotsMessage');
    if (!slotsContainer) return;

    if (slotsMessage) slotsMessage.textContent = 'Consultando horários disponíveis...';
    slotsContainer.innerHTML = '<div class="loading-slots">Carregando agenda...</div>';

    try {
      const bookedSlots = await window.DAIANE_DB.getBookedSlots(dateStr);
      const allSlots = window.DAIANE_CONFIG.SCHEDULE.ALL_SLOTS;

      // Se for a data de hoje, bloqueia horários que já passaram com margem de 10 min
      const now = new Date();
      const isToday = (
        now.getFullYear() === parseInt(dateStr.split('-')[0], 10) &&
        (now.getMonth() + 1) === parseInt(dateStr.split('-')[1], 10) &&
        now.getDate() === parseInt(dateStr.split('-')[2], 10)
      );

      const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

      let availableCount = 0;

      slotsContainer.innerHTML = allSlots.map(slot => {
        const [slotH, slotM] = slot.split(':').map(Number);
        const slotMinutes = slotH * 60 + slotM;
        const isPast = isToday && (slotMinutes <= currentMinutesNow + 10);
        const isBooked = bookedSlots.includes(slot);
        const isUnavailable = isBooked || isPast;

        if (!isUnavailable) availableCount++;

        let statusText = 'Disponível';
        let disabledAttr = '';
        let extraClass = '';

        if (isBooked) {
          statusText = 'Ocupado';
          disabledAttr = 'disabled';
          extraClass = 'slot-booked';
        } else if (isPast) {
          statusText = 'Passou';
          disabledAttr = 'disabled';
          extraClass = 'slot-past';
        }

        const isSelected = this.selectedSlot === slot;

        return `
          <button type="button" 
                  class="slot-btn ${extraClass} ${isSelected ? 'selected' : ''}" 
                  ${disabledAttr}
                  onclick="window.DAIANE_BOOKING.selectSlot('${slot}')">
            <span class="slot-time">${slot}</span>
            <span class="slot-status-label">${statusText}</span>
          </button>
        `;
      }).join('');

      if (slotsMessage) {
        if (availableCount > 0) {
          slotsMessage.innerHTML = `<span class="badge-available">✨ ${availableCount} horários livres para esta data</span>`;
        } else {
          slotsMessage.innerHTML = `<span class="badge-full">Agenda cheia para esta data. Por favor, escolha outro dia.</span>`;
        }
      }
    } catch (err) {
      console.error('Erro ao buscar slots:', err);
      slotsContainer.innerHTML = '<div class="error-msg">Erro ao carregar horários. Tente novamente.</div>';
    }
  }

  selectSlot(slot) {
    this.selectedSlot = slot;

    // Atualiza visual dos botões
    const buttons = document.querySelectorAll('.slot-btn');
    buttons.forEach(btn => {
      const timeSpan = btn.querySelector('.slot-time');
      if (timeSpan && timeSpan.textContent.trim() === slot) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    this.updateSummaryPill();
  }

  updateSummaryPill() {
    const summaryCard = document.getElementById('bookingSummaryPill');
    if (!summaryCard) return;

    if (!this.selectedService && !this.selectedDate && !this.selectedSlot) {
      summaryCard.style.display = 'none';
      return;
    }

    summaryCard.style.display = 'flex';
    const servName = this.selectedService ? this.selectedService.nome : 'Serviço a escolher';
    const servPrice = this.selectedService ? this.selectedService.precoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '--';
    const dateFormatted = this.selectedDate ? this.formatDateBR(this.selectedDate) : 'Data a escolher';
    const slotFormatted = this.selectedSlot || 'Horário a escolher';

    summaryCard.innerHTML = `
      <div class="summary-pill-left">
        <strong>${servName}</strong> (${servPrice})
        <span>📅 ${dateFormatted} às ${slotFormatted}</span>
      </div>
      <div class="summary-pill-right">
        <span class="pill-duration">30 min de atendimento</span>
      </div>
    `;
  }

  // ============================================================================
  // MÁSCARA AUTOMÁTICA DE WHATSAPP (XX) XXXXX-XXXX
  // ============================================================================
  initMasks() {
    const phoneInput = document.getElementById('clienteTelefone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);

      if (val.length > 6) {
        val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
      } else if (val.length > 2) {
        val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
      } else if (val.length > 0) {
        val = `(${val}`;
      }
      e.target.value = val;
    });
  }

  // ============================================================================
  // SUBMISSÃO DO AGENDAMENTO COM VALIDAÇÃO COMPLETA
  // ============================================================================
  async handleSubmit(e) {
    e.preventDefault();

    const nomeInput = document.getElementById('clienteNome');
    const telefoneInput = document.getElementById('clienteTelefone');
    const submitBtn = document.getElementById('btnSubmitBooking');

    if (!nomeInput || !telefoneInput) return;

    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();

    // Validações
    if (!nome || nome.split(' ').length < 2) {
      this.showToast('Por favor, informe seu Nome e Sobrenome.', 'error');
      nomeInput.focus();
      return;
    }

    const digitsOnly = telefone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      this.showToast('Por favor, informe um WhatsApp válido com DDD (10 ou 11 dígitos).', 'error');
      telefoneInput.focus();
      return;
    }

    if (!this.selectedService) {
      this.showToast('Por favor, clique e selecione o serviço desejado.', 'error');
      document.getElementById('servicesList').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!this.selectedDate) {
      this.showToast('Por favor, escolha uma data de Terça a Sábado.', 'error');
      document.getElementById('bookingDate').focus();
      return;
    }

    if (!this.selectedSlot) {
      this.showToast('Por favor, selecione um horário disponível.', 'error');
      document.getElementById('slotsContainer').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Processamento
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Processando reserva...</span>`;
      }

      const appointment = await window.DAIANE_DB.createAppointment({
        cliente_nome: nome,
        cliente_telefone: telefone,
        servico: this.selectedService.id,
        data: this.selectedDate,
        horario: this.selectedSlot,
        valor_cobrado: this.selectedService.precoAtual,
        observacoes: ''
      });

      this.lastCreatedAppointment = {
        ...appointment,
        servicoNome: this.selectedService.nome,
        valorCobradoFormatado: this.selectedService.precoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      };

      this.showConfirmationModal();

      // Limpa seleções para novo agendamento e recarrega os slots da data
      this.selectedSlot = null;
      this.loadSlotsForDate(this.selectedDate);
    } catch (err) {
      console.error('Erro ao agendar:', err);
      this.showToast(err.message || 'Erro ao realizar agendamento.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Confirmar Agendamento</span>`;
      }
    }
  }

  // ============================================================================
  // MODAL DE CONFIRMAÇÃO & REDIRECIONAMENTO AUTOMÁTICO WHATSAPP
  // ============================================================================
  generateWhatsAppUrl(apt) {
    // 1. Obtém o número configurável no config.js (ex: 5532984561005)
    let destNumber = window.DAIANE_CONFIG.WHATSAPP_NUMBER || window.DAIANE_CONFIG.STUDIO.whatsapp || '5532984561005';
    let cleanNumber = String(destNumber).replace(/\D/g, '');
    if (!cleanNumber.startsWith('55')) {
      cleanNumber = '55' + cleanNumber;
    }

    // 2. Mensagem pré-formatada amigável exigida
    const msg =
      `Olá Daiane! Acabei de agendar meu horário pelo site e gostaria de confirmar:\n\n` +
      `✨ *Cliente:* ${apt.cliente_nome}\n` +
      `💄 *Serviço:* ${apt.servicoNome}\n` +
      `📅 *Data:* ${this.formatDateBR(apt.data)}\n` +
      `⏰ *Horário:* ${apt.horario}\n` +
      `💰 *Valor:* ${apt.valorCobradoFormatado}\n\n` +
      `Aguardo sua confirmação. Muito obrigada!`;

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  }

  showConfirmationModal() {
    const apt = this.lastCreatedAppointment;
    if (!apt) return;

    const modal = document.getElementById('confirmationModal');
    const modalNome = document.getElementById('modalConfNome');
    const modalServico = document.getElementById('modalConfServico');
    const modalData = document.getElementById('modalConfData');
    const modalHorario = document.getElementById('modalConfHorario');
    const modalValor = document.getElementById('modalConfValor');
    const btnDirectWa = document.getElementById('btnDirectWhatsappLink');
    const redirectBadge = document.getElementById('modalRedirectMessage');

    if (modalNome) modalNome.textContent = apt.cliente_nome;
    if (modalServico) modalServico.textContent = apt.servicoNome;
    if (modalData) modalData.textContent = this.formatDateBR(apt.data);
    if (modalHorario) modalHorario.textContent = `${apt.horario} (Duração: 30 min)`;
    if (modalValor) modalValor.textContent = apt.valorCobradoFormatado;

    // Gera o link oficial do WhatsApp
    const whatsappUrl = this.generateWhatsAppUrl(apt);

    if (btnDirectWa) {
      btnDirectWa.href = whatsappUrl;
    }

    if (redirectBadge) {
      redirectBadge.innerHTML = `<span>📲 Agendamento registrado! Redirecionando para o WhatsApp...</span>`;
    }

    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }

    // REDIRECIONAMENTO AUTOMÁTICO E OBRIGATÓRIO (após 1.2 segundos para feedback visual)
    if (this.redirectTimer) clearTimeout(this.redirectTimer);
    this.redirectTimer = setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 1200);
  }

  addToGoogleCalendar() {
    const apt = this.lastCreatedAppointment;
    if (!apt) return;

    const [year, month, day] = apt.data.split('-');
    const [hour, minute] = apt.horario.split(':');

    // Data de início (ISO UTC simples para Google Calendar)
    // 30 min de duração
    const startObj = new Date(year, parseInt(month, 10) - 1, day, hour, minute);
    const endObj = new Date(startObj.getTime() + 30 * 60 * 1000);

    const formatGDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${y}${m}${dayStr}T${h}${min}00`;
    };

    const dates = `${formatGDate(startObj)}/${formatGDate(endObj)}`;
    const title = encodeURIComponent(`Atendimento: ${apt.servicoNome} - Studio Daiane Stefani`);
    const details = encodeURIComponent(`Agendamento de ${apt.servicoNome} com Daiane Stefani.\nCliente: ${apt.cliente_nome}\nValor: ${apt.valorCobradoFormatado}`);
    const location = encodeURIComponent(window.DAIANE_CONFIG.STUDIO.address);

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(gcalUrl, '_blank');
  }

  downloadIcsFile() {
    const apt = this.lastCreatedAppointment;
    if (!apt) return;

    const [year, month, day] = apt.data.split('-');
    const [hour, minute] = apt.horario.split(':');

    const startObj = new Date(year, parseInt(month, 10) - 1, day, hour, minute);
    const endObj = new Date(startObj.getTime() + 30 * 60 * 1000);

    const formatIcsDate = (d) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getUTCDate()).padStart(2, '0');
      const h = String(d.getUTCHours()).padStart(2, '0');
      const min = String(d.getUTCMinutes()).padStart(2, '0');
      return `${y}${m}${dayStr}T${h}${min}00Z`;
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Daiane Stefani Studio & Beauty//Agendamento//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:daiane-${apt.id}@stefanibeauty.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startObj)}`,
      `DTEND:${formatIcsDate(endObj)}`,
      `SUMMARY:Atendimento: ${apt.servicoNome} - Studio Daiane Stefani`,
      `DESCRIPTION:Atendimento com Daiane Stefani.\\nCliente: ${apt.cliente_nome}\\nValor: ${apt.valorCobradoFormatado}`,
      `LOCATION:${window.DAIANE_CONFIG.STUDIO.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agendamento-daiane-${apt.data}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

window.DAIANE_BOOKING = new DaianeBooking();
