# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DDOSoft is a static single-page landing website for a sustainable software consulting company. Built with pure HTML5/CSS3/Vanilla JavaScript — no build tools, no npm, no frameworks.

**Live site**: ddosoft.com (deployed via GitHub Pages)  
**Founder**: Ayşe Pınar KULAKLI — [LinkedIn](https://www.linkedin.com/in/apkulakli)  
**Contact**: info@ddosoft.com  
**LinkedIn**: [linkedin.com/company/ddosoft](https://www.linkedin.com/company/ddosoft)

### Products
- **DDOGreen** v0.3.1 — cross-platform power management tool (C++20, Linux/Windows). 20–30% battery savings, zero config, 122 unit tests. [GitHub](https://github.com/abkulakli/ddogreen)
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

**Deployment**: Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages automatically. `.nojekyll` prevents Jekyll processing. `CNAME` sets the custom domain.

## Architecture

### DRY Component System

Header and footer live **only** in `components/header.html` and `components/footer.html`. Every page uses placeholder divs:

```html
<div id="header-placeholder"></div>
<!-- page content -->
<div id="footer-placeholder"></div>
<script src="js/component-loader.js"></script>   <!-- must be first script -->
```

`js/component-loader.js` resolves relative paths for root vs. subdirectory pages then injects the components. For `/articles/` pages it prepends `../` to all internal links.

### Multilingual System (EN/TR)

Translations live in `lang/en.json` and `lang/tr.json`. Every visible text element carries a `data-lang-key` attribute:

```html
<h1 data-lang-key="hero.title"></h1>
```

`js/language-manager.js` handles detection (URL param `?lang=tr` → localStorage → browser lang → EN default), real-time switching without reload, and meta tag / `<html lang>` updates.

### Page Structure

- `index.html` — single-page: Hero · About · Services · Products · Contact
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

`js/structured-data-manager.js` injects JSON-LD schema.org markup dynamically.

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
