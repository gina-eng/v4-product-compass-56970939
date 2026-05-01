import { supabase } from "@/integrations/supabase/client";
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
  SalesModel,
  V4Product,
} from "./options";

type Json = unknown;

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
  dashboard_url: string;
  presentation_url: string;
  testimonial_url: string;
  final_notes: string;
  created_at: string;
  updated_at: string;
}

const arr = <T,>(v: Json): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

const rowToRecord = (row: CaseRow): CaseRecord => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  status: (row.status as CaseStatus) || "rascunho",
  currentStep: row.current_step || 1,

  ownerEmail: str(row.owner_email),
  v4Unit: str(row.v4_unit),
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
  client_name: r.clientName,
  client_cnpj: r.clientCnpj,
  client_status: r.clientStatus,
  client_city: r.clientCity,
  client_state: r.clientState,
  operation_reach: r.operationReach,
  collaborators: r.collaborators,
  sales_model: r.salesModel,
  segment: r.segment,
  nicho: r.nicho,
  products: r.products,
  primary_driver: r.primaryDriver,
  initial_challenges: r.initialChallenges,
  initial_challenges_other: r.initialChallengesOther,
  problem: r.problem,
  root_cause: r.rootCause,
  restrictions: r.restrictions,
  restrictions_other: r.restrictionsOther,
  previous_attempt: r.previousAttempt,
  previous_failure_reason: r.previousFailureReason,
  saber_directions: r.saberDirections,
  saber_execution: r.saberExecution,
  ter_value_perception: r.terValuePerception,
  executar_professionals: r.executarProfessionals,
  executar_channels: r.executarChannels,
  executar_creatives: r.executarCreatives,
  executar_creatives_communication: r.executarCreativesCommunication,
  executar_strategies: r.executarStrategies,
  potencializar_value_model: r.potencializarValueModel,
  potencializar_indicator: r.potencializarIndicator,
  time_to_result: r.timeToResult,
  primary_metrics: r.primaryMetrics,
  secondary_metrics: r.secondaryMetrics,
  media_investment: r.mediaInvestment,
  attributed_revenue: r.attributedRevenue,
  dashboard_url: r.dashboardUrl,
  presentation_url: r.presentationUrl,
  testimonial_url: r.testimonialUrl,
  final_notes: r.finalNotes,
});

export const listCases = async (): Promise<CaseRecord[]> => {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Erro ao listar cases:", error);
    return [];
  }
  return (data as CaseRow[]).map(rowToRecord);
};

export const getCase = async (id: string): Promise<CaseRecord | undefined> => {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Erro ao buscar case:", error);
    return undefined;
  }
  return data ? rowToRecord(data as CaseRow) : undefined;
};

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export const upsertCase = async (record: CaseRecord): Promise<CaseRecord> => {
  // Garante UUID válido (ids legados ou de exemplo viram novos uuids)
  const safeId =
    record.id && isUuid(record.id)
      ? record.id
      : typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
  const payload = recordToRow({ ...record, id: safeId });
  const { data, error } = await supabase
    .from("cases")
    .upsert([payload], { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return rowToRecord(data as CaseRow);
};

export const deleteCase = async (id: string): Promise<void> => {
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw error;
};

export const clearAllDrafts = async (): Promise<number> => {
  const { data, error } = await supabase
    .from("cases")
    .delete()
    .eq("status", "rascunho")
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
};
