const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');

function element(dataset = {}) {
  const classes = new Set();
  return {
    dataset, attrs: {}, listeners: {}, hidden: false, focused: false,
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
      toggle(name) {
        if (classes.has(name)) { classes.delete(name); return false; }
        classes.add(name); return true;
      }
    },
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
    click() { this.listeners.click?.({ target: this }); },
    focus() { this.focused = true; }
  };
}

function fixture(navigator = {}) {
  const downloads = ['mac', 'windows', 'linux'].map((os) => element({ os }));
  const navToggle = element();
  const navMenu = element();
  const navLinks = [element(), element()];
  navMenu.querySelectorAll = () => navLinks;
  const values = ['sessions', 'plans', 'datapump'];
  const galleryButtons = values.map((galleryTab) => element({ galleryTab }));
  const galleryPanels = values.map((galleryPanel) => element({ galleryPanel }));
  const gallery = element();
  gallery.querySelectorAll = (selector) => selector === '[data-gallery-tab]' ? galleryButtons : galleryPanels;
  const documentListeners = {};
  const document = {
    readyState: 'complete',
    documentElement: { setAttribute() {} },
    getElementById() { return null; },
    addEventListener(name, callback) { documentListeners[name] = callback; },
    querySelector(selector) { return { '[data-nav-toggle]': navToggle, '[data-nav]': navMenu }[selector] || null; },
    querySelectorAll(selector) {
      return { '.download-card': downloads, '[data-gallery]': [gallery] }[selector] || [];
    }
  };
  const window = {
    navigator,
    location: { href: 'https://offline.example/#download', origin: 'https://offline.example', hash: '#download' }
  };
  const timers = [];
  vm.runInNewContext(source, { window, document, URL, console, setTimeout(callback) { timers.push(callback); } });
  return {
    window, timers, downloads, navToggle, navMenu, navLinks, gallery, galleryButtons, galleryPanels,
    escape() { documentListeners.keydown({ key: 'Escape' }); }
  };
}

const browsers = [
  ['macOS', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform: 'MacIntel' }, 'mac'],
  ['Windows', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32' }, 'windows'],
  ['touchscreen Windows', { platform: 'Win32', maxTouchPoints: 10 }, 'windows'],
  ['Linux', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', platform: 'Linux x86_64' }, 'linux'],
  ['Fedora', { userAgent: 'Mozilla/5.0 (X11; Fedora; Linux x86_64)', platform: 'Linux x86_64' }, 'linux'],
  ['Android', { userAgent: 'Mozilla/5.0 (Linux; Android 15)', platform: 'Linux armv8l' }, null],
  ['iPhone', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X)', platform: 'iPhone' }, null],
  ['iPad', { userAgent: 'Mozilla/5.0 (iPad; CPU OS like Mac OS X)', platform: 'iPad' }, null],
  ['iPad in desktop mode', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform: 'MacIntel', maxTouchPoints: 5 }, null],
  ['mobile client hints', { platform: 'Linux', userAgentData: { mobile: true } }, null],
  ['unknown browser', {}, null]
];

for (const [name, navigator, expected] of browsers) {
  test(`${name} gets the appropriate desktop download suggestion`, () => {
    const page = fixture(navigator);
    const recommended = page.downloads.filter((card) => card.classList.contains('is-recommended'));
    assert.deepEqual(recommended.map((card) => card.dataset.os), expected ? [expected] : []);
    assert.equal(page.timers.length, 0, 'download selection does not schedule an automatic scroll');
    assert.equal(page.window.debugDownloads, undefined);
    assert.equal(page.window.setRecommendedOS, undefined);
  });
}

test('gallery buttons select one screenshot panel and expose their pressed state', () => {
  const page = fixture();
  assert.equal(page.gallery.classList.contains('is-enhanced'), true);
  assert.deepEqual(page.galleryPanels.map((panel) => panel.hidden), [false, true, true]);
  assert.deepEqual(page.galleryButtons.map((button) => button.attrs['aria-pressed']), ['true', 'false', 'false']);
  page.galleryButtons[2].click();
  assert.deepEqual(page.galleryPanels.map((panel) => panel.hidden), [true, true, false]);
  assert.deepEqual(page.galleryButtons.map((button) => button.attrs['aria-pressed']), ['false', 'false', 'true']);
  page.galleryButtons[1].click();
  assert.deepEqual(page.galleryPanels.map((panel) => panel.hidden), [true, false, true]);
});

test('Escape closes an open navigation menu and returns focus to its toggle', () => {
  const page = fixture();
  page.escape();
  assert.equal(page.navToggle.focused, false, 'a closed menu must not steal focus');
  page.navToggle.click();
  assert.equal(page.navMenu.classList.contains('is-open'), true);
  assert.equal(page.navToggle.attrs['aria-expanded'], 'true');
  page.escape();
  assert.equal(page.navMenu.classList.contains('is-open'), false);
  assert.equal(page.navToggle.attrs['aria-expanded'], 'false');
  assert.equal(page.navToggle.focused, true);
});

test('enhanced navigation moves focus into its links when opened', () => {
  const page = fixture();
  assert.equal(page.navToggle.classList.contains('is-enhanced'), true);
  assert.equal(page.navMenu.classList.contains('is-enhanced'), true);
  assert.equal(page.navLinks[0].focused, false);
  page.navToggle.click();
  assert.equal(page.navLinks[0].focused, true);
  assert.equal(page.navLinks[1].focused, false);
  page.navToggle.click();
  assert.equal(page.navMenu.classList.contains('is-open'), false);
  assert.equal(page.navToggle.attrs['aria-expanded'], 'false');
  assert.equal(page.navToggle.focused, true);
});
