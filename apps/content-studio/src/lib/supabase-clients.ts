import { getSupabaseClient } from "./supabase-server";

export type ClientRow = {
  id: string;
  email: string;
  name: string;
  tariff: string;
  priority: number;
  created_at: string;
};

export async function getClientById(id: string): Promise<ClientRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, email, name, tariff, priority, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return null;
    throw new Error(`Chyba při načítání klienta: ${error?.message ?? "Not found"}`);
  }
  return data as ClientRow;
}

export async function getClientByEmail(email: string): Promise<ClientRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, email, name, tariff, priority, created_at")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return null;
    throw new Error(`Chyba při načítání klienta: ${error?.message ?? "Not found"}`);
  }
  return data as ClientRow;
}

export async function upsertClient(params: {
  email: string;
  name?: string;
  tariff?: string;
  priority?: number;
}): Promise<ClientRow> {
  const supabase = getSupabaseClient();
  const email = params.email.trim().toLowerCase();
  const row = {
    email,
    name: params.name ?? "",
    tariff: params.tariff ?? "standard",
    priority: params.priority ?? 0,
  };
  const { data, error } = await supabase
    .from("clients")
    .upsert(row, { onConflict: "email", ignoreDuplicates: false })
    .select("id, email, name, tariff, priority, created_at")
    .single();

  if (error) {
    throw new Error(`Chyba při ukládání klienta: ${error.message}`);
  }
  return data as ClientRow;
}
