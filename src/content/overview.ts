import { findOverviewElement } from './selectors';

const HIDDEN_ATTR = 'data-ss-hidden';
const BANNER_CLASS = 'ss-overview-banner';

export function hideOverview(): void {
  const el = findOverviewElement();
  if (!el || el.getAttribute(HIDDEN_ATTR) === 'overview') return;

  el.setAttribute(HIDDEN_ATTR, 'overview');
  (el as HTMLElement).style.display = 'none';

  const banner = createBanner(el as HTMLElement);
  el.parentNode?.insertBefore(banner, el.nextSibling);
}

export function showOverview(): void {
  document.querySelectorAll(`[${HIDDEN_ATTR}="overview"]`).forEach((el) => {
    el.removeAttribute(HIDDEN_ATTR);
    (el as HTMLElement).style.display = '';
    const next = el.nextElementSibling;
    if (next?.classList.contains(BANNER_CLASS)) next.remove();
  });
}

function createBanner(target: HTMLElement): HTMLElement {
  const banner = document.createElement('div');
  banner.className = BANNER_CLASS;

  const label = document.createElement('span');
  label.textContent = 'AI Overview hidden';

  const showLink = document.createElement('a');
  showLink.className = 'ss-show-anyway';
  showLink.textContent = 'Show anyway';
  showLink.href = '#';
  showLink.addEventListener('click', (e) => {
    e.preventDefault();
    target.removeAttribute(HIDDEN_ATTR);
    target.style.display = '';
    banner.remove();
  });

  banner.append(label, showLink);
  return banner;
}
