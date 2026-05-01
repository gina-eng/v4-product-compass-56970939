import { supabase } from "@/integrations/supabase/client";

export interface V4Unit {
  id: string;
  name: string;
}

export const listUnits = async (): Promise<V4Unit[]> => {
  const { data, error } = await supabase
    .from("v4_units")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) {
    console.error("Erro ao listar unidades:", error);
    return [];
  }
  return (data ?? []) as V4Unit[];
};

export const createUnit = async (name: string): Promise<V4Unit> => {
  const { data, error } = await supabase
    .from("v4_units")
    .insert([{ name: name.trim() }])
    .select("id, name")
    .single();
  if (error) throw error;
  return data as V4Unit;
};

export const updateUnit = async (id: string, name: string): Promise<V4Unit> => {
  const { data, error } = await supabase
    .from("v4_units")
    .update({ name: name.trim() })
    .eq("id", id)
    .select("id, name")
    .single();
  if (error) throw error;
  return data as V4Unit;
};

export const deleteUnit = async (id: string): Promise<void> => {
  const { error } = await supabase.from("v4_units").delete().eq("id", id);
  if (error) throw error;
};
