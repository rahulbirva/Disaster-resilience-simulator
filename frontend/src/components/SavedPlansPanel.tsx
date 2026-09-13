import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getSavedPlans, updatePlanStatus } from '../api';
import { SaveIcon, Trash2 } from 'lucide-react';

export const SavedPlansPanel: React.FC = () => {
  const { savedPlans, setSavedPlans, selectedRegion } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await getSavedPlans();
      setSavedPlans(response.data || []);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (planId: string, newStatus: string) => {
    setUpdatingId(planId);
    try {
      await updatePlanStatus(planId, newStatus);
      const updated = savedPlans.map(p =>
        p.id === planId ? { ...p, status: newStatus } : p
      );
      setSavedPlans(updated);
    } catch (error) {
      console.error('Error updating plan status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['Not Started', 'In Progress', 'Completed'];

  const filteredPlans = savedPlans.filter(p => p.region === selectedRegion);
  const sortedPlans = [...filteredPlans].sort((a, b) =>
    (b.predicted_impact?.population_isolated || 0) - (a.predicted_impact?.population_isolated || 0)
  );

  return (
    <div className="absolute top-20 right-4 w-96 bg-white rounded-lg shadow-2xl z-40 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 flex items-center gap-2">
        <SaveIcon size={20} />
        <div>
          <h2 className="text-lg font-bold">Saved Plans</h2>
          <p className="text-green-100 text-xs">{selectedRegion} - {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Plans List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-600">
            <p>Loading plans...</p>
          </div>
        ) : sortedPlans.length > 0 ? (
          sortedPlans.map((plan) => (
            <div key={plan.id} className="border-b last:border-b-0 p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{plan.scenario_type}</h3>
                  <p className="text-xs text-gray-600">
                    {plan.disaster_type} - {plan.severity}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                  plan.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  plan.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {plan.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="bg-gray-50 rounded p-2 mb-2 text-xs text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Roads Failed:</span>
                  <span className="font-semibold">{plan.roads_failed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Population Isolated:</span>
                  <span className="font-semibold">{plan.population_isolated?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended:</span>
                  <span className="font-semibold truncate text-right">{plan.recommended_action}</span>
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="flex gap-2">
                <select
                  value={plan.status}
                  onChange={(e) => handleStatusChange(plan.id, e.target.value)}
                  disabled={updatingId === plan.id}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(plan.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-600">
            <p>No saved plans yet</p>
            <p className="text-xs mt-1">Run a simulation to save intervention plans</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t bg-green-50 p-3 text-xs text-gray-700">
        <p>💾 Plans are sorted by potential impact (population isolated)</p>
      </div>
    </div>
  );
};
