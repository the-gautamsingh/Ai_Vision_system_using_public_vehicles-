/**
 * glmService.js
 * Client-side wrapper for GLM-4.5V (ZhipuAI) via the FleetVision proxy server.
 *
 * Supports:
 *  - Standard text chat  → predictWithGLM()
 *  - Vision + text       → analyzeImageWithGLM()
 *  - Fake streaming UI   → streamGLMResponse()
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/* ── types ───────────────────────────────────────────────────────────── */
/**
 * @typedef {Object} GLMRequest
 * @property {string} prompt
 * @property {string} [systemPrompt]
 */

/**
 * @typedef {Object} AnalyzeRequest
 * @property {string}  imageBase64   — raw base64, no data-URI prefix
 * @property {string}  [filename]
 * @property {string}  [busId]
 * @property {number}  [lat]
 * @property {number}  [lng]
 * @property {string}  [locationName]
 */

/* ── helpers ─────────────────────────────────────────────────────────── */
async function post(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `Request to ${endpoint} failed (${res.status})`);
  return payload;
}

/* ── public API ──────────────────────────────────────────────────────── */

/**
 * Send a text question to GLM-4.5V and receive a string response.
 *
 * @param {GLMRequest} options
 * @returns {Promise<string>}
 */
export async function predictWithGLM({ prompt, systemPrompt }) {
  const payload = await post('/api/assistant', { prompt, systemPrompt });
  return payload.text ?? '';
}

/**
 * Send a base64 image + context to the full YOLO11 + GLM-4.5V pipeline.
 * Returns a structured detection report.
 *
 * @param {AnalyzeRequest} options
 * @returns {Promise<import('./detectionService').DetectionReport>}
 */
export async function analyzeImageWithGLM({ imageBase64, filename, busId, lat, lng, locationName }) {
  return post('/api/analyze', { imageBase64, filename, busId, lat, lng, locationName });
}

/**
 * Fake streaming: calls GLM-4.5V then feeds the response word-by-word to
 * a callback so the UI can render a typewriter effect without a real SSE stream.
 *
 * @param {GLMRequest}                  options
 * @param {(partial: string) => void}   onChunk   — called with growing text
 * @param {() => void}                  [onDone]  — called when finished
 * @returns {Promise<void>}
 */
export async function streamGLMResponse({ prompt, systemPrompt }, onChunk, onDone) {
  const fullText = await predictWithGLM({ prompt, systemPrompt });
  const words    = fullText.split(' ');
  let   built    = '';

  for (const word of words) {
    built += (built ? ' ' : '') + word;
    onChunk(built);
    // Small delay per word to simulate token streaming (12–25 ms)
    await new Promise(r => setTimeout(r, 12 + Math.random() * 13));
  }

  onDone?.();
}

/**
 * Model info — kept in sync with server/.env.example defaults.
 */
export const GLM_MODEL_INFO = {
  name:        'GLM-4.5V',
  provider:    'ZhipuAI',
  apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  vision:      true,
  jsonMode:    true,
  contextWindow: 128_000,
};
