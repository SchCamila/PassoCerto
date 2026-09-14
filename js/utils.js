// Utilidades de data compartilhadas pelas telas (mês atual, nomes de mês).
const NOMES_MES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Mês corrente no formato usado pelos lançamentos: 'AAAA-MM'. */
export function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Formata 'AAAA-MM' como "Setembro/2026". */
export function nomeMes(mesStr) {
  const [ano, mes] = mesStr.split('-').map(Number);
  return `${NOMES_MES[mes - 1]}/${ano}`;
}

/** Formata 'AAAA-MM' de forma curta: "Set/26". */
export function nomeMesCurto(mesStr) {
  const [ano, mes] = mesStr.split('-').map(Number);
  return `${NOMES_MES[mes - 1].slice(0, 3)}/${String(ano).slice(2)}`;
}

/** Lista os últimos N meses (formato 'AAAA-MM'), do mais antigo ao mais recente, incluindo o atual. */
export function ultimosMeses(n) {
  const hoje = new Date();
  const meses = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return meses;
}
