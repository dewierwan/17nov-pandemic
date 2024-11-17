import { useState, useEffect, useCallback } from 'react';
import { SimulationState, SimulationConfig } from '../types';
import { calculateDisease } from '../utils/disease';
import { calculateEconomicImpact } from '../utils/economics';
import { getInitialState } from '../utils/state';

export function useSimulation() {
  const [config, setConfig] = useState<SimulationConfig>({
    population: 10_000_000,
    initialR0: 8,
    mortalityRate: 0.05,
    recoveryDays: 14,
    daysPerSecond: 29,
    economicCostPerDeath: 1_000_000
  });

  const [state, setState] = useState<SimulationState>(getInitialState(config));

  const reset = useCallback(() => {
    setState(getInitialState(config));
  }, [config]);

  const toggleSimulation = useCallback(() => {
    setState(current => ({ ...current, isRunning: !current.isRunning }));
  }, []);

  const updateConfig = useCallback((newConfig: SimulationConfig) => {
    setConfig(newConfig);
    setState(current => ({
      ...getInitialState(newConfig),
      isRunning: current.isRunning
    }));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isRunning) {
      interval = setInterval(() => {
        setState(currentState => {
          // Calculate disease progression
          const diseaseUpdates = calculateDisease(currentState, config);
          
          // Calculate economic impact
          const economicUpdates = calculateEconomicImpact(currentState, config, diseaseUpdates);
          
          // Combine all updates
          const newState = {
            ...currentState,
            ...diseaseUpdates,
            ...economicUpdates,
            day: currentState.day + 1,
          };

          // Update time series data
          newState.timeSeriesData = [...currentState.timeSeriesData, {
            day: newState.day,
            susceptible: newState.susceptible,
            infected: newState.infected,
            recovered: newState.recovered,
            deceased: newState.deceased,
            totalCases: newState.totalCases,
            r0: newState.r0,
            re: newState.re,
            economicCost: newState.totalCosts
          }];

          return newState;
        });
      }, 1000 / config.daysPerSecond);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning, config]);

  return {
    state,
    config,
    reset,
    toggleSimulation,
    updateConfig
  };
}