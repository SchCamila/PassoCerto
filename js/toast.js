// Avisos flutuantes (toasts), no lugar de alert(). Toda ação destrutiva usa
// mostrarToast com acaoLabel "Desfazer" em vez de um "tem certeza?" prévio.

function regiao() {
  return document.getElementById('regiao-toasts');
}

/**
 * @param {{mensagem: string, acaoLabel?: string, aoAcionarAcao?: () => void, duracaoMs?: number, urgente?: boolean}} opcoes
 */
export function mostrarToast({ mensagem, acaoLabel, aoAcionarAcao, duracaoMs = 6000, urgente = false }) {
  const container = regiao();
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', urgente ? 'alert' : 'status');

  const texto = document.createElement('span');
  texto.textContent = mensagem;
  el.appendChild(texto);

  let removido = false;
  const remover = () => {
    if (removido) return;
    removido = true;
    el.remove();
  };

  if (acaoLabel && aoAcionarAcao) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = acaoLabel;
    botao.addEventListener('click', () => {
      aoAcionarAcao();
      remover();
    });
    el.appendChild(botao);
  }

  container.appendChild(el);
  setTimeout(remover, duracaoMs);
}
