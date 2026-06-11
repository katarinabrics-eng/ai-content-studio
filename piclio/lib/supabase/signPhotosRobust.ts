/**
 * Robust signed URL generation for photos.
 *
 * Strategy:
 * 1. Batch-sign all storage_path values (fast, one request)
 * 2. For any index that got null, retry individually
 * 3. If still null and photo has an original_path different from storage_path,
 *    try signing original_path as a final fallback
 * 4. Append &t=<timestamp> cache-buster to every URL
 */

import { supabaseAdmin } from './admin'

export async function signPhotosRobust(
  photos: any[],
  expiresIn: number,
): Promise<any[]> {
  if (photos.length === 0) return []

  const paths = photos.map(p => p.storage_path)
  const ts = Date.now()

  // 1. Batch attempt
  let signedUrls: ({ signedUrl: string | null } | null)[]
  try {
    const { data } = await supabaseAdmin.storage
      .from('photos')
      .createSignedUrls(paths, expiresIn)
    signedUrls = data ?? paths.map(() => null)
  } catch {
    signedUrls = paths.map(() => null)
  }

  // 2. Individual retry + original_path fallback for any missing URL
  if (signedUrls.some(s => !s?.signedUrl)) {
    signedUrls = await Promise.all(
      paths.map(async (path, i) => {
        if (signedUrls[i]?.signedUrl) return signedUrls[i]

        // Individual retry on storage_path
        try {
          const { data } = await supabaseAdmin.storage
            .from('photos')
            .createSignedUrl(path, expiresIn)
          if (data?.signedUrl) return { signedUrl: data.signedUrl }
        } catch {}

        // original_path fallback
        const originalPath = photos[i]?.original_path
        if (originalPath && originalPath !== path) {
          try {
            const { data } = await supabaseAdmin.storage
              .from('photos')
              .createSignedUrl(originalPath, expiresIn)
            if (data?.signedUrl) return { signedUrl: data.signedUrl }
          } catch {}
        }

        return { signedUrl: null }
      }),
    )
  }

  return photos.map((p, i) => {
    const raw = signedUrls[i]?.signedUrl ?? ''
    return { ...p, url: raw ? `${raw}&t=${ts}` : '' }
  })
}
