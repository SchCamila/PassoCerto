// Microlições de um parágrafo, para aparecerem no contexto onde a dúvida
// nasce — nunca uma sigla sem explicação na primeira vez que ela aparece.
export const MICROLICOES = {
  DAS: 'é o Documento de Arrecadação do Simples Nacional: a guia única que junta o INSS e o imposto (ICMS e/ou ISS) do MEI, paga todo mês.',
  CNAE: 'é o código que descreve sua atividade para o governo — cada ocupação tem um (ou mais) CNAE correspondente.',
  CNPJ: 'é o número que identifica seu negócio para o governo. Sem ele, você não emite nota fiscal nem abre conta empresarial.',
  'DASN-SIMEI': 'é a declaração anual do MEI — informa quanto você faturou no ano, até 31 de maio.',
  CCMEI: 'é o Certificado da Condição de Microempreendedor Individual: o documento que comprova que você é MEI.',
};

export function microlicao(termo) {
  const texto = MICROLICOES[termo];
  if (!texto) return '';
  return `<div class="microlicao"><strong>${termo}</strong> ${texto}</div>`;
}
