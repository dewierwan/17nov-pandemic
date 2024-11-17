import React from 'react';
import { Bug } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PolicySelector from './components/PolicySelector';
import SimulationControls from './components/SimulationControls';
import ConfigPanel from './components/ConfigPanel';
import TimeSeriesGraph from './components/TimeSeriesGraph';
import EconomicBreakdown from './components/EconomicBreakdown';
import { policyOptions } from './data/policies';
import { useSimulation } from './hooks/useSimulation';

function App() {
  const { state, config, togglePolicy, reset, toggleSimulation, updateConfig, startVaccination } = useSimulation();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Bug className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Pandemic Response Simulator</h1>
          </div>
          <p className="mt-2 text-gray-600">Make quick decisions to control the pandemic while minimizing economic impact!</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 space-y-6 px-4">
        <SimulationControls
          isRunning={state.isRunning}
          onToggleSimulation={toggleSimulation}
          onReset={reset}
        />
        
        {!state.isRunning && (
          <ConfigPanel
            config={config}
            onConfigChange={updateConfig}
            disabled={state.isRunning}
          />
        )}
        
        <Dashboard state={state} />
        
        <TimeSeriesGraph data={state.timeSeriesData} />
        
        <PolicySelector
          policies={policyOptions}
          activePolicies={state.activePolicies}
          onSelectPolicy={togglePolicy}
          onStartVaccination={startVaccination}
          isVaccinationStarted={state.isVaccinationStarted}
        />

        <EconomicBreakdown state={state} config={config} />
      </main>
    </div>
  );
}

export default App;