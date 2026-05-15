import { getPrefs, onPrefsChanged, type Prefs } from '../lib/storage';
import { hideOverview, showOverview } from './overview';
import { applyDomainTreatments, clearDomainTreatments } from './domains';
import spamDomainsRaw from '../data/spam-domains.json';
import boostDomainsRaw from '../data/boost-domains.json';

const spamDomains = spamDomainsRaw as string[];
const boostDomains = boostDomainsRaw as string[];

let prefs: Prefs;
let observer: MutationObserver | null = null;

/* CRITICAL: await prefs before any DOM mutation */
async function main(): Promise<void> {
  prefs = await getPrefs();

  /* Feature 2: Force web-only mode — redirect before any SERP work */
  if (prefs.forceWebMode) {
    const url = new URL(location.href);
    const tbm = url.searchParams.get('tbm'); // images/news/shopping vertical
    const udm = url.searchParams.get('udm');
    if (!tbm && udm !== '14' && url.pathname === '/search') {
      url.searchParams.set('udm', '14');
      location.replace(url.toString());
      return; // redirect in progress
    }
  }

  applyAll();
  attachObserver();

  /* Live pref updates from popup */
  onPrefsChanged((newPrefs) => {
    prefs = newPrefs;
    clearDomainTreatments();
    applyAll();
  });
}

function applyAll(): void {
  /* Feature 1: AI Overview hide */
  if (prefs.hideOverview) {
    hideOverview();
  } else {
    showOverview();
  }
  /* Features 3 + 4: single DOM pass */
  applyDomainTreatments(prefs, spamDomains, boostDomains);
}

function attachObserver(): void {
  observer?.disconnect();
  /* Observe document.body for resilience — survives Google's History API nav */
  observer = new MutationObserver(debounce(applyAll, 80));
  observer.observe(document.body, { childList: true, subtree: true });
}

/* Re-attach on History API navigation */
window.addEventListener('popstate', () => {
  observer?.disconnect();
  attachObserver();
  applyAll();
});

function debounce<T extends () => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (() => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  }) as T;
}

main();
