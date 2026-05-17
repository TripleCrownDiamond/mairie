(() => {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const drawer = document.getElementById('mobile-drawer');
  const mega = document.getElementById('mega-menu');
  const menuButtons = Array.from(document.querySelectorAll('[data-menu-group]'));
  const megaGroups = Array.from(document.querySelectorAll('[data-mega-group]'));
  const toast = document.querySelector('.toast');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  };

  const closeMega = () => {
    if (!mega) return;
    mega.hidden = true;
    megaGroups.forEach((group) => {
      group.hidden = true;
    });
    menuButtons.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
  };

  const openMega = (key) => {
    if (!mega) return;
    const target = mega.querySelector(`[data-mega-group="${key}"]`);
    const alreadyOpen = !mega.hidden && target && !target.hidden;
    if (alreadyOpen) {
      closeMega();
      return;
    }

    mega.hidden = false;
    megaGroups.forEach((group) => {
      group.hidden = group.dataset.megaGroup !== key;
    });
    menuButtons.forEach((btn) => btn.setAttribute('aria-expanded', String(btn.dataset.menuGroup === key)));
  };

  const openDrawer = () => {
    if (!drawer || !menuToggle) return;
    drawer.hidden = false;
    body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
  };

  const closeDrawer = () => {
    if (!drawer || !menuToggle) return;
    drawer.hidden = true;
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  const bindHeroBackground = (root) => {
    const bg = root.querySelector('[data-hero-bg]');
    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    const current = root.querySelector('[data-hero-current]');
    const total = root.querySelector('[data-hero-total]');

    let images = [];
    try {
      images = JSON.parse(root.dataset.heroImages || '[]');
    } catch (_error) {
      images = [];
    }

    images = images.filter(Boolean);
    if (!bg || images.length === 0 || slides.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer = null;
    let fadeTimer = null;

    if (total) {
      total.textContent = String(slides.length).padStart(2, '0');
    }

    const render = (nextIndex, animate = true) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      if (current) {
        current.textContent = String(index + 1).padStart(2, '0');
      }

      const nextImage = images[index] || images[0];
      if (!animate) {
        bg.style.backgroundImage = `url("${nextImage}")`;
        return;
      }

      bg.classList.add('is-fading');
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => {
        bg.style.backgroundImage = `url("${nextImage}")`;
        window.requestAnimationFrame(() => bg.classList.remove('is-fading'));
      }, 280);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (reduceMotion || slides.length < 2) return;
      timer = window.setInterval(() => render(index + 1), 6000);
    };

    const go = (direction) => {
      stop();
      render(index + direction);
      start();
    };

    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    render(0, false);
    start();
  };

  const bindDynamicServiceRequestForm = () => {
    const form = document.querySelector('[data-service-request-form]');
    const catalogScript = document.getElementById('services-catalog-data');
    if (!form || !catalogScript) return;

    let catalog = null;
    try {
      catalog = JSON.parse(catalogScript.textContent || '{}');
    } catch (_error) {
      catalog = null;
    }
    if (!catalog || !Array.isArray(catalog.categories)) return;

    const select = form.querySelector('[data-service-select]');
    const categoryInput = form.querySelector('[data-service-category]');
    const descriptionField = form.querySelector('[data-service-description]');
    const docsField = form.querySelector('[data-service-documents]');
    const priceField = form.querySelector('[data-service-price]');
    const docsNote = form.querySelector('[data-docs-note]');
    const fileInputs = Array.from(form.querySelectorAll('[data-service-file]'));
    const sideTitle = document.querySelector('[data-service-title]');
    const sideSummary = document.querySelector('[data-service-summary]');
    const sidePrice = document.querySelector('[data-service-price-preview]');
    const sideDocs = document.querySelector('[data-service-docs-preview]');
    const defaultSummary = 'Choisissez un service pour afficher les details et les pieces a joindre.';
    const lockedService = form.dataset.lockService === '1';
    const query = new URLSearchParams(window.location.search);
    const queryCategory = String(query.get('categorie') || '').trim();

    if (!select || !descriptionField || !docsField || !priceField) return;

    const buildKey = (slug, name) => `${String(slug || '')}::${String(name || '').trim().toLowerCase()}`;
    const byKey = new Map();
    const byName = new Map();

    catalog.categories.forEach((category) => {
      const slug = String(category.slug || '');
      const label = String(category.label || slug);
      (Array.isArray(category.services) ? category.services : []).forEach((service) => {
        const name = String(service.name || service.title || '').trim();
        if (!name) return;

        const model = {
          name,
          slug,
          categoryLabel: label,
          description: String(service.description || '').trim(),
          price: String(service.price || '').trim(),
          documents: (Array.isArray(service.documents)
            ? service.documents
            : (typeof service.documents === 'string' ? service.documents.split(/\r?\n/) : [])
          ).map((item) => String(item || '').replace(/^[-*\s]+/, '').trim()).filter(Boolean),
        };

        byKey.set(buildKey(slug, name), model);
        if (!byName.has(name.toLowerCase())) {
          byName.set(name.toLowerCase(), model);
        }
      });
    });

    const applyService = (serviceName, categorySlug = '') => {
      const normalizedName = String(serviceName || '').trim().toLowerCase();
      if (!normalizedName) return;

      const selected = byKey.get(buildKey(categorySlug, serviceName)) || byName.get(normalizedName);
      if (!selected) return;

      descriptionField.value = selected.description;
      docsField.value = selected.documents.join('\n');
      priceField.value = selected.price || 'Tarif a confirmer';
      if (categoryInput) {
        categoryInput.value = selected.slug || categorySlug || '';
      }

      if (sideTitle) {
        sideTitle.textContent = selected.name;
      }
      if (sideSummary) {
        sideSummary.textContent = selected.description || defaultSummary;
      }
      if (sidePrice) {
        sidePrice.textContent = selected.price || 'A definir selon le service';
      }
      if (sideDocs) {
        sideDocs.textContent = selected.documents.length > 0 ? selected.documents.join(', ') : 'au moins un justificatif';
      }

      if (!lockedService) {
        const params = new URLSearchParams(window.location.search);
        params.set('service', selected.name);
        if (selected.slug) {
          params.set('categorie', selected.slug);
        }
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      }

      const requiredFiles = Math.max(1, Math.min(fileInputs.length, selected.documents.length || 1));
      fileInputs.forEach((input, index) => {
        input.required = index < requiredFiles;
      });

      if (docsNote) {
        docsNote.textContent = selected.documents.length > 0
          ? `Pieces attendues (${selected.documents.length}) : ${selected.documents.join(', ')}`
          : 'Ajoutez au minimum un justificatif.';
      }
    };

    if ((!select.value || !select.options[select.selectedIndex]) && queryCategory) {
      const firstInCategory = Array.from(select.options).find((opt) => String(opt.dataset.category || '') === queryCategory);
      if (firstInCategory) {
        select.value = firstInCategory.value;
      }
    }

    const syncFromSelect = () => {
      const option = select.options[select.selectedIndex];
      applyService(select.value, option?.dataset.category || '');
    };

    select.addEventListener('change', syncFromSelect);

    if (lockedService) {
      select.disabled = true;
      select.setAttribute('aria-disabled', 'true');
    }

    if (select.value) {
      syncFromSelect();
    }
  };
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -80px 0px' })
    : null;

  const revealAll = () => {
    document.querySelectorAll('.reveal').forEach((node) => {
      if (revealObserver) {
        revealObserver.observe(node);
      } else {
        node.classList.add('is-visible');
      }
    });
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (!drawer) return;
      if (drawer.hidden) openDrawer(); else closeDrawer();
    });
  }

  menuButtons.forEach((btn) => {
    btn.addEventListener('click', () => openMega(btn.dataset.menuGroup));
  });

  const openActiveMegaOnLoad = () => {
    if (!mega || window.matchMedia('(max-width: 1024px)').matches) return;
    const activeTrigger = menuButtons.find((btn) => btn.classList.contains('is-active'));
    if (activeTrigger?.dataset?.menuGroup) {
      openMega(activeTrigger.dataset.menuGroup);
    }
  };

  document.querySelectorAll('[data-drawer-close]').forEach((btn) => {
    btn.addEventListener('click', closeDrawer);
  });

  document.querySelectorAll('[data-mega-close]').forEach((btn) => {
    btn.addEventListener('click', closeMega);
  });

  document.addEventListener('click', (event) => {
    if (mega && !mega.hidden && !event.target.closest('.mega-menu') && !event.target.closest('[data-menu-group]')) {
      closeMega();
    }
    if (drawer && !drawer.hidden && !event.target.closest('.mobile-drawer-inner') && !event.target.closest('[data-menu-toggle]')) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMega();
      closeDrawer();
    }
  });

  document.querySelectorAll('[data-hero]').forEach(bindHeroBackground);
  bindDynamicServiceRequestForm();
  revealAll();
  if (window.location.search.includes('sent=1')) {
    showToast('Message envoye. Nous vous recontactons rapidement.');
  }

  window.addEventListener('scroll', () => {
    if (mega && !mega.hidden && window.scrollY > 100) {
      closeMega();
    }
  }, { passive: true });
})();
