import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type {
  CaseRecord,
  ChannelInvestment,
  ExecutarStrategy,
  PrimaryMetricEntry,
  SaberDirection,
  SecondaryMetric,
} from "./types";
import type {
  CaseStatus,
  ClientStatus,
  OperationReach,
  PreviousAttempt,
  ResultType,
  SalesModel,
  V4Product,
} from "./options";

interface CaseRow {
  id: string;
  status: string;
  current_step: number;
  owner_email: string;
  v4_unit: string;
  client_name: string;
  client_cnpj: string;
  client_status: string;
  client_city: string;
  client_state: string;
  operation_reach: string;
  collaborators: Json;
  sales_model: string;
  segment: string;
  nicho: string;
  products: Json;
  primary_driver: string;
  initial_challenges: Json;
  initial_challenges_other: string;
  problem: string;
  root_cause: string;
  restrictions: Json;
  restrictions_other: string;
  previous_attempt: string;
  previous_failure_reason: string;
  saber_directions: Json;
  saber_execution: string;
  ter_value_perception: string;
  executar_professionals: Json;
  executar_channels: Json;
  executar_creatives: Json;
  executar_creatives_communication: string;
  executar_strategies: Json;
  potencializar_value_model: string;
  potencializar_indicator: string;
  time_to_result: string;
  primary_metrics: Json;
  secondary_metrics: Json;
  media_investment: string;
  attributed_revenue: string;
  // Colunas aditivas (20261010120000) — opcionais para tolerar linhas antigas.
  result_type?: string | null;
  success_thesis?: string | null;
  qualitative_before?: string | null;
  qualitative_after?: string | null;
  success_proofs?: Json;
  delivery_metrics?: Json;
  dashboard_url: string;
  presentation_url: string;
  testimonial_url: string;
  final_notes: string;
  created_at: string;
  updated_at: string;
  filled_at: string | null;
  // Relação embutida via select("*, case_campaign_links(campaign_id)").
  case_campaign_links?: { campaign_id: string }[] | null;
}

const CASE_SELECT = "*, case_campaign_links(campaign_id)";

// Resiliência à ordem de deploy: se o select com a relação embutida falhar
// (migration 20261010120000 ainda não aplicada), cai para select("*") e os
// cases vêm com campaignIds = []. Avisa uma única vez no console.
let embeddedSelectWarned = false;
const warnEmbeddedSelectOnce = (error: unknown) => {
  if (embeddedSelectWarned) return;
  embeddedSelectWarned = true;
  console.warn(
    "Select de cases com case_campaign_links falhou; usando select('*') sem campanhas:",
    error,
  );
};

const RESULT_TYPES: ResultType[] = ["negocio", "entrega", "ambos"];
const toResultType = (v: unknown): ResultType =>
  RESULT_TYPES.includes(v as ResultType) ? (v as ResultType) : "negocio";

const arr = <T,>(v: Json | undefined): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

const rowToRecord = (row: CaseRow): CaseRecord => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  filledAt: row.filled_at,
  status: (row.status as CaseStatus) || "sem_evidencia",
  currentStep: row.current_step || 1,

  ownerEmail: str(row.owner_email),
  v4Unit: str(row.v4_unit),
  idUnits: str((row as unknown as { id_units?: string }).id_units),
  clientName: str(row.client_name),
  clientCnpj: str(row.client_cnpj),
  clientStatus: (row.client_status as ClientStatus) || "",
  clientCity: str(row.client_city),
  clientState: str(row.client_state),
  operationReach: (row.operation_reach as OperationReach) || "",
  collaborators: arr<string>(row.collaborators),

  salesModel: (row.sales_model as SalesModel) || "",
  segment: str(row.segment),
  nicho: str(row.nicho),
  products: arr<V4Product>(row.products),
  primaryDriver: (row.primary_driver as V4Product) || "",
  // Sem valor (linhas legadas) = "negocio", que é o comportamento de antes.
  resultType: toResultType(row.result_type),
  campaignIds: (row.case_campaign_links ?? []).map((l) => l.campaign_id),

  initialChallenges: arr<string>(row.initial_challenges),
  initialChallengesOther: str(row.initial_challenges_other),
  problem: str(row.problem),
  rootCause: str(row.root_cause),
  restrictions: arr<string>(row.restrictions),
  restrictionsOther: str(row.restrictions_other),
  previousAttempt: (row.previous_attempt as PreviousAttempt) || "",
  previousFailureReason: str(row.previous_failure_reason),

  saberDirections: arr<SaberDirection>(row.saber_directions),
  saberExecution: str(row.saber_execution),
  terValuePerception: str(row.ter_value_perception),
  executarProfessionals: arr<string>(row.executar_professionals),
  executarChannels: arr<ChannelInvestment>(row.executar_channels),
  executarCreatives: arr<string>(row.executar_creatives),
  executarCreativesCommunication: str(row.executar_creatives_communication),
  executarStrategies: arr<ExecutarStrategy>(row.executar_strategies),
  potencializarValueModel: str(row.potencializar_value_model),
  potencializarIndicator: str(row.potencializar_indicator),

  timeToResult: str(row.time_to_result),
  primaryMetrics: arr<PrimaryMetricEntry>(row.primary_metrics),
  secondaryMetrics: arr<SecondaryMetric>(row.secondary_metrics),
  mediaInvestment: str(row.media_investment),
  attributedRevenue: str(row.attributed_revenue),
  successThesis: str(row.success_thesis),
  qualitativeBefore: str(row.qualitative_before),
  qualitativeAfter: str(row.qualitative_after),
  successProofs: arr<string>(row.success_proofs),
  deliveryMetrics: arr<PrimaryMetricEntry>(row.delivery_metrics),

  dashboardUrl: str(row.dashboard_url),
  presentationUrl: str(row.presentation_url),
  testimonialUrl: str(row.testimonial_url),
  finalNotes: str(row.final_notes),
});

const recordToRow = (r: CaseRecord) => ({
  id: r.id,
  status: r.status,
  current_step: r.currentStep,
  owner_email: r.ownerEmail,
  v4_unit: r.v4Unit,
  id_units: r.idUnits || null,
  client_name: r.clientName,
  client_cnpj: r.clientCnpj,
  client_status: r.clientStatus,
  client_city: r.clientCity,
  client_state: r.clientState,
  operation_reach: r.operationReach,
  collaborators: r.collaborators as unknown as Json,
  sales_model: r.salesModel,
  segment: r.segment,
  nicho: r.nicho,
  products: r.products as unknown as Json,
  primary_driver: r.primaryDriver,
  initial_challenges: r.initialChallenges as unknown as Json,
  initial_challenges_other: r.initialChallengesOther,
  problem: r.problem,
  root_cause: r.rootCause,
  restrictions: r.restrictions as unknown as Json,
  restrictions_other: r.restrictionsOther,
  previous_attempt: r.previousAttempt,
  previous_failure_reason: r.previousFailureReason,
  saber_directions: r.saberDirections as unknown as Json,
  saber_execution: r.saberExecution,
  ter_value_perception: r.terValuePerception,
  executar_professionals: r.executarProfessionals as unknown as Json,
  executar_channels: r.executarChannels as unknown as Json,
  executar_creatives: r.executarCreatives as unknown as Json,
  executar_creatives_communication: r.executarCreativesCommunication,
  executar_strategies: r.executarStrategies as unknown as Json,
  potencializar_value_model: r.potencializarValueModel,
  potencializar_indicator: r.potencializarIndicator,
  time_to_result: r.timeToResult,
  primary_metrics: r.primaryMetrics as unknown as Json,
  secondary_metrics: r.secondaryMetrics as unknown as Json,
  media_investment: r.mediaInvestment,
  attributed_revenue: r.attributedRevenue,
  // A validação garante resultType preenchido ao salvar; fallback por segurança.
  result_type: r.resultType || "negocio",
  success_thesis: r.successThesis,
  qualitative_before: r.qualitativeBefore,
  qualitative_after: r.qualitativeAfter,
  success_proofs: r.successProofs as unknown as Json,
  delivery_metrics: r.deliveryMetrics as unknown as Json,
  dashboard_url: r.dashboardUrl,
  presentation_url: r.presentationUrl,
  testimonial_url: r.testimonialUrl,
  final_notes: r.finalNotes,
});

export const listCases = async (): Promise<CaseRecord[]> => {
  const embedded = await supabase
    .from("cases")
    .select(CASE_SELECT)
    .order("updated_at", { ascending: false });
  if (!embedded.error) return (embedded.data as unknown as CaseRow[]).map(rowToRecord);
  warnEmbeddedSelectOnce(embedded.error);

  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Erro ao listar cases:", error);
    return [];
  }
  return (data as unknown as CaseRow[]).map(rowToRecord);
};

export const getCase = async (id: string): Promise<CaseRecord | undefined> => {
  const embedded = await supabase
    .from("cases")
    .select(CASE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!embedded.error) {
    return embedded.data ? rowToRecord(embedded.data as unknown as CaseRow) : undefined;
  }
  warnEmbeddedSelectOnce(embedded.error);

  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Erro ao buscar case:", error);
    return undefined;
  }
  return data ? rowToRecord(data as unknown as CaseRow) : undefined;
};

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

// Sincroniza case_campaign_links com a seleção do form: remove vínculos
// desmarcados e insere os novos (sem duplicar os que já existem).
const syncCampaignLinks = async (caseId: string, campaignIds: string[]) => {
  const { data: current, error: listError } = await supabase
    .from("case_campaign_links")
    .select("campaign_id")
    .eq("case_id", caseId);
  if (listError) throw listError;

  const toRemove = (current ?? [])
    .map((l) => l.campaign_id)
    .filter((cid) => !campaignIds.includes(cid));
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("case_campaign_links")
      .delete()
      .eq("case_id", caseId)
      .in("campaign_id", toRemove);
    if (error) throw error;
  }

  if (campaignIds.length > 0) {
    const { error } = await supabase
      .from("case_campaign_links")
      .upsert(
        campaignIds.map((campaign_id) => ({ case_id: caseId, campaign_id })),
        { onConflict: "case_id,campaign_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  }
};

export const upsertCase = async (record: CaseRecord): Promise<CaseRecord> => {
  // Garante UUID válido (ids legados ou de exemplo viram novos uuids)
  const safeId =
    record.id && isUuid(record.id)
      ? record.id
      : typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
  // filled_at é a data real de criação do case: preenchida pelo DEFAULT now()
  // do banco no primeiro insert e preservada nas edições (por isso não é enviada aqui).
  const payload = recordToRow({ ...record, id: safeId });
  const { data, error } = await supabase
    .from("cases")
    .upsert([payload as never], { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  const campaignIds = Array.from(new Set(record.campaignIds));
  if (campaignIds.length > 0) {
    await syncCampaignLinks(safeId, campaignIds);
  } else {
    // Sem campanhas: só limpa vínculos antigos (caso o usuário tenha desmarcado
    // todas) em modo best-effort — se a tabela ainda não existir (migration não
    // aplicada), o erro é ignorado e o save do case segue normalmente.
    const { error: clearError } = await supabase
      .from("case_campaign_links")
      .delete()
      .eq("case_id", safeId);
    if (clearError) console.warn("Não foi possível limpar campanhas do case:", clearError);
  }
  return { ...rowToRecord(data as CaseRow), campaignIds };
};

export const deleteCase = async (id: string): Promise<void> => {
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw error;
};
