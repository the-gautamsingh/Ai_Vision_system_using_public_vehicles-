import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BUS_ROUTES, INITIAL_BUSES, SEEDED_DETECTIONS, SEEDED_INCIDENTS,
  TRAFFIC_SECTORS, DETECTION_TYPES, getDetectionTypeByKey, YOLO_CATEGORY_KEYS,
} from './srinagarData';
import { runDetection, fileToBase64, DETECTION_CATEGORIES } from './detectionService';

const UrbanDataContext = createContext(null);

/* ── sample images per YOLO category ────────────────────────────────── */
const SAMPLE_IMAGES = {
  pothole:             'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
  road_crack:          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
  waterlogging:        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  pedestrian:          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  car:                 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  bus:                 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  bike:                'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  traffic_congestion:  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  illegal_parking:     'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  debris:              'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
  garbage:             'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
  damaged_sign:        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
  streetlight_failure: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
};

/* ── map DETECTION_TYPES key → YOLO category key ─────────────────────── */
const KEY_TO_YOLO = {};
Object.entries(DETECTION_TYPES).forEach(([dtKey, dt]) => {
  KEY_TO_YOLO[dtKey] = dt.key; // e.g. POTHOLE → 'pothole'
});

export const UrbanDataProvider = ({ children }) => {
  const [fleetSize,          setFleetSize]         = useState(12);
  const [buses,              setBuses]             = useState(INITIAL_BUSES);
  const [detections,         setDetections]        = useState(SEEDED_DETECTIONS);
  const [incidents,          setIncidents]         = useState(SEEDED_INCIDENTS);
  const [trafficSectors,     setTrafficSectors]    = useState(TRAFFIC_SECTORS);
  const [isSimulating,       setIsSimulating]      = useState(true);
  const [simSpeed,           setSimSpeed]          = useState(1);
  const [selectedBusId,      setSelectedBusId]     = useState('BUS-JK01-101');
  const [selectedIncidentId, setSelectedIncidentId]= useState(null);
  const [lastTelemetryTime,  setLastTelemetryTime] = useState(new Date().toLocaleTimeString());
  const [sampleAIDetection,  setSampleAIDetection] = useState(null);

  /* ── fleet size effect ─────────────────────────────────────────────── */
  useEffect(() => {
    const makeExtra = (count, offset) =>
      Array.from({ length: count }, (_, i) => ({
        id: `BUS-JK01-1${13 + offset + i}`,
        routeId: `R${((offset + i) % 5) + 1}`,
        routeName: BUS_ROUTES[(offset + i) % 5].name,
        currentWaypointIdx: (offset + i) % 4,
        progress: 0.3 + (i * 0.1),
        speed: 30 + i * 2,
        status: 'Active Sensing',
        camStatus: 'HD Online (30 FPS)',
        lastPing: 'Just now',
        detectionsCount: 4 + i,
        driver: `Driver ${13 + offset + i}`,
        model: i % 2 === 0 ? 'Tata Starbus EV' : 'Ashok Leyland Electric',
      }));

    if      (fleetSize === 10) setBuses(INITIAL_BUSES.slice(0, 10));
    else if (fleetSize === 15) setBuses([...INITIAL_BUSES, ...makeExtra(3, 0)]);
    else if (fleetSize === 20) setBuses([...INITIAL_BUSES, ...makeExtra(8, 0)]);
    else                       setBuses(INITIAL_BUSES);
  }, [fleetSize]);

  /* ── bus position interpolation ────────────────────────────────────── */
  const calculateBusPosition = useCallback((routeId, waypointIdx, progress) => {
    const route = BUS_ROUTES.find(r => r.id === routeId);
    if (!route?.waypoints?.length) return { lat: 34.0837, lng: 74.7973, locationName: 'Srinagar Central', heading: 'NE 45°' };

    const wp0 = route.waypoints[waypointIdx % route.waypoints.length];
    const wp1 = route.waypoints[(waypointIdx + 1) % route.waypoints.length];

    const lat = wp0.lat + (wp1.lat - wp0.lat) * progress;
    const lng = wp0.lng + (wp1.lng - wp0.lng) * progress;
    const angle = Math.round((Math.atan2(wp1.lat - wp0.lat, wp1.lng - wp0.lng) * 180 / Math.PI + 360) % 360);
    const dirs  = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    return {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      locationName: `${wp0.name} → ${wp1.name}`,
      heading: `${dirs[Math.floor(((angle + 22.5) % 360) / 45)]} ${angle}°`,
    };
  }, []);

  /* ── enriched active buses memo ────────────────────────────────────── */
  const activeBuses = useMemo(() => buses.map(bus => {
    const pos = calculateBusPosition(bus.routeId, bus.currentWaypointIdx, bus.progress);
    const busDetections = detections.filter(d => d.busId === bus.id);
    const speedHistory = [
      { time: '10m ago', speed: Math.max(10, bus.speed - 8), detections: 2 },
      { time: '8m ago',  speed: Math.max(10, bus.speed - 4), detections: 4 },
      { time: '6m ago',  speed: Math.min(65, bus.speed + 6), detections: 7 },
      { time: '4m ago',  speed: Math.max(10, bus.speed - 2), detections: 11 },
      { time: '2m ago',  speed: Math.min(65, bus.speed + 4), detections: 14 },
      { time: 'Now',     speed: bus.speed,                   detections: bus.detectionsCount },
    ];
    return {
      ...bus,
      shortId: bus.id.replace('BUS-JK01-', 'BUS-'),
      lat: pos.lat, lng: pos.lng,
      locationName: pos.locationName,
      heading: pos.heading,
      lastDetectedEvent: busDetections[0]?.title ?? 'No recent detections',
      speedHistory,
      aiStatus: 'YOLO11 + GLM-4.5V Active',
    };
  }), [buses, detections, calculateBusPosition]);

  /* ── inject event (all 13 YOLO categories) ─────────────────────────── */
  const injectEvent = useCallback((eventTypeKey) => {
    const activeUnits = activeBuses.filter(b => b.status === 'Active Sensing');
    const bus = activeUnits[Math.floor(Math.random() * activeUnits.length)] ?? activeBuses[0];

    // Accept both DETECTION_TYPES key (e.g. 'POTHOLE') and YOLO key (e.g. 'pothole')
    const yoloKey   = KEY_TO_YOLO[eventTypeKey] ?? eventTypeKey;
    const catMeta   = DETECTION_CATEGORIES[yoloKey] ?? DETECTION_CATEGORIES.pothole;
    const dtEntry   = getDetectionTypeByKey(yoloKey);
    const conf      = Number((0.88 + Math.random() * 0.11).toFixed(2));
    const newDetId  = `DET-${Date.now()}`;

    const newDetection = {
      id: newDetId, busId: bus.id,
      type: eventTypeKey.toUpperCase().replace(/-/g, '_'),
      category: catMeta.category,
      title: `${catMeta.label} Detected`,
      locationName: bus.locationName,
      lat: bus.lat, lng: bus.lng,
      confidence: conf,
      yoloModel: 'YOLO11x + GLM-4.5V',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      severity: catMeta.defaultSeverity,
      dept: catMeta.dept,
      status: 'Flagged for Action',
      imageUrl: SAMPLE_IMAGES[yoloKey] ?? SAMPLE_IMAGES.pothole,
      box: { top: '30%', left: '25%', width: '40%', height: '35%' },
    };

    const newIncId = `INC-SRIN-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident = {
      id: newIncId, detectionId: newDetId,
      title: `${catMeta.label} at ${bus.locationName}`,
      location: bus.locationName,
      lat: bus.lat, lng: bus.lng,
      department: catMeta.dept, deptName: catMeta.deptName,
      severity: catMeta.defaultSeverity, status: 'Open',
      reportedByBus: bus.id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      slaDeadline: `${catMeta.sla} SLA`,
      assignedTeam: `${catMeta.dept} Rapid Dispatch Unit`,
      notes: `Injected via Demo Control. YOLO11 + GLM-4.5V detected ${catMeta.label} at ${bus.lat}, ${bus.lng} (${Math.round(conf * 100)}% confidence).`,
    };

    setDetections(prev => [newDetection, ...prev]);
    setBuses(prev => prev.map(b => b.id === bus.id ? { ...b, detectionsCount: b.detectionsCount + 1 } : b));
    setIncidents(prev => [newIncident, ...prev]);
  }, [activeBuses]);

  /* ── synthetic detection trigger (header button) ────────────────────── */
  const triggerSyntheticDetection = useCallback(() => {
    const randomKey = YOLO_CATEGORY_KEYS[Math.floor(Math.random() * YOLO_CATEGORY_KEYS.length)];
    injectEvent(randomKey);
  }, [injectEvent]);

  /* ── sample AI detection runner ─────────────────────────────────────── */
  const runSampleAIDetection = useCallback(() => {
    setSampleAIDetection({
      id:            `SAMPLE-${Date.now()}`,
      originalImage: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      annotatedImage:'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      objectLabel:   'Deep Asphalt Pothole Depression',
      confidence:    0.97,
      severity:      'Critical',
      model:         'YOLO11x + GLM-4.5V',
      location:      'Airport Road Bypass Corridor (Lat 34.0354, Lng 74.7865)',
      box:           { top: '35%', left: '25%', width: '45%', height: '30%' },
    });
  }, []);

  const createIncidentFromSample = useCallback(() => {
    if (!sampleAIDetection) return;
    const newId = `INC-SRIN-${Math.floor(100 + Math.random() * 900)}`;
    setIncidents(prev => [{
      id: newId, detectionId: sampleAIDetection.id,
      title: `${sampleAIDetection.objectLabel} at ${sampleAIDetection.location}`,
      location: sampleAIDetection.location,
      lat: 34.0354, lng: 74.7865,
      department: 'RNB', deptName: 'Roads & Buildings Dept (R&B)',
      severity: sampleAIDetection.severity, status: 'Open',
      reportedByBus: 'BUS-JK01-103',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      slaDeadline: '24 Hours SLA', assignedTeam: 'R&B Quick Response Unit #1',
      notes: 'Created from Sample AI Detection runner (YOLO11 + GLM-4.5V).',
    }, ...prev]);
    setSampleAIDetection(null);
  }, [sampleAIDetection]);

  const resetSimulation = useCallback(() => {
    if (!window.confirm('Reset all data to the initial demo dataset?')) return;
    setFleetSize(12);
    setBuses(INITIAL_BUSES);
    setDetections(SEEDED_DETECTIONS);
    setIncidents(SEEDED_INCIDENTS);
    setTrafficSectors(TRAFFIC_SECTORS);
    setSampleAIDetection(null);
  }, []);

  /* ── simulation loop ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isSimulating) return;
    const ms = Math.max(800, 2500 / simSpeed);
    const timer = setInterval(() => {
      setLastTelemetryTime(new Date().toLocaleTimeString());
      setBuses(prev => prev.map(bus => {
        if (bus.status === 'Depot Maintenance' || bus.status === 'Standby') return bus;
        let progress = bus.progress + 0.08 * (bus.speed / 40);
        let wpIdx    = bus.currentWaypointIdx;
        if (progress >= 1.0) {
          progress = 0;
          const route = BUS_ROUTES.find(r => r.id === bus.routeId);
          wpIdx = (wpIdx + 1) % (route?.waypoints.length ?? 6);
        }
        return {
          ...bus,
          progress:             Number(progress.toFixed(3)),
          currentWaypointIdx:   wpIdx,
          speed:                Math.min(60, Math.max(15, Math.round(bus.speed + (Math.random() - 0.5) * 4))),
          lastPing:             'Just now',
        };
      }));
    }, ms);
    return () => clearInterval(timer);
  }, [isSimulating, simSpeed]);

  /* ── derived stats ───────────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    totalBuses:          activeBuses.length,
    sensingBuses:        activeBuses.filter(b => b.status === 'Active Sensing').length,
    totalDetectionsCount:detections.length,
    openIncidentsCount:  incidents.filter(i => i.status !== 'Resolved').length,
    avgConfidence:       detections.length > 0
      ? Math.round(detections.reduce((s, d) => s + d.confidence, 0) / detections.length * 100)
      : 92,
    roadConditionIndex:  81,
    kmScannedToday:      1428,
  }), [activeBuses, detections, incidents]);

  const kpis = useMemo(() => ({
    activeBuses:    { count: stats.sensingBuses,                                                                       trend: '+100% Online', compare: `vs last shift (${stats.sensingBuses}/${stats.totalBuses})` },
    totalDetections:{ count: stats.totalDetectionsCount,                                                               trend: '+18% Today',   compare: 'vs 24h avg (120)' },
    potholes:       { count: detections.filter(d => d.type === 'POTHOLE' || d.type === 'pothole').length,              trend: '+4 New',       compare: 'vs yesterday (+12%)' },
    waterlogging:   { count: detections.filter(d => d.type === 'WATERLOGGING' || d.type === 'waterlogging').length,    trend: '+2 Alerts',    compare: 'Rambagh underpass' },
    trafficHotspots:{ count: detections.filter(d => ['ILLEGAL_PARKING','illegal_parking','TRAFFIC_CONGESTION','traffic_congestion'].includes(d.type)).length + 2, trend: '+1 Hotspot', compare: 'Hyderpora sector' },
    criticalIssues: { count: incidents.filter(i => i.severity === 'Critical' || i.severity === 'High').length,         trend: 'SLA Active',   compare: 'High/Critical severity' },
  }), [stats, detections, incidents]);

  const priorityCorridors = useMemo(() => [
    {
      rank: '01', name: 'Airport Road Bypass Corridor',
      incidentsCount: detections.filter(d => /Airport|Hyderpora|Rambagh/i.test(d.locationName)).length + 6,
      busesDetecting: Math.min(stats.totalBuses, 5), severity: 'High', trend: '+12% defect density',
    },
    {
      rank: '02', name: 'Lal Chowk ↔ Dalgate Sector',
      incidentsCount: detections.filter(d => /Lal Chowk|Dalgate/i.test(d.locationName)).length + 4,
      busesDetecting: 4, severity: 'Critical', trend: '+8% traffic bottlenecks',
    },
    {
      rank: '03', name: 'Karan Nagar ↔ Soura SKIMS Loop',
      incidentsCount: detections.filter(d => /Karan Nagar|Soura/i.test(d.locationName)).length + 3,
      busesDetecting: 3, severity: 'Medium', trend: 'Stable defect rate',
    },
  ], [detections, stats.totalBuses]);

  const aiCityInsight = useMemo(() => {
    const top = priorityCorridors[0];
    const topDefect = kpis.potholes.count >= kpis.waterlogging.count
      ? 'critical road depression / potholes'
      : 'storm drain waterlogging';
    return {
      insight:  `${top.name} exhibits the highest concentration of ${topDefect} (${top.incidentsCount} incidents detected by ${top.busesDetecting} sensing buses). YOLO11 + GLM-4.5V analysis confidence: 94.2%.`,
      action:   `Prioritize immediate field inspection and R&B patch team dispatch to ${top.name}. Escalate critical SLA tickets to SMC Director.`,
    };
  }, [priorityCorridors, kpis]);

  /* ── context value ───────────────────────────────────────────────────── */
  return (
    <UrbanDataContext.Provider value={{
      fleetSize, setFleetSize,
      buses: activeBuses,
      detections, incidents, trafficSectors,
      stats, kpis, priorityCorridors, aiCityInsight,
      isSimulating, setIsSimulating,
      simSpeed, setSimSpeed,
      selectedBusId, setSelectedBusId,
      selectedIncidentId, setSelectedIncidentId,
      lastTelemetryTime,
      injectEvent,
      triggerSyntheticDetection,
      resetSimulation,
      sampleAIDetection, setSampleAIDetection,
      runSampleAIDetection, createIncidentFromSample,
      updateIncidentStatus: (id, status) =>
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i)),
      addIncident: (inc) => setIncidents(prev => [inc, ...prev]),
      // Expose live detection runner for LiveUploadDetectionView
      runDetection,
    }}>
      {children}
    </UrbanDataContext.Provider>
  );
};

export const useUrbanData = () => {
  const ctx = useContext(UrbanDataContext);
  if (!ctx) throw new Error('useUrbanData must be used within UrbanDataProvider');
  return ctx;
};
