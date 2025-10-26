# Test Paddle Price Display

## Ako otestovať:

1. **Otvorte index.html v prehliadači**
   ```bash
   open index.html
   # alebo použite Live Server extension vo VS Code
   ```

2. **Otvorte Developer Console** (F12 alebo Cmd+Option+I)

3. **Sledujte Console výpis:**
   - Uvidíte či sa Paddle SDK úspešne inicializoval
   - Uvidíte prípadné chyby pri načítavaní cien

4. **Čo by ste mali vidieť na stránke:**
   ```
   Observability Starter
   $49.00 per month          ← Toto je skutočná cena z Paddle API
   Cancel anytime.
   
   Operations Growth  
   $99.00 per month          ← Toto je skutočná cena z Paddle API
   Monthly flexibility for dynamic teams.
   
   Enterprise Guard
   $299.00 per month         ← Toto je skutočná cena z Paddle API
   Dedicated success architect included.
   ```

5. **Test prepínania Monthly/Annual:**
   - Kliknite na "Annual · Save more"
   - Ceny by sa mali aktualizovať na ročné verzie
   - Napríklad: "$490.00 per year" (ak máte 10% zľavu na ročné predplatné)

## Možné chyby a riešenia:

### Error: "Paddle is not defined"
**Problém:** Paddle SDK sa nenačítal
**Riešenie:** Počkajte pár sekúnd, script sa načítava async

### Error: "Invalid authentication token"
**Problém:** Client token nie je platný
**Riešenie:** 
1. Choďte na https://sandbox-vendors.paddle.com/
2. Developer Tools → Authentication
3. Vytvorte nový Client-side token
4. Aktualizujte `window.PADDLE_CLIENT_TOKEN` v index.html

### Ceny sa nezobrazia (ostane "Loading...")
**Problém:** Price IDs neexistujú alebo nie sú aktívne
**Riešenie:**
1. Choďte na https://sandbox-vendors.paddle.com/products
2. Overte že všetky Price IDs existujú a majú nastavené ceny
3. Skontrolujte že sú v stave "Active"

### Console error: "Failed to fetch price for pri_xxx"
**Problém:** Konkrétne Price ID neexistuje alebo nemá nastavený price
**Riešenie:**
1. Overte Price ID v Paddle Dashboard
2. Ak neexistuje, vytvorte ho alebo aktualizujte ID v index.html

## Debug príkazy pre Console:

Otvorte Console a skúste:

```javascript
// Manuálny test načítania ceny
window.Paddle.PricePreview({
  items: [{ priceId: 'pri_01k8dxeca4wc8dwndkvaxk1xtq', quantity: 1 }]
}).then(result => console.log('Price data:', result));

// Zistite či je Paddle inicializované
console.log('Paddle loaded:', typeof window.Paddle !== 'undefined');
console.log('Environment:', window.PADDLE_ENV);
console.log('Token set:', !!window.PADDLE_CLIENT_TOKEN);
```

## Očakávaný výstup z Price Preview API:

```json
{
  "data": {
    "details": {
      "lineItems": [{
        "formattedTotals": {
          "total": "$99.00"
        },
        "price": {
          "billingCycle": {
            "interval": "month",
            "frequency": 1
          }
        }
      }]
    },
    "currencyCode": "USD"
  }
}
```

## Keď všetko funguje:

✅ Ceny sa zobrazia do 2-3 sekúnd po načítaní stránky
✅ Prepínanie Monthly/Annual správne aktualizuje ceny
✅ Kliknutie na tlačidlo otvorí Paddle checkout overlay
✅ V Console nie sú žiadne červené chyby

Ak vidíte všetko vyššie, integrácia funguje správne! 🎉
