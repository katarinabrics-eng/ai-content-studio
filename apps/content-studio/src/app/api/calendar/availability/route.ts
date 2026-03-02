import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      return NextResponse.json(
        { error: "Missing GOOGLE_SERVICE_ACCOUNT env variable" },
        { status: 500 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({
      version: "v3",
      auth,
    });

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: in30Days.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json({
      success: true,
      events: response.data.items || [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Calendar fetch failed", details: msg },
      { status: 500 }
    );
  }
}
