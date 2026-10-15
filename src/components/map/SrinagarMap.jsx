import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useUrbanData } from '../../services/UrbanDataContext';
import { BUS_ROUTES, SRINAGAR_CENTER } from '../../services/srinagarData';
import { Layers, Eye, Bus, AlertTriangle, Crosshair, RefreshCw } from 'lucide-react';

export const SrinagarMap = ({ height = '100%', selectedBusId, selectedIncidentId, compact = false }) => {
  const { buses, detections, incidents, setSelectedBusId, setSelectedIncidentId } = useUrbanData();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routesGroupRef = useRef(null);

  const [layers, setLayers] = useState({
    buses: true,
    detections: true,
    incidents: true,
    routes: true
  });

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Already initialized

    const map = L.map(mapContainerRef.current, {
      center: [SRINAGAR_CENTER.lat, SRINAGAR_CENTER.lng],
      zoom: compact ? 12 : SRINAGAR_CENTER.zoom,
      zoomControl: !compact,
      attributionControl: false
    });

    // Clean OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    routesGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [compact]);

  // Update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routesGroupRef.current) return;

    routesGroupRef.current.clearLayers();

    if (layers.routes) {
      BUS_ROUTES.forEach(route => {
        const latLngs = route.waypoints.map(wp => [wp.lat, wp.lng]);
        const polyline = L.polyline(latLngs, {
          color: route.color,
          weight: 4,
          opacity: 0.7,
          dashArray: '8, 6'
        });

        polyline.bindTooltip(`<b>${route.name}</b>`, { sticky: true, className: 'font-sans text-xs' });
        routesGroupRef.current.addLayer(polyline);
      });
    }
  }, [layers.routes]);

  // Update Markers (Buses, Detections, Incidents)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // 1. Bus Markers
    if (layers.buses) {
      buses.forEach(bus => {
        if (!bus.lat || !bus.lng) return;

        const isSelected = bus.id === selectedBusId;
        
        // Custom HTML Marker for Sensing Bus
        const busIcon = L.divIcon({
          className: 'custom-bus-pin',
          html: `
            <div style="
              background-color: ${isSelected ? '#0f766e' : '#0284c7'};
              color: white;
              padding: 3px 6px;
              border-radius: 4px;
              border: 2px solid ${isSelected ? '#2dd4bf' : '#ffffff'};
              font-family: monospace;
              font-size: 10px;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              transform: translate(-50%, -50%);
            ">
              <span style="width: 6px; height: 6px; background-color: #10b981; border-radius: 50%;"></span>
              ${bus.id.replace('BUS-JK01-', 'B')} (${bus.speed} km/h)
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12]
        });

        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; width: 200px;">
            <div style="font-weight: bold; font-family: monospace; color: #0f172a; border-b: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span>${bus.id}</span>
              <span style="color: #0284c7;">${bus.status}</span>
            </div>
            <div><b>Route:</b> ${bus.routeName}</div>
            <div><b>Speed:</b> ${bus.speed} km/h</div>
            <div><b>Driver:</b> ${bus.driver}</div>
            <div><b>Camera:</b> <span style="color: #059669;">${bus.camStatus}</span></div>
            <div><b>AI Detections:</b> ${bus.detectionsCount} flagged</div>
            <div style="margin-top: 6px; font-size: 10px; color: #64748b;">Near: ${bus.locationName}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedBusId(bus.id));
        markersGroupRef.current.addLayer(marker);

        // Center on selected bus
        if (isSelected && map) {
          map.panTo([bus.lat, bus.lng], { animate: true });
        }
      });
    }

    // 2. Incident Markers
    if (layers.incidents) {
      incidents.forEach(inc => {
        if (!inc.lat || !inc.lng) return;

        const isSelected = inc.id === selectedIncidentId;
        const color = inc.severity === 'Critical' ? '#e11d48' : inc.severity === 'High' ? '#f59e0b' : '#3b82f6';

        const incIcon = L.divIcon({
          className: 'custom-inc-pin',
          html: `
            <div style="
              background-color: ${color};
              color: white;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 11px;
              transform: translate(-50%, -50%);
              ${isSelected ? 'outline: 3px solid #0f766e;' : ''}
            ">
              !
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([inc.lat, inc.lng], { icon: incIcon });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; width: 220px;">
            <div style="font-weight: bold; color: #0f172a; border-b: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span style="font-family: monospace; color: ${color};">${inc.id}</span>
              <span style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-size: 10px;">${inc.severity}</span>
            </div>
            <div style="font-weight: 600; margin-bottom: 4px;">${inc.title}</div>
            <div><b>Dept:</b> ${inc.department}</div>
            <div><b>Status:</b> ${inc.status}</div>
            <div><b>Reported By:</b> <span style="font-family: monospace;">${inc.reportedByBus}</span></div>
            <div style="margin-top: 6px; font-size: 10px; color: #64748b;">${inc.createdAt}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedIncidentId(inc.id));
        markersGroupRef.current.addLayer(marker);
      });
    }

  }, [buses, incidents, layers, selectedBusId, selectedIncidentId]);

  // Center map on Srinagar
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([SRINAGAR_CENTER.lat, SRINAGAR_CENTER.lng], SRINAGAR_CENTER.zoom);
    }
  };

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
      {/* Container where Leaflet canvas renders */}
      <div ref={mapContainerRef} style={{ width: '100%', height }} />

      {/* Floating Map Layer Controls Header */}
      {!compact && (
        <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-md p-2 shadow-sm flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 font-semibold text-slate-700 px-1 border-r border-slate-200">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            Layers
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.buses}
              onChange={e => setLayers({ ...layers, buses: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <Bus className="w-3.5 h-3.5 text-sky-600" />
            Buses ({buses.length})
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.incidents}
              onChange={e => setLayers({ ...layers, incidents: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Incidents ({incidents.length})
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.routes}
              onChange={e => setLayers({ ...layers, routes: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            Routes (5)
          </label>

          <button
            onClick={handleRecenter}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 border border-slate-200 transition-colors ml-1"
            title="Recenter Map on Srinagar"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Map Legend Overlay at Bottom */}
      {!compact && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 rounded px-3 py-1.5 shadow-xs text-[11px] font-mono flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block"></span>
            <span>Active Sensing Bus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span>Critical Incident</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>High/Medium Incident</span>
          </div>
        </div>
      )}
    </div>
  );
};
