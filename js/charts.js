// Gráfico de barras agrupadas em SVG, gerado em tempo de execução — sem
// biblioteca externa. Cada barra é focável/tocável e mostra o valor.
import { formatarMoeda } from './regras.js';

/**
 * @param {HTMLElement} container
 * @param {{rotulo: string, entrada: number, saida: number}[]} dados
 */
export function gerarGraficoBarras(container, dados) {
  const largura = 320;
  const altura = 180;
  const margemInferior = 24;
  const areaGrafico = altura - margemInferior;
  const maxValor = Math.max(1, ...dados.flatMap((d) => [d.entrada, d.saida]));
  const larguraGrupo = largura / dados.length;
  const larguraBarra = Math.min(22, larguraGrupo / 3);

  const barras = dados.map((d, i) => {
    const xGrupo = i * larguraGrupo + larguraGrupo / 2;
    const alturaEntrada = (d.entrada / maxValor) * (areaGrafico - 10);
    const alturaSaida = (d.saida / maxValor) * (areaGrafico - 10);
    const xEntrada = xGrupo - larguraBarra - 2;
    const xSaida = xGrupo + 2;

    return `
      <g tabindex="0" role="img" aria-label="${d.rotulo}: entradas ${formatarMoeda(d.entrada)}, saídas ${formatarMoeda(d.saida)}" class="barra-grupo">
        <rect x="${xEntrada}" y="${areaGrafico - alturaEntrada}" width="${larguraBarra}" height="${Math.max(alturaEntrada, 1)}" rx="4" fill="var(--chart-1)"/>
        <rect x="${xSaida}" y="${areaGrafico - alturaSaida}" width="${larguraBarra}" height="${Math.max(alturaSaida, 1)}" rx="4" fill="var(--chart-2)"/>
        <text x="${xGrupo}" y="${altura - 6}" text-anchor="middle" font-size="10" fill="var(--muted)">${d.rotulo}</text>
        <title>${d.rotulo}: entradas ${formatarMoeda(d.entrada)} · saídas ${formatarMoeda(d.saida)}</title>
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${largura} ${altura}" width="100%" role="group" aria-label="Gráfico de entradas e saídas dos últimos meses">
      ${barras}
    </svg>
    <div style="display:flex; gap:1rem; justify-content:center; font-size:0.78rem; color:var(--muted); margin-top:0.3rem">
      <span>■ Entradas</span><span>■ Saídas</span>
    </div>
  `;
}
