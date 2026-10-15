import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const styles = {
    Critical: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: 700 },
    High:     { background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74', fontWeight: 600 },
    Medium:   { background: '#fef9c3', color: '#92400e', border: '1px solid #fde68a' },
    Low:      { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
  };
  const s = styles[severity] ?? styles.Medium;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono"
      style={s}
    >
      {severity}
    </span>
  );
};

export const DepartmentBadge = ({ code }) => {
  const depts = {
    SMC:     { name: 'SMC Sanitation', style: { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' } },
    RNB:     { name: 'R&B Roads',      style: { background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74' } },
    TRAFFIC: { name: 'J&K Traffic',    style: { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' } },
    PDD:     { name: 'PDD Electrical', style: { background: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe' } },
    UEED:    { name: 'UEED Drainage',  style: { background: '#ccfbf1', color: '#0f766e', border: '1px solid #5eead4' } },
  };
  const item = depts[code] ?? { name: code, style: { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' } };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium"
      style={item.style}>
      {item.name}
    </span>
  );
};

export const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => (
  <div
    className="card p-4 theme-transition"
    style={{ borderRadius: '1rem' }}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider font-mono"
        style={{ color: 'var(--text-muted)' }}>
        {title}
      </span>
      {Icon && (
        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-border)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
        </div>
      )}
    </div>
    <div className="mt-2 flex items-baseline justify-between">
      <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {trend && (
        <span className="text-xs font-medium font-mono"
          style={{ color: trend.startsWith('+') ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          {trend}
        </span>
      )}
    </div>
    {subtitle && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
  </div>
);
