import type { CaseRecord } from "./types";
import { listCases, upsertCase, deleteCase } from "./storage";

const EXAMPLE_PREFIX = "example-";

const baseRecord = (id: string): CaseRecord => ({
  id,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  status: "completo",
  currentStep: 6,
  ownerEmail: "",
  v4Unit: "",
  clientName: "",
  clientCnpj: "",
  clientStatus: "ativo",
  clientCity: "",
  clientState: "",
  operationReach: "",
  collaborators: [],
  salesModel: "",
  segment: "",
  nicho: "",
  products: [],
  primaryDriver: "",
  initialChallenges: [],
  initialChallengesOther: "",
  problem: "",
  rootCause: "",
  restrictions: [],
  restrictionsOther: "",
  previousAttempt: "",
  previousFailureReason: "",
  saberDirections: [],
  saberExecution: "",
  terValuePerception: "",
  executarProfessionals: [],
  executarChannels: [],
  executarCreatives: [],
  executarCreativesCommunication: "",
  executarStrategies: [],
  potencializarValueModel: "",
  potencializarIndicator: "",
  timeToResult: "",
  primaryMetrics: [],
  secondaryMetrics: [],
  mediaInvestment: "",
  attributedRevenue: "",
  dashboardUrl: "",
  presentationUrl: "",
  testimonialUrl: "",
  finalNotes: "",
});

const exampleCases: CaseRecord[] = [
  {
    ...baseRecord(`${EXAMPLE_PREFIX}1`),
    ownerEmail: "marina.costa@v4company.com",
    v4Unit: "V4 São Paulo - Pinheiros",
    clientName: "Lina Beachwear",
    clientCnpj: "23.456.789/0001-12",
    clientStatus: "ativo",
    clientCity: "São Paulo",
    clientState: "SP",
    operationReach: "nacional",
    salesModel: "ecommerce",
    segment: "E-commerce",
    nicho: "Moda praia premium",
    products: ["saber", "executar"],
    primaryDriver: "executar",
    initialChallenges: ["CAC ou CPL muito alto", "Mídia paga sem escalar"],
    problem:
      "Marca de moda praia que conseguia escalar campanhas de Meta Ads no verão, mas o ROAS desabava fora da temporada e o CAC inviabilizava o crescimento.",
    rootCause:
      "Oferta indiferenciada e dependência de público frio no Meta. Não havia funil de retargeting nem segmentação por momento de compra. Criativo era 100% lifestyle, sem prova social.",
    restrictions: ["Time pequeno ou sem expertise", "Dados/tracking inexistentes ou ruins"],
    previousAttempt: "agencia",
    previousFailureReason:
      "A agência anterior mantinha as campanhas estáveis mas não tinha hipótese clara de escala — só ajustava lance.",
    saberDirections: [
      {
        direction: "Reposicionar para 'praia o ano todo' criando ocasiões de uso",
        rationale:
          "Pesquisa mostrou que 38% das clientes usam biquíni em piscina e academia, não apenas verão.",
        impact:
          "Permitiu rodar campanhas em meses tradicionalmente fracos com bons resultados.",
      },
      {
        direction: "Criar funil de retargeting por estágio",
        rationale:
          "Tracking mostrava 87% das visitas saindo sem converter sem nenhuma comunicação subsequente.",
        impact: "Recuperação de 18% das visitas via retargeting estruturado.",
      },
    ],
    saberExecution: "integral",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Designer Gráfico",
      "Profissional de Audiovisual",
      "Profissional de Business Intelligence",
    ],
    executarChannels: [
      { channel: "Meta Ads", investment: "120000", revenue: "504000" },
      { channel: "Google Ads", investment: "45000", revenue: "162000" },
      { channel: "TikTok Ads", investment: "25000", revenue: "67500" },
    ],
    executarCreatives: ["UGC", "Demonstração de produto/serviço", "Depoimento de cliente"],
    executarCreativesCommunication:
      "Tom direto e empoderado. Mensagem central: 'biquíni que cabe em todos os corpos e em todas as estações'. Gancho de prova social com clientes reais usando em piscina, academia e viagens.",
    executarStrategies: [
      {
        strategy: "Funil de retargeting com público de carrinho abandonado",
        appliedAt: "Meta Ads — base de últimos 30 dias com criativos de prova social",
      },
      {
        strategy: "Campanhas de aquisição com lookalike de top 1% LTV",
        appliedAt: "Meta Ads — base de clientes com 2+ compras",
      },
      {
        strategy: "Catálogo dinâmico com conteúdo gerado por usuárias",
        appliedAt: "Meta Ads e TikTok Ads — substituiu 70% do criativo antigo",
      },
    ],
    timeToResult: "6m",
    primaryMetrics: [
      {
        metricKey: "roas",
        label: "ROAS",
        unit: "number",
        before: "1.6",
        after: "3.8",
      },
      {
        metricKey: "receita",
        label: "Receita/Faturamento",
        unit: "currency",
        before: "180000",
        after: "733500",
      },
      {
        metricKey: "ticket_medio",
        label: "Ticket médio",
        unit: "currency",
        before: "189",
        after: "247",
      },
      {
        metricKey: "recompra_90d",
        label: "Taxa de recompra em 90 dias",
        unit: "percent",
        before: "8",
        after: "21",
      },
    ],
    secondaryMetrics: [],
    mediaInvestment: "190000",
    attributedRevenue: "733500",
    dashboardUrl: "https://lookerstudio.google.com/example-lina",
    presentationUrl: "https://drive.google.com/example-deck",
    testimonialUrl: "",
    finalNotes:
      "Cliente relatou que pela primeira vez conseguiu projetar receita de mídia com confiança e alinhar produção do estoque ao forecast.",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}2`),
    ownerEmail: "rafael.silva@v4company.com",
    v4Unit: "V4 Curitiba",
    clientName: "FleetFlow Logística",
    clientCnpj: "11.222.333/0001-45",
    clientStatus: "ativo",
    clientCity: "Curitiba",
    clientState: "PR",
    operationReach: "nacional",
    salesModel: "inside_sales",
    segment: "SaaS",
    nicho: "SaaS de logística e frotas",
    products: ["executar"],
    primaryDriver: "executar",
    initialChallenges: [
      "CAC ou CPL muito alto",
      "Time comercial não converte os leads gerados",
    ],
    problem:
      "SaaS de gestão de frotas com CPL acima de R$ 800 e SDRs reclamando que os leads não tinham fit. Pipeline travado.",
    rootCause:
      "Segmentação ampla demais nos anúncios e formulário sem qualificação. Lead de empresa com 5 carros entrando junto com lead de transportadora com 200.",
    restrictions: ["Orçamento limitado"],
    previousAttempt: "interna",
    previousFailureReason:
      "Time de marketing interno não tinha banco de criativos para testar hipóteses e a diretoria não permitia mudar formulário 'porque sempre foi assim'.",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Redação Publicitária",
      "Profissional de Designer Gráfico",
    ],
    executarChannels: [
      { channel: "Google Ads", investment: "60000", revenue: "0" },
      { channel: "LinkedIn Ads", investment: "35000", revenue: "0" },
      { channel: "Meta Ads", investment: "20000", revenue: "0" },
    ],
    executarCreatives: [
      "Depoimento de cliente",
      "Educacional/autoridade",
      "Demonstração de produto/serviço",
    ],
    executarCreativesCommunication:
      "Tom técnico e direto. Mensagem: 'reduza 12% do consumo de combustível em 60 dias'. Prova social com logos de transportadoras conhecidas.",
    executarStrategies: [
      {
        strategy: "Reescrita do formulário com qualificação por porte da frota",
        appliedAt: "Todas as LPs — bloqueia leads com menos de 30 veículos",
      },
      {
        strategy: "Camada educacional para topo de funil com whitepaper de ROI",
        appliedAt: "LinkedIn Ads — público de gerentes de logística",
      },
    ],
    timeToResult: "3m",
    primaryMetrics: [
      {
        metricKey: "cpmql",
        label: "CPMQL (Custo por MQL)",
        unit: "currency",
        before: "820",
        after: "310",
      },
      {
        metricKey: "vol_mql",
        label: "Volume de MQLs",
        unit: "number",
        before: "42",
        after: "108",
      },
      {
        metricKey: "vol_vendas",
        label: "Volume de vendas",
        unit: "number",
        before: "3",
        after: "11",
      },
      {
        metricKey: "ciclo_venda",
        label: "Ciclo de venda",
        unit: "days",
        before: "62",
        after: "38",
      },
    ],
    secondaryMetrics: [],
    mediaInvestment: "115000",
    attributedRevenue: "0",
    dashboardUrl: "https://app.metabase.com/example-fleetflow",
    presentationUrl: "",
    testimonialUrl: "",
    finalNotes: "",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}3`),
    ownerEmail: "joana.lima@v4company.com",
    v4Unit: "V4 Belo Horizonte",
    clientName: "Studio Mariana",
    clientCnpj: "98.765.432/0001-89",
    clientStatus: "ativo",
    clientCity: "Belo Horizonte",
    clientState: "MG",
    operationReach: "local",
    salesModel: "pdv",
    segment: "Beleza e estética",
    nicho: "Studio de beleza e bem-estar",
    products: ["ter", "executar"],
    primaryDriver: "executar",
    initialChallenges: [
      "Baixo volume de leads / vendas",
      "Dependência excessiva de poucos canais",
    ],
    problem:
      "Studio de beleza dependia 100% de indicação boca a boca. Quando indicações esfriavam, agenda ficava vazia.",
    rootCause:
      "Sem captação ativa nem CRM. Cliente que sumiu não voltava porque ninguém lembrava.",
    restrictions: ["Time pequeno ou sem expertise", "Política interna ou aprovações"],
    previousAttempt: "nao",
    terValuePerception:
      "Após o setup do CRM e da automação de WhatsApp, a recepcionista deixou de fazer agendamento manual em planilha. Reativações de clientes inativas viraram régua semanal automatizada — recuperando R$ 18 mil/mês sem custo de mídia.",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Social Media",
      "Profissional de CRM",
    ],
    executarChannels: [
      { channel: "Meta Ads", investment: "12000", revenue: "78000" },
      { channel: "Google Ads (local)", investment: "8000", revenue: "42000" },
    ],
    executarCreatives: ["Depoimento de cliente", "Oferta/promoção", "UGC"],
    executarCreativesCommunication:
      "Tom acolhedor, próximo do dia a dia. Foco em depoimentos curtos (15s) de clientes reais com antes/depois sutil. Gancho de oferta de primeira sessão.",
    executarStrategies: [
      {
        strategy: "Geofencing 5km ao redor do studio com criativos de primeira sessão",
        appliedAt: "Meta Ads e Google Ads local",
      },
      {
        strategy: "Régua de WhatsApp para reativação aos 60 dias",
        appliedAt: "CRM — clientes sem agendamento há 60+ dias",
      },
    ],
    timeToResult: "3m",
    primaryMetrics: [
      {
        metricKey: "receita",
        label: "Receita",
        unit: "currency",
        before: "62000",
        after: "138000",
      },
      {
        metricKey: "vol_vendas",
        label: "Volume de vendas",
        unit: "number",
        before: "85",
        after: "172",
      },
      {
        metricKey: "ticket_medio",
        label: "Ticket médio",
        unit: "currency",
        before: "729",
        after: "802",
      },
      {
        metricKey: "taxa_retorno_cliente",
        label: "Taxa de retorno do cliente",
        unit: "percent",
        before: "12",
        after: "34",
      },
    ],
    secondaryMetrics: [
      { name: "Reativações via CRM", before: "0", after: "23" },
    ],
    mediaInvestment: "20000",
    attributedRevenue: "120000",
    dashboardUrl: "",
    presentationUrl: "https://drive.google.com/example-studio",
    testimonialUrl: "https://youtu.be/example-testimonial",
    finalNotes: "",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}4`),
    ownerEmail: "pedro.alves@v4company.com",
    v4Unit: "V4 São Paulo - Faria Lima",
    clientName: "Norte Aço Indústria",
    clientCnpj: "55.444.333/0001-22",
    clientStatus: "ativo",
    clientCity: "Joinville",
    clientState: "SC",
    operationReach: "regional",
    salesModel: "inside_sales",
    segment: "Indústria",
    nicho: "Indústria de aço técnico B2B",
    products: ["saber"],
    primaryDriver: "saber",
    initialChallenges: [
      "Marca / posicionamento confuso ou pouco diferenciado",
      "Falta de previsibilidade de receita",
      "Funil comercial não estruturado",
    ],
    problem:
      "Indústria de chapas de aço B2B vendendo por preço, perdendo deals para concorrentes asiáticos. Margem caindo trimestre a trimestre.",
    rootCause:
      "Posicionamento genérico ('temos qualidade e preço') sem ICP claro. Time comercial atendendo qualquer pedido sem critério, gastando tempo em deals pequenos.",
    restrictions: ["Política interna ou aprovações"],
    previousAttempt: "interna",
    previousFailureReason:
      "Diretoria comercial sempre tratou marketing como 'feira e folder'. Não havia processo de qualificação.",
    saberDirections: [
      {
        direction: "Definir ICP por verticais — automotivo e construção naval",
        rationale:
          "Análise de margem mostrou que 80% do lucro vinha de 22% dos clientes, todos nesses dois nichos.",
        impact:
          "Time comercial passou a recusar deals fora do ICP — produtividade dobrou.",
      },
      {
        direction: "Reposicionar como 'aço técnico para aplicação crítica'",
        rationale:
          "Asiáticos não atendem certificação ABNT específica que esses dois verticais exigem.",
        impact:
          "Conseguiu praticar +18% de prêmio no preço sem perda de share.",
      },
      {
        direction: "Implementar processo de qualificação por porte e ticket",
        rationale: "Time gastava 70% do tempo em deals que respondiam por 12% da receita.",
        impact: "",
      },
    ],
    saberExecution: "parcial",
    timeToResult: "9m",
    primaryMetrics: [
      {
        metricKey: "receita",
        label: "Receita",
        unit: "currency",
        before: "4200000",
        after: "5670000",
      },
      {
        metricKey: "ticket_medio",
        label: "Ticket médio",
        unit: "currency",
        before: "85000",
        after: "142000",
      },
    ],
    secondaryMetrics: [],
    mediaInvestment: "",
    attributedRevenue: "",
    dashboardUrl: "https://lookerstudio.google.com/example-norte",
    presentationUrl: "https://drive.google.com/example-norte-deck",
    testimonialUrl: "",
    finalNotes:
      "Diretoria assumiu que a maior dificuldade foi cultural — convencer comerciais antigos a recusar pedido. Processo deve consolidar nos próximos 6 meses.",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}5`),
    ownerEmail: "carla.mendes@v4company.com",
    v4Unit: "V4 Rio de Janeiro - Barra",
    clientName: "Verde & Saúde",
    clientCnpj: "33.221.110/0001-66",
    clientStatus: "ativo",
    clientCity: "Rio de Janeiro",
    clientState: "RJ",
    operationReach: "estadual",
    salesModel: "hibrido",
    segment: "Saúde",
    nicho: "Clínicas de medicina integrativa",
    products: ["saber", "ter", "executar", "potencializar"],
    primaryDriver: "executar",
    initialChallenges: [
      "Conversão baixa (LP, e-commerce, loja)",
      "Dados / tracking não confiáveis",
      "Mídia paga sem escalar",
    ],
    problem:
      "Rede de clínicas de medicina integrativa com 4 unidades físicas e e-commerce de suplementos. Crescimento estagnado — receita do e-com flat há 8 meses, agenda das clínicas com vacância de 30%.",
    rootCause:
      "Operações de mídia separadas (uma para clínica, uma para e-com) sem cruzamento. Cliente que comprava no e-com não recebia oferta de consulta. Cliente da clínica sumia sem follow-up.",
    restrictions: ["Ferramenta/stack legada", "Política interna ou aprovações"],
    previousAttempt: "agencia",
    previousFailureReason:
      "Duas agências (uma para cada operação) com KPIs cruzados. A do e-com sabotava conversões para consulta.",
    saberDirections: [
      {
        direction: "Unificar operação de mídia com KPI de LTV cruzado",
        rationale: "Cliente que faz consulta + compra suplemento tem 3.4x mais LTV.",
        impact: "Agências internas alinhadas no mesmo norte.",
      },
    ],
    saberExecution: "integral",
    terValuePerception:
      "CRM unificou cadastro de paciente da clínica e cliente do e-com. Recepcionista da clínica passou a ver histórico de compra de suplemento na hora da consulta — recomendação ficou natural.",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Business Intelligence",
      "Profissional de CRM",
      "Profissional de Designer Gráfico",
      "Profissional de Audiovisual",
      "Profissional de Web Design",
    ],
    executarChannels: [
      { channel: "Meta Ads", investment: "85000", revenue: "412000" },
      { channel: "Google Ads", investment: "55000", revenue: "298000" },
    ],
    executarCreatives: [
      "Depoimento de cliente",
      "Educacional/autoridade",
      "Demonstração de produto/serviço",
    ],
    executarCreativesCommunication:
      "Tom científico mas acessível. Médica titular como rosto da marca. Mensagem central: 'cuidado integral que une consultório e suplementação'.",
    executarStrategies: [
      {
        strategy: "Funil cruzado: comprador de suplemento vira lead de consulta",
        appliedAt: "Meta Ads — público de últimos 90 dias do e-com",
      },
      {
        strategy: "Conteúdo educacional da médica como aquisição",
        appliedAt: "Reels e YouTube — base fria",
      },
    ],
    potencializarValueModel:
      "Indicador de saúde do paciente ao longo de 6 meses (escala validada de bem-estar) cruzado com LTV financeiro. Cliente vê seu progresso, V4 mostra ROI da operação.",
    potencializarIndicator: "Índice integrado de bem-estar + LTV (12 meses)",
    timeToResult: "9m",
    primaryMetrics: [
      {
        metricKey: "receita",
        label: "Receita/Faturamento",
        unit: "currency",
        before: "640000",
        after: "1180000",
      },
      {
        metricKey: "roas",
        label: "ROAS",
        unit: "number",
        before: "2.1",
        after: "5.1",
      },
      {
        metricKey: "ticket_medio",
        label: "Ticket médio",
        unit: "currency",
        before: "385",
        after: "512",
      },
    ],
    secondaryMetrics: [
      { name: "Vacância na agenda das clínicas", before: "30", after: "8" },
    ],
    mediaInvestment: "140000",
    attributedRevenue: "710000",
    dashboardUrl: "https://lookerstudio.google.com/example-verde",
    presentationUrl: "https://drive.google.com/example-verde-deck",
    testimonialUrl: "https://youtu.be/example-verde",
    finalNotes:
      "Maior aprendizado: quebrar silos entre operações é mais barato e rápido do que criar canais novos.",
  },
];

export const seedExampleCases = (): number => {
  exampleCases.forEach((c) => upsertCase(c));
  return exampleCases.length;
};

export const clearExampleCases = (): number => {
  const all = listCases();
  const examples = all.filter((c) => c.id.startsWith(EXAMPLE_PREFIX));
  examples.forEach((c) => deleteCase(c.id));
  return examples.length;
};

export const hasExampleCases = (): boolean =>
  listCases().some((c) => c.id.startsWith(EXAMPLE_PREFIX));
