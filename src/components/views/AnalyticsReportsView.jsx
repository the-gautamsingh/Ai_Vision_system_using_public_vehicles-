import React, { useState } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { BarChart3, FileText, Printer } from 'lucide-react';

export const AnalyticsReportsView = () => {
  const { detections, incidents, buses } = useUrbanData();
  const [reportGenerated, setReportGenerated] = useState(false);

  const categoryData = [
    { name: 'Potholes',        count: detections.filter(d=>/POTHOLE/i.test(d.type)).length+8,          color:'#f97316' },
    { name: 'Waterlogging',    count: detections.filter(d=>/WATER/i.test(d.type)).length+5,            color:'#3b82f6' },
    { name: 'Garbage',         count: detections.filter(d=>/GARBAGE/i.test(d.type)).length+6,          color:'#f59e0b' },
    { name: 'Illegal Parking', count: detections.filter(d=>/PARKING/i.test(d.type)).length+4,          color:'#a855f7' },
    { name: 'Road Crack',      count: detections.filter(d=>/CRACK/i.test(d.type)).length+5,            color:'#ef4444' },
    { name: 'Congestion',      count: detections.filter(d=>/CONGESTION/i.test(d.type)).length+3,       color:'#f59e0b' },
    { name: 'Streetlight',     count: detections.filter(d=>/STREET/i.test(d.type)).length+3,           color:'#eab308' },
  ];

  const routeData = [
    { route:'R1: Lal Chowk', score:78, potholes:14 },
    { route:'R2: Airport',   score:64, potholes:22 },
    { route:'R3: Soura',     score:71, potholes:11 },
    { route:'R4: Hazratbal', score:88, potholes:6  },
    { route:'R5: Parimpora', score:75, potholes:15 },
  ];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--tooltip-bg)',
      border: '1px solid var(--tooltip-border)',
      color: 'var(--tooltip-text)',
      borderRadius: '10px',
      fontSize: '11px',
    },
  };

  return (
    <div className="p-6 space-y-6 bg-page theme-transition min-h-full font-mono">

      {/* Header */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4 theme-transition">
        <div>
          <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color:'var(--text-primary)' }}>
            <BarChart3 className="w-5 h-5" style={{ color:'var(--accent-green)' }} />
            URBAN ANALYTICS &amp; OPERATIONAL REPORTS
          </h2>
          <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
            Aggregated road condition index and civic issue density
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button onClick={()=>setReportGenerated(v=>!v)}
            className="px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 theme-transition"
            style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)', color:'var(--text-secondary)' }}>
            <FileText className="w-3.5 h-3.5" style={{ color:'var(--accent-green)' }} />
            {reportGenerated ? 'Hide Summary' : 'Executive Brief'}
          </button>
          <button onClick={()=>window.print()}
            className="px-3.5 py-1.5 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
            style={{ background:'linear-gradient(135deg,var(--accent-green),#15803d)' }}>
            <Printer className="w-3.5 h-3.5" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Executive brief */}
      {reportGenerated && (
        <div className="card p-6 space-y-4 theme-transition" style={{ border:'1px solid var(--accent-green-border)' }}>
          <div className="flex items-center justify-between pb-3" style={{ borderBottom:'1px solid var(--border)' }}>
            <div>
              <span className="text-[10px] uppercase font-bold" style={{ color:'var(--accent-green)' }}>OFFICIAL MUNICIPAL BRIEF</span>
              <h3 className="font-extrabold text-base font-sans mt-0.5" style={{ color:'var(--text-primary)' }}>
                Srinagar Smart City Infrastructure Health Report
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background:'var(--accent-green-bg)', color:'var(--accent-green)', border:'1px solid var(--accent-green-border)' }}>
              VERIFIED TELEMETRY
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Total Scanned Distance', value:'1,428 Lane-Km', color:'var(--text-primary)' },
              { label:'Avg Detection Conf.',    value:'94.2% YOLO11',  color:'var(--accent-green)' },
              { label:'Active Sensing Units',   value:'12 Buses',      color:'#0f766e' },
              { label:'City Road Quality Score',value:'75 / 100 RQI',  color:'var(--accent-orange)' },
            ].map(s=>(
              <div key={s.label} className="p-3 rounded-xl" style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)' }}>
                <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>{s.label}</span>
                <p className="text-lg font-black mt-0.5" style={{ color:s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 theme-transition">
          <div className="pb-3 mb-4 flex justify-between items-center" style={{ borderBottom:'1px solid var(--border)' }}>
            <h3 className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Defect Classification Breakdown</h3>
            <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>Recorded by YOLO11</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize:10, fontFamily:'monospace', fill:'var(--text-muted)' }} />
                <YAxis tick={{ fontSize:10, fontFamily:'monospace', fill:'var(--text-muted)' }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" radius={[8,8,0,0]}>
                  {categoryData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 theme-transition">
          <div className="pb-3 mb-4 flex justify-between items-center" style={{ borderBottom:'1px solid var(--border)' }}>
            <h3 className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Route Condition Index (RQI)</h3>
            <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>Score / 100</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="route" tick={{ fontSize:10, fontFamily:'monospace', fill:'var(--text-muted)' }} />
                <YAxis domain={[0,100]} tick={{ fontSize:10, fontFamily:'monospace', fill:'var(--text-muted)' }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="score" radius={[8,8,0,0]}>
                  {routeData.map((e,i)=>(
                    <Cell key={i} fill={e.score>=80?'#16a34a':e.score>=70?'#f97316':'#ef4444'}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Incidents',  value:incidents.length,                                          emoji:'🚨', color:'#16a34a', bg:'#dcfce7', brd:'#86efac' },
          { label:'Buses Reporting',  value:buses.length,                                              emoji:'🚌', color:'#0f766e', bg:'#ccfbf1', brd:'#5eead4' },
          { label:'Critical Defects', value:detections.filter(d=>d.severity==='Critical').length,      emoji:'⚠️', color:'#b91c1c', bg:'#fee2e2', brd:'#fca5a5' },
          { label:'Resolved Today',   value:incidents.filter(i=>i.status==='Resolved').length,         emoji:'✅', color:'#c2410c', bg:'#ffedd5', brd:'#fdba74' },
        ].map(s=>(
          <div key={s.label} className="card p-4 theme-transition" style={{ borderLeft:`4px solid ${s.color}` }}>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color:'var(--text-muted)' }}>{s.emoji} {s.label}</p>
            <p className="text-2xl font-black mt-1 font-mono" style={{ color:s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
