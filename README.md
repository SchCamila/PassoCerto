# Passo Certo

Aplicativo que ajuda trabalhadores brasileiros por conta própria a decidir se
vale a pena se formalizar como **MEI** (Microempreendedor Individual), a dar
esse passo e a manter o registro em dia.

> Projeto acadêmico de Engenharia de Software voltado à **ODS 8** da ONU
> (trabalho decente e crescimento econômico — metas 8.3, 8.5, 8.8 e 8.10).

Veja também o **[dossiê do projeto](dossie.html)**, com o problema, os
objetivos, o comparativo com as ferramentas existentes e as telas do app.

## O problema

No Brasil, 37,5% da população ocupada está na informalidade — cerca de 38,5
milhões de pessoas (PNAD Contínua/IBGE, trimestre nov.2025–jan.2026). A
informalidade significa três privações: sem cobertura do INSS, sem nota
fiscal e sem histórico de renda para pedir crédito. O MEI resolve as três por
poucos reais por dia — mas a decisão de se formalizar esbarra em falta de
informação, não de dinheiro. As ferramentas oficiais (Meu MEI Digital, Meu
INSS) já resolvem o *ato* de formalizar; o Passo Certo ataca a *decisão*, que
vem antes.

## Módulos do app

| Módulo | O que faz |
|---|---|
| **Entrada / login** | Login sem senha em 3 passos (celular, código, identificação), sem exigir conta gov.br. |
| **Início** | Progresso na trilha de formalização, saldo do mês, medidor do teto anual, alertas. |
| **Formalizar** | Busca de ocupação → CNAE, diagnóstico de custo do MEI com a renda real, tabela comparativa informal × MEI, trilha de 5 passos até o Portal do Empreendedor. |
| **Caixa** | Lançamentos de entrada/saída, gráfico de 6 meses, calculadora de "quanto cobrar", recibo compartilhável, comprovante de renda imprimível. |
| **Direitos** | Os seis benefícios previdenciários do MEI, com carência e um simulador de meses contribuídos. |
| **Deveres** | Grade de 12 meses do DAS, multas por atraso, lembrete da DASN-SIMEI, regra do desenquadramento. |
| **Perfil / Sobre** | Dados editáveis, exportar/importar em JSON, apagar tudo, alto contraste, restaurar demonstração, dados da equipe acadêmica. |

Recursos transversais: microlições de uma linha para siglas (DAS, CNAE, CNPJ,
DASN-SIMEI, CCMEI), leitura em voz alta dos números principais, tema
claro/escuro, alto contraste, PWA instalável com funcionamento offline.

## Parâmetros legais usados (2026)

Centralizados em `js/regras.js`, atualização anual em um só lugar:

```js
const SM = 1621.00;                 // salário mínimo 2026
const INSS = 81.05;                 // 5% do salário mínimo
const DAS = { comercio: 82.05, servico: 86.05, ambos: 87.05 };
const TETO = 81000;                 // limite anual de faturamento
const TOLER = 97200;                // teto + 20%
```

DAS vence todo dia 20; multa de 0,33% ao dia, limitada a 20%. DASN-SIMEI até
31 de maio. Carências previdenciárias: auxílio por incapacidade temporária e
aposentadoria por incapacidade permanente (12 contribuições), salário-
maternidade (10), pensão por morte (sem carência), auxílio-reclusão (24),
aposentadoria por idade (180 contribuições + 62/65 anos). Os 5% de INSS do
MEI **não contam para aposentadoria por tempo de contribuição** — o app
avisa isso explicitamente e orienta confirmar no Meu INSS.

## Arquitetura

Site estático — HTML/CSS/JS puro com módulos ES nativos, sem framework nem
bundler, publicável na Vercel sem configuração de build. Regras de negócio
isoladas em `js/regras.js` e testadas em `tests/regras.test.mjs` (`node
tests/regras.test.mjs`, sem dependências). PWA com `manifest.json` e `sw.js`
para uso offline.

## Rodando localmente

Qualquer servidor estático funciona, por exemplo:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```

Não é necessário `npm install` nem build — veja `DEPLOY.md` para publicar.

## Testes

```bash
node tests/regras.test.mjs
```

## Limitações

- O app **não emite guia nem abre CNPJ** — depende de integração com
  sistemas federais; a formalização de fato acontece no Portal do
  Empreendedor (gov.br).
- A lista de ocupações elegíveis ao MEI (`js/ocupacoes.js`) é uma **amostra
  representativa**, não a base oficial completa de CNAEs permitidos.
- Os parâmetros fiscais mudam anualmente; o PLP 60/2025 e o PLP 67/2025
  propõem elevar o teto do MEI para R$ 140 mil ou R$ 150 mil.
- **Não houve teste de usabilidade com o público-alvo real** — é o próximo
  passo, indispensável antes de qualquer lançamento.
- Este é um protótipo acadêmico: os dados de demonstração (persona Marli
  Ferreira) são fictícios, o código de verificação do login é sempre `1234`,
  e nenhum dado sai do aparelho de quem usa o app (tudo em `localStorage`).

## Fontes

PNAD Contínua (IBGE) · Perfil do MEI (Sebrae) · metas nacionais da ODS 8
(Ipea) · Lei Complementar nº 123/2006 · Lei Complementar nº 128/2008 · Lei
nº 13.709/2018 (LGPD) · Portal do Empreendedor e Meu MEI Digital (gov.br) ·
tabela DAS-MEI 2026 · reajuste do salário mínimo 2026.
