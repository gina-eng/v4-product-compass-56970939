import type { Json } from "@/integrations/supabase/types";

export interface MockPlatformData {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  client_logo_url: string | null;
  short_description: string | null;
  general_description: string | null;
  gtm_maturity: string | null;
  icp_recommended: string | null;
  practical_applications: string | null;
  benefits_and_advantages: string | null;
  client_benefits: string | null;
  unit_benefits: string | null;
  partnership_regulations: string | null;
  base_pricing: string | null;
  commission_and_invoicing: string | null;
  how_to_hire: string | null;
  technical_commercial_support: string | null;
  forum_url: string | null;
  request_form_url: string | null;
  useful_links: Json;
  operational_capacity_scores: Json;
  strategic_potential_scores: Json;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

export const mockPlatforms: MockPlatformData[] = [
  {
    id: "mock-platform-hubspot",
    name: "HubSpot Revenue Suite",
    slug: "hubspot-revenue-suite",
    category: "CRM & Automação",
    status: "Ativa",
    client_logo_url: "/lovable-uploads/28f36708-f007-4c23-a291-13c835be55b9.png",
    short_description:
      "Plataforma integrada para marketing, vendas e sucesso do cliente, com foco em previsibilidade de receita.",
    general_description:
      "A HubSpot Revenue Suite centraliza dados, automações e processos comerciais em um único ambiente.\n" +
      "A estrutura permite gestão ponta a ponta do funil, visão consolidada de métricas e execução orientada por SLA entre times.",
    gtm_maturity: "Avançada",
    icp_recommended:
      "Empresas B2B e B2C em fase de aceleração comercial.\n" +
      "Operações com times de marketing e vendas estruturados.\n" +
      "Negócios que precisam reduzir dispersão de ferramentas.",
    practical_applications:
      "Estruturação de funil completo de aquisição e conversão.\n" +
      "Automação de handoff entre marketing e vendas.\n" +
      "Painéis de forecast e performance de receita.",
    benefits_and_advantages:
      "Unifica processos críticos da jornada comercial.\n" +
      "Reduz retrabalho operacional e inconsistência de dados.\n" +
      "Acelera decisões com base em informação confiável.",
    client_benefits:
      "Maior previsibilidade de receita.\n" +
      "Aumento de produtividade das equipes.\n" +
      "Melhora de conversão entre etapas do funil.",
    unit_benefits:
      "Expansão de oferta de consultoria e implantação.\n" +
      "Maior ticket médio em projetos de transformação comercial.\n" +
      "Base para contratos recorrentes de otimização.",
    partnership_regulations:
      "Parceria sujeita às políticas oficiais do programa de parceiros.\n" +
      "Implantações devem seguir boas práticas de compliance e governança de dados.\n" +
      "Uso de marca conforme guideline oficial.",
    base_pricing:
      "Licenciamento variável por hubs, usuários e nível de pacote.\n" +
      "Projetos de implantação e evolução com escopo modular por fase.",
    commission_and_invoicing:
      "Comissionamento conforme política ativa do programa de parceiros.\n" +
      "Faturamento de serviços de implantação e evolução via contrato da unidade.",
    how_to_hire:
      "1) Diagnóstico de maturidade e objetivos de GTM.\n" +
      "2) Definição de escopo por fases (implantação e evolução).\n" +
      "3) Aprovação comercial e assinatura contratual.\n" +
      "4) Kickoff técnico e operacional.",
    technical_commercial_support:
      "Suporte técnico para configuração, integrações e automações.\n" +
      "Suporte comercial para estratégia de adoção, expansão e governança de operação.\n" +
      "Canal de atendimento com SLA por criticidade.",
    forum_url: "https://chat.google.com",
    request_form_url: "https://forms.gle/solicitacao-contratacao-stack-digital",
    useful_links: [
      { label: "Site Oficial", url: "https://www.hubspot.com" },
      { label: "Documentação", url: "https://developers.hubspot.com/docs" },
      { label: "Academy", url: "https://academy.hubspot.com" },
      { label: "Status da Plataforma", url: "https://status.hubspot.com" },
      { label: "Programa de Parceiros", url: "https://www.hubspot.com/partners" },
    ],
    operational_capacity_scores: {
      implementation_agility: 4,
      team_readiness: 4,
      support_quality: 5,
      integration_flexibility: 4,
      governance_security: 4,
      scalability_stability: 5,
    },
    strategic_potential_scores: {
      market_relevance: 5,
      competitive_advantage: 4,
      innovation_potential: 4,
      revenue_impact: 5,
      ecosystem_synergy: 4,
      long_term_sustainability: 5,
    },
    thumbs_up_count: 12,
    thumbs_down_count: 2,
  },
];

export const getMockPlatformBySlug = (slug: string) => {
  return mockPlatforms.find((platform) => platform.slug === slug) || null;
};

export const getMockPlatformById = (id: string) => {
  return mockPlatforms.find((platform) => platform.id === id) || null;
};
