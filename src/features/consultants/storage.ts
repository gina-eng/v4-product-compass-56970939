import { supabase } from "@/integrations/supabase/client";
import type { Consultant } from "./types";

type ConsultantRow = {
  id: string;
  name: string;
  headline: string;
  photo_url: string | null;
  unit: string | null;
  city: string;
  state: string;
  email: string;
  linkedin_url: string;
  primary_sector: string;
  secondary_sector: string | null;
  professional_profile: string;
  pains_tackled: string;
  value_areas: string;
  highlight_projects: string;
  competencies: string;
  education: string;
  languages: string;
};

const rowToConsultant = (row: ConsultantRow): Consultant => ({
  id: row.id,
  name: row.name,
  headline: row.headline ?? "",
  photoUrl: row.photo_url ?? "",
  unit: row.unit ?? "",
  city: row.city ?? "",
  state: row.state ?? "",
  email: row.email ?? "",
  linkedinUrl: row.linkedin_url ?? "",
  primarySector: row.primary_sector ?? "",
  secondarySector: row.secondary_sector ?? "",
  professionalProfile: row.professional_profile ?? "",
  painsTackled: row.pains_tackled ?? "",
  valueAreas: row.value_areas ?? "",
  highlightProjects: row.highlight_projects ?? "",
  competencies: row.competencies ?? "",
  education: row.education ?? "",
  languages: row.languages ?? "",
});

const consultantToRow = (c: Consultant): Omit<ConsultantRow, "id"> & { id?: string } => ({
  ...(c.id ? { id: c.id } : {}),
  name: c.name,
  headline: c.headline,
  photo_url: c.photoUrl?.trim() || null,
  unit: c.unit?.trim() || null,
  city: c.city,
  state: c.state,
  email: c.email,
  linkedin_url: c.linkedinUrl,
  primary_sector: c.primarySector,
  secondary_sector: c.secondarySector?.trim() || null,
  professional_profile: c.professionalProfile,
  pains_tackled: c.painsTackled,
  value_areas: c.valueAreas,
  highlight_projects: c.highlightProjects,
  competencies: c.competencies,
  education: c.education,
  languages: c.languages,
});

export const listConsultants = async (): Promise<Consultant[]> => {
  const { data, error } = await supabase
    .from("consultants")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("Erro ao listar consultores:", error);
    return [];
  }
  return (data as ConsultantRow[]).map(rowToConsultant);
};

export const getConsultant = async (id: string): Promise<Consultant | undefined> => {
  const { data, error } = await supabase
    .from("consultants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Erro ao buscar consultor:", error);
    return undefined;
  }
  return data ? rowToConsultant(data as ConsultantRow) : undefined;
};

export const upsertConsultant = async (record: Consultant): Promise<Consultant> => {
  const payload = consultantToRow(record);
  if (record.id) {
    const { data, error } = await supabase
      .from("consultants")
      .update(payload)
      .eq("id", record.id)
      .select()
      .single();
    if (error) throw error;
    return rowToConsultant(data as ConsultantRow);
  }
  const { data, error } = await supabase
    .from("consultants")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return rowToConsultant(data as ConsultantRow);
};

export const deleteConsultant = async (id: string): Promise<void> => {
  const { error } = await supabase.from("consultants").delete().eq("id", id);
  if (error) throw error;
};
