// Higgsfield API wrapper
const HIGGSFIELD_BASE = 'https://platform.higgsfield.ai'
const HIGGSFIELD_API_KEY = process.env.HIGGSFIELD_API_KEY!

export const HIGGSFIELD_MODELS = {
  IMAGE_TO_VIDEO_STANDARD: 'higgsfield-ai/dop/standard',
  IMAGE_TO_VIDEO_PREVIEW:  'higgsfield-ai/dop/preview',
  IMAGE_TO_VIDEO_KLING:    'kling-video/v2.1/pro/image-to-video',
  IMAGE_TO_VIDEO_SEEDANCE: 'bytedance/seedance/v1/pro/image-to-video',
  TEXT_TO_IMAGE_SOUL:      'higgsfield-ai/soul/standard',
  TEXT_TO_IMAGE_REVE:      'reve/text-to-image',
  TEXT_TO_IMAGE_SEEDREAM:  'bytedance/seedream/v4/edit',
} as const

export type HiggsfieldModel = typeof HIGGSFIELD_MODELS[keyof typeof HIGGSFIELD_MODELS]
export type HiggsfieldStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw'

export interface HiggsfieldQueuedResponse {
  status: 'queued'
  request_id: string
  status_url: string
  cancel_url: string
}

export interface HiggsfieldCompletedResponse {
  status: 'completed'
  request_id: string
  status_url: string
  cancel_url: string
  video?: { url: string }
  images?: { url: string }[]
}

export interface HiggsfieldFailedResponse {
  status: 'failed' | 'nsfw'
  request_id: string
  error?: string
}

export type HiggsfieldStatusResponse =
  | HiggsfieldQueuedResponse
  | HiggsfieldCompletedResponse
  | HiggsfieldFailedResponse

export async function submitHiggsfieldRequest(
  model: HiggsfieldModel,
  payload: Record<string, unknown>,
  webhookUrl?: string
): Promise<HiggsfieldQueuedResponse> {
  const url = webhookUrl
    ? `${HIGGSFIELD_BASE}/${model}?hf_webhook=${encodeURIComponent(webhookUrl)}`
    : `${HIGGSFIELD_BASE}/${model}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${HIGGSFIELD_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Higgsfield submit failed (${res.status}): ${err}`)
  }
  return res.json()
}

export async function checkHiggsfieldStatus(
  requestId: string
): Promise<HiggsfieldStatusResponse> {
  const res = await fetch(
    `${HIGGSFIELD_BASE}/requests/${requestId}/status`,
    { headers: { 'Authorization': `Key ${HIGGSFIELD_API_KEY}` } }
  )
  if (!res.ok) throw new Error(`Status check failed (${res.status})`)
  return res.json()
}

export async function generateVideoFromImage(options: {
  imageUrl: string
  prompt: string
  duration?: number
  model?: HiggsfieldModel
  webhookUrl?: string
}): Promise<HiggsfieldQueuedResponse> {
  const { imageUrl, prompt, duration = 5, model = HIGGSFIELD_MODELS.IMAGE_TO_VIDEO_KLING, webhookUrl } = options
  return submitHiggsfieldRequest(model, { image_url: imageUrl, prompt, duration }, webhookUrl)
}

export async function generateImageFromText(options: {
  prompt: string
  aspectRatio?: '1:1' | '16:9' | '4:5' | '9:16'
  resolution?: '720p' | '1080p'
  model?: HiggsfieldModel
  webhookUrl?: string
}): Promise<HiggsfieldQueuedResponse> {
  const { prompt, aspectRatio = '1:1', resolution = '720p', model = HIGGSFIELD_MODELS.TEXT_TO_IMAGE_SOUL, webhookUrl } = options
  return submitHiggsfieldRequest(model, { prompt, aspect_ratio: aspectRatio, resolution }, webhookUrl)
}

export function isHiggsfieldCompleted(
  payload: HiggsfieldStatusResponse
): payload is HiggsfieldCompletedResponse {
  return payload.status === 'completed'
}

export function parseHiggsfieldWebhook(body: unknown): HiggsfieldStatusResponse {
  if (!body || typeof body !== 'object') throw new Error('Invalid webhook payload')
  return body as HiggsfieldStatusResponse
}
