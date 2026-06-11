import { getSupabaseClient } from "./supabase-server";

const PENDING_EXPIRY_MINUTES = 20;

export type BookingStatus = "pending" | "paid" | "cancelled";

export type BookingRow = {
  id: string;
  service_type: string;
  date: string;
  time: string;
  email: string;
  status: BookingStatus;
  expires_at: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Kontrola, zda je slot (date + time) volný – žádný pending ani paid. */
export async function isSlotAvailable(date: string, time: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("date", date)
    .eq("time", time)
    .in("status", ["pending", "paid"])
    .limit(1);

  if (error) throw error;
  return !data || data.length === 0;
}

/** Vytvoření rezervace ve stavu pending s expirací (např. 20 min). */
export async function createPendingBooking(params: {
  service_type: string;
  date: string;
  time: string;
  email: string;
}): Promise<{ id: string } | { error: string }> {
  const available = await isSlotAvailable(params.date, params.time);
  if (!available) {
    return { error: "Termín je již obsazen." };
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + PENDING_EXPIRY_MINUTES);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      service_type: params.service_type,
      date: params.date,
      time: params.time,
      email: params.email,
      status: "pending",
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: (data as { id: string }).id };
}

/** Označení rezervace jako zaplacená po Stripe checkout. */
export async function setBookingPaid(bookingId: string, stripeSessionId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "paid",
      stripe_session_id: stripeSessionId,
      expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  return !error;
}

export async function getBookingById(id: string): Promise<BookingRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as BookingRow;
}
