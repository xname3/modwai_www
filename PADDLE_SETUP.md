# Paddle Integrácia - Návod na dokončenie nastavenia

## Problémy, ktoré boli opravené:
✅ Pridaná konfigurácia pre `PADDLE_CLIENT_TOKEN` v index.html
✅ Opravené mapovanie Price IDs pre všetky tri plány
✅ Opravené Price ID v hero sekcii
✅ **Pridané automatické načítanie a zobrazovanie cien priamo na stránke**
✅ **Integrácia s Paddle Price Preview API**

## Ako to teraz funguje:

### Zobrazovanie cien
Stránka teraz automaticky:
1. Načíta Paddle SDK
2. Zavolá Paddle Price Preview API pre každý plán
3. Zobrazí skutočnú cenu (napr. "$49.00 per month") priamo na stránke
4. Prepočíta ceny pri prepínaní medzi mesačným a ročným plánením

Používatelia vidia ceny **pred** kliknutím na tlačidlo!

## Čo ešte MUSÍTE urobiť:

### 1. Overte Client Token
Váš súčasný token v `index.html`:
```javascript
window.PADDLE_CLIENT_TOKEN = 'test_52351ca5e1e64a70da83880cea8';
```

Uistite sa, že tento token je platný v [Paddle Sandbox Dashboard](https://sandbox-vendors.paddle.com/).

### 2. Overte Price IDs v Paddle Dashboard
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

Skontrolujte v [Paddle Sandbox → Products & Prices](https://sandbox-vendors.paddle.com/products), že:
- Tieto Price IDs existujú a sú aktívne
- Majú nastavené ceny (amount)
- Majú správne nastavený billing interval (month/year)

### 3. Testovanie zobrazenia cien
Po otvorení stránky by ste mali vidieť:
1. Najprv text "Loading..." v každej cenovej karte
2. Po pár sekundách sa načítajú skutočné ceny (napr. "$49.00 per month")
3. Pri prepnutí na "Annual", ceny sa automaticky aktualizujú na ročné verzie
4. Kliknutie na tlačidlo otvorí Paddle checkout overlay s danou cenou

**Riešenie problémov:**
- Ak vidíte "Loading..." dlhšie ako 5 sekúnd → skontrolujte Console v Developer Tools
- Ak vidíte chybu "Invalid client token" → token nie je platný, vygenerujte nový
- Ak vidíte "Price not found" → Price ID neexistuje v Paddle alebo nie je aktívne

### 4. Pre produkciu
Keď prejdete z sandboxu do produkcie:
1. Zmeňte `window.PADDLE_ENV = 'sandbox'` na `window.PADDLE_ENV = 'production'`
2. Nahraďte `window.PADDLE_CLIENT_TOKEN` produkčným tokenom (začína s `live_...`)
3. Nahraďte všetky `data-monthly-id` a `data-annual-id` produkčnými Price IDs

## Prečo to nefungovalo predtým:
1. **Chýbal Client Token** - Paddle SDK sa nemohol inicializovať
2. **Neboli zobrazené ceny** - Používali sa len statické texty namiesto skutočných cien z API
3. **Nesprávne Price ID** - URL ktoré ste poslali malo ID z inej karty

## Technické detaily implementácie:
- **Paddle.PricePreview API** - Načítava ceny bez potreby plnej checkout session
- **Async/await** - Asynchrónne volania API pre plynulé UX
- **Price caching** - Ceny sa cachujú aby sa nemuseli načítavať opakovane
- **Fallback mechanizmus** - Ak API zlyhá, zobrazí sa pôvodný label text

## Potrebujete pomoc?
- [Paddle Documentation](https://developer.paddle.com/getting-started/intro)
- [Paddle Sandbox Testing Guide](https://developer.paddle.com/concepts/sell/test-mode)
