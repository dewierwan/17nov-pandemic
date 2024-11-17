import { Bug } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SimulationControls from './components/SimulationControls';
import ConfigPanel from './components/ConfigPanel';
import TimeSeriesGraph from './components/TimeSeriesGraph';
import PolicySelector from './components/PolicySelector';
import DailyStatsGraph from './components/DailyStatsGraph';
import { useSimulation } from './hooks/useSimulation';

function App() {
  const { 
    state, 
    config, 
    reset, 
    toggleSimulation, 
    updateConfig, 
    implementPolicy, 
    usedPolicies,
    activePolicies 
  } = useSimulation();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Bug className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Disease Simulator</h1>
          </div>
          <p className="mt-2 text-gray-600">Simulate the spread of an infectious disease in a population</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeSeriesGraph data={state.timeSeriesData} />
          <DailyStatsGraph data={state.timeSeriesData} />
        </div>
        
        <PolicySelector 
          onSelectPolicy={implementPolicy}
          usedPolicies={usedPolicies}
          activePolicies={activePolicies}
        />
      </main>
    </div>
  );
}

export default App;