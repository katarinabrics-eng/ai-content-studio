// RTG (Ready to Go) database types
// content_batches + content_posts (RTG-extended fields)

export type ContentBatchStatus = "pending" | "partial" | "approved";

export type ContentBatchRow = {
  id: string;
  project_id: string;
  week_start: string;
  week_label: string;
  status: ContentBatchStatus;
  created_at: string;
  updated_at: string;
};

export type ContentPostVariant = "A" | "B";
export type ContentPostType = "VIDEO" | "GRAFIKA";
export type RtgPostStatus = "client_review" | "approved";

export type ContentPostRow = {
  id: string;
  project_id: string;
  batch_id: string;
  pair_index: number;
  variant: ContentPostVariant;
  type: ContentPostType | null;
  hook: string | null;
  body: string | null;
  thumbnail_url: string | null;
  status: RtgPostStatus;
  client_approved_at: string | null;
  client_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentPostPair = {
  pairIndex: number;
  variantA: ContentPostRow | null;
  variantB: ContentPostRow | null;
};

export function groupPostsToPairs(posts: ContentPostRow[]): ContentPostPair[] {
  const map = new Map<number, ContentPostPair>();
  for (const post of posts) {
    const idx = post.pair_index;
    if (!map.has(idx)) {
      map.set(idx, { pairIndex: idx, variantA: null, variantB: null });
    }
    const pair = map.get(idx)!;
    if (post.variant === "A") pair.variantA = post;
    else if (post.variant === "B") pair.variantB = post;
  }
  return Array.from(map.values()).sort((a, b) => a.pairIndex - b.pairIndex);
}
