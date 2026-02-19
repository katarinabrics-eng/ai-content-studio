import { getSupabaseClient } from "./supabase-server";

export type NotificationChannel = "email" | "in_app";

export type ClientNotificationRow = {
  id: string;
  client_id: string;
  type: string;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  sent_at: string;
};

export async function insertClientNotification(params: {
  clientId: string;
  type: string;
  channel?: NotificationChannel;
  payload?: Record<string, unknown>;
}): Promise<ClientNotificationRow> {
  const supabase = getSupabaseClient();
  const row = {
    client_id: params.clientId,
    type: params.type,
    channel: params.channel ?? "email",
    payload: params.payload ?? {},
  };
  const { data, error } = await supabase
    .from("client_notifications")
    .insert(row)
    .select("id, client_id, type, channel, payload, sent_at")
    .single();

  if (error) {
    throw new Error(`Chyba při ukládání notifikace: ${error.message}`);
  }
  return data as ClientNotificationRow;
}

/** Email hook stubs – log to DB and optionally call external provider later. */
export async function notifyOnboardingLinkSent(params: {
  clientId: string;
  email: string;
  magicLinkUrl: string;
}): Promise<void> {
  await insertClientNotification({
    clientId: params.clientId,
    type: "onboarding_link_sent",
    channel: "email",
    payload: { email: params.email, magicLinkUrl: params.magicLinkUrl },
  });
  // TODO: call Resend/SendGrid with magicLinkUrl
}

export async function notifyStatusChanged(params: {
  clientId: string;
  jobId: string;
  weekKey: string;
  fromStatus: string;
  toStatus: string;
}): Promise<void> {
  await insertClientNotification({
    clientId: params.clientId,
    type: "status_changed",
    channel: "email",
    payload: params,
  });
}

export async function notifyReadyForApproval(params: {
  clientId: string;
  jobId: string;
  weekKey: string;
  approvalLink: string;
}): Promise<void> {
  await insertClientNotification({
    clientId: params.clientId,
    type: "ready_for_approval",
    channel: "email",
    payload: params,
  });
}

export async function notifyFinalDelivered(params: {
  clientId: string;
  jobId: string;
  weekKey: string;
  downloadLink?: string;
}): Promise<void> {
  await insertClientNotification({
    clientId: params.clientId,
    type: "final_delivered",
    channel: "email",
    payload: params,
  });
}
