import { lazy, Suspense, useEffect } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAppStore } from './state/appStore';
import { Layout } from './components/Layout';
import { HomeScreen } from './screens/HomeScreen';
import { TrainScreen } from './screens/TrainScreen';

// Heavier / less-frequent routes are code-split for a faster first paint.
const ReviewScreen = lazy(() =>
  import('./screens/ReviewScreen').then((m) => ({ default: m.ReviewScreen })),
);
const ProgressScreen = lazy(() =>
  import('./screens/ProgressScreen').then((m) => ({ default: m.ProgressScreen })),
);
const SettingsScreen = lazy(() =>
  import('./screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
);
const OnboardingScreen = lazy(() =>
  import('./screens/OnboardingScreen').then((m) => ({ default: m.OnboardingScreen })),
);
const SessionScreen = lazy(() =>
  import('./screens/SessionScreen').then((m) => ({ default: m.SessionScreen })),
);
const MatrixLabScreen = lazy(() =>
  import('./screens/MatrixLabScreen').then((m) => ({ default: m.MatrixLabScreen })),
);
const SkillDetailScreen = lazy(() =>
  import('./screens/SkillDetailScreen').then((m) => ({ default: m.SkillDetailScreen })),
);
const InspectorScreen = lazy(() =>
  import('./screens/InspectorScreen').then((m) => ({ default: m.InspectorScreen })),
);

function Loading() {
  return (
    <div style={{ minHeight: '60dvh', display: 'grid', placeItems: 'center' }}>
      <div className="pulse-dot" />
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingComplete = useAppStore((s) => s.profile.onboardingComplete);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <div className="stack" style={{ alignItems: 'center' }}>
          <div className="pulse-dot" />
          <span>Loading ACT Pulse…</span>
        </div>
      </div>
    );
  }

  if (!onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export function App() {
  const init = useAppStore((s) => s.init);
  useEffect(() => {
    void init();
  }, [init]);

  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Gate>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/session/:mode" element={<SessionScreen />} />
            <Route path="/matrix-lab" element={<MatrixLabScreen />} />
            <Route path="/skill/:skillId" element={<SkillDetailScreen />} />
            <Route path="/inspector" element={<InspectorScreen />} />
            <Route element={<Layout />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/train" element={<TrainScreen />} />
              <Route path="/review" element={<ReviewScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Gate>
    </HashRouter>
  );
}
