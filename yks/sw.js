/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-63dacffea8b1';
const PRECACHE = ["./","./index.html","./assets/index-DdN11bAp.js","./assets/Charts-kErufl-G.js","./assets/FocusPage-BHnP6EKh.js","./assets/HomePage-DW98vtek.js","./assets/Icon-ByX3q2pV.js","./assets/InlineQuiz-CdLxZuTP.js","./assets/MocksPage-CuAIoWwU.js","./assets/MorePage-CLp621H9.js","./assets/NotFoundPage-C0xaM_LU.js","./assets/NotebookRouter-CVa2JtKA.js","./assets/OnboardingPage-BOHJAy-0.js","./assets/OsymPage-C4bTkN4l.js","./assets/PlanPage-DmaliVFk.js","./assets/PomodoroCard-BXfrburm.js","./assets/ProgressPage-CNqUye1M.js","./assets/QuestionView-BCgzI_RZ.js","./assets/ResourcesPage-o0q0nhBe.js","./assets/ReviewsPage-C_9a27of.js","./assets/SettingsPage-a15RVPSo.js","./assets/SubjectPage-Bh_RLOT7.js","./assets/SubjectsPage-CWSBM1LI.js","./assets/TeacherAvatar-naMJQBqB.js","./assets/TeacherPage-DxNMF1Lf.js","./assets/TestResultPage-c4jjg4_k.js","./assets/TestRunnerPage-BH3JNRsv.js","./assets/TestSetupPage-DR85tstm.js","./assets/TopicPage-lwjAcBig.js","./assets/WrongsPage-BSm0zfEx.js","./assets/analysis-EtFdkpJM.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/content-C_RsQUAq.js","./assets/lookup-EAuJsjQ1.js","./assets/mock-DjKQkbtg.js","./assets/officialResources-BuxIxjcB.js","./assets/stats-COZ7aQV8.js","./assets/testLauncher-BlLgTuii.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-D8ue0ZE3.js","./assets/index-BsPdl8k8.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('iyiki-yks-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html', { ignoreSearch: true })),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
