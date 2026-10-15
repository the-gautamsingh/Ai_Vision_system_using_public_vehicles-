import React, { useState } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { DETECTION_CATEGORIES } from '../../services/detectionService';
import {
  SlidersHorizontal, Play, Pause, RotateCcw, Sparkles, X, CheckCircle2,
  ShieldAlert, AlertTriangle, Droplets, Car, Box, Trash2, ZapOff,
  Octagon, User, Bus, Bike, AlertOctagon, Minus,
} from 'lucide-react';

const CAT_ICONS = {
  pothole:'AlertTriangle', road_crack:'Minus', waterlogging:'Droplets',
  pedestrian:'User', car:'Car', bus:'Bus', bike:'Bike',
  traffic_congestion:'AlertOctagon', illegal_parking:'Car',
  debris:'Box', garbage:'Trash2', damaged_sign:'Octagon', streetlight_failure:'ZapOff',
};
const ICON_MAP = { AlertTriangle, Minus, Droplets, User, Car, Bus, Bike, AlertOctagon, Box, Trash2, Octagon, ZapOff };

export const DemoControlCenterModal = ({ isOpen, onClose }) => {
  const {
    fleetSize, setFleetSize, isSimulating, setIsSimulating,
    simSpeed, setSimSpeed, injectEvent, resetSimulation,
    sampleAIDetection, runSampleAIDetection, createIncidentFromSample,
  } = useUrbanData();

  const [lastInjected, setLastInjected] = useState(null);
  if (!isOpen) return null;

  const handleInject = (key) => {
    injectEvent(key);
    setLastInjected(key);
    setTimeout(() => setLastInjected(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background:'var(--bg-overlay)' }}>
      <div className="card w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl theme-transition"
        style={{ borderRadius:'1.25rem' }}>

        {/* Header */}
        <div className="p-5 flex items-center justify-between sticky top-0 z-10 rounded-t-[1.25rem]"
          style={{ background:'linear-gradient(135deg,var(--sidebar-grad-from),var(--sidebar-grad-to))', borderBottom:'1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md"
              style={{ background:'rgba(255,255,255,0.15)', borderColor:'rgba(255,255,255,0.2)', color:'#fff' }}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-base">DEMO CONTROL CENTER</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background:'rgba(251,146,60,0.3)', color:'#fed7aa', border:'1px solid rgba(251,146,60,0.4)' }}>
                  DEMO
                </span>
              </div>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.75)' }}>
                YOLO11x + GLM-4.5V · 13 Categories · Srinagar Fleet Simulator (SIH 2026)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl transition-colors"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Section 1 — Fleet & Sim controls */}
          <div className="rounded-xl p-4 space-y-3" style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)' }}>
            <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color:'var(--accent-green)' }}>
              1 · Fleet Size &amp; Simulation Engine
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Fleet size */}
              <div className="space-y-1">
                <label className="font-semibold block" style={{ color:'var(--text-muted)' }}>Active Fleet Size:</label>
                <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
                  {[10,12,15,20].map(s=>(
                    <button key={s} onClick={()=>setFleetSize(s)}
                      className="flex-1 py-1 rounded font-bold transition-all text-xs"
                      style={fleetSize===s ? {background:'var(--accent-green)',color:'#fff'} : {color:'var(--text-muted)'}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sim toggle */}
              <div className="space-y-1">
                <label className="font-semibold block" style={{ color:'var(--text-muted)' }}>Simulation Engine:</label>
                <button onClick={()=>setIsSimulating(v=>!v)}
                  className="w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 border transition-all"
                  style={isSimulating
                    ? {background:'var(--accent-green-bg)',color:'var(--accent-green)',borderColor:'var(--accent-green-border)'}
                    : {background:'#fee2e2',color:'#b91c1c',borderColor:'#fca5a5'}}>
                  {isSimulating ? <><Pause className="w-4 h-4"/>PAUSE</> : <><Play className="w-4 h-4"/>RESUME</>}
                </button>
              </div>
              {/* Speed */}
              <div className="space-y-1">
                <label className="font-semibold block" style={{ color:'var(--text-muted)' }}>Sim Speed:</label>
                <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
                  {[0.5,1,2,5].map(spd=>(
                    <button key={spd} onClick={()=>setSimSpeed(spd)}
                      className="flex-1 py-1 rounded font-bold transition-all text-xs"
                      style={simSpeed===spd ? {background:'var(--accent-orange)',color:'#fff'} : {color:'var(--text-muted)'}}>
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — All 13 YOLO11 inject buttons */}
          <div className="rounded-xl p-4 space-y-3" style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color:'var(--accent-green)' }}>
                2 · Live Event Injector — All 13 YOLO11 Categories
              </span>
              <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>Injects real-time geotagged detection + incident</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.values(DETECTION_CATEGORIES).map(cat => {
                const injected = lastInjected === cat.key;
                const IconComp = ICON_MAP[CAT_ICONS[cat.key]] ?? AlertTriangle;
                return (
                  <button key={cat.key} onClick={() => handleInject(cat.key)}
                    className="p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all"
                    style={injected
                      ? {background:'var(--accent-green-bg)',borderColor:'var(--accent-green-border)',color:'var(--accent-green)'}
                      : {background:cat.color+'18',borderColor:cat.color+'50',color:cat.color}}>
                    {injected
                      ? <CheckCircle2 className="w-3.5 h-3.5" />
                      : <IconComp className="w-3.5 h-3.5" />
                    }
                    <span className="truncate text-[11px]">
                      {injected ? 'Injected!' : cat.label.split('/')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3 — Sample YOLO11 runner */}
          <div className="rounded-xl p-4 space-y-3" style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color:'var(--accent-green)' }}>
                3 · Sample YOLO11 + GLM-4.5V Detection Runner
              </span>
              <button onClick={runSampleAIDetection}
                className="px-3 py-1 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-all"
                style={{ background:'linear-gradient(135deg,var(--accent-green),#15803d)' }}>
                <Sparkles className="w-3.5 h-3.5" /> Run Sample
              </button>
            </div>

            {sampleAIDetection ? (
              <div className="rounded-xl p-4 space-y-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
                <div className="flex items-center justify-between text-xs font-bold pb-2"
                  style={{ borderBottom:'1px solid var(--border)', color:'var(--text-primary)' }}>
                  <span className="px-2 py-0.5 rounded font-mono"
                    style={{ background:'var(--accent-green-bg)', color:'var(--accent-green)', border:'1px solid var(--accent-green-border)' }}>
                    {sampleAIDetection.model ?? 'YOLO11x + GLM-4.5V'}
                  </span>
                  <span style={{ color:'var(--accent-green)' }}>{Math.round(sampleAIDetection.confidence*100)}% Conf</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold block mb-1" style={{ color:'var(--text-muted)' }}>1. Original:</span>
                    <div className="relative aspect-video rounded-lg overflow-hidden" style={{ border:'1px solid var(--border)' }}>
                      <img src={sampleAIDetection.originalImage} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold block mb-1" style={{ color:'var(--accent-orange)' }}>2. YOLO11 Bbox:</span>
                    <div className="relative aspect-video rounded-lg overflow-hidden" style={{ border:'2px solid var(--accent-orange)' }}>
                      <img src={sampleAIDetection.annotatedImage} alt="Annotated" className="w-full h-full object-cover" />
                      <div className="absolute border-2 rounded p-1 pointer-events-none"
                        style={{ top:sampleAIDetection.box.top, left:sampleAIDetection.box.left, width:sampleAIDetection.box.width, height:sampleAIDetection.box.height, borderColor:'var(--accent-orange)', background:'rgba(234,88,12,0.2)' }}>
                        <span className="text-white text-[9px] font-bold px-1 py-0.5 rounded"
                          style={{ background:'var(--accent-orange)' }}>POTHOLE (96%)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 text-xs" style={{ borderTop:'1px solid var(--border)' }}>
                  <div style={{ color:'var(--text-secondary)' }}>
                    <span>Object: </span><strong style={{ color:'var(--text-primary)' }}>{sampleAIDetection.objectLabel}</strong>
                    <span className="ml-3">Severity: </span><strong style={{ color:'#b91c1c' }}>{sampleAIDetection.severity}</strong>
                  </div>
                  <button onClick={createIncidentFromSample}
                    className="px-4 py-1.5 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    style={{ background:'#dc2626' }}>
                    <ShieldAlert className="w-3.5 h-3.5" /> Create Incident
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs rounded-xl border border-dashed"
                style={{ color:'var(--text-muted)', borderColor:'var(--border)', background:'var(--bg-card)' }}>
                Click <strong style={{ color:'var(--accent-green)' }}>[Run Sample]</strong> to demo YOLO11 + GLM-4.5V inference.
              </div>
            )}
          </div>

          {/* Reset + Close */}
          <div className="flex justify-between items-center pt-2" style={{ borderTop:'1px solid var(--border)' }}>
            <button onClick={resetSimulation}
              className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 theme-transition"
              style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)', color:'var(--text-secondary)' }}>
              <RotateCcw className="w-4 h-4" /> Reset Demo Dataset
            </button>
            <button onClick={onClose}
              className="px-5 py-2 text-white font-black rounded-xl shadow-md"
              style={{ background:'linear-gradient(135deg,var(--accent-green),#15803d)' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
