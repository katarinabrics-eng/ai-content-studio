import { Resend } from "resend";
import { getSupabaseClient } from "./supabase-server";

const FROM = "Lucifera <info@studiolucifera.cz>";
const CURATOR_EMAIL = process.env.CURATOR_EMAIL ?? "info@studiolucifera.cz";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

async function logContentNotification(params: {
  projectId: string | null;
  postId: string | null;
  type: string;
  recipient: string | null;
}): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("content_notification_log").insert({
    project_id: params.projectId,
    post_id: params.postId,
    type: params.type,
    recipient: params.recipient,
  });
}

/** Kurátor: nový příspěvek ke schválení */
export async function notifyCuratorReady(params: {
  projectId: string;
  postId: string;
  clientName?: string;
  platform?: string;
  scheduledDate?: string;
}): Promise<void> {
  const subject = "Nový příspěvek ke schválení";
  const body = [
    params.clientName && `Klient: ${params.clientName}`,
    params.platform && `Platforma: ${params.platform}`,
    params.scheduledDate && `Plánované: ${params.scheduledDate}`,
  ]
    .filter(Boolean)
    .join(" · ");
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = getResend();
      await resend.emails.send({
        from: FROM,
        to: CURATOR_EMAIL,
        subject,
        html: `<h2>${subject}</h2><p>${body}</p><p>— Lucifera</p>`,
      });
    }
  } catch (e) {
    console.error("[content-notifications] curator_ready:", e);
  }
  await logContentNotification({
    projectId: params.projectId,
    postId: params.postId,
    type: "curator_ready",
    recipient: CURATOR_EMAIL,
  });
}

/** Klient: příspěvek připraven ke schválení */
export async function notifyClientReady(params: {
  projectId: string;
  postId: string;
  clientEmail: string;
  clientName?: string;
  scheduledDate?: string;
  approvalLink?: string;
}): Promise<void> {
  const subject = "Váš příspěvek je připraven ke schválení";
  const body = "Podívejte se na náhled a dejte nám vědět.";
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = getResend();
      await resend.emails.send({
        from: FROM,
        to: params.clientEmail,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>${body}</p>
          ${params.approvalLink ? `<p><a href="${params.approvalLink}">Otevřít náhled a schválit</a></p>` : ""}
          <p>— Studio Lucifera</p>
        `,
      });
    }
  } catch (e) {
    console.error("[content-notifications] client_ready:", e);
  }
  await logContentNotification({
    projectId: params.projectId,
    postId: params.postId,
    type: "client_ready",
    recipient: params.clientEmail,
  });
}

/** Kurátor: klient schválil příspěvek */
export async function notifyClientApproved(params: {
  projectId: string;
  postId: string;
  clientName?: string;
  scheduledDate?: string;
}): Promise<void> {
  const subject = "Klient schválil příspěvek";
  const body = [
    params.clientName && params.clientName,
    params.scheduledDate && `na ${params.scheduledDate}`,
  ]
    .filter(Boolean)
    .join(" ");
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = getResend();
      await resend.emails.send({
        from: FROM,
        to: CURATOR_EMAIL,
        subject,
        html: `<h2>${subject}</h2><p>${body}</p><p>— Lucifera</p>`,
      });
    }
  } catch (e) {
    console.error("[content-notifications] client_approved:", e);
  }
  await logContentNotification({
    projectId: params.projectId,
    postId: params.postId,
    type: "client_approved",
    recipient: CURATOR_EMAIL,
  });
}

/** Kurátor: klient žádá úpravu */
export async function notifyClientRevision(params: {
  projectId: string;
  postId: string;
  clientNote: string;
  clientName?: string;
}): Promise<void> {
  const subject = "Klient žádá úpravu";
  const body = `Komentář: ${params.clientNote}`;
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = getResend();
      await resend.emails.send({
        from: FROM,
        to: CURATOR_EMAIL,
        subject,
        html: `<h2>${subject}</h2><p>${params.clientName ? `Klient: ${params.clientName}</p>` : ""}<p>${body}</p><p>— Lucifera</p>`,
      });
    }
  } catch (e) {
    console.error("[content-notifications] client_revision:", e);
  }
  await logContentNotification({
    projectId: params.projectId,
    postId: params.postId,
    type: "client_revision",
    recipient: CURATOR_EMAIL,
  });
}

/** Klient: příspěvek byl zveřejněn */
export async function notifyPublished(params: {
  projectId: string;
  postId: string;
  clientEmail: string;
  platform?: string;
}): Promise<void> {
  const subject = "Příspěvek byl zveřejněn";
  const body = params.platform
    ? `Váš příspěvek dnes vyšel na ${params.platform}.`
    : "Váš příspěvek byl zveřejněn.";
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = getResend();
      await resend.emails.send({
        from: FROM,
        to: params.clientEmail,
        subject,
        html: `<h2>${subject}</h2><p>${body}</p><p>— Studio Lucifera</p>`,
      });
    }
  } catch (e) {
    console.error("[content-notifications] published:", e);
  }
  await logContentNotification({
    projectId: params.projectId,
    postId: params.postId,
    type: "published",
    recipient: params.clientEmail,
  });
}
