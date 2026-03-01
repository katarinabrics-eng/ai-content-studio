import { getSupabaseClient } from "./supabase-server";

export type DiagnosticProjectRow = {
  id: string;
  client_id: string;
  type: "diagnostic" | "premium";
  status: "pending" | "active" | "closed";
  intake_data: Record<string, unknown>;
  created_at: string;
};

/** Vytvoří nebo aktualizuje klienta (email) a vytvoří diagnostic project s intake_data. */
export async function createDiagnosticProject(params: {
  email: string;
  name?: string;
  intake_data: Record<string, unknown>;
}): Promise<{ clientId: string; projectId: string }> {
  const supabase = getSupabaseClient();
  const email = params.email.trim().toLowerCase();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .upsert(
      {
        email,
        name: params.name ?? "",
        tariff: "standard",
        priority: 0,
        status: "diagnostic",
      },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (clientError || !client) {
    throw new Error(`Chyba při ukládání klienta: ${clientError?.message ?? "Unknown"}`);
  }

  const clientId = (client as { id: string }).id;

  const { data: project, error: projectError } = await supabase
    .from("diagnostic_projects")
    .insert({
      client_id: clientId,
      type: "diagnostic",
      status: "pending",
      intake_data: params.intake_data,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw new Error(`Chyba při vytváření projektu: ${projectError?.message ?? "Unknown"}`);
  }

  const projectId = (project as { id: string }).id;
  return { clientId, projectId };
}

export async function getDiagnosticProjectsByClientId(
  clientId: string
): Promise<DiagnosticProjectRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("diagnostic_projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Chyba při načítání projektů: ${error.message}`);
  return (data ?? []) as DiagnosticProjectRow[];
}
