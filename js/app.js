// Roteador e shell do Passo Certo: alterna entre telas dentro de #conteudo,
// aplica preferências de exibição e monta a navegação por abas.
import { obterEstado, atualizarPreferencias } from './state.js';

const ABAS = [
  { id: 'inicio', label: 'Início', svg: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/>' },
  { id: 'formalizar', label: 'Formalizar', svg: '<path d="M9 12.5l2 2 4-4.5"/><circle cx="12" cy="12" r="9"/>' },
  { id: 'caixa', label: 'Caixa', svg: '<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M3.5 10.5h17"/><path d="M8 7V6a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1"/>' },
  { id: 'direitos', label: 'Direitos', svg: '<path d="M12 3.5l7 3v5c0 5-3 8.5-7 9.5-4-1-7-4.5-7-9.5v-5z"/><path d="M9 12l2 2 4-4"/>' },
  { id: 'deveres', label: 'Deveres', svg: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16"/><path d="M8 3v4M16 3v4"/>' },
  { id: 'perfil', label: 'Perfil', svg: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6"/>' },
];

let rotaAtual = 'entrada';
const contexto = { navegar };

function icone(svg) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>`;
}

function aplicarPreferencias() {
  const { preferencias } = obterEstado();
  const raiz = document.documentElement;

  raiz.classList.toggle('texto-grande', !!preferencias.fonteAumentada);
  document.getElementById('botao-letra-maior')?.setAttribute('aria-pressed', String(!!preferencias.fonteAumentada));

  if (preferencias.tema === 'claro') raiz.setAttribute('data-theme', 'light');
  else if (preferencias.tema === 'escuro') raiz.setAttribute('data-theme', 'dark');
  else raiz.removeAttribute('data-theme');

  const iconeTema = document.getElementById('icone-tema');
  if (iconeTema) {
    iconeTema.textContent = preferencias.tema === 'claro' ? '☀️' : preferencias.tema === 'escuro' ? '🌙' : '🌗';
  }

  raiz.toggleAttribute('data-contraste-alto', !!preferencias.altoContraste);
  if (preferencias.altoContraste) raiz.setAttribute('data-contraste', 'alto');
  else raiz.removeAttribute('data-contraste');
}

function montarNavAbas() {
  const nav = document.getElementById('nav-abas');
  const { usuario } = obterEstado();
  if (!usuario.onboardingCompleto) {
    nav.hidden = true;
    nav.innerHTML = '';
    return;
  }
  nav.hidden = false;
  nav.innerHTML = ABAS.map((aba) => `
    <button type="button" class="nav-abas__item" data-rota="${aba.id}" ${rotaAtual === aba.id ? 'aria-current="page"' : ''}>
      ${icone(aba.svg)}
      <span>${aba.label}</span>
    </button>
  `).join('');
  nav.querySelectorAll('[data-rota]').forEach((botao) => {
    botao.addEventListener('click', () => navegar(botao.dataset.rota));
  });
}

function telaEmConstrucao(nome) {
  return `
    <section class="cartao">
      <h2>${nome}</h2>
      <p>Esta tela ainda está sendo construída nesta entrega incremental.</p>
    </section>
  `;
}

export async function navegar(rota) {
  const { usuario } = obterEstado();
  rotaAtual = usuario.onboardingCompleto ? rota : 'entrada';

  montarNavAbas();
  const container = document.getElementById('conteudo');
  container.innerHTML = '';
  container.focus();

  const modulos = {
    entrada: () => import('./telas/entrada.js').then((m) => m.montar(container, contexto)),
    inicio: () => import('./telas/inicio.js').then((m) => m.montar(container, contexto)),
    formalizar: () => import('./telas/formalizar.js').then((m) => m.montar(container, contexto)),
    caixa: () => import('./telas/caixa.js').then((m) => m.montar(container, contexto)),
    direitos: () => import('./telas/direitos.js').then((m) => m.montar(container, contexto)),
    deveres: () => import('./telas/deveres.js').then((m) => m.montar(container, contexto)),
    perfil: () => import('./telas/perfil.js').then((m) => m.montar(container, contexto)),
    sobre: () => import('./telas/sobre.js').then((m) => m.montar(container, contexto)),
  };

  try {
    await modulos[rotaAtual]();
  } catch (erro) {
    console.error(erro);
    container.innerHTML = telaEmConstrucao(rotaAtual);
  }

  window.scrollTo(0, 0);
}

function configurarControlesTopo() {
  document.getElementById('botao-letra-maior').addEventListener('click', () => {
    const { preferencias } = obterEstado();
    atualizarPreferencias({ fonteAumentada: !preferencias.fonteAumentada });
    aplicarPreferencias();
  });

  document.getElementById('botao-tema').addEventListener('click', () => {
    const { preferencias } = obterEstado();
    const proximo = { sistema: 'claro', claro: 'escuro', escuro: 'sistema' }[preferencias.tema] ?? 'sistema';
    atualizarPreferencias({ tema: proximo });
    aplicarPreferencias();
  });
}

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {
    /* sem service worker, o app continua funcionando online normalmente */
  });
}

function iniciar() {
  aplicarPreferencias();
  configurarControlesTopo();
  registrarServiceWorker();
  const { usuario } = obterEstado();
  navegar(usuario.onboardingCompleto ? 'inicio' : 'entrada');
}

iniciar();
