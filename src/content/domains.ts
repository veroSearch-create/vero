import type { Prefs } from '../lib/storage';
import { findResultElements, extractDomain } from './selectors';

const TREATED_ATTR = 'data-ss-treated';

/* Single DOM pass for both spam demotion and forum boost */
export function applyDomainTreatments(
  prefs: Prefs,
  spamDomains: string[],
  boostDomains: string[]
): void {
  const allSpam = [...spamDomains, ...prefs.userBlocklist];
  const allBoost = [...boostDomains, ...prefs.userBoostlist];
  const results = findResultElements();

  for (const result of results) {
    if (result.getAttribute(TREATED_ATTR)) continue;

    const domain = extractDomain(result);
    if (!domain) continue;

    if (prefs.demoteSpam && matchesDomain(domain, allSpam)) {
      demoteResult(result);
      result.setAttribute(TREATED_ATTR, 'spam');
    } else if (prefs.boostForums && matchesDomain(domain, allBoost)) {
      boostResult(result, prefs.reorderForums);
      result.setAttribute(TREATED_ATTR, 'forum');
    }
  }

  if (prefs.reorderForums) reorderBoostedResults();
}

export function clearDomainTreatments(): void {
  document.querySelectorAll(`[${TREATED_ATTR}]`).forEach((el) => {
    el.removeAttribute(TREATED_ATTR);
    el.classList.remove('ss-demoted', 'ss-boosted');
    el.querySelectorAll('.ss-tag-spam, .ss-tag-forum').forEach((t) => t.remove());
    const idx = el.getAttribute('data-ss-original-index');
    if (idx !== null) el.removeAttribute('data-ss-original-index');
  });
}

function matchesDomain(domain: string, list: string[]): boolean {
  return list.some((d) => {
    const clean = d.replace(/^www\./, '').toLowerCase();
    return domain === clean || domain.endsWith('.' + clean);
  });
}

function demoteResult(el: Element): void {
  el.classList.add('ss-demoted');
  const tag = document.createElement('span');
  tag.className = 'ss-tag-spam';
  tag.textContent = 'low quality';
  const titleEl = el.querySelector('h3, [role="heading"]');
  if (titleEl) titleEl.after(tag);
  else el.append(tag);
}

function boostResult(el: Element, willReorder: boolean): void {
  el.classList.add('ss-boosted');
  if (willReorder) {
    const parent = el.parentElement;
    if (parent) {
      const idx = Array.from(parent.children).indexOf(el as HTMLElement);
      if (idx >= 0) el.setAttribute('data-ss-original-index', String(idx));
    }
  }
  const tag = document.createElement('span');
  tag.className = 'ss-tag-forum';
  tag.textContent = '💬 forum';
  const titleEl = el.querySelector('h3, [role="heading"]');
  if (titleEl) titleEl.after(tag);
  else el.prepend(tag);
}

function reorderBoostedResults(): void {
  const boosted = Array.from(document.querySelectorAll('.ss-boosted'));
  if (boosted.length === 0) return;
  const parent = boosted[0].parentElement;
  if (!parent) return;
  // Move boosted results to top, preserving relative order among them
  for (const el of boosted.reverse()) {
    parent.prepend(el);
  }
}
