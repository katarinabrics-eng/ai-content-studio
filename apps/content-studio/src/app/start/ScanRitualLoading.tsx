"use client";

import { useEffect, useState } from "react";

const RITUAL_STEPS = [
  "Analyzujeme jasnost sdělení",
  "Mapujeme positioning",
  "Vyhodnocujeme konverzní tok",
  "Čteme emoční stopu značky",
  "Prověřujeme důvěryhodnost",
];

const COUNTER_VALUES = [0, 12, 28, 47, 63, 74];
const STEP_INTERVAL_MS = 900;
const COUNTER_INTERVAL_MS = 850;

export function ScanRitualLoading() {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [counterIndex, setCounterIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setVisibleSteps((n) => Math.min(n + 1, RITUAL_STEPS.length));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    const counterTimer = setInterval(() => {
      setCounterIndex((i) => Math.min(i + 1, COUNTER_VALUES.length - 1));
    }, COUNTER_INTERVAL_MS);
    return () => clearInterval(counterTimer);
  }, []);

  const displayNumber = COUNTER_VALUES[counterIndex];

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0a] text-[#e7e7ef] px-6">
      <div className="max-w-lg mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
          Lucifera analyzuje vaši značku
        </h2>
        <p className="text-zinc-500 text-sm md:text-base mb-12">
          Vytváříme diagnostický profil ve 5 vrstvách.
        </p>

        <ul className="space-y-4 mb-14 text-left inline-block">
          {RITUAL_STEPS.map((label, i) => (
            <li
              key={label}
              className="flex items-center gap-3 text-zinc-400 transition-all duration-500"
              style={{
                opacity: i < visibleSteps ? 1 : 0.25,
                transform: i < visibleSteps ? "translateX(0)" : "translateX(-8px)",
              }}
            >
              <span
                className="text-lime-400 font-medium shrink-0 transition-opacity duration-300"
                style={{ opacity: i < visibleSteps ? 1 : 0 }}
              >
                ✔
              </span>
              <span className={i < visibleSteps ? "text-zinc-300" : "text-zinc-600"}>
                {label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Index vizuální úrovně se počítá…
          </p>
          <p
            className="text-5xl md:text-6xl font-bold text-lime-400 tabular-nums transition-all duration-500"
            key={displayNumber}
          >
            {displayNumber}
          </p>
        </div>

        <p className="text-[11px] text-zinc-600 max-w-xs mx-auto leading-relaxed">
          Scan je orientační. Kompletní strategie vzniká až při spolupráci.
        </p>
      </div>
    </div>
  );
}
