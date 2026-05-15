export interface Prefs {
  hideOverview: boolean;
  forceWebMode: boolean;
  demoteSpam: boolean;
  boostForums: boolean;
  reorderForums: boolean;
  userBlocklist: string[];
  userBoostlist: string[];
}

const DEFAULTS: Prefs = {
  hideOverview: true,
  forceWebMode: false,
  demoteSpam: true,
  boostForums: true,
  reorderForums: false,
  userBlocklist: [],
  userBoostlist: [],
};

export async function getPrefs(): Promise<Prefs> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULTS, (items) => {
      resolve(items as Prefs);
    });
  });
}

export async function setPrefs(patch: Partial<Prefs>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(patch, resolve);
  });
}

export function onPrefsChanged(cb: (prefs: Prefs) => void): void {
  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area !== 'sync') return;
    getPrefs().then(cb);
  });
}
