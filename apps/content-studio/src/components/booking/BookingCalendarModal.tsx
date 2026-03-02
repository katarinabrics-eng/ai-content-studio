"use client";

import { useState } from "react";
import BookingCalendar from "./BookingCalendar";

type BookingCalendarModalProps = {
  theme?: "light" | "dark";
  triggerLabel?: string;
  triggerClassName?: string;
  onConfirm?: (date: string) => void;
};

export default function BookingCalendarModal({
  theme = "light",
  triggerLabel = "Rezervovat termín",
  triggerClassName,
  onConfirm,
}: BookingCalendarModalProps) {
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  const handleConfirm = (date: string) => {
    onConfirm?.(date);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-block rounded-lg bg-[#A8EB12] px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
        }
      >
        {triggerLabel}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`absolute -top-2 -right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                isDark ? "text-white/40 hover:text-white" : "text-black/50 hover:text-black"
              }`}
            >
              ✕
            </button>
            <BookingCalendar theme={theme} onConfirm={handleConfirm} />
          </div>
        </div>
      )}
    </>
  );
}
