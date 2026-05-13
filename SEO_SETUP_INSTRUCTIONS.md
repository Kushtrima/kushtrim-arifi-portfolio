# SEO Setup & Maintenance Guide — kushtrimarifi.com

**Last full SEO pass:** 2026-05-13 (URL restructure to `/work/` subdirectory included)

## 🆕 URL structure change (2026-05-13)

All 17 project detail pages have been moved from root-level to a `/work/` subdirectory:

| Old URL | New URL |
|---|---|
| `kushtrimarifi.com/cityhotel.html` | `kushtrimarifi.com/work/cityhotel.html` |
| `kushtrimarifi.com/hbs-website.html` | `kushtrimarifi.com/work/hbs-website.html` |
| `kushtrimarifi.com/spitex.html` | `kushtrimarifi.com/work/spitex.html` |
| ... (17 pages total) | |

**Permanent 301 redirects in `.htaccess`** automatically route any old URL to its new location, preserving any existing SEO authority and external links.

**After deploy, re-submit sitemap in GSC** so Google picks up the new URLs.

---


---

## ✅ What was done in this pass

### Critical fixes
- **Domain typo fix:** all references to `kushrimarifi.com` (missing the "t") corrected to `kushtrimarifi.com` across 20 HTML files + the SEO docs. This was the #1 cause of SEO invisibility.
- **Nav email fix:** changed from non-existent `info@kushrimarifi.com` to working `kushtrim.m.arifi@gmail.com`.
- **Dead social links removed:** 2 placeholder social icons removed from nav overlay (kept LinkedIn); dead Medium footer link removed across all pages.

### On-page SEO (all 20 pages)
- Unique `<title>` tags with keyword-front structure: `<topic + keywords> | Kushtrim Arifi`
- Unique meta descriptions (150-160 chars), bilingual EN/DE keywords ("UX Designer Schweiz", "Webdesigner Zürich", "Bauunternehmen Webdesign" etc.)
- Open Graph tags (title, description, type, url, image with width/height/alt, site_name, locale + de_CH alternate)
- Twitter Card tags (summary_large_image, full set)
- Self-referential canonical `<link>` per page
- Explicit `<meta name="robots">` directive
- Author + theme-color meta

### Structured data (JSON-LD)
- **Homepage:** ProfilePage + Person schema with knowsAbout, knowsLanguage, worksFor (MONUN AG), address (CH); WebSite schema
- **About:** AboutPage + Person + BreadcrumbList
- **Work:** CollectionPage + ItemList (all 10 main projects) + BreadcrumbList
- **Each project page:** CreativeWork schema + BreadcrumbList (Home → Work → Project)

### Heading hierarchy
- Homepage hero: 3 `<h1>` consolidated to 1 (`<h1 class="hero-title-section">` wrapping styled divs)
- About: added missing `<h1 class="about-title">About Kushtrim Arifi</h1>` (uses existing CSS)

### Performance
- Hero portrait `loading="lazy"` → `fetchpriority="high" decoding="async"` (LCP fix)
- `<link rel="preload">` for hero image on homepage
- `<link rel="preconnect">` for `googletagmanager.com` and `google-analytics.com` (with crossorigin)
- `<script src="script.js" defer>` on all pages

### Analytics
- Google Analytics (`G-YC4X711JLJ`) on all 20 pages (was only on 5)

### Sitemap / robots
- `sitemap.xml`: added missing cityhotel.html and hbs-website.html as priority 0.8; refreshed all lastmod dates; added image:image extension for each page's cover image; removed broken `etno.html` (see below)
- `robots.txt`: removed `Crawl-delay: 1` (Bing was throttling); added `Disallow: /work/resume/` so the PDF doesn't outrank the homepage

### Favicon / PWA
- `favicon.svg` (black rounded square with "[a]" wordmark)
- `favicon-32.png`, `apple-touch-icon.png` (180×180), `android-chrome-192.png`, `android-chrome-512.png`
- `site.webmanifest` (PWA-ready)
- Wired in every page's `<head>`

### Internal linking
- Prev/Next project pagination + "All Projects" link added before footer on every project detail page (17 pages chained)
- Pagination styles appended to `project.css`

### Image alt text
- Improved alt text on 21 image instances across homepage, about, work pages
- Format: `"Project Name — short descriptor with SEO-relevant words"`
- Decorative icons left with `alt=""` (correct usage)

### 404 page
- New `404.html` with `noindex, follow`, site nav, brand-consistent design

### Apache config
- `.htaccess` template with: HTTPS enforcement, non-www canonical redirect, GZIP/Brotli compression, 1-year image caching, security headers (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy), MIME types, blocked hidden files, X-Robots-Tag noindex on PDFs.
- **Upload `.htaccess` to root in cPanel.**

---

## ⚠️ Action required from you

### Immediate (before / during deploy)

1. **Verify Google Search Console property**
   - Visit https://search.google.com/search-console
   - **The verified property MUST be `kushtrimarifi.com` (with the `t`)** — not the typo version
   - If the property is wrong: add the correct domain, verify, and remove the old one
   - Re-submit `https://kushtrimarifi.com/sitemap.xml`
   - **Use URL Inspection → Request Indexing** on these top 5 pages right after deploy:
     - `/` (homepage)
     - `/work.html`
     - `/about.html`
     - `/cityhotel.html`
     - `/hbs-website.html`

2. **Bing Webmaster Tools** (free, often-forgotten — gives DuckDuckGo + Ecosia + Yahoo)
   - https://www.bing.com/webmasters
   - Add property, submit sitemap

3. **Decide what to do with `etno.html`**
   - Current state: its visible content is broken (shows "doratec" headings, links to dora-tec.ch, references Spitex healthcare). It's been **set to `noindex, nofollow` and removed from sitemap** as a safe fallback.
   - **Option A** — Delete the file entirely (cleanest)
   - **Option B** — Fix the content if it's a real project you want to show
   - The pagination chain has been routed to skip it (printing.html → cityhotel.html directly).

4. **Test rich results** after deploy:
   - https://search.google.com/test/rich-results — paste your URLs
   - Expect: Person, ProfilePage, CreativeWork, BreadcrumbList, ItemList rich snippets
   - https://www.linkedin.com/post-inspector/ — verify OG previews look right when shared

5. **Verify Google Analytics**: GA4 real-time view should show pageviews on every page now

---

### Soon (within a few weeks)

6. **Image optimization** (biggest remaining performance win)
   - Worst offenders (run through https://tinypng.com or https://squoosh.app):
     - `img/hero-banner.jpg` (888 KB → target 150 KB)
     - `work/cityhotel/city-6.jpg` (1.38 MB → target 200 KB)
     - `work/riesen/riesen6.jpg` (614 KB)
     - `work/soon-cover.jpg` (609 KB)
     - `img/letters.png` (271 KB — consider converting to SVG)
   - Better: convert all `.jpg` to `.webp` (50-70% smaller) using:
     ```bash
     # Install: brew install webp
     find work img -name "*.jpg" -exec sh -c 'cwebp -q 82 "$1" -o "${1%.jpg}.webp"' _ {} \;
     ```
   - Then add `<picture>` tags with WebP source + JPG fallback. Can be a follow-up task.

7. **Verify projects.json data** — some entries had thin descriptions ("Software application project for EN-NUR.", "Marketing agency website project."). The new meta descriptions are more substantive but please verify the SEO-friendly descriptions in each project page's `<head>` match reality.

8. **Project case-study text expansion** (optional but valuable)
   - Pages under 250 body words could use one more short paragraph each:
     - riesen.html (184), baren.html (190), stplaner.html (190), alba.html (193), doratec.html (222), mardal.html (225), hbs-website.html (226), monun.html (231)
   - Target: a short "Process" or "Outcome" paragraph (~80-100 words) per page in the existing `.project-description-text` block.

9. **Resume PDF**
   - Currently at `work/resume/resume-ka.pdf`. The robots.txt `Disallow` and the `.htaccess` `X-Robots-Tag` should keep it out of search results once `.htaccess` is uploaded.

---

## 🔧 Files added / modified

**New files (need to be uploaded):**
- `favicon.svg`
- `favicon-32.png`
- `apple-touch-icon.png`
- `android-chrome-192.png`
- `android-chrome-512.png`
- `site.webmanifest`
- `404.html`
- `.htaccess`

**Modified files (all 20):**
- All `*.html` files — new `<head>` blocks, nav fixes, footer fixes
- `sitemap.xml` — rebuilt
- `robots.txt` — tightened
- `project.css` — pagination styles appended

**Helper scripts (delete before deploy):**
- `_seo_build.py`
- `_alt_fix.py`
- `_pagination.py`

---

## 📊 Expected SEO impact

| Change | Time-to-effect | Impact |
|---|---|---|
| Domain typo fix (canonical now points to real domain) | 1-3 weeks | **Massive** — most likely the main fix |
| Meta descriptions on all 20 pages | 1-2 weeks | High — should fix the "high impressions, low clicks" pattern by giving Google real snippets to show |
| Structured data (rich results) | 2-6 weeks | High — better SERP appearance, breadcrumb display |
| Bilingual keywords (DE blends) | 1-3 months | Medium-high — unlocks Swiss/DACH market searches |
| Core Web Vitals improvements | 1-4 weeks | Medium — small ranking boost on mobile |
| Internal linking depth | 2-6 weeks | Medium — better PageRank distribution |
| Favicon | Immediate | Small — mobile SERP UX |
| 404 page | Immediate | Small — recovers lost traffic |

**You should start seeing improvement within ~2-3 weeks of deploy + Search Console resubmission**, with biggest gains showing at the 1-3 month mark as Google reprocesses the site under the corrected canonical signal.

---

## 🧪 Testing checklist after deploy

- [ ] Open `https://kushtrimarifi.com/` — homepage loads, favicon shows in tab
- [ ] Open `https://kushtrimarifi.com/sitemap.xml` — XML displays, all URLs use correct domain
- [ ] Open `https://kushtrimarifi.com/robots.txt` — shows `Sitemap: https://kushtrimarifi.com/sitemap.xml`
- [ ] Open a fake URL like `https://kushtrimarifi.com/nope.html` — custom 404 page shows
- [ ] Right-click → View Source on homepage — search for `kushtrimarifi.com` (should be many hits) and `kushrimarifi` (should be zero)
- [ ] Share `https://kushtrimarifi.com/cityhotel.html` in LinkedIn message — preview should show image + title
- [ ] Run https://pagespeed.web.dev — score should be 80+ on mobile
- [ ] Run https://search.google.com/test/rich-results — should detect Person, BreadcrumbList, CreativeWork
- [ ] GSC Real-time analytics should show your own visit on every page
- [ ] After 1 week: GSC → Coverage report should show 19 indexed pages (etno excluded)

---

**Questions or need adjustments?** Note in this doc and I can fix in the next pass.
