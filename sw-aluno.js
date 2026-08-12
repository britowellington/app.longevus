// Service Worker do app do aluno (Meu Treino) — Wellington Brito
// Estratégia: network-first para o HTML (sempre busca a versão mais nova quando
// há internet), com fallback pro cache quando estiver offline. Isso evita que o
// aluno fique "travado" numa versão antiga depois que você atualizar o arquivo.
//
// v2: agora força fetch({cache:"no-store"}) pra ignorar completamente o cache
// HTTP do navegador (antes, mesmo em modo "network-first", o Chrome podia
// responder com uma cópia em cache sem nem chegar a acessar a internet).

const CACHE_NAME = "meutreino-cache-v2"; // troque para v3, v4... se quiser forçar limpeza de cache
const APP_SHELL = [
  "./aluno.html",
  "./manifest-aluno.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Só cuida de requisições GET da própria origem (não mexe em chamadas ao Supabase)
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req, { cache: "no-store" }) // ignora o cache HTTP, sempre busca fresco
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});

