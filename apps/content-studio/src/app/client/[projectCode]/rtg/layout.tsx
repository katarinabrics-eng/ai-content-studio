"use client";

import { Suspense } from "react";

// Sidebar je poskytován parent layoutem [projectCode]/layout.tsx
// Tento layout pouze přidává background a loading fallback pro RTG stránky

export default function RtgLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf8" }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 24, height: 24, border: "2px solid #e8e8e4", borderTopColor: "#d0ec78", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <div style={{ background: "#fafaf8", minHeight: "100%", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {children}
      </div>
    </Suspense>
  );
}
