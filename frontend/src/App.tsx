import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { getNetworkGraph, checkHealth } from './api';
import { ModeSwitcher } from './components/ModeSwitcher';
import { InteractiveMap } from './components/InteractiveMap';
import { HistoricalReplayPanel } from './components/HistoricalReplayPanel';
import { HistoricalEventsPanel } from './components/HistoricalEventsPanel';
import { WhatIfSimulationPanel } from './components/WhatIfSimulationPanel';
import { SimulationResultsPanel } from './components/SimulationResultsPanel';
import { SavedPlansPanel } from './components/SavedPlansPanel';
import { AlertCircle } from 'lucide-react';
import './index.css';

function App() {
  const {
    networkGraph,
    setNetworkGraph,
    currentMode,
    selectedRegion,
    simulationLoading,
    currentSimulationResult
  } = useAppStore();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [backendConnected, setBackendConnected] = React.useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check backend health
        await checkHealth();
        setBackendConnected(true);

        // Load network graph
        const response = await getNetworkGraph(selectedRegion);
        setNetworkGraph(response.data);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to connect to backend. Make sure the server is running on port 5000.');
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [selectedRegion, setNetworkGraph]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-900">Resilience</h1>
          <p className="text-gray-600">Initializing simulation environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-red-50">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="text-red-600 mx-auto" size={48} />
          <h1 className="text-2xl font-bold text-gray-900">Connection Error</h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <ModeSwitcher />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative">
          {simulationLoading && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg px-6 py-3 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-gray-700">Running simulation...</span>
            </div>
          )}
          <InteractiveMap />
        </div>

        {/* Sidebar Panels */}
        <div className="relative">
          {/* Historical Replay Panel */}
          {currentMode === 'historical-replay' && <HistoricalReplayPanel />}

          {/* What-If Simulation Panel */}
          {currentMode === 'what-if' && <WhatIfSimulationPanel />}

          {/* Saved Plans Panel */}
          {currentMode === 'saved-plans' && <SavedPlansPanel />}

          {/* Simulation Results Panel */}
          {currentSimulationResult && <SimulationResultsPanel />}

          {/* Show event selector if in historical mode but no event selected */}
          {currentMode === 'historical-replay' && !currentSimulationResult && <HistoricalEventsPanel />}

          {/* Show event selector in explore mode */}
          {currentMode === 'explore' && <HistoricalEventsPanel />}
        </div>
      </div>

      {/* Legend - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 text-xs z-30">
        <h3 className="font-bold text-gray-900 mb-2">Legend</h3>
        <div className="space-y-2 text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Functional / Reachable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Stressed / Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Failed / Cut Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-gray-400"></div>
            <span>Road Status</span>
          </div>
        </div>
      </div>

      {/* Backend Status Indicator - Top Right */}
      {!backendConnected && (
        <div className="absolute top-24 right-4 bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded text-xs font-semibold z-30">
          ⚠ Backend Disconnected
        </div>
      )}
    </div>
  );
}

export default App;
