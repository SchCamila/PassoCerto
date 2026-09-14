// Service worker do Passo Certo: cache-first para o app funcionar mesmo
// com conexão instável ou offline — o público-alvo depende disso.
const CACHE_ESTATICO = 'passo-certo-v1';

const ARQUIVOS_APP = [
  './',
  'index.html',
  'dossie.html',
  'manifest.json',
  'logo.svg',
  'logo-monocromatica.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'css/tokens.css',
  'css/styles.css',
  'js/app.js',
  'js/state.js',
  'js/regras.js',
  'js/utils.js',
  'js/trilha.js',
  'js/toast.js',
  'js/charts.js',
  'js/ocupacoes.js',
  'js/microlicoes.js',
  'js/voz.js',
  'js/telas/entrada.js',
  'js/telas/inicio.js',
  'js/telas/formalizar.js',
  'js/telas/caixa.js',
  'js/telas/direitos.js',
  'js/telas/deveres.js',
  'js/telas/perfil.js',
  'js/telas/sobre.js',
];

self.addEventListener('install', (evento) => {
  // Cada arquivo é cacheado individualmente: um arquivo ausente não deve
  // impedir o cache de todos os outros (cache.addAll falha tudo-ou-nada).
  evento.waitUntil(
    caches.open(CACHE_ESTATICO)
      .then((cache) => Promise.allSettled(
        ARQUIVOS_APP.map((arquivo) => cache.add(arquivo))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE_ESTATICO).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== 'GET') return;

  const ehMesmaOrigem = new URL(requisicao.url).origin === self.location.origin;

  if (ehMesmaOrigem) {
    // App: cache-first, com atualização em segundo plano.
    evento.respondWith(
      caches.match(requisicao).then((respostaCache) => {
        const buscaRede = fetch(requisicao)
          .then((respostaRede) => {
            caches.open(CACHE_ESTATICO).then((cache) => cache.put(requisicao, respostaRede.clone()));
            return respostaRede;
          })
          .catch(() => respostaCache);
        return respostaCache || buscaRede;
      })
    );
  } else {
    // Fontes externas: tenta a rede e guarda uma cópia para uso offline depois.
    evento.respondWith(
      fetch(requisicao)
        .then((resposta) => {
          caches.open(CACHE_ESTATICO).then((cache) => cache.put(requisicao, resposta.clone()));
          return resposta;
        })
        .catch(() => caches.match(requisicao))
    );
  }
});
