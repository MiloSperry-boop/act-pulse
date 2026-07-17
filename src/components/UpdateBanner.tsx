import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

/**
 * Silent auto-updater. With registerType 'autoUpdate' + skipWaiting, a new
 * service worker takes over as soon as it's found; we also proactively check
 * for updates on an interval and whenever the app returns to the foreground
 * (the common iPhone pattern: reopen from the Home Screen).
 */
export function AutoUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Hourly background check while the app stays open.
      setInterval(() => void registration.update(), CHECK_INTERVAL_MS);
      // Check when the app comes back to the foreground.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration.update();
        }
      });
    },
  });

  // If a new version is waiting, apply it and reload right away.
  useEffect(() => {
    if (needRefresh) void updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);

  return null;
}
