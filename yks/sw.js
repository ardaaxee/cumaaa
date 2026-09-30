/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-b42169be311d';
const PRECACHE = ["./","./index.html","./assets/index-CFhiVXru.js","./assets/AskName-VeUEVAuH.js","./assets/BadgesPage-CtuB4fAe.js","./assets/CardsPage-DjxRKez6.js","./assets/Charts-C6gEQSSb.js","./assets/CoachPage-PZlz7-jA.js","./assets/FocusPage-DmZcfJvE.js","./assets/FormulasPage-DEccmbwg.js","./assets/HomePage-DyTZDAf9.js","./assets/InlineQuiz-CNCIz6X6.js","./assets/LiveTogetherPage-TxyBd4f7.js","./assets/MocksPage-DOdXY1Td.js","./assets/MorePage-Dx1dnVWe.js","./assets/NotFoundPage-Cgy99-hN.js","./assets/NotebookRouter-Bvfqrns6.js","./assets/OnboardingPage-Cjz1AKSX.js","./assets/OsymPage-D5cl-idH.js","./assets/PartnerPage-BNSLf8Z4.js","./assets/PetPage-vgFYS9DE.js","./assets/PlanPage-BMLAiu5h.js","./assets/ProgressPage-BNqqj5qo.js","./assets/QuestionView-BVbLEcBm.js","./assets/ReportPage-CYG-RCub.js","./assets/ResourcesPage-D5xwfrVG.js","./assets/ReviewsPage-BSKMxd3e.js","./assets/SavedPage-DAyZ1lwe.js","./assets/SettingsPage-QGg0sALE.js","./assets/StudyPage-CCaWJvuu.js","./assets/SubjectPage-BWA-bjE7.js","./assets/SubjectsPage-DBo6HVdv.js","./assets/TeacherPage-DmgrY-Bu.js","./assets/TestResultPage-DFAKZcz1.js","./assets/TestRunnerPage-Bk3qHaKw.js","./assets/TestSetupPage-BJIrqIum.js","./assets/TopicPage-DmvJyzrP.js","./assets/WrongsPage-D2pF9zEY.js","./assets/actions-DQ4sipXo.js","./assets/adaptiveStudy-D0eD63Pt.js","./assets/analysis-CSO1EEEI.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-biyoloji-ek-D-gUA9yc.js","./assets/ayt-biyoloji-ek4-BdRKHMWD.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-fizik-ek3-DCeoHvW4.js","./assets/ayt-fizik-ek4-9nhldys4.js","./assets/ayt-fizik-ek6-CeAZEXj7.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-geometri-ek-DYnHGMWj.js","./assets/ayt-geometri-ek3-DsQ6IcWH.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-kimya-ek-F-VuSwNq.js","./assets/ayt-kimya-ek3-CAACcm0i.js","./assets/ayt-kimya-ek6-eHl7kOJW.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/ayt-matematik-ek-BVa56jU1.js","./assets/ayt-matematik-ek3-4XDOjC_P.js","./assets/ayt-matematik-ek4-BFBGZSiz.js","./assets/ayt-matematik-ek7-BxVovrt0.js","./assets/content-DIbLJg7J.js","./assets/localAssistant-rpvhGyHJ.js","./assets/lookup-gthw6FW8.js","./assets/notebookStore-Bz1Cuxdl.js","./assets/officialResources-C4pYIVk_.js","./assets/pet-BQTcDTa7.js","./assets/photoStore-BPDgct-X.js","./assets/recommendations-CKjsjks_.js","./assets/testLauncher-iBFJjv95.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-biyoloji-ek3-BAU2R-O6.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-cografya-ek-u40yRQiD.js","./assets/tyt-cografya-ek3-HFGVOmQf.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-din-ek-D5ZChKCt.js","./assets/tyt-din-ek4-D8POvi_R.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-felsefe-ek4-DqjI4MFw.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-fizik-ek-Co7-gA8M.js","./assets/tyt-fizik-ek3-BIU5g6Xn.js","./assets/tyt-fizik-ek4-BsomiPbc.js","./assets/tyt-fizik-ek6-BDLLIWkv.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-geometri-ek3-XlonEgkw.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-kimya-ek-CDKQAW2_.js","./assets/tyt-kimya-ek3-De1m9Ehj.js","./assets/tyt-kimya-ek4-ClFBIgMw.js","./assets/tyt-kimya-ek6-DfrN2bDR.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-matematik-ek-B6ciMFJq.js","./assets/tyt-matematik-ek3-CF3j_8DV.js","./assets/tyt-matematik-ek4-8E7xhKWI.js","./assets/tyt-matematik-ek7-D9kRM5SU.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-ek2-Cg3hsLIY.js","./assets/tyt-tarih-ek3-CiapcSTg.js","./assets/tyt-tarih-ek4-CEuVRhKD.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-ek-C8PPd6yw.js","./assets/tyt-turkce-ek3-DsCEG_kC.js","./assets/tyt-turkce-ek4-Dshepod_.js","./assets/tyt-turkce-ek7-CN6L7pOL.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-CQxAR2XN.js","./assets/useLoad-DDI2u3O2.js","./assets/index-Bc1UXaOt.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

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
