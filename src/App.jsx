import React, { useState } from 'react';
import { UrbanDataProvider } from './services/UrbanDataContext';
import { ThemeProvider } from './services/ThemeContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardView }          from './components/views/DashboardView';
import { LiveFleetView }          from './components/views/LiveFleetView';
import { AIDetectionView }        from './components/views/AIDetectionView';
import { IncidentsView }          from './components/views/IncidentsView';
import { CityMapView }            from './components/views/CityMapView';
import { AnalyticsReportsView }   from './components/views/AnalyticsReportsView';
import { AIAssistantView }        from './components/views/AIAssistantView';
import { LiveUploadDetectionView }from './components/views/LiveUploadDetectionView';

const PAGE_TITLES = {
  dashboard:    { number: '01', title: 'Urban Operations Command Center' },
  fleet:        { number: '02', title: 'Live Sensing Fleet Telemetry' },
  detection:    { number: '03', title: 'Edge-AI Computer Vision Feed' },
  incidents:    { number: '04', title: 'Geotagged Incident Management' },
  map:          { number: '05', title: 'Srinagar Spatial City Map' },
  analytics:    { number: '06', title: 'Infrastructure Analytics & Reports' },
  'ai-assistant':{ number: '07', title: 'Emergent LLM Decision Support' },
  'live-upload': { number: '08', title: 'Live AI Vision Scanner (Image & Video Upload)' },
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':   return <DashboardView setActiveTab={setActiveTab} />;
      case 'fleet':       return <LiveFleetView setActiveTab={setActiveTab} />;
      case 'detection':   return <AIDetectionView />;
      case 'incidents':   return <IncidentsView />;
      case 'map':         return <CityMapView />;
      case 'analytics':   return <AnalyticsReportsView />;
      case 'ai-assistant':return <AIAssistantView />;
      case 'live-upload': return <LiveUploadDetectionView />;
      default:            return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    /* bg-page + text-primary are CSS-variable utilities defined in index.css */
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-page theme-transition"
      style={{ color: 'var(--text-primary)' }}>
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header activeTab={activeTab} pageTitles={PAGE_TITLES} />
          <main className="flex-1 overflow-y-auto bg-page theme-transition">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UrbanDataProvider>
        <AppContent />
      </UrbanDataProvider>
    </ThemeProvider>
  );
}
