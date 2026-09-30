/**
 * Daiane Stefani - Studio & Beauty
 * Gráficos Financeiros & Atendimentos (Chart.js + Native Fallback)
 */

class DaianeChartManager {
  constructor() {
    this.chartInstance = null;
    this.currentPeriod = 'mes'; // 'dia', 'semana', 'mes', 'ano'
    this.currentMode = 'faturamento'; // 'faturamento' (R$) ou 'atendimentos' (Qtd)
  }

  setPeriod(period) {
    this.currentPeriod = period;
    this.update();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.update();
  }

  async update() {
    const canvas = document.getElementById('financeChartCanvas');
    const nativeContainer = document.getElementById('nativeChartFallback');
    if (!canvas) return;

    const data = await this.prepareChartData();

    if (window.Chart) {
      this.renderChartJs(canvas, data);
      if (nativeContainer) nativeContainer.style.display = 'none';
      canvas.style.display = 'block';
    } else {
      if (canvas) canvas.style.display = 'none';
      if (nativeContainer) {
        nativeContainer.style.display = 'block';
        this.renderNativeChart(nativeContainer, data);
      }
    }
  }

  async prepareChartData() {
    const appointments = await window.DAIANE_DB.getAppointments({});
    const now = new Date();
    const isFaturamento = this.currentMode === 'faturamento';

    // Helper para formatar moeda brasileira
    const formatBRL = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let labels = [];
    let values = [];
    let tooltipLabels = [];

    if (this.currentPeriod === 'dia') {
      // Agrupamento por blocos de horários do dia de hoje (ou mais recente)
      labels = ['09h-11h', '11h-13h', '13h-15h', '15h-17h', '17h+'];
      values = [0, 0, 0, 0, 0];

      const todayStr = now.toISOString().slice(0, 10);
      const todaysApts = appointments.filter(a => a.data === todayStr && a.status !== 'cancelado');

      todaysApts.forEach(apt => {
        const hour = parseInt(apt.horario.split(':')[0], 10);
        let idx = 0;
        if (hour < 11) idx = 0;
        else if (hour < 13) idx = 1;
        else if (hour < 15) idx = 2;
        else if (hour < 17) idx = 3;
        else idx = 4;

        if (isFaturamento) {
          values[idx] += Number(apt.valor_cobrado || 0);
        } else {
          values[idx] += 1;
        }
      });
    } else if (this.currentPeriod === 'semana') {
      // Dias de terça a sábado (dias úteis da Daiane)
      labels = ['Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      values = [0, 0, 0, 0, 0];

      // Filtra últimos 7 dias
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekApts = appointments.filter(a => {
        const d = new Date(a.data + 'T00:00:00');
        return d >= sevenDaysAgo && a.status !== 'cancelado';
      });

      weekApts.forEach(apt => {
        const dayOfWeek = new Date(apt.data + 'T00:00:00').getDay(); // 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
        const idx = dayOfWeek - 2;
        if (idx >= 0 && idx < 5) {
          if (isFaturamento) {
            values[idx] += Number(apt.valor_cobrado || 0);
          } else {
            values[idx] += 1;
          }
        }
      });
    } else if (this.currentPeriod === 'mes') {
      // 4 semanas do mês atual
      labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      values = [0, 0, 0, 0];

      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthApts = appointments.filter(a => {
        const d = new Date(a.data + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && a.status !== 'cancelado';
      });

      monthApts.forEach(apt => {
        const day = parseInt(apt.data.split('-')[2], 10);
        let weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
        if (isFaturamento) {
          values[weekIdx] += Number(apt.valor_cobrado || 0);
        } else {
          values[weekIdx] += 1;
        }
      });
    } else if (this.currentPeriod === 'ano') {
      // 12 meses
      labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      values = new Array(12).fill(0);

      const currentYear = now.getFullYear();
      const yearApts = appointments.filter(a => {
        const d = new Date(a.data + 'T00:00:00');
        return d.getFullYear() === currentYear && a.status !== 'cancelado';
      });

      yearApts.forEach(apt => {
        const month = parseInt(apt.data.split('-')[1], 10) - 1;
        if (month >= 0 && month < 12) {
          if (isFaturamento) {
            values[month] += Number(apt.valor_cobrado || 0);
          } else {
            values[month] += 1;
          }
        }
      });
    }

    return {
      labels,
      values,
      isFaturamento,
      labelName: isFaturamento ? 'Faturamento Total (R$)' : 'Quantidade de Atendimentos',
      period: this.currentPeriod
    };
  }

  renderChartJs(canvas, chartData) {
    const ctx = canvas.getContext('2d');
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Cores oficiais da marca Daiane Stefani
    const barGradient = ctx.createLinearGradient(0, 0, 0, 280);
    if (chartData.isFaturamento) {
      barGradient.addColorStop(0, '#610002');
      barGradient.addColorStop(1, '#ff8f80');
    } else {
      barGradient.addColorStop(0, '#0059cc');
      barGradient.addColorStop(1, '#66a3ff');
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.labelName,
          data: chartData.values,
          backgroundColor: barGradient,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#610002',
            titleColor: '#feebd6',
            bodyColor: '#ffffff',
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 14, weight: 'bold' },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                if (chartData.isFaturamento) {
                  return ` R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                }
                return ` ${val} cliente(s) atendido(s)`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#610002',
              font: {
                size: 12,
                weight: '600'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(97, 0, 2, 0.08)'
            },
            ticks: {
              color: '#610002',
              font: {
                size: 11
              },
              callback: (value) => {
                if (chartData.isFaturamento) {
                  return `R$ ${value}`;
                }
                return Number.isInteger(value) ? value : '';
              }
            }
          }
        }
      }
    });
  }

  renderNativeChart(container, chartData) {
    const maxVal = Math.max(...chartData.values, 1);
    const barsHtml = chartData.labels.map((lbl, idx) => {
      const val = chartData.values[idx];
      const heightPercent = Math.max(Math.round((val / maxVal) * 100), 4);
      const displayVal = chartData.isFaturamento
        ? `R$ ${val.toFixed(0)}`
        : `${val}`;

      return `
        <div class="native-bar-col">
          <span class="native-bar-val">${displayVal}</span>
          <div class="native-bar-track">
            <div class="native-bar-fill ${chartData.isFaturamento ? 'fill-wine' : 'fill-blue'}" style="height: ${heightPercent}%;"></div>
          </div>
          <span class="native-bar-lbl">${lbl}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="native-chart-wrapper">
        <div class="native-bars-grid">
          ${barsHtml}
        </div>
      </div>
    `;
  }
}

window.DAIANE_CHARTS = new DaianeChartManager();
