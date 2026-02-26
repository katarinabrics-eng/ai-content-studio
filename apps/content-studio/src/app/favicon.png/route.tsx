import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0c0c",
          borderRadius: 8,
          fontSize: 22,
          fontWeight: 700,
          color: "#A8EB12",
        }}
      >
        L
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  );
}
