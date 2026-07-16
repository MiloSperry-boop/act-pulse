import { useRegisterSW } from 'virtual:pwa-register/react';

/** Shows a banner when a new service worker version is ready. */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      if (import.meta.env.PROD) {
        console.debug('SW registered:', swUrl);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="update-banner" role="alert">
      <span>An updated version of ACT Pulse is available.</span>
      <div className="row" style={{ gap: 'var(--sp-2)' }}>
        <button
          className="btn btn--sm btn--ghost"
          onClick={() => setNeedRefresh(false)}
        >
          Later
        </button>
        <button
          className="btn btn--sm btn--primary"
          onClick={() => updateServiceWorker(true)}
        >
          Update now
        </button>
      </div>
    </div>
  );
}
