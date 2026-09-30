/**
 * Daiane Stefani - Studio & Beauty
 * Gerenciamento e Exibição do Portfólio (9:16, 4:3, 1:1 e Lightbox)
 */

class DaianePortfolio {
  constructor() {
    this.currentCategory = 'todos';
    this.items = [];
  }

  async init() {
    this.bindEvents();
    await this.loadGallery();
  }

  bindEvents() {
    // Filtros de categoria do portfólio
    const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentCategory = e.currentTarget.getAttribute('data-cat') || 'todos';
        this.renderGallery();
      });
    });

    // Lightbox close events
    const lightboxModal = document.getElementById('portfolioLightbox');
    const closeBtn = document.getElementById('closeLightboxBtn');
    if (lightboxModal && closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLightbox());
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) this.closeLightbox();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeLightbox();
      });
    }
  }

  async loadGallery() {
    try {
      this.items = await window.DAIANE_DB.getPortfolio('todos');
      this.renderGallery();
    } catch (err) {
      console.error('Erro ao carregar portfólio:', err);
    }
  }

  renderGallery() {
    const container = document.getElementById('portfolioGrid');
    if (!container) return;

    const filtered = this.currentCategory === 'todos'
      ? this.items
      : this.items.filter(item => item.categoria === this.currentCategory);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-portfolio">
          <p>Nenhum trabalho cadastrado nesta categoria ainda.</p>
        </div>
      `;
      return;
    }

    const categoryLabels = {
      maquiagem: 'Maquiagem',
      sobrancelhas: 'Sobrancelhas',
      cilios: 'Cílios'
    };

    const ratioLabels = {
      '9:16': 'Stories 9:16',
      '4:3': 'Retrato 4:3',
      '1:1': 'Feed 1:1'
    };

    container.innerHTML = filtered.map(item => {
      const ratioClass = item.aspect_ratio === '9:16'
        ? 'ratio-9-16'
        : item.aspect_ratio === '4:3'
          ? 'ratio-4-3'
          : 'ratio-1-1';

      return `
        <article class="portfolio-item-card ${ratioClass}" data-id="${item.id}" onclick="window.DAIANE_PORTFOLIO.openLightbox('${item.id}')">
          <div class="portfolio-thumb-wrapper">
            <img src="${item.imagem_url}" 
                 alt="${item.titulo}" 
                 loading="lazy" 
                 onerror="this.src='assets/daiane.jpg'">
            <div class="portfolio-overlay">
              <span class="zoom-icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </span>
              <div class="portfolio-overlay-info">
                <span class="overlay-cat-badge">${categoryLabels[item.categoria] || item.categoria}</span>
                <h4 class="overlay-title">${item.titulo}</h4>
              </div>
            </div>
          </div>
          <div class="portfolio-item-footer">
            <span class="item-cat-tag">${categoryLabels[item.categoria] || item.categoria}</span>
            <span class="item-ratio-badge">${ratioLabels[item.aspect_ratio] || item.aspect_ratio}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  openLightbox(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('portfolioLightbox');
    const img = document.getElementById('lightboxImg');
    const title = document.getElementById('lightboxTitle');
    const cat = document.getElementById('lightboxCategory');
    const desc = document.getElementById('lightboxDesc');
    const ratioBadge = document.getElementById('lightboxRatio');

    if (!modal || !img) return;

    img.src = item.imagem_url;
    img.alt = item.titulo;
    if (title) title.textContent = item.titulo;
    if (cat) cat.textContent = item.categoria.toUpperCase();
    if (desc) desc.textContent = item.descricao || 'Trabalho realizado com excelência no Studio Daiane Stefani.';
    if (ratioBadge) ratioBadge.textContent = `Formato ${item.aspect_ratio}`;

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  closeLightbox() {
    const modal = document.getElementById('portfolioLightbox');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

window.DAIANE_PORTFOLIO = new DaianePortfolio();
