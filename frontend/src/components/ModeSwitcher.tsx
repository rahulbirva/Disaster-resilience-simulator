import React from 'react';
import { useAppStore } from '../store';
import { Map, RotateCcw, Zap, BookOpen, SaveIcon } from 'lucide-react';

export const ModeSwitcher: React.FC = () => {
  const { currentMode, setMode, reset, selectedRegion } = useAppStore();

  const modes = [
    { id: 'explore', label: 'Explore', icon: Map, description: 'Interactive simulation' },
    { id: 'historical-replay', label: 'Historical Replay', icon: RotateCcw, description: 'Replay past events' },
    { id: 'what-if', label: 'What-If Scenario', icon: Zap, description: 'Test hypothetical disasters' },
    { id: 'saved-plans', label: 'Saved Plans', icon: SaveIcon, description: 'View intervention plans' }
  ];

  const handleModeChange = (mode: string) => {
    setMode(mode);
    reset();
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Title and Region */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Resilience</h1>
          <p className="text-sm text-gray-600">Disaster-Aware Infrastructure Resilience Simulator</p>
          <p className="text-xs font-semibold text-blue-600 mt-1">Region: {selectedRegion}</p>
        </div>

        {/* Mode Buttons */}
        <div className="flex gap-2 flex-wrap">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
