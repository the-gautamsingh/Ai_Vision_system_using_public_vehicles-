import React from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { SrinagarMap } from '../map/SrinagarMap';
import { BUS_ROUTES } from '../../services/srinagarData';
import { Compass } from 'lucide-react';

export const CityMapView = () => {
  const { buses, incidents, selectedBusId, setSelectedBusId, selectedIncidentId, setSelectedIncidentId } = useUrbanData();

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex gap-4 overflow-hidden bg-page theme-transition font-mono">

      {/* Map */}
      <div className="flex-1 h-full rounded-2xl overflow-hidden shadow-md"
        style={{ border:'1px solid var(--border)' }}>
        <SrinagarMap height="100%" selectedBusId={selectedBusId} selectedIncidentId={selectedIncidentId} />
      </div>

      {/* Sidebar */}
      <div className="w-80 h-full card p-4 flex flex-col gap-4 overflow-y-auto theme-transition">

        {/* Title */}
        <div className="pb-3" style={{ borderBottom:'1px solid var(--border)' }}>
          <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color:'var(--text-primary)' }}>
            <Compass className="w-4 h-4" style={{ color:'var(--accent-green)' }} />
            SRINAGAR SPATIAL OVERLAY
          </h3>
          <p className="text-xs" style={{ color:'var(--text-muted)' }}>Real-time bus tracking &amp; issue geotags</p>
        </div>

        {/* Routes */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color:'var(--text-muted)' }}>
            Public Transport Routes
          </span>
          {BUS_ROUTES.map(route => (
            <div key={route.id}
              className="p-2 rounded-xl flex items-center justify-between text-xs theme-transition"
              style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor:route.color }} />
                <span className="font-medium truncate w-44 text-[11px]" style={{ color:'var(--text-secondary)' }}>
                  {route.name}
                </span>
              </div>
              <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>6 stops</span>
            </div>
          ))}
        </div>

        {/* Bus positions */}
        <div className="space-y-2 pt-2" style={{ borderTop:'1px solid var(--border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color:'var(--text-muted)' }}>
            Mobile Sensing Buses ({buses.length})
          </span>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {buses.map(bus => {
              const sel = bus.id === selectedBusId;
              return (
                <div key={bus.id} onClick={() => setSelectedBusId(bus.id)}
                  className="p-2 rounded-xl text-xs cursor-pointer theme-transition flex items-center justify-between"
                  style={{
                    background: sel ? 'var(--accent-green-bg)' : 'var(--bg-card-alt)',
                    border: sel ? '1px solid var(--accent-green-border)' : '1px solid var(--border)',
                  }}>
                  <div>
                    <span className="font-bold" style={{ color:'var(--text-primary)' }}>{bus.id}</span>
                    <p className="text-[10px] truncate w-36" style={{ color:'var(--text-muted)' }}>{bus.locationName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold" style={{ color:'var(--accent-green)' }}>{bus.speed} km/h</span>
                    <p className="text-[10px] font-semibold" style={{ color:'var(--accent-green)' }}>{bus.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active incidents */}
        <div className="space-y-2 pt-2" style={{ borderTop:'1px solid var(--border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color:'var(--text-muted)' }}>
            Active Incidents ({incidents.filter(i=>i.status!=='Resolved').length})
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {incidents.filter(i=>i.status!=='Resolved').slice(0,6).map(inc => {
              const sel = selectedIncidentId === inc.id;
              return (
                <div key={inc.id} onClick={() => setSelectedIncidentId(inc.id)}
                  className="p-2 rounded-xl text-xs cursor-pointer theme-transition"
                  style={{
                    background: sel ? 'var(--accent-orange-bg)' : 'var(--bg-card-alt)',
                    border: sel ? '1px solid var(--accent-orange-border)' : '1px solid var(--border)',
                  }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate w-32 text-[11px]" style={{ color:'var(--text-primary)' }}>{inc.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={inc.severity==='Critical'
                        ? {background:'#fee2e2',color:'#b91c1c'}
                        : inc.severity==='High'
                        ? {background:'#ffedd5',color:'#c2410c'}
                        : {background:'#fef9c3',color:'#92400e'}}>
                      {inc.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 space-y-1 text-[10px] font-mono" style={{ borderTop:'1px solid var(--border)', color:'var(--text-muted)' }}>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span>Active sensing bus</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span>Detected incident</span></div>
          <p className="mt-1" style={{ color:'var(--border-strong)' }}>Proj: WGS 84 / OpenStreetMap</p>
        </div>
      </div>
    </div>
  );
};
