import { obterEstado, atualizarDireitos } from '../state.js';
import { CARENCIAS, contribuicoesFaltantes } from '../regras.js';

const CHAVES_ORDEM = [
  'pensaoPorMorte',
  'salarioMaternidade',
  'auxilioIncapacidadeTemporaria',
  'aposentadoriaIncapacidadePermanente',
  'auxilioReclusao',
  'aposentadoriaPorIdade',
];

export function montar(container, contexto) {
  const estado = obterEstado();
  render(container, estado, contexto);
}

function render(container, estado) {
  const contribuicoes = estado.direitos.contribuicoesSimuladas;

  container.innerHTML = `
    <h1>Direitos</h1>
    <p class="ajuda">Simule quantos meses você já contribuiria como MEI e veja o que cada um libera.</p>

    <section class="cartao">
      <label for="slider-contribuicoes"><strong>Meses contribuídos (simulação)</strong></label>
      <input type="range" id="slider-contribuicoes" min="0" max="180" step="1" value="${contribuicoes}" style="width:100%; accent-color:var(--brand); min-height:var(--tap-min)">
      <p style="text-align:center" class="numero" id="valor-slider">${contribuicoes} ${contribuicoes === 1 ? 'mês' : 'meses'}</p>
    </section>

    <section id="lista-beneficios">
      ${CHAVES_ORDEM.map((chave) => cartaoBeneficio(chave, contribuicoes)).join('')}
    </section>

    <div class="microlicao">
      Atenção: os 5% que o MEI paga de INSS dão direito aos benefícios acima, mas <strong>não contam para aposentadoria por tempo de contribuição</strong>
      — só para aposentadoria por idade. Confira sempre a sua situação real no Meu INSS.
    </div>
  `;

  container.querySelector('#slider-contribuicoes').addEventListener('input', (e) => {
    const valor = Number(e.target.value);
    container.querySelector('#valor-slider').textContent = `${valor} ${valor === 1 ? 'mês' : 'meses'}`;
    container.querySelector('#lista-beneficios').innerHTML = CHAVES_ORDEM.map((chave) => cartaoBeneficio(chave, valor)).join('');
    atualizarDireitos({ contribuicoesSimuladas: valor });
  });
}

function cartaoBeneficio(chave, contribuicoes) {
  const beneficio = CARENCIAS[chave];
  const faltam = contribuicoesFaltantes(chave, contribuicoes);
  const temDireito = faltam === 0;
  const percentual = beneficio.contribuicoes === 0 ? 100 : Math.min((contribuicoes / beneficio.contribuicoes) * 100, 100);

  let observacaoIdade = '';
  if (chave === 'aposentadoriaPorIdade') {
    observacaoIdade = `<p class="ajuda">Também exige idade mínima: 62 anos (mulher) ou 65 anos (homem).</p>`;
  }

  return `
    <div class="cartao">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem">
        <h3 style="margin:0">${beneficio.label}</h3>
        <span class="selo ${temDireito ? 'selo-brand' : 'selo-amber'}">${temDireito ? '✓ Direito garantido' : `Faltam ${faltam}`}</span>
      </div>
      <div class="progresso-linha" style="margin-top:0.5rem"><div class="progresso-linha__preenchido" style="width:${percentual}%"></div></div>
      <p class="ajuda">${beneficio.contribuicoes === 0 ? 'Sem carência — direito desde a primeira contribuição.' : `Carência: ${beneficio.contribuicoes} contribuições mensais.`}</p>
      ${observacaoIdade}
    </div>
  `;
}
