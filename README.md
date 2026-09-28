# MODWAI website

Static product website for the MODWAI Oracle desktop application. Plain HTML,
CSS and JavaScript, with a dark graphite and blue visual theme; no build step or package installation is required.

## Local preview

```sh
cd modwai_www
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. Stop the server with Ctrl+C. The landing page skips
Google Analytics on localhost. Paddle may still request current price previews;
a local preview does not place an order. To preview without external requests,
block them in your browser; pricing then reads “See price at checkout”.

## Structure

- `index.html`: product overview, application gallery, administration tools,
  optional AI, downloads, monthly subscriptions and FAQ.
- `styles.css`: responsive layout, reduced-motion support and shared styles for
  the legal and checkout confirmation pages.
- `app.js`: mobile navigation, screenshot selection, desktop OS suggestion,
  Paddle price previews and checkout.
- `assets/workspace-*.png`: application captures with example/test data, labelled
  as such on the page. These are not generated UI mockups.
- `DOWNLOADS_GUIDE.md`: release assets and Linux launch instructions.
- `SEO_GUIDE.md`: canonical host, metadata, sitemap and post-publish Search Console steps.
- `robots.txt`, `sitemap.xml`: crawler discovery; the checkout confirmation is excluded from search.

## Checks

```sh
node --test tests/*.test.js
git diff --check
```

The dependency-free Node tests cover OS detection (including mobile and iPad),
gallery state, keyboard navigation, price preview failures and billing response
ordering. Visual checks should include desktop and mobile widths, all gallery
views, FAQ, Linux instructions, and the shared legal/confirmation pages.

Without JavaScript, all gallery screenshots remain visible, FAQs and installation
instructions work, and checkout links still point to the configured monthly plans.

The gallery shows full application windows (2400 × 1800): instance dashboard,
SQL worksheet with an estimated plan, diagnostic graphs, and health checks.
Images retain their full aspect ratio and link to the original PNG. Only the
first image loads eagerly. Preserve the example-data captions when replacing
captures; show real widgets and avoid exposing account or database identifiers.

## Pricing and checkout

The existing production Paddle client-side configuration and product price IDs are
preserved in `index.html`. Price previews come from Paddle; amounts are not
hardcoded. If the SDK or price request is unavailable, the page links to checkout
and states “See price at checkout”. The final amount and taxes appear there.

Only monthly billing is exposed. Do not enable an annual selector without
configuring and verifying separate annual production price IDs. Production annual
attributes currently mirror the monthly IDs, as in the previous website.

The Paddle client token is a public frontend token, not a server API key. Never
put a Paddle server API key into this repository. Hosted checkout fallback uses
`https://buy.paddle.com/checkout/prices/<priceId>?guest=1`; the SDK opens its overlay
when available. The success URL is resolved relative to the current page.

## Publishing

The site is suitable for the existing GitHub Pages setup, with `CNAME` preserved.
Local edits and a running preview do not publish the site. Verify the currently
available release and subscription entitlements before publishing copy changes.
