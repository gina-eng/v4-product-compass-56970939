import { supabase } from "@/integrations/supabase/client";

export interface CaseCampaign {
  id: string;
  name: string;
  description: string;
  color: string;
  // Datas no formato YYYY-MM-DD (coluna date do Postgres).
  startsAt: string;
  endsAt: string;
  archivedAt: string | null;
}

export interface CaseCampaignInput {
  name: string;
  description: string;
  color: string;
  startsAt: string;
  endsAt: string;
}

export type CampaignStatus = "arquivada" | "agendada" | "vigente" | "encerrada";

interface CampaignRow {
  id: string;
  name: string;
  description: string;
  color: string;
  starts_at: string;
  ends_at: string;
  archived_at: string | null;
}

const rowToCampaign = (row: CampaignRow): CaseCampaign => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  color: row.color ?? "",
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  archivedAt: row.archived_at,
});

const inputToRow = (input: CaseCampaignInput) => ({
  name: input.name.trim(),
  description: input.description.trim(),
  color: input.color,
  starts_at: input.startsAt,
  ends_at: input.endsAt,
});

// Data local em YYYY-MM-DD. Não usa toISOString() para evitar o off-by-one
// do UTC (à noite no Brasil o ISO já é o dia seguinte).
export const todayLocal = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Comparação lexicográfica funciona porque ambos estão em YYYY-MM-DD.
export const isCampaignOpen = (c: CaseCampaign, today = todayLocal()): boolean =>
  !c.archivedAt && c.startsAt <= today && today <= c.endsAt;

export const campaignStatus = (c: CaseCampaign, today = todayLocal()): CampaignStatus => {
  if (c.archivedAt) return "arquivada";
  if (today < c.startsAt) return "agendada";
  if (today > c.endsAt) return "encerrada";
  return "vigente";
};

// YYYY-MM-DD → dd/mm/aaaa sem passar por Date (sem fuso).
export const formatCampaignDate = (value: string): string => {
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
};

export const listCampaigns = async (): Promise<CaseCampaign[]> => {
  const { data, error } = await supabase
    .from("case_campaigns")
    .select("id, name, description, color, starts_at, ends_at, archived_at")
    .order("starts_at", { ascending: false });
  // Retorna vazio (sem lançar) para a tela de cases e o form funcionarem
  // mesmo antes da migration de campanhas ser aplicada.
  if (error) {
    console.warn("Erro ao listar campanhas:", error);
    return [];
  }
  return ((data ?? []) as CampaignRow[]).map(rowToCampaign);
};

export const createCampaign = async (input: CaseCampaignInput): Promise<CaseCampaign> => {
  const { data, error } = await supabase
    .from("case_campaigns")
    .insert([inputToRow(input)])
    .select("id, name, description, color, starts_at, ends_at, archived_at")
    .single();
  if (error) throw error;
  return rowToCampaign(data as CampaignRow);
};

export const updateCampaign = async (
  id: string,
  input: CaseCampaignInput,
): Promise<CaseCampaign> => {
  const { data, error } = await supabase
    .from("case_campaigns")
    .update(inputToRow(input))
    .eq("id", id)
    .select("id, name, description, color, starts_at, ends_at, archived_at")
    .single();
  if (error) throw error;
  return rowToCampaign(data as CampaignRow);
};

export const setCampaignArchived = async (id: string, archived: boolean): Promise<void> => {
  const { error } = await supabase
    .from("case_campaigns")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
};

// O banco bloqueia (ON DELETE RESTRICT) a exclusão de campanha com cases vinculados.
export const deleteCampaign = async (id: string): Promise<void> => {
  const { error } = await supabase.from("case_campaigns").delete().eq("id", id);
  if (error) throw error;
};

// Agrega no cliente: volume esperado é pequeno (dezenas/centenas de vínculos).
export const countCasesByCampaign = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase.from("case_campaign_links").select("campaign_id");
  if (error) {
    console.warn("Erro ao contar cases por campanha:", error);
    return {};
  }
  return (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.campaign_id] = (acc[row.campaign_id] ?? 0) + 1;
    return acc;
  }, {});
};
