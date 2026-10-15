import React, { useState } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { SeverityBadge } from '../common/BadgesAndCards';
import { SrinagarMap } from '../map/SrinagarMap';
import {
  Bus, Eye, AlertTriangle, Droplets, Car, ShieldAlert, Activity,
  Sparkles, ArrowUpRight, Compass, ChevronRight, Bot, Flame,
  SlidersHorizontal,
} from 'lucide-react';

/* ── per-category KPI card colour tokens ───────────────────────────── */
const KPI_CARDS = [
  { key: 'activeBuses',    label: 'Active Buses',     icon: Bus,          color: '#16a34a', bg: '#dcfce7', brd: '#86efac' },
  { key: 'totalDetections',label: 'AI Detections',    icon: Eye,          color: '#0f766e', bg: '#ccfbf1', brd: '#5eead4' },
  { key: 'potholes',       label: 'Potholes',         icon: AlertTriangle,color: '#c2410c', bg: '#ffedd5', brd: '#fdba74' },
  { key: 'waterlogging',   label: 'Waterlogging',     icon: Droplets,     color: '#1d4ed8', bg: '#dbeafe', brd: '#93c5fd' },
  { key: 'trafficHotspots',label: 'Traffic Hotspots', icon: Car,          color: '#7e22ce', bg: '#f3e8ff', brd: '#d8b4fe' },
  { key: 'criticalIssues', label: 'Critical Issues',  icon: ShieldAlert,  color: '#b91c1c', bg: '#fee2e2', brd: '#fca5a5' },
];

export const DashboardView = ({ setActiveTab }) => {
  const {
    detections, incidents, kpis, priorityCorridors, aiCityInsight,
    lastTelemetryTime,
  } = useUrbanData();

  const getDetIcon = (type) => {
    const t = (type ?? '').toUpperCase();
    if (t.includes('POTHOLE') || t.includes('ROAD'))   return <AlertTriangle className="w-4 h-4" style={{ color: '#c2410c' }} />;
    if (t.includes('WATER'))                            return <Droplets      className="w-4 h-4" style={{ color: '#1d4ed8' }} />;
    if (t.includes('PARK')  || t.includes('TRAFFIC'))  return <Car           className="w-4 h-4" style={{ color: '#7e22ce' }} />;
    if (t.includes('GARBAGE')|| t.includes('DEBRIS'))  return <ShieldAlert   className="w-4 h-4" style={{ color: '#b91c1c' }} />;
    return <Eye className="w-4 h-4" style={{ color: '#0f766e' }} />;
  };

  return (
    <div className="p-6 space-y-6 bg-page theme-transition min-h-full font-mono">

      {/* ── 1. Page header ────────────────────────────────────────── */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4 theme-transition">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5"
            style={{ color: 'var(--accent-green)' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            NETWORK OVERVIEW
          </div>
          <h1 className="text-xl font-extrabold tracking-tight leading-tight mt-0.5"
            style={{ color: 'var(--text-primary)' }}>
            Urban Intelligence Dashboard
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Live view of Srinagar's mobile urban sensing network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span
            className="px-3 py-1 rounded-xl font-bold text-[11px] flex items-center gap-2"
            style={{ background: 'var(--accent-orange-bg)', border: '1px solid var(--accent-orange-border)', color: 'var(--accent-orange)' }}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            DEMO ENVIRONMENT
          </span>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs theme-transition"
            style={{ background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-border)', color: 'var(--text-secondary)' }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 radar-live" />
            <span style={{ color: 'var(--text-muted)' }}>Live Telemetry:</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{lastTelemetryTime}</span>
          </div>
        </div>
      </div>

      {/* ── 2. KPI cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map(({ key, label, icon: Icon, color, bg, brd }) => {
          const kpi = kpis[key] ?? {};
          return (
            <div key={key}
              className="card p-4 theme-transition"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono"
                  style={{ color }}>
                  {label}
                </span>
                <div className="p-1.5 rounded-lg" style={{ background: bg, border: `1px solid ${brd}` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <div className="text-2xl font-extrabold" style={{ color }}>
                  {kpi.count ?? 0}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--accent-green)' }}>
                  {kpi.trend ?? ''}
                </span>
              </div>
              <p className="mt-1 text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {kpi.compare ?? ''}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── 3. Map + Detection timeline ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Map */}
        <div className="lg:col-span-7 card p-5 flex flex-col gap-3 theme-transition">
          <div className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 className="font-bold text-sm font-mono flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
                <Compass className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                Fleet activity &amp; detected events
              </h3>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Live bus markers, defect &amp; traffic overlays in Srinagar
              </p>
            </div>
            <button onClick={() => setActiveTab('map')}
              className="px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1 theme-transition"
              style={{
                background: 'var(--bg-card-alt)', border: '1px solid var(--border)',
                color: 'var(--accent-green)',
              }}>
              Full Screen Map <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-96 w-full rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <SrinagarMap height="100%" />
          </div>
        </div>

        {/* Detection timeline */}
        <div className="lg:col-span-5 card p-5 flex flex-col gap-3 theme-transition">
          <div className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 className="font-bold text-sm font-mono flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
                <Activity className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                Detection Timeline
              </h3>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Latest YOLO11 + GLM-4.5V events
              </p>
            </div>
            <button onClick={() => setActiveTab('detection')}
              className="text-xs font-mono flex items-center gap-0.5"
              style={{ color: 'var(--accent-green)' }}>
              View Feed <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 text-xs">
            {detections.slice(0, 7).map(det => (
              <div key={det.id}
                onClick={() => setActiveTab('detection')}
                className="p-3 rounded-xl cursor-pointer theme-transition space-y-1.5"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-green-border)';
                  e.currentTarget.style.background   = 'var(--accent-green-bg)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background   = 'var(--bg-card-alt)';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getDetIcon(det.type)}
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{det.title}</span>
                  </div>
                  <SeverityBadge severity={det.severity} />
                </div>
                <div className="flex items-center justify-between text-[11px]"
                  style={{ color: 'var(--text-muted)' }}>
                  <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>{det.busId}</span>
                  <span className="truncate max-w-[140px]">{det.locationName}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px]"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <span className="font-bold" style={{ color: 'var(--accent-green)' }}>
                    {Math.round(det.confidence * 100)}% conf
                  </span>
                  <span>{det.timestamp?.split(' ')[1] ?? det.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Priority corridors + AI Insight ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Priority corridors */}
        <div className="card p-5 theme-transition">
          <div className="flex items-center justify-between pb-3 mb-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-bold text-sm font-mono flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}>
              <Flame className="w-4 h-4" style={{ color: 'var(--accent-orange)' }} />
              TOP 3 PRIORITY CORRIDORS
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            {priorityCorridors.map(item => (
              <div key={item.rank}
                className="p-3.5 rounded-xl flex items-center justify-between theme-transition"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold font-mono px-2 py-1 rounded-lg"
                    style={{ color: 'var(--accent-orange)', background: 'var(--accent-orange-bg)', border: '1px solid var(--accent-orange-border)' }}>
                    {item.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm font-sans" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {item.busesDetecting} sensing buses · {item.incidentsCount} incidents
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <SeverityBadge severity={item.severity} />
                  <span className="text-[10px] font-semibold block mt-1" style={{ color: 'var(--accent-orange)' }}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI city insight */}
        <div className="card p-5 flex flex-col justify-between gap-4 theme-transition"
          style={{ border: '1px solid var(--accent-green-border)' }}>
          <div>
            <div className="flex items-center justify-between pb-3"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm font-mono flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
                <Bot className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                EMERGENT AI CITY INSIGHT
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-border)' }}>
                GLM-4.5V
              </span>
            </div>
            <div className="mt-4 p-4 rounded-xl space-y-3 text-xs"
              style={{ background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-border)' }}>
              <p className="font-sans leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {aiCityInsight.insight}
              </p>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-green-border)' }}>
                <strong style={{ color: 'var(--accent-green)' }}>Recommended Action: </strong>
                <span style={{ color: 'var(--text-secondary)' }}>{aiCityInsight.action}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setActiveTab('ai-assistant')}
            className="w-full py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md theme-transition"
            style={{ background: 'linear-gradient(135deg, var(--accent-green), #15803d)' }}>
            Ask GLM-4.5V Assistant
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
