# Search visibility

The public canonical host is **https://www.modwai.eu/**, matching `CNAME` and the live redirect from `https://modwai.eu/` verified on 28 September 2026. Keep this host consistent in canonical links, the sitemap, social metadata and structured data.

## Included in the site

- A descriptive homepage title and description use the product's actual scope: Oracle database monitoring, SQL tools and execution plans on macOS, Windows and Linux.
- Each public content page has its own canonical URL. The homepage canonical is `/`, including when opened through `/index.html`.
- `sitemap.xml` lists the homepage and the three policy pages. Add new public content pages when they are published. Optional modification dates are omitted rather than guessed.
- `robots.txt` permits crawling and points to the sitemap. The checkout confirmation page has `noindex, follow` and is excluded from the sitemap. Keep it crawlable so search engines can read its `noindex` directive.
- Homepage JSON-LD identifies the website and MODWAI organization. It contains no ratings, reviews, prices or claims about search result enhancements.
- Open Graph and Twitter metadata provide a title, description and real application screenshot for shared homepage links. This supports link previews; it is not a ranking guarantee.

## After publishing

1. Check that `https://www.modwai.eu/`, `/robots.txt`, `/sitemap.xml` and the image referenced in social metadata return HTTP 200. Confirm the apex domain still redirects to `www` and HTTPS is enforced.
2. Open [Google Search Console](https://search.google.com/search-console). Use an existing verified property if available, or add a domain property for `modwai.eu` and complete DNS verification with the domain owner. No placeholder verification token is included in the site.
3. Submit `https://www.modwai.eu/sitemap.xml` in the property's Sitemaps report.
4. Inspect the homepage with URL Inspection, check Google's selected canonical and request indexing after deployment. Check Page indexing and sitemap errors as Google recrawls the site.
5. Use the Performance report to compare impressions, clicks and actual search queries over time. Indexing and rankings are determined by search engines; these changes do not guarantee either.

Further content should answer real product questions with verified examples, such as inspecting an Oracle execution plan or configuring a server-side Data Pump export. Publish a dedicated page only when there is enough useful material; avoid repeated keyword pages and unsupported comparisons.

Local previews cannot verify production indexing, Search Console ownership or how Google will display a result. Search Console setup and sitemap submission are account-side steps and have not been performed by these repository changes.

## References

- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: exclude a page using noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: site names and WebSite structured data](https://developers.google.com/search/docs/appearance/site-names)
- [Google: verify site ownership](https://support.google.com/webmasters/answer/9008080)
