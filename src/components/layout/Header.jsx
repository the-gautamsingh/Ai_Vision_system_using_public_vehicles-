import React, { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, Clock, Sun, Moon } from 'lucide-react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { useTheme } from '../../services/ThemeContext';
import { DemoControlCenterModal } from '../common/DemoControlCenterModal';

export const Header = ({ activeTab, pageTitles }) => {
  const { lastTelemetryTime, triggerSyntheticDetection } = useUrbanData();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const titleInfo = pageTitles[activeTab] || { number: '01', title: 'Command Center' };
  const dark = theme === 'dark';

  return (
    <>
      <header
        className="h-16 px-6 flex items-center justify-between shrink-0 z-10 select-none shadow-sm theme-transition"
        style={{
          backgroundColor: 'var(--bg-header)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* ── Left: page title ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}>
            <span>CITY OPERATIONS</span>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span className="font-bold" style={{ color: 'var(--accent-green)' }}>{titleInfo.number}</span>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>SRINAGAR METROPOLITAN AREA</span>
          </div>
          <h2 className="text-base font-extrabold tracking-tight leading-tight mt-0.5"
            style={{ color: 'var(--text-primary)' }}>
            {titleInfo.title}
          </h2>
        </div>

        {/* ── Right: controls ──────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">

          {/* Live telemetry badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono shadow-xs theme-transition"
            style={{
              background: 'var(--accent-green-bg)',
              border: '1px solid var(--accent-green-border)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 radar-live" />
            <span className="font-bold hidden sm:inline tracking-wider text-[11px]"
              style={{ color: 'var(--accent-green)' }}>
              LIVE TELEMETRY
            </span>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <span className="text-[11px] font-medium flex items-center gap-1"
              style={{ color: 'var(--text-secondary)' }}>
              <Clock className="w-3 h-3 inline" style={{ color: 'var(--text-muted)' }} />
              {lastTelemetryTime}
            </span>
          </div>

          {/* Demo Controls */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold theme-transition"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--accent-orange)' }} />
            <span>Demo Controls</span>
          </button>

          {/* Simulate AI Event */}
          <button
            onClick={triggerSyntheticDetection}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold theme-transition"
            style={{
              backgroundColor: 'var(--accent-orange-bg)',
              border: '1px solid var(--accent-orange-border)',
              color: 'var(--accent-orange)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate AI Event</span>
          </button>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search bus ID, route, ticket..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 pl-8 pr-3 py-1.5 rounded-xl text-xs font-mono input-theme"
            />
          </div>

          {/* ── Dark / Light toggle ───────────────────────────────── */}
          <button
            onClick={toggleTheme}
            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center w-9 h-9 rounded-xl theme-transition"
            style={{
              backgroundColor: dark ? 'var(--accent-green-bg)' : 'var(--bg-card-alt)',
              border: `1px solid ${dark ? 'var(--accent-green-border)' : 'var(--border)'}`,
              color: dark ? 'var(--accent-green)' : '#f59e0b',
            }}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2.5 pl-3"
            style={{ borderLeft: '1px solid var(--border)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shadow-xs"
              style={{
                background: 'linear-gradient(135deg, var(--accent-green), #15803d)',
                color: '#ffffff',
              }}
            >
              JK
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                Cmdr. A. Shah
              </p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                SMC Operations Center
              </p>
            </div>
          </div>
        </div>
      </header>

      <DemoControlCenterModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </>
  );
};
