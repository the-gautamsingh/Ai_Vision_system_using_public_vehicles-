import React from 'react';

export const DemoBanner = ({ compact = false }) => {
  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium theme-transition"
        style={{
          background: 'var(--accent-orange-bg)',
          border: '1px solid var(--accent-orange-border)',
          color: 'var(--accent-orange)',
        }}
      >
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        <span className="font-semibold uppercase tracking-wider">DEMO ENVIRONMENT</span>
        <span style={{ color: 'var(--text-muted)' }}>| Simulated Telemetry</span>
      </div>
    );
  }

  return (
    <div
      className="w-full px-5 py-1.5 text-xs flex flex-wrap items-center justify-between font-mono theme-transition"
      style={{
        backgroundColor: 'var(--banner-bg)',
        borderBottom: '1px solid var(--border)',
        color: 'var(--banner-text)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Demo badge */}
        <div
          className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: 'inherit',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-orange-300 animate-pulse" />
          <span>DEMO ENVIRONMENT</span>
          <span style={{ opacity: 0.7 }}>Simulated Telemetry</span>
        </div>

        <span className="hidden md:inline text-[11px]" style={{ opacity: 0.8 }}>
          Srinagar Public Transport Fleet AI Sensing Pipeline (SIH 2026 Prototype)
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]" style={{ opacity: 0.9 }}>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-300 radar-live" />
          Simulated Geo-Telemetry Active
        </span>
        <span
          className="hidden sm:inline pl-3 text-[11px]"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.25)' }}
        >
          Region: <strong>SRINAGAR, J&K</strong>
        </span>
      </div>
    </div>
  );
};
