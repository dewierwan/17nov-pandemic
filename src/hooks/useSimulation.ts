import { useState, useEffect, useCallback } from 'react';
import { SimulationState, SimulationConfig, PolicyOption } from '../types';
import { calculateEconomicImpact } from '../utils/economics';
import { calculateDisease } from '../utils/disease';
import { calculateVaccination } from '../utils/vaccination';
import { getInitialState } from '../utils/state';

export function useSimulation() {
  const [config, setConfig] = useState<SimulationConfig>({
    population: 100_000_000,
    initialR0: 3,
    mortalityRate: 0.02,
    incubationDays: 5,
    recoveryDays: 14,
    seasonalityAmplitude: 0.2,
    complianceFatigue: 0.1,
    daysPerSecond: 10,
    economicCostPerDeath: 5_000_000
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

  const startVaccination = useCallback(() => {
    setState(currentState => {
      if (currentState.isVaccinationStarted) return currentState;

      const vaccinationPolicy = {
        id: 'vaccination',
        name: 'Vaccination Program',
        description: 'Nationwide vaccination program',
        economicImpact: 0,
        transmissionReduction: 0,
        socialCost: 0,
        implementationDelay: 100,
        dailyCostPerPerson: 0
      };

      return {
        ...currentState,
        isVaccinationStarted: true,
        vaccinationStartDay: currentState.day + 1,
        totalCosts: currentState.totalCosts + 10_000_000_000, // Add R&D cost
        vaccineCosts: currentState.vaccineCosts + 10_000_000_000,
        activePolicies: [...currentState.activePolicies, vaccinationPolicy]
      };
    });
  }, []);

  const togglePolicy = useCallback((policy: PolicyOption) => {
    setState(currentState => {
      const isActive = currentState.activePolicies.some(p => p.id === policy.id);
      
      return {
        ...currentState,
        activePolicies: isActive 
          ? currentState.activePolicies.filter(p => p.id !== policy.id)
          : [...currentState.activePolicies, policy],
      };
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isRunning) {
      interval = setInterval(() => {
        setState(currentState => {
          // Calculate disease progression
          const diseaseUpdates = calculateDisease(currentState, config);
          
          // Calculate vaccination effects
          const vaccinationUpdates = calculateVaccination(currentState);
          
          // Calculate economic impact
          const economicUpdates = calculateEconomicImpact(currentState, config, {
            ...diseaseUpdates,
            ...vaccinationUpdates
          });

          // Combine all updates
          const newState = {
            ...currentState,
            ...diseaseUpdates,
            ...vaccinationUpdates,
            ...economicUpdates,
            day: currentState.day + 1,
          };

          // Update time series data
          newState.timeSeriesData = [...currentState.timeSeriesData, {
            day: newState.day,
            susceptible: newState.susceptible,
            exposed: newState.exposed,
            infected: newState.infected,
            recovered: newState.recovered,
            deceased: newState.deceased,
            totalCases: newState.totalCases,
            gdpImpact: newState.totalCosts,
            r0: newState.r0,
            re: newState.re,
            policyCosts: newState.policyCosts,
            deathCosts: newState.deathCosts,
            vaccineCosts: newState.vaccineCosts
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
    togglePolicy,
    reset,
    toggleSimulation,
    updateConfig,
    startVaccination
  };
}