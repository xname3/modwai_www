// Run the real browser script offline with a deterministic Paddle SDK and DOM.
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
const settle = () => new Promise(setImmediate);

function fixture({ paddle, label, readyState = 'complete' } = {}) {
  const listeners = {};
  const buttonListeners = {};
  const documentListeners = {};
  const classes = { toggle() {}, contains() { return false; }, remove() {}, add() {} };
  const priceLabel = { textContent: '' };
  const billingCopy = {
    textContent: '',
    dataset: { monthlyCopy: 'MONTHLY billing', annualCopy: 'ANNUAL billing' }
  };
  const button = {
    textContent: '', dataset: {}, classList: classes, attrs: {},
    setAttribute(key, value) { this.attrs[key] = value; },
    removeAttribute(key) { delete this.attrs[key]; },
    addEventListener(name, callback) { buttonListeners[name] = callback; }
  };
  const card = {
    dataset: {
      monthlyId: 'monthly-price', annualId: 'annual-price',
      monthlyCta: 'MONTHLY CTA', annualCta: 'ANNUAL CTA',
      monthlyLabel: label, annualLabel: label
    },
    querySelector(selector) {
      return { '[data-price-label]': priceLabel, '[data-billing-copy]': billingCopy, '.checkout-btn': button }[selector];
    }
  };
  const toggle = { addEventListener(name, callback) { listeners[name] = callback; } };
  const document = {
    readyState,
    documentElement: { setAttribute() {} },
    getElementById() { return null; },
    addEventListener(name, callback) {
      (documentListeners[name] ||= []).push(callback);
    },
    querySelector(selector) { return selector === '[data-billing-toggle]' ? toggle : null; },
    querySelectorAll(selector) {
      return selector === '[data-plan-card]' ? [card] : selector === '.checkout-btn' ? [button] : [];
    }
  };
  const window = {
    navigator: { userAgent: 'test', platform: 'test' },
    location: { href: 'https://offline.example/index.html', origin: 'https://offline.example', hash: '' },
    PADDLE_CLIENT_TOKEN: 'fake', Paddle: paddle
  };
  vm.runInNewContext(source, { window, document, URL, console: { warn() {} }, setTimeout() {} });
  return {
    button, priceLabel, billingCopy,
    choose(mode) { listeners.click({ target: { closest() { return { dataset: { billingOption: mode } }; } } }); },
    clickCheckout(event) { buttonListeners.click(event); },
    domReady() { documentListeners.DOMContentLoaded.forEach((callback) => callback({ type: 'DOMContentLoaded' })); }
  };
}

function response(total, interval) {
  return {
    data: {
      currencyCode: 'EUR',
      details: { lineItems: [{ formattedTotals: { total }, price: { billingCycle: { interval, frequency: 1 } } }] }
    }
  };
}

test('the latest billing selection owns the displayed price and checkout link', async () => {
  const pending = {};
  const page = fixture({
    paddle: {
      Initialize() {},
      PricePreview({ items }) { return new Promise((resolve) => { pending[items[0].priceId] = resolve; }); }
    }
  });
  page.choose('annual');
  pending['annual-price'](response('100 EUR', 'year'));
  await settle();
  pending['monthly-price'](response('10 EUR', 'month'));
  await settle();
  assert.equal(page.button.dataset.priceId, 'annual-price');
  assert.equal(page.button.attrs.href, 'https://buy.paddle.com/checkout/prices/annual-price?guest=1');
  assert.equal(page.priceLabel.textContent, '100 EUR per year');
  assert.equal(page.billingCopy.textContent, 'ANNUAL billing');
  assert.equal(page.button.textContent, 'ANNUAL CTA');
});

for (const label of ['Loading...', 'Current price is shown at checkout']) {
  test(`a pending price preview keeps useful guidance for ${JSON.stringify(label)}`, async () => {
    let resolvePrice;
    const page = fixture({
      label,
      paddle: {
        Initialize() {},
        PricePreview() { return new Promise((resolve) => { resolvePrice = resolve; }); }
      }
    });
    assert.equal(page.priceLabel.textContent, label === 'Loading...' ? 'See price at checkout' : label);
    assert.equal(page.button.attrs.href, 'https://buy.paddle.com/checkout/prices/monthly-price?guest=1');
    resolvePrice(response('10 EUR', 'month'));
    await settle();
    assert.equal(page.priceLabel.textContent, '10 EUR per month');
  });
}

for (const label of [undefined, '', '  ', 'Loading...', 'Loading price…']) {
  test(`an unavailable SDK replaces placeholder ${JSON.stringify(label)} with checkout guidance`, async () => {
    const page = fixture({ label });
    await settle();
    assert.equal(page.priceLabel.textContent, 'See price at checkout');
    assert.equal(page.button.attrs.href, 'https://buy.paddle.com/checkout/prices/monthly-price?guest=1');
    assert.equal(page.button.attrs.rel, 'noreferrer noopener');
    let prevented = false;
    page.clickCheckout({ preventDefault() { prevented = true; } });
    assert.equal(prevented, false, 'the native hosted checkout link remains usable');
    page.choose('annual');
    await settle();
    assert.equal(page.priceLabel.textContent, 'See price at checkout');
    assert.equal(page.button.dataset.priceId, 'annual-price');
    assert.equal(page.billingCopy.textContent, 'ANNUAL billing');
  });
}

test('a failed price request preserves a meaningful configured fallback', async () => {
  const page = fixture({
    label: '  Current price is shown at checkout  ',
    paddle: { Initialize() {}, PricePreview() { return Promise.reject(new Error('Offline')); } }
  });
  await settle();
  assert.equal(page.priceLabel.textContent, 'Current price is shown at checkout');
  assert.equal(page.button.dataset.priceId, 'monthly-price');
});

test('DOMContentLoaded configures hosted checkout when the SDK is unavailable', async () => {
  const page = fixture({ readyState: 'loading' });
  page.domReady();
  await settle();
  assert.equal(page.priceLabel.textContent, 'See price at checkout');
  assert.equal(page.button.attrs.href, 'https://buy.paddle.com/checkout/prices/monthly-price?guest=1');
});
