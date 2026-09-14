import { obterEstado, atualizarEquipe } from '../state.js';
import { mostrarToast } from '../toast.js';

export function montar(container, contexto) {
  render(container, obterEstado(), contexto);
}

function render(container, estado, contexto) {
  const { equipe } = estado;
  const equipeVazia = !equipe.disciplina && !equipe.professor && !equipe.integrantes && !equipe.instituicao && !equipe.curso;

  container.innerHTML = `
    <button type="button" class="botao-texto" id="botao-voltar-sobre">← Voltar ao Perfil</button>
    <h1>Sobre o app</h1>

    <section class="cartao">
      <h2>O que é</h2>
      <p>O Passo Certo ajuda quem trabalha por conta própria a decidir se vale a pena virar MEI, com uma simulação
      feita com a própria renda da pessoa — e depois a organizar o caixa e não perder prazos nem direitos.
      Ele não abre CNPJ nem emite guias: prepara você para fazer isso, com clareza, no Portal do Empreendedor oficial.</p>
    </section>

    <section class="cartao">
      <h2>A disciplina</h2>
      ${equipeVazia ? '<p class="selo selo-amber" style="margin-bottom:0.75rem">⚠ Dados da equipe ainda não preenchidos</p>' : ''}
      <div class="campo">
        <label for="equipe-disciplina">Disciplina</label>
        <input type="text" id="equipe-disciplina" value="${equipe.disciplina}" placeholder="Nome da disciplina">
      </div>
      <div class="campo">
        <label for="equipe-professor">Professor(a)</label>
        <input type="text" id="equipe-professor" value="${equipe.professor}" placeholder="Nome do(a) professor(a)">
      </div>
      <div class="campo">
        <label for="equipe-instituicao">Instituição</label>
        <input type="text" id="equipe-instituicao" value="${equipe.instituicao}" placeholder="Nome da instituição">
      </div>
      <div class="campo">
        <label for="equipe-curso">Curso</label>
        <input type="text" id="equipe-curso" value="${equipe.curso}" placeholder="Nome do curso">
      </div>
      <button type="button" class="botao botao-primario" id="botao-salvar-equipe">Salvar</button>
    </section>

    <section class="cartao">
      <h2>Como a ideia nasceu</h2>
      <p>A informalidade no Brasil não é, na maior parte dos casos, um problema de custo — o MEI custa poucos reais por
      dia. É um problema de informação: falta quem pergunte "quanto você ganha?" antes de falar em formalização, e
      falta mostrar a contrapartida (INSS, nota fiscal, histórico de renda) em termos do dia a dia de quem trabalha
      por conta própria, como uma costureira que perdeu um contrato por não emitir nota ou ficou sem renda ao adoecer.
      Ferramentas oficiais já existem para o ATO de formalizar — este projeto ataca a DECISÃO, que vem antes.</p>
    </section>

    <section class="cartao">
      <h2>Quem somos</h2>
      <div class="campo">
        <label for="equipe-integrantes">Integrantes</label>
        <textarea id="equipe-integrantes" rows="3" placeholder="Nomes dos integrantes do grupo">${equipe.integrantes}</textarea>
      </div>
      <button type="button" class="botao botao-primario" id="botao-salvar-integrantes">Salvar</button>
    </section>

    <section class="cartao selo-amber" style="background:var(--amber-bg); color:var(--ink)">
      <h2 style="margin-bottom:0.4rem">Aviso de protótipo</h2>
      <p style="margin:0">Este é um protótipo acadêmico. Os dados de demonstração (Marli Ferreira) são fictícios,
      o código de verificação do login é sempre 1234 e nenhuma informação sai deste aparelho.</p>
    </section>
  `;

  container.querySelector('#botao-voltar-sobre').addEventListener('click', () => contexto.navegar('perfil'));

  const salvarCampos = (ids) => {
    const patch = {};
    ids.forEach((id) => { patch[id.replace('equipe-', '')] = container.querySelector(`#${id}`).value.trim(); });
    atualizarEquipe(patch);
    mostrarToast({ mensagem: 'Salvo.' });
    render(container, obterEstado(), contexto);
  };

  container.querySelector('#botao-salvar-equipe').addEventListener('click', () => {
    salvarCampos(['equipe-disciplina', 'equipe-professor', 'equipe-instituicao', 'equipe-curso']);
  });
  container.querySelector('#botao-salvar-integrantes').addEventListener('click', () => {
    salvarCampos(['equipe-integrantes']);
  });
}
