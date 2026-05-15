import { getPrefs } from '../lib/storage';

/* SW global — typed via webworker lib (included via DOM lib's WorkerGlobalScope) */
const sw = self as unknown as {
  skipWaiting(): void;
  clients: { claim(): Promise<void> };
  addEventListener(type: string, listener: (e: ExtendableEvent) => void): void;
};

sw.addEventListener('install', () => {
  sw.skipWaiting();
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    sw.clients.claim().then(() => {
      return getPrefs();
    })
  );
});
