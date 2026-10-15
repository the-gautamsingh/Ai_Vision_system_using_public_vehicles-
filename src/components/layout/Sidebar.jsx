import React, { useState } from 'react';
import {
  LayoutDashboard, Bus, Eye, ShieldAlert, Map, BarChart3, Bot,
  Radio, CheckCircle2, ChevronLeft, ChevronRight, Cpu, UploadCloud,
} from 'lucide-react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { useTheme } from '../../services/ThemeContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { stats, isSimulating, setIsSimulating } = useUrbanData();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard',   label: 'Dashboard',          icon: LayoutDashboard, badge: null },
    { id: 'fleet',       label: 'Live Fleet',          icon: Bus,             badge: `${stats.sensingBuses}/${stats.totalBuses}` },
    { id: 'detection',   label: 'AI Detection Feed',   icon: Eye,             badge: stats.totalDetectionsCount },
    { id: 'live-upload', label: 'Live AI Upload',       icon: UploadCloud,     badge: 'Scanner' },
    { id: 'incidents',   label: 'Incidents',            icon: ShieldAlert,     badge: stats.openIncidentsCount, highlight: true },
    { id: 'map',         label: 'City Map',             icon: Map,             badge: 'Live' },
    { id: 'analytics',   label: 'Analytics & Reports',  icon: BarChart3,       badge: null },
    { id: 'ai-assistant',label: 'AI Assistant',         icon: Bot,             badge: 'LLM' },
  ];

  return (
    <aside
      className={`${isCollapsed ? 'w-[4.5rem]' : 'w-64'} flex flex-col justify-between shrink-0 select-none z-20 theme-transition`}
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'width 0.3s ease, background-color 0.25s ease',
      }}
    >
      <div>
        {/* ── Brand header ─────────────────────────────────────────── */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, var(--sidebar-grad-from), var(--sidebar-grad-to))',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-md shrink-0"
              style={{
                background: 'rgba(255,255,255,0.20)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
              }}
            >
              UI
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-extrabold text-white text-sm tracking-tight leading-tight truncate">
                  URBAN INTELLIGENCE
                </h1>
                <p className="text-[10px] font-mono font-medium truncate flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <Cpu className="w-3 h-3 inline" /> SIH 2026 Sensing Engine
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(v => !v)}
            className="p-1.5 rounded-lg theme-transition"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.20)',
              color: '#ffffff',
            }}
          >
            {isCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft  className="w-4 h-4" />
            }
          </button>
        </div>

        {/* ── Navigation ───────────────────────────────────────────── */}
        <nav className="p-3 space-y-0.5">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest font-bold"
              style={{ color: 'var(--text-muted)' }}>
              Command Modules
            </div>
          )}

          {navItems.map(item => {
            const Icon     = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold theme-transition"
                style={{
                  backgroundColor: isActive ? 'var(--accent-green-bg)' : 'transparent',
                  border: isActive
                    ? '1px solid var(--accent-green-border)'
                    : '1px solid transparent',
                  color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid var(--accent-green)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-card-alt)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: isActive ? 'var(--accent-green)' : 'var(--text-muted)' }}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== null && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono shrink-0"
                    style={
                      item.highlight
                        ? { background: dark ? '#3b0764' : '#fdf4ff', color: '#9333ea', border: '1px solid #d8b4fe' }
                        : isActive
                        ? { background: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-border)' }
                        : { background: 'var(--bg-card-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div
        className="p-3 space-y-2.5 theme-transition"
        style={{
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card-alt)',
        }}
      >
        {/* Telemetry toggle */}
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl theme-transition`}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 text-xs">
            <Radio
              className="w-3.5 h-3.5"
              style={{ color: isSimulating ? 'var(--accent-green)' : 'var(--text-muted)' }}
            />
            {!isCollapsed && (
              <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Fleet Telemetry
              </span>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsSimulating(v => !v)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase font-bold theme-transition"
              style={
                isSimulating
                  ? { background: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-border)' }
                  : { background: 'var(--bg-card-alt)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {isSimulating ? '● ACTIVE' : 'PAUSED'}
            </button>
          )}
        </div>

        {/* System status */}
        {!isCollapsed && (
          <div className="flex items-center justify-between text-xs pt-1 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                System Operational
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{
                color: 'var(--accent-green)',
                background: 'var(--accent-green-bg)',
                border: '1px solid var(--accent-green-border)',
              }}
            >
              v3.0-SIH
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
