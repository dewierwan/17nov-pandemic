import React from 'react';
import { SimulationState } from '../../types';

interface GameOverProps {
  state: SimulationState;
  onTryAgain: () => void;
}

function GameOver({ state, onTryAgain }: GameOverProps) {
  const deathPercentage = ((state.deceased / state.population) * 100).toFixed(2);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {state.hasWon ? 'Victory!' : 'Game Over'}
        </h2>
        
        <div className="space-y-4 mb-6">
          <div className="border-b pb-2">
            <p className="text-gray-600">Total Deaths</p>
            <p className="text-xl font-semibold">{state.deceased.toLocaleString()} ({deathPercentage}% of population)</p>
          </div>
          
          <div className="border-b pb-2">
            <p className="text-gray-600">Total Economic Cost</p>
            <p className="text-xl font-semibold">
              ${(state.totalCosts / 1e9).toFixed(2)} billion
            </p>
          </div>

          {state.hasWon && (
            <div className="text-green-600 text-center">
              Congratulations! You've successfully contained the outbreak.
            </div>
          )}
        </div>

        <button
          onClick={onTryAgain}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default GameOver;
