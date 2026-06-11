/**
 * Idempotentní vytvoření projektu z Stripe Checkout session.
 * Po checkout.session.completed vytvoří projekt se statusem PAID.
 */

import Stripe from "stripe";
import { getSupabaseClient } from "./supabase-server";
import {
  createProject,
  createProjectAccessToken,
  generatePipelineProjectCode,
  type ProjectRow,
} from "./supabase-projects";
import { projectStoragePrefix } from "./project-paths";

export type CheckoutProjectResult = {
  ok: true;
  projectId: string;
  projectCode: string;
  pin: string;
  accessToken?: string;
} | { ok: false; error: string };

/**
 * Idempotentní: pokud projekt pro session_id už existuje, vrátí ho.
 * Jinak vytvoří nový projekt se statusem PAID.
 */
export async function ensureProjectFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<CheckoutProjectResult> {
  const sessionId = session.id;
  if (!sessionId) {
    return { ok: false, error: "Chybí session ID" };
  }
  if (session.payment_status !== "paid") {
    return { ok: false, error: "Platba nebyla dokončena" };
  }

  const supabase = getSupabaseClient();

  // Idempotence: existuje už projekt pro tuto session?
  const { data: existing } = await supabase
    .from("projects")
    .select("id, project_code")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    const proj = existing as { id: string; project_code: string };
    try {
      const accessToken = await createProjectAccessToken(proj.id);
      return {
        ok: true,
        projectId: proj.id,
        projectCode: proj.project_code,
        pin: "",
        accessToken,
      };
    } catch {
      return {
        ok: true,
        projectId: proj.id,
        projectCode: proj.project_code,
        pin: "",
      };
    }
  }

  const planId = (session.metadata?.plan_id as string) || "test-week-800";
  const clientEmail = session.customer_details?.email?.trim() || null;

  const projectCode = generatePipelineProjectCode();
  const storagePrefix = projectStoragePrefix(projectCode);

  try {
    const result = await createProject({
      plan_id: planId,
      brand_name: "—",
      industry: "—",
      communication_goal: "—",
      platforms: ["instagram"],
      tone_of_voice: "—",
      website_or_profile: "",
      client_email: clientEmail,
      note: "",
      project_code: projectCode,
      storage_prefix: storagePrefix,
    });

    const projectId = result.project.id;
    const pin = result.pin ?? "";

    await supabase
      .from("projects")
      .update({
        status: "PAID",
        stripe_checkout_session_id: sessionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    let accessToken: string | undefined;
    try {
      accessToken = await createProjectAccessToken(projectId);
    } catch {
      // non-blocking
    }

    return {
      ok: true,
      projectId,
      projectCode: result.projectCode ?? projectCode,
      pin,
      accessToken,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
