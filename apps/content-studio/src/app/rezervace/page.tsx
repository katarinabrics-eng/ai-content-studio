"use client";

import { Figtree } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { BookingGate } from "../start/BookingGate";

const figtree = Figtree({ weight: ["400", "600"], subsets: ["latin", "latin-ext"] });

const INTEREST_OPTIONS = [
  { value: "portret", label: "Portrét" },
  { value: "rodinne", label: "Rodinné focení" },
  { value: "premiova", label: "Prémiová vizuální identita" },
  { value: "brand", label: "Brand focení" },
  { value: "unsure", label: "Nejsem si jistý/á" },
] as const;

type MainTab = "booking" | "inquiry";

function RezervaceContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const step = searchParams.get("step");
  const sessionId = searchParams.get("session_id");
  const [mainTab, setMainTab] = useState<MainTab>("booking");

  useEffect(() => {
    if (from || step) setMainTab("booking");
  }, [from, step]);

  if (sessionId) {
    return (
      <div className={figtree.className} style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Platba dokončena</h1>
          <p className="text-zinc-600 mb-6">Děkujeme. Rezervace je potvrzena. Brzy vás budeme kontaktovat.</p>
          <a href="/" className="inline-block rounded-lg bg-[#A8EB12] px-6 py-3 text-black font-semibold hover:opacity-90">Zpět na úvod</a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={figtree.className}
      style={{
        minHeight: "100vh",
        background: "#F7F7F5",
        color: "#1A1A1A",
        padding: "80px 24px 48px",
      }}
    >
      <style>{`
        .rezervace-input:focus { outline: none; border-color: #B7E300; box-shadow: 0 0 0 1px #B7E300; }
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Úvodní sekce */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 12 }}>Lucifera Studio</p>
          <h1 style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.25, color: "#1A1A1A", marginBottom: 12 }}>
            Spolupráce začíná jasností.
          </h1>
          <p style={{ fontSize: 18, color: "#6F6F6F", lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>
            Vyberte si, zda chcete rovnou rezervovat službu, nebo se jen nezávazně zeptat.
          </p>
        </div>

        {/* Horní přepínače */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid #EAEAE7" }}>
          <button
            type="button"
            onClick={() => setMainTab("booking")}
            style={{
              padding: "14px 24px",
              background: mainTab === "booking" ? "#FFFFFF" : "transparent",
              border: "1px solid #EAEAE7",
              marginBottom: mainTab === "booking" ? -1 : 0,
              fontWeight: mainTab === "booking" ? 600 : 400,
              color: "#1A1A1A",
              cursor: "pointer",
              fontSize: 16,
              boxShadow: mainTab === "booking" ? "0 10px 30px rgba(0,0,0,0.04)" : "none",
              borderRadius: "12px 12px 0 0",
              borderBottom: mainTab === "booking" ? "3px solid #B7E300" : "1px solid #EAEAE7",
            }}
          >
            1️⃣ Rezervovat službu
          </button>
          <button
            type="button"
            onClick={() => setMainTab("inquiry")}
            style={{
              padding: "14px 24px",
              background: mainTab === "inquiry" ? "#FFFFFF" : "transparent",
              border: "1px solid #EAEAE7",
              marginBottom: mainTab === "inquiry" ? -1 : 0,
              fontWeight: mainTab === "inquiry" ? 600 : 400,
              color: "#1A1A1A",
              cursor: "pointer",
              fontSize: 16,
              boxShadow: mainTab === "inquiry" ? "0 10px 30px rgba(0,0,0,0.04)" : "none",
              borderRadius: "12px 12px 0 0",
              borderBottom: mainTab === "inquiry" ? "3px solid #B7E300" : "1px solid #EAEAE7",
            }}
          >
            2️⃣ Chci se jen zeptat
          </button>
        </div>

        {mainTab === "booking" && (
          <BookingGate basePath="/rezervace" hideIntro projectId={searchParams.get("project_id")} />
        )}

        {mainTab === "inquiry" && (
          <InquiryForm />
        )}
      </div>
    </div>
  );
}

const RezervaceFallback = () => (
  <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ textAlign: "center" }}>
      <div className="animate-spin" style={{ width: 40, height: 40, margin: "0 auto 16px", borderRadius: "50%", border: "2px solid #EAEAE7", borderTopColor: "#B7E300" }} />
      <p style={{ fontSize: 15, color: "#6F6F6F" }}>Načítám…</p>
    </div>
  </div>
);

export default function RezervacePage() {
  return (
    <Suspense fallback={<RezervaceFallback />}>
      <RezervaceContent />
    </Suspense>
  );
}

function InquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interestType, setInterestType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Vyplňte prosím jméno, e-mail a zprávu.");
      setStatus("error");
      return;
    }
    setErrorMsg("");
    setStatus("sending");
    try {
      const res = await fetch("/api/rezervace/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          interestType: interestType || undefined,
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error ?? "Odeslání se nepodařilo. Zkuste to později.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setInterestType("");
      setMessage("");
    } catch {
      setErrorMsg("Odeslání se nepodařilo. Zkuste to později.");
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        padding: 40,
        border: "1px solid #EAEAE7",
      }}
    >
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Jméno</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rezervace-input"
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 10, fontSize: 15, marginBottom: 16, boxSizing: "border-box" }}
          required
        />

        <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rezervace-input"
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 10, fontSize: 15, marginBottom: 16, boxSizing: "border-box" }}
          required
        />

        <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Telefon <span style={{ color: "#999" }}>(nepovinné)</span></label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rezervace-input"
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 10, fontSize: 15, marginBottom: 16, boxSizing: "border-box" }}
        />

        <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Typ zájmu</label>
        <select
          value={interestType}
          onChange={(e) => setInterestType(e.target.value)}
          className="rezervace-input"
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 10, fontSize: 15, marginBottom: 16, boxSizing: "border-box", background: "#FFF", color: "#1A1A1A" }}
        >
          <option value="">— vyberte —</option>
          {INTEREST_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Zpráva</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rezervace-input"
          rows={5}
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 10, fontSize: 15, marginBottom: 20, boxSizing: "border-box", resize: "vertical" }}
          required
        />

        {status === "error" && <p style={{ color: "#c00", fontSize: 14, marginBottom: 12 }}>{errorMsg}</p>}
        {status === "success" && <p style={{ color: "#0a0", fontSize: 14, marginBottom: 12 }}>Dotaz byl odeslán. Brzy vás budeme kontaktovat.</p>}

        <button
          type="submit"
          disabled={status === "sending"}
          style={{
            width: "100%",
            padding: 14,
            background: "#B7E300",
            color: "#1A1A1A",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            borderRadius: 12,
            cursor: status === "sending" ? "wait" : "pointer",
            opacity: status === "sending" ? 0.8 : 1,
          }}
        >
          {status === "sending" ? "Odesílám…" : "Odeslat dotaz"}
        </button>
      </form>

      <p style={{ fontSize: 13, color: "#6F6F6F", marginTop: 20, lineHeight: 1.5 }}>
        Odpovídáme osobně do 48 hodin.<br />
        Žádné automatické prodejní sekvence.
      </p>
    </div>
  );
}
