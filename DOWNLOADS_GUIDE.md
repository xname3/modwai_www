# Download Section - Automatická OS detekcia

## Funkcie

### 1. Automatická detekcia operačného systému
Stránka automaticky detekuje OS návštevníka a zvýrazní správny download tlačidlo pomocou:
- 🎯 Gradient border
- 📍 "Recommended for your system" banner
- ✨ Jemné zväčšenie karty
- 💫 Zvýraznená shadow

### 2. Podporované platformy
- 🍎 **macOS** - `.dmg` installer (Apple Silicon & Intel)
- 🪟 **Windows** - `.exe` installer (64-bit)
- 🐧 **Linux DEB** - `.deb` package (Debian, Ubuntu, Mint)
- 🐧 **Linux RPM** - `.rpm` package (Fedora, RHEL, CentOS)

### 3. Detekčná logika

**macOS:**
- Platform obsahuje "mac" ALEBO
- User Agent obsahuje "macintosh"

**Windows:**
- Platform obsahuje "win" ALEBO
- User Agent obsahuje "windows"

**Linux DEB (default):**
- Platform obsahuje "linux" A
- User Agent NEOBSAHUJE "fedora", "rhel", alebo "centos"

**Linux RPM:**
- Platform obsahuje "linux" A
- User Agent obsahuje "fedora", "rhel", alebo "centos"

## Testovanie

### Debug v Browser Console

Otvorte Developer Console (`F12` alebo `Cmd+Option+I`) a použite:

```javascript
// Zistiť detekovaný OS
debugDownloads()
// Výstup: { detectedOS: 'mac', userAgent: '...', platform: '...' }

// Manuálne nastaviť odporúčaný OS (pre testovanie)
setRecommendedOS('windows')  // Zvýrazní Windows
setRecommendedOS('mac')      // Zvýrazní macOS
setRecommendedOS('linux-deb') // Zvýrazní Linux DEB
setRecommendedOS('linux-rpm') // Zvýrazní Linux RPM
```

### Test na rôznych platformách

**Chrome DevTools:**
1. Otvorte DevTools (`F12`)
2. Kliknite na "⋮" (tri bodky) → More tools → Network conditions
3. V sekcii "User agent" vyberte rôzne platformy
4. Refreshnite stránku

**Príklady User Agent stringov:**

```
# macOS
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36

# Windows
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

# Ubuntu (DEB)
Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36

# Fedora (RPM)
Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36
```

## Responzívnosť

### Desktop (>900px)
- 4 karty vedľa seba v grid
- Plný "Recommended" banner šikmo cez roh

### Tablet (640px - 900px)
- 2 karty vedľa seba
- Menší banner text

### Mobile (<640px)
- 1 karta na riadok
- Banner schovaný (namiesto neho border highlight)
- Jednoduchší border pre označenie

## Aktualizácia download linkov

Ak chcete zmeniť verziu alebo pridať nové platformy:

### 1. Upraviť HTML (`index.html`)

```html
<article class="download-card" data-os="PLATFORM_ID">
  <h3>Platform Name</h3>
  <p>Description</p>
  <a class="cta-button" href="DOWNLOAD_URL" download>
    Download text
  </a>
  <p class="download-note">Details</p>
</article>
```

**data-os hodnoty:**
- `mac` - macOS
- `windows` - Windows
- `linux-deb` - Linux DEB
- `linux-rpm` - Linux RPM

### 2. Upraviť detekciu (`app.js`)

Ak pridávate novú platformu, upravte funkciu `detectOS()`:

```javascript
function detectOS() {
  // ... existing code ...
  
  // Príklad: pridanie novej platformy
  else if (userAgent.includes('freebsd')) {
    return 'freebsd';
  }
  
  return null;
}
```

A pridajte do `setRecommendedOS()`:

```javascript
const validOS = ['mac', 'windows', 'linux-deb', 'linux-rpm', 'freebsd'];
```

## Štýlovanie

Všetky štýly sú v `styles.css`:

- `.download-section` - Sekcia s gradient pozadím
- `.download-grid` - Grid layout
- `.download-card` - Jednotlivé karty
- `.download-card.is-recommended` - Zvýraznená karta
- `.download-card::before` - Gradient border efekt
- `.download-card.is-recommended::after` - "Recommended" banner

## URL Pattern

Všetky download linky používajú GitHub Releases:

```
https://github.com/xname3/modwai_downloads/releases/...
```

**Latest release (auto-redirect):**
```
/releases/latest/download/FILENAME
```

**Specific version:**
```
/releases/download/v1.0.0/FILENAME
```

**Aktuálne súbory:**
- `MODWAI-Installer.dmg` (macOS)
- `MODWAI-Setup.exe` (Windows)
- `modwai_1.0.0_amd64.deb` (Linux DEB)
- `modwai-1.0.0-1.x86_64.rpm` (Linux RPM)

## Problémy a riešenia

### OS sa nezdetekoval správne
- Skontrolujte User Agent v konzole: `debugDownloads()`
- Možno je potrebné upraviť detekčnú logiku

### Banner sa neprekrýva správne
- Skontrolujte že karta má `position: relative`
- Banner používa `position: absolute` s rotation

### Na mobile je banner príliš veľký
- Je automaticky schovaný na <640px
- Namiesto neho sa používa border highlight

### Grid sa nezobrazuje správne
- Skontrolujte `grid-template-columns` v media queries
- Možno je potrebná minimálna šírka kariet
