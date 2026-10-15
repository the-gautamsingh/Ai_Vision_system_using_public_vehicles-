import React, { useState } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { SeverityBadge, DepartmentBadge } from '../common/BadgesAndCards';
import {
  ShieldAlert, Plus, CheckCircle2, Clock, MapPin, AlertTriangle,
  Search, Activity, Compass, ChevronRight, TrendingUp, Layers,
  X, AlertCircle
} from 'lucide-react';
import { SrinagarMap } from '../map/SrinagarMap';

export const IncidentsView = () => {
  const { incidents, updateIncidentStatus, addIncident, selectedIncidentId, setSelectedIncidentId } = useUrbanData();
  const [filterDept,     setFilterDept]     = useState('ALL');
  const [filterStatus,   setFilterStatus]   = useState('ALL');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [showNewModal,   setShowNewModal]   = useState(false);
  const [newTitle,       setNewTitle]       = useState('');
  const [newLoc,         setNewLoc]         = useState('Lal Chowk Clock Tower Circle');
  const [newDept,        setNewDept]        = useState('SMC');
  const [newSeverity,    setNewSeverity]    = useState('High');

  const filtered = incidents.filter(inc => {
    const mD = filterDept   === 'ALL' || inc.department === filterDept;
    const mS = filterStatus === 'ALL' || inc.status === filterStatus;
    const mQ = !searchQuery || [inc.id, inc.title, inc.location].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()));
    return mD && mS && mQ;
  });

  const selectedInc = incidents.find(i => i.id === selectedIncidentId) ?? filtered[0] ?? incidents[0];

  const kpiCards = [
    { label: 'TOTAL',       value: incidents.length,                                                          color: '#16a34a', bg: '#dcfce7', brd: '#86efac' },
    { label: 'CRITICAL',    value: incidents.filter(i=>i.severity==='Critical').length,                       color: '#b91c1c', bg: '#fee2e2', brd: '#fca5a5' },
    { label: 'IN PROGRESS', value: incidents.filter(i=>i.status==='In Progress').length,                      color: '#1d4ed8', bg: '#dbeafe', brd: '#93c5fd' },
    { label: 'OPEN',        value: incidents.filter(i=>i.status==='Open'||i.status==='Dispatched').length,    color: '#c2410c', bg: '#ffedd5', brd: '#fdba74' },
    { label: 'RESOLVED',    value: incidents.filter(i=>i.status==='Resolved').length,                         color: '#0f766e', bg: '#ccfbf1', brd: '#5eead4' },
    { label: 'SLA RISK',    value: incidents.filter(i=>i.severity==='Critical'||i.severity==='High').length,  color: '#9333ea', bg: '#f3e8ff', brd: '#d8b4fe' },
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const id = `INC-SRIN-${Math.floor(200 + Math.random() * 800)}`;
    addIncident({
      id, detectionId: 'DET-MANUAL', title: newTitle, location: newLoc,
      lat: 34.0715 + (Math.random()-0.5)*0.04, lng: 74.808 + (Math.random()-0.5)*0.04,
      department: newDept, deptName: newDept, severity: newSeverity, status: 'Open',
      reportedByBus: 'OPERATOR-MANUAL',
      createdAt: new Date().toISOString().replace('T',' ').substring(0,19),
      slaDeadline: '24 Hours SLA', assignedTeam: `${newDept} Rapid Response`,
      notes: 'Manually raised by Srinagar Command Center.',
    });
    setSelectedIncidentId(id);
    setShowNewModal(false);
    setNewTitle('');
  };

  const statusStyle = (s) => {
    if (s==='Open')        return { background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5' };
    if (s==='Dispatched')  return { background:'#ffedd5', color:'#c2410c', border:'1px solid #fdba74' };
    if (s==='In Progress') return { background:'#dbeafe', color:'#1d4ed8', border:'1px solid #93c5fd' };
    return { background:'#dcfce7', color:'#166534', border:'1px solid #86efac' };
  };

  return (
    <div className="p-6 space-y-6 bg-page theme-transition min-h-full font-mono">

      {/* Header */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4 theme-transition">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--accent-green)' }}>
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
            INCIDENT LIFECYCLE MANAGEMENT
          </div>
          <h1 className="text-xl font-extrabold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
            Geotagged Incident Management
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search ticket, issue, area…" value={searchQuery}
              onChange={e=>setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs w-48 input-theme" />
          </div>
          {[
            { label:'Dept:', value: filterDept, set: setFilterDept, opts: [['ALL','All Depts'],['SMC','SMC'],['RNB','R&B Roads'],['TRAFFIC','Traffic'],['UEED','UEED']] },
            { label:'Status:', value: filterStatus, set: setFilterStatus, opts: [['ALL','All'],['Open','Open'],['Dispatched','Dispatched'],['In Progress','In Progress'],['Resolved','Resolved']] },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl input-theme">
              <span style={{ color: 'var(--text-muted)' }}>{f.label}</span>
              <select value={f.value} onChange={e=>f.set(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                style={{ color: 'var(--text-primary)' }}>
                {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => setShowNewModal(true)}
            className="px-4 py-2 text-white rounded-xl font-bold flex items-center gap-2 shadow-md theme-transition"
            style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
            <Plus className="w-4 h-4" /> + Raise Incident
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map(k => (
          <div key={k.label} className="card p-4 theme-transition" style={{ borderLeft:`4px solid ${k.color}` }}>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: k.color }}>{k.label}</span>
            <span className="text-2xl font-black mt-2 block font-mono" style={{ color: k.color }}>
              {String(k.value).padStart(2,'0')}
            </span>
            <div className="w-full h-1 rounded-full mt-3" style={{ background:'var(--border)' }}>
              <div className="h-full rounded-full" style={{ background: k.color, width:`${Math.min(100, k.value * 10)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table + Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Table */}
        <div className="lg:col-span-7 card overflow-hidden theme-transition">
          <div className="p-4 flex items-center justify-between text-xs"
            style={{ background:'var(--bg-card-alt)', borderBottom:'1px solid var(--border)' }}>
            <span className="font-bold flex items-center gap-2" style={{ color:'var(--text-primary)' }}>
              <Layers className="w-4 h-4" style={{ color:'var(--accent-green)' }} />
              INCIDENT TICKETS ({filtered.length})
            </span>
            <span style={{ color:'var(--text-muted)' }}>Select row → open drawer</span>
          </div>
          <div className="overflow-x-auto max-h-[580px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead style={{ background:'var(--bg-card-alt)', position:'sticky', top:0, zIndex:10, borderBottom:'1px solid var(--border)' }}>
                <tr>
                  {['Ticket ID','Issue Title','Dept','Severity','Status','Action'].map(h=>(
                    <th key={h} className="p-3.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color:'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => {
                  const sel = selectedInc?.id === inc.id;
                  return (
                    <tr key={inc.id} onClick={() => setSelectedIncidentId(inc.id)}
                      className="cursor-pointer tr-theme theme-transition"
                      style={sel ? { background:'var(--accent-green-bg)', borderLeft:'3px solid var(--accent-green)' } : {}}>
                      <td className="p-3.5 font-bold" style={{ color:'var(--accent-green)' }}>{inc.id}</td>
                      <td className="p-3.5 font-sans font-medium max-w-[200px] truncate" style={{ color:'var(--text-primary)' }}>{inc.title}</td>
                      <td className="p-3.5"><DepartmentBadge code={inc.department} /></td>
                      <td className="p-3.5"><SeverityBadge severity={inc.severity} /></td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1"
                          style={statusStyle(inc.status)}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background:'currentColor' }} />
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {inc.status !== 'Resolved'
                          ? <button onClick={e=>{e.stopPropagation();updateIncidentStatus(inc.id,'Resolved');}}
                              className="px-2.5 py-1 text-white text-[10px] font-bold rounded-lg"
                              style={{ background:'var(--accent-green)' }}>Resolve</button>
                          : <span className="text-[10px] font-bold flex items-center gap-1" style={{ color:'var(--accent-green)' }}>
                              <CheckCircle2 className="w-3 h-3"/>Resolved</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drawer */}
        {selectedInc && (
          <div className="lg:col-span-5 card p-5 space-y-4 text-xs flex flex-col theme-transition">
            <div className="pb-3 flex items-start justify-between gap-3" style={{ borderBottom:'1px solid var(--border)' }}>
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background:'var(--accent-green-bg)', color:'var(--accent-green)', border:'1px solid var(--accent-green-border)' }}>
                  {selectedInc.id}
                </span>
                <h2 className="font-extrabold text-base font-sans mt-1.5 leading-snug" style={{ color:'var(--text-primary)' }}>
                  {selectedInc.title}
                </h2>
              </div>
              <SeverityBadge severity={selectedInc.severity} />
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl" style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)' }}>
              {[
                { l:'Department',    v: <DepartmentBadge code={selectedInc.department} /> },
                { l:'Assigned Team', v: selectedInc.assignedTeam },
                { l:'Location',      v: <span className="flex items-center gap-1"><MapPin className="w-3 h-3" style={{color:'var(--accent-green)'}}/>{selectedInc.location}</span> },
                { l:'Reporting Bus', v: selectedInc.reportedByBus },
              ].map(({l,v}) => (
                <div key={l}>
                  <span className="text-[10px] uppercase font-bold block mb-1" style={{ color:'var(--text-muted)' }}>{l}</span>
                  <span className="font-semibold truncate block" style={{ color:'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* SLA bar */}
            <div className="p-3 rounded-xl space-y-2" style={{ background:'var(--accent-orange-bg)', border:'1px solid var(--accent-orange-border)' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1" style={{ color:'var(--accent-orange)' }}>
                  <Clock className="w-3.5 h-3.5" /> SLA: {selectedInc.slaDeadline}
                </span>
                <span className="font-bold" style={{ color:'var(--accent-orange)' }}>● AT RISK</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background:'var(--border)' }}>
                <div className="h-full w-4/5 rounded-full animate-pulse"
                  style={{ background:'linear-gradient(90deg,var(--accent-orange),#dc2626)' }} />
              </div>
            </div>

            {/* Map preview */}
            <div className="h-32 rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)' }}>
              <SrinagarMap height="100%" selectedIncidentId={selectedInc.id} compact={true} />
            </div>

            {/* Workflow actions */}
            <div className="pt-3 space-y-2" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={()=>updateIncidentStatus(selectedInc.id,'Dispatched')}
                  className="py-2 text-white font-bold rounded-xl text-xs"
                  style={{ background:'var(--accent-orange)' }}>Dispatch</button>
                <button onClick={()=>updateIncidentStatus(selectedInc.id,'In Progress')}
                  className="py-2 text-white font-bold rounded-xl text-xs"
                  style={{ background:'#2563eb' }}>In Progress</button>
                <button onClick={()=>updateIncidentStatus(selectedInc.id,'Resolved')}
                  className="py-2 text-white font-bold rounded-xl text-xs"
                  style={{ background:'var(--accent-green)' }}>Resolve</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New incident modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background:'var(--bg-overlay)' }}>
          <form onSubmit={handleCreate} className="card w-full max-w-md p-6 space-y-4 shadow-2xl theme-transition">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom:'1px solid var(--border)' }}>
              <h3 className="font-extrabold text-base font-mono flex items-center gap-2" style={{ color:'var(--text-primary)' }}>
                <ShieldAlert className="w-5 h-5 text-red-500" /> RAISE INCIDENT TICKET
              </h3>
              <button type="button" onClick={()=>setShowNewModal(false)} style={{ color:'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs font-mono">
              {[
                { label:'Issue Title', comp: <input type="text" required placeholder="e.g. Severe Pothole near Dalgate" value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl input-theme" /> },
                { label:'Location',    comp: <input type="text" value={newLoc} onChange={e=>setNewLoc(e.target.value)} className="w-full px-3 py-2 rounded-xl input-theme" /> },
              ].map(f=>(
                <div key={f.label}>
                  <label className="block mb-1 font-semibold" style={{ color:'var(--text-secondary)' }}>{f.label}</label>
                  {f.comp}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Department', value:newDept, set:setNewDept, opts:[['SMC','SMC Sanitation'],['RNB','R&B Roads'],['TRAFFIC','J&K Traffic'],['UEED','UEED Drainage']] },
                  { label:'Severity',   value:newSeverity, set:setNewSeverity, opts:[['Critical','Critical'],['High','High'],['Medium','Medium'],['Low','Low']] },
                ].map(f=>(
                  <div key={f.label}>
                    <label className="block mb-1 font-semibold" style={{ color:'var(--text-secondary)' }}>{f.label}</label>
                    <select value={f.value} onChange={e=>f.set(e.target.value)} className="w-full px-3 py-2 rounded-xl input-theme">
                      {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
              <button type="button" onClick={()=>setShowNewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono theme-transition"
                style={{ border:'1px solid var(--border)', color:'var(--text-secondary)', background:'var(--bg-card-alt)' }}>
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 text-white font-black rounded-xl text-xs shadow-md"
                style={{ background:'linear-gradient(135deg,var(--accent-green),#15803d)' }}>
                Dispatch Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
