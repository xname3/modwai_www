# Paddle Integrácia - Návod na dokončenie nastavenia

## Problémy, ktoré boli opravené:
✅ Pridaná konfigurácia pre `PADDLE_CLIENT_TOKEN` v index.html
✅ Opravené mapovanie Price IDs pre všetky tri plány
✅ Opravené Price ID v hero sekcii

## Čo ešte MUSÍTE urobiť:

### 1. Získajte Paddle Sandbox Client Token
1. Prihláste sa do [Paddle Sandbox Dashboard](https://sandbox-vendors.paddle.com/)
2. Choďte do **Developer Tools** → **Authentication**
3. Vytvorte nový **Client-side token** (ak ešte nemáte)
4. Skopírujte token (začína s `test_...`)

### 2. Aktualizujte index.html
Otvorte `index.html` a nahraďte riadok:
```javascript
window.PADDLE_CLIENT_TOKEN = 'test_YOUR_SANDBOX_CLIENT_TOKEN_HERE';
```

Vaším skutočným sandbox client tokenom, napríklad:
```javascript
window.PADDLE_CLIENT_TOKEN = 'test_1234567890abcdef';
```

### 3. Overte Price IDs v Paddle Dashboard
V súčasnosti máte tieto sandbox Price IDs:

**Observability Starter:**
- Monthly: `pri_01k8dxd4qvr1wnrd1c34dhbh5y`
- Annual: `pri_01k8e7g8bgwzn80gjaakfgabfe`

**Operations Growth:**
- Monthly: `pri_01k8dxeca4wc8dwndkvaxk1xtq`
- Annual: `pri_01k8e7hqxbc8expmheydy3p8tv`

**Enterprise Guard:**
- Monthly: `pri_01k8dxk5e3nsnq9zeatcxtjy4n`
- Annual: `pri_01k8e7kh6g9acdtr82pczkm414`

Skontrolujte v [Paddle Sandbox → Products & Prices](https://sandbox-vendors.paddle.com/products), že tieto IDs existujú a sú správne nastavené.

### 4. Testovanie
Po pridaní client tokenu:
1. Otvorte stránku v prehliadači
2. Ceny by sa mali správne načítať
3. Kliknutie na "Choose Growth plan" alebo iné tlačidlo by malo otvoriť Paddle checkout overlay
4. Checkout by mal fungovať bez "Page Not Found" chyby

### 5. Pre produkciu
Keď prejdete z sandboxu do produkcie:
1. Zmeňte `window.PADDLE_ENV = 'sandbox'` na `window.PADDLE_ENV = 'production'`
2. Nahraďte `window.PADDLE_CLIENT_TOKEN` produkčným tokenom (začína s `live_...`)
3. Nahraďte všetky `data-monthly-id` a `data-annual-id` produkčnými Price IDs

## Prečo to nefungovalo predtým:
1. **Chýbal Client Token** - Paddle SDK sa nemohol inicializovať
2. **Prázdne data-monthly-id** - Pri sandbox móde kód hľadal sandbox IDs, ale pri zmene na produkciu by našiel prázdne hodnoty
3. **Nesprávne Price ID** - URL ktoré ste poslali malo ID z inej karty

## Potrebujete pomoc?
- [Paddle Documentation](https://developer.paddle.com/getting-started/intro)
- [Paddle Sandbox Testing Guide](https://developer.paddle.com/concepts/sell/test-mode)
