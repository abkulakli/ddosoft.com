# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DDOSoft is a static single-page landing website for a sustainable software consulting company. Built with pure HTML5/CSS3/Vanilla JavaScript — no build tools, no npm, no frameworks.

**Live site**: ddosoft.com (deployed via GitHub Pages)  
**Founder**: Ayşe Pınar KULAKLI — [LinkedIn](https://www.linkedin.com/in/apkulakli)  
**Contact**: info@ddosoft.com  
**LinkedIn**: [linkedin.com/company/ddosoft](https://www.linkedin.com/company/ddosoft)

### Products
- **DDOGreen** v0.3.1 — cross-platform power management tool (C++20, Linux/Windows). Switches power modes from per-core load average with dual-threshold hysteresis; the package installs a working default config (0.70 / 0.30 / 30s). [GitHub](https://github.com/abkulakli/ddogreen)

  No battery-savings percentage is claimed anywhere on the site: nothing in the ddogreen repo measures one. Don't reintroduce a figure without a measurement and a stated methodology. Test counts and coverage percentages are likewise kept qualitative, because they drift with every commit and the site cannot be updated per commit.
- **Tefaster** (Beta) — Django app for Turkish mutual fund portfolio management (TEFAS data). [tefaster.ddosoft.com](https://tefaster.ddosoft.com)
- **SimIt** — [simit.ddosoft.com](https://simit.ddosoft.com)

### Services
Software consulting (OCPP 1.6, EV charging, AWS, embedded), digital transformation (cloud migration, CMMI), custom development (Python/Django, C++20, WebSocket protocols). 15+ years experience.

## Local Development

A local HTTP server is **required** — `fetch()` calls for JSON/HTML are blocked by CORS on `file://`.

```bash
python -m http.server 8000   # Python 3
npx http-server              # Node.js
php -S localhost:8000        # PHP
```

No install, build, or compile step. Changes are live on page refresh.

**Validation**: `python3 scripts/validate-site.py` — stdlib only, no install. Checks HTML nesting, language-file validity, that every `data-lang-key` / `data-lang-href` exists in **both** language files, that relative links and assets resolve, that article pages carry complete and reciprocal SEO metadata with exactly one `Article` schema, that article prose is present in the HTML rather than injected, and that the sitemap covers every article. Run it before pushing; it is the only safety net this repo has.

**Deployment**: `.github/workflows/deploy.yml` has two jobs. `validate` runs the script on pull requests and on `main`. `deploy` runs only on push to `main` (`if: github.event_name == 'push'`) because the `github-pages` environment rejects deployments from non-default branches — a deploy job triggered by a pull request fails at the environment gate before any step runs. `.nojekyll` prevents Jekyll processing. `CNAME` sets the custom domain.

## Architecture

### DRY Component System

Header and footer live **only** in `components/header.html` and `components/footer.html`. Every page uses placeholder divs:

```html
<div id="header-placeholder"></div>
<!-- page content -->
<div id="footer-placeholder"></div>
<script src="js/component-loader.js"></script>   <!-- must be first script -->
```

`js/component-loader.js` injects the components, then rewrites their links for the current page's depth. The prefix is computed from directory depth (`ComponentLoader.getPathPrefix()`), so it works at any nesting level — `articles/x.html` gets `../`, `articles/tr/x.html` gets `../../`. Never hardcode `../` against a specific directory.

Links in the components that point at another page (not a `#section`) need a `data-internal-link="articles.html"` attribute carrying the root-relative path; the loader prefixes that value.

### Multilingual System (EN/TR)

Translations live in `lang/en.json` and `lang/tr.json`. Every visible text element carries a `data-lang-key` attribute:

```html
<h1 data-lang-key="hero.title"></h1>
```

`js/language-manager.js` handles detection (URL param `?lang=tr` → localStorage → browser lang → EN default), real-time switching without reload, and meta tag / `<html lang>` updates.

**Important:** If no `?lang=` param is present, `language-manager.js` immediately redirects to `?lang=en`. The bare URL `https://www.ddosoft.com/` never serves content directly. Always use `?lang=en` / `?lang=tr` in canonical URLs, sitemap `<loc>` values, OG URLs, and hreflang `href` attributes.

Elements whose `href` differs per language (article links) use `data-lang-href="articles.recent.0.link"` instead of hardcoding a path.

### Article Pages — the one exception to `data-lang-key`

Article pages carry their prose **directly in the HTML**, one file per language, and declare their language on the root element:

```html
<html lang="tr" data-page-lang="tr">
```

Why: crawlers that don't run JavaScript — LinkedIn, X and Slack link previews in particular — must see the article text, and each language needs its own URL for a clean hreflang pair. Turkish articles also get Turkish slugs, which matters for Turkish queries.

When `data-page-lang` is present, `language-manager.js` **does not touch** the page's title, description, canonical, OG tags or hreflang links — the page owns them. It only translates the header and footer, and repoints the EN/TR buttons at the page's counterpart (read from the static hreflang alternates). So an article page must hand-write:

- `<link rel="canonical">` pointing at itself with `?lang=`
- three `<link rel="alternate">` entries: `en`, `tr`, `x-default` — absolute URLs, reciprocal between the pair
- its own `<title>`, description, OG and Twitter tags
- an inline `Article` JSON-LD block (`structured-data-manager.js` skips its own Article generation when it finds one)

Header, footer and every other page keep using `data-lang-key` as normal.

### Page Structure

- `index.html` — single-page: Hero · About · Services · Products · Articles · Contact
- `articles.html` — article index, uses the normal `?lang=` mechanism
- `articles/*.html` — English articles; `articles/tr/*.html` — Turkish articles
- `components/` — shared header and footer (single source of truth)
- `lang/` — `en.json` and `tr.json`
- `js/` — component-loader, language-manager, main, structured-data-manager
- `css/styles.css` — single stylesheet, BEM-style, mobile-first, dark theme

### Brand & Logo

`logo.png` — transparent PNG, white background removed. Used as favicon and in nav/footer. Source of truth for the brand mark. Use absolute path `/logo.png` in components so it resolves correctly from both root and subdirectory pages.

### Design Tokens (css/styles.css)

| Token | Value | Use |
|-------|-------|-----|
| `--bg-0` | `#050d07` | Page background |
| `--accent` | `#00e87a` | Primary green accent |
| `--text-0` | `#e6f2ea` | Primary text |
| `--font-display` | Fraunces | Headings |
| `--font-body` | Plus Jakarta Sans | Body text |

### SEO

`sitemap.xml` lists all live pages with `hreflang` entries. **Update it whenever pages are added or removed.**

`js/structured-data-manager.js` injects JSON-LD schema.org markup dynamically. It bootstraps off the `languageApplied` event that `language-manager.js` dispatches once translations are loaded — not a timer — because it reads its field values out of the language data.

Content policy for articles: no performance or savings figure goes into an article unless a measurement backs it and the article shows the methodology. Product marketing copy on the homepage is a separate decision from what an engineering article asserts.

## Quality Targets

- **Performance**: FCP < 1.5s, LCP < 2.5s, CLS < 0.1, total page < 2MB
- **Accessibility**: WCAG 2.1 AA — semantic HTML, ARIA labels, keyboard navigation, screen reader support
- **Browser support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Responsive**: mobile-first, tested at 320px / 768px / 1024px+

## Key Standards

- **DRY**: Never hardcode nav, footer, or contact info. Use the component system.
- **Translations**: All visible text needs a `data-lang-key` and entries in both JSON files.
- **No frameworks**: Vanilla JS only. No jQuery, no npm packages.
- **CSS**: Keep BEM class naming. Add `-webkit-` prefixes before unprefixed vendor properties.
- **Images**: Use absolute paths (`/logo.png`) in shared components to work from any page depth.
