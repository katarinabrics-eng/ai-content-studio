"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StartAnalyzer } from "./StartAnalyzer";

function PaymentSuccessRedirect({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processPayment() {
      try {
        const res = await fetch(`/api/checkout/success?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data.ok && data.accessToken) {
          router.replace(`/project/access?token=${encodeURIComponent(data.accessToken)}`);
          return;
        }
        if (data.ok && data.projectCode) {
          router.replace(`/start/success?code=${encodeURIComponent(data.projectCode)}`);
          return;
        }
        setError(data.error ?? "Nepodařilo se zpracovat platbu.");
      } catch {
        setError("Chyba při ověřování platby.");
      }
    }
    processPayment();
  }, [sessionId, router]);

  return (
    <main className="min-h-screen bg-[#0c0c14] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-2 border-[#a8e063] border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-white/80">
          {error ?? "Zpracováváme platbu a připravujeme váš projekt…"}
        </p>
        {error && (
          <a href="/" className="mt-4 inline-block text-[#a8e063] hover:underline">
            Zpět na hlavní stránku
          </a>
        )}
      </div>
    </main>
  );
}

function StartPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  if (sessionId) {
    return <PaymentSuccessRedirect sessionId={sessionId} />;
  }
  return <StartAnalyzer />;
}

export default function StartPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white bg-[#0c0c14]">Načítám…</div>}>
      <StartPageContent />
    </Suspense>
  );
}
