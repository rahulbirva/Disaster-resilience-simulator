import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store';
import { AlertTriangle, Hospital, Home, Zap } from 'lucide-react';

// Custom marker icons
const getMarkerIcon = (type: string, status: string = 'functional') => {
  let html = '';
  let className = '';
  
  switch(type) {
    case 'hospital':
      className = status === 'functional' ? 'bg-green-500' : status === 'delayed' ? 'bg-yellow-500' : 'bg-red-500';
      html = `<div class="${className} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">H</div>`;
      break;
    case 'shelter':
      className = status === 'functional' ? 'bg-green-500' : status === 'delayed' ? 'bg-yellow-500' : 'bg-red-500';
      html = `<div class="${className} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>`;
      break;
    case 'fire_station':
      html = `<div class="bg-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">F</div>`;
      break;
    case 'event':
      html = `<div class="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-white">📍</div>`;
      break;
    default:
      html = `<div class="bg-gray-400 w-6 h-6 rounded-full"></div>`;
  }
  
  return L.divIcon({
    html,
    iconSize: [32, 32],
    className: 'custom-marker'
  });
};

export const InteractiveMap: React.FC = () => {
  const { networkGraph, failedRoads, failedFacilities, selectedHistoricalEvent, currentMode, timelineProgress } = useAppStore();
  
  if (!networkGraph) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading map data...</p>
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Get failed roads and facilities based on mode
  let displayedFailedRoads = failedRoads;
  let displayedFailedFacilities = failedFacilities;

  // In historical replay mode, show timeline-based status
  if (currentMode === 'historical-replay' && selectedHistoricalEvent) {
    // Timeline data comes from the HistoricalReplayPanel which updates failedRoads/failedFacilities
    // We just use the displayedFailedRoads and displayedFailedFacilities as they are
  }

  const center = [networkGraph.metadata.center.lat, networkGraph.metadata.center.lng];

  return (
    <MapContainer 
      center={center as [number, number]} 
      zoom={networkGraph.metadata.zoom || 11} 
      style={{ width: '100%', height: '100%' }}
      className="z-10"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Render Roads (Edges) */}
      {networkGraph.edges && networkGraph.edges.map((edge: any) => {
        const fromNode = networkGraph.nodes.find((n: any) => n.id === edge.from);
        const toNode = networkGraph.nodes.find((n: any) => n.id === edge.to);
        
        if (!fromNode || !toNode) return null;

        const isFailed = displayedFailedRoads.includes(edge.id);
        const color = isFailed ? '#ef4444' : '#9ca3af';
        const weight = isFailed ? 4 : 3;
        const dashArray = isFailed ? '5, 5' : undefined;

        return (
          <Polyline
            key={edge.id}
            positions={[[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]]}
            color={color}
            weight={weight}
            dashArray={dashArray}
            opacity={0.7}
            eventHandlers={{
              click: () => {
                alert(`Road: ${edge.label}\nStatus: ${isFailed ? 'FAILED' : 'FUNCTIONAL'}\nCapacity: ${edge.capacity}`);
              }
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{edge.label}</p>
                <p className="text-gray-600">Length: {edge.length} km</p>
                <p className="text-gray-600">Capacity: {edge.capacity}</p>
                <p className={`font-bold ${isFailed ? 'text-red-600' : 'text-green-600'}`}>
                  {isFailed ? 'FAILED' : 'FUNCTIONAL'}
                </p>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* Render Facilities (Nodes) */}
      {networkGraph.nodes && networkGraph.nodes.map((node: any) => {
        if (node.type === 'intersection') return null;

        const isFailed = displayedFailedFacilities.includes(node.id);
        const status = isFailed ? 'failed' : 'functional';

        return (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={getMarkerIcon(node.type, status)}
          >
            <Popup>
              <div className="text-sm font-semibold">
                <p>{node.label}</p>
                <p className="text-gray-600 text-xs mt-1">Type: {node.type.replace('_', ' ')}</p>
                {node.capacity && <p className="text-gray-600 text-xs">Capacity: {node.capacity}</p>}
                <p className={`text-xs font-bold mt-2 ${isFailed ? 'text-red-600' : 'text-green-600'}`}>
                  {isFailed ? '⚠ CUT OFF' : '✓ FUNCTIONAL'}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Historical event marker */}
      {selectedHistoricalEvent && (
        <Marker
          position={[selectedHistoricalEvent.coordinates.lat, selectedHistoricalEvent.coordinates.lng]}
          icon={getMarkerIcon('event')}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{selectedHistoricalEvent.name}</p>
              <p className="text-gray-600">{selectedHistoricalEvent.date_range}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Residential areas/population centers */}
      {networkGraph.nodes && networkGraph.nodes
        .filter((n: any) => n.type === 'intersection' && n.population > 0)
        .map((node: any) => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={getMarkerIcon('intersection')}
          >
            <Popup>
              <div className="text-sm font-semibold">
                <p>{node.label}</p>
                <p className="text-gray-600 text-xs mt-1">Population: ~{node.population}</p>
              </div>
            </Popup>
          </Marker>
        ))
      }
    </MapContainer>
  );
};
