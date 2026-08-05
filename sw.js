// 자가 파괴 SW — 옛 캐시/서비스워커 제거 후 새 주소(폰pt)로 (8/5)
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => { e.waitUntil((async () => {
  try { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } catch(_){}
  try { await self.clients.claim(); } catch(_){}
  try { await self.registration.unregister(); } catch(_){}
  try { const cs = await self.clients.matchAll({type:"window"}); for (const c of cs){ try{ c.navigate(c.url); }catch(_){ try{ c.postMessage("reload"); }catch(__){} } } } catch(_){}
})()); });
self.addEventListener("fetch", e => { e.respondWith(fetch(e.request).catch(()=> new Response("", {status:504}))); });
