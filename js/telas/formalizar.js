import { obterEstado, atualizarUsuario, atualizarTrilha } from '../state.js';
import { valorDAS, custoPorDia, fatiaDaRenda, formatarMoeda } from '../regras.js';
import { buscarOcupacoes } from '../ocupacoes.js';
import { PASSOS_FORMALIZACAO } from '../trilha.js';
import { mostrarToast } from '../toast.js';
import { microlicao } from '../microlicoes.js';
import { botaoOuvirHtml, ligarBotaoOuvir } from '../voz.js';

const URL_PORTAL_EMPREENDEDOR = 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor';

function linhaComparativa(dimensao, informal, mei) {
  return `<tr><th scope="row">${dimensao}</th><td>${informal}</td><td>${mei}</td></tr>`;
}

export function montar(container, { navegar }) {
  const estado = obterEstado();
  const local = {
    ocupacaoSelecionada: null,
    termoBusca: '',
    renda: estado.usuario.renda || 0,
    tipoAtividade: estado.usuario.tipoAtividade || 'servico',
  };
  render(container, estado, local);
}

function render(container, estado, local) {
  const das = valorDAS(local.tipoAtividade);
  const porDia = custoPorDia(das);
  const fatia = fatiaDaRenda(das, local.renda);
  const restante = Math.max(0, 100 - fatia);

  container.innerHTML = `
    <h1>Formalizar</h1>

    <section class="cartao">
      <h2>Sua ocupação está na lista do MEI?</h2>
      <div class="campo">
        <label for="busca-ocupacao">Digite sua ocupação</label>
        <input type="text" id="busca-ocupacao" placeholder="Ex.: costureira, motorista, cabeleireira" value="${local.termoBusca}" autocomplete="off">
      </div>
      <div id="resultados-ocupacao"></div>
      ${local.ocupacaoSelecionada ? cartaoResultadoOcupacao(local.ocupacaoSelecionada) : ''}
    </section>

    <section class="cartao">
      <h2>Quanto custaria ser MEI para você</h2>
      <div class="campo">
        <label for="campo-renda-formalizar">Quanto entra por mês, mais ou menos?</label>
        <input type="number" inputmode="numeric" id="campo-renda-formalizar" value="${local.renda}" min="0">
      </div>
      <div class="campo">
        <label for="campo-tipo-atividade">Tipo de atividade</label>
        <select id="campo-tipo-atividade">
          <option value="comercio" ${local.tipoAtividade === 'comercio' ? 'selected' : ''}>Comércio (venda de produtos)</option>
          <option value="servico" ${local.tipoAtividade === 'servico' ? 'selected' : ''}>Serviço</option>
          <option value="ambos" ${local.tipoAtividade === 'ambos' ? 'selected' : ''}>Comércio e serviço</option>
        </select>
        <p class="ajuda">É o que define o valor do DAS — a guia mensal do MEI.</p>
      </div>

      ${microlicao('DAS')}

      <div style="text-align:center; margin:1rem 0">
        <p style="margin:0; color:var(--muted)">Você pagaria</p>
        <p class="numero" style="font-size:2rem; font-weight:700; margin:0.2rem 0">${formatarMoeda(das)}<span style="font-size:1rem; font-weight:400"> por mês</span></p>
        <p class="numero" style="color:var(--secondary)">${formatarMoeda(porDia)} por dia · ${fatia.toFixed(1)}% do que você recebe</p>
        ${botaoOuvirHtml('ouvir-diagnostico')}
      </div>

      <div role="img" aria-label="${fatia.toFixed(1)}% da sua renda iria para o DAS, ${restante.toFixed(1)}% continuaria com você"
           style="display:flex; height:14px; border-radius:999px; overflow:hidden; background:var(--line)">
        <div style="width:${Math.max(fatia, 1.5)}%; background:var(--chart-2)"></div>
        <div style="width:${100 - Math.max(fatia, 1.5)}%; background:var(--chart-1)"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--muted); margin-top:0.3rem">
        <span>■ Vai para o DAS</span><span>■ Fica com você</span>
      </div>
    </section>

    <section class="cartao" style="overflow-x:auto">
      <h2>Informal × MEI</h2>
      <table class="tabela-comparativa">
        <thead><tr><th scope="col">&nbsp;</th><th scope="col">Informal</th><th scope="col">MEI</th></tr></thead>
        <tbody>
          ${linhaComparativa('Custo anual', 'R$ 0', formatarMoeda(das * 12))}
          ${linhaComparativa('CNPJ e nota fiscal', 'Não tem', 'Tem os dois')}
          ${linhaComparativa('Se adoecer', 'Sem renda', 'Auxílio do INSS, após carência')}
          ${linhaComparativa('Licença-maternidade', 'Sem direito', 'Salário-maternidade, após carência')}
          ${linhaComparativa('Aposentadoria', 'Não conta tempo', 'Conta por idade, não por tempo de contribuição')}
          ${linhaComparativa('Pensão por morte', 'Família sem amparo', 'Pensão para a família, sem carência')}
          ${linhaComparativa('Comprovação de renda', 'Difícil conseguir crédito', 'Declaração e histórico formais')}
        </tbody>
      </table>
    </section>

    <section class="cartao">
      <h2>Seu passo a passo</h2>
      ${PASSOS_FORMALIZACAO.map((passo, i) => `
        <label style="display:flex; gap:0.75rem; align-items:flex-start; padding:0.5rem 0; border-bottom:1px solid var(--line); cursor:pointer">
          <input type="checkbox" data-passo="${i}" ${estado.trilhaFormalizacao.passosConcluidos[i] ? 'checked' : ''}
                 style="width:22px; height:22px; margin-top:2px; accent-color:var(--brand)">
          <span>
            <strong style="${estado.trilhaFormalizacao.passosConcluidos[i] ? 'text-decoration:line-through; color:var(--muted)' : ''}">${passo.titulo}</strong><br>
            <span style="font-size:0.85rem; color:var(--muted)">${passo.descricao}</span>
          </span>
        </label>
      `).join('')}
      ${microlicao('CNPJ')}
      ${microlicao('CCMEI')}
      <p class="ajuda" style="margin-top:0.75rem">
        O Passo Certo não emite CNPJ nem guias — isso é feito de graça no Portal do Empreendedor do governo.
      </p>
      <a href="${URL_PORTAL_EMPREENDEDOR}" target="_blank" rel="noopener" class="botao botao-primario" style="margin-top:0.5rem; text-decoration:none">
        Abrir Portal do Empreendedor ↗
      </a>
    </section>
  `;

  ligarEventos(container, estado, local);
  ligarBotaoOuvir(container, 'ouvir-diagnostico', () => (
    `A guia mensal do MEI custaria ${formatarMoeda(das)} por mês, ou ${formatarMoeda(porDia)} por dia — ${fatia.toFixed(1)} por cento do que você recebe.`
  ));
}

function cartaoResultadoOcupacao(o) {
  return `
    <div class="cartao" style="margin-top:0.75rem; background:${o.elegivel ? 'var(--brand-light)' : 'var(--critical-bg)'}">
      <p style="margin:0 0 0.3rem"><strong>${o.nome}</strong></p>
      <p style="margin:0 0 0.3rem" class="numero">CNAE ${o.cnae} — ${o.descricaoCnae}</p>
      <span class="selo ${o.elegivel ? 'selo-brand' : 'selo-critico'}">
        ${o.elegivel ? '✓ Está na lista do MEI' : '✕ Fora da lista do MEI'}
      </span>
      ${!o.elegivel ? `<p style="margin-top:0.5rem">${o.motivoInelegivel}</p>` : ''}
      <div style="margin-top:0.6rem">${microlicao('CNAE')}</div>
    </div>
  `;
}

function ligarEventos(container, estado, local) {
  const inputBusca = container.querySelector('#busca-ocupacao');
  const resultados = container.querySelector('#resultados-ocupacao');

  inputBusca.addEventListener('input', () => {
    local.termoBusca = inputBusca.value;
    const achados = buscarOcupacoes(local.termoBusca);
    resultados.innerHTML = achados.length ? `
      <ul style="list-style:none; margin:0.5rem 0 0; padding:0; border:1px solid var(--line); border-radius:var(--radius-sm); overflow:hidden">
        ${achados.map((o, i) => `
          <li>
            <button type="button" data-indice="${i}" style="width:100%; text-align:left; min-height:var(--tap-min); padding:0.6rem 0.8rem; background:var(--card); border:none; border-bottom:1px solid var(--line); cursor:pointer">
              ${o.nome}
            </button>
          </li>
        `).join('')}
      </ul>
    ` : (local.termoBusca ? '<p class="ajuda">Nenhuma ocupação encontrada com esse nome.</p>' : '');

    resultados.querySelectorAll('[data-indice]').forEach((botao) => {
      botao.addEventListener('click', () => {
        local.ocupacaoSelecionada = achados[Number(botao.dataset.indice)];
        local.termoBusca = local.ocupacaoSelecionada.nome;
        local.tipoAtividade = local.ocupacaoSelecionada.tipo;
        render(container, estado, local);
      });
    });
  });

  container.querySelector('#campo-renda-formalizar').addEventListener('input', (e) => {
    local.renda = Number(e.target.value) || 0;
    atualizarUsuario({ renda: local.renda });
    render(container, estado, local);
  });

  container.querySelector('#campo-tipo-atividade').addEventListener('change', (e) => {
    local.tipoAtividade = e.target.value;
    atualizarUsuario({ tipoAtividade: local.tipoAtividade });
    render(container, estado, local);
  });

  container.querySelectorAll('[data-passo]').forEach((caixa) => {
    caixa.addEventListener('change', () => {
      const indice = Number(caixa.dataset.passo);
      const passos = [...estado.trilhaFormalizacao.passosConcluidos];
      passos[indice] = caixa.checked;
      estado.trilhaFormalizacao = atualizarTrilha(passos);
      if (caixa.checked) mostrarToast({ mensagem: `Passo "${PASSOS_FORMALIZACAO[indice].titulo}" concluído.` });
      render(container, estado, local);
    });
  });
}
