import { useEffect } from 'react';
import { SimulationConfig, PolicyOption } from '../../../types';
import { useSimulationStore } from '../store/simulationStore';

export function useSimulation() {
  const {
    state,
    config,
    reset,
    toggleSimulation,
    updateConfig,
    implementPolicy,
    usedPolicies,
    activePolicies
  } = useSimulationStore();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (state.isRunning) {
        toggleSimulation();
      }
    };
  }, [state.isRunning, toggleSimulation]);

  return {
    state,
    config,
    reset,
    toggleSimulation,
    updateConfig,
    implementPolicy,
    usedPolicies,
    activePolicies
  };
}
