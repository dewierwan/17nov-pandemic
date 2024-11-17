import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onReset: () => void;
}

export default function SimulationControls({ 
  isRunning, 
  onToggleSimulation, 
  onReset
}: SimulationControlsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-center space-x-4">
        <button
          onClick={onToggleSimulation}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRunning
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause Simulation</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start Simulation</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset Simulation</span>
        </button>
      </div>
    </div>
  );
}