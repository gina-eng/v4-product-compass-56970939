export type SalesModel = "inside_sales" | "ecommerce" | "pdv" | "hibrido";
export type V4Product = "saber" | "ter" | "executar" | "potencializar";
export type ClientStatus = "ativo" | "inativo";
export type PreviousAttempt =
  | "agencia"
  | "interna"
  | "freelancer"
  | "nao";
export type CaseStatus = "rascunho" | "completo" | "sem_evidencia";

export const SALES_MODELS: { value: SalesModel; label: string; description: string }[] = [
  {
    value: "inside_sales",
    label: "Inside Sales",
    description: "Vendas consultivas com SDR/closer e ciclo de venda mais longo.",
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    description: "Conversão direta no checkout, foco em ROAS e ticket médio.",
  },
  {
    value: "pdv",
    label: "PDV",
    description: "Operação física com fluxo de loja e venda presencial.",
  },
  {
    value: "hibrido",
    label: "Híbrido",
    description: "Combina dois ou mais modelos de venda no mesmo cliente.",
  },
];

export const V4_PRODUCTS: {
  value: V4Product;
  label: string;
  tagline: string;
  toneClass: string;
}[] = [
  {
    value: "saber",
    label: "SABER",
    tagline: "Consultoria e diagnóstico estratégico",
    toneClass: "border-saber/40 bg-saber/5 text-saber",
  },
  {
    value: "ter",
    label: "TER",
    tagline: "Implementação e tecnologia",
    toneClass: "border-ter/40 bg-ter/5 text-ter",
  },
  {
    value: "executar",
    label: "EXECUTAR",
    tagline: "Operação de mídia e performance",
    toneClass: "border-executar/40 bg-executar/5 text-executar",
  },
  {
    value: "potencializar",
    label: "POTENCIALIZAR",
    tagline: "Sucesso direcionado e valor percebido",
    toneClass: "border-potencializar/40 bg-potencializar/5 text-potencializar",
  },
];

export type OperationReach =
  | "local"
  | "regional"
  | "estadual"
  | "nacional"
  | "internacional";

export const OPERATION_REACH_OPTIONS: { value: OperationReach; label: string; description: string }[] = [
  { value: "local", label: "Local", description: "Atende uma cidade ou bairro." },
  { value: "regional", label: "Regional", description: "Atende várias cidades da mesma região." },
  { value: "estadual", label: "Estadual", description: "Atende um estado inteiro." },
  { value: "nacional", label: "Nacional", description: "Opera em todo o Brasil." },
  { value: "internacional", label: "Internacional", description: "Atende outros países." },
];

export const BRAZIL_STATES: { value: string; label: string }[] = [
  { value: "AC", label: "AC — Acre" },
  { value: "AL", label: "AL — Alagoas" },
  { value: "AP", label: "AP — Amapá" },
  { value: "AM", label: "AM — Amazonas" },
  { value: "BA", label: "BA — Bahia" },
  { value: "CE", label: "CE — Ceará" },
  { value: "DF", label: "DF — Distrito Federal" },
  { value: "ES", label: "ES — Espírito Santo" },
  { value: "GO", label: "GO — Goiás" },
  { value: "MA", label: "MA — Maranhão" },
  { value: "MT", label: "MT — Mato Grosso" },
  { value: "MS", label: "MS — Mato Grosso do Sul" },
  { value: "MG", label: "MG — Minas Gerais" },
  { value: "PA", label: "PA — Pará" },
  { value: "PB", label: "PB — Paraíba" },
  { value: "PR", label: "PR — Paraná" },
  { value: "PE", label: "PE — Pernambuco" },
  { value: "PI", label: "PI — Piauí" },
  { value: "RJ", label: "RJ — Rio de Janeiro" },
  { value: "RN", label: "RN — Rio Grande do Norte" },
  { value: "RS", label: "RS — Rio Grande do Sul" },
  { value: "RO", label: "RO — Rondônia" },
  { value: "RR", label: "RR — Roraima" },
  { value: "SC", label: "SC — Santa Catarina" },
  { value: "SP", label: "SP — São Paulo" },
  { value: "SE", label: "SE — Sergipe" },
  { value: "TO", label: "TO — Tocantins" },
];

export const V4_UNITS_MOCK: string[] = [
  "V4 Matriz",
  "V4 São Paulo - Pinheiros",
  "V4 São Paulo - Faria Lima",
  "V4 Rio de Janeiro - Barra",
  "V4 Belo Horizonte",
  "V4 Curitiba",
  "V4 Porto Alegre",
  "V4 Florianópolis",
  "V4 Brasília",
  "V4 Salvador",
  "V4 Recife",
  "V4 Fortaleza",
];

export const SEGMENTS_MOCK: string[] = [
  "Saúde",
  "Educação",
  "Varejo físico",
  "E-commerce",
  "SaaS",
  "Indústria",
  "Serviços B2B",
  "Imobiliário",
  "Alimentação",
  "Beleza e estética",
  "Financeiro",
  "Automotivo",
  "Construção civil",
  "Outros",
];

export const INITIAL_CHALLENGES = [
  "Baixo volume de leads / vendas",
  "CAC ou CPL muito alto",
  "Mídia paga sem escalar",
  "Conversão baixa (LP, e-commerce, loja)",
  "Funil comercial não estruturado",
  "Time comercial não converte os leads gerados",
  "Falta de previsibilidade de receita",
  "Marca / posicionamento confuso ou pouco diferenciado",
  "Dependência excessiva de poucos canais",
  "Dados / tracking não confiáveis",
];

export const RESTRICTIONS = [
  "Orçamento limitado",
  "Time pequeno ou sem expertise",
  "Ferramenta/stack legada",
  "Prazo curto",
  "Política interna ou aprovações",
  "Dados/tracking inexistentes ou ruins",
];

export const PREVIOUS_ATTEMPT_OPTIONS: { value: PreviousAttempt; label: string }[] = [
  { value: "agencia", label: "Sim, com outra agência/consultoria" },
  { value: "interna", label: "Sim, internamente" },
  { value: "freelancer", label: "Sim, com freelancer" },
  { value: "nao", label: "Não, V4 foi a primeira tentativa estruturada" },
];

export const SABER_EXECUTION_OPTIONS = [
  { value: "integral", label: "Executou integralmente" },
  { value: "parcial", label: "Executou parcialmente" },
  { value: "em_execucao", label: "Está em execução" },
];

export const EXECUTAR_PROFESSIONALS = [
  "Profissional de Audiovisual",
  "Profissional de Business Intelligence",
  "Profissional de CRM",
  "Profissional de Designer Gráfico",
  "Profissional de Gestão de Mídia Paga",
  "Profissional de Marketplace",
  "Profissional de Pré-Vendas (SDR)",
  "Profissional de Redação Publicitária",
  "Profissional de Sales Enablement",
  "Profissional de SEO",
  "Profissional de Social Media",
  "Profissional de Vendas (BDR)",
  "Profissional de Web Design",
];

const ECOM_CHANNELS = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "Marketplace Ads",
];
const IS_CHANNELS = [
  "Meta Ads",
  "Google Ads",
  "LinkedIn Ads",
  "YouTube Ads",
];
const PDV_CHANNELS = [
  "Meta Ads",
  "Google Ads (local)",
  "Influenciador local",
  "Mídia OOH",
];

export const CHANNELS_BY_MODEL: Record<SalesModel, string[]> = {
  ecommerce: ECOM_CHANNELS,
  inside_sales: IS_CHANNELS,
  pdv: PDV_CHANNELS,
  hibrido: Array.from(new Set([...ECOM_CHANNELS, ...IS_CHANNELS, ...PDV_CHANNELS])),
};

export const CREATIVE_TYPES = [
  "UGC",
  "Demonstração de produto/serviço",
  "Oferta/promoção",
  "Depoimento de cliente",
  "Educacional/autoridade",
  "Estático/anúncio direto",
];

export const CREATIVES_BY_MODEL: Record<SalesModel, string[]> = {
  ecommerce: CREATIVE_TYPES,
  inside_sales: CREATIVE_TYPES,
  pdv: CREATIVE_TYPES,
  hibrido: CREATIVE_TYPES,
};

export type MetricUnit = "currency" | "percent" | "number" | "days";
export type MetricDirection = "higher_is_better" | "lower_is_better";

export interface MetricOption {
  value: string;
  label: string;
  unit: MetricUnit;
  direction: MetricDirection;
  principal?: boolean;
}

export const getMetricDirection = (metricKey: string): MetricDirection => {
  if (["cpl", "cpmql", "cac", "ciclo_venda"].includes(metricKey))
    return "lower_is_better";
  return "higher_is_better";
};

// Ordem segue o funil: marketing/aquisição → conversão → vendas → faturamento → retenção.
// `principal: true` = visível por padrão no form. As demais ficam atrás de "Mostrar outras métricas".
const ECOM_METRICS: MetricOption[] = [
  // marketing / aquisição
  { value: "cac", label: "CAC (Custo de aquisição)", unit: "currency", direction: "lower_is_better" },
  { value: "conv_rate", label: "Taxa de conversão", unit: "percent", direction: "higher_is_better" },
  // faturamento
  { value: "ticket_medio", label: "Ticket médio", unit: "currency", direction: "higher_is_better", principal: true },
  { value: "receita", label: "Receita/Faturamento", unit: "currency", direction: "higher_is_better", principal: true },
  { value: "roas", label: "ROAS", unit: "number", direction: "higher_is_better", principal: true },
  // retenção
  { value: "recompra_90d", label: "Taxa de recompra em 90 dias", unit: "percent", direction: "higher_is_better" },
];
const IS_METRICS: MetricOption[] = [
  // marketing / aquisição
  { value: "cpmql", label: "CPMQL (Custo por MQL)", unit: "currency", direction: "lower_is_better" },
  { value: "vol_mql", label: "Volume de MQLs", unit: "number", direction: "higher_is_better", principal: true },
  // conversão / vendas
  { value: "taxa_mql_cliente", label: "Taxa MQL → cliente", unit: "percent", direction: "higher_is_better" },
  { value: "cac", label: "CAC (Custo de aquisição)", unit: "currency", direction: "lower_is_better" },
  { value: "ciclo_venda", label: "Ciclo de venda", unit: "days", direction: "lower_is_better" },
  { value: "vol_vendas", label: "Volume de vendas", unit: "number", direction: "higher_is_better", principal: true },
  // faturamento
  { value: "ticket_medio", label: "Ticket médio", unit: "currency", direction: "higher_is_better" },
  { value: "receita", label: "Receita", unit: "currency", direction: "higher_is_better", principal: true },
];
const PDV_METRICS: MetricOption[] = [
  // marketing / aquisição
  { value: "cac", label: "CAC (Custo de aquisição)", unit: "currency", direction: "lower_is_better" },
  // conversão / vendas
  { value: "conv_visita_venda", label: "Taxa de conversão (visita → venda)", unit: "percent", direction: "higher_is_better" },
  { value: "vol_vendas", label: "Volume de vendas", unit: "number", direction: "higher_is_better", principal: true },
  // faturamento
  { value: "ticket_medio", label: "Ticket médio", unit: "currency", direction: "higher_is_better", principal: true },
  { value: "receita", label: "Receita", unit: "currency", direction: "higher_is_better", principal: true },
  // retenção
  { value: "taxa_retorno_cliente", label: "Taxa de retorno do cliente", unit: "percent", direction: "higher_is_better" },
];

// Híbrido: união manualmente ordenada pelo mesmo funil.
const HIBRIDO_METRICS: MetricOption[] = [
  // marketing / aquisição
  { value: "cac", label: "CAC (Custo de aquisição)", unit: "currency", direction: "lower_is_better" },
  { value: "cpmql", label: "CPMQL (Custo por MQL)", unit: "currency", direction: "lower_is_better" },
  { value: "vol_mql", label: "Volume de MQLs", unit: "number", direction: "higher_is_better" },
  // conversão / vendas
  { value: "conv_rate", label: "Taxa de conversão (e-commerce)", unit: "percent", direction: "higher_is_better" },
  { value: "conv_visita_venda", label: "Taxa de conversão (visita → venda)", unit: "percent", direction: "higher_is_better" },
  { value: "taxa_mql_cliente", label: "Taxa MQL → cliente", unit: "percent", direction: "higher_is_better" },
  { value: "ciclo_venda", label: "Ciclo de venda", unit: "days", direction: "lower_is_better" },
  { value: "vol_vendas", label: "Volume de vendas", unit: "number", direction: "higher_is_better", principal: true },
  // faturamento
  { value: "ticket_medio", label: "Ticket médio", unit: "currency", direction: "higher_is_better" },
  { value: "receita", label: "Receita/Faturamento", unit: "currency", direction: "higher_is_better", principal: true },
  { value: "roas", label: "ROAS", unit: "number", direction: "higher_is_better", principal: true },
  // retenção
  { value: "recompra_90d", label: "Taxa de recompra em 90 dias", unit: "percent", direction: "higher_is_better" },
  { value: "taxa_retorno_cliente", label: "Taxa de retorno do cliente", unit: "percent", direction: "higher_is_better" },
];

export const METRICS_BY_MODEL: Record<SalesModel, MetricOption[]> = {
  ecommerce: ECOM_METRICS,
  inside_sales: IS_METRICS,
  pdv: PDV_METRICS,
  hibrido: HIBRIDO_METRICS,
};

export const TIME_TO_RESULT_OPTIONS = [
  { value: "1m", label: "1 mês" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "9m", label: "9 meses" },
  { value: "12m", label: "12 meses" },
  { value: "12m+", label: "Mais de 12 meses" },
];

export const STEPS = [
  { id: 1, key: "client_setup", title: "Cliente e classificação", subtitle: "Quem registra, qual cliente e como o case se enquadra." },
  { id: 2, key: "context", title: "Contexto do desafio", subtitle: "Problema, causa raiz e restrições." },
  { id: 3, key: "strategy", title: "Estratégia aplicada", subtitle: "O que foi entregue para gerar o resultado." },
  { id: 4, key: "results", title: "Resultado quantitativo", subtitle: "Antes vs. depois com números reais." },
  { id: 5, key: "evidence", title: "Evidências", subtitle: "Links e contexto complementar." },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];
