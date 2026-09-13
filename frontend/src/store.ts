import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // UI State
  currentMode: 'explore', // 'explore', 'historical-replay', 'what-if', 'saved-plans'
  selectedHistoricalEvent: null,
  selectedRegion: 'Ernakulam District',
  timelineProgress: 0, // 0-100 for replay mode
  
  // Simulation State
  simulationActive: false,
  simulationLoading: false,
  failedRoads: [],
  failedFacilities: [],
  
  // Data
  networkGraph: null,
  historicalEvents: [],
  savedPlans: [],
  currentSimulationResult: null,
  
  // UI Actions
  setMode: (mode) => set({ currentMode: mode }),
  setRegion: (region) => set({ selectedRegion: region }),
  setHistoricalEvent: (event) => set({ selectedHistoricalEvent: event }),
  setTimelineProgress: (progress) => set({ timelineProgress: progress }),
  
  // Simulation Actions
  setSimulationActive: (active) => set({ simulationActive: active }),
  setSimulationLoading: (loading) => set({ simulationLoading: loading }),
  setFailedRoads: (roads) => set({ failedRoads: roads }),
  setFailedFacilities: (facilities) => set({ failedFacilities: facilities }),
  
  // Data Actions
  setNetworkGraph: (graph) => set({ networkGraph: graph }),
  setHistoricalEvents: (events) => set({ historicalEvents: events }),
  setSavedPlans: (plans) => set({ savedPlans: plans }),
  setCurrentSimulationResult: (result) => set({ currentSimulationResult: result }),
  
  // Reset
  reset: () => set({
    simulationActive: false,
    simulationLoading: false,
    failedRoads: [],
    failedFacilities: [],
    timelineProgress: 0,
    currentSimulationResult: null
  })
}));
