/**
 * FleetVision-AI  —  Backend API Server
 *
 * Endpoints
 *   POST /api/assistant   → GLM-4.5V (glm-4.5v) LLM chat
 *   POST /api/analyze     → YOLO11 object detection + GLM-4.5V classification
 *   POST /api/reports     → Webhook delivery to authority / admin
 *
 * All 13 YOLO11 detection categories supported:
 *   pothole, road_crack, waterlogging, pedestrian, car, bus, bike,
 *   traffic_congestion, illegal_parking, debris, garbage,
 *   damaged_sign, streetlight_failure
 */

import http from 'node:http';
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ── env loader ─────────────────────────────────────────────────────── */
const root    = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
}

/* ── constants ──────────────────────────────────────────────────────── */
const GLM_API_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const GLM_MODEL   = process.env.GLM_MODEL   || 'glm-4.5v';          // GLM-4.5V (vision)
const GLM_KEY     = process.env.GLM_API_KEY || '';
const YOLO_URL    = process.env.YOLO_API_URL || '';
const YOLO_KEY    = process.env.YOLO_API_KEY || '';

/** All 13 YOLO11 detection categories */
const CATEGORIES = [
  'pothole',
  'road_crack',
  'waterlogging',
  'pedestrian',
  'car',
  'bus',
  'bike',
  'traffic_congestion',
  'illegal_parking',
  'debris',
  'garbage',
  'damaged_sign',
  'streetlight_failure',
];

/** Category → civic authority mapping */
const AUTHORITY_MAP = {
  pothole:              'RNB',
  road_crack:           'RNB',
  waterlogging:         'UEED',
  pedestrian:           'TRAFFIC',
  car:                  'TRAFFIC',
  bus:                  'TRAFFIC',
  bike:                 'TRAFFIC',
  traffic_congestion:   'TRAFFIC',
  illegal_parking:      'TRAFFIC',
  debris:               'SMC',
  garbage:              'SMC',
  damaged_sign:         'TRAFFIC',
  streetlight_failure:  'PDD',
};

/** Category → default severity */
const SEVERITY_MAP = {
  pothole:              'Critical',
  road_crack:           'High',
  waterlogging:         'High',
  pedestrian:           'Medium',
  car:                  'Low',
  bus:                  'Low',
  bike:                 'Low',
  traffic_congestion:   'High',
  illegal_parking:      'Medium',
  debris:               'High',
  garbage:              'Medium',
  damaged_sign:         'Medium',
  streetlight_failure:  'Low',
};

/** Human-readable labels */
const LABEL_MAP = {
  pothole:              'Pothole / Surface Fracture',
  road_crack:           'Road Crack / Pavement Damage',
  waterlogging:         'Waterlogging / Storm Drain Overflow',
  pedestrian:           'Pedestrian Obstruction',
  car:                  'Unauthorized Vehicle',
  bus:                  'Bus / Commercial Vehicle',
  bike:                 'Motorcycle / Two-Wheeler',
  traffic_congestion:   'Traffic Congestion Hotspot',
  illegal_parking:      'Illegal Parking / Double Parking',
  debris:               'Road Debris / Construction Waste',
  garbage:              'Uncollected Garbage / Solid Waste',
  damaged_sign:         'Damaged / Missing Road Sign',
  streetlight_failure:  'Streetlight Failure / Dark Zone',
};

/* ── helpers ────────────────────────────────────────────────────────── */
const json = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(data));
};

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > 20_000_000) req.destroy(); // 20 MB limit
  });
  req.on('end', () => {
    try { resolve(JSON.parse(raw || '{}')); }
    catch (e) { reject(new Error('Invalid JSON body')); }
  });
  req.on('error', reject);
});

/* ── GLM-4.5V call ──────────────────────────────────────────────────── */
/**
 * Call GLM-4.5V (ZhipuAI) with optional image for vision tasks.
 * @param {Array<{role:string,content:string}>} messages
 * @param {string|null} imageBase64   — raw base64, no data-URI prefix
 * @param {boolean} jsonMode          — request JSON output
 */
async function callGLM(messages, imageBase64 = null, jsonMode = false) {
  if (!GLM_KEY) return null;

  // Build message content — multimodal when image provided
  const userContent = imageBase64
    ? [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        { type: 'text',      text: messages.map(m => m.content).join('\n\n') },
      ]
    : messages.map(m => m.content).join('\n\n');

  const payload = {
    model:       GLM_MODEL,
    temperature: 0.15,
    messages: [
      { role: 'user', content: userContent },
    ],
  };

  // GLM-4.5V supports response_format for JSON mode
  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch(GLM_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GLM_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `GLM request failed (${res.status})`);
  return data.choices?.[0]?.message?.content ?? null;
}

/* ── YOLO11 detection ───────────────────────────────────────────────── */
/**
 * Run YOLO11 inference. Falls back to structured demo data when no endpoint
 * is configured (presentation-safe mode).
 */
async function runYOLO11(imageBase64, filename = 'upload.jpg') {
  if (!YOLO_URL) {
    // ── Demo / offline mode: return realistic multi-category detections ──
    return generateDemoDetections();
  }

  const res = await fetch(YOLO_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(YOLO_KEY ? { Authorization: `Bearer ${YOLO_KEY}` } : {}),
    },
    body: JSON.stringify({ imageBase64, filename }),
  });

  if (!res.ok) throw new Error(`YOLO11 request failed (${res.status})`);
  const payload = await res.json();

  // Normalize — accept { detections:[...] } or [...]
  const raw = Array.isArray(payload) ? payload : (payload.detections || []);
  return normalizeDetections(raw);
}

/** Normalize raw YOLO detections to our internal schema */
function normalizeDetections(raw) {
  return raw.map((d, i) => {
    const category = CATEGORIES.includes(d.category) ? d.category : 'road_crack';
    return {
      id:         `DET-${Date.now()}-${i}`,
      category,
      label:      LABEL_MAP[category],
      confidence: Math.round((d.confidence ?? d.score ?? 0.9) * 100) / 100,
      authority:  AUTHORITY_MAP[category],
      severity:   SEVERITY_MAP[category],
      box: normalizeBox(d.box ?? d.bbox ?? d.bounding_box ?? {}),
    };
  });
}

/** Accept absolute pixel coords or percentage strings */
function normalizeBox(raw) {
  const pct = v => typeof v === 'string' && v.endsWith('%') ? v : `${Math.round(Number(v) * 100)}%`;
  // If values look like fractions (0–1) treat as percentages
  if (typeof raw.top === 'number' && raw.top <= 1) {
    return {
      top:    pct(raw.top),
      left:   pct(raw.left ?? raw.x ?? 0),
      width:  pct(raw.width ?? (raw.x2 - raw.x ?? 0.4)),
      height: pct(raw.height ?? (raw.y2 - raw.y ?? 0.35)),
    };
  }
  return {
    top:    raw.top    ?? '30%',
    left:   raw.left   ?? '25%',
    width:  raw.width  ?? '40%',
    height: raw.height ?? '35%',
  };
}

/** Realistic demo detections covering multiple categories */
function generateDemoDetections() {
  const picks = [
    { category: 'pothole',           confidence: 0.97, box: { top: '35%', left: '25%', width: '40%', height: '30%' } },
    { category: 'waterlogging',      confidence: 0.93, box: { top: '55%', left: '10%', width: '55%', height: '30%' } },
    { category: 'illegal_parking',   confidence: 0.91, box: { top: '25%', left: '55%', width: '35%', height: '45%' } },
    { category: 'garbage',           confidence: 0.89, box: { top: '60%', left: '65%', width: '30%', height: '28%' } },
    { category: 'road_crack',        confidence: 0.95, box: { top: '42%', left: '20%', width: '50%', height: '20%' } },
    { category: 'traffic_congestion',confidence: 0.88, box: { top: '15%', left: '30%', width: '60%', height: '40%' } },
    { category: 'damaged_sign',      confidence: 0.86, box: { top: '10%', left: '60%', width: '25%', height: '38%' } },
    { category: 'streetlight_failure',confidence:0.84, box: { top: '5%',  left: '75%', width: '18%', height: '55%' } },
    { category: 'debris',            confidence: 0.92, box: { top: '68%', left: '15%', width: '42%', height: '22%' } },
  ];

  // Pick 2-4 random categories per image for variety
  const count = 2 + Math.floor(Math.random() * 3);
  const shuffled = picks.sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((d, i) => ({
    id:        `DET-DEMO-${Date.now()}-${i}`,
    category:   d.category,
    label:      LABEL_MAP[d.category],
    confidence: d.confidence,
    authority:  AUTHORITY_MAP[d.category],
    severity:   SEVERITY_MAP[d.category],
    box:        d.box,
  }));
}

/* ── Analyze endpoint ───────────────────────────────────────────────── */
async function handleAnalyze(input) {
  const { imageBase64, filename, busId, lat, lng, locationName } = input;

  // 1. Run YOLO11
  const detections = await runYOLO11(imageBase64, filename);

  // 2. GLM-4.5V classification — multimodal (image + YOLO context)
  const glmPrompt = [
    {
      content: `You are FleetVision-AI's urban infrastructure analyst for Srinagar, India.
YOLO11 has detected the following objects in the attached road image:
${JSON.stringify(detections.map(d => ({ category: d.category, label: d.label, confidence: d.confidence, severity: d.severity })), null, 2)}

Bus capturing: ${busId ?? 'Unknown'}
Location: ${locationName ?? 'Srinagar road network'}  GPS: ${lat ?? '?'}, ${lng ?? '?'}

Respond with a JSON object (no markdown) containing:
{
  "title": "Short human-readable issue title",
  "summary": "2-3 sentence situation summary for the operator dashboard",
  "severity": "Critical | High | Medium | Low",
  "primaryCategory": "<one of the YOLO categories above>",
  "authority": "RNB | SMC | TRAFFIC | UEED | PDD",
  "recommendedAction": "Specific actionable instruction for the dispatch team",
  "priorityScore": 0-100,
  "estimatedRepairTime": "e.g. 4-6 hours"
}`,
    },
  ];

  let classification;
  try {
    const raw = await callGLM(glmPrompt, imageBase64 ?? null, true);
    if (raw) {
      // Strip possible markdown code fences
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      classification = JSON.parse(cleaned);
    }
  } catch (err) {
    console.warn('[GLM classification parse error]', err.message);
  }

  // Fallback classification when GLM is not configured or parse fails
  if (!classification) {
    const top = detections[0] ?? { category: 'pothole', label: 'Road Hazard', severity: 'High', authority: 'RNB' };
    classification = {
      title:               `${top.label} Detected on Srinagar Road`,
      summary:             `YOLO11 identified ${detections.length} issue(s). Primary detection: ${top.label} with ${Math.round((top.confidence ?? 0.9) * 100)}% confidence. Immediate civic response recommended.`,
      severity:            top.severity,
      primaryCategory:     top.category,
      authority:           top.authority,
      recommendedAction:   `Dispatch ${AUTHORITY_MAP[top.category] ?? 'SMC'} team to inspect and remediate. Mark location with safety cones.`,
      priorityScore:       top.severity === 'Critical' ? 92 : top.severity === 'High' ? 74 : 50,
      estimatedRepairTime: '4-8 hours',
    };
  }

  const report = {
    id:             `DET-${Date.now()}`,
    timestamp:      new Date().toISOString(),
    model:          `YOLO11 + ${GLM_MODEL}`,
    busId:          busId ?? 'SCANNER',
    lat:            lat ?? null,
    lng:            lng ?? null,
    locationName:   locationName ?? 'Srinagar, J&K',
    detections,
    classification,
    totalDetected:  detections.length,
  };

  return report;
}

/* ── HTTP server ────────────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') return json(res, 204, {});

  try {
    /* ─ POST /api/assistant ─── GLM-4.5V chat ─────────────────────── */
    if (req.method === 'POST' && req.url === '/api/assistant') {
      const input = await readBody(req);

      const systemContent = input.systemPrompt
        ? `${input.systemPrompt}\n\nOperator question: ${input.prompt}`
        : `You are FleetVision-AI, the urban operations analyst for Srinagar Municipal Corporation's smart bus fleet. Answer concisely and practically.\n\nOperator question: ${input.prompt}`;

      const text = await callGLM([{ content: systemContent }]);
      return json(res, 200, {
        text: text ?? 'Demo mode: GLM is not configured. Add GLM_API_KEY to server/.env to enable live AI responses.',
        model: GLM_MODEL,
      });
    }

    /* ─ POST /api/analyze ─── YOLO11 + GLM vision ──────────────────── */
    if (req.method === 'POST' && req.url === '/api/analyze') {
      const input  = await readBody(req);
      const report = await handleAnalyze(input);
      return json(res, 200, report);
    }

    /* ─ POST /api/reports ─── Webhook delivery ─────────────────────── */
    if (req.method === 'POST' && req.url === '/api/reports') {
      const report  = await readBody(req);
      const targets = [
        { name: 'authority', url: process.env.AUTHORITY_REPORT_WEBHOOK },
        { name: 'admin',     url: process.env.ADMIN_REPORT_WEBHOOK },
      ];
      const delivery = await Promise.all(
        targets.filter(t => t.url).map(async t => {
          const r = await fetch(t.url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(report),
          });
          return { target: t.name, delivered: r.ok, status: r.status };
        })
      );
      return json(res, 200, { ...report, delivery });
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('[Server error]', err);
    json(res, 500, { error: err.message ?? 'Internal server error' });
  }
});

const PORT = Number(process.env.PORT ?? 8787);
server.listen(PORT, () => {
  console.log(`\n🚌 FleetVision-AI API Server`);
  console.log(`   Listening on port ${PORT}`);
  console.log(`   LLM model : ${GLM_MODEL} (${GLM_KEY ? '✓ key configured' : '✗ no key — demo mode'})`);
  console.log(`   YOLO11    : ${YOLO_URL ? '✓ endpoint configured' : '✗ no endpoint — demo detections'}`);
  console.log(`   Categories: ${CATEGORIES.length} (${CATEGORIES.join(', ')})\n`);
});
