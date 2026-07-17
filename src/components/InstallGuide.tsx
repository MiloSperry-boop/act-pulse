import { Share, Plus, X } from 'lucide-react';
import { useAppStore } from '../state/appStore';

/** Detect iOS Safari (non-standalone) to show the Add-to-Home-Screen guide. */
function shouldShowIosGuide(): boolean {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error legacy iOS flag
    window.navigator.standalone === true;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari && !isStandalone;
}

export function InstallGuide() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  if (settings.installGuideDismissed) return null;
  if (!shouldShowIosGuide()) return null;

  return (
    <div className="card install-guide" role="dialog" aria-label="Install Summit">
      <div className="row-between">
        <strong>Add Summit to your Home Screen</strong>
        <button
          className="btn btn--sm btn--ghost"
          aria-label="Dismiss install guide"
          onClick={() => updateSettings({ installGuideDismissed: true })}
        >
          <X size={18} />
        </button>
      </div>
      <ol className="stack-sm" style={{ paddingLeft: 0, listStyle: 'none' }}>
        <li className="row">
          <Share size={18} aria-hidden /> Tap the <strong>Share</strong> button in Safari.
        </li>
        <li className="row">
          <Plus size={18} aria-hidden /> Choose <strong>Add to Home Screen</strong>.
        </li>
        <li className="row">
          Open Summit from your Home Screen — it runs full-screen and offline.
        </li>
      </ol>
    </div>
  );
}
