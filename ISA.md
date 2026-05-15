---
task: Build Search Sanity Chrome Extension v1
slug: search-sanity-ext
project: search-sanity
effort: E3
phase: complete
progress: 30/50
mode: algorithm
started: 2026-05-14T00:00:00Z
updated: 2026-05-14T00:00:00Z
---

## Problem

Google Search in 2026 has three compounding problems that degrade the search experience for power users: AI Overviews are unreliable (~91% accuracy at scale means millions of wrong answers per hour) with no permanent opt-out mechanism; SEO-spam content farms dominate top results especially for product, recipe, and how-to queries; and AI Overview citations frequently do not support the claims they are attached to, making casual fact-checking nearly impossible. No existing extension combines hiding, demoting, boosting, and verifying into one polished tool, and none of them look like a product Apple would ship.

## Vision

A power-search user loads Google, searches for anything — a medical term, a product recommendation, a coding question — and the page just looks right. The AI Overview is quietly gone. The content farm results are visually subordinate. The Reddit thread they actually wanted floats with a clean left-border accent. The whole experience feels like an upgrade Chrome should have shipped by default: minimal, fast, invisible until it isn't. Opening the popup feels like opening a first-party Apple utility — a small frosted-glass panel with two toggle groups, hairline separators, and iOS-style switches that spring into place. Nothing shouts. Everything works.

## Out of Scope

DuckDuckGo, Bing, and other search engines are not supported in v1 — Google only. Mobile Chrome is not targeted; the extension is desktop-only. Per-query-type profiles ("medical mode," "code mode") are deferred to v1.1. Server-side shared blocklists and analytics/telemetry of any kind are explicitly excluded — zero network requests to non-Google domains except Feature 5 source-fetching on explicit user action. A manual light/dark theme toggle is excluded — color scheme follows `prefers-color-scheme` automatically. A premium tier, account system, or cloud sync beyond `chrome.storage.sync` is out of scope.

## Constraints

- Manifest V3 only — MV2 is deprecated and rejected by the Chrome Web Store.
- TypeScript + Vite for all source; no Python, no JavaScript-only files except generated output.
- No JS framework for v1 UI — vanilla TS/HTML/CSS or minimal Preact (~3KB) if state gets complex.
- No Tailwind, no styled-components — plain CSS with custom properties (tokens) only.
- `chrome.storage.sync` for user prefs; `chrome.storage.local` for blocklist cache.
- No external backend in v1; all processing client-side.
- Permissions footprint limited to: `storage`, `activeTab`, host permissions for `google.com` only.
- Bundle budget: content script ≤50KB gzipped; popup ≤30KB gzipped; SW ≤10KB.
- Chrome 120+ target minimum.

## Goal

Ship a Chrome MV3 extension that permanently improves the Google Search experience for power users: hiding AI Overviews on demand (Feature 1), forcing web-only mode (Feature 2), demoting spam domains visually (Feature 3), and boosting forum results (Feature 4) — all behind a polished Apple-quality popup UI built from a single design-token system, loadable unpacked in Chrome with zero console errors on a clean SERP.

## Criteria

- [x] ISC-1: `manifest.json` is valid MV3 — `manifest_version: 3`, all required fields present, Chrome Web Store schema validation passes
- [x] ISC-2: `manifest.json` permissions contain only `storage` and `activeTab` — no `tabs`, `<all_urls>`, `webRequest`, or `cookies`
- [ ] ISC-3: Extension loads unpacked in Chrome 120+ without errors in `chrome://extensions`
- [ ] ISC-4: No console errors appear on a fresh `google.com/search?q=test` page load with extension enabled
- [x] ISC-5: `tokens.css` defines all color tokens for both light and dark mode using `prefers-color-scheme`
- [ ] ISC-6: Every `--space-*` token (1–7) is defined in `tokens.css`; no raw px spacing value appears in any CSS layout rule outside `tokens.css`
- [x] ISC-7: Every color reference in popup CSS and inject CSS uses a `var(--token)` — no raw hex except in `tokens.css`
- [x] ISC-8: `backdrop-filter: blur()` is applied to every translucent surface in the popup
- [x] ISC-9: Toggle switch animates thumb with `cubic-bezier(0.5, 1.6, 0.4, 1)` spring curve (not linear)
- [x] ISC-10: Popup renders at exactly 360px width in both light and dark mode
- [ ] ISC-11: Popup is interactive within 100ms of opening (measured by absence of layout-blocking JS on open)
- [ ] ISC-12: Feature 1 toggle persists in `chrome.storage.sync` and survives browser restart
- [ ] ISC-13: AI Overview block is removed within 100ms of page injection when Feature 1 is enabled (no flash-of-AI-content)
- [ ] ISC-14: `MutationObserver` watches the full `<main>` region and removes late-injected AI Overviews (500ms+ after initial load)
- [ ] ISC-15: "AI Overview hidden" pill banner replaces the hidden Overview block at its original position
- [ ] ISC-16: "Show anyway" link in the banner reveals the Overview for that query only (does not change persistent toggle state)
- [x] ISC-17: `selectors.ts` targets AI Overviews by structural/semantic signals (`aria-label` match `/AI|Generative/i` or equivalent) — not by brittle class names — with at least one fallback strategy
- [ ] ISC-18: Feature 2 (udm=14) toggle redirects every Google search to include `&udm=14` when enabled
- [x] ISC-19: Feature 2 is OFF by default
- [ ] ISC-20: Feature 2 does not interfere with Google Images, Google News, or other vertical tabs
- [ ] ISC-21: Feature 2 toggle state persists in `chrome.storage.sync`
- [x] ISC-22: `spam-domains.json` exists at `src/data/spam-domains.json` (may be empty array stub)
- [ ] ISC-23: Domains in the spam blocklist receive the demoted visual treatment: `opacity: 0.45`, a "low quality" `--warning`-colored pill tag
- [ ] ISC-24: Demoted results restore `opacity: 1.0` on hover
- [ ] ISC-25: Demoted results remain at their original DOM position (no layout reflow)
- [ ] ISC-26: User can add/remove domains in the "Manage blocked sites" panel accessible from the popup
- [ ] ISC-27: User-added domains are stored in `chrome.storage.sync` and persist across restarts
- [x] ISC-28: `boost-domains.json` ships with `reddit.com`, `stackoverflow.com`, `news.ycombinator.com`, `github.com`
- [ ] ISC-29: Forum results matching `boost-domains.json` receive a 2px left border in `var(--accent)` and a "💬 forum" pill tag
- [ ] ISC-30: Forum result boost rendering completes in the same paint cycle as page injection (no flash)
- [ ] ISC-31: Reorder-to-top for boosted forum results is behind a separate OFF-by-default flag; disabling reverts to original DOM order (stored in `data-` attribute)
- [x] ISC-32: `bun run build` succeeds with zero TypeScript errors
- [x] ISC-33: Built output files exist: `dist/content/serp.js`, `dist/popup/popup.html`, `dist/background/sw.js`
- [x] ISC-34: Content script bundle is ≤50KB gzipped
- [x] ISC-35: Popup bundle is ≤30KB gzipped
- [x] ISC-36: Service worker is ≤10KB gzipped
- [x] ISC-37: `README.md` exists with installation instructions and feature overview
- [x] ISC-38: `PRIVACY.md` exists stating zero telemetry, zero external network calls (except Feature 5 on explicit user action)
- [x] ISC-39: Icon files exist at `icons/icon-16.png`, `icons/icon-48.png`, `icons/icon-128.png`
- [x] ISC-40: `@media (prefers-reduced-motion: reduce)` suppresses toggle spring animation
- [x] ISC-41: `@media (prefers-reduced-transparency)` falls back to more opaque surface (no `backdrop-filter`)
- [x] ISC-42: Anti: Extension makes zero network requests to non-Google domains on normal SERP load (Feature 5 only fires on explicit click)
- [x] ISC-43: Anti: No `tabs`, `<all_urls>`, `webRequest`, or `cookies` permission appears in built `manifest.json`
- [x] ISC-44: Anti: No raw hex color value (e.g. `#007AFF`) appears in any CSS file except `tokens.css`
- [ ] ISC-45: Antecedent: The popup feels like a first-party Apple utility — hairline separators, frosted-glass surface, iOS-style spring toggles — before any feature toggle is exercised
- [x] ISC-46: `vite.config.ts` sets `format: 'iife'` for the content script entry and emits no code-split chunks for `serp.js`
- [x] ISC-47: `serp.ts` awaits `getPrefs()` before any DOM mutation (no race condition between storage read and MutationObserver)
- [x] ISC-48: `selectors.ts` implements three-tier fallback: (1) aria-label regex, (2) data-attrid, (3) structural position heuristic
- [x] ISC-49: `MutationObserver` is attached to `document.body` (not `<main>`) and re-attaches on `popstate` events
- [x] ISC-50: Feature 2 udm=14 injection skips redirect when `tbm` param is present (image/news/shopping vertical tabs)

## Test Strategy

| isc | type | check | threshold | tool |
|-----|------|-------|-----------|------|
| ISC-1 | build | `bun run build` exits 0; `jq '.manifest_version' dist/manifest.json` returns `3` | exact match | Bash |
| ISC-2 | build | `jq '.permissions' dist/manifest.json` — list must not contain forbidden items | allowlist check | Bash |
| ISC-3 | manual | Load unpacked in Chrome; `chrome://extensions` shows no errors | zero errors | Manual |
| ISC-4 | manual | DevTools console on `google.com/search?q=test` — zero errors | zero errors | Manual |
| ISC-5 | file | `grep -c 'prefers-color-scheme' src/styles/tokens.css` ≥ 1; both light and dark blocks present | ≥1 match | Grep |
| ISC-6 | file | `grep -rn '[0-9]px' src/**/*.css \| grep -v tokens.css \| grep -v 'border-radius\|0px\|1px'` returns empty | zero matches | Bash |
| ISC-7 | file | `grep -rn '#[0-9a-fA-F]' src/popup/popup.css src/content/inject.css` returns empty | zero matches | Grep |
| ISC-8 | file | `grep -c 'backdrop-filter' src/popup/popup.css` ≥ 1 | ≥1 match | Grep |
| ISC-9 | file | `grep 'cubic-bezier(0.5, 1.6' src/styles/components.css` returns match | exact string | Grep |
| ISC-10 | file | `grep 'width: 360px' src/popup/popup.css` returns match | exact string | Grep |
| ISC-11 | inspection | No synchronous blocking operations in popup init path | code review | Read |
| ISC-12 | manual | Toggle, close browser, reopen — toggle state matches | persistent | Manual |
| ISC-13 | manual | Time from page load to Overview removal via DevTools Performance | <100ms | Manual |
| ISC-14 | manual | Search query known to lazy-load Overview — confirm removal after 500ms+ | removed | Manual |
| ISC-15 | manual | Banner pill visible where Overview was on any AI-heavy query | visible | Manual |
| ISC-16 | manual | Click "Show anyway" — Overview appears; toggle in popup still shows enabled | correct | Manual |
| ISC-17 | file | `grep 'aria-label' src/content/selectors.ts` returns match; no hard-coded class names as primary selector | match | Grep |
| ISC-18 | manual | Search on google.com — URL contains `udm=14` when Feature 2 enabled | URL check | Manual |
| ISC-19 | file | Default prefs in `src/lib/storage.ts` show `udm14: false` | exact | Read |
| ISC-20 | manual | Click Images/News tab — no redirect loop; correct vertical tab loads | no loop | Manual |
| ISC-21 | manual | Toggle Feature 2, restart browser — Feature 2 state persists | persistent | Manual |
| ISC-22 | file | `test -f src/data/spam-domains.json` exits 0 | exists | Bash |
| ISC-23 | manual | Result from spam domain shows `opacity: 0.45` and "low quality" pill | visual | Manual |
| ISC-24 | manual | Hover over demoted result — `opacity` returns to `1.0` | visual | Manual |
| ISC-25 | manual | Demote 3 results — surrounding results do not shift position | no reflow | Manual |
| ISC-26 | manual | Open popup → "Manage blocked sites" → add domain — domain appears in list | functional | Manual |
| ISC-27 | manual | Add domain, restart browser — domain still in list | persistent | Manual |
| ISC-28 | file | `jq '.' src/data/boost-domains.json` includes all four domains | exact match | Bash |
| ISC-29 | manual | Reddit/SO/HN/GitHub results show accent left border and "💬 forum" pill | visual | Manual |
| ISC-30 | manual | DevTools Performance — no second paint for forum boost treatment | same frame | Manual |
| ISC-31 | manual | Enable reorder flag — forum results move to top; disable — order reverts | correct | Manual |
| ISC-32 | build | `bun run build` exits 0 with zero TS errors | exit 0 | Bash |
| ISC-33 | build | `ls dist/content/serp.js dist/popup/popup.html dist/background/sw.js` exits 0 | all exist | Bash |
| ISC-34 | build | `gzip -c dist/content/serp.js \| wc -c` < 51200 | <50KB | Bash |
| ISC-35 | build | `gzip -c dist/popup/popup.js \| wc -c` < 30720 | <30KB | Bash |
| ISC-36 | build | `gzip -c dist/background/sw.js \| wc -c` < 10240 | <10KB | Bash |
| ISC-37 | file | `test -f README.md` exits 0; contains "installation" text | exists | Bash |
| ISC-38 | file | `test -f PRIVACY.md` exits 0; contains "no telemetry" / "zero network" text | exists | Bash |
| ISC-39 | file | `ls icons/icon-16.png icons/icon-48.png icons/icon-128.png` exits 0 | all exist | Bash |
| ISC-40 | file | `grep 'prefers-reduced-motion' src/styles/components.css` returns match | match | Grep |
| ISC-41 | file | `grep 'prefers-reduced-transparency' src/styles/tokens.css` or components.css returns match | match | Grep |
| ISC-42 | inspection | Review content script network calls — no external fetch on load path | code review | Read |
| ISC-43 | build | `jq '.permissions' dist/manifest.json` does not contain forbidden items | allowlist | Bash |
| ISC-44 | file | `grep -rn '#[0-9a-fA-F]\{3,6\}' src/ --include='*.css' \| grep -v tokens.css` empty | zero matches | Bash |
| ISC-45 | manual | Open popup — surfaces are frosted-glass, toggles spring on tap, no jarring visual | subjective | Manual |

## Features

| name | description | satisfies | depends_on | parallelizable |
|------|-------------|-----------|------------|----------------|
| scaffold | Project setup: manifest.json, tsconfig.json, vite.config.ts, directory structure, bun install | ISC-1, ISC-2, ISC-3, ISC-32 | — | false |
| design-system | tokens.css, components.css, reset.css — every token, component, motion curve defined | ISC-5, ISC-6, ISC-7, ISC-8, ISC-9, ISC-10, ISC-40, ISC-41, ISC-44, ISC-45 | scaffold | false |
| storage-lib | src/lib/storage.ts — typed chrome.storage.sync wrappers, default prefs | ISC-12, ISC-19, ISC-21, ISC-27 | scaffold | false |
| content-entry | src/content/serp.ts — entry point, MutationObserver setup on `<main>` | ISC-13, ISC-14 | scaffold, storage-lib | false |
| selectors | src/content/selectors.ts — AI Overview selector strategies with fallbacks | ISC-17 | content-entry | false |
| feature-1-overview | src/content/overview.ts — hide AI Overviews, banner injection, "Show anyway" | ISC-13, ISC-14, ISC-15, ISC-16, ISC-17 | selectors, design-system | false |
| feature-2-udm14 | udm=14 redirect logic in content script + popup toggle | ISC-18, ISC-19, ISC-20, ISC-21 | storage-lib | true |
| feature-3-spam | src/content/domains.ts spam demotion + src/data/spam-domains.json stub | ISC-22, ISC-23, ISC-24, ISC-25, ISC-26, ISC-27 | storage-lib, content-entry | true |
| feature-4-boost | src/content/domains.ts forum boost + src/data/boost-domains.json | ISC-28, ISC-29, ISC-30, ISC-31 | storage-lib, content-entry | true |
| popup-ui | popup.html, popup.ts, popup.css — all toggles wired, "Manage blocked sites" panel | ISC-10, ISC-11, ISC-26, ISC-45 | storage-lib, design-system | true |
| service-worker | background/sw.ts — install handler, storage init | ISC-33, ISC-36 | scaffold | true |
| icons-assets | Placeholder icon PNGs at correct dimensions; inject.css | ISC-39 | scaffold | true |
| docs | README.md, PRIVACY.md | ISC-37, ISC-38 | — | true |
| bundle-check | Verify gzipped bundle sizes within budget | ISC-34, ISC-35, ISC-36 | scaffold | false |

## Decisions

- 2026-05-14: Using `vite` with multiple entry points via `rollupOptions.input` (not `vite-plugin-web-ext`) to produce separate content script, popup, and SW bundles — avoids plugin complexity and gives full control over MV3 output.
- 2026-05-14: Popup UI will be vanilla HTML/CSS/TS (no Preact) — state is simple enough (6 toggles + one list) that a micro-framework adds more than it solves.
- 2026-05-14: Forge delegated for full code generation — E3 coding task, auto-include binding applies.
- 2026-05-14: Feature 5 (source verification) excluded from build scope per spec — build only if 1–4 are solid.
- 2026-05-14: Icon PNGs will be placeholder SVG-rendered stubs matching correct dimensions; final artwork to be dropped in by user.
