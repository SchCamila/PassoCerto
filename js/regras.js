// Regras de negócio do Passo Certo — valores oficiais de 2026.
// Módulo puro (sem DOM), para poder ser testado isoladamente em
// tests/regras.test.mjs. Atualização anual: mexa só nas constantes abaixo.

export const SM = 1621.00;                 // salário mínimo 2026
export const INSS = 81.05;                 // 5% do salário mínimo (contribuição do MEI)
export const DAS = { comercio: 82.05, servico: 86.05, ambos: 87.05 };
export const TETO = 81000;                 // limite anual de faturamento do MEI
export const TOLER = 97200;                // teto + 20% (tolerância antes do desenquadramento retroativo)
export const DIA_VENCIMENTO_DAS = 20;
export const MULTA_AO_DIA = 0.0033;        // 0,33% ao dia
export const MULTA_MAXIMA = 0.20;          // limitada a 20%
export const DIA_LIMITE_DASN = { mes: 5, dia: 31 }; // 31 de maio

// Carências previdenciárias em número de contribuições mensais.
// Aposentadoria por idade tem regra dupla (contribuições + idade mínima).
export const CARENCIAS = {
  auxilioIncapacidadeTemporaria: { label: 'Auxílio por incapacidade temporária', contribuicoes: 12 },
  salarioMaternidade: { label: 'Salário-maternidade', contribuicoes: 10 },
  aposentadoriaIncapacidadePermanente: { label: 'Aposentadoria por incapacidade permanente', contribuicoes: 12 },
  pensaoPorMorte: { label: 'Pensão por morte', contribuicoes: 0 },
  auxilioReclusao: { label: 'Auxílio-reclusão', contribuicoes: 24 },
  aposentadoriaPorIdade: { label: 'Aposentadoria por idade', contribuicoes: 180, idadeMinima: { mulher: 62, homem: 65 } },
};

/**
 * Valor do DAS mensal conforme o tipo de atividade do MEI.
 * @param {'comercio'|'servico'|'ambos'} tipoAtividade
 */
export function valorDAS(tipoAtividade) {
  return DAS[tipoAtividade] ?? DAS.servico;
}

/**
 * Custo diário equivalente de um valor mensal, usando o ano civil (365 dias)
 * em vez do mês corrente — é assim que se chega a "R$ 2,83/dia" a partir de
 * R$ 86,05/mês, e o valor não varia conforme o mês tem 28, 30 ou 31 dias.
 */
export function custoPorDia(valorMensal) {
  return (valorMensal * 12) / 365;
}

/** Fatia percentual que um valor mensal representa da renda mensal informada. */
export function fatiaDaRenda(valorMensal, rendaMensal) {
  if (!rendaMensal) return 0;
  return (valorMensal / rendaMensal) * 100;
}

/**
 * Projeção de faturamento anual: média dos meses que TÊM lançamento × 12.
 * Não é o acumulado até agora — um negócio sazonal com 3 meses fortes não
 * pode ser julgado pela soma parcial do ano.
 * @param {{mes: string, valor: number, tipo: 'entrada'|'saida'}[]} lancamentos
 */
export function projecaoAnual(lancamentos) {
  const entradasPorMes = new Map();
  for (const l of lancamentos) {
    if (l.tipo !== 'entrada') continue;
    entradasPorMes.set(l.mes, (entradasPorMes.get(l.mes) || 0) + l.valor);
  }
  const meses = [...entradasPorMes.values()];
  if (meses.length === 0) return 0;
  const media = meses.reduce((soma, v) => soma + v, 0) / meses.length;
  return media * 12;
}

/** Situação do MEI frente ao teto anual, a partir da projeção (não do acumulado). */
export function statusTeto(projecao) {
  if (projecao <= TETO) return 'dentro';
  if (projecao <= TOLER) return 'entre-teto-e-tolerancia';
  return 'acima-tolerancia';
}

/** Dispara o alerta preventivo quando a projeção atinge 80% do teto. */
export function alertaTeto(projecao) {
  return projecao >= TETO * 0.8;
}

/**
 * Multa por atraso no DAS: 0,33% ao dia sobre o valor da guia, limitada a 20%.
 * @param {number} valorGuia
 * @param {number} diasAtraso
 */
export function multaPorAtraso(valorGuia, diasAtraso) {
  if (diasAtraso <= 0) return 0;
  const percentual = Math.min(diasAtraso * MULTA_AO_DIA, MULTA_MAXIMA);
  return valorGuia * percentual;
}

/** Quantas contribuições ainda faltam para cumprir a carência de um benefício. */
export function contribuicoesFaltantes(chaveBeneficio, contribuicoesAtuais) {
  const beneficio = CARENCIAS[chaveBeneficio];
  if (!beneficio) return 0;
  return Math.max(0, beneficio.contribuicoes - contribuicoesAtuais);
}

/**
 * Calculadora de "quanto cobrar": preço sugerido a partir do custo de
 * material, das horas trabalhadas e de quanto a pessoa quer ganhar por hora.
 */
export function precoSugerido({ horas, custoMaterial, valorHoraDesejado }) {
  const horasNum = Number(horas) || 0;
  const materialNum = Number(custoMaterial) || 0;
  const valorHoraNum = Number(valorHoraDesejado) || 0;
  return materialNum + horasNum * valorHoraNum;
}

/** Formata um número em Real (BRL), usado em toda a interface. */
export function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
