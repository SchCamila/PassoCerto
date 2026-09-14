import { obterEstado, atualizarDeveres } from '../state.js';
import { valorDAS, multaPorAtraso, formatarMoeda, DIA_VENCIMENTO_DAS, DIA_LIMITE_DASN } from '../regras.js';

const NOMES_MES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function mesesDoAno(ano) {
  return Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, '0')}`);
}

function diasDeAtraso(mesChave, hoje) {
  const [ano, mes] = mesChave.split('-').map(Number);
  const vencimento = new Date(ano, mes - 1, DIA_VENCIMENTO_DAS);
  if (hoje <= vencimento) return 0;
  return Math.floor((hoje - vencimento) / 86400000);
}

export function montar(container, contexto) {
  const estado = obterEstado();
  render(container, estado, contexto);
}

function render(container, estado, contexto) {
  const eMei = estado.trilhaFormalizacao.passosConcluidos.every(Boolean);

  if (!eMei) {
    container.innerHTML = `
      <h1>Deveres</h1>
      <div class="estado-vazio">
        <h3>Você ainda não é MEI</h3>
        <p>Assim que concluir os cinco passos da formalização, seus vencimentos do DAS aparecem aqui, mês a mês.</p>
        <button type="button" class="botao botao-primario" id="botao-ir-formalizar">Ver passo a passo</button>
      </div>
    `;
    container.querySelector('#botao-ir-formalizar').addEventListener('click', () => contexto.navegar('formalizar'));
    return;
  }

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const das = valorDAS(estado.usuario.tipoAtividade);
  const meses = mesesDoAno(ano);

  const linhas = meses.map((mesChave) => {
    const [, mesNum] = mesChave.split('-').map(Number);
    const pagamento = estado.deveres.pagamentos[mesChave];
    const ehFuturo = new Date(ano, mesNum - 1, 1) > hoje && mesChave !== `${ano}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const atraso = diasDeAtraso(mesChave, hoje);
    const multa = multaPorAtraso(das, atraso);

    let status = 'futuro';
    if (pagamento?.pago) status = 'pago';
    else if (ehFuturo) status = 'futuro';
    else if (atraso > 0) status = 'atrasado';
    else status = 'a-vencer';

    return { mesChave, mesNum, status, atraso, multa };
  });

  const custoAcumulado = linhas
    .filter((l) => l.status === 'pago' || l.status === 'atrasado')
    .reduce((s, l) => s + das + (l.status === 'atrasado' ? l.multa : 0), 0);

  const dataLimiteDasn = new Date(ano, DIA_LIMITE_DASN.mes - 1, DIA_LIMITE_DASN.dia);
  const dasnVencida = hoje > dataLimiteDasn;

  container.innerHTML = `
    <h1>Deveres</h1>

    <section class="cartao">
      <h2>DAS de ${ano}</h2>
      <p class="ajuda">Toque em um mês para marcar como pago. Vencimento sempre no dia ${DIA_VENCIMENTO_DAS}.</p>
      <div class="grade-12-meses">
        ${linhas.map((l) => `
          <button type="button" class="mes-celula ${l.status === 'pago' ? 'pago' : ''} ${l.status === 'atrasado' ? 'atrasado' : ''}"
                  data-mes="${l.mesChave}" ${l.status === 'futuro' ? 'disabled' : ''}
                  aria-label="${NOMES_MES_CURTO[l.mesNum - 1]}: ${rotuloStatus(l)}">
            <strong>${NOMES_MES_CURTO[l.mesNum - 1]}</strong><br>
            <span style="font-size:0.72rem">${rotuloStatus(l)}</span>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="cartao">
      <h2>Custo acumulado no ano</h2>
      <p class="numero" style="font-size:1.4rem; font-weight:700">${formatarMoeda(custoAcumulado)}</p>
      <p class="ajuda">Soma do DAS dos meses pagos ou em atraso, já com a multa de quem está atrasado.</p>
    </section>

    <section class="cartao" style="background:${dasnVencida ? 'var(--critical-bg)' : 'var(--brand-light)'}">
      <h2 style="margin-bottom:0.3rem">Declaração anual (DASN-SIMEI)</h2>
      <p style="margin:0"><strong>DASN-SIMEI</strong> é a declaração anual do MEI — informa quanto você faturou no ano.</p>
      <p style="margin-top:0.5rem">${dasnVencida
        ? `O prazo deste ano (31 de maio) já passou. Regularize o quanto antes pelo Meu MEI Digital.`
        : `Prazo: até 31 de maio de ${ano}.`}</p>
    </section>

    <section class="cartao">
      <h2>Regra do desenquadramento</h2>
      <p>Até <strong class="numero">R$ 81.000</strong> por ano, tudo normal. Entre <strong class="numero">R$ 81.000</strong> e
      <strong class="numero">R$ 97.200</strong>, você segue MEI até dezembro pagando a diferença de imposto. Acima de
      <strong class="numero">R$ 97.200</strong>, o desenquadramento é imediato e retroativo ao início do ano.</p>
    </section>
  `;

  container.querySelectorAll('[data-mes]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const mesChave = botao.dataset.mes;
      const pagoAtual = !!estado.deveres.pagamentos[mesChave]?.pago;
      estado.deveres = atualizarDeveres(mesChave, { pago: !pagoAtual, dataPagamento: new Date().toISOString() });
      render(container, estado, contexto);
    });
  });
}

function rotuloStatus(l) {
  if (l.status === 'pago') return 'Pago';
  if (l.status === 'atrasado') return `${l.atraso}d de atraso`;
  if (l.status === 'a-vencer') return 'A vencer';
  return '—';
}
