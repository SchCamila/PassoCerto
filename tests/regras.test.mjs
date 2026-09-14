// Testes das regras de negócio (seção 4 do briefing). Sem dependências:
// rode com `node tests/regras.test.mjs`.
import assert from 'node:assert/strict';
import {
  SM, INSS, DAS, TETO, TOLER,
  valorDAS, custoPorDia, fatiaDaRenda, projecaoAnual, statusTeto,
  alertaTeto, multaPorAtraso, contribuicoesFaltantes, precoSugerido,
} from '../js/regras.js';

let passou = 0;
let falhou = 0;

function teste(nome, fn) {
  try {
    fn();
    passou++;
    console.log(`OK   ${nome}`);
  } catch (erro) {
    falhou++;
    console.error(`FALHOU ${nome}`);
    console.error(erro.message);
  }
}

teste('constantes de 2026 batem com o briefing', () => {
  assert.equal(SM, 1621.00);
  assert.equal(INSS, 81.05);
  assert.equal(DAS.comercio, 82.05);
  assert.equal(DAS.servico, 86.05);
  assert.equal(DAS.ambos, 87.05);
  assert.equal(TETO, 81000);
  assert.equal(TOLER, 97200);
});

teste('valorDAS retorna o valor correto por tipo de atividade', () => {
  assert.equal(valorDAS('comercio'), 82.05);
  assert.equal(valorDAS('servico'), 86.05);
  assert.equal(valorDAS('ambos'), 87.05);
});

teste('custoPorDia do DAS de serviço é R$ 2,83/dia', () => {
  const valor = custoPorDia(DAS.servico);
  assert.ok(Math.abs(valor - 2.83) < 0.01, `esperado ~2.83, obtido ${valor}`);
});

teste('fatiaDaRenda calcula o percentual sobre a renda informada', () => {
  const fatia = fatiaDaRenda(DAS.servico, 2400);
  assert.ok(Math.abs(fatia - 3.585) < 0.01, `esperado ~3.585%, obtido ${fatia}`);
});

teste('projecaoAnual usa a média dos meses com lançamento, não o acumulado', () => {
  const lancamentos = [
    { mes: '2026-01', valor: 1000, tipo: 'entrada' },
    { mes: '2026-02', valor: 3000, tipo: 'entrada' },
    { mes: '2026-02', valor: 200, tipo: 'saida' },
  ];
  // média de entradas = (1000 + 3000) / 2 = 2000; projeção = 2000 * 12 = 24000
  assert.equal(projecaoAnual(lancamentos), 24000);
});

teste('projecaoAnual retorna 0 sem lançamentos de entrada', () => {
  assert.equal(projecaoAnual([]), 0);
  assert.equal(projecaoAnual([{ mes: '2026-01', valor: 100, tipo: 'saida' }]), 0);
});

teste('statusTeto classifica dentro, entre teto e tolerância, e acima', () => {
  assert.equal(statusTeto(80000), 'dentro');
  assert.equal(statusTeto(TETO), 'dentro');
  assert.equal(statusTeto(90000), 'entre-teto-e-tolerancia');
  assert.equal(statusTeto(TOLER), 'entre-teto-e-tolerancia');
  assert.equal(statusTeto(100000), 'acima-tolerancia');
});

teste('alertaTeto dispara em 80% da projeção anual', () => {
  assert.equal(alertaTeto(TETO * 0.8 - 1), false);
  assert.equal(alertaTeto(TETO * 0.8), true);
  assert.equal(alertaTeto(TETO), true);
});

teste('multaPorAtraso é 0,33% ao dia, limitada a 20%', () => {
  assert.equal(multaPorAtraso(DAS.servico, 0), 0);
  const dezDias = multaPorAtraso(100, 10);
  assert.ok(Math.abs(dezDias - 3.3) < 0.001, `esperado 3.30, obtido ${dezDias}`);
  const muitoAtraso = multaPorAtraso(100, 365);
  assert.equal(muitoAtraso, 20); // limitado a 20% de 100
});

teste('contribuicoesFaltantes calcula a carência restante', () => {
  assert.equal(contribuicoesFaltantes('salarioMaternidade', 4), 6);
  assert.equal(contribuicoesFaltantes('salarioMaternidade', 20), 0);
  assert.equal(contribuicoesFaltantes('pensaoPorMorte', 0), 0);
});

teste('precoSugerido soma material e horas ao valor-hora desejado', () => {
  const preco = precoSugerido({ horas: 3, custoMaterial: 40, valorHoraDesejado: 20 });
  assert.equal(preco, 100);
});

console.log(`\n${passou} passaram, ${falhou} falharam.`);
if (falhou > 0) process.exit(1);
