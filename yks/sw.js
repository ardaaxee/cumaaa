/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-11145b5af536';
const PRECACHE = ["./","./index.html","./assets/index-Cj1h7GPK.js","./assets/AskName-DQWNNYW8.js","./assets/BadgesPage-BXKM_V6N.js","./assets/CardsPage-Bqiss_Ud.js","./assets/Charts-BYBPEvmn.js","./assets/CoachPage-DWgERnR9.js","./assets/FocusPage-CZ61vZxS.js","./assets/FormulasPage-DTTCeiHo.js","./assets/HomePage-DlXnZNM7.js","./assets/InlineQuiz--3dTydmA.js","./assets/MocksPage-DTxrmJZX.js","./assets/MorePage-C444uGNu.js","./assets/NotFoundPage-CfF3RZak.js","./assets/NotebookRouter-DxfjjCUT.js","./assets/OnboardingPage-D6fvNPmO.js","./assets/OsymPage-DKMX3Ni5.js","./assets/PartnerPage-BD7xf4qh.js","./assets/PetPage-BKbVpMN6.js","./assets/PlanPage-Cmii1YsT.js","./assets/ProgressPage-DTUyast7.js","./assets/QuestionView-Bi31FAqo.js","./assets/ReportPage-GWaQr0bd.js","./assets/ResourcesPage-BKKuPTZz.js","./assets/ReviewsPage-B3r8n2CP.js","./assets/SavedPage-DvAS2-8L.js","./assets/SettingsPage-Di1wa1_H.js","./assets/StudyPage-C1Z13_Uh.js","./assets/SubjectPage-C0l54G2T.js","./assets/SubjectsPage-DzD5Ssdm.js","./assets/TeacherPage-CNEVLFzT.js","./assets/TestResultPage-KURdnwWr.js","./assets/TestRunnerPage-BFHjwPar.js","./assets/TestSetupPage-fW1ipiVe.js","./assets/TopicPage-D_nkRqT1.js","./assets/WrongsPage-D2fLVm4Y.js","./assets/actions-_fmN8Csq.js","./assets/adaptiveStudy-xm1loQe0.js","./assets/analysis-75ptIcNJ.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-biyoloji-ek-D-gUA9yc.js","./assets/ayt-biyoloji-ek4-BdRKHMWD.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-fizik-ek3-DCeoHvW4.js","./assets/ayt-fizik-ek4-9nhldys4.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-geometri-ek-DYnHGMWj.js","./assets/ayt-geometri-ek3-DsQ6IcWH.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-kimya-ek-F-VuSwNq.js","./assets/ayt-kimya-ek3-CAACcm0i.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/ayt-matematik-ek-BVa56jU1.js","./assets/ayt-matematik-ek3-4XDOjC_P.js","./assets/ayt-matematik-ek4-BFBGZSiz.js","./assets/content-Dm8GrAdD.js","./assets/localAssistant-Dicd2laT.js","./assets/lookup-BcBdHruq.js","./assets/officialResources-rLySSL-e.js","./assets/pet-3RL004qs.js","./assets/photoStore-Cr_fsZYI.js","./assets/recommendations-DM_-Ic-J.js","./assets/testLauncher-C18RJ4-K.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-biyoloji-ek3-BAU2R-O6.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-cografya-ek-u40yRQiD.js","./assets/tyt-cografya-ek3-HFGVOmQf.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-din-ek-D5ZChKCt.js","./assets/tyt-din-ek4-D8POvi_R.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-felsefe-ek4-DqjI4MFw.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-fizik-ek-Co7-gA8M.js","./assets/tyt-fizik-ek3-BIU5g6Xn.js","./assets/tyt-fizik-ek4-BsomiPbc.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-geometri-ek3-XlonEgkw.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-kimya-ek-CDKQAW2_.js","./assets/tyt-kimya-ek3-De1m9Ehj.js","./assets/tyt-kimya-ek4-ClFBIgMw.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-matematik-ek-B6ciMFJq.js","./assets/tyt-matematik-ek3-CF3j_8DV.js","./assets/tyt-matematik-ek4-8E7xhKWI.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-ek2-Cg3hsLIY.js","./assets/tyt-tarih-ek3-CiapcSTg.js","./assets/tyt-tarih-ek4-CEuVRhKD.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-ek-C8PPd6yw.js","./assets/tyt-turkce-ek3-DsCEG_kC.js","./assets/tyt-turkce-ek4-Dshepod_.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-DjB9Ecwo.js","./assets/useLoad-Eo_xiSgR.js","./assets/index-OsTM4OcM.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

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

// Bildirime dokununca uygulama açılır (açıksa öne gelir); panda bildirimi panda sayfasına götürür.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const hash = event.notification.tag === 'panda-ihtiyac' ? '#/pandam' : '#/';
  const url = new URL(`./${hash}`, self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate?.(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
