// Offline execution of actual app.js with deterministic fake Paddle SDK and DOM.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const pending = {};
const listeners = {};
const classes = {toggle(){},contains(){return false;},remove(){},add(){}};
const priceLabel = {textContent:''};
const billingCopy = {textContent:'',dataset:{monthlyCopy:'MONTHLY billing',annualCopy:'ANNUAL billing'}};
const button = {textContent:'',dataset:{},classList:classes,attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k]},addEventListener(){}};
const card = {dataset:{monthlyId:'monthly-price',annualId:'annual-price',monthlyCta:'MONTHLY CTA',annualCta:'ANNUAL CTA'},querySelector(selector){return {'[data-price-label]':priceLabel,'[data-billing-copy]':billingCopy,'.checkout-btn':button}[selector]}};
const toggle = {addEventListener(name,fn){listeners[name]=fn;}};
const document = {readyState:'complete',documentElement:{setAttribute(){}},getElementById(){return null;},querySelector(s){return s==='[data-billing-toggle]'?toggle:null;},querySelectorAll(s){return s==='[data-plan-card]'?[card]:(s==='.checkout-btn'?[button]:[]);}};
const window = {navigator:{userAgent:'test',platform:'test'},location:{href:'https://offline.example/index.html',origin:'https://offline.example',hash:''},PADDLE_CLIENT_TOKEN:'fake',Paddle:{Initialize(){},PricePreview({items}){return new Promise(resolve=>pending[items[0].priceId]=resolve)}}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),{window,document,URL,console,setTimeout(){}});
function response(total,interval){return {data:{currencyCode:'EUR',details:{lineItems:[{formattedTotals:{total},price:{billingCycle:{interval,frequency:1}}}]}}};}
async function main(){
  listeners.click({target:{closest(){return {dataset:{billingOption:'annual'}}}}});
  pending['annual-price'](response('100 EUR','year'));
  await new Promise(setImmediate);
  pending['monthly-price'](response('10 EUR','month'));
  await new Promise(setImmediate);
  assert.equal(button.dataset.priceId,'annual-price');
  assert.equal(priceLabel.textContent,'100 EUR per year');
  assert.equal(billingCopy.textContent,'ANNUAL billing');
  console.log('PASS latest billing selection owns displayed price and checkout:',JSON.stringify({checkoutPrice:button.dataset.priceId,shownPrice:priceLabel.textContent,billingCopy:billingCopy.textContent,cta:button.textContent}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
