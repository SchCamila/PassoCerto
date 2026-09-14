// Amostra representativa de ocupações informais comuns, com o CNAE mais
// próximo e se a atividade costuma estar na lista de ocupações permitidas
// ao MEI. NÃO é a base oficial completa (ver limitações no README) — é um
// recorte para a busca funcionar de forma útil e honesta na demonstração.
export const OCUPACOES_CNAE = [
  { nome: 'Costureira / costureiro', cnae: '14.12-6/01', descricaoCnae: 'Confecção de peças do vestuário, exceto roupas íntimas', tipo: 'servico', elegivel: true },
  { nome: 'Cabeleireiro(a)', cnae: '96.02-5/01', descricaoCnae: 'Cabeleireiros, manicure e pedicure', tipo: 'servico', elegivel: true },
  { nome: 'Manicure e pedicure', cnae: '96.02-5/02', descricaoCnae: 'Atividades de estética e outros serviços de cuidados com a beleza', tipo: 'servico', elegivel: true },
  { nome: 'Motorista de aplicativo', cnae: '49.23-0/02', descricaoCnae: 'Transporte rodoviário de táxi', tipo: 'servico', elegivel: true },
  { nome: 'Pedreiro(a)', cnae: '43.99-1/03', descricaoCnae: 'Obras de alvenaria', tipo: 'servico', elegivel: true },
  { nome: 'Eletricista', cnae: '43.21-5/00', descricaoCnae: 'Instalação e manutenção elétrica', tipo: 'servico', elegivel: true },
  { nome: 'Vendedor(a) ambulante de roupas', cnae: '47.81-4/00', descricaoCnae: 'Comércio varejista de artigos do vestuário e acessórios', tipo: 'comercio', elegivel: true },
  { nome: 'Cozinheira(o) / marmiteira(o)', cnae: '56.20-1/04', descricaoCnae: 'Fornecimento de alimentos preparados (marmitas)', tipo: 'comercio', elegivel: true },
  { nome: 'Fotógrafo(a)', cnae: '74.20-0/01', descricaoCnae: 'Atividades de produção de fotografias', tipo: 'servico', elegivel: true },
  { nome: 'Personal trainer', cnae: '93.13-1/00', descricaoCnae: 'Atividades de condicionamento físico', tipo: 'servico', elegivel: true },
  { nome: 'Artesã(o)', cnae: '32.99-0/05', descricaoCnae: 'Fabricação de artefatos diversos (artesanato)', tipo: 'comercio', elegivel: true },
  { nome: 'Doceira(o) / confeiteira(o)', cnae: '10.91-1/02', descricaoCnae: 'Fabricação de produtos de padaria e confeitaria', tipo: 'comercio', elegivel: true },
  { nome: 'Jardineiro(a)', cnae: '81.30-3/00', descricaoCnae: 'Atividades paisagísticas', tipo: 'servico', elegivel: true },
  { nome: 'Técnico(a) em manutenção de computadores', cnae: '95.11-8/00', descricaoCnae: 'Reparação e manutenção de computadores', tipo: 'servico', elegivel: true },
  { nome: 'Diarista', cnae: '97.00-5/00', descricaoCnae: 'Serviços domésticos', tipo: 'servico', elegivel: false, motivoInelegivel: 'Serviço doméstico contínuo a uma família costuma exigir carteira assinada (CLT), não MEI. Vale conversar com o Meu INSS/Ministério do Trabalho sobre o seu caso.' },
  { nome: 'Advogado(a)', cnae: '69.11-7/01', descricaoCnae: 'Atividades jurídicas', tipo: 'servico', elegivel: false, motivoInelegivel: 'Profissão regulamentada por conselho de classe (OAB) — a lei do MEI não permite essa atividade.' },
  { nome: 'Médico(a)', cnae: '86.30-5/03', descricaoCnae: 'Atividade médica ambulatorial', tipo: 'servico', elegivel: false, motivoInelegivel: 'Profissão regulamentada por conselho de classe (CRM) — a lei do MEI não permite essa atividade.' },
  { nome: 'Contador(a)', cnae: '69.20-6/01', descricaoCnae: 'Atividades de contabilidade', tipo: 'servico', elegivel: false, motivoInelegivel: 'Profissão regulamentada por conselho de classe (CRC) — a lei do MEI não permite essa atividade.' },
  { nome: 'Corretor(a) de imóveis', cnae: '68.22-6/00', descricaoCnae: 'Gestão e intermediação imobiliária', tipo: 'servico', elegivel: false, motivoInelegivel: 'Atividade de intermediação está fora da lista de ocupações permitidas ao MEI.' },
];

export function buscarOcupacoes(termo) {
  const alvo = termo.trim().toLowerCase();
  if (!alvo) return [];
  return OCUPACOES_CNAE.filter((o) => o.nome.toLowerCase().includes(alvo));
}
