/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-ed733251f648';
const PRECACHE = ["./","./index.html","./assets/index-BxdOGm7J.js","./assets/AssistantCharacter-B_CGZ7Ot.js","./assets/BadgesPage-iJFPux6X.js","./assets/CardsPage-CjkKJ-ZY.js","./assets/Charts-C3YIv25P.js","./assets/FocusPage-rZkjRAVL.js","./assets/FormulasPage-CMBXNBQW.js","./assets/HomePage-BwN_ON21.js","./assets/Icon-CVckL8Kh.js","./assets/InlineQuiz-BkgxN_X5.js","./assets/MocksPage-D6SfytqY.js","./assets/MorePage-Dpy5XDzq.js","./assets/NotFoundPage-DQipzuCy.js","./assets/NotebookRouter-D-gnlPZK.js","./assets/OnboardingPage-DGI2MIwr.js","./assets/OsymPage-DUDekTYd.js","./assets/PartnerPage-Bczer_Kd.js","./assets/PetPage-CxxdSRSj.js","./assets/PlanPage-BA0qwUpH.js","./assets/PomodoroCard-iq3D8B6V.js","./assets/ProgressPage-CbDLcCXj.js","./assets/QuestionView-XdAt0__u.js","./assets/ReportPage-BgbpxirE.js","./assets/ResourcesPage-CBq1hDvY.js","./assets/ReviewsPage-CtZ-h-xH.js","./assets/SavedPage-DoQafxWV.js","./assets/SettingsPage-BTLgm9-1.js","./assets/SubjectPage-Qk-Zmety.js","./assets/SubjectsPage-B5iHOrrG.js","./assets/TeacherPage-CLTq4ro6.js","./assets/TestResultPage-ByQCDeRj.js","./assets/TestRunnerPage-BFp4VsGa.js","./assets/TestSetupPage-fJGQw7OY.js","./assets/TopicPage-D4r_upFA.js","./assets/WrongsPage-SqUIjlpl.js","./assets/analysis-BA9_lno5.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-biyoloji-ek-D-gUA9yc.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-fizik-ek3-lplZM78c.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-geometri-ek-DYnHGMWj.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-kimya-ek-F-VuSwNq.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/ayt-matematik-ek-BVa56jU1.js","./assets/ayt-matematik-ek3-CQBptIKp.js","./assets/content-BCcl1qVH.js","./assets/localAssistant-BUY5q85G.js","./assets/lookup-BXO43Ta-.js","./assets/mock-R6uERCs0.js","./assets/net-CfoizUGz.js","./assets/officialResources-BuxIxjcB.js","./assets/pet-BdyURf5d.js","./assets/photoStore-Ck8wYmsT.js","./assets/recommendations-BJrrCLpo.js","./assets/srs-DaBL3MvX.js","./assets/testLauncher-BhmPnbkl.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-cografya-ek-u40yRQiD.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-din-ek-D5ZChKCt.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-fizik-ek-Co7-gA8M.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-kimya-ek-CDKQAW2_.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-matematik-ek-B6ciMFJq.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-ek2-Cg3hsLIY.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-ek-C8PPd6yw.js","./assets/tyt-turkce-ek3-8vDXr1VM.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-C4Yjke6S.js","./assets/useVoice-CwtoUHL0.js","./assets/index-BF67C6xr.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

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

// Önbellek stratejisi (eski sürümde takılı kalmamak için):
// - Sayfa (HTML) ve sabit adlı dosyalar: önce ağ, ağ yoksa önbellek.
// - /assets/ altındaki dosyalar içerik özetiyle adlandırıldığı için değişmez: önce önbellek.
function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then((response) => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(fallbackUrl || request, copy));
      }
      return response;
    })
    .catch(() => caches.match(fallbackUrl || request, { ignoreSearch: true }));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(networkFirst(request));
});
