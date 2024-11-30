import { useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';

export function useSimulation() {
  const store = useSimulationStore();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (store.state.isRunning) {
        store.stopSimulation();
      }
    };
  }, [store.state.isRunning, store.stopSimulation]);

  return store;
}
