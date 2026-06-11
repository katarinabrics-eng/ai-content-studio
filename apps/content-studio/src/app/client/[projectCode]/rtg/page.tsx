"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";

// ─── Typy ─────────────────────────────────────────────────────────────────────

type PostStatus = "pending" | "client_review" | "approved" | "rejected";
type PostVariant = "A" | "B";
type PostType = "VIDEO" | "GRAFIKA" | "CAROUSEL" | string;
type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5" | null;

interface Post {
  id: string;
  batch_id: string;
  project_id: string;
  pair_index: number;
  variant: PostVariant;
  type: PostType | null;
  aspect_ratio: AspectRatio;
  slides_count: number | null;
  hook: string | null;
  body: string | null;
  thumbnail_url: string | null;
  output_url: string | null;
  status: PostStatus;
  client_approved_at: string | null;
  client_note: string | null;
}

interface Batch {
  id: string;
  project_id: string;
  week_label: string;
  week_start: string;
  status: string;
  items_total: number;
  items_approved: number;
}

interface ProjectInfo {
  plan: string | null;
  interval_days: number | null;
  client_name: string | null;
  onboarding_completed: boolean;
}

interface PostPair {
  pairIndex: number;
  variantA: Post | null;
  variantB: Post | null;
}

function groupToPairs(posts: Post[]): PostPair[] {
  const map = new Map<number, PostPair>();
  for (const post of posts) {
    if (!map.has(post.pair_index)) {
      map.set(post.pair_index, { pairIndex: post.pair_index, variantA: null, variantB: null });
    }
    const pair = map.get(post.pair_index)!;
    if (post.variant === "A") pair.variantA = post;
    else if (post.variant === "B") pair.variantB = post;
  }
  return Array.from(map.values()).sort((a, b) => a.pairIndex - b.pairIndex);
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  selected,
  onSelect,
  code,
  token,
}: {
  post: Post;
  selected: boolean;
  onSelect: () => void;
  code: string;
  token: string;
}) {
  const [editing, setEditing] = useState(false);
  const [hook, setHook] = useState(post.hook ?? "");
  const [body, setBody] = useState(post.body ?? "");
  const [saving, setSaving] = useState(false);

  async function saveText() {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/client/rtg/update-text", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id, field: "hook", value: hook, code, token }),
        }),
        fetch("/api/client/rtg/update-text", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id, field: "body", value: body, code, token }),
        }),
      ]);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }
  const isApproved = post.status === "approved";
  const isCarousel = post.type === "CAROUSEL";
  const isVideo = post.type === "VIDEO";
  const isPortrait = isVideo && post.aspect_ratio === "9:16";

  const typeColor =
    isVideo
      ? "bg-blue-50 text-blue-700"
      : post.type === "GRAFIKA"
      ? "bg-green-50 text-green-700"
      : isCarousel
      ? "bg-orange-50 text-orange-700"
      : "bg-gray-100 text-gray-600";

  // Aspect ratio badge pro video
  const aspectBadge =
    isVideo && post.aspect_ratio === "9:16"
      ? { label: "Reels", cls: "bg-purple-50 text-purple-700" }
      : isVideo && post.aspect_ratio === "16:9"
      ? { label: "Landscape", cls: "bg-gray-100 text-gray-500" }
      : null;

  // Thumbnail oblast: 9:16 portrait pro Reels, jinak 16:9
  const thumbnailCls = isPortrait
    ? "relative w-full bg-[#f5f5f0] flex items-center justify-center overflow-hidden aspect-[9/16] max-h-48"
    : "relative w-full aspect-video bg-[#f5f5f0] flex items-center justify-center overflow-hidden";

  return (
    <div
      onClick={() => !isApproved && onSelect()}
      className={[
        "flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-all duration-150",
        selected
          ? "border-2 border-[#d0ec78] bg-[#fafff0] shadow-sm"
          : "border border-[#e8e8e4] bg-white hover:border-[#c8c8c0]",
        isApproved ? "opacity-60 cursor-default" : "",
      ].join(" ")}
    >
      {/* Thumbnail / placeholder */}
      <div className={thumbnailCls}>
        {isCarousel ? (
          // Carousel placeholder — zobraz počet slajdů
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="2" y="5" width="14" height="14" rx="2" />
              <path d="M18 7h1a2 2 0 012 2v8a2 2 0 01-2 2H9" />
            </svg>
            <span className="text-sm font-medium">
              {post.slides_count ? `${post.slides_count} slajdů` : "Carousel"}
            </span>
          </div>
        ) : post.output_url || post.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(post.output_url ?? post.thumbnail_url)!}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              border: "2px solid #e8e8e4",
              borderTopColor: "#d0ec78",
              animation: "spin 1s linear infinite",
            }} />
            <span style={{ fontSize: "12px", color: "#9a9a9a" }}>Obsah se generuje…</span>
          </div>
        )}
        {isApproved && (
          <div className="absolute inset-0 bg-[#d0ec78]/20 flex items-center justify-center">
            <span className="bg-[#d0ec78] text-[#111] text-xs font-semibold px-3 py-1 rounded-full">
              ✓ Schváleno
            </span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center flex-wrap gap-1.5 px-4 pt-3">
        {post.type && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColor}`}>
            {post.type}
          </span>
        )}
        {aspectBadge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${aspectBadge.cls}`}>
            {aspectBadge.label}
          </span>
        )}
        <span className="text-xs text-gray-400">Varianta {post.variant}</span>
      </div>

      {/* Obsah */}
      <div className="flex flex-col gap-1.5 px-4 pt-2 pb-4 flex-1">
        {editing ? (
          <>
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              rows={1}
              placeholder="Hook…"
              className="w-full text-sm font-semibold text-[#1a1a1a] border border-[#e8e8e4] rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#d0ec78]"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              rows={3}
              placeholder="Text příspěvku…"
              className="w-full text-xs text-[#555] border border-[#e8e8e4] rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#d0ec78]"
            />
            <button
              onClick={(e) => { e.stopPropagation(); saveText(); }}
              disabled={saving}
              className="text-xs text-[#888] underline self-start disabled:opacity-50"
            >
              {saving ? "Ukládám…" : "Uložit"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-[#1a1a1a] leading-snug line-clamp-2">
              {hook || <span className="italic text-[#b0aea8]">Bez hooku</span>}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
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

// ─── PairRow ──────────────────────────────────────────────────────────────────

function PairRow({
  pair,
  code,
  token,
  onApproved,
}: {
  pair: PostPair;
  code: string;
  token: string;
  onApproved: (postId: string) => void;
}) {
  const [selected, setSelected] = useState<PostVariant | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyApproved =
    pair.variantA?.status === "approved" || pair.variantB?.status === "approved";

  useEffect(() => {
    if (pair.variantA?.status === "approved") setSelected("A");
    else if (pair.variantB?.status === "approved") setSelected("B");
  }, [pair]);

  async function handleApprove() {
    if (!selected) return;
    const post = selected === "A" ? pair.variantA : pair.variantB;
    if (!post) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/client/rtg/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post.id,
          selected_variant: selected,
          client_note: note || undefined,
          code,
          token,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; batch_fully_approved?: boolean };
      if (!data.ok) {
        setError(data.error ?? "Nepodařilo se schválit.");
        return;
      }
      onApproved(post.id);
    } catch {
      setError("Chyba připojení.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8]">
          Pár {pair.pairIndex + 1}
        </span>
        {alreadyApproved && (
          <span className="text-xs bg-[#d0ec78] text-[#111] font-semibold px-2 py-0.5 rounded-full">
            ✓ Schváleno
          </span>
        )}
      </div>

      {/* Karty A / B */}
      <div className="grid grid-cols-2 gap-4">
        {pair.variantA && (
          <PostCard
            post={pair.variantA}
            selected={selected === "A"}
            onSelect={() => !alreadyApproved && setSelected("A")}
            code={code}
            token={token}
          />
        )}
        {pair.variantB && (
          <PostCard
            post={pair.variantB}
            selected={selected === "B"}
            onSelect={() => !alreadyApproved && setSelected("B")}
            code={code}
            token={token}
          />
        )}
      </div>

      {/* Schválení */}
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
            disabled={loading || !selected}
            className="shrink-0 px-6 py-2 rounded-lg bg-[#111] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
          >
            {loading ? "Ukládám…" : "Schválit vybranou →"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── DownloadBanner ───────────────────────────────────────────────────────────

function DownloadBanner({ batchId, code, token }: { batchId: string; code: string; token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/client/rtg/download?batch_id=${encodeURIComponent(batchId)}&code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`
      );
      const data = (await res.json()) as { ok: boolean; driveUrl?: string; error?: string };
      if (data.ok && data.driveUrl) {
        window.open(data.driveUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(data.error ?? "Odkaz není dostupný.");
      }
    } catch {
      setError("Chyba připojení.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-xl bg-[#f3fbdc] border border-[#d0ec78] p-6 text-center">
      <p className="text-[#111] font-semibold text-lg mb-1">
        ✅ Všechno schváleno! Obsah je připraven ke stažení.
      </p>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="mt-3 px-5 py-2 rounded-lg bg-[#111] text-white text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
      >
        {loading ? "Načítám…" : "Stáhnout obsah →"}
      </button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function RtgDashboardInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [pairs, setPairs] = useState<PostPair[]>([]);
  const [batchFullyApproved, setBatchFullyApproved] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setAuthError("Chybí přístupový odkaz.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/client/rtg/batches?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`
      );
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        batch?: Batch;
        posts?: Post[];
        project?: ProjectInfo;
      };

      if (!data.ok) {
        setAuthError(data.error ?? "Přístup odepřen.");
        return;
      }

      // Přesměruj na onboarding, pokud není dokončen
      if (data.project && !data.project.onboarding_completed) {
        router.replace(`/client/${code}/rtg/onboarding?token=${encodeURIComponent(token)}`);
        return;
      }

      setBatch(data.batch ?? null);
      const loadedPairs = groupToPairs(data.posts ?? []);
      setPairs(loadedPairs);

      if (data.batch && loadedPairs.length > 0) {
        const approvedCount = loadedPairs.filter(
          (p) => p.variantA?.status === "approved" || p.variantB?.status === "approved"
        ).length;
        setBatchFullyApproved(approvedCount === loadedPairs.length);
      }
    } catch {
      setAuthError("Nepodařilo se načíst obsah.");
    } finally {
      setLoading(false);
    }
  }, [code, token, router]);

  useEffect(() => { load(); }, [load]);

  function handleApproved(postId: string) {
    setPairs((prev) => {
      const updated = prev.map((pair) => ({
        ...pair,
        variantA:
          pair.variantA?.id === postId
            ? { ...pair.variantA, status: "approved" as PostStatus }
            : pair.variantA,
        variantB:
          pair.variantB?.id === postId
            ? { ...pair.variantB, status: "approved" as PostStatus }
            : pair.variantB,
      }));
      const approvedCount = updated.filter(
        (p) => p.variantA?.status === "approved" || p.variantB?.status === "approved"
      ).length;
      setBatchFullyApproved(approvedCount === updated.length && updated.length > 0);
      return updated;
    });
  }

  const approvedCount = pairs.filter(
    (p) => p.variantA?.status === "approved" || p.variantB?.status === "approved"
  ).length;

  // ── Loading ──────────────────────────────────────────────────────────────

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

  // ── Auth error ───────────────────────────────────────────────────────────

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-sm">
          <p className="text-[#1a1a1a] font-medium mb-2">Přístup odepřen</p>
          <p className="text-sm text-[#888]">{authError}</p>
        </div>
      </div>
    );
  }

  // ── Žádný batch ──────────────────────────────────────────────────────────

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-[#1a1a1a] font-semibold text-xl mb-2">Obsah se připravuje</p>
          <p className="text-sm text-[#888] leading-relaxed">
            Dostanete email jakmile bude váš první obsah hotový.
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8] mb-1">
            Aktuální týden
          </p>
          <h2 className="text-2xl font-semibold text-[#1a1a1a]">{batch.week_label}</h2>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-sm text-[#888]">
            {approvedCount} / {pairs.length} schváleno
          </span>
          <div className="h-1 w-36 bg-[#e8e8e4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d0ec78] rounded-full transition-all duration-500"
              style={{
                width: pairs.length ? `${(approvedCount / pairs.length) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Páry */}
      <div className="flex flex-col gap-10">
        {pairs.map((pair) => (
          <div
            key={pair.pairIndex}
            className="border-b border-[#e8e8e4] pb-10 last:border-0 last:pb-0"
          >
            <PairRow
              pair={pair}
              code={code}
              token={token}
              onApproved={handleApproved}
            />
          </div>
        ))}
      </div>

      {/* Vše schváleno banner */}
      {batchFullyApproved && batch && (
        <DownloadBanner batchId={batch.id} code={code} token={token} />
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
