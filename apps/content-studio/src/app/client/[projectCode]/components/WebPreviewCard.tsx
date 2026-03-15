"use client";
import { useEffect, useState } from "react";

interface WebPreviewCardProps {
  webUrl: string;
  screenshotUrl?: string;
  brandName: string;
  positioning: string;
}

export function WebPreviewCard({
  webUrl,
  screenshotUrl,
  brandName,
  positioning,
}: WebPreviewCardProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e8e4dc",
        overflow: "hidden",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: "#f5f2ec",
          borderBottom: "1px solid #e8e4dc",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 11,
            color: "#888",
            border: "1px solid #e8e4dc",
          }}
        >
          {webUrl || "www.yoursite.cz"}
        </div>
      </div>
      {/* Preview */}
      <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
        {screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt="Web preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: loaded ? "blur(0)" : "blur(12px)",
              transform: loaded ? "scale(1)" : "scale(1.04)",
              opacity: loaded ? 1 : 0.5,
              transition:
                "filter 1.4s ease-out, transform 1.4s ease-out, opacity 1.4s ease-out",
            }}
          />
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, #5a1515, #3a1020)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              {brandName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                maxWidth: 240,
                padding: "0 20px",
              }}
            >
              {positioning}
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid #f0ece4",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            background: "#f0fce0",
            color: "#3d6b00",
            fontSize: 11,
            padding: "4px 12px",
            borderRadius: 20,
            fontWeight: 500,
            border: "1px solid #d4f0a0",
          }}
        >
          Brand DNA kompletní ✓
        </span>
        {webUrl && (
          <a
            href={webUrl.startsWith("http") ? webUrl : `https://${webUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: "#b7e94c",
              textDecoration: "none",
              marginLeft: "auto",
            }}
          >
            ↗ Otevřít web
          </a>
        )}
      </div>
    </div>
  );
}
