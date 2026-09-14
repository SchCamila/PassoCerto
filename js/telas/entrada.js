// Entrada + login sem senha (3 passos) + identificação inicial.
// Tudo fica em memória local até a confirmação final, quando é salvo em
// js/state.js — assim um "Voltar" no meio do caminho não grava nada.
import { obterEstado, atualizarUsuario, restaurarDemonstracao } from '../state.js';
import { mostrarToast } from '../toast.js';

const OCUPACOES = [
  { label: 'Costureira', tipo: 'servico' },
  { label: 'Cabeleireira', tipo: 'servico' },
  { label: 'Manicure', tipo: 'servico' },
  { label: 'Diarista', tipo: 'servico' },
  { label: 'Motorista de aplicativo', tipo: 'servico' },
  { label: 'Pedreiro', tipo: 'servico' },
  { label: 'Eletricista', tipo: 'servico' },
  { label: 'Vendedor ambulante', tipo: 'comercio' },
  { label: 'Cozinheira / marmiteira', tipo: 'comercio' },
  { label: 'Outro', tipo: 'servico' },
];

function estadoInicialLocal() {
  const { usuario } = obterEstado();
  return {
    etapa: 'boasvindas',
    celular: usuario.celular || '',
    codigo: ['', '', '', ''],
    tentativaErrada: false,
    reenviarEm: 0,
    ocupacaoEscolhida: usuario.ocupacao || '',
    ocupacaoLivre: usuario.ocupacaoLivre || '',
    tipoAtividade: usuario.tipoAtividade || 'servico',
    renda: usuario.renda || '',
    nome: usuario.nome || '',
    usuarioConhecido: !!usuario.nome,
  };
}

function formatarCelular(digitos) {
  const d = digitos.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function montar(container, { navegar }) {
  const local = estadoInicialLocal();
  render(container, local, navegar);
}

function render(container, local, navegar) {
  container.innerHTML = telaAtual(local);
  ligarEventos(container, local, navegar);
}

function telaAtual(local) {
  switch (local.etapa) {
    case 'boasvindas': return telaBoasVindas();
    case 'celular': return telaCelular(local);
    case 'codigo': return telaCodigo(local);
    case 'identidade': return telaIdentidade(local);
    case 'confirmacao': return telaConfirmacao(local);
    default: return telaBoasVindas();
  }
}

function telaBoasVindas() {
  return `
    <section class="tela-entrada">
      <div style="text-align:center; padding: 1.5rem 0 1rem;">
        <img src="logo.svg" width="64" height="64" alt="" style="border-radius:18px">
        <h1 style="margin-top:1rem">Passo Certo</h1>
        <p style="color:var(--secondary); font-size:1.05rem">
          Descubra se vale a pena virar MEI — e cuide disso sem se perder.
        </p>
      </div>

      <div class="cartao">
        <p><strong>💰 Simule com a sua renda.</strong> Quanto custa por dia, quanto custa por mês, o que muda no seu bolso.</p>
      </div>
      <div class="cartao">
        <p><strong>🛡️ Veja o que você ganha.</strong> Auxílio-doença, licença-maternidade, aposentadoria — o que cada contribuição destrava.</p>
      </div>
      <div class="cartao">
        <p><strong>🗂️ Organize seu caixa.</strong> Anote entradas e saídas e gere um comprovante de renda para pedir crédito.</p>
      </div>

      <button type="button" class="botao botao-primario" id="botao-comecar" style="margin-top:0.5rem">Começar</button>
      <button type="button" class="botao-texto" id="botao-conhecer" style="width:100%; text-align:center; margin-top:0.5rem">
        Só quero conhecer o app
      </button>

      <p class="linha-confianca" style="margin-top:1rem">
        Grátis · sem anúncios · seus dados ficam só neste aparelho
      </p>
    </section>
  `;
}

function cabecalhoPasso(numero, titulo, aoVoltar) {
  return `
    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
      <button type="button" class="botao-icone" data-acao="voltar" aria-label="Voltar">←</button>
      <div>
        <p style="margin:0; font-size:0.8rem; color:var(--muted)">Passo ${numero} de 3</p>
        <h2 style="margin:0">${titulo}</h2>
      </div>
    </div>
  `;
}

function telaCelular(local) {
  return `
    <section>
      ${cabecalhoPasso(1, 'Seu celular', true)}
      <div class="cartao">
        <p style="margin-bottom:0.5rem">Antes de pedir seu número, três garantias:</p>
        <ul style="margin:0 0 0 1.2rem; padding:0; color:var(--secondary)">
          <li>Você nunca vai precisar criar senha.</li>
          <li>Ninguém liga nem manda propaganda para esse número.</li>
          <li>Ele fica salvo só neste aparelho, e você pode apagar quando quiser.</li>
        </ul>
      </div>
      <div class="campo">
        <label for="campo-celular">Número de celular</label>
        <input type="tel" inputmode="numeric" id="campo-celular" autocomplete="tel"
               placeholder="(21) 98765-4321" value="${formatarCelular(local.celular)}" aria-describedby="ajuda-celular">
        <p class="ajuda" id="ajuda-celular">Vamos mandar um código de 4 dígitos para confirmar.</p>
      </div>
      <button type="button" class="botao botao-primario" id="botao-continuar-celular" disabled>Continuar</button>
    </section>
  `;
}

function telaCodigo(local) {
  return `
    <section>
      ${cabecalhoPasso(2, 'Confirme o código', true)}
      <p>Enviamos um código de 4 dígitos para <strong>${formatarCelular(local.celular)}</strong>.</p>
      <div class="microlicao">
        Este é um protótipo acadêmico: nenhum SMS é enviado de verdade. O código de teste é sempre <strong>1234</strong>.
      </div>
      <div style="display:flex; gap:0.6rem; justify-content:center; margin:1rem 0" role="group" aria-label="Código de 4 dígitos">
        ${[0, 1, 2, 3].map((i) => `
          <input type="text" inputmode="numeric" maxlength="1" class="campo-codigo" data-indice="${i}"
                 value="${local.codigo[i]}" aria-label="Dígito ${i + 1} de 4"
                 style="width:3rem; height:3.2rem; text-align:center; font-size:1.4rem; border:1px solid var(--line); border-radius:var(--radius-sm); background:var(--card); color:var(--ink)">
        `).join('')}
      </div>
      <p id="erro-codigo" role="alert" style="color:var(--critical); min-height:1.2em; text-align:center">
        ${local.tentativaErrada ? 'Código incorreto. Tente 1234.' : ''}
      </p>
      <button type="button" class="botao-texto" id="botao-reenviar" style="width:100%; text-align:center" ${local.reenviarEm > 0 ? 'disabled' : ''}>
        ${local.reenviarEm > 0 ? `Reenviar código em ${local.reenviarEm}s` : 'Reenviar código'}
      </button>
    </section>
  `;
}

function telaIdentidade(local) {
  return `
    <section>
      ${cabecalhoPasso(3, 'Quem é você', true)}
      <div class="campo">
        <label for="campo-nome">Seu nome</label>
        <input type="text" id="campo-nome" autocomplete="name" value="${local.nome}" placeholder="Como quer ser chamada(o)?">
      </div>

      <div class="campo">
        <label id="rotulo-ocupacao">Sua ocupação</label>
        <div role="group" aria-labelledby="rotulo-ocupacao" style="display:flex; flex-wrap:wrap; gap:0.5rem">
          ${OCUPACOES.map((o) => `
            <button type="button" class="botao-chip" data-ocupacao="${o.label}" data-tipo="${o.tipo}"
              style="min-height:var(--tap-min); padding:0.5rem 0.9rem; border-radius:999px; border:1px solid var(--line);
                     background:${local.ocupacaoEscolhida === o.label ? 'var(--brand-light)' : 'var(--card)'};
                     border-color:${local.ocupacaoEscolhida === o.label ? 'var(--brand)' : 'var(--line)'};
                     color:${local.ocupacaoEscolhida === o.label ? 'var(--brand)' : 'var(--ink)'}; cursor:pointer">
              ${o.label}
            </button>
          `).join('')}
        </div>
        ${local.ocupacaoEscolhida === 'Outro' ? `
          <input type="text" id="campo-ocupacao-livre" placeholder="Diga qual é a sua ocupação" value="${local.ocupacaoLivre}" style="margin-top:0.6rem; width:100%; min-height:var(--tap-min); padding:0.6rem; border:1px solid var(--line); border-radius:var(--radius-sm); background:var(--card); color:var(--ink)">
        ` : ''}
      </div>

      <div class="campo">
        <label for="campo-renda">Quanto entra por mês, mais ou menos?</label>
        <input type="number" inputmode="numeric" id="campo-renda" value="${local.renda}" placeholder="R$" min="0" aria-describedby="ajuda-renda">
        <p class="ajuda" id="ajuda-renda">Uma média já ajuda — dá para ajustar depois.</p>
      </div>

      <button type="button" class="botao botao-primario" id="botao-continuar-identidade">Continuar</button>
    </section>
  `;
}

function telaConfirmacao(local) {
  const ocupacao = local.ocupacaoEscolhida === 'Outro' ? local.ocupacaoLivre : local.ocupacaoEscolhida;
  return `
    <section style="text-align:center; padding-top:1rem">
      <div style="font-size:3rem">✅</div>
      <h1>Tudo pronto, ${local.nome || 'você'}!</h1>
      ${local.usuarioConhecido ? `
        <p style="color:var(--secondary)">Que bom te ver de novo. Continuamos de onde você parou.</p>
      ` : `
        <div class="cartao" style="text-align:left">
          <p style="margin:0 0 0.4rem"><strong>Ocupação:</strong> ${ocupacao || '—'}</p>
          <p style="margin:0 0 0.4rem"><strong>Renda aproximada:</strong> R$ ${local.renda || '0'} por mês</p>
          <p style="margin:0"><strong>Celular:</strong> ${formatarCelular(local.celular)}</p>
        </div>
      `}
      <button type="button" class="botao botao-primario" id="botao-entrar-app" style="margin-top:1rem">Começar a usar</button>
    </section>
  `;
}

function ligarEventos(container, local, navegar) {
  container.querySelector('#botao-comecar')?.addEventListener('click', () => {
    local.etapa = 'celular';
    render(container, local, navegar);
  });

  container.querySelector('#botao-conhecer')?.addEventListener('click', () => {
    restaurarDemonstracao();
    mostrarToast({ mensagem: 'Mostrando o app com dados de demonstração.' });
    navegar('inicio');
  });

  container.querySelector('[data-acao="voltar"]')?.addEventListener('click', () => {
    const anterior = { celular: 'boasvindas', codigo: 'celular', identidade: 'codigo', confirmacao: 'identidade' };
    local.etapa = anterior[local.etapa] || 'boasvindas';
    render(container, local, navegar);
  });

  const campoCelular = container.querySelector('#campo-celular');
  if (campoCelular) {
    const botaoContinuar = container.querySelector('#botao-continuar-celular');
    const validar = () => {
      local.celular = campoCelular.value.replace(/\D/g, '');
      campoCelular.value = formatarCelular(local.celular);
      botaoContinuar.disabled = local.celular.length < 10;
    };
    campoCelular.addEventListener('input', validar);
    validar();
    botaoContinuar.addEventListener('click', () => {
      local.etapa = 'codigo';
      local.codigo = ['', '', '', ''];
      local.tentativaErrada = false;
      local.reenviarEm = 20;
      render(container, local, navegar);
      iniciarContagemReenvio(container, local, navegar);
    });
  }

  const caixasCodigo = container.querySelectorAll('.campo-codigo');
  if (caixasCodigo.length) {
    caixasCodigo.forEach((caixa, indice) => {
      caixa.addEventListener('input', () => {
        const valor = caixa.value.replace(/\D/g, '').slice(-1);
        caixa.value = valor;
        local.codigo[indice] = valor;
        if (valor && caixasCodigo[indice + 1]) caixasCodigo[indice + 1].focus();
        verificarCodigoCompleto(container, local, navegar);
      });
      caixa.addEventListener('keydown', (evento) => {
        if (evento.key === 'Backspace' && !caixa.value && caixasCodigo[indice - 1]) {
          caixasCodigo[indice - 1].focus();
        }
      });
      caixa.addEventListener('paste', (evento) => {
        evento.preventDefault();
        const colado = (evento.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4);
        colado.split('').forEach((digito, i) => {
          local.codigo[i] = digito;
          if (caixasCodigo[i]) caixasCodigo[i].value = digito;
        });
        (caixasCodigo[colado.length - 1] || caixasCodigo[caixasCodigo.length - 1])?.focus();
        verificarCodigoCompleto(container, local, navegar);
      });
    });
    caixasCodigo[0].focus();
    iniciarContagemReenvio(container, local, navegar);
  }

  container.querySelector('#botao-reenviar')?.addEventListener('click', () => {
    local.reenviarEm = 20;
    mostrarToast({ mensagem: 'Código reenviado (lembrete: é sempre 1234 neste protótipo).' });
    render(container, local, navegar);
    iniciarContagemReenvio(container, local, navegar);
  });

  const chips = container.querySelectorAll('[data-ocupacao]');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      local.ocupacaoEscolhida = chip.dataset.ocupacao;
      local.tipoAtividade = chip.dataset.tipo;
      render(container, local, navegar);
    });
  });

  container.querySelector('#campo-ocupacao-livre')?.addEventListener('input', (e) => {
    local.ocupacaoLivre = e.target.value;
  });
  container.querySelector('#campo-nome')?.addEventListener('input', (e) => {
    local.nome = e.target.value;
  });
  container.querySelector('#campo-renda')?.addEventListener('input', (e) => {
    local.renda = e.target.value;
  });

  container.querySelector('#botao-continuar-identidade')?.addEventListener('click', () => {
    if (!local.nome.trim()) {
      mostrarToast({ mensagem: 'Precisamos do seu nome para continuar.', urgente: true });
      return;
    }
    local.etapa = 'confirmacao';
    render(container, local, navegar);
  });

  container.querySelector('#botao-entrar-app')?.addEventListener('click', () => {
    atualizarUsuario({
      nome: local.nome,
      celular: local.celular,
      ocupacao: local.ocupacaoEscolhida,
      ocupacaoLivre: local.ocupacaoLivre,
      tipoAtividade: local.tipoAtividade,
      renda: Number(local.renda) || 0,
      onboardingCompleto: true,
    });
    mostrarToast({ mensagem: `Bem-vindo(a), ${local.nome}!` });
    navegar('inicio');
  });
}

function verificarCodigoCompleto(container, local, navegar) {
  if (local.codigo.some((d) => d === '')) return;
  const codigoDigitado = local.codigo.join('');
  if (codigoDigitado === '1234') {
    local.tentativaErrada = false;
    local.etapa = local.usuarioConhecido ? 'confirmacao' : 'identidade';
    render(container, local, navegar);
  } else {
    local.tentativaErrada = true;
    local.codigo = ['', '', '', ''];
    render(container, local, navegar);
  }
}

let timerReenvio = null;
function iniciarContagemReenvio(container, local, navegar) {
  clearInterval(timerReenvio);
  if (local.reenviarEm <= 0) return;
  timerReenvio = setInterval(() => {
    local.reenviarEm -= 1;
    const botao = container.querySelector('#botao-reenviar');
    if (!botao) { clearInterval(timerReenvio); return; }
    if (local.reenviarEm <= 0) {
      botao.disabled = false;
      botao.textContent = 'Reenviar código';
      clearInterval(timerReenvio);
    } else {
      botao.disabled = true;
      botao.textContent = `Reenviar código em ${local.reenviarEm}s`;
    }
  }, 1000);
}
