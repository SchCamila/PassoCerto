import {
  obterEstado, atualizarUsuario, atualizarPreferencias, restaurarDemonstracao,
  sairDaSessao, exportarDadosJSON, importarDadosJSON, apagarTudo, salvarEstado,
} from '../state.js';
import { mostrarToast } from '../toast.js';

export function montar(container, contexto) {
  render(container, obterEstado(), contexto);
}

function render(container, estado, contexto) {
  const { usuario, preferencias } = estado;

  container.innerHTML = `
    <h1>Perfil</h1>

    <section class="cartao">
      <h2>Seus dados</h2>
      <div class="campo">
        <label for="perfil-nome">Nome</label>
        <input type="text" id="perfil-nome" value="${usuario.nome}">
      </div>
      <div class="campo">
        <label for="perfil-celular">Celular</label>
        <input type="tel" id="perfil-celular" value="${usuario.celular}">
      </div>
      <div class="campo">
        <label for="perfil-ocupacao">Ocupação</label>
        <input type="text" id="perfil-ocupacao" value="${usuario.ocupacao || usuario.ocupacaoLivre || ''}">
      </div>
      <div class="campo">
        <label for="perfil-renda">Renda aproximada por mês</label>
        <input type="number" inputmode="numeric" id="perfil-renda" value="${usuario.renda}">
      </div>
      <button type="button" class="botao botao-primario" id="botao-salvar-perfil">Salvar alterações</button>
    </section>

    <section class="cartao">
      <h2>Exibição</h2>
      <label style="display:flex; align-items:center; gap:0.6rem; min-height:var(--tap-min)">
        <input type="checkbox" id="perfil-alto-contraste" ${preferencias.altoContraste ? 'checked' : ''} style="width:22px; height:22px; accent-color:var(--brand)">
        Alto contraste
      </label>
      <p class="ajuda">Além do tema escuro, aumenta o contraste de bordas e textos secundários.</p>
    </section>

    <section class="cartao">
      <h2>Seus dados, sua decisão</h2>
      <p class="ajuda">Tudo fica só neste aparelho. Você pode levar seus dados para outro lugar ou apagar tudo quando quiser.</p>
      <button type="button" class="botao botao-secundario" id="botao-exportar">Exportar meus dados (JSON)</button>
      <label class="botao botao-secundario" style="text-align:center; cursor:pointer; margin-top:0.5rem">
        Importar dados
        <input type="file" accept="application/json" id="botao-importar" class="sr-only">
      </label>
      <button type="button" class="botao botao-secundario" id="botao-restaurar-demo" style="margin-top:0.5rem">Restaurar demonstração (Marli)</button>
      <button type="button" class="botao botao-perigo" id="botao-apagar-tudo" style="margin-top:0.5rem">Apagar todos os meus dados</button>
    </section>

    <section class="cartao">
      <button type="button" class="botao botao-texto" style="width:100%" id="botao-ver-sobre">Sobre o app →</button>
    </section>

    <button type="button" class="botao botao-secundario" id="botao-sair">Sair</button>
  `;

  container.querySelector('#botao-salvar-perfil').addEventListener('click', () => {
    atualizarUsuario({
      nome: container.querySelector('#perfil-nome').value.trim(),
      celular: container.querySelector('#perfil-celular').value.replace(/\D/g, ''),
      ocupacao: container.querySelector('#perfil-ocupacao').value.trim(),
      renda: Number(container.querySelector('#perfil-renda').value) || 0,
    });
    mostrarToast({ mensagem: 'Perfil atualizado.' });
  });

  container.querySelector('#perfil-alto-contraste').addEventListener('change', (e) => {
    atualizarPreferencias({ altoContraste: e.target.checked });
    document.documentElement.toggleAttribute('data-contraste-alto', e.target.checked);
    if (e.target.checked) document.documentElement.setAttribute('data-contraste', 'alto');
    else document.documentElement.removeAttribute('data-contraste');
  });

  container.querySelector('#botao-exportar').addEventListener('click', () => {
    const conteudo = exportarDadosJSON();
    const blob = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passo-certo-meus-dados.json';
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast({ mensagem: 'Seus dados foram baixados.' });
  });

  container.querySelector('#botao-importar').addEventListener('change', async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      const texto = await arquivo.text();
      importarDadosJSON(texto);
      mostrarToast({ mensagem: 'Dados importados com sucesso.' });
      render(container, obterEstado(), contexto);
    } catch {
      mostrarToast({ mensagem: 'Não foi possível importar: o arquivo não parece ser um backup do Passo Certo.', urgente: true });
    }
  });

  container.querySelector('#botao-restaurar-demo').addEventListener('click', () => {
    restaurarDemonstracao();
    mostrarToast({ mensagem: 'Dados de demonstração restaurados.' });
    render(container, obterEstado(), contexto);
  });

  container.querySelector('#botao-apagar-tudo').addEventListener('click', () => {
    const estadoAnterior = JSON.parse(JSON.stringify(obterEstado()));
    apagarTudo();
    render(container, obterEstado(), contexto);
    mostrarToast({
      mensagem: 'Todos os seus dados foram apagados.',
      acaoLabel: 'Desfazer',
      duracaoMs: 8000,
      urgente: true,
      aoAcionarAcao: () => {
        salvarEstado(estadoAnterior);
        render(container, obterEstado(), contexto);
      },
    });
  });

  container.querySelector('#botao-ver-sobre').addEventListener('click', () => contexto.navegar('sobre'));

  container.querySelector('#botao-sair').addEventListener('click', () => {
    sairDaSessao();
    contexto.navegar('entrada');
  });
}
