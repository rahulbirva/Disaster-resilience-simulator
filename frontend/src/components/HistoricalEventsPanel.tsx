import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getHistoricalEvents } from '../api';
import { BookOpen } from 'lucide-react';

export const HistoricalEventsPanel: React.FC = () => {
  const { historicalEvents, setHistoricalEvents, selectedHistoricalEvent, setHistoricalEvent, currentMode, setMode } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (historicalEvents.length === 0) {
      loadEvents();
    }
  }, [historicalEvents.length]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await getHistoricalEvents();
      setHistoricalEvents(response.data);
    } catch (error) {
      console.error('Error loading historical events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: any) => {
    setHistoricalEvent(event);
    setMode('historical-replay');
  };

  if (loading) {
    return (
      <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-2xl z-40 p-4">
        <p className="text-gray-600">Loading historical events...</p>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-4 w-96 bg-white rounded-lg shadow-2xl z-40 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-4 flex items-center gap-2">
        <BookOpen size={20} />
        <div>
          <h2 className="text-lg font-bold">Historical Events</h2>
          <p className="text-amber-100 text-xs">Select an event to replay</p>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto">
        {historicalEvents && historicalEvents.length > 0 ? (
          historicalEvents.map((event: any, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSelectEvent(event)}
              className={`w-full text-left border-b last:border-b-0 p-4 hover:bg-amber-50 transition ${
                selectedHistoricalEvent?.event_id === event.event_id ? 'bg-amber-100' : ''
              }`}
            >
              <h3 className="font-semibold text-gray-900">{event.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{event.region}</p>
              <p className="text-xs text-gray-500 mt-1">{event.date_range}</p>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{event.sources_note}</p>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-gray-600">
            <p>No historical events available</p>
            <button
              onClick={loadEvents}
              className="text-sm text-amber-600 hover:text-amber-800 mt-2 font-semibold"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="border-t bg-amber-50 p-3 text-xs text-gray-700">
        <p>📌 Click an event to replay it with the timeline slider</p>
      </div>
    </div>
  );
};
