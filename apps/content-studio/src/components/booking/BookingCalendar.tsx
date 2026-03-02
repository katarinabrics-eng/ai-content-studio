"use client";

import { useState } from "react";

type BookingCalendarProps = {
  theme?: "light" | "dark";
  onConfirm?: (date: string) => void;
};

export default function BookingCalendar({
  theme = "light",
  onConfirm,
}: BookingCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const isDark = theme === "dark";

  const handleConfirm = () => {
    if (selectedDay == null) return;
    const date = `2026-03-${String(selectedDay).padStart(2, "0")}`;
    onConfirm?.(date);
  };

  return (
    <div
      className={`
        rounded-3xl p-10 max-w-3xl mx-auto
        ${isDark
          ? "bg-[#0c0c0f] border border-white/10 text-white"
          : "bg-white border border-black/10 text-black"
        }
      `}
    >
      <h2 className="text-3xl mb-8">Výběr termínu</h2>

      <div className="grid grid-cols-7 gap-3 mb-8">
        {[...Array(31)].map((_, i) => {
          const day = i + 1;
          const active = selectedDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`
                py-3 rounded-lg transition
                ${isDark
                  ? active
                    ? "bg-lime-400 text-black"
                    : "border border-white/20 text-white/70 hover:border-lime-400 hover:text-lime-400"
                  : active
                    ? "bg-lime-400 text-black"
                    : "border border-black/20 text-black/70 hover:border-lime-400 hover:text-lime-400"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selectedDay}
        onClick={handleConfirm}
        className={`
          w-full py-4 rounded-xl font-semibold transition
          ${selectedDay
            ? "bg-lime-400 text-black hover:scale-[1.02]"
            : isDark
              ? "bg-white/10 text-white/40"
              : "bg-black/10 text-black/40"
          }
        `}
      >
        Pokračovat k úhradě
      </button>
    </div>
  );
}
