import type {
  CaseStatus,
  ClientStatus,
  OperationReach,
  PreviousAttempt,
  SalesModel,
  V4Product,
} from "./options";

export interface SecondaryMetric {
  name: string;
  before: string;
  after: string;
}

export interface SaberDirection {
  direction: string;
  rationale: string;
  impact: string;
}

export interface ExecutarStrategy {
  strategy: string;
  appliedAt: string;
}

export interface ChannelInvestment {
  channel: string;
  investment: string;
  revenue: string;
}

export interface PrimaryMetricEntry {
  metricKey: string;
  label: string;
  unit: string;
  before: string;
  after: string;
}

export interface CaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  currentStep: number;

  // Etapa 1 — identificação
  ownerEmail: string;
  v4Unit: string;
  clientName: string;
  clientCnpj: string;
  clientStatus: ClientStatus | "";
  clientCity: string;
  clientState: string;
  operationReach: OperationReach | "";
  collaborators: string[];

  // Etapa 2 — classificação
  salesModel: SalesModel | "";
  segment: string;
  nicho: string;
  products: V4Product[];
  primaryDriver: V4Product | "";

  // Etapa 3 — contexto
  initialChallenges: string[];
  initialChallengesOther: string;
  problem: string;
  rootCause: string;
  restrictions: string[];
  restrictionsOther: string;
  previousAttempt: PreviousAttempt | "";
  previousFailureReason: string;

  // Etapa 4 — estratégia
  saberDirections: SaberDirection[];
  saberExecution: string;
  terValuePerception: string;
  executarProfessionals: string[];
  executarChannels: ChannelInvestment[];
  executarCreatives: string[];
  executarCreativesCommunication: string;
  executarStrategies: ExecutarStrategy[];
  potencializarValueModel: string;
  potencializarIndicator: string;

  // Etapa 5 — resultado
  timeToResult: string;
  primaryMetrics: PrimaryMetricEntry[];
  secondaryMetrics: SecondaryMetric[];
  mediaInvestment: string;
  attributedRevenue: string;

  // Etapa 6 — evidências
  dashboardUrl: string;
  presentationUrl: string;
  testimonialUrl: string;
  finalNotes: string;
}

export const emptyCase = (ownerEmail = ""): CaseRecord => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `case-${Date.now()}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "rascunho",
  currentStep: 1,
  ownerEmail,
  v4Unit: "",
  clientName: "",
  clientCnpj: "",
  clientStatus: "",
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
