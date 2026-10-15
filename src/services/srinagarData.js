/**
 * srinagarData.js
 * Static seed data and geographic configuration for Srinagar, Kashmir.
 * All 13 YOLO11 detection categories are registered here.
 */

export const SRINAGAR_CENTER = { lat: 34.0837, lng: 74.7973, zoom: 13 };

/* ── Departments ─────────────────────────────────────────────────────── */
export const DEPARTMENTS = {
  SMC:     { name: 'Srinagar Municipal Corp (SMC)',    code: 'SMC',     color: 'bg-green-100 text-green-800 border-green-300' },
  RNB:     { name: 'Roads & Buildings Dept (R&B)',      code: 'R&B',     color: 'bg-orange-100 text-orange-800 border-orange-300' },
  TRAFFIC: { name: 'J&K Traffic Police',               code: 'TRAFFIC', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  PDD:     { name: 'Power Development Dept (PDD)',      code: 'PDD',     color: 'bg-purple-100 text-purple-800 border-purple-300' },
  UEED:    { name: 'Urban Environmental Eng (UEED)',   code: 'UEED',    color: 'bg-teal-100 text-teal-800 border-teal-300' },
};

/* ── All 13 YOLO11 Detection Categories ─────────────────────────────── */
export const DETECTION_TYPES = {
  // ─ Road Surface ──────────────────────────────────────────────────────
  POTHOLE: {
    key: 'pothole', label: 'Pothole / Surface Fracture',
    category: 'Road Surface', dept: 'RNB', icon: 'AlertTriangle',
    defaultSeverity: 'Critical', color: '#f97316',
    bgClass: 'bg-orange-100 text-orange-700 border-orange-300',
    sla: '24 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
  },
  ROAD_CRACK: {
    key: 'road_crack', label: 'Road Crack / Pavement Damage',
    category: 'Road Surface', dept: 'RNB', icon: 'Minus',
    defaultSeverity: 'High', color: '#ef4444',
    bgClass: 'bg-red-100 text-red-700 border-red-300',
    sla: '48 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
  },
  // ─ Drainage ──────────────────────────────────────────────────────────
  WATERLOGGING: {
    key: 'waterlogging', label: 'Waterlogging / Storm Drain Overflow',
    category: 'Drainage', dept: 'UEED', icon: 'Droplets',
    defaultSeverity: 'High', color: '#3b82f6',
    bgClass: 'bg-blue-100 text-blue-700 border-blue-300',
    sla: '6 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  // ─ Traffic ───────────────────────────────────────────────────────────
  PEDESTRIAN: {
    key: 'pedestrian', label: 'Pedestrian Obstruction / Crowding',
    category: 'Traffic Safety', dept: 'TRAFFIC', icon: 'User',
    defaultSeverity: 'Medium', color: '#8b5cf6',
    bgClass: 'bg-violet-100 text-violet-700 border-violet-300',
    sla: '2 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  CAR: {
    key: 'car', label: 'Unauthorized / Stopped Vehicle',
    category: 'Traffic', dept: 'TRAFFIC', icon: 'Car',
    defaultSeverity: 'Low', color: '#6366f1',
    bgClass: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    sla: '1 Hour',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  BUS: {
    key: 'bus', label: 'Bus / Commercial Transport',
    category: 'Traffic', dept: 'TRAFFIC', icon: 'Bus',
    defaultSeverity: 'Low', color: '#0ea5e9',
    bgClass: 'bg-sky-100 text-sky-700 border-sky-300',
    sla: '1 Hour',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  BIKE: {
    key: 'bike', label: 'Motorcycle / Two-Wheeler Violation',
    category: 'Traffic', dept: 'TRAFFIC', icon: 'Bike',
    defaultSeverity: 'Low', color: '#14b8a6',
    bgClass: 'bg-teal-100 text-teal-700 border-teal-300',
    sla: '1 Hour',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  TRAFFIC_CONGESTION: {
    key: 'traffic_congestion', label: 'Traffic Congestion Hotspot',
    category: 'Traffic Management', dept: 'TRAFFIC', icon: 'AlertOctagon',
    defaultSeverity: 'High', color: '#f59e0b',
    bgClass: 'bg-amber-100 text-amber-700 border-amber-300',
    sla: '30 Minutes',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  ILLEGAL_PARKING: {
    key: 'illegal_parking', label: 'Illegal Parking / Double Parking',
    category: 'Traffic Violation', dept: 'TRAFFIC', icon: 'ParkingCircleOff',
    defaultSeverity: 'Medium', color: '#a855f7',
    bgClass: 'bg-purple-100 text-purple-700 border-purple-300',
    sla: '2 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  // ─ Sanitation / Obstruction ───────────────────────────────────────────
  DEBRIS: {
    key: 'debris', label: 'Road Debris / Construction Waste',
    category: 'Obstruction', dept: 'SMC', icon: 'Box',
    defaultSeverity: 'High', color: '#78716c',
    bgClass: 'bg-stone-100 text-stone-700 border-stone-300',
    sla: '4 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
  },
  GARBAGE: {
    key: 'garbage', label: 'Uncollected Garbage / Solid Waste',
    category: 'Sanitation', dept: 'SMC', icon: 'Trash2',
    defaultSeverity: 'Medium', color: '#22c55e',
    bgClass: 'bg-green-100 text-green-700 border-green-300',
    sla: '12 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
  },
  // ─ Traffic Infrastructure ─────────────────────────────────────────────
  DAMAGED_SIGN: {
    key: 'damaged_sign', label: 'Damaged / Missing Road Sign',
    category: 'Traffic Infrastructure', dept: 'TRAFFIC', icon: 'Octagon',
    defaultSeverity: 'Medium', color: '#ec4899',
    bgClass: 'bg-pink-100 text-pink-700 border-pink-300',
    sla: '48 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
  },
  // ─ Electrical ─────────────────────────────────────────────────────────
  STREETLIGHT: {
    key: 'streetlight_failure', label: 'Streetlight Failure / Dark Zone',
    category: 'Electrical', dept: 'PDD', icon: 'ZapOff',
    defaultSeverity: 'Low', color: '#eab308',
    bgClass: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    sla: '72 Hours',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
  },
};

/** Flat array of all YOLO category keys in server order */
export const YOLO_CATEGORY_KEYS = [
  'pothole', 'road_crack', 'waterlogging', 'pedestrian', 'car', 'bus',
  'bike', 'traffic_congestion', 'illegal_parking', 'debris', 'garbage',
  'damaged_sign', 'streetlight_failure',
];

/** Lookup DETECTION_TYPES by YOLO category key string */
export function getDetectionTypeByKey(yoloKey) {
  return Object.values(DETECTION_TYPES).find(t => t.key === yoloKey)
    ?? DETECTION_TYPES.ROAD_CRACK;
}

/* ── Bus Routes (5 routes, Srinagar) ─────────────────────────────────── */
export const BUS_ROUTES = [
  {
    id: 'R1', name: 'Route 1: Lal Chowk ↔ Hazratbal', color: '#0284c7',
    waypoints: [
      { lat: 34.0715, lng: 74.8080, name: 'Lal Chowk Clock Tower' },
      { lat: 34.0780, lng: 74.8250, name: 'Dalgate Junction' },
      { lat: 34.0880, lng: 74.8350, name: 'Boulevard Road / Dal Lake' },
      { lat: 34.0980, lng: 74.8260, name: 'Rainawari Bridge' },
      { lat: 34.1120, lng: 74.8320, name: 'Nishat Corridor' },
      { lat: 34.1280, lng: 74.8420, name: 'Hazratbal Shrine Terminal' },
    ],
  },
  {
    id: 'R2', name: 'Route 2: Dalgate ↔ Srinagar Airport', color: '#059669',
    waypoints: [
      { lat: 34.0780, lng: 74.8250, name: 'Dalgate' },
      { lat: 34.0670, lng: 74.8310, name: 'Sonwar Cantonment' },
      { lat: 34.0610, lng: 74.8150, name: 'Rajbagh Silk Factory Road' },
      { lat: 34.0480, lng: 74.8010, name: 'Rambagh Flyover' },
      { lat: 34.0350, lng: 74.7860, name: 'Hyderpora Bypass' },
      { lat: 33.9870, lng: 74.7740, name: "Sheikh ul-Alam Int'l Airport" },
    ],
  },
  {
    id: 'R3', name: 'Route 3: Karan Nagar ↔ Soura SKIMS', color: '#d97706',
    waypoints: [
      { lat: 34.0850, lng: 74.7960, name: 'Karan Nagar Medical Zone' },
      { lat: 34.0910, lng: 74.8130, name: 'Khanyar Crossing' },
      { lat: 34.1040, lng: 74.8080, name: 'Hawal Central' },
      { lat: 34.1200, lng: 74.8030, name: 'Nawa Kadal Link' },
      { lat: 34.1350, lng: 74.8020, name: 'Soura SKIMS Hospital Terminal' },
    ],
  },
  {
    id: 'R4', name: 'Route 4: Batamaloo ↔ Hazratbal Express', color: '#7c3aed',
    waypoints: [
      { lat: 34.0740, lng: 74.7900, name: 'Batamaloo Bus Stand' },
      { lat: 34.0820, lng: 74.7990, name: 'Qamarwari Crossing' },
      { lat: 34.0950, lng: 74.8090, name: 'Zadibal Heritage Loop' },
      { lat: 34.1150, lng: 74.8250, name: 'Sadrabal Gate' },
      { lat: 34.1280, lng: 74.8420, name: 'Hazratbal North Campus' },
    ],
  },
  {
    id: 'R5', name: 'Route 5: Sonwar ↔ Parimpora Transport Nagar', color: '#db2777',
    waypoints: [
      { lat: 34.0670, lng: 74.8310, name: 'Sonwar Cantonment' },
      { lat: 34.0715, lng: 74.8080, name: 'Lal Chowk Main' },
      { lat: 34.0740, lng: 74.7900, name: 'Batamaloo Central' },
      { lat: 34.0810, lng: 74.7650, name: 'Bemina Bypass' },
      { lat: 34.0920, lng: 74.7500, name: 'Parimpora Transport Nagar' },
    ],
  },
];

/* ── Initial Fleet (12 buses) ────────────────────────────────────────── */
export const INITIAL_BUSES = [
  { id: 'BUS-JK01-101', routeId: 'R1', routeName: 'Route 1: Lal Chowk ↔ Hazratbal',        currentWaypointIdx: 0, progress: 0.1, speed: 38, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: 'Just now', detectionsCount: 14, driver: 'Tariq Ahmad',    model: 'Tata Starbus EV' },
  { id: 'BUS-JK01-102', routeId: 'R1', routeName: 'Route 1: Lal Chowk ↔ Hazratbal',        currentWaypointIdx: 3, progress: 0.6, speed: 42, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: '2s ago',   detectionsCount:  9, driver: 'Farooq Shah',    model: 'Ashok Leyland Electric' },
  { id: 'BUS-JK01-103', routeId: 'R2', routeName: 'Route 2: Dalgate ↔ Airport Express',    currentWaypointIdx: 1, progress: 0.4, speed: 52, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: '1s ago',   detectionsCount: 18, driver: 'Mohammad Lone', model: 'Tata Starbus EV' },
  { id: 'BUS-JK01-104', routeId: 'R2', routeName: 'Route 2: Dalgate ↔ Airport Express',    currentWaypointIdx: 4, progress: 0.2, speed: 28, status: 'Heavy Congestion', camStatus: 'HD Online (30 FPS)', lastPing: 'Just now', detectionsCount: 22, driver: 'Shabir Hussain', model: 'Eicher Skyline Pro' },
  { id: 'BUS-JK01-105', routeId: 'R3', routeName: 'Route 3: Karan Nagar ↔ Soura SKIMS',   currentWaypointIdx: 0, progress: 0.8, speed: 34, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: '3s ago',   detectionsCount: 11, driver: 'Abdul Mir',     model: 'Tata Ultra Electric' },
  { id: 'BUS-JK01-106', routeId: 'R3', routeName: 'Route 3: Karan Nagar ↔ Soura SKIMS',   currentWaypointIdx: 2, progress: 0.5, speed: 31, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: '1s ago',   detectionsCount:  7, driver: 'Ghulam Dar',    model: 'Ashok Leyland Electric' },
  { id: 'BUS-JK01-107', routeId: 'R4', routeName: 'Route 4: Batamaloo ↔ Hazratbal',       currentWaypointIdx: 1, progress: 0.3, speed: 45, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: 'Just now', detectionsCount: 15, driver: 'Manzoor Bhat',  model: 'Tata Starbus EV' },
  { id: 'BUS-JK01-108', routeId: 'R4', routeName: 'Route 4: Batamaloo ↔ Hazratbal',       currentWaypointIdx: 3, progress: 0.7, speed: 39, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: '2s ago',   detectionsCount: 12, driver: 'Bilal Malik',   model: 'Eicher Skyline Pro' },
  { id: 'BUS-JK01-109', routeId: 'R5', routeName: 'Route 5: Sonwar ↔ Parimpora',          currentWaypointIdx: 0, progress: 0.2, speed: 30, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: 'Just now', detectionsCount:  8, driver: 'Javid Wani',    model: 'Tata Ultra Electric' },
  { id: 'BUS-JK01-110', routeId: 'R5', routeName: 'Route 5: Sonwar ↔ Parimpora',          currentWaypointIdx: 2, progress: 0.9, speed:  0, status: 'Depot Maintenance',camStatus: 'Standby',            lastPing: '1m ago',   detectionsCount:  4, driver: 'Imtiyaz Sheikh', model: 'Ashok Leyland Electric' },
  { id: 'BUS-JK01-111', routeId: 'R1', routeName: 'Route 1: Lal Chowk ↔ Hazratbal',       currentWaypointIdx: 2, progress: 0.3, speed: 36, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: 'Just now', detectionsCount: 16, driver: 'Reyaz Hassan',  model: 'Tata Starbus EV' },
  { id: 'BUS-JK01-112', routeId: 'R2', routeName: 'Route 2: Dalgate ↔ Airport Express',   currentWaypointIdx: 2, progress: 0.8, speed: 48, status: 'Active Sensing',   camStatus: 'HD Online (30 FPS)', lastPing: '1s ago',   detectionsCount: 19, driver: 'Sameer Reshi',  model: 'Eicher Skyline Pro' },
];

/* ── Seeded Detections (covering all 13 categories) ──────────────────── */
export const SEEDED_DETECTIONS = [
  {
    id: 'DET-2026-8801', busId: 'BUS-JK01-101',
    type: 'POTHOLE', category: 'Road Surface',
    title: 'Deep Asphalt Pothole Cluster',
    locationName: 'Lal Chowk Near Clock Tower Circle',
    lat: 34.0718, lng: 74.8083, confidence: 0.97,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 11:42:10',
    severity: 'Critical', dept: 'RNB', status: 'Flagged for Action',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    box: { top: '35%', left: '25%', width: '45%', height: '30%' },
  },
  {
    id: 'DET-2026-8802', busId: 'BUS-JK01-103',
    type: 'WATERLOGGING', category: 'Drainage',
    title: 'Severe Storm Drain Overflow & Waterlogging',
    locationName: 'Rambagh Flyover Underpass',
    lat: 34.0482, lng: 74.8012, confidence: 0.93,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 11:35:44',
    severity: 'High', dept: 'UEED', status: 'Verified',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    box: { top: '40%', left: '15%', width: '70%', height: '40%' },
  },
  {
    id: 'DET-2026-8803', busId: 'BUS-JK01-102',
    type: 'GARBAGE', category: 'Sanitation',
    title: 'Uncollected Municipal Solid Waste Pile',
    locationName: 'Rainawari Bridge Corridor',
    lat: 34.0982, lng: 74.8263, confidence: 0.89,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 11:20:15',
    severity: 'Medium', dept: 'SMC', status: 'In Dispatch',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    box: { top: '20%', left: '55%', width: '35%', height: '45%' },
  },
  {
    id: 'DET-2026-8804', busId: 'BUS-JK01-104',
    type: 'ILLEGAL_PARKING', category: 'Traffic Violation',
    title: 'Illegal Commercial Double Parking',
    locationName: 'Hyderpora Bypass Sector 4',
    lat: 34.0354, lng: 74.7865, confidence: 0.96,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 11:12:00',
    severity: 'Medium', dept: 'TRAFFIC', status: 'Flagged for Action',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
    box: { top: '30%', left: '20%', width: '50%', height: '50%' },
  },
  {
    id: 'DET-2026-8805', busId: 'BUS-JK01-105',
    type: 'STREETLIGHT', category: 'Electrical',
    title: 'Non-Functional LED Light Pole Unit #42',
    locationName: 'Karan Nagar Hospital Road',
    lat: 34.0853, lng: 74.7964, confidence: 0.85,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 10:45:30',
    severity: 'Low', dept: 'PDD', status: 'Pending Review',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    box: { top: '10%', left: '40%', width: '20%', height: '60%' },
  },
  {
    id: 'DET-2026-8806', busId: 'BUS-JK01-107',
    type: 'ROAD_CRACK', category: 'Road Surface',
    title: 'Pavement Shear Defect & Edge Cracking',
    locationName: 'Qamarwari Junction Corridor',
    lat: 34.0824, lng: 74.7992, confidence: 0.92,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 10:15:22',
    severity: 'High', dept: 'RNB', status: 'Work Order Created',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    box: { top: '45%', left: '30%', width: '40%', height: '25%' },
  },
  {
    id: 'DET-2026-8807', busId: 'BUS-JK01-108',
    type: 'DAMAGED_SIGN', category: 'Traffic Infrastructure',
    title: 'Bent Speed Limit Signboard (30 km/h)',
    locationName: 'Hazratbal Sadrabal Link',
    lat: 34.1152, lng: 74.8253, confidence: 0.89,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 09:50:11',
    severity: 'Medium', dept: 'TRAFFIC', status: 'Pending Review',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    box: { top: '15%', left: '60%', width: '25%', height: '40%' },
  },
  {
    id: 'DET-2026-8808', busId: 'BUS-JK01-103',
    type: 'TRAFFIC_CONGESTION', category: 'Traffic Management',
    title: 'Heavy Traffic Congestion Hotspot',
    locationName: 'Lal Chowk Intersection',
    lat: 34.0715, lng: 74.8080, confidence: 0.91,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 09:30:05',
    severity: 'High', dept: 'TRAFFIC', status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
    box: { top: '15%', left: '10%', width: '80%', height: '55%' },
  },
  {
    id: 'DET-2026-8809', busId: 'BUS-JK01-111',
    type: 'DEBRIS', category: 'Obstruction',
    title: 'Construction Debris & Gravel Spill',
    locationName: 'Qamarwari Link Corridor',
    lat: 34.0828, lng: 74.7995, confidence: 0.94,
    yoloModel: 'YOLO11x + GLM-4.5V', timestamp: '2026-09-20 09:10:44',
    severity: 'High', dept: 'SMC', status: 'Flagged for Action',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    box: { top: '55%', left: '20%', width: '55%', height: '30%' },
  },
];

/* ── Seeded Incidents ────────────────────────────────────────────────── */
export const SEEDED_INCIDENTS = [
  {
    id: 'INC-SRIN-041', detectionId: 'DET-2026-8801',
    title: 'Critical Pothole Danger at Lal Chowk Clock Tower',
    location: 'Lal Chowk Clock Tower Circle',
    lat: 34.0718, lng: 74.8083,
    department: 'RNB', deptName: 'Roads & Buildings Dept (R&B)',
    severity: 'Critical', status: 'Dispatched', reportedByBus: 'BUS-JK01-101',
    createdAt: '2026-09-20 11:45:00', slaDeadline: '2026-09-21 11:45:00 (24h)',
    assignedTeam: 'R&B Quick Response Unit #2',
    notes: 'Bus sensor flagged deep depression > 12 cm. High risk for two-wheelers.',
  },
  {
    id: 'INC-SRIN-042', detectionId: 'DET-2026-8802',
    title: 'Waterlogging Drain Blockage under Rambagh Flyover',
    location: 'Rambagh Flyover Underpass',
    lat: 34.0482, lng: 74.8012,
    department: 'UEED', deptName: 'Urban Environmental Eng (UEED)',
    severity: 'High', status: 'In Progress', reportedByBus: 'BUS-JK01-103',
    createdAt: '2026-09-20 11:38:00', slaDeadline: '2026-09-20 17:38:00 (6h)',
    assignedTeam: 'SMC/UEED Pump Truck Unit #7',
    notes: 'Stormwater accumulation restricting bus lane to single file.',
  },
  {
    id: 'INC-SRIN-043', detectionId: 'DET-2026-8803',
    title: 'Solid Waste Overflow near Rainawari Bridge',
    location: 'Rainawari Bridge Corridor',
    lat: 34.0982, lng: 74.8263,
    department: 'SMC', deptName: 'Srinagar Municipal Corp (SMC)',
    severity: 'Medium', status: 'Open', reportedByBus: 'BUS-JK01-102',
    createdAt: '2026-09-20 11:22:00', slaDeadline: '2026-09-21 18:00:00',
    assignedTeam: 'SMC Sanitation Ward #14',
    notes: 'Garbage spill encroaching 1.5 m into carriageway.',
  },
  {
    id: 'INC-SRIN-044', detectionId: 'DET-2026-8804',
    title: 'Traffic Bottleneck caused by Illegal Parking',
    location: 'Hyderpora Bypass Sector 4',
    lat: 34.0354, lng: 74.7865,
    department: 'TRAFFIC', deptName: 'J&K Traffic Police',
    severity: 'Medium', status: 'Open', reportedByBus: 'BUS-JK01-104',
    createdAt: '2026-09-20 11:15:00', slaDeadline: '2026-09-20 13:15:00',
    assignedTeam: 'Traffic Control Mobile Squad',
    notes: 'Two commercial delivery vehicles parked in bus stop zone.',
  },
  {
    id: 'INC-SRIN-045', detectionId: 'DET-2026-8806',
    title: 'Pavement Erosion & Edge Fracture on Qamarwari',
    location: 'Qamarwari Junction Corridor',
    lat: 34.0824, lng: 74.7992,
    department: 'RNB', deptName: 'Roads & Buildings Dept (R&B)',
    severity: 'High', status: 'Resolved', reportedByBus: 'BUS-JK01-107',
    createdAt: '2026-09-20 10:20:00', slaDeadline: '2026-09-21 10:20:00',
    assignedTeam: 'R&B Patch Work Crew #4',
    notes: 'Cold mix asphalt patch completed by R&B maintenance team at 14:30.',
  },
];

/* ── Traffic Sectors ─────────────────────────────────────────────────── */
export const TRAFFIC_SECTORS = [
  { sector: 'Lal Chowk / Clock Tower',    status: 'Moderate', avgSpeed: '24 km/h', congestionIndex: '62%', activeBuses: 4, roadConditionScore: 78 },
  { sector: 'Boulevard Road / Dal Lake',  status: 'Fluid',    avgSpeed: '44 km/h', congestionIndex: '28%', activeBuses: 3, roadConditionScore: 92 },
  { sector: 'Hyderpora / Airport Bypass', status: 'Heavy',    avgSpeed: '18 km/h', congestionIndex: '84%', activeBuses: 3, roadConditionScore: 64 },
  { sector: 'Karan Nagar / SKIMS Loop',   status: 'Moderate', avgSpeed: '29 km/h', congestionIndex: '54%', activeBuses: 2, roadConditionScore: 71 },
  { sector: 'Hazratbal Corridor',         status: 'Fluid',    avgSpeed: '41 km/h', congestionIndex: '31%', activeBuses: 3, roadConditionScore: 88 },
];
