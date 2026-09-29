import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { Layout } from './components/Layout';
import { PageErrorBoundary } from './components/ErrorBoundary';
import { Spinner, toast, ToastHost } from './components/ui';
import { useRoute } from './hooks/useRoute';
import { getState, startupError, startupReport, useSelector } from './store/store';
import { cloudConfig, startAutoSync } from './services/cloud';
import { useReminder } from './hooks/useReminder';

const pages = {
  home: lazy(() => import('./pages/HomePage')),
  subjects: lazy(() => import('./pages/SubjectsPage')),
  subject: lazy(() => import('./pages/SubjectPage')),
  topic: lazy(() => import('./pages/TopicPage')),
  tests: lazy(() => import('./pages/TestSetupPage')),
  runner: lazy(() => import('./pages/TestRunnerPage')),
  result: lazy(() => import('./pages/TestResultPage')),
  wrongs: lazy(() => import('./pages/WrongsPage')),
  notebook: lazy(() => import('./pages/NotebookRouter')),
  reviews: lazy(() => import('./pages/ReviewsPage')),
  plan: lazy(() => import('./pages/PlanPage')),
  mocks: lazy(() => import('./pages/MocksPage')),
  progress: lazy(() => import('./pages/ProgressPage')),
  resources: lazy(() => import('./pages/ResourcesPage')),
  osym: lazy(() => import('./pages/OsymPage')),
  teacher: lazy(() => import('./pages/TeacherPage')),
  settings: lazy(() => import('./pages/SettingsPage')),
  more: lazy(() => import('./pages/MorePage')),
  cards: lazy(() => import('./pages/CardsPage')),
  formulas: lazy(() => import('./pages/FormulasPage')),
  badges: lazy(() => import('./pages/BadgesPage')),
  partner: lazy(() => import('./pages/PartnerPage')),
  pet: lazy(() => import('./pages/PetPage')),
  saved: lazy(() => import('./pages/SavedPage')),
  report: lazy(() => import('./pages/ReportPage')),
  onboarding: lazy(() => import('./pages/OnboardingPage')),
  notFound: lazy(() => import('./pages/NotFoundPage')),
};

const ROUTES: Record<string, { page: ComponentType<{ params: string[] }>; title: string }> = {
  '': { page: pages.home, title: 'Odam' },
  dersler: { page: pages.subjects, title: 'Dersler' },
  ders: { page: pages.subject, title: 'Ders' },
  konu: { page: pages.topic, title: 'Konu' },
  testler: { page: pages.tests, title: 'Testler' },
  test: { page: pages.runner, title: 'Test' },
  sonuc: { page: pages.result, title: 'Test sonucu' },
  yanlislar: { page: pages.wrongs, title: 'Yanlışlarım' },
  defterim: { page: pages.notebook, title: 'Defterim' },
  tekrar: { page: pages.reviews, title: 'Tekrarlar' },
  plan: { page: pages.plan, title: 'Plan' },
  denemeler: { page: pages.mocks, title: 'Denemeler' },
  gelisim: { page: pages.progress, title: 'Gelişimim' },
  kaynaklar: { page: pages.resources, title: 'Kaynaklar' },
  cikmis: { page: pages.osym, title: 'ÖSYM Çıkmış Sorular' },
  ogretmen: { page: pages.teacher, title: 'Cuma' },
  ayarlar: { page: pages.settings, title: 'Ayarlar' },
  daha: { page: pages.more, title: 'Daha Fazla' },
  kartlar: { page: pages.cards, title: 'Bilgi Kartları' },
  formuller: { page: pages.formulas, title: 'Formül Defteri' },
  rozetler: { page: pages.badges, title: 'Rozetlerim' },
  pandam: { page: pages.pet, title: 'Panda arkadaşım' },
  kaydedilenler: { page: pages.saved, title: 'Kaydettiğim sorular' },
  karne: { page: pages.report, title: 'Haftalık karne' },
};

function useThemeEffect() {
  const theme = useSelector((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    meta?.setAttribute('content', dark ? '#131019' : '#f7f5fb');
  }, [theme]);
}

export function App() {
  const route = useRoute();
  const onboarded = useSelector((s) => s.profile.onboarded);
  const cloudKey = useSelector((s) => `${s.settings.cloud.projectId}|${s.settings.cloud.apiKey}|${s.settings.cloud.syncCode}`);
  useThemeEffect();
  useReminder();

  // Bulut eşitlemesi: yapılandırılmışsa açılışta, periyodik olarak ve sekme gizlenince çalışır.
  useEffect(() => {
    if (!cloudConfig() || !getState().settings.cloud.syncCode) return;
    return startAutoSync();
  }, [cloudKey]);

  useEffect(() => {
    if (startupError) toast(`Kayıtlı veri okunamadı: ${startupError}`, 6000);
    else if (startupReport) toast('Eski sürüm verilerin yeni sürüme aktarıldı.', 5000);
    const onStorage = () => toast('Cihaz depolama alanı dolu: son değişiklikler kaydedilemedi. Ayarlar’dan yedek al.', 6000);
    window.addEventListener('iyiki:storage-error', onStorage);
    return () => window.removeEventListener('iyiki:storage-error', onStorage);
  }, []);

  const key = route.segments[0] ?? '';
  const match = ROUTES[key];
  const Page = onboarded ? match?.page ?? pages.notFound : pages.onboarding;

  useEffect(() => {
    document.title = `${onboarded ? match?.title ?? 'Bulunamadı' : 'Hoş geldin'} · İyi ki • YKS`;
    window.scrollTo(0, 0);
  }, [route.path, onboarded, match]);

  // Sevgili/ortak ekranı: bağlantıyla gelen kişi uygulamayı kurmadan görebilsin.
  if (key === 'ortak') {
    return (
      <>
        <main id="main" className="main" style={{ maxWidth: 720 }}>
          <Suspense fallback={<Spinner />}>
            <pages.partner />
          </Suspense>
        </main>
        <ToastHost />
      </>
    );
  }

  return (
    <>
      {onboarded ? (
        <Layout>
          <PageErrorBoundary resetKey={route.path}>
            <Suspense fallback={<Spinner />}>
              <Page key={`${route.path}?${route.query.toString()}`} params={route.segments.slice(1)} />
            </Suspense>
          </PageErrorBoundary>
        </Layout>
      ) : (
        <main id="main" className="main" style={{ maxWidth: 640 }}>
          <Suspense fallback={<Spinner />}>
            <Page params={[]} />
          </Suspense>
        </main>
      )}
      <ToastHost />
    </>
  );
}
