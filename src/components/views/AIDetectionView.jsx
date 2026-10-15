import React, { useState } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { SeverityBadge, DepartmentBadge } from '../common/BadgesAndCards';
import { Eye, Filter, Cpu, MapPin, Sparkles, AlertCircle, Maximize2, ShieldAlert, X } from 'lucide-react';

export const AIDetectionView = () => {
  const { detections, triggerSyntheticDetection } = useUrbanData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [minConfidence, setMinConfidence] = useState(0.80);
  const [activeInspectionModal, setActiveInspectionModal] = useState(null);

  const filteredDetections = detections.filter((det) => {
    const matchCat = selectedCategory === 'ALL' || det.category === selectedCategory;
    const matchConf = det.confidence >= minConfidence;
    return matchCat && matchConf;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-100 text-slate-800 min-h-full font-mono">

      {/* Top Filter & Model Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-extrabold text-slate-900">EDGE-AI COMPUTER VISION DETECTION STREAM</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300 text-xs font-mono font-bold">
              YOLO11x-UrbanRoad v3.0
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Automated visual inference on bus edge-NPU devices (30 FPS)
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Road Surface">Road Surface</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Drainage">Drainage</option>
              <option value="Electrical">Electrical</option>
              <option value="Traffic">Traffic</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-500">Min Confidence:</span>
            <select
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={0.80}>&gt; 80%</option>
              <option value={0.90}>&gt; 90% High</option>
              <option value={0.95}>&gt; 95% Verified</option>
            </select>
          </div>

          <button
            onClick={triggerSyntheticDetection}
            className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-extrabold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Event
          </button>
        </div>
      </div>

      {/* Detection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDetections.map((det) => (
          <div
            key={det.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-green-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image with YOLO Bounding Box */}
              <div className="relative aspect-video bg-slate-100 w-full overflow-hidden group">
                <img
                  src={det.imageUrl}
                  alt={det.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Bounding Box */}
                <div
                  className="absolute border-2 border-orange-500 bg-orange-400/20 rounded-lg pointer-events-none flex flex-col justify-between p-1 shadow-md"
                  style={{
                    top: det.box ? det.box.top : '30%',
                    left: det.box ? det.box.left : '25%',
                    width: det.box ? det.box.width : '40%',
                    height: det.box ? det.box.height : '35%'
                  }}
                >
                  <span className="bg-orange-500 text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded w-max shadow-sm">
                    {det.type} ({Math.round(det.confidence * 100)}%)
                  </span>
                </div>

                {/* Top Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-white/95 text-slate-700 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                    {det.id}
                  </span>
                </div>

                <button
                  onClick={() => setActiveInspectionModal(det)}
                  className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-lg backdrop-blur-sm transition-colors border border-slate-200 shadow-xs"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-green-600" />
                </button>
              </div>

              {/* Card Metadata */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-800 text-sm leading-snug font-sans">{det.title}</h3>
                  <SeverityBadge severity={det.severity} />
                </div>
                <div className="space-y-1.5 text-xs font-mono text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      {det.locationName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span>Bus: <strong className="text-green-700">{det.busId}</strong></span>
                    <DepartmentBadge code={det.dept} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 font-mono text-[11px] flex items-center justify-between text-slate-500">
              <span>YOLO Conf: <strong className="text-green-600 font-semibold">{Math.round(det.confidence * 100)}%</strong></span>
              <span>{det.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Inspection Modal */}
      {activeInspectionModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-50 text-slate-800 p-4 flex items-center justify-between border-b border-slate-200">
              <div>
                <h3 className="font-mono font-bold text-sm text-green-700">{activeInspectionModal.id} — Bounding Box Snapshot</h3>
                <p className="text-xs text-slate-500 font-mono">{activeInspectionModal.locationName}</p>
              </div>
              <button onClick={() => setActiveInspectionModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-slate-100 w-full">
              <img src={activeInspectionModal.imageUrl} alt={activeInspectionModal.title} className="w-full h-full object-cover" />
              <div
                className="absolute border-2 border-orange-500 bg-orange-400/25 rounded-lg p-1"
                style={{
                  top: activeInspectionModal.box ? activeInspectionModal.box.top : '30%',
                  left: activeInspectionModal.box ? activeInspectionModal.box.left : '25%',
                  width: activeInspectionModal.box ? activeInspectionModal.box.width : '40%',
                  height: activeInspectionModal.box ? activeInspectionModal.box.height : '35%'
                }}
              >
                <span className="bg-orange-500 text-white font-mono font-black text-xs px-2 py-0.5 rounded shadow">
                  {activeInspectionModal.type} ({Math.round(activeInspectionModal.confidence * 100)}%)
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 space-y-2 text-xs font-mono text-slate-600 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Model: <strong className="text-green-700">{activeInspectionModal.yoloModel}</strong></span>
                <span>Bus: <strong className="text-slate-800">{activeInspectionModal.busId}</strong></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GPS: Lat {activeInspectionModal.lat}, Lng {activeInspectionModal.lng}</span>
                <span>Category: {activeInspectionModal.category}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
