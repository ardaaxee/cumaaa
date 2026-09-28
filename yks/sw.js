/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-a9cde0b52c4a';
const PRECACHE = ["./","./index.html","./assets/index-B0j5yg_8.js","./assets/AssistantCharacter-CiohBH9f.js","./assets/Charts-oazSYG9_.js","./assets/FocusPage-Bm5ZLCor.js","./assets/HomePage-DsygJ0bB.js","./assets/Icon-CsLhTxlq.js","./assets/InlineQuiz-5xjdOfGh.js","./assets/MocksPage-C0nJZlYa.js","./assets/MorePage-BOSKcVFG.js","./assets/NotFoundPage-CFFU9ihz.js","./assets/NotebookRouter-CQN9Xl0N.js","./assets/OnboardingPage-Bg0EThkt.js","./assets/OsymPage-myUg-tdw.js","./assets/PlanPage-Em3GX4Iv.js","./assets/PomodoroCard-Bw1slvvH.js","./assets/ProgressPage-Bj8ZUzbG.js","./assets/QuestionView-geElzZGE.js","./assets/ResourcesPage-Bi41B4ZF.js","./assets/ReviewsPage-tZPZIVVS.js","./assets/SettingsPage-CjZ8Wk8K.js","./assets/SubjectPage-BKoVyEd9.js","./assets/SubjectsPage-BxlIt24v.js","./assets/TeacherPage-Dt5hlqVZ.js","./assets/TestResultPage-CYQna834.js","./assets/TestRunnerPage-k9laRYpW.js","./assets/TestSetupPage-BiS7d-oN.js","./assets/TopicPage-DTYV-kPt.js","./assets/WrongsPage-gLi64lKi.js","./assets/analysis-DVeUFjnl.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/content-BmcKcW3a.js","./assets/lookup-9PSRZ6kb.js","./assets/mock-Doz_GJWD.js","./assets/officialResources-BuxIxjcB.js","./assets/recommendations-DKK6TAib.js","./assets/stats-W2DTMURU.js","./assets/testLauncher-BrLJc0Oh.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-DCu9WpNT.js","./assets/index-DjY73O5f.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

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
