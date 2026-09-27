import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { Layout } from './components/Layout';
import { Spinner, toast, ToastHost } from './components/ui';
import { usePomodoroEngine } from './hooks/usePomodoro';
import { useRoute } from './hooks/useRoute';
import { startupError, startupReport, useSelector } from './store/store';

const pages = {
  home: lazy(() => import('./pages/HomePage')),
  subjects: lazy(() => import('./pages/SubjectsPage')),
  subject: lazy(() => import('./pages/SubjectPage')),
  topic: lazy(() => import('./pages/TopicPage')),
  tests: lazy(() => import('./pages/TestSetupPage')),
  runner: lazy(() => import('./pages/TestRunnerPage')),
  result: lazy(() => import('./pages/TestResultPage')),
  wrongs: lazy(() => import('./pages/WrongsPage')),
  reviews: lazy(() => import('./pages/ReviewsPage')),
  plan: lazy(() => import('./pages/PlanPage')),
  focus: lazy(() => import('./pages/FocusPage')),
  mocks: lazy(() => import('./pages/MocksPage')),
  progress: lazy(() => import('./pages/ProgressPage')),
  resources: lazy(() => import('./pages/ResourcesPage')),
  osym: lazy(() => import('./pages/OsymPage')),
  teacher: lazy(() => import('./pages/TeacherPage')),
  settings: lazy(() => import('./pages/SettingsPage')),
  more: lazy(() => import('./pages/MorePage')),
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
  tekrar: { page: pages.reviews, title: 'Tekrarlar' },
  plan: { page: pages.plan, title: 'Plan' },
  odak: { page: pages.focus, title: 'Odak' },
  denemeler: { page: pages.mocks, title: 'Denemeler' },
  gelisim: { page: pages.progress, title: 'Gelişimim' },
  kaynaklar: { page: pages.resources, title: 'Kaynaklar' },
  cikmis: { page: pages.osym, title: 'ÖSYM Çıkmış Sorular' },
  ogretmen: { page: pages.teacher, title: 'Öğretmen' },
  ayarlar: { page: pages.settings, title: 'Ayarlar' },
  daha: { page: pages.more, title: 'Daha Fazla' },
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
  useThemeEffect();
  usePomodoroEngine();

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

  return (
    <>
      {onboarded ? (
        <Layout>
          <Suspense fallback={<Spinner />}>
            <Page key={route.path} params={route.segments.slice(1)} />
          </Suspense>
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
