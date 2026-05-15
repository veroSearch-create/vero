type SelectorStrategy = () => Element | null;

/* Three-tier fallback for AI Overview detection */
const OVERVIEW_STRATEGIES: SelectorStrategy[] = [
  // Tier 1: aria-label semantic targeting (most stable across Google experiments)
  () => document.querySelector(
    '[aria-label*="Overview" i], [aria-label*="AI" i], [aria-label*="Generative" i], ' +
    '[aria-label*="Summary" i], [aria-label*="Search Labs" i]'
  ),
  // Tier 2: Google's internal data-attrid attribute system
  () => document.querySelector('[data-attrid*="ai" i], [data-attrid*="overview" i]'),
  // Tier 3: structural heuristic — first substantive block in main with a reveal button
  () => {
    const main = document.querySelector('main, #main, #rcnt, #center_col');
    if (!main) return null;
    for (const div of Array.from(main.querySelectorAll(':scope > div, :scope > div > div'))) {
      const hasButton = div.querySelector('button, [role="button"]') !== null;
      const text = div.textContent ?? '';
      if (
        hasButton &&
        text.length > 150 &&
        (text.toLowerCase().includes('ai') || text.toLowerCase().includes('overview'))
      ) {
        return div;
      }
    }
    return null;
  },
];

export function findOverviewElement(): Element | null {
  for (const strategy of OVERVIEW_STRATEGIES) {
    try {
      const el = strategy();
      if (el) return el;
    } catch {
      // Strategy threw (e.g. unsupported selector) — try next
    }
  }
  return null;
}

/* Result block selectors — most specific first */
const RESULT_SELECTORS = [
  'div.g',
  'div[data-sokoban-container]',
  'div[jscontroller][data-hveid]',
  'li.g',
];

export function findResultElements(): Element[] {
  const seen = new Set<Element>();
  const results: Element[] = [];
  for (const sel of RESULT_SELECTORS) {
    try {
      for (const el of Array.from(document.querySelectorAll(sel))) {
        if (!seen.has(el)) {
          seen.add(el);
          results.push(el);
        }
      }
    } catch {
      // Skip unsupported selectors
    }
  }
  return results;
}

export function extractDomain(result: Element): string | null {
  // Prefer cite element (Google's visible URL display)
  const cite = result.querySelector('cite, [data-dtld]');
  if (cite) {
    const text = (cite.textContent ?? '').trim();
    try {
      const url = text.startsWith('http') ? new URL(text) : new URL('https://' + text);
      return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch { /* fall through */ }
  }
  // Fallback: first external <a> href
  for (const a of Array.from(result.querySelectorAll('a[href]'))) {
    try {
      const url = new URL((a as HTMLAnchorElement).href);
      if (url.hostname && !url.hostname.includes('google.com') && url.protocol.startsWith('http')) {
        return url.hostname.replace(/^www\./, '').toLowerCase();
      }
    } catch { /* skip invalid */ }
  }
  return null;
}
