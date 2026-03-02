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
        rounded-3xl p-12 max-w-4xl mx-auto transition-all
        ${isDark
          ? "bg-[#0b0b10] border border-white/10 text-white"
          : "bg-white border border-black/10 text-black shadow-xl"
        }
      `}
    >
      <h2 className="text-4xl font-semibold mb-10">Výběr termínu</h2>

      <div className="grid grid-cols-7 gap-4 mb-12">
        {[...Array(31)].map((_, i) => {
          const day = i + 1;
          const active = selectedDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`
                py-4 rounded-xl text-lg transition-all duration-200
                ${
                  active
                    ? "bg-lime-400 text-black scale-105 shadow-lg"
                    : isDark
                      ? "border border-white/20 text-white/70 hover:border-lime-400 hover:text-lime-400 hover:scale-105"
                      : "border border-black/20 text-black/70 hover:border-lime-500 hover:text-lime-600 hover:scale-105"
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
          w-full py-5 rounded-2xl text-lg font-semibold transition-all
          ${
            selectedDay
              ? "bg-lime-400 text-black hover:scale-[1.02] shadow-xl"
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
