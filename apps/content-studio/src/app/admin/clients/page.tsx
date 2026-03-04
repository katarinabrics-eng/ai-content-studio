import { redirect } from "next/navigation";

/** Stará stránka přesměrována na nový jednotný dashboard Klienti. */
export default function OldClientsPage() {
  redirect("/admin/klienti");
}
