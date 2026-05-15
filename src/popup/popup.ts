import { getPrefs, setPrefs, type Prefs } from '../lib/storage';
import {
  ICON_AI,
  ICON_WEB,
  ICON_SPAM,
  ICON_FORUM,
  ICON_CHEVRON_RIGHT,
  ICON_CHEVRON_LEFT,
  ICON_CLOSE,
} from '../lib/icons';

async function init(): Promise<void> {
  injectIcons();
  const prefs = await getPrefs();
  initToggles(prefs);
  updateStatusPill(prefs);
  initManagePanel(prefs);
}

function injectIcons(): void {
  const map: Record<string, string> = {
    'icon-ai':      ICON_AI,
    'icon-web':     ICON_WEB,
    'icon-spam':    ICON_SPAM,
    'icon-forum':   ICON_FORUM,
    'icon-chevron': ICON_CHEVRON_RIGHT,
    'icon-back':    ICON_CHEVRON_LEFT,
  };
  for (const [id, svg] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  }
}

function initToggles(prefs: Prefs): void {
  document.querySelectorAll<HTMLElement>('[data-pref]').forEach((toggleEl) => {
    const key = toggleEl.dataset.pref as keyof Prefs;
    const on = prefs[key] as boolean;
    const row = toggleEl.closest<HTMLElement>('.row');

    setToggleState(toggleEl, on);
    if (row) row.setAttribute('aria-checked', String(on));

    row?.addEventListener('click', async () => {
      const current = toggleEl.classList.contains('on');
      const next = !current;
      setToggleState(toggleEl, next);
      if (row) row.setAttribute('aria-checked', String(next));
      await setPrefs({ [key]: next } as Partial<Prefs>);
      const updated = await getPrefs();
      updateStatusPill(updated);
    });

    /* Keyboard accessibility */
    row?.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        row.click();
      }
    });
  });
}

function setToggleState(el: HTMLElement, on: boolean): void {
  el.classList.toggle('on', on);
}

function updateStatusPill(prefs: Prefs): void {
  const pill = document.getElementById('status-pill');
  if (!pill) return;
  const anyActive = prefs.hideOverview || prefs.forceWebMode || prefs.demoteSpam || prefs.boostForums;
  pill.textContent = anyActive ? '● Active' : '● Paused';
  pill.className = `status-pill ${anyActive ? 'status-active' : 'status-paused'}`;
}

function initManagePanel(prefs: Prefs): void {
  const btnManage = document.getElementById('btn-manage-sites');
  const btnBack    = document.getElementById('btn-back');
  const viewMain   = document.getElementById('view-main');
  const viewManage = document.getElementById('view-manage');
  const input      = document.getElementById('input-domain') as HTMLInputElement | null;
  const btnAdd     = document.getElementById('btn-add-domain');

  if (!btnManage || !btnBack || !viewMain || !viewManage || !input || !btnAdd) return;

  btnManage.addEventListener('click', () => {
    viewMain.hidden  = true;
    viewManage.hidden = false;
    renderBlockedList(prefs);
  });

  btnBack.addEventListener('click', () => {
    viewMain.hidden  = false;
    viewManage.hidden = true;
  });

  const addDomain = async (): Promise<void> => {
    const raw = input.value.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');
    if (!raw || raw.includes(' ')) return;
    const current = await getPrefs();
    if (!current.userBlocklist.includes(raw)) {
      const updated = [...current.userBlocklist, raw];
      await setPrefs({ userBlocklist: updated });
      prefs.userBlocklist = updated;
      renderBlockedList(prefs);
    }
    input.value = '';
    input.focus();
  };

  btnAdd.addEventListener('click', addDomain);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void addDomain();
  });
}

function renderBlockedList(prefs: Prefs): void {
  const section = document.getElementById('section-blocked-list');
  if (!section) return;
  section.innerHTML = '';

  if (prefs.userBlocklist.length === 0) return;

  const caption = document.createElement('p');
  caption.className = 'section-caption';
  caption.textContent = 'Blocked Domains';
  section.append(caption);

  const card = document.createElement('div');
  card.className = 'card';

  prefs.userBlocklist.forEach((domain) => {
    const row = document.createElement('div');
    row.className = 'row row-domain';

    const label = document.createElement('span');
    label.className = 'row-label';
    label.textContent = domain;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-icon';
    removeBtn.innerHTML = ICON_CLOSE;
    removeBtn.setAttribute('aria-label', `Remove ${domain}`);
    removeBtn.addEventListener('click', async () => {
      const current = await getPrefs();
      const updated = current.userBlocklist.filter((d) => d !== domain);
      await setPrefs({ userBlocklist: updated });
      prefs.userBlocklist = updated;
      renderBlockedList(prefs);
    });

    row.append(label, removeBtn);
    card.append(row);
  });

  section.append(card);
}

init();
