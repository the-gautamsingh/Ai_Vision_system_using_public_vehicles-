/**
 * LiveUploadDetectionView.jsx
 *
 * Full YOLO11 + GLM-4.5V detection pipeline UI.
 * • Upload any image / video file  OR  pick one of 13 preset categories
 * • Calls /api/analyze → YOLO11 detection + GLM-4.5V classification
 * • Renders ALL detected bounding boxes (rectangle or circle mode)
 * • Shows per-detection category chip, confidence, dept badge
 * • Dispatch incident ticket for any detected item
 */

import React, { useState, useRef, useCallback } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { SeverityBadge, DepartmentBadge } from '../common/BadgesAndCards';
import { runDetection, fileToBase64, DETECTION_CATEGORIES, normalizeBox } from '../../services/detectionService';
import {
  UploadCloud, Cpu, Square, Circle, Sliders, MapPin, ShieldAlert,
  CheckCircle2, Sparkles, AlertTriangle, Loader2, X, ChevronDown,
  Eye, Layers, Info, ZapOff, Trash2, Droplets, Car, Box, User,
  AlertOctagon, Bike, Bus, Minus, Octagon
} from 'lucide-react';

/* ── category icon map ─────────────────────────────────────────────── */
const CAT_ICONS = {
  pothole:             <AlertTriangle className="w-3.5 h-3.5" />,
  road_crack:          <Minus         className="w-3.5 h-3.5" />,
  waterlogging:        <Droplets      className="w-3.5 h-3.5" />,
  pedestrian:          <User          className="w-3.5 h-3.5" />,
  car:                 <Car           className="w-3.5 h-3.5" />,
  bus:                 <Bus           className="w-3.5 h-3.5" />,
  bike:                <Bike          className="w-3.5 h-3.5" />,
  traffic_congestion:  <AlertOctagon  className="w-3.5 h-3.5" />,
  illegal_parking:     <Car           className="w-3.5 h-3.5" />,
  debris:              <Box           className="w-3.5 h-3.5" />,
  garbage:             <Trash2        className="w-3.5 h-3.5" />,
  damaged_sign:        <Octagon       className="w-3.5 h-3.5" />,
  streetlight_failure: <ZapOff        className="w-3.5 h-3.5" />,
};

/* ── preset thumbnails (one per category) ──────────────────────────── */
const PRESETS = Object.values(DETECTION_CATEGORIES).map(c => ({
  key:      c.key,
  label:    c.label,
  imageUrl: c.imageUrl,
  dept:     c.dept,
  severity: c.defaultSeverity,
  color:    c.color,
  bgClass:  c.bgClass,
}));

/* ── bounding-box colours (cycle through palette) ──────────────────── */
const BOX_COLORS = [
  '#f97316', '#3b82f6', '#22c55e', '#a855f7',
  '#ef4444', '#f59e0b', '#14b8a6', '#ec4899',
  '#6366f1', '#0ea5e9', '#78716c', '#eab308', '#8b5cf6',
];

export const LiveUploadDetectionView = () => {
  const { addIncident, setSelectedIncidentId, buses } = useUrbanData();

  /* state */
  const [mediaPreview,   setMediaPreview]   = useState(null);   // { url, type:'image'|'video', file }
  const [isAnalyzing,    setIsAnalyzing]    = useState(false);
  const [report,         setReport]         = useState(null);   // DetectionReport from /api/analyze
  const [error,          setError]          = useState(null);
  const [boundingShape,  setBoundingShape]  = useState('rectangle');
  const [minConf,        setMinConf]        = useState(0.80);
  const [dispatchedIds,  setDispatchedIds]  = useState(new Set());
  const [activePreset,   setActivePreset]   = useState(null);   // preset key string
  const [showAllBoxes,   setShowAllBoxes]   = useState(true);
  const fileInputRef = useRef(null);

  /* ── handle file upload ────────────────────────────────────────────── */
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const url     = URL.createObjectURL(file);
    setMediaPreview({ url, type: isVideo ? 'video' : 'image', file });
    setReport(null);
    setError(null);
    setActivePreset(null);
    setDispatchedIds(new Set());
    await runAnalysis(file, null);
  }, []);

  /* ── handle preset click ───────────────────────────────────────────── */
  const handlePresetClick = useCallback(async (preset) => {
    setActivePreset(preset.key);
    setMediaPreview({ url: preset.imageUrl, type: 'image', file: null });
    setReport(null);
    setError(null);
    setDispatchedIds(new Set());
    // For presets we send the public URL as imageBase64 = null (server demo mode)
    await runAnalysis(null, preset.imageUrl);
  }, []);

  /* ── core analysis call ────────────────────────────────────────────── */
  const runAnalysis = useCallback(async (file, presetUrl) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      let result;
      if (file) {
        result = await runDetection({
          file,
          busId:        buses[0]?.id ?? 'SCANNER',
          lat:          34.0837,
          lng:          74.7973,
          locationName: 'Srinagar Mobile Sensing Feed (Uploaded Media)',
        });
      } else {
        // Preset — no real file, server goes into demo detection mode
        const res = await fetch('/api/analyze', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            imageBase64:  null,
            filename:     'preset.jpg',
            busId:        buses[0]?.id ?? 'SCANNER',
            locationName: 'Srinagar Preset Scene',
          }),
        });
        result = await res.json();
      }
      setReport(result);
    } catch (err) {
      setError(err.message ?? 'Analysis failed. Is the server running on port 8787?');
    } finally {
      setIsAnalyzing(false);
    }
  }, [buses]);

  /* ── dispatch one detection as incident ────────────────────────────── */
  const dispatchTicket = useCallback((det) => {
    if (dispatchedIds.has(det.id)) return;
    const incId = `INC-SRIN-${Math.floor(100 + Math.random() * 900)}`;
    const cat   = DETECTION_CATEGORIES[det.category] ?? DETECTION_CATEGORIES.road_crack;
    addIncident({
      id:           incId,
      detectionId:  det.id,
      title:        `${det.label ?? cat.label} — ${report?.locationName ?? 'Srinagar'}`,
      location:     report?.locationName ?? 'Srinagar, J&K',
      lat:          report?.lat  ?? 34.0837,
      lng:          report?.lng  ?? 74.7973,
      department:   det.authority ?? cat.dept,
      deptName:     cat.deptName,
      severity:     det.severity  ?? cat.defaultSeverity,
      status:       'Open',
      reportedByBus:report?.busId ?? 'LIVE-SCANNER',
      createdAt:    new Date().toISOString().replace('T', ' ').substring(0, 19),
      slaDeadline:  `${cat.sla} SLA`,
      assignedTeam: `${cat.dept} Rapid Dispatch Unit`,
      notes:        `YOLO11 + GLM-4.5V — ${Math.round((det.confidence ?? 0.9) * 100)}% confidence. ${report?.classification?.summary ?? ''}`,
    });
    setDispatchedIds(prev => new Set([...prev, det.id]));
    setSelectedIncidentId(incId);
  }, [dispatchedIds, report, addIncident, setSelectedIncidentId]);

  /* ── visible detections after confidence filter ─────────────────────── */
  const visibleDetections = (report?.detections ?? []).filter(d => (d.confidence ?? 0) >= minConf);

  /* ── ui ──────────────────────────────────────────────────────────────── */
  return (
    <div className="p-6 space-y-6 bg-slate-100 text-slate-800 min-h-full font-mono">

      {/* ── 1. Header ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-700 text-xs font-bold uppercase tracking-widest">
            <Cpu className="w-4 h-4 animate-pulse text-green-600" />
            YOLO11 + GLM-4.5V LIVE DETECTION SCANNER
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            AI Vision — Image &amp; Video Upload
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload road media or pick a preset → YOLO11 detects all 13 categories → GLM-4.5V classifies &amp; recommends action
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Shape toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { val: 'rectangle', icon: <Square className="w-3.5 h-3.5" />,  label: 'Box' },
              { val: 'circle',    icon: <Circle className="w-3.5 h-3.5" />,  label: 'Target' },
            ].map(s => (
              <button key={s.val} onClick={() => setBoundingShape(s.val)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  boundingShape === s.val
                    ? 'bg-white text-green-700 border border-green-200 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {s.icon}{s.label}
              </button>
            ))}
          </div>

          {/* Confidence slider */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Min Conf:</span>
            <span className="text-green-700 font-extrabold w-8">{Math.round(minConf * 100)}%</span>
            <input type="range" min="0.60" max="0.99" step="0.01"
              value={minConf} onChange={e => setMinConf(Number(e.target.value))}
              className="w-20 accent-green-600 cursor-pointer"
            />
          </div>

          {/* Show all boxes toggle */}
          <button onClick={() => setShowAllBoxes(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
              showAllBoxes
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {showAllBoxes ? 'Boxes ON' : 'Boxes OFF'}
          </button>
        </div>
      </div>

      {/* ── 2. Upload drop-zone ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4" />
            UPLOAD MEDIA OR SELECT PRESET
          </span>
          <span className="text-xs text-slate-400">Supports JPG, PNG, WEBP, MP4, WEBM</span>
        </div>

        <label
          className="flex flex-col items-center justify-center w-full h-28 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-green-500 hover:bg-green-50/30 rounded-xl cursor-pointer transition-all group"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-slate-700">
            Drag &amp; Drop or <span className="text-green-600 underline">Browse File</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">YOLO11 + GLM-4.5V will analyze immediately</p>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
        </label>

        {/* 13 preset category buttons */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            All 13 YOLO11 Detection Categories:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.key} onClick={() => handlePresetClick(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  activePreset === p.key
                    ? 'bg-green-100 border-green-400 text-green-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <span style={{ color: p.color }}>{CAT_ICONS[p.key]}</span>
                {p.label.split('/')[0].trim()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Analyzing spinner ──────────────────────────────────────── */}
      {isAnalyzing && (
        <div className="bg-white rounded-2xl border border-green-200 p-8 shadow-sm flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          <div className="text-center">
            <p className="font-bold text-slate-800">YOLO11 Running Inference…</p>
            <p className="text-xs text-slate-500 mt-1">GLM-4.5V classifying detected objects — please wait</p>
          </div>
          <div className="flex gap-2 text-xs font-mono text-slate-400">
            {['Object Detection', 'Bbox Normalisation', 'GLM-4.5V Classification', 'Report Generation'].map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" style={{ animationDelay: `${i * 200}ms` }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Error state ────────────────────────────────────────────── */}
      {error && !isAnalyzing && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <div>
            <strong>Analysis Error:</strong> {error}
            <p className="text-xs text-red-500 mt-0.5">Start the server: <code className="bg-red-100 px-1 rounded">npm run server</code> then try again.</p>
          </div>
        </div>
      )}

      {/* ── 5. Main results panel ─────────────────────────────────────── */}
      {report && !isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ─ Left: Image canvas with all bounding boxes ──────────────── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-600" />
                <span className="font-bold text-slate-800 text-sm">
                  YOLO11 Detection Canvas
                </span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold">
                  {visibleDetections.length} / {report.detections.length} detections ≥ {Math.round(minConf * 100)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{report.model}</span>
            </div>

            {/* Canvas */}
            <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {mediaPreview?.type === 'video' ? (
                <video src={mediaPreview.url} controls autoPlay loop className="w-full object-cover" />
              ) : (
                <img
                  src={mediaPreview?.url ?? report.detections[0]?.imageUrl}
                  alt="Detection canvas"
                  className="w-full object-cover"
                />
              )}

              {/* Render ALL bounding boxes */}
              {showAllBoxes && visibleDetections.map((det, idx) => {
                const box   = normalizeBox(det.box ?? {});
                const color = BOX_COLORS[idx % BOX_COLORS.length];
                const conf  = Math.round((det.confidence ?? 0.9) * 100);
                const label = det.label ?? det.category;

                return boundingShape === 'rectangle' ? (
                  <div key={det.id}
                    className="absolute pointer-events-none rounded-lg"
                    style={{
                      top: box.top, left: box.left, width: box.width, height: box.height,
                      border: `2.5px solid ${color}`,
                      backgroundColor: `${color}18`,
                    }}
                  >
                    <span className="absolute top-0 left-0 px-1.5 py-0.5 rounded text-[10px] font-black text-white font-mono"
                      style={{ backgroundColor: color }}
                    >
                      {label} {conf}%
                    </span>
                  </div>
                ) : (
                  /* circle / target mode */
                  <div key={det.id}
                    className="absolute pointer-events-none rounded-full flex items-center justify-center"
                    style={{
                      top: box.top, left: box.left, width: box.width, height: box.height,
                      border: `2.5px solid ${color}`,
                      backgroundColor: `${color}15`,
                    }}
                  >
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white font-mono"
                      style={{ backgroundColor: color }}
                    >
                      🎯 {conf}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend row */}
            <div className="flex flex-wrap gap-2 pt-1">
              {visibleDetections.map((det, idx) => {
                const color = BOX_COLORS[idx % BOX_COLORS.length];
                return (
                  <span key={det.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border font-mono"
                    style={{ borderColor: color, color, backgroundColor: `${color}15` }}
                  >
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                    {det.label ?? det.category} — {Math.round((det.confidence ?? 0.9) * 100)}%
                  </span>
                );
              })}
            </div>
          </div>

          {/* ─ Right: GLM-4.5V classification + per-detection cards ──── */}
          <div className="lg:col-span-5 space-y-4">

            {/* GLM classification card */}
            {report.classification && (
              <div className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-slate-800 text-sm">GLM-4.5V Classification</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">
                    AI ANALYSIS
                  </span>
                </div>

                <div>
                  <p className="font-extrabold text-slate-900 text-base font-sans leading-tight">
                    {report.classification.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans">
                    {report.classification.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase">Severity</span>
                    <SeverityBadge severity={report.classification.severity} />
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase">Authority</span>
                    <DepartmentBadge code={report.classification.authority} />
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase">Priority Score</span>
                    <strong className="text-orange-600">{report.classification.priorityScore ?? '—'} / 100</strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase">Est. Repair</span>
                    <strong className="text-slate-800">{report.classification.estimatedRepairTime ?? '—'}</strong>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs font-sans text-orange-800">
                  <strong className="font-bold block mb-0.5">Recommended Action</strong>
                  {report.classification.recommendedAction}
                </div>
              </div>
            )}

            {/* Per-detection dispatch cards */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {visibleDetections.map((det, idx) => {
                const color     = BOX_COLORS[idx % BOX_COLORS.length];
                const cat       = DETECTION_CATEGORIES[det.category] ?? DETECTION_CATEGORIES.road_crack;
                const dispatched= dispatchedIds.has(det.id);
                const conf      = Math.round((det.confidence ?? 0.9) * 100);

                return (
                  <div key={det.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 hover:border-green-300 transition-all"
                    style={{ borderLeftWidth: 4, borderLeftColor: color }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-black"
                          style={{ backgroundColor: color }}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{det.label ?? cat.label}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{det.id}</p>
                        </div>
                      </div>
                      <SeverityBadge severity={det.severity ?? cat.defaultSeverity} />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase">Confidence</span>
                        <strong className="text-green-700">{conf}%</strong>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase">Dept</span>
                        <strong className="text-slate-700">{det.authority ?? cat.dept}</strong>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase">SLA</span>
                        <strong className="text-orange-600">{cat.sla}</strong>
                      </div>
                    </div>

                    {/* Category chip */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${cat.bgClass}`}>
                        {CAT_ICONS[det.category]}
                        {cat.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Box: {det.box?.left} × {det.box?.top} / {det.box?.width} × {det.box?.height}
                      </span>
                    </div>

                    {/* Dispatch button */}
                    <button onClick={() => dispatchTicket(det)} disabled={dispatched}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        dispatched
                          ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                      }`}
                    >
                      {dispatched
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Ticket Dispatched</>
                        : <><ShieldAlert  className="w-3.5 h-3.5" /> Dispatch Incident Ticket</>
                      }
                    </button>
                  </div>
                );
              })}

              {visibleDetections.length === 0 && report.detections.length > 0 && (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  All {report.detections.length} detections below {Math.round(minConf * 100)}% threshold.<br />
                  Lower the confidence slider to see them.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Empty state ────────────────────────────────────────────── */}
      {!report && !isAnalyzing && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">Ready for YOLO11 + GLM-4.5V Analysis</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload a road image or video, or select any of the 13 preset categories above.
            The server will run YOLO11 detection and GLM-4.5V will classify and recommend civic action.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['pothole','waterlogging','traffic_congestion','garbage','streetlight_failure'].map(k => {
              const c = DETECTION_CATEGORIES[k];
              return (
                <span key={k} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.bgClass}`}>
                  {c.label}
                </span>
              );
            })}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200 text-slate-400">
              +8 more…
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
