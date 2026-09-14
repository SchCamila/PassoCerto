import { obterEstado } from '../state.js';
import { projecaoAnual, statusTeto, alertaTeto, TETO, formatarMoeda } from '../regras.js';
import { PASSOS_FORMALIZACAO } from '../trilha.js';
import { mesAtual, nomeMes } from '../utils.js';

export function montar(container, { navegar }) {
  const estado = obterEstado();
  const { usuario, lancamentos, trilhaFormalizacao } = estado;

  const mes = mesAtual();
  const doMes = lancamentos.filter((l) => l.mes === mes);
  const entradasMes = doMes.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
  const saidasMes = doMes.filter((l) => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
  const saldoMes = entradasMes - saidasMes;

  const projecao = projecaoAnual(lancamentos);
  const percentualTeto = Math.min((projecao / TETO) * 100, 100);
  const status = statusTeto(projecao);

  const passosConcluidos = trilhaFormalizacao.passosConcluidos.filter(Boolean).length;
  const eMei = passosConcluidos === PASSOS_FORMALIZACAO.length;

  const alertas = [];
  if (alertaTeto(projecao) && lancamentos.length > 0) {
    alertas.push({ tipo: 'amber', texto: 'Seu faturamento projetado já passou de 80% do limite anual do MEI. Vale ficar de olho.' });
  }
  if (!eMei && lancamentos.length >= 3) {
    alertas.push({ tipo: 'brand', texto: 'Você já tem lançamentos suficientes para simular se compensa virar MEI.' });
  }

  const ultimosLancamentos = [...lancamentos]
    .sort((a, b) => (a.mes < b.mes ? 1 : a.mes > b.mes ? -1 : 0))
    .slice(0, 5);

  container.innerHTML = `
    <h1>Olá, ${usuario.nome ? usuario.nome.split(' ')[0] : 'você'}</h1>

    <section class="cartao">
      <h2 style="margin-bottom:0.25rem">Seu passo a passo</h2>
      <p style="color:var(--muted); margin-bottom:0.5rem">${passosConcluidos} de ${PASSOS_FORMALIZACAO.length} passos concluídos</p>
      <div class="progresso-linha"><div class="progresso-linha__preenchido" style="width:${(passosConcluidos / PASSOS_FORMALIZACAO.length) * 100}%"></div></div>
      <button type="button" class="botao botao-secundario" style="margin-top:0.75rem" data-ir="formalizar">
        ${eMei ? 'Ver situação de MEI' : 'Continuar a trilha'}
      </button>
    </section>

    ${alertas.length ? `
      <section aria-live="polite">
        ${alertas.map((a) => `<div class="cartao selo-${a.tipo}" style="background:${a.tipo === 'amber' ? 'var(--amber-bg)' : 'var(--brand-light)'}; color:${a.tipo === 'amber' ? 'var(--amber)' : 'var(--brand)'}">${a.texto}</div>`).join('')}
      </section>
    ` : ''}

    <section class="cartao">
      <h2>Este mês (${nomeMes(mes)})</h2>
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem">
        <span>Entrou</span><span class="numero">${formatarMoeda(entradasMes)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem">
        <span>Saiu</span><span class="numero">${formatarMoeda(saidasMes)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px solid var(--line); padding-top:0.5rem">
        <span>Saldo</span><span class="numero" style="color:${saldoMes >= 0 ? 'var(--brand)' : 'var(--critical)'}">${formatarMoeda(saldoMes)}</span>
      </div>
    </section>

    <section class="cartao">
      <h2>Faturamento do ano</h2>
      <p style="color:var(--muted)">Projeção: <strong class="numero">${formatarMoeda(projecao)}</strong> de um limite de <strong class="numero">${formatarMoeda(TETO)}</strong></p>
      <div class="progresso-linha"><div class="progresso-linha__preenchido" style="width:${percentualTeto}%; background:${status === 'dentro' ? 'var(--brand)' : status === 'entre-teto-e-tolerancia' ? 'var(--amber)' : 'var(--critical)'}"></div></div>
    </section>

    <section class="cartao">
      <div style="display:flex; justify-content:space-between; align-items:center">
        <h2 style="margin:0">Últimos lançamentos</h2>
        <button type="button" class="botao-texto" data-ir="caixa">Ver tudo</button>
      </div>
      ${ultimosLancamentos.length === 0 ? `
        <div class="estado-vazio">
          <h3>Nada por aqui ainda</h3>
          <p>Registre sua primeira venda ou despesa na aba Caixa.</p>
          <button type="button" class="botao botao-primario" data-ir="caixa">Registrar primeiro lançamento</button>
        </div>
      ` : ultimosLancamentos.map((l) => `
        <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid var(--line)">
          <span>${l.descricao}</span>
          <span class="numero" style="color:${l.tipo === 'entrada' ? 'var(--brand)' : 'var(--critical)'}">
            ${l.tipo === 'entrada' ? '+' : '−'} ${formatarMoeda(l.valor)}
          </span>
        </div>
      `).join('')}
    </section>
  `;

  container.querySelectorAll('[data-ir]').forEach((el) => {
    el.addEventListener('click', () => navegar(el.dataset.ir));
  });
}
