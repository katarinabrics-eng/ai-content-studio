import { NextResponse } from "next/server";
import { createPendingBooking } from "@/lib/supabase-bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST: Ověří, že slot je volný, vytvoří pending rezervaci s expirací. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service_type = typeof body?.service_type === "string" ? body.service_type.trim() : "";
    const date = typeof body?.date === "string" ? body.date.trim() : "";
    const time = typeof body?.time === "string" ? body.time.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!service_type || !date || !time || !email) {
      return NextResponse.json(
        { error: "Chybí service_type, date, time nebo email." },
        { status: 400 }
      );
    }

    const result = await createPendingBooking({ service_type, date, time, email });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ ok: true, bookingId: result.id });
  } catch (e) {
    console.error("[bookings/reserve]", e);
    return NextResponse.json(
      { error: "Nepodařilo se vytvořit rezervaci." },
      { status: 500 }
    );
  }
}
