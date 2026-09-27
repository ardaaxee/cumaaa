// Sayfa boyanmadan önce kayıtlı temayı uygular (yanıp sönmeyi önler).
try {
  var s = JSON.parse(localStorage.getItem('iyikiYks.state.v3') || 'null');
  var t = s && s.settings && s.settings.theme;
  if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
} catch (e) {}
