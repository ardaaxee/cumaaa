/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-b6bc26024b31';
const PRECACHE = ["./","./index.html","./assets/index-NKcSpL9a.js","./assets/AskName-DHoCpbbk.js","./assets/BadgesPage-DDaapv3T.js","./assets/CardsPage-B0xTtp9w.js","./assets/Charts-4XPi6Uxr.js","./assets/CoachPage-Z6iiSgw6.js","./assets/FocusPage-Dxj4kt4Z.js","./assets/FormulasPage-D95PQHu5.js","./assets/GuidePage-DhlATNd6.js","./assets/HomePage-DHxTDLoI.js","./assets/InlineQuiz-EZG32CKY.js","./assets/LiveTogetherPage-DgsZnt7L.js","./assets/MocksPage-jbThhTbW.js","./assets/MorePage-APHkPwvn.js","./assets/NotFoundPage-uJgXHjPT.js","./assets/NotebookRouter-HFKPL9j4.js","./assets/OnboardingPage-rfs_3RIq.js","./assets/OsymPage-sL7I3HG1.js","./assets/PartnerPage-DpaWDwWg.js","./assets/PetPage-BXtu83km.js","./assets/PlanPage-dxtQ-ca2.js","./assets/ProgressPage-D-PPRCrs.js","./assets/QuestionView-WM0x5ozJ.js","./assets/RecoveryPage-XUWorutC.js","./assets/ReportPage-DPgXIwqB.js","./assets/ResourcesPage-D5yRxWOP.js","./assets/ReviewsPage-16TRwB8e.js","./assets/SavedPage-B55hJ7tk.js","./assets/SettingsPage-Jx37jSfh.js","./assets/StudyPage-DyXt-Ctv.js","./assets/SubjectPage-x6SQmElm.js","./assets/SubjectsPage-d5qjD205.js","./assets/TeacherPage-CFxnnviA.js","./assets/TestResultPage-cfur8EIt.js","./assets/TestRunnerPage-B1c5-HG-.js","./assets/TestSetupPage-B3YkVt6L.js","./assets/TopicPage-BVaVSF2t.js","./assets/WrongsPage-C6FBv5-g.js","./assets/actions-DEbD0-8e.js","./assets/adaptiveStudy-BuIonl2f.js","./assets/analysis-8lr-mn9h.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-C-nk6it7.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-biyoloji-ek-D-gUA9yc.js","./assets/ayt-biyoloji-ek4-BdRKHMWD.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-BU5ypgmH.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-B2sVhgKh.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-fizik-ek3-DCeoHvW4.js","./assets/ayt-fizik-ek4-9nhldys4.js","./assets/ayt-fizik-ek6-CeAZEXj7.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-geometri-ek-DYnHGMWj.js","./assets/ayt-geometri-ek3-DsQ6IcWH.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-ukCD2TVT.js","./assets/ayt-kimya-ek-F-VuSwNq.js","./assets/ayt-kimya-ek3-CAACcm0i.js","./assets/ayt-kimya-ek6-DrVUSGGE.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/ayt-matematik-ek-BVa56jU1.js","./assets/ayt-matematik-ek3-4XDOjC_P.js","./assets/ayt-matematik-ek4-BFBGZSiz.js","./assets/ayt-matematik-ek7-f0s4Gg2Z.js","./assets/content-DYJ8t1iB.js","./assets/localAssistant-eiSejcJs.js","./assets/lookup-DSEpP4dg.js","./assets/notebookStore-Bz1Cuxdl.js","./assets/officialResources-C4pYIVk_.js","./assets/pet-eVjJLz8a.js","./assets/photoStore-DbCaRPwU.js","./assets/recommendations-BYgeMY4Z.js","./assets/testLauncher-mQWalg7w.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-biyoloji-ek3-BAU2R-O6.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-cografya-ek-u40yRQiD.js","./assets/tyt-cografya-ek3-HFGVOmQf.js","./assets/tyt-din-BLZN5rp3.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-ek-D5ZChKCt.js","./assets/tyt-din-ek4-D8POvi_R.js","./assets/tyt-felsefe-3AJmOagM.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-felsefe-ek4-DqjI4MFw.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-fizik-ek-Co7-gA8M.js","./assets/tyt-fizik-ek3-BIU5g6Xn.js","./assets/tyt-fizik-ek4-BsomiPbc.js","./assets/tyt-fizik-ek6-Rfszrx-r.js","./assets/tyt-fizik-j9JLs8BE.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-geometri-ek3-XlonEgkw.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-kimya-ek-CDKQAW2_.js","./assets/tyt-kimya-ek3-De1m9Ehj.js","./assets/tyt-kimya-ek4-ClFBIgMw.js","./assets/tyt-kimya-ek6-DfrN2bDR.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-B8yaSydn.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-ek-B6ciMFJq.js","./assets/tyt-matematik-ek3-CF3j_8DV.js","./assets/tyt-matematik-ek4-BjQ9qCwT.js","./assets/tyt-matematik-ek7-BVlKr5ph.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-ek2-Cg3hsLIY.js","./assets/tyt-tarih-ek3-CiapcSTg.js","./assets/tyt-tarih-ek4-CEuVRhKD.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-ek-C8PPd6yw.js","./assets/tyt-turkce-ek3-DsCEG_kC.js","./assets/tyt-turkce-ek4-Dshepod_.js","./assets/tyt-turkce-ek7-CN6L7pOL.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-CGbxXAFA.js","./assets/useLoad-DtISmSOl.js","./assets/PetPage-BJZ248u2.css","./assets/index-BXGANt_d.css","./theme-init.js","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

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
