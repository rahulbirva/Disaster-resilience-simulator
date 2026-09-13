import React from 'react';
import { useAppStore } from '../store';
import { X, TrendingDown, AlertTriangle, Users, Clock, Save } from 'lucide-react';
import { savePlan } from '../api';

// Simple UUID generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const SimulationResultsPanel: React.FC = () => {
  const { currentSimulationResult, selectedRegion, reset } = useAppStore();
  const [saving, setSaving] = React.useState(false);

  if (!currentSimulationResult) return null;

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const planData = {
        id: generateId(),
        region: selectedRegion,
        scenario_type: currentSimulationResult.scenario_type,
        disaster_type: currentSimulationResult.disaster_type || 'Hypothetical',
        severity: currentSimulationResult.severity || 'Unknown',
        predicted_impact: {
          roads_failed: currentSimulationResult.simulation.roads_failed,
          facilities_cut_off: currentSimulationResult.simulation.facilities_cut_off,
          population_isolated: currentSimulationResult.simulation.population_isolated,
          avg_response_time_min: currentSimulationResult.simulation.avg_response_time_min
        },
        recommended_action: currentSimulationResult.recommendation?.action || 'N/A',
        estimated_benefit: {
          response_time_after_min: currentSimulationResult.benefit_with_recommendation?.avg_response_time_min || 0,
          population_isolated_after: currentSimulationResult.benefit_with_recommendation?.population_isolated || 0
        },
        simulation_data: currentSimulationResult
      };

      await savePlan(planData);
      alert('Plan saved successfully!');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error saving plan');
    } finally {
      setSaving(false);
    }
  };

  const {
    simulation,
    benefit_with_recommendation,
    recommendation,
    impact_reduction
  } = currentSimulationResult;

  return (
    <div className="absolute top-20 right-4 w-96 bg-white rounded-lg shadow-2xl z-40 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Simulation Results</h2>
          <p className="text-indigo-100 text-xs">{currentSimulationResult.scenario_type}</p>
        </div>
        <button onClick={reset} className="hover:bg-indigo-700 p-1 rounded">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Immediate Impact */}
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            Immediate Impact
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Roads Failed:</span>
              <span className="font-bold text-red-700">{simulation.roads_failed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Facilities Cut Off:</span>
              <span className="font-bold text-red-700">{simulation.facilities_cut_off}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Population Isolated:</span>
              <span className="font-bold text-red-700">{simulation.population_isolated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Avg Response Time:</span>
              <span className="font-bold text-red-700">{simulation.avg_response_time_min.toFixed(1)} min</span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Recommended Action</h3>
            <p className="text-sm text-gray-800 mb-2">{recommendation.action}</p>
            <p className="text-xs text-gray-600">Criticality Score: {recommendation.criticality_score}</p>
          </div>
        )}

        {/* Projected Benefit */}
        {benefit_with_recommendation && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <TrendingDown size={16} />
              Projected Benefit
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Population Isolated:</span>
                <div className="text-right">
                  <div className="font-bold text-red-700">{simulation.population_isolated.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">→ {benefit_with_recommendation.population_isolated.toLocaleString()}</div>
                  <div className="text-xs font-bold text-green-700">
                    -{impact_reduction.population_isolated.toLocaleString()} (-{
                      ((impact_reduction.population_isolated / simulation.population_isolated) * 100).toFixed(1)
                    }%)
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Response Time:</span>
                <div className="text-right">
                  <div className="font-bold text-red-700">{simulation.avg_response_time_min.toFixed(1)} min</div>
                  <div className="text-xs text-gray-600">→ {benefit_with_recommendation.avg_response_time_min.toFixed(1)} min</div>
                  <div className="text-xs font-bold text-green-700">
                    -{impact_reduction.avg_response_time.toFixed(1)} min (-{
                      ((impact_reduction.avg_response_time / simulation.avg_response_time_min) * 100).toFixed(1)
                    }%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <div className="space-y-2 text-xs text-gray-700">
            <p>• Cascading failures: {simulation.iterations_to_stabilize} iterations</p>
            <p>• Total failed roads: {simulation.roads_failed}</p>
            <p>• Hospitals affected: {simulation.hospitals_cut_off}</p>
            <p>• Shelters affected: {simulation.shelters_cut_off}</p>
          </div>
        </div>
      </div>

      {/* Footer - Save Button */}
      <div className="border-t bg-gradient-to-b from-indigo-50 to-indigo-100 p-4 space-y-2">
        <button
          onClick={handleSavePlan}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded font-bold flex items-center justify-center gap-2 transition text-lg shadow-md"
        >
          <Save size={20} />
          {saving ? 'Saving Plan...' : 'Save This Intervention Plan'}
        </button>
        <p className="text-xs text-indigo-700 text-center">
          💾 Save this scenario as a plan to track implementation progress and compare multiple strategies
        </p>
      </div>
    </div>
  );
};
