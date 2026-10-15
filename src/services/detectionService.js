/**
 * detectionService.js
 *
 * Client-side façade for the YOLO11 + GLM-4.5V detection pipeline.
 *
 * All 13 detection categories:
 *   pothole | road_crack | waterlogging | pedestrian | car | bus | bike |
 *   traffic_congestion | illegal_parking | debris | garbage |
 *   damaged_sign | streetlight_failure
 *
 * Usage:
 *   import { runDetection, fileToBase64, DETECTION_CATEGORIES } from './detectionService';
 *   const report = await runDetection({ file, busId, lat, lng, locationName });
 */

import { analyzeImageWithGLM } from './glmService';

/* ── category registry ─────────────────────────────────────────────── */

/** @type {Record<string, DetectionCategory>} */
export const DETECTION_CATEGORIES = {
  pothole: {
    key:             'pothole',
    label:           'Pothole / Surface Fracture',
    category:        'Road Surface',
    dept:            'RNB',
    deptName:        'Roads & Buildings Dept (R&B)',
    defaultSeverity: 'Critical',
    color:           '#f97316',        // orange
    bgClass:         'bg-orange-100 text-orange-700 border-orange-300',
    icon:            'AlertTriangle',
    sla:             '24 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
  },
  road_crack: {
    key:             'road_crack',
    label:           'Road Crack / Pavement Damage',
    category:        'Road Surface',
    dept:            'RNB',
    deptName:        'Roads & Buildings Dept (R&B)',
    defaultSeverity: 'High',
    color:           '#ef4444',        // red
    bgClass:         'bg-red-100 text-red-700 border-red-300',
    icon:            'Minus',
    sla:             '48 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
  },
  waterlogging: {
    key:             'waterlogging',
    label:           'Waterlogging / Storm Drain Overflow',
    category:        'Drainage',
    dept:            'UEED',
    deptName:        'Urban Environmental Eng (UEED)',
    defaultSeverity: 'High',
    color:           '#3b82f6',        // blue
    bgClass:         'bg-blue-100 text-blue-700 border-blue-300',
    icon:            'Droplets',
    sla:             '6 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  pedestrian: {
    key:             'pedestrian',
    label:           'Pedestrian Obstruction / Crowding',
    category:        'Traffic Safety',
    dept:            'TRAFFIC',
    deptName:        'J&K Traffic Police',
    defaultSeverity: 'Medium',
    color:           '#8b5cf6',        // violet
    bgClass:         'bg-violet-100 text-violet-700 border-violet-300',
    icon:            'User',
    sla:             '2 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  car: {
    key:             'car',
    label:           'Unauthorized / Stopped Vehicle',
    category:        'Traffic',
    dept:            'TRAFFIC',
    deptName:        'J&K Traffic Police',
    defaultSeverity: 'Low',
    color:           '#6366f1',        // indigo
    bgClass:         'bg-indigo-100 text-indigo-700 border-indigo-300',
    icon:            'Car',
    sla:             '1 Hour',
    imageUrl:        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  bus: {
    key:             'bus',
    label:           'Bus / Commercial Transport',
    category:        'Traffic',
    dept:            'TRAFFIC',
    deptName:        'J&K Traffic Police',
    defaultSeverity: 'Low',
    color:           '#0ea5e9',        // sky
    bgClass:         'bg-sky-100 text-sky-700 border-sky-300',
    icon:            'Bus',
    sla:             '1 Hour',
    imageUrl:        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  bike: {
    key:             'bike',
    label:           'Motorcycle / Two-Wheeler Violation',
    category:        'Traffic',
    dept:            'TRAFFIC',
    deptName:        'J&K Traffic Police',
    defaultSeverity: 'Low',
    color:           '#14b8a6',        // teal
    bgClass:         'bg-teal-100 text-teal-700 border-teal-300',
    icon:            'Bike',
    sla:             '1 Hour',
    imageUrl:        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  traffic_congestion: {
    key:             'traffic_congestion',
    label:           'Traffic Congestion Hotspot',
    category:        'Traffic Management',
    dept:            'TRAFFIC',
    deptName:        'J&K Traffic Police',
    defaultSeverity: 'High',
    color:           '#f59e0b',        // amber
    bgClass:         'bg-amber-100 text-amber-700 border-amber-300',
    icon:            'AlertOctagon',
    sla:             '30 Minutes',
    imageUrl:        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  illegal_parking: {
    key:             'illegal_parking',
    label:           'Illegal Parking / Double Parking',
    category:        'Traffic Violation',
    dept:            'TRAFFIC',
    deptName:        'J&K Traffic Police',
    defaultSeverity: 'Medium',
    color:           '#a855f7',        // purple
    bgClass:         'bg-purple-100 text-purple-700 border-purple-300',
    icon:            'ParkingCircleOff',
    sla:             '2 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  debris: {
    key:             'debris',
    label:           'Road Debris / Construction Waste',
    category:        'Obstruction',
    dept:            'SMC',
    deptName:        'Srinagar Municipal Corp (SMC)',
    defaultSeverity: 'High',
    color:           '#78716c',        // stone
    bgClass:         'bg-stone-100 text-stone-700 border-stone-300',
    icon:            'Box',
    sla:             '4 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
  },
  garbage: {
    key:             'garbage',
    label:           'Uncollected Garbage / Solid Waste',
    category:        'Sanitation',
    dept:            'SMC',
    deptName:        'Srinagar Municipal Corp (SMC)',
    defaultSeverity: 'Medium',
    color:           '#22c55e',        // green
    bgClass:         'bg-green-100 text-green-700 border-green-300',
    icon:            'Trash2',
    sla:             '12 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
  },
  damaged_sign: {
    key:             'damaged_sign',
    label:           'Damaged / Missing Road Sign',
    category:        'Traffic Infrastructure',
    dept:            'TRAFFIC',
    deptName:        'J&K Traffic Police',
    defaultSeverity: 'Medium',
    color:           '#ec4899',        // pink
    bgClass:         'bg-pink-100 text-pink-700 border-pink-300',
    icon:            'Octagon',
    sla:             '48 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
  },
  streetlight_failure: {
    key:             'streetlight_failure',
    label:           'Streetlight Failure / Dark Zone',
    category:        'Electrical',
    dept:            'PDD',
    deptName:        'Power Development Dept (PDD)',
    defaultSeverity: 'Low',
    color:           '#eab308',        // yellow
    bgClass:         'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon:            'ZapOff',
    sla:             '72 Hours',
    imageUrl:        'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
  },
};

export const CATEGORY_KEYS = Object.keys(DETECTION_CATEGORIES);

/* ── public functions ──────────────────────────────────────────────── */

/**
 * Convert a File / Blob object to a raw base64 string (no data-URI prefix).
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]); // strip "data:...;base64,"
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Run the full detection pipeline (YOLO11 → GLM-4.5V) on a File object or
 * a raw base64 string.
 *
 * @param {Object}      opts
 * @param {File|null}   opts.file          — browser File object (preferred)
 * @param {string|null} opts.imageBase64   — raw base64 fallback when file unavailable
 * @param {string}      [opts.busId]
 * @param {number}      [opts.lat]
 * @param {number}      [opts.lng]
 * @param {string}      [opts.locationName]
 * @returns {Promise<DetectionReport>}
 */
export async function runDetection({ file, imageBase64, busId, lat, lng, locationName }) {
  const b64      = imageBase64 ?? (file ? await fileToBase64(file) : null);
  const filename = file?.name ?? 'upload.jpg';

  const report = await analyzeImageWithGLM({
    imageBase64: b64,
    filename,
    busId,
    lat,
    lng,
    locationName,
  });

  // Enrich each detection with category metadata from our registry
  const enriched = (report.detections ?? []).map(d => ({
    ...d,
    ...(DETECTION_CATEGORIES[d.category] ?? DETECTION_CATEGORIES.road_crack),
    // keep server-provided values for these
    confidence: d.confidence,
    box:        d.box,
    id:         d.id,
  }));

  return { ...report, detections: enriched };
}

/**
 * Get the category metadata for a YOLO category key.
 * Falls back to `road_crack` for unknown keys.
 * @param {string} key
 * @returns {DetectionCategory}
 */
export function getCategoryMeta(key) {
  return DETECTION_CATEGORIES[key] ?? DETECTION_CATEGORIES.road_crack;
}

/**
 * Build a bounding-box style object suitable for CSS positioning.
 * Accepts percentage strings ("35%") or 0-1 fractions.
 * @param {object} raw
 * @returns {{ top:string, left:string, width:string, height:string }}
 */
export function normalizeBox(raw = {}) {
  const p = v => {
    if (typeof v === 'string' && v.endsWith('%')) return v;
    const n = Number(v);
    return `${Math.round((n <= 1 ? n * 100 : n))}%`;
  };
  return {
    top:    p(raw.top    ?? 0.3),
    left:   p(raw.left   ?? 0.25),
    width:  p(raw.width  ?? 0.4),
    height: p(raw.height ?? 0.35),
  };
}

/* ── JSDoc typedefs ──────────────────────────────────────────────────── */
/**
 * @typedef {Object} DetectionCategory
 * @property {string} key
 * @property {string} label
 * @property {string} category
 * @property {string} dept
 * @property {string} deptName
 * @property {string} defaultSeverity
 * @property {string} color
 * @property {string} bgClass
 * @property {string} icon
 * @property {string} sla
 * @property {string} imageUrl
 */

/**
 * @typedef {Object} DetectionReport
 * @property {string}   id
 * @property {string}   timestamp
 * @property {string}   model
 * @property {string}   busId
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {string}   locationName
 * @property {object[]} detections
 * @property {object}   classification
 * @property {number}   totalDetected
 */
