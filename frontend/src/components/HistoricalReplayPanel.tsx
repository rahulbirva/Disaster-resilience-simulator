import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getReplay } from '../api';
import { X, Play, Pause, RotateCcw, Lightbulb, TrendingDown } from 'lucide-react';

export const HistoricalReplayPanel: React.FC = () => {
  const { selectedHistoricalEvent, timelineProgress, setTimelineProgress, setFailedRoads, setFailedFacilities, reset } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const timelineEntries = selectedHistoricalEvent?.timeline || [];
  const interventionDetails = selectedHistoricalEvent?.intervention_details ? 
    JSON.parse(selectedHistoricalEvent.intervention_details) : null;

  useEffect(() => {
    if (!isPlaying || !timelineEntries.length) return;

    const interval = setInterval(() => {
      setTimelineProgress(prev => {
        const next = prev + 2;
        return next >= 100 ? 100 : next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, timelineEntries.length, setTimelineProgress]);

  useEffect(() => {
    const index = Math.floor((timelineProgress / 100) * (timelineEntries.length - 1));
    const entry = timelineEntries[Math.min(index, timelineEntries.length - 1)];
    
    if (entry) {
      setCurrentEntry(entry);
      setFailedRoads(entry.affected_roads || []);
      setFailedFacilities(entry.affected_facilities || []);
    }
  }, [timelineProgress, timelineEntries, setFailedRoads, setFailedFacilities]);

  if (!selectedHistoricalEvent) return null;

  return (
    <div className="absolute top-20 right-4 w-96 bg-white rounded-lg shadow-2xl z-40 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{selectedHistoricalEvent.name}</h2>
            <p className="text-blue-100 text-sm">{selectedHistoricalEvent.date_range}</p>
          </div>
          <button onClick={reset} className="hover:bg-blue-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center gap-2"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => {
              setTimelineProgress(0);
              setIsPlaying(false);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={timelineProgress}
          onChange={(e) => {
            setTimelineProgress(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="w-full cursor-pointer"
        />
        <p className="text-xs text-gray-600 mt-1">{timelineProgress}% of timeline</p>
      </div>

      {/* Content - Tabs */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Timeline Entry */}
        <div className="p-4 space-y-3 border-b">
          {currentEntry && (
            <>
              <div>
                <p className="text-xs text-gray-500 font-semibold">TIMESTAMP</p>
                <p className="text-sm">{new Date(currentEntry.timestamp).toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 font-semibold">EVENT</p>
                <p className="text-sm leading-relaxed">{currentEntry.description}</p>
              </div>

              {currentEntry.affected_roads && currentEntry.affected_roads.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold">FAILED ROADS ({currentEntry.affected_roads.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {currentEntry.affected_roads.map((road: string, idx: number) => (
                      <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {road}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentEntry.affected_facilities && currentEntry.affected_facilities.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold">AFFECTED FACILITIES ({currentEntry.affected_facilities.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {currentEntry.affected_facilities.map((fac: string, idx: number) => (
                      <span key={idx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentEntry.hazard_intensity && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold">HAZARD INTENSITY</p>
                  <p className={`text-sm font-bold ${
                    currentEntry.hazard_intensity === 'Severe' ? 'text-red-600' :
                    currentEntry.hazard_intensity === 'High' ? 'text-orange-600' :
                    currentEntry.hazard_intensity === 'Moderate' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {currentEntry.hazard_intensity}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recommended Intervention */}
        {interventionDetails && (
          <div className="p-4 space-y-3 border-b bg-green-50">
            <button
              onClick={() => setShowRecommendation(!showRecommendation)}
              className="w-full flex items-center gap-2 text-green-900 font-semibold hover:text-green-700"
            >
              <Lightbulb size={18} className="text-green-600" />
              <span>What Could Have Been Done</span>
              <span className="ml-auto text-xs">
                {showRecommendation ? '−' : '+'}
              </span>
            </button>

            {showRecommendation && (
              <div className="space-y-3 mt-2 border-t-2 border-green-200 pt-3">
                <div>
                  <p className="text-sm font-semibold text-green-900">💡 Recommended Intervention:</p>
                  <p className="text-sm text-green-800 mt-1">{interventionDetails.intervention}</p>
                  <p className="text-xs text-green-700 mt-1 italic">{interventionDetails.reason}</p>
                </div>

                {/* Impact Comparison */}
                <div className="bg-white rounded p-3 border border-green-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <TrendingDown size={14} /> Impact Reduction
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Roads Failed:</span>
                      <span>
                        <span className="text-red-600 font-bold">{interventionDetails.impact_comparison.roads_failed.real}</span>
                        <span className="text-gray-500 mx-1">→</span>
                        <span className="text-green-600 font-bold">{interventionDetails.impact_comparison.roads_failed.prevented}</span>
                        <span className="text-green-700 font-semibold ml-2">(-{interventionDetails.impact_comparison.roads_failed.reduction}%)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Hospitals Cut Off:</span>
                      <span>
                        <span className="text-red-600 font-bold">{interventionDetails.impact_comparison.hospitals_cut_off.real}</span>
                        <span className="text-gray-500 mx-1">→</span>
                        <span className="text-green-600 font-bold">{interventionDetails.impact_comparison.hospitals_cut_off.prevented}</span>
                        <span className="text-green-700 font-semibold ml-2">(-{interventionDetails.impact_comparison.hospitals_cut_off.reduction}%)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Population Isolated:</span>
                      <span>
                        <span className="text-red-600 font-bold">{interventionDetails.impact_comparison.population_isolated.real.toLocaleString()}</span>
                        <span className="text-gray-500 mx-1">→</span>
                        <span className="text-green-600 font-bold">{interventionDetails.impact_comparison.population_isolated.prevented.toLocaleString()}</span>
                        <span className="text-green-700 font-semibold ml-2">(-{interventionDetails.impact_comparison.population_isolated.reduction}%)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Response Time:</span>
                      <span>
                        <span className="text-red-600 font-bold">{interventionDetails.impact_comparison.avg_response_time_min.real} min</span>
                        <span className="text-gray-500 mx-1">→</span>
                        <span className="text-green-600 font-bold">{interventionDetails.impact_comparison.avg_response_time_min.prevented} min</span>
                        <span className="text-green-700 font-semibold ml-2">(-{interventionDetails.impact_comparison.avg_response_time_min.reduction}%)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-green-700 italic">
                  This analysis shows what infrastructure interventions would have most effectively prevented or minimized the impact of this disaster.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
