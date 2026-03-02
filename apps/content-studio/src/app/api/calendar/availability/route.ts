import { google } from "googleapis";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const keyFilePath = path.join(
      process.cwd(),
      "secrets",
      "lucifera-booking-c0431b705a5b.json"
    );

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json({
      success: true,
      events: response.data.items,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Calendar fetch failed" },
      { status: 500 }
    );
  }
}
