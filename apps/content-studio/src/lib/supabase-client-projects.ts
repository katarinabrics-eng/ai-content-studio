import { getSupabaseClient } from "./supabase-server";

export type PaymentStatus = "none" | "pending" | "paid";
export type ClientProjectStatus = "new" | "paid" | "in_progress" | "done";

export type ClientProjectRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  web_url: string | null;
  manual_input: string | null;
  scan_result: Record<string, unknown>;
  payment_status: PaymentStatus;
  booking_id: string | null;
  booking_date: string | null;
  booking_time: string | null;
  status: ClientProjectStatus;
};

export async function createClientProject(params: {
  web_url?: string | null;
  manual_input?: string | null;
  scan_result: Record<string, unknown>;
}): Promise<{ id: string }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .insert({
      web_url: params.web_url ?? null,
      manual_input: params.manual_input ?? null,
      scan_result: params.scan_result ?? {},
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: (data as { id: string }).id };
}

export async function updateClientProjectEmail(projectId: string, email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("client_projects")
    .update({ email, updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) throw error;
}

export async function setClientProjectPaidFromBooking(bookingId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .select("date, time, email")
    .eq("id", bookingId)
    .single();

  if (bookErr || !booking) return;

  const b = booking as { date: string; time: string; email: string };
  const { error } = await supabase
    .from("client_projects")
    .update({
      payment_status: "paid",
      status: "paid",
      booking_date: b.date,
      booking_time: b.time,
      email: b.email,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId);

  if (error) throw error;
}

export async function linkBookingToClientProject(projectId: string, bookingId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("email, date, time")
    .eq("id", bookingId)
    .single();

  if (!booking) return;

  const b = booking as { email: string; date: string; time: string };
  const { error } = await supabase
    .from("client_projects")
    .update({
      booking_id: bookingId,
      email: b.email,
      payment_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw error;
}

export async function listClientProjects(): Promise<ClientProjectRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClientProjectRow[];
}

export async function getClientProjectById(id: string): Promise<ClientProjectRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("client_projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ClientProjectRow | null;
}
