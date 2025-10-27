(() => {
  const NAV_OPEN_CLASS = 'is-open';
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle(NAV_OPEN_CLASS);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove(NAV_OPEN_CLASS);
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        navMenu.classList.remove(NAV_OPEN_CLASS);
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const yearTarget = document.getElementById('current-year');
  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  // OS Detection for download section
  function detectOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform.toLowerCase();
    
    if (platform.includes('mac') || userAgent.includes('macintosh')) {
      return 'mac';
    } else if (platform.includes('win') || userAgent.includes('windows')) {
      return 'windows';
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      // Try to detect which Linux distro (DEB vs RPM)
      // Default to DEB as it's more common
      if (userAgent.includes('fedora') || userAgent.includes('rhel') || userAgent.includes('centos')) {
        return 'linux-rpm';
      }
      return 'linux-deb';
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
        // Scroll into view if it's off screen (optional)
        if (window.location.hash === '#download') {
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    });
  }

  // Run OS detection when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightRecommendedDownload);
  } else {
    highlightRecommendedDownload();
  }

  // Debug function - accessible from browser console
  window.debugDownloads = function() {
    const detectedOS = detectOS();
    console.log('Detected OS:', detectedOS);
    console.log('User Agent:', navigator.userAgent);
    console.log('Platform:', navigator.platform);
    return {
      detectedOS,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  };

  // Manual OS override for testing - accessible from browser console
  window.setRecommendedOS = function(os) {
    const validOS = ['mac', 'windows', 'linux-deb', 'linux-rpm'];
    if (!validOS.includes(os)) {
      console.error(`Invalid OS. Use one of: ${validOS.join(', ')}`);
      return;
    }
    document.querySelectorAll('.download-card').forEach((card) => {
      card.classList.remove('is-recommended');
      if (card.dataset.os === os) {
        card.classList.add('is-recommended');
      }
    });
    console.log(`Recommended download set to: ${os}`);
  };

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

  function applyBillingMode(mode) {
    const billingMode = mode === 'annual' ? 'annual' : 'monthly';
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

      // Show loading state
      if (priceLabel) {
        priceLabel.textContent = 'Loading price...';
      }

      // Fetch and display actual price
      const priceData = await fetchPrice(priceId);
      if (priceData && priceLabel) {
        priceLabel.textContent = formatPriceDisplay(priceData);
      } else if (priceLabel) {
        // Fallback to label if price fetch fails
        const label = card.dataset[`${billingMode}Label`];
        if (label) {
          priceLabel.textContent = label;
        }
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
  function initializePrices() {
    if (initPaddle()) {
      applyBillingMode('monthly');
    } else {
      // Retry after a short delay if Paddle isn't ready yet
      setTimeout(initializePrices, 100);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePrices);
  } else {
    initializePrices();
  }
})();
