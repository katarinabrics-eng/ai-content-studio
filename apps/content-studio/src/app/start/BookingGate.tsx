"use client";

import { Figtree } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import BookingCalendar from "@/components/booking/BookingCalendar";

const figtree = Figtree({ weight: ["400", "600"], subsets: ["latin", "latin-ext"] });

type TabId = "portret" | "rodinne" | "premiova";

const TABS: { id: TabId; label: string; subtitle: string }[] = [
  { id: "portret", label: "Portrétní focení", subtitle: "Obraz, který mluví za vás." },
  { id: "rodinne", label: "Rodinné focení", subtitle: "Zachycený čas bez stresu." },
  { id: "premiova", label: "Prémiová vizuální identita", subtitle: "Strategická spolupráce pro osobní značky." },
];

type BookingGateProps = {
  /** Base path for links (e.g. "/rezervace" when embedded on rezervace page). Default "/start". */
  basePath?: string;
  /** When true, hide the intro header (for embedding under /rezervace where intro is shown above tabs). */
  hideIntro?: boolean;
  /** Client project ID from diagnostika (propojení scan → rezervace). */
  projectId?: string | null;
};

export function BookingGate({ basePath = "/start", hideIntro = false, projectId = null }: BookingGateProps = {}) {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const from: TabId =
    fromParam === "premiova" ? "premiova"
    : fromParam === "rodinne" ? "rodinne"
    : "portret";
  const step = searchParams.get("step");
  const [activeTab, setActiveTab] = useState<TabId>(from);

  useEffect(() => {
    const f = searchParams.get("from");
    if (f === "premiova") setActiveTab("premiova");
    else if (f === "rodinne") setActiveTab("rodinne");
    else if (f === "portret") setActiveTab("portret");
  }, [searchParams]);

  const showCalendar = step === "calendar";

  return (
    <div
      className={figtree.className}
      style={{
        minHeight: hideIntro ? undefined : "100vh",
        background: "#F7F7F5",
        color: "#1A1A1A",
        padding: hideIntro ? "0 24px 24px" : "80px 24px",
      }}
    >
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .gate-fade{animation:up 0.35s ease}
        .gate-input:focus{outline:none;border-color:#B7E300;box-shadow:0 0 0 1px #B7E300}
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {!hideIntro && (
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 12 }}>Lucifera Studio</p>
          <h1 style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.25, color: "#1A1A1A", marginBottom: 12 }}>
            Spolupráce začíná jasností.
          </h1>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#1A1A1A", marginBottom: 16 }}>
            Vyberte typ spolupráce.
          </h2>
          <p style={{ fontSize: 17, color: "#6F6F6F", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 24px" }}>
            Každá služba má jiný proces. Provedeme vás krok za krokem.
          </p>
          <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 16 }}>
            Před rezervací si prosím přečtěte naše{" "}
            <Link href="/obchodni-podminky" className="text-[#1A1A1A] underline underline-offset-2 hover:no-underline font-medium">obchodní podmínky</Link>.
          </p>
          {!showCalendar && (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px", background: "#FFFFFF", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #EAEAE7", textAlign: "left" }}>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Co se zde odehrává</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 12 }}>
              Zvolíte typ focení (portrét nebo rodinné), vyplníte údaje a provedeme vás k výběru termínu a úhradě.
            </p>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Co potřebujete k zahájení</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6 }}>
              Vyplňte formulář a zvolte termín. Obchodní podmínky platí pro všechny rezervace.
            </p>
          </div>
          )}
        </div>
        )}

        {showCalendar ? (
          from === "premiova" ? (
            <div className="relative rounded-3xl bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.08),transparent_60%)]">
              <div className="relative overflow-hidden bg-zinc-900/95 border border-zinc-800 rounded-3xl p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
                <BookingCalendar
                  service={from}
                  theme="dark"
                  basePath={basePath}
                  projectId={projectId}
                  showBackLink
                />
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl">
              <BookingCalendar
                service={from}
                theme="light"
                basePath={basePath}
                projectId={projectId}
                showBackLink
              />
            </div>
          )
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: "1px solid #EAEAE7" }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: "14px 20px",
                    background: activeTab === t.id ? "#FFFFFF" : "transparent",
                    border: "1px solid #EAEAE7",
                    marginBottom: activeTab === t.id ? -1 : 0,
                    fontWeight: activeTab === t.id ? 600 : 400,
                    color: "#1A1A1A",
                    cursor: "pointer",
                    fontSize: 15,
                    boxShadow: activeTab === t.id ? "0 10px 30px rgba(0,0,0,0.04)" : "none",
                    borderRadius: "12px 12px 0 0",
                    transition: "all 0.3s ease",
                    borderBottom: activeTab === t.id ? "3px solid #B7E300" : "1px solid #EAEAE7",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Dynamic form container */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                padding: 40,
              }}
            >
              {activeTab === "portret" && <PortretFlow basePath={basePath} />}
              {activeTab === "rodinne" && <RodinneFlow basePath={basePath} />}
              {activeTab === "premiova" && <PremioveFlow basePath={basePath} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const PORTRET_STUDIO_CONTENT = "Profesionální portrétní focení v ateliéru (autorský portrét). Zahrnuje přípravu, focení cca 1–2 hodiny a základní retuše. Výstup: vybrané fotografie v rozlišení vhodném pro web a tisk. Možnost přidat vizážistku (+ 3 500 Kč).";

function PortretFlow({ basePath = "/start" }: { basePath?: string }) {
  const [typ, setTyp] = useState<"podnikatelsky" | "umelecky" | "herecky_profesni">("podnikatelsky");
  const [vizazistka, setVizazistka] = useState(false);
  const [studioExpanded, setStudioExpanded] = useState(true);
  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Vyberte variantu</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <div>
          <button type="button" onClick={() => setStudioExpanded(!studioExpanded)} style={{ width: "100%", textAlign: "left", padding: 16, borderRadius: 12, border: "2px solid #B7E300", background: "rgba(183,227,0,0.08)", cursor: "pointer" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Portrét – autorský portrét – STUDIO</span>
            <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>4 500 Kč</span>
            <span style={{ float: "right", fontSize: 14, color: "#6F6F6F" }}>{studioExpanded ? "▼" : "▶"}</span>
          </button>
          {studioExpanded && (
            <div style={{ marginTop: 8, padding: "14px 16px", background: "#F7F7F5", borderRadius: 10, border: "1px solid #EAEAE7", fontSize: 14, color: "#3A3A3A", lineHeight: 1.6 }}>
              {PORTRET_STUDIO_CONTENT}
            </div>
          )}
        </div>
      </div>
      <p style={{ fontSize: 15, color: "#6F6F6F", marginBottom: 16 }}>Typ portrétu</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {(["podnikatelsky", "umelecky", "herecky_profesni"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTyp(t)} style={{ textAlign: "left", padding: 12, borderRadius: 10, border: typ === t ? "2px solid #B7E300" : "1px solid #EAEAE7", background: typ === t ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 15, color: "#1A1A1A" }}>
            {t === "podnikatelsky" ? "Podnikatelský portrét" : t === "umelecky" ? "Umělecký portrét" : "Herecký / profesní portrét"}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 15, color: "#1A1A1A" }}>
          <input type="checkbox" checked={vizazistka} onChange={(e) => setVizazistka(e.target.checked)} style={{ width: 18, height: 18 }} />
          Přejete si vizážistku? <span style={{ color: "#6F6F6F" }}>+ 3 500 Kč</span>
        </label>
      </div>
      <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 20 }}>Konzultace zde není – stačí vyplnit dotazník. Termín focení zvolíte v dalším kroku.</p>
      <Link href={`${basePath}?from=portret&step=calendar`} style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
        Pokračovat k výběru termínu
      </Link>
    </div>
  );
}

const RODINNE_OPTS: { id: "reportaz" | "atelier" | "atelierovy"; label: string; price: string; content: string }[] = [
  { id: "reportaz", label: "Reportážní dokumentární focení", price: "5 800 Kč", content: "Dokumentární zachycení rodiny v přirozeném prostředí (exteriér nebo váš interiér). Cca 2–3 hodiny, digitální nebo analogové snímky dle domluvy. Zahrnuje základní retuše a předání vybraných fotografií." },
  { id: "atelier", label: "Ateliérové focení stylizace", price: "8 500 Kč", content: "Stylizované rodinné focení v ateliéru s návrhem stylu, rekvizitami a profesionálním světlem. Vhodné pro výraznější, umělecky vedené snímky. Zahrnuje přípravu, focení a postprodukci." },
  { id: "atelierovy", label: "Atelierový rodinný portrét", price: "4 500 Kč", content: "Klasický rodinný portrét v ateliéru – čisté pozadí nebo jednoduchá stylizace. Cca 1–2 hodiny, vhodné pro portréty i skupinové snímky. Zahrnuje základní retuše a předání fotografií." },
];

function RodinneFlow({ basePath = "/start" }: { basePath?: string }) {
  const [typ, setTyp] = useState<"reportaz" | "atelier" | "atelierovy">("reportaz");
  const [kde, setKde] = useState("");
  const [kolik, setKolik] = useState("");
  const [analogDigital, setAnalogDigital] = useState<"analog" | "digital" | "">("");
  const [obleceni, setObleceni] = useState(false);
  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Vyberte typ focení</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {RODINNE_OPTS.map((opt) => (
          <div key={opt.id}>
            <button type="button" onClick={() => setTyp(opt.id)} style={{ width: "100%", textAlign: "left", padding: 16, borderRadius: 12, border: typ === opt.id ? "2px solid #B7E300" : "1px solid #EAEAE7", background: typ === opt.id ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>{opt.label}</span>
              <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>{opt.price}</span>
            </button>
            {typ === opt.id && (
              <div style={{ marginTop: 8, padding: "14px 16px", background: "#F7F7F5", borderRadius: 10, border: "1px solid #EAEAE7", fontSize: 14, color: "#3A3A3A", lineHeight: 1.6 }}>
                {opt.content}
              </div>
            )}
          </div>
        ))}
      </div>
      <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Kde si přejete fotit?</label>
      <input type="text" value={kde} onChange={(e) => setKde(e.target.value)} placeholder="např. park, byt, ateliér" className="gate-input" style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 12, fontSize: 15, marginBottom: 16 }} />
      <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Kolik vás bude?</label>
      <input type="text" value={kolik} onChange={(e) => setKolik(e.target.value)} placeholder="např. 4 osoby, 2 dospělí + 2 děti" className="gate-input" style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 12, fontSize: 15, marginBottom: 16 }} />
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 8 }}>Preferujete fotky na analog nebo digitál?</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button type="button" onClick={() => setAnalogDigital("analog")} style={{ padding: "10px 16px", borderRadius: 10, border: analogDigital === "analog" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: analogDigital === "analog" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 14 }}>Analog</button>
        <button type="button" onClick={() => setAnalogDigital("digital")} style={{ padding: "10px 16px", borderRadius: 10, border: analogDigital === "digital" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: analogDigital === "digital" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 14 }}>Digitál</button>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 15, color: "#1A1A1A", marginBottom: 24 }}>
        <input type="checkbox" checked={obleceni} onChange={(e) => setObleceni(e.target.checked)} style={{ width: 18, height: 18 }} />
        Chcete pomoct s výběrem oblečení?
      </label>
      <Link href={`${basePath}?from=rodinne&step=calendar`} style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
        Pokračovat k výběru termínu
      </Link>
    </div>
  );
}

function PremioveFlow({ basePath = "/start" }: { basePath?: string }) {
  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1A1A1A", marginBottom: 20 }}>
        Začínáme strategií
      </h2>
      <div style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.75, marginBottom: 24 }}>
        <p style={{ marginBottom: 12 }}>
          Prémiová vizuální identita nevzniká z inspirace.
          <br />
          Vzniká z jasnosti.
        </p>
        <p style={{ marginBottom: 12 }}>
          Během 60 minut definujeme energii vaší značky,
          nastavíme vizuální směr
          a vytvoříme základní vizuální board.
        </p>
        <p style={{ marginBottom: 12, fontWeight: 600 }}>
          Toto setkání stojí 7 800 Kč.
        </p>
        <p style={{ marginBottom: 12, fontSize: 14, color: "#6F6F6F" }}>
          Pokud se rozhodnete pokračovat do plné spolupráce
          (cena služby začíná na 45 000 Kč),
          částka se odečítá.
        </p>
        <p style={{ fontSize: 14, color: "#6F6F6F" }}>
          Pokud ne, odcházíte s jasným směrem, který můžete využít dál.
        </p>
      </div>
      <Link href={`${basePath}?from=premiova&step=calendar`} style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
        Chci začít strategií
      </Link>
    </div>
  );
}
