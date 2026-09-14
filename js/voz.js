// Leitura em voz alta dos números principais (Web Speech API), para quem
// tem baixa alfabetização funcional. Degrada de forma silenciosa quando o
// navegador não suporta — nunca quebra a tela por causa disso.
export function suportaVoz() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function falarTexto(texto) {
  if (!suportaVoz()) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 0.95;
  window.speechSynthesis.speak(fala);
}

/** Botão "Ouvir": chame ligarBotaoOuvir depois de inserir este HTML no DOM. */
export function botaoOuvirHtml(id) {
  if (!suportaVoz()) return '';
  return `<button type="button" class="botao-texto" id="${id}" style="padding-left:0">🔊 Ouvir os números</button>`;
}

export function ligarBotaoOuvir(container, id, obterTexto) {
  container.querySelector(`#${id}`)?.addEventListener('click', () => falarTexto(obterTexto()));
}
