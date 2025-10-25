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

    document.querySelectorAll('[data-plan-card]').forEach((card) => {
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

      const label = card.dataset[`${billingMode}Label`];
      if (label && priceLabel) {
        priceLabel.textContent = label;
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

  applyBillingMode('monthly');
})();
