import { redirect } from "next/navigation";

/**
 * Legacy /intake route redirects to canonical /start.
 * Keeps old links working while consolidating entry point.
 */
export default function IntakePage() {
  redirect("/start");
}
