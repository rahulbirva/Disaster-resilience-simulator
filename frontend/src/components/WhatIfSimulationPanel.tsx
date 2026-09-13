import React, { useState } from 'react';
import { useAppStore } from '../store';
import { runSimulation } from '../api';
import { Zap, AlertTriangle, Save } from 'lucide-react';

export const WhatIfSimulationPanel: React.FC = () => {
  const { networkGraph, selectedRegion, setCurrentSimulationResult, setSimulationLoading, setFailedRoads } = useAppStore();
  const [selectedDisaster, setSelectedDisaster] = useState('flood');
  const [selectedSeverity, setSelectedSeverity] = useState('moderate');
  const [selectedRoad, setSelectedRoad] = useState('');
  const [loading, setLoading] = useState(false);

  const disasters = [
    { id: 'flood', label: 'Flood' },
    { id: 'earthquake', label: 'Earthquake' },
    { id: 'bridge_collapse', label: 'Bridge Collapse' },
    { id: 'landslide', label: 'Landslide' }
  ];

  const severities = [
    { id: 'minor', label: 'Minor', failureCount: 1 },
    { id: 'moderate', label: 'Moderate', failureCount: 2 },
    { id: 'severe', label: 'Severe', failureCount: 4 }
  ];

  const handleRunSimulation = async () => {
    if (!selectedRoad) {
      alert('Please select a road/area to simulate failure on');
      return;
    }

    setLoading(true);
    setSimulationLoading(true);

    try {
      const failedEdges = [selectedRoad];

      const response = await runSimulation({
        scenario_type: 'Predictive What-If',
        region: selectedRegion,
        failed_edges: failedEdges,
        severity: selectedSeverity
      });

      setCurrentSimulationResult({
        ...response.data,
        disaster_type: selectedDisaster,
        severity: selectedSeverity
      });

      setFailedRoads(response.data.simulation.failed_edges);
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Error running simulation');
    } finally {
      setLoading(false);
      setSimulationLoading(false);
    }
  };

  if (!networkGraph) {
    return (
      <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-2xl z-40 p-4">
        <p className="text-gray-600">Loading network data...</p>
      </div>
    );
  }

  const roads = networkGraph.edges || [];

  return (
    <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-2xl z-40 overflow-hidden flex flex-col max-h-96">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 flex items-center gap-2">
        <Zap size={20} />
        <div>
          <h2 className="text-lg font-bold">What-If Simulation</h2>
          <p className="text-purple-100 text-xs">Test hypothetical scenarios</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Disaster Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Disaster Type</label>
          <select
            value={selectedDisaster}
            onChange={(e) => setSelectedDisaster(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
          >
            {disasters.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level</label>
          <div className="space-y-2">
            {severities.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="severity"
                  value={s.id}
                  checked={selectedSeverity === s.id}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-4 h-4"
                />
                <span>{s.label}</span>
                <span className="text-xs text-gray-500">({s.failureCount} road{s.failureCount > 1 ? 's' : ''})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Select Road/Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Critical Road/Area</label>
          <select
            value={selectedRoad}
            onChange={(e) => setSelectedRoad(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">-- Select a road --</option>
            {roads.map((road: any) => (
              <option key={road.id} value={road.id}>
                {road.label} ({road.id})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">Select the primary point of failure</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex gap-2">
          <AlertTriangle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold">Cascading Failure Simulation</p>
            <p className="mt-1">Shows how failures propagate through your infrastructure network when a critical road is impacted.</p>
          </div>
        </div>

        {/* Save Info Box */}
        <div className="bg-green-50 border border-green-200 rounded p-3 flex gap-2">
          <Save size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-green-800">
            <p className="font-semibold">💡 Tip: Save Scenarios as Plans</p>
            <p className="mt-1">After running a simulation, save your intervention scenarios as plans to track implementation progress and compare multiple strategies.</p>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="border-t p-4 bg-gradient-to-b from-white to-purple-50">
        <button
          onClick={handleRunSimulation}
          disabled={loading || !selectedRoad}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
        >
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
};
