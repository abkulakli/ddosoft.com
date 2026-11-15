# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DDOSoft is a static single-page landing website for a sustainable software consulting company. Built with pure HTML5/CSS3/Vanilla JavaScript — no build tools, no npm, no frameworks.

**Live site**: ddosoft.com (deployed via GitHub Pages)  
**Founder**: Dr. Ayşe Pınar KULAKLI — [LinkedIn](https://www.linkedin.com/in/apkulakli)  
**Contact**: info@ddosoft.com  
**LinkedIn**: [linkedin.com/company/ddosoft](https://www.linkedin.com/company/ddosoft)

### Products
- **Zekky** — casual math and reflex mobile game (Godot), playable free in the browser at [zekky.ddosoft.com](https://zekky.ddosoft.com) (an independent subdomain served from the DDOSoft cluster, not from this repo). English and Turkish, no ads, collects no data. Not in a store yet, so the homepage card links to the landing page and never promises an Android download.
- **Portfonio** (Beta) — Django app for Turkish mutual fund portfolio management (TEFAS data). [www.portfonio.com](https://www.portfonio.com).
- **SimItNow** (formerly SimIt, renamed 2026-08-25 to resolve a trademark conflict) — [www.simitnow.com](https://www.simitnow.com), an independent domain, not a ddosoft.com subdomain. The old `simit.ddosoft.com` still resolves for now but is no longer the canonical link.

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

**Validation**: `python3 scripts/validate-site.py` — stdlib only, no install. Checks HTML nesting, language-file validity, that every `data-lang-key` / `data-lang-href` exists in **both** language files, that relative links and assets resolve, that the Google tag is in every page, that no removed quantitative claim has crept back, and that the sitemap covers every top-level page and lists no page whose file is gone. Run it before pushing; it is the only safety net this repo has.

**Deployment**: `.github/workflows/deploy.yml` has two jobs. `validate` runs the script on pull requests and on `main`. `deploy` runs only on push to `main` (`if: github.event_name == 'push'`) because the `github-pages` environment rejects deployments from non-default branches — a deploy job triggered by a pull request fails at the environment gate before any step runs. `.nojekyll` prevents Jekyll processing. `CNAME` sets the custom domain.

## Git Workflow

The primary workspace stays checked out on `main` at all times. Never commit a change directly onto whatever branch happens to be checked out there — a stray commit can land on someone else's in-progress branch (e.g. one already carrying an unmerged commit from earlier work) and has to be reverted out again.

For any change, create a git worktree for it instead of `git checkout -b` in the main workspace. Commit inside that worktree, push it, and open a PR (`gh pr create`) once the change is ready — a pushed branch should never sit without a PR.

Only remove a worktree and delete its branch after the user explicitly confirms the PR merged (verify with `gh pr view <n>` rather than assuming). Then fast-forward the main workspace's `main` to pick up the merge.

## Architecture

### DRY Component System

Header and footer live **only** in `components/header.html` and `components/footer.html`. Every page uses placeholder divs:

```html
<div id="header-placeholder"></div>
<!-- page content -->
<div id="footer-placeholder"></div>
<script src="js/component-loader.js"></script>   <!-- must be first script -->
```

`js/component-loader.js` injects the components, then rewrites their links for the current page's depth. The prefix is computed from directory depth (`ComponentLoader.getPathPrefix()`), so it works at any nesting level — `dir/x.html` gets `../`, `dir/sub/x.html` gets `../../`. Never hardcode `../` against a specific directory.

Links in the components that point at another page (not a `#section`) need a `data-internal-link="<page>.html"` attribute carrying the root-relative path; the loader prefixes that value.

### Multilingual System (EN/TR)

Translations live in `lang/en.json` and `lang/tr.json`. Every visible text element carries a `data-lang-key` attribute:

```html
<h1 data-lang-key="hero.title"></h1>
```

`js/language-manager.js` handles detection (URL param `?lang=tr` → localStorage → browser lang → EN default), real-time switching without reload, and meta tag / `<html lang>` updates.

**Important:** If no `?lang=` param is present, `language-manager.js` immediately redirects to `?lang=en`. The bare URL `https://www.ddosoft.com/` never serves content directly. Always use `?lang=en` / `?lang=tr` in canonical URLs, sitemap `<loc>` values, OG URLs, and hreflang `href` attributes.

### Per-language pages (`data-page-lang`) — currently unused

The site has no articles. `language-manager.js` still supports a page that carries its prose directly in the HTML, one file per language, and declares `<html lang="tr" data-page-lang="tr">`. For such a page the manager **does not touch** title, description, canonical, OG tags or hreflang links, and only repoints the EN/TR buttons at the page's counterpart (read from the static hreflang alternates), so the page must hand-write its own canonical (with `?lang=`), reciprocal absolute `en` / `tr` / `x-default` alternates, title, description, OG and Twitter tags. `scripts/validate-site.py` has no check for such pages; add one if the mechanism is used again.

### Page Structure

- `index.html` — single-page: Hero · Services · Products · About · Contact
- There is no separate products page: the Products section of `index.html` holds one card per product (Zekky, Portfonio, SimItNow), and each card links straight to that product's own site. A new product is a new card. Any new page other than the homepage must declare `meta.pages.<page>.canonical` in the language files: a page with that key gets its own canonical, `og:url`, title and description at runtime, while a page without it inherits the homepage's.
- `components/` — shared header and footer (single source of truth)
- `lang/` — `en.json` and `tr.json`
- `js/` — component-loader, language-manager, main, structured-data-manager
- `css/styles.css` — single stylesheet, mobile-first, light theme with one dark surface (the hero protocol trace)

### Brand & Logo

`logo.png` — transparent PNG (354×240, trimmed to the wordmark), used in nav/footer and as the schema.org `logo`. Source of truth for the brand mark. Use absolute path `/logo.png` in components so it resolves correctly from both root and subdirectory pages.

Favicon set, all derived from the same artwork and referenced with absolute paths in every page `<head>`: `favicon.ico` (16/32/48), `icon-192.png`, `icon-512.png` (both transparent, also listed in `site.webmanifest`), `apple-touch-icon.png` (180×180, opaque on `#050d07` because iOS fills transparency with black). The logo must keep its alpha channel — a white-background export looks like a sticker on the tinted `--paper-2` sections.

### Design Tokens (css/styles.css)

| Token | Value | Use |
|-------|-------|-----|
| `--paper` / `--paper-2` | `#F4F6F3` / `#EAEFEC` | Page background / tinted sections (Products, Contact) |
| `--ink` / `--ink-2` | `#0E1F1A` / `#4A5B55` | Text / secondary text |
| `--line` | `#D5DDD8` | Hairlines between rows |
| `--signal` / `--signal-ink` | `#0A7F59` / `#076646` | Buttons, links, badges (both pass 4.5:1 on `--paper`) |
| `--console-*` | `#0B1713` base | The only dark surface: the OCPP trace in the hero |
| `--font` | Schibsted Grotesk | Everything except protocol text |
| `--mono` | IBM Plex Mono | Protocol trace and small technical tags only |

Layout rules: left-aligned, no cards, no all-caps labels, no numbered markers, no emoji icons; each section has its own structure (ruled service rows, horizontal product rows, two-column about, one large email link). The only non-user-triggered motion is the hero trace revealing once on load (CSS only, off under `prefers-reduced-motion`). The trace frames are valid OCPP 1.6 CALL/CALLRESULT messages; keep them valid when editing, and keep `<wbr>` after commas so lines wrap there instead of mid-word.

### SEO

`sitemap.xml` lists all live pages with `hreflang` entries. **Update it whenever pages are added or removed.**

`js/structured-data-manager.js` injects JSON-LD schema.org markup dynamically. It bootstraps off the `languageApplied` event that `language-manager.js` dispatches once translations are loaded — not a timer — because it reads its field values out of the language data.

**Homepage metadata has two sources that drift apart.** The static `<head>` in `index.html` is what crawlers that skip JavaScript see; for pages without `data-page-lang` `language-manager.js` overwrites title, description, canonical, OG and Twitter tags at runtime from `meta.*` in `lang/en.json` / `lang/tr.json`. Change both when touching either. `sitemap.xml` lists only `www.ddosoft.com` URLs (never another host).

`scripts/validate-site.py` does not fetch absolute URLs. After touching canonical, `og:image`, `twitter:image`, the schema `logo` or the sitemap, run `curl -s -o /dev/null -w '%{http_code}'` on each one (200 expected). The only preview image is the square `icon-512.png`, so `twitter:card` is `summary`; going back to `summary_large_image` needs a 1200×630 image.

Content policy: no performance or savings figure goes into any page of the site unless a measurement backs it and the methodology is stated. Test counts and coverage percentages are kept qualitative, because they drift with every commit and the site cannot be updated per commit.

### Analytics

The Google tag (`G-R6E0SJZXT0`) is pasted as the first thing in every page's `<head>`, components excluded. It is per page rather than a shared script because there is no build step and a shared file would delay it. A new page must carry it too; `scripts/validate-site.py` fails any page missing it or carrying it twice. The site has no cookie-consent banner, unlike the other DDOSoft apps (portfonio, simitnow), which load the tag only after consent.

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
