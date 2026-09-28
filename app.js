(() => {
  // Navigation
  const NAV_OPEN_CLASS = 'is-open';
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav]');

  if (navToggle && navMenu) {
    const navLinks = navMenu.querySelectorAll('a');
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle(NAV_OPEN_CLASS);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        navLinks[0]?.focus();
      } else {
        navToggle.focus();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove(NAV_OPEN_CLASS);
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains(NAV_OPEN_CLASS)) {
        navMenu.classList.remove(NAV_OPEN_CLASS);
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
    navToggle.classList.add('is-enhanced');
    navMenu.classList.add('is-enhanced');
  }

  const yearTarget = document.getElementById('current-year');
  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  // Only suggest a desktop download when the browser identifies a desktop OS.
  function detectOS() {
    const navigator = window.navigator;
    const userAgent = (navigator.userAgent || '').toLowerCase();
    const platform = (navigator.platform || '').toLowerCase();
    const isMobile = navigator.userAgentData?.mobile ||
      /android|iphone|ipad|ipod|windows phone|iemobile|blackberry|mobile/.test(userAgent);
    // iPadOS may identify itself as macOS when requesting desktop websites.
    const isIPad = (platform.includes('mac') || userAgent.includes('macintosh')) &&
      navigator.maxTouchPoints > 1;

    if (isMobile || isIPad) return null;

    if (platform.includes('mac') || userAgent.includes('macintosh')) {
      return 'mac';
    } else if (platform.includes('win') || userAgent.includes('windows')) {
      return 'windows';
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'linux';
    }
    return null;
  }

  function highlightRecommendedDownload() {
    const detectedOS = detectOS();
    if (!detectedOS) {
      return;
    }

    const downloadCards = document.querySelectorAll('.download-card');
    downloadCards.forEach((card) => {
      if (card.dataset.os === detectedOS) {
        card.classList.add('is-recommended');
      }
    });
  }

  // Run OS detection when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightRecommendedDownload);
  } else {
    highlightRecommendedDownload();
  }

  // Screenshots remain readable in document order when JavaScript is unavailable.
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const buttons = Array.from(gallery.querySelectorAll('[data-gallery-tab]'));
    const panels = Array.from(gallery.querySelectorAll('[data-gallery-panel]'));
    const selectPanel = (value) => {
      if (!panels.some((panel) => panel.dataset.galleryPanel === value)) return;
      buttons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.galleryTab === value));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.galleryPanel !== value;
      });
    };
    const firstButton = buttons.find((button) =>
      panels.some((panel) => panel.dataset.galleryPanel === button.dataset.galleryTab)
    );
    if (!firstButton) return;
    buttons.forEach((button) => {
      button.addEventListener('click', () => selectPanel(button.dataset.galleryTab));
    });
    selectPanel(firstButton.dataset.galleryTab);
    gallery.classList.add('is-enhanced');
  });

  const isSandbox = (window.PADDLE_ENV || '').toLowerCase() === 'sandbox';
  const fallbackBaseUrl =
    window.PADDLE_CHECKOUT_BASE_URL ||
    (isSandbox
      ? 'https://sandbox-checkout.paddle.com/checkout/prices/'
      : 'https://buy.paddle.com/checkout/prices/');
  const successUrl = (() => {
    try {
      return new URL('checkout-success.html', window.location.href).toString();
    } catch (error) {
      console.warn('Unable to resolve success URL automatically.', error);
      return `${window.location.origin}/checkout-success.html`;
    }
  })();
  let paddleInitialized = false;
  let priceCache = {};
  let currentBillingMode = 'monthly';
  let billingRevision = 0;

  function ensureCheckoutUrl(element, priceId) {
    if (!element) {
      return;
    }
    if (!priceId) {
      element.dataset.priceId = '';
      element.removeAttribute('href');
      element.removeAttribute('target');
      element.removeAttribute('rel');
      return;
    }
    element.dataset.priceId = priceId;
    element.setAttribute('href', `${fallbackBaseUrl}${priceId}?guest=1`);
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noreferrer noopener');
  }

  function fallbackPriceLabel(card, billingMode) {
    const label = (card.dataset[`${billingMode}Label`] || '').trim();
    return label && !/^loading\b/i.test(label) ? label : 'See price at checkout';
  }

  function applyBillingMode(mode) {
    const billingMode = mode === 'annual' ? 'annual' : 'monthly';
    currentBillingMode = billingMode;
    const revision = ++billingRevision;
    document.documentElement.setAttribute('data-billing', billingMode);

    document.querySelectorAll('[data-billing-option]').forEach((button) => {
      const isActive = button.dataset.billingOption === billingMode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    document.querySelectorAll('[data-plan-card]').forEach(async (card) => {
      const sandboxPriceId = card.dataset[`${billingMode}SandboxId`];
      const priceId = isSandbox ? sandboxPriceId : card.dataset[`${billingMode}Id`];
      const priceLabel = card.querySelector('[data-price-label]');
      const billingCopy = card.querySelector('[data-billing-copy]');
      const button = card.querySelector('.checkout-btn');
      if (!button) {
        return;
      }

      const missingSandboxId = isSandbox && !sandboxPriceId;
      button.classList.toggle('is-disabled', missingSandboxId);
      if (missingSandboxId) {
        button.setAttribute('aria-disabled', 'true');
        ensureCheckoutUrl(button, null);
        if (priceLabel) {
          priceLabel.textContent = 'Sandbox price ID not configured';
        }
        if (billingCopy) {
          billingCopy.textContent = 'Add your Paddle sandbox price IDs in index.html';
        }
        button.textContent = 'Configure sandbox price ID';
        return;
      }

      button.removeAttribute('aria-disabled');
      ensureCheckoutUrl(button, priceId);

      // Keep useful checkout guidance visible even if the preview never returns.
      if (priceLabel) {
        priceLabel.textContent = fallbackPriceLabel(card, billingMode);
      }

      // Fetch and display actual price
      const priceData = await fetchPrice(priceId);
      // A slower response for a previous selection must not change the price
      // displayed next to the checkout ID for the current selection.
      if (revision !== billingRevision || button.dataset.priceId !== priceId) {
        return;
      }
      if (priceData && priceLabel) {
        priceLabel.textContent = formatPriceDisplay(priceData);
      } else if (priceLabel) {
        priceLabel.textContent = fallbackPriceLabel(card, billingMode);
      }

      if (billingCopy) {
        const copy = billingCopy.dataset[`${billingMode}Copy`];
        if (copy) {
          billingCopy.textContent = copy;
        }
      }

      const cta = card.dataset[`${billingMode}Cta`];
      if (cta) {
        button.textContent = cta;
      }
    });
  }

  const billingToggle = document.querySelector('[data-billing-toggle]');
  if (billingToggle) {
    billingToggle.addEventListener('click', (event) => {
      const target = event.target.closest('[data-billing-option]');
      if (!target) {
        return;
      }
      applyBillingMode(target.dataset.billingOption);
    });
  }

  function initPaddle() {
    if (paddleInitialized) {
      return true;
    }

    if (!window.Paddle || !window.PADDLE_CLIENT_TOKEN) {
      return false;
    }

    try {
      if (window.PADDLE_ENV) {
        window.Paddle.Environment.set(window.PADDLE_ENV);
      }
      window.Paddle.Initialize({ token: window.PADDLE_CLIENT_TOKEN });
      paddleInitialized = true;
      return true;
    } catch (error) {
      console.warn('Paddle initialization failed. Falling back to hosted checkout.', error);
      return false;
    }
  }

  async function fetchPrice(priceId) {
    if (!priceId) {
      return null;
    }

    if (priceCache[priceId]) {
      return priceCache[priceId];
    }

    if (!initPaddle()) {
      return null;
    }

    try {
      const result = await window.Paddle.PricePreview({
        items: [{ priceId, quantity: 1 }]
      });

      if (result && result.data && result.data.details && result.data.details.lineItems) {
        const lineItem = result.data.details.lineItems[0];
        if (lineItem) {
          const priceData = {
            amount: lineItem.formattedTotals.total,
            currency: result.data.currencyCode,
            interval: lineItem.price.billingCycle?.interval || 'month',
            intervalCount: lineItem.price.billingCycle?.frequency || 1
          };
          priceCache[priceId] = priceData;
          return priceData;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch price for ${priceId}:`, error);
    }

    return null;
  }

  function formatPriceDisplay(priceData) {
    if (!priceData) {
      return 'Loading...';
    }

    const { amount, interval, intervalCount } = priceData;
    const period = intervalCount > 1 
      ? `every ${intervalCount} ${interval}s` 
      : `per ${interval}`;
    
    return `${amount} ${period}`;
  }

  const checkoutButtons = document.querySelectorAll('.checkout-btn');
  checkoutButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.classList.contains('is-disabled')) {
        event.preventDefault();
        return;
      }
      const priceId = button.dataset.priceId;
      if (!priceId) {
        return;
      }

      const ready = initPaddle();
      if (!ready) {
        return;
      }

      event.preventDefault();
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl,
        },
        customData: {
          plan: button.dataset.plan || '',
        },
      });
    });
  });

  // Wait for Paddle SDK to load before initializing prices
  function initializePrices(attempt = 0) {
    if (!document.querySelectorAll('[data-plan-card]').length) {
      return;
    }
    if (initPaddle()) {
      applyBillingMode(currentBillingMode);
    } else {
      // Configure hosted checkout links even if the SDK cannot load.
      if (attempt === 0) applyBillingMode(currentBillingMode);
      if (attempt < 30) setTimeout(() => initializePrices(attempt + 1), 100);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializePrices());
  } else {
    initializePrices();
  }

})();
