"use client";

import { useState } from "react";
import Link from "next/link";

const TIME_SLOTS = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
const MONTHS = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];

const SERVICE_LABELS: Record<string, string> = {
  portret: "Portrétní focení",
  rodinne: "Rodinné focení",
  brand: "Brand focení",
  premiova: "Prémiová vizuální identita",
  board: "Strategický Visual Board",
};

export type BookingCalendarService = "portret" | "rodinne" | "brand" | "premiova" | "board";
export type BookingCalendarTheme = "light" | "dark";

export type BookingCalendarProps = {
  service: BookingCalendarService;
  theme: BookingCalendarTheme;
  basePath?: string;
  projectId?: string | null;
  showBackLink?: boolean;
  onDirectCheckout?: (date: string) => void;
};

export default function BookingCalendar({
  service,
  theme,
  basePath = "/rezervace",
  projectId = null,
  showBackLink = true,
  onDirectCheckout,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isDark = theme === "dark";
  const isPremiova = service === "premiova";
  const isBoard = service === "board";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

  const backHref = showBackLink ? `${basePath}?from=${service}` : "#";

  const title = isPremiova || isBoard ? "Rezervace strategické konzultace" : "Výběr termínu";
  const subtitle =
    isPremiova || isBoard
      ? "60 minut · Online / osobně v Praze · Součástí je vizuální board"
      : `${SERVICE_LABELS[service]} · Výběr termínu`;

  const ctaLabel =
    isPremiova || isBoard ? "Potvrdit termín a uhradit 7 800 Kč" : "Potvrdit termín a pokračovat k úhradě";

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      if (isBoard && onDirectCheckout) {
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
        onDirectCheckout(dateStr);
      } else {
        setModalOpen(true);
      }
    }
  };

  const cardBg = isDark ? "bg-[#0c0c0f] border-white/10" : "bg-white border-black/10 shadow-xl";
  const textMuted = isDark ? "text-zinc-400" : "text-zinc-600";
  const textMutedLight = isDark ? "text-zinc-500" : "text-zinc-500";
  const dayInactive = isDark ? "bg-white/5 border border-white/10 text-zinc-300 hover:border-white/20" : "bg-zinc-50 border border-zinc-200 text-zinc-700 hover:border-lime-500 hover:text-lime-600";
  const dayActive = "bg-lime-500/20 border border-lime-400 text-white shadow-[0_0_20px_rgba(132,204,22,0.35)] hover:bg-lime-500/30";
  const timeInactive = isDark ? "bg-white/5 border border-white/10 text-zinc-300" : "bg-zinc-50 border border-zinc-200 text-zinc-700";
  const timeActive = "bg-lime-500/25 border border-lime-400 text-white shadow-[0_0_25px_rgba(132,204,22,0.45)]";
  const linkColor = isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900";

  return (
    <div className="rounded-3xl p-10 transition-all">
      {showBackLink && (
        <Link href={backHref} className={`inline-block mb-4 text-sm ${linkColor} transition`}>
          ← Zpět na výběr služby
        </Link>
      )}
      <p className={`text-xs uppercase tracking-wider ${textMutedLight} mb-2`}>Krok 2 / 3</p>
      <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>{title}</h2>
      <p className={`text-sm ${textMuted} mb-6`}>{subtitle}</p>

      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <div className="grid grid-cols-[1fr_200px] gap-8 mb-6">
          <div>
            <p className={`text-xs uppercase tracking-wider ${textMutedLight} mb-3`}>
              {MONTHS[month]} {year}
            </p>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((d) => (
                <div key={d} className={`text-center text-xs font-semibold ${textMutedLight}`}>
                  {d}
                </div>
              ))}
              {Array.from({ length: startWeekday - 1 }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const dayDate = new Date(year, month, d);
                const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === d &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={isPast}
                    onClick={() => setSelectedDate(dayDate)}
                    className={`rounded-lg text-sm font-medium transition-all duration-200 ${isSelected ? dayActive : dayInactive} ${isPast ? "opacity-40 cursor-not-allowed" : ""}`}
                    style={{ padding: "10px" }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className={`text-xs uppercase tracking-wider ${textMutedLight} mb-2`}>Čas</p>
            <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto">
              {TIME_SLOTS.map((t) => {
                const isSelected = selectedTime === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`rounded-lg px-3 py-2.5 text-sm text-left transition border ${isSelected ? timeActive : timeInactive} hover:border-lime-400`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDate && selectedTime && (
          <p className={`text-sm ${textMuted} mb-4`}>
            Vybraný termín: {selectedDate.getDate()}. {selectedDate.getMonth() + 1}. {selectedDate.getFullYear()} v{" "}
            {selectedTime}
          </p>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime}
          className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-black font-semibold rounded-xl py-4 shadow-[0_10px_40px_rgba(132,204,22,0.4)] hover:scale-[1.02] hover:shadow-[0_15px_50px_rgba(132,204,22,0.55)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {ctaLabel}
        </button>
      </div>

      {modalOpen && selectedDate && selectedTime && !isBoard && (
        <ConfirmModal
          service={service}
          date={selectedDate}
          time={selectedTime}
          onClose={() => setModalOpen(false)}
          projectId={projectId ?? undefined}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  service,
  date,
  time,
  onClose,
  projectId,
}: {
  service: BookingCalendarService;
  date: Date;
  time: string;
  onClose: () => void;
  projectId?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dateStr = `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()} v ${time}`;
  const dateApi = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const isPremiova = service === "premiova";

  const handlePay = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Zadejte e-mail.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const reserveRes = await fetch("/api/bookings/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: service,
          date: dateApi,
          time,
          email: trimmed,
          ...(projectId ? { project_id: projectId } : {}),
        }),
      });
      const reserveData = await reserveRes.json();
      if (!reserveRes.ok) {
        setError(reserveData.error ?? "Termín je obsazen nebo došlo k chybě.");
        setLoading(false);
        return;
      }
      const bookingId = reserveData.bookingId;
      const sessionRes = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok || !sessionData.url) {
        setError(sessionData.error ?? "Nepodařilo se otevřít platbu.");
        setLoading(false);
        return;
      }
      window.location.href = sessionData.url;
    } catch {
      setError("Spojení se nezdařilo. Zkuste to znovu.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.08),transparent_60%)] pointer-events-none" aria-hidden />
      <div
        className="relative bg-zinc-900/95 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Krok 3 / 3</p>
        <h3 className="text-xl font-semibold text-white mb-2">
          {isPremiova ? "Potvrdit termín a uhradit 7 800 Kč" : "Potvrdit termín a přejít k úhradě"}
        </h3>
        <p className="text-zinc-400 text-sm mb-1">
          {isPremiova ? "Strategická konzultace + vizuální board" : SERVICE_LABELS[service]}
        </p>
        <p className="text-zinc-500 text-sm mb-6">Termín: {dateStr}</p>
        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vas@email.cz"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 mb-4"
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-black font-semibold rounded-xl py-4 shadow-[0_10px_40px_rgba(132,204,22,0.4)] hover:scale-[1.02] hover:shadow-[0_15px_50px_rgba(132,204,22,0.55)] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "Přesměrovávám…" : isPremiova ? "Potvrdit termín a uhradit 7 800 Kč" : "Potvrdit termín a pokračovat k úhradě"}
        </button>
        <button type="button" onClick={onClose} className="mt-4 w-full py-2 text-zinc-500 text-sm hover:text-white transition">
          Zrušit
        </button>
      </div>
    </div>
  );
}
