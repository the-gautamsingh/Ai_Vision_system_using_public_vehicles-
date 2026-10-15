import React, { useState } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { SrinagarMap } from '../map/SrinagarMap';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid 
} from 'recharts';
import { 
  Bus, Search, Filter, Radio, MapPin, Activity, Camera, Cpu, 
  ArrowRight, Maximize2, Compass, Eye, ShieldAlert, ChevronRight, X, CheckCircle2
} from 'lucide-react';

export const LiveFleetView = ({ setActiveTab }) => {
  const { buses, selectedBusId, setSelectedBusId, lastTelemetryTime } = useUrbanData();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailDrawer, setShowDetailDrawer] = useState(true);

  const filteredBuses = buses.filter(bus => {
    const matchStatus = statusFilter === 'ALL' ||
      (statusFilter === 'Active' && bus.status === 'Active Sensing') ||
      (statusFilter === 'Standby' && (bus.status === 'Depot Maintenance' || bus.status === 'Standby')) ||
      (statusFilter === 'Offline' && bus.status === 'Offline');
    const query = searchQuery.toLowerCase();
    const matchSearch = bus.id.toLowerCase().includes(query) ||
      bus.shortId.toLowerCase().includes(query) ||
      bus.routeName.toLowerCase().includes(query) ||
      bus.locationName.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  const selectedBus = buses.find(b => b.id === selectedBusId) || filteredBuses[0] || buses[0];

  return (
    <div className="p-6 space-y-6 bg-slate-100 text-slate-800 min-h-full font-mono">

      {/* 1. HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-green-600 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            FLEET TELEMETRY
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
            Live Sensing Fleet Roster
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Monitor mobile sensing units operating across Srinagar.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-bold text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
            DEMO ENVIRONMENT
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 radar-live"></span>
            <span className="text-slate-500">Live Telemetry:</span>
            <span className="font-bold text-slate-800">{lastTelemetryTime}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN AREA: MAP + FLEET LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px]">

        {/* Map */}
        <div className="lg:col-span-7 h-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3 font-mono text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-green-600" />
              Srinagar Fleet Tracking Map
            </span>
            <span className="text-slate-400 text-[11px]">
              Showing {filteredBuses.length} sensing units
            </span>
          </div>
          <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-200">
            <SrinagarMap height="100%" selectedBusId={selectedBusId} compact={false} />
          </div>
        </div>

        {/* Fleet List */}
        <div className="lg:col-span-5 h-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm font-mono flex items-center gap-2">
                <Bus className="w-4 h-4 text-green-600" />
                Fleet Roster
              </h3>
              <span className="text-xs font-mono text-green-600 font-bold">
                {buses.filter(b => b.status === 'Active Sensing').length} / {buses.length} Active
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {['ALL', 'Active', 'Standby'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      statusFilter === tab
                        ? 'bg-white text-green-700 shadow-xs border border-green-200'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'ALL' ? 'All Units' : tab}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Bus ID or Route..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-green-400 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 font-mono text-xs">
            {filteredBuses.map((bus) => {
              const isSelected = selectedBus && selectedBus.id === bus.id;
              const isActive = bus.status === 'Active Sensing';
              return (
                <div
                  key={bus.id}
                  onClick={() => { setSelectedBusId(bus.id); setShowDetailDrawer(true); }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-green-50 border-green-400 ring-1 ring-green-300'
                      : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{bus.shortId || bus.id}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({bus.model?.split(' ')[0]})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isActive
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}>
                      {isActive ? '● Active' : '● Standby'}
                    </span>
                  </div>
                  <div className="text-slate-600 font-sans font-medium text-xs truncate">{bus.locationName}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-800">{bus.speed} km/h</span>
                    <span>{bus.lastPing}</span>
                    <span className="text-green-600 font-bold">{bus.detectionsCount} detections</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BUS INSPECTOR PANEL */}
      {selectedBus && showDetailDrawer && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 font-mono text-xs">

          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-base shadow-md">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">{selectedBus.shortId}</h2>
                  <span className="text-xs text-slate-400">({selectedBus.id})</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[11px] border border-green-300">
                    STATUS: ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-sans font-medium mt-0.5">
                  Route: {selectedBus.routeName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab && setActiveTab('detection')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-xl flex items-center gap-1.5 shadow-md hover:from-green-500 hover:to-green-600 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                Open AI Detection
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab('incidents')}
                className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold flex items-center gap-1.5 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                View Incidents
              </button>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Current Speed', value: `${selectedBus.speed} km/h`, color: 'text-slate-900' },
              { label: 'GPS Coordinates', value: `${selectedBus.lat}°N ${selectedBus.lng}°E`, color: 'text-green-700 text-xs' },
              { label: 'Heading Angle', value: selectedBus.heading, color: 'text-slate-900' },
              { label: 'Last Telemetry', value: selectedBus.lastPing, color: 'text-green-600' },
              { label: 'Camera Status', value: selectedBus.camStatus, color: 'text-green-600' },
              { label: 'AI Edge Engine', value: selectedBus.aiStatus, color: 'text-teal-600 truncate block' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{item.label}</span>
                <p className={`text-sm font-extrabold mt-1 ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Last Detected Event */}
          <div className="p-3 bg-green-50 text-slate-700 rounded-xl border border-green-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span>Last Detected Event: <strong className="text-slate-900 font-sans">{selectedBus.lastDetectedEvent}</strong></span>
            </div>
            <span className="text-green-700 font-bold">{selectedBus.detectionsCount} total detections today</span>
          </div>

          {/* Telemetry Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="pb-2 mb-3 border-b border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Live Speed Variation (km/h)</span>
                <span className="text-[10px] text-slate-400">Per 2m interval</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedBus.speedHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }} />
                    <YAxis domain={[0, 70]} tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="speed" stroke="#16a34a" fill="#16a34a" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="pb-2 mb-3 border-b border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Detection Cumulative Frequency</span>
                <span className="text-[10px] text-slate-400">YOLO11 Events</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedBus.speedHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="detections" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
