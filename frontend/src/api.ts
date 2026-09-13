import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Network/Graph endpoints
export const getNetworkGraph = (region: string) =>
  api.get(`/network/${encodeURIComponent(region)}`);

export const storeNetworkGraph = (region: string, graphData: any) =>
  api.post(`/network/${encodeURIComponent(region)}`, graphData);

// Historical events
export const getHistoricalEvents = () =>
  api.get('/events');

export const getHistoricalEvent = (event_id: string) =>
  api.get(`/events/${event_id}`);

export const storeHistoricalEvent = (eventData: any) =>
  api.post('/events', eventData);

// Replay/Simulation
export const getReplay = (event_id: string, timestamp?: string) => {
  const params = new URLSearchParams();
  if (timestamp) params.append('timestamp', timestamp);
  return api.get(`/replay/${event_id}?${params}`);
};

export const runSimulation = (simulationData: any) =>
  api.post('/simulate', simulationData);

// Saved plans
export const getSavedPlans = () =>
  api.get('/plans');

export const getSavedPlansByRegion = (region: string) =>
  api.get(`/plans/${encodeURIComponent(region)}`);

export const savePlan = (planData: any) =>
  api.post('/plans', planData);

export const updatePlanStatus = (planId: string, status: string) =>
  api.patch(`/plans/${planId}`, { status });

// Health check
export const checkHealth = () =>
  api.get('/health');

export default api;
