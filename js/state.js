// Camada de estado do Passo Certo: leitura/escrita em localStorage, sempre
// protegida por try/catch (o app precisa funcionar mesmo com o
// armazenamento bloqueado ou vazio), com dados de demonstração da persona
// Marli para a tela nunca abrir vazia.

const CHAVE_ESTADO = 'passocerto:estado:v1';

function gerarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Estado inicial da persona Marli — nunca vazio, sempre com 18 lançamentos reais. */
function estadoDemonstracao() {
  const l = (mes, descricao, valor, tipo, forma) => ({ id: gerarId(), mes, descricao, valor, tipo, forma });
  return {
    versao: 1,
    usuario: {
      nome: 'Marli Ferreira',
      celular: '21987654321',
      ocupacao: 'Costureira',
      ocupacaoLivre: '',
      renda: 2200,
      tipoAtividade: 'servico',
      cnae: '',
      onboardingCompleto: true,
    },
    lancamentos: [
      l('2026-04', 'Uniformes de restaurante', 1450, 'entrada', 'dinheiro'),
      l('2026-04', 'Ajustes de calça e vestido', 700, 'entrada', 'pix'),
      l('2026-04', 'Tecido no atacado', 210, 'saida', 'pix'),

      l('2026-05', 'Vestido de festa infantil', 900, 'entrada', 'pix'),
      l('2026-05', 'Bainha de calça (12 peças)', 750, 'entrada', 'dinheiro'),
      l('2026-05', 'Conserto da overloque', 180, 'saida', 'pix'),

      l('2026-06', 'Roupas de festa junina (encomenda de escola)', 1300, 'entrada', 'pix'),
      l('2026-06', 'Ajustes de noiva e madrinhas', 1800, 'entrada', 'pix'),
      l('2026-06', 'Aluguel da máquina reta', 120, 'saida', 'dinheiro'),

      l('2026-07', 'Uniforme de academia (8 peças)', 950, 'entrada', 'pix'),
      l('2026-07', 'Conserto de zíper e forro', 500, 'entrada', 'dinheiro'),
      l('2026-07', 'Compra de tecido - loja Bom Preço', 260, 'saida', 'pix'),

      l('2026-08', 'Vestido de madrinha', 800, 'entrada', 'pix'),
      l('2026-08', 'Kit de fraldas de pano (encomenda)', 650, 'entrada', 'dinheiro'),
      l('2026-08', 'Linha, elástico e zíperes', 70, 'saida', 'pix'),

      l('2026-09', 'Uniformes de restaurante (segunda encomenda)', 1600, 'entrada', 'pix'),
      l('2026-09', 'Ajuste de terno', 450, 'entrada', 'dinheiro'),
      l('2026-09', 'Linha e aviamentos', 45, 'saida', 'dinheiro'),
    ],
    trilhaFormalizacao: { passosConcluidos: [false, false, false, false, false] },
    deveres: { pagamentos: {} },
    direitos: { contribuicoesSimuladas: 0 },
    preferencias: { tema: 'sistema', fonteAumentada: false, altoContraste: false },
    equipe: { disciplina: '', professor: '', integrantes: '', instituicao: '', curso: '' },
  };
}

/** Estado para quem ainda não passou pelo login (usado só se algo apagar o storage). */
function estadoVazio() {
  const demo = estadoDemonstracao();
  return { ...demo, usuario: { ...demo.usuario, onboardingCompleto: false } };
}

let estadoEmMemoria = null;

function carregarDoStorage() {
  try {
    const bruto = localStorage.getItem(CHAVE_ESTADO);
    if (!bruto) return null;
    const dado = JSON.parse(bruto);
    if (!dado || typeof dado !== 'object' || !Array.isArray(dado.lancamentos)) return null;
    return dado;
  } catch {
    return null;
  }
}

function salvarNoStorage(estado) {
  try {
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

/** Devolve o estado atual, carregando do storage uma vez e semeando a demonstração se necessário. */
export function obterEstado() {
  if (estadoEmMemoria) return estadoEmMemoria;
  estadoEmMemoria = carregarDoStorage() ?? estadoDemonstracao();
  salvarNoStorage(estadoEmMemoria);
  return estadoEmMemoria;
}

/** Persiste o estado inteiro (o app não confia em autosave parcial). */
export function salvarEstado(estado) {
  estadoEmMemoria = estado;
  return salvarNoStorage(estado);
}

/** Restaura os dados de demonstração da Marli, descartando o que houver. */
export function restaurarDemonstracao() {
  estadoEmMemoria = estadoDemonstracao();
  salvarNoStorage(estadoEmMemoria);
  return estadoEmMemoria;
}

/** Encerra a sessão sem apagar o perfil, para o retorno reconhecer nome e celular. */
export function sairDaSessao() {
  const estado = obterEstado();
  estado.usuario.onboardingCompleto = false;
  salvarEstado(estado);
  return estado;
}

export function adicionarLancamento(dadosLancamento) {
  const estado = obterEstado();
  const lancamento = { id: gerarId(), ...dadosLancamento };
  estado.lancamentos.push(lancamento);
  salvarEstado(estado);
  return lancamento;
}

/** Remove um lançamento e devolve o item removido, para a tela oferecer "Desfazer". */
export function removerLancamento(id) {
  const estado = obterEstado();
  const indice = estado.lancamentos.findIndex((l) => l.id === id);
  if (indice === -1) return null;
  const [removido] = estado.lancamentos.splice(indice, 1);
  salvarEstado(estado);
  return removido;
}

export function restaurarLancamento(lancamento) {
  const estado = obterEstado();
  estado.lancamentos.push(lancamento);
  salvarEstado(estado);
}

export function atualizarUsuario(patch) {
  const estado = obterEstado();
  estado.usuario = { ...estado.usuario, ...patch };
  salvarEstado(estado);
  return estado.usuario;
}

export function atualizarEquipe(patch) {
  const estado = obterEstado();
  estado.equipe = { ...estado.equipe, ...patch };
  salvarEstado(estado);
  return estado.equipe;
}

export function atualizarPreferencias(patch) {
  const estado = obterEstado();
  estado.preferencias = { ...estado.preferencias, ...patch };
  salvarEstado(estado);
  return estado.preferencias;
}

export function exportarDadosJSON() {
  return JSON.stringify(obterEstado(), null, 2);
}

export function importarDadosJSON(texto) {
  const dado = JSON.parse(texto);
  if (!dado || typeof dado !== 'object' || !Array.isArray(dado.lancamentos)) {
    throw new Error('Arquivo inválido: não parece ser um backup do Passo Certo.');
  }
  estadoEmMemoria = dado;
  salvarNoStorage(dado);
  return dado;
}

export function apagarTudo() {
  try {
    localStorage.removeItem(CHAVE_ESTADO);
  } catch {
    /* armazenamento indisponível: nada a apagar */
  }
  estadoEmMemoria = estadoVazio();
  return estadoEmMemoria;
}
