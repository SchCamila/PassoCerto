import { obterEstado, adicionarLancamento, removerLancamento, restaurarLancamento } from '../state.js';
import { formatarMoeda, precoSugerido, projecaoAnual, TETO } from '../regras.js';
import { mesAtual, nomeMes, nomeMesCurto, ultimosMeses } from '../utils.js';
import { gerarGraficoBarras } from '../charts.js';
import { mostrarToast } from '../toast.js';

const FORMAS = [
  { valor: 'pix', label: 'Pix' },
  { valor: 'dinheiro', label: 'Dinheiro' },
  { valor: 'cartao', label: 'Cartão' },
];

function mesesParaSelecao() {
  return ultimosMeses(12).reverse();
}

function listaOrdenada(lancamentos) {
  return lancamentos
    .map((l, i) => ({ ...l, _indice: i }))
    .sort((a, b) => (b.mes > a.mes ? 1 : b.mes < a.mes ? -1 : b._indice - a._indice));
}

export function montar(container, contexto) {
  const estado = obterEstado();
  render(container, estado, contexto);
}

function render(container, estado, contexto) {
  const meses6 = ultimosMeses(6);
  const dadosGrafico = meses6.map((mes) => {
    const doMes = estado.lancamentos.filter((l) => l.mes === mes);
    return {
      rotulo: nomeMesCurto(mes),
      entrada: doMes.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0),
      saida: doMes.filter((l) => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0),
    };
  });

  const ordenados = listaOrdenada(estado.lancamentos);

  container.innerHTML = `
    <h1>Caixa</h1>

    <section class="cartao">
      <h2>Novo lançamento</h2>
      <form id="form-lancamento">
        <div class="campo">
          <label id="rotulo-tipo">Tipo</label>
          <div role="group" aria-labelledby="rotulo-tipo" style="display:flex; gap:0.5rem">
            <button type="button" class="botao" data-tipo="entrada" style="background:var(--brand-light); color:var(--brand); border:2px solid var(--brand)">Entrou dinheiro</button>
            <button type="button" class="botao" data-tipo="saida" style="background:var(--card); color:var(--ink); border:2px solid var(--line)">Saiu dinheiro</button>
          </div>
          <input type="hidden" id="campo-tipo" value="entrada">
        </div>
        <div class="campo">
          <label for="campo-descricao">Descrição</label>
          <input type="text" id="campo-descricao" placeholder="Ex.: Ajuste de calça" required>
        </div>
        <div class="campo">
          <label for="campo-valor">Valor</label>
          <input type="number" inputmode="decimal" id="campo-valor" placeholder="R$" min="0" step="0.01" required>
        </div>
        <div class="campo">
          <label for="campo-mes">Mês</label>
          <select id="campo-mes">
            ${mesesParaSelecao().map((m) => `<option value="${m}" ${m === mesAtual() ? 'selected' : ''}>${nomeMes(m)}</option>`).join('')}
          </select>
        </div>
        <div class="campo">
          <label for="campo-forma">Forma de recebimento</label>
          <select id="campo-forma">
            ${FORMAS.map((f) => `<option value="${f.valor}">${f.label}</option>`).join('')}
          </select>
        </div>
        <button type="submit" class="botao botao-primario">Salvar lançamento</button>
      </form>
    </section>

    <section class="cartao">
      <h2>Últimos seis meses</h2>
      <div id="grafico-caixa"></div>
    </section>

    <section class="cartao">
      <h2>Calculadora: quanto cobrar</h2>
      <p class="ajuda">Some o material, as horas de trabalho e quanto você quer ganhar por hora.</p>
      <div class="campo">
        <label for="calc-horas">Horas de trabalho</label>
        <input type="number" inputmode="decimal" id="calc-horas" min="0" step="0.5" value="0">
      </div>
      <div class="campo">
        <label for="calc-material">Custo do material</label>
        <input type="number" inputmode="decimal" id="calc-material" min="0" step="0.01" value="0">
      </div>
      <div class="campo">
        <label for="calc-valor-hora">Quanto você quer ganhar por hora</label>
        <input type="number" inputmode="decimal" id="calc-valor-hora" min="0" step="0.5" value="0">
      </div>
      <p style="text-align:center; margin:0">
        <span style="color:var(--muted)">Preço sugerido</span><br>
        <span class="numero" id="resultado-calculadora" style="font-size:1.6rem; font-weight:700">R$ 0,00</span>
      </p>
    </section>

    <section class="cartao">
      <h2>Comprovante de renda</h2>
      <p class="ajuda">Um documento com seu faturamento mês a mês, para pedir crédito ou provar renda.</p>
      <button type="button" class="botao botao-secundario" id="botao-comprovante">Gerar comprovante de renda</button>
    </section>

    <section class="cartao">
      <h2>Todos os lançamentos</h2>
      <div id="lista-lancamentos">
        ${listaLancamentosHtml(ordenados)}
      </div>
    </section>

    <div id="comprovante-overlay"></div>
  `;

  gerarGraficoBarras(container.querySelector('#grafico-caixa'), dadosGrafico);
  ligarEventos(container, estado, contexto);
}

function listaLancamentosHtml(ordenados) {
  if (ordenados.length === 0) {
    return `
      <div class="estado-vazio">
        <h3>Nenhum lançamento ainda</h3>
        <p>Use o formulário acima para registrar sua primeira venda ou despesa.</p>
      </div>
    `;
  }
  return ordenados.map((l) => `
    <div class="lancamento-linha" data-id="${l.id}">
      <div>
        <div>${l.descricao}</div>
        <div style="font-size:0.78rem; color:var(--muted)">${nomeMes(l.mes)} · ${FORMAS.find((f) => f.valor === l.forma)?.label || l.forma}</div>
      </div>
      <div class="lancamento-linha__acoes">
        <span class="numero" style="color:${l.tipo === 'entrada' ? 'var(--brand)' : 'var(--critical)'}; margin-right:0.4rem">
          ${l.tipo === 'entrada' ? '+' : '−'}${formatarMoeda(l.valor)}
        </span>
        ${l.tipo === 'entrada' ? `<button type="button" class="botao-icone" data-recibo="${l.id}" aria-label="Gerar recibo">🧾</button>` : ''}
        <button type="button" class="botao-icone" data-excluir="${l.id}" aria-label="Excluir lançamento">🗑️</button>
      </div>
    </div>
  `).join('');
}

function ligarEventos(container, estado, contexto) {
  const campoTipo = container.querySelector('#campo-tipo');
  container.querySelectorAll('[data-tipo]').forEach((botao) => {
    botao.addEventListener('click', () => {
      campoTipo.value = botao.dataset.tipo;
      container.querySelectorAll('[data-tipo]').forEach((b) => {
        const ativo = b === botao;
        b.style.background = ativo ? 'var(--brand-light)' : 'var(--card)';
        b.style.color = ativo ? 'var(--brand)' : 'var(--ink)';
        b.style.borderColor = ativo ? 'var(--brand)' : 'var(--line)';
      });
    });
  });

  container.querySelector('#form-lancamento').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const descricao = container.querySelector('#campo-descricao').value.trim();
    const valor = Number(container.querySelector('#campo-valor').value);
    if (!descricao || !valor || valor <= 0) {
      mostrarToast({ mensagem: 'Preencha a descrição e um valor maior que zero.', urgente: true });
      return;
    }
    adicionarLancamento({
      descricao,
      valor,
      tipo: campoTipo.value,
      mes: container.querySelector('#campo-mes').value,
      forma: container.querySelector('#campo-forma').value,
    });
    mostrarToast({ mensagem: 'Lançamento salvo.' });
    render(container, obterEstado(), contexto);
  });

  const atualizarCalculadora = () => {
    const horas = container.querySelector('#calc-horas').value;
    const custoMaterial = container.querySelector('#calc-material').value;
    const valorHoraDesejado = container.querySelector('#calc-valor-hora').value;
    const preco = precoSugerido({ horas, custoMaterial, valorHoraDesejado });
    container.querySelector('#resultado-calculadora').textContent = formatarMoeda(preco);
  };
  ['#calc-horas', '#calc-material', '#calc-valor-hora'].forEach((sel) => {
    container.querySelector(sel).addEventListener('input', atualizarCalculadora);
  });

  container.querySelectorAll('[data-excluir]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const id = botao.dataset.excluir;
      const removido = removerLancamento(id);
      if (!removido) return;
      render(container, obterEstado(), contexto);
      mostrarToast({
        mensagem: 'Lançamento excluído.',
        acaoLabel: 'Desfazer',
        aoAcionarAcao: () => {
          restaurarLancamento(removido);
          render(container, obterEstado(), contexto);
        },
      });
    });
  });

  container.querySelectorAll('[data-recibo]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const lancamento = obterEstado().lancamentos.find((l) => l.id === botao.dataset.recibo);
      if (lancamento) abrirRecibo(container, estado.usuario, lancamento);
    });
  });

  container.querySelector('#botao-comprovante').addEventListener('click', () => {
    abrirComprovante(container, obterEstado());
  });
}

function abrirRecibo(container, usuario, lancamento) {
  const texto = [
    'RECIBO',
    '',
    `Recebi de: cliente de ${usuario.nome || 'Passo Certo'}`,
    `Referente a: ${lancamento.descricao}`,
    `Valor: ${formatarMoeda(lancamento.valor)}`,
    `Mês: ${nomeMes(lancamento.mes)}`,
    `Forma de recebimento: ${FORMAS.find((f) => f.valor === lancamento.forma)?.label || lancamento.forma}`,
    '',
    `${usuario.nome || ''}`,
  ].join('\n');

  const overlay = document.createElement('div');
  overlay.className = 'sobreposicao';
  overlay.innerHTML = `
    <div class="sobreposicao__caixa" role="dialog" aria-modal="true" aria-label="Recibo">
      <h2>Recibo</h2>
      <pre style="white-space:pre-wrap; font-family:var(--font-mono); background:var(--bg); padding:1rem; border-radius:var(--radius-sm)">${texto}</pre>
      <div style="display:flex; gap:0.5rem; margin-top:0.75rem">
        <button type="button" class="botao botao-primario" id="botao-compartilhar-recibo">Compartilhar</button>
        <button type="button" class="botao botao-secundario" id="botao-fechar-recibo">Fechar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#botao-fechar-recibo').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#botao-compartilhar-recibo').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: texto, title: 'Recibo' });
        return;
      } catch {
        /* usuário cancelou o compartilhamento */
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      mostrarToast({ mensagem: 'Recibo copiado para a área de transferência.' });
    } catch {
      mostrarToast({ mensagem: 'Não foi possível copiar automaticamente. Selecione o texto acima.', urgente: true });
    }
  });
}

function abrirComprovante(container, estado) {
  const overlay = container.querySelector('#comprovante-overlay');
  const meses = [...new Set(estado.lancamentos.map((l) => l.mes))].sort();
  const linhasMes = meses.map((mes) => {
    const doMes = estado.lancamentos.filter((l) => l.mes === mes && l.tipo === 'entrada');
    const total = doMes.reduce((s, l) => s + l.valor, 0);
    return { mes, total };
  });
  const totalGeral = linhasMes.reduce((s, l) => s + l.total, 0);
  const media = linhasMes.length ? totalGeral / linhasMes.length : 0;
  const projecao = projecaoAnual(estado.lancamentos);
  const percentualTeto = Math.min((projecao / TETO) * 100, 999);
  const hoje = new Date().toLocaleDateString('pt-BR');

  overlay.innerHTML = `
    <div class="comprovante-documento">
      <div class="nao-imprimir" style="display:flex; justify-content:flex-end; gap:0.5rem; margin-bottom:1rem">
        <button type="button" class="botao botao-primario" id="botao-imprimir-comprovante" style="width:auto">Imprimir / Salvar PDF</button>
        <button type="button" class="botao botao-secundario" id="botao-fechar-comprovante" style="width:auto">Fechar</button>
      </div>
      <h2 style="text-align:center">Declaração de Faturamento</h2>
      <p><strong>Nome:</strong> ${estado.usuario.nome || '—'}</p>
      <p><strong>Ocupação:</strong> ${estado.usuario.ocupacao || estado.usuario.ocupacaoLivre || '—'}</p>
      <table>
        <thead><tr><th>Mês</th><th>Faturamento</th></tr></thead>
        <tbody>
          ${linhasMes.map((l) => `<tr><td>${nomeMes(l.mes)}</td><td class="numero">${formatarMoeda(l.total)}</td></tr>`).join('') || '<tr><td colspan="2">Sem lançamentos registrados</td></tr>'}
        </tbody>
        <tfoot>
          <tr><th>Total do período</th><th class="numero">${formatarMoeda(totalGeral)}</th></tr>
          <tr><th>Média mensal</th><th class="numero">${formatarMoeda(media)}</th></tr>
        </tfoot>
      </table>
      <p>A projeção anual de faturamento corresponde a ${percentualTeto.toFixed(1)}% do limite permitido ao MEI.</p>
      <p style="margin-top:2rem">
        Eu, ${estado.usuario.nome || '[nome]'}, declaro para os devidos fins que os valores acima
        correspondem ao faturamento da minha atividade, sob livre e espontânea vontade.
      </p>
      <p>${hoje}</p>
      <div class="assinatura-linha">${estado.usuario.nome || ''}</div>
    </div>
  `;
  overlay.classList.add('aberto');

  overlay.querySelector('#botao-fechar-comprovante').addEventListener('click', () => {
    overlay.classList.remove('aberto');
    overlay.innerHTML = '';
  });
  overlay.querySelector('#botao-imprimir-comprovante').addEventListener('click', () => window.print());
}
