/* JAYNA PT 서비스워커 — 오프라인 실행 + 자동 업데이트
   전략: HTML 은 network-first(항상 최신 코드), 아이콘 등 정적파일은 cache-first.
   → 제가 코드를 고쳐 올리면 앱을 켤 때 바로 최신본이 뜬다. 재설치 불필요. */
const V = 'soldpt-v16';   // 8/31 — ASSETS 배열 복구(문법오류로 서비스워커 설치 실패했던 것 수정)
const ASSETS = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isDoc) {
    // 최신 코드 우선 — 오프라인이면 캐시로
    e.respondWith(
      fetch(req).then((r) => {
        const cp = r.clone();
        caches.open(V).then((c) => c.put(req, cp));
        return r;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      const cp = r.clone();
      caches.open(V).then((c) => c.put(req, cp));
      return r;
    }).catch(() => hit))
  );
});

/* 알림 클릭 → 앱 열기 (8/4) */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then((cs) => {
      for (const c of cs) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
