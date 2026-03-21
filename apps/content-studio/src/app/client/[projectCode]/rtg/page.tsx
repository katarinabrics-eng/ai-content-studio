"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";
import {
  groupPostsToPairs,
  type ContentBatchRow,
  type ContentPostRow,
  type ContentPostPair,
} from "@/lib/types/rtg-database";

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  selected,
  onSelect,
}: {
  post: ContentPostRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [hook, setHook] = useState(post.hook ?? "");
  const [body, setBody] = useState(post.body ?? "");

  const isApproved = post.status === "approved";

  return (
    <div
      onClick={() => !isApproved && onSelect()}
      className={[
        "flex flex-col rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-150",
        selected
          ? "border-[#d0ec78] shadow-[0_0_0_3px_rgba(208,236,120,0.25)]"
          : "border-[#e8e8e4] hover:border-[#c8c8c0]",
        isApproved ? "opacity-70 cursor-default" : "",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[4/3] bg-[#f0efea] flex items-center justify-center">
        {post.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#b0aea8]">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs">Náhled brzy</span>
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#1a1a1a]/80 text-white px-2 py-1 rounded-full">
            {post.type ?? "OBSAH"}
          </span>
        </div>
        {/* Variant badge */}
        <div className="absolute top-2 right-2">
          <span
            className={[
              "text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full",
              selected ? "bg-[#d0ec78] text-[#1a1a1a]" : "bg-white/80 text-[#1a1a1a]",
            ].join(" ")}
          >
            Varianta {post.variant}
          </span>
        </div>
        {/* Approved overlay */}
        {isApproved && (
          <div className="absolute inset-0 bg-[#d0ec78]/20 flex items-center justify-center">
            <span className="bg-[#d0ec78] text-[#1a1a1a] text-xs font-semibold px-3 py-1 rounded-full">
              ✓ Schváleno
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 bg-white flex-1">
        {editing ? (
          <>
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-sm font-semibold text-[#1a1a1a] border border-[#e8e8e4] rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#d0ec78]"
              rows={2}
              placeholder="Hook…"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-xs text-[#555] border border-[#e8e8e4] rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#d0ec78]"
              rows={3}
              placeholder="Text příspěvku…"
            />
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(false); }}
              className="text-xs text-[#555] underline self-start mt-1"
            >
              Hotovo
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-[#1a1a1a] leading-snug line-clamp-2">
              {hook || <span className="text-[#b0aea8] italic">Bez hooku</span>}
            </p>
            <p className="text-xs text-[#666] leading-relaxed line-clamp-2">
              {body || <span className="italic">Bez textu</span>}
            </p>
            {!isApproved && (
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                className="text-xs text-[#888] underline self-start mt-1"
              >
                Upravit text
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Pair Row ─────────────────────────────────────────────────────────────────

function PairRow({
  pair,
  token,
  onApproved,
}: {
  pair: ContentPostPair;
  token: string;
  onApproved: (postId: string) => void;
}) {
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-select if one is already approved
  useEffect(() => {
    if (pair.variantA?.status === "approved") setSelectedVariant("A");
    else if (pair.variantB?.status === "approved") setSelectedVariant("B");
  }, [pair]);

  const alreadyApproved =
    pair.variantA?.status === "approved" || pair.variantB?.status === "approved";

  async function handleApprove() {
    if (!selectedVariant) {
      setError("Nejdříve vyber variantu (A nebo B).");
      return;
    }
    const selectedPost = selectedVariant === "A" ? pair.variantA : pair.variantB;
    if (!selectedPost) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/client/rtg/approve?token=${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: selectedPost.id,
          selected_variant: selectedVariant,
          client_note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Nepodařilo se schválit.");
        return;
      }
      onApproved(selectedPost.id);
    } catch {
      setError("Chyba připojení.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8]">
          Pár {pair.pairIndex + 1}
        </span>
        {alreadyApproved && (
          <span className="text-xs bg-[#d0ec78] text-[#1a1a1a] font-semibold px-2 py-0.5 rounded-full">
            ✓ Schváleno
          </span>
        )}
      </div>

      {/* Cards side by side */}
      <div className="grid grid-cols-2 gap-4">
        {pair.variantA && (
          <PostCard
            post={pair.variantA}
            selected={selectedVariant === "A"}
            onSelect={() => !alreadyApproved && setSelectedVariant("A")}
          />
        )}
        {pair.variantB && (
          <PostCard
            post={pair.variantB}
            selected={selectedVariant === "B"}
            onSelect={() => !alreadyApproved && setSelectedVariant("B")}
          />
        )}
      </div>

      {/* Approve controls */}
      {!alreadyApproved && (
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Poznámka (volitelné)…"
            className="flex-1 min-w-0 text-sm border border-[#e8e8e4] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d0ec78] bg-white text-[#1a1a1a] placeholder:text-[#b0aea8]"
          />
          <button
            onClick={handleApprove}
            disabled={loading || !selectedVariant}
            className="shrink-0 px-5 py-2 rounded-lg bg-[#1a1a1a] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
          >
            {loading ? "Ukládám…" : "Schválit →"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

function RtgDashboardInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectCode = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [batch, setBatch] = useState<ContentBatchRow | null>(null);
  const [pairs, setPairs] = useState<ContentPostPair[]>([]);

  const loadBatch = useCallback(async () => {
    if (!token) { setAuthError("Chybí přístupový odkaz."); setLoading(false); return; }
    try {
      const res = await fetch(`/api/client/rtg/batch?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!data.ok) {
        setAuthError(data.error ?? "Přístup odepřen.");
        return;
      }
      setBatch(data.batch ?? null);
      setPairs(groupPostsToPairs(data.posts ?? []));
    } catch {
      setAuthError("Nepodařilo se načíst obsah.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadBatch(); }, [loadBatch]);

  function handleApproved(postId: string) {
    setPairs((prev) =>
      prev.map((pair) => ({
        ...pair,
        variantA:
          pair.variantA?.id === postId
            ? { ...pair.variantA, status: "approved" as const }
            : pair.variantA,
        variantB:
          pair.variantB?.id === postId
            ? { ...pair.variantB, status: "approved" as const }
            : pair.variantB,
      }))
    );
  }

  const approvedCount = pairs.filter(
    (p) => p.variantA?.status === "approved" || p.variantB?.status === "approved"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-[#b0aea8]">
          <div className="w-8 h-8 border-2 border-[#e8e8e4] border-t-[#d0ec78] rounded-full animate-spin" />
          <span className="text-sm">Načítám obsah…</span>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <p className="text-[#1a1a1a] font-medium mb-2">Přístup odepřen</p>
          <p className="text-sm text-[#888]">{authError}</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-[#1a1a1a] font-semibold text-lg mb-2">Obsah se připravuje</p>
          <p className="text-sm text-[#888] leading-relaxed">
            Dostanete e-mail, jakmile bude váš týdenní obsah připraven ke schválení.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Batch header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8] mb-1">
            Aktuální týden
          </p>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">
            {batch.week_label}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 bg-[#e8e8e4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d0ec78] rounded-full transition-all duration-500"
              style={{ width: pairs.length ? `${(approvedCount / pairs.length) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-sm text-[#888] whitespace-nowrap">
            {approvedCount} / {pairs.length} schváleno
          </span>
        </div>
      </div>

      {/* Pairs */}
      <div className="flex flex-col gap-10">
        {pairs.map((pair) => (
          <div key={pair.pairIndex} className="border-b border-[#e8e8e4] pb-10 last:border-0 last:pb-0">
            <PairRow pair={pair} token={token} onApproved={handleApproved} />
          </div>
        ))}
      </div>

      {/* All approved message */}
      {pairs.length > 0 && approvedCount === pairs.length && (
        <div className="mt-10 rounded-xl bg-[#d0ec78]/20 border border-[#d0ec78] p-6 text-center">
          <p className="text-[#1a1a1a] font-semibold text-lg mb-1">Vše schváleno ✓</p>
          <p className="text-sm text-[#555]">
            Skvělá práce! Obsah na tento týden je připraven ke zveřejnění.
          </p>
        </div>
      )}
    </div>
  );
}

export default function RtgPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#e8e8e4] border-t-[#d0ec78] rounded-full animate-spin" />
        </div>
      }
    >
      <RtgDashboardInner />
    </Suspense>
  );
}
