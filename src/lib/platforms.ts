export interface PlatformCriterion {
  key: string;
  title: string;
  description: string;
}

export interface PlatformUsefulLink {
  label: string;
  url: string;
}

export const MAX_PLATFORM_USEFUL_LINKS = 6;

export type PlatformScoreMap = Record<string, number>;

export const operationalCapacityCriteria: PlatformCriterion[] = [
  {
    key: "implementation_agility",
    title: "Agilidade de Implementação",
    description: "Velocidade para colocar a plataforma em operação com baixo atrito.",
  },
  {
    key: "team_readiness",
    title: "Prontidão do Time",
    description: "Nível de preparo da equipe para operar e sustentar a plataforma.",
  },
  {
    key: "support_quality",
    title: "Qualidade de Suporte",
    description: "Capacidade de resposta e resolução para problemas técnicos e comerciais.",
  },
  {
    key: "integration_flexibility",
    title: "Flexibilidade de Integração",
    description: "Facilidade para integrar com o ecossistema atual da operação.",
  },
  {
    key: "governance_security",
    title: "Governança e Segurança",
    description: "Confiabilidade em políticas, controles de acesso e segurança de dados.",
  },
  {
    key: "scalability_stability",
    title: "Escalabilidade e Estabilidade",
    description: "Capacidade de crescer sem comprometer desempenho e disponibilidade.",
  },
];

export const strategicPotentialCriteria: PlatformCriterion[] = [
  {
    key: "market_relevance",
    title: "Relevância de Mercado",
    description: "Aderência da plataforma às demandas atuais e futuras do mercado-alvo.",
  },
  {
    key: "competitive_advantage",
    title: "Vantagem Competitiva",
    description: "Potencial de diferenciação frente a outras opções disponíveis.",
  },
  {
    key: "innovation_potential",
    title: "Potencial de Inovação",
    description: "Capacidade da plataforma de habilitar novas possibilidades estratégicas.",
  },
  {
    key: "revenue_impact",
    title: "Impacto em Receita",
    description: "Potencial para gerar crescimento de receita e oportunidades comerciais.",
  },
  {
    key: "ecosystem_synergy",
    title: "Sinergia no Ecossistema",
    description: "Nível de complementaridade com soluções e processos já existentes.",
  },
  {
    key: "long_term_sustainability",
    title: "Sustentabilidade de Longo Prazo",
    description: "Potencial de permanência e evolução da parceria ao longo do tempo.",
  },
];

export const quadrantDescriptions: Record<PlatformQuadrant, string> = {
  "Líder": "Alta capacidade operacional e alto potencial estratégico. Prioridade máxima de parceria.",
  "Visionária": "Alto potencial estratégico, mas ainda requer amadurecimento operacional.",
  "Operacional": "Boa execução operacional, porém com menor potencial estratégico no cenário atual.",
  "Emergente": "Baixo potencial estratégico e baixa capacidade operacional no estágio atual.",
};

export type PlatformQuadrant = "Líder" | "Visionária" | "Operacional" | "Emergente";

export const normalizeScoreInput = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(5, parsed));
};

export const createEmptyScoreMap = (criteria: PlatformCriterion[]): PlatformScoreMap => {
  return criteria.reduce<PlatformScoreMap>((accumulator, criterion) => {
    accumulator[criterion.key] = 0;
    return accumulator;
  }, {});
};

export const normalizeScoreMap = (
  input: unknown,
  criteria: PlatformCriterion[]
): PlatformScoreMap => {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  return criteria.reduce<PlatformScoreMap>((accumulator, criterion) => {
    accumulator[criterion.key] = normalizeScoreInput(source[criterion.key]);
    return accumulator;
  }, {});
};

export const calculateAverageScore = (
  scores: PlatformScoreMap,
  criteria: PlatformCriterion[]
): number => {
  if (criteria.length === 0) return 0;
  const total = criteria.reduce((accumulator, criterion) => {
    return accumulator + normalizeScoreInput(scores[criterion.key]);
  }, 0);

  return Number((total / criteria.length).toFixed(2));
};

export const resolvePlatformQuadrant = (
  operationalAverage: number,
  strategicAverage: number
): PlatformQuadrant => {
  const highOperational = operationalAverage >= 3;
  const highStrategic = strategicAverage >= 3;

  if (highOperational && highStrategic) return "Líder";
  if (!highOperational && highStrategic) return "Visionária";
  if (highOperational && !highStrategic) return "Operacional";
  return "Emergente";
};

export type PlatformScoreTier = "Excelente" | "Alto" | "Médio" | "Baixo";

export const resolvePlatformScoreTier = (score: number): PlatformScoreTier => {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Alto";
  if (score >= 55) return "Médio";
  return "Baixo";
};

export interface PlatformScoreCardData {
  operationalAverage: number;
  strategicAverage: number;
  overallAverage: number;
  overallScore: number;
  tier: PlatformScoreTier;
}

export const buildPlatformScoreCard = (
  operationalAverage: number,
  strategicAverage: number
): PlatformScoreCardData => {
  const overallAverage = Number(((operationalAverage + strategicAverage) / 2).toFixed(2));
  const overallScore = Math.round((overallAverage / 5) * 100);

  return {
    operationalAverage,
    strategicAverage,
    overallAverage,
    overallScore,
    tier: resolvePlatformScoreTier(overallScore),
  };
};

export const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const normalizeUsefulLinks = (value: unknown): PlatformUsefulLink[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((link) => {
      if (!link || typeof link !== "object") return null;
      const label = String((link as Record<string, unknown>).label ?? "").trim();
      const url = String((link as Record<string, unknown>).url ?? "").trim();
      if (!label || !url) return null;
      return {
        label,
        url: normalizeUrl(url),
      };
    })
    .filter((link): link is PlatformUsefulLink => Boolean(link))
    .slice(0, MAX_PLATFORM_USEFUL_LINKS);
};

export const createSlug = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
