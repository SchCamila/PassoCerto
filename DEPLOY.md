# Como publicar o Passo Certo (sem usar terminal)

Este guia assume que você nunca usou GitHub nem Vercel. São dois passos:
colocar o código no GitHub, depois conectar a Vercel a ele. Depois disso,
toda vez que você atualizar o código no GitHub, o site atualiza sozinho.

## Parte 1 — Colocar o projeto no GitHub

1. Crie uma conta em [github.com](https://github.com) (gratuito), se ainda
   não tiver.
2. No canto superior direito, clique no **+** e depois em **New repository**.
3. Dê um nome ao repositório, por exemplo `passo-certo`. Deixe como
   **Public** (ou Private, se preferir). Não marque nenhuma opção de criar
   README — vamos enviar os arquivos prontos. Clique em **Create repository**.
4. Na página do repositório recém-criado, clique no link **uploading an
   existing file** (ou "Add file" → "Upload files").
5. Arraste todos os arquivos e pastas deste projeto para a área indicada
   (mantenha a estrutura de pastas: `css/`, `js/`, `icons/`, etc. — se o seu
   navegador permitir arrastar pastas inteiras, ótimo; senão, use um
   programa de arquivos para compactar tudo em um `.zip` primeiro e o
   próprio GitHub tem uma opção de arrastar a pasta).
6. Role até o final da página, escreva uma mensagem como "Primeira versão do
   Passo Certo" e clique em **Commit changes**.

Pronto — o código está no GitHub.

## Parte 2 — Publicar na Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Sign Up**.
2. Escolha **Continue with GitHub** e autorize o acesso — assim a Vercel
   enxerga os seus repositórios.
3. No painel da Vercel, clique em **Add New...** → **Project**.
4. Encontre o repositório `passo-certo` na lista e clique em **Import**.
5. Na tela de configuração:
   - **Framework Preset**: deixe em **Other** (o projeto não usa nenhum
     framework nem precisa de build).
   - **Build Command**: deixe em branco.
   - **Output Directory**: deixe em branco (ou `.`, se pedir algo).
6. Clique em **Deploy**. Em menos de um minuto, a Vercel mostra uma tela de
   sucesso com um link do tipo `passo-certo.vercel.app` — esse é o seu site,
   já no ar.

## Atualizando o site depois

Sempre que quiser mudar algo:

1. Volte ao repositório no GitHub, abra o arquivo que quer editar, clique no
   ícone de lápis (editar), faça a mudança e clique em **Commit changes**.
2. A Vercel detecta a mudança sozinha e publica uma nova versão em segundos
   — não é preciso fazer nada na Vercel.

## Domínio próprio (opcional)

No painel do projeto na Vercel, vá em **Settings** → **Domains** e siga as
instruções para apontar um domínio próprio, se você tiver um.

## Arquivos importantes deste projeto

- `index.html` — o aplicativo em si (não precisa mexer para publicar).
- `dossie.html` — o dossiê acadêmico do projeto.
- `vercel.json` — já configurado com URLs limpas e cabeçalhos de segurança;
  não precisa alterar nada aqui para o deploy funcionar.
- `manifest.json` e `sw.js` — deixam o app instalável e funcionando offline;
  também não exigem nenhuma configuração extra na Vercel.

## Problemas comuns

- **"Build failed" na Vercel**: normalmente é porque o Framework Preset não
  ficou em "Other". Vá em Settings → General → Build & Development
  Settings e mude para Other, com os campos de build vazios.
- **O app abre mas as fontes não carregam**: verifique sua conexão — as
  fontes vêm do Google Fonts na primeira visita; depois disso, o service
  worker guarda uma cópia para uso offline.
