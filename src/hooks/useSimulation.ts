import { useState, useEffect, useCallback } from 'react';
import { SimulationState, SimulationConfig, PolicyOption } from '../types';
import { calculateDisease } from '../utils/disease';
import { calculateEconomicImpact } from '../utils/economics';
import { getInitialState } from '../utils/state';
import { policyOptions } from '../data/policyDefinitions';

export function useSimulation() {
  const [config, setConfig] = useState<SimulationConfig>({
    population: 100_000_000,
    mortalityRate: 0.05,
    infectiousPeriod: 8,
    daysPerSecond: 5,
    economicCostPerDeath: 1_000_000,
    gamma: 1/14,
    contactsPerDay: 10,
    transmissionProbability: 0.015,
    latentPeriod: 5
  });

  const [state, setState] = useState<SimulationState>(getInitialState(config));
  const [usedPolicies, setUsedPolicies] = useState<Set<string>>(new Set());
  const [activePolicies, setActivePolicies] = useState<Set<string>>(new Set());

  const reset = useCallback(() => {
    setState(getInitialState(config));
    setUsedPolicies(new Set());
  }, [config]);

  const toggleSimulation = useCallback(() => {
    setState(current => ({ ...current, isRunning: !current.isRunning }));
  }, []);

  const updateConfig = useCallback((newConfig: SimulationConfig) => {
    const updatedConfig = {
      ...newConfig,
      gamma: 1 / newConfig.infectiousPeriod,
      sigma: 1 / newConfig.latentPeriod
    };
    
    setConfig(updatedConfig);
    setState(current => ({
      ...getInitialState(updatedConfig),
      isRunning: current.isRunning
    }));
  }, []);

  const implementPolicy = useCallback((policy: PolicyOption) => {
    if (policy.oneTime) {
      // Handle one-time policies
      if (policy.id === 'vaccination') {
        setState(currentState => ({
          ...currentState,
          isVaccinationStarted: true,
          vaccinationStartDay: currentState.day,
          totalCosts: currentState.totalCosts + 10_000_000_000
        }));
        setUsedPolicies(current => new Set(current).add(policy.id));
      }
    } else {
      // Handle toggleable policies
      setActivePolicies(current => {
        const newActivePolicies = new Set(current);
        if (current.has(policy.id)) {
          newActivePolicies.delete(policy.id);
        } else {
          newActivePolicies.add(policy.id);
        }
        return newActivePolicies;
      });
      setUsedPolicies(current => new Set(current).add(policy.id));
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (state.isRunning) {
      interval = setInterval(() => {
        setState(currentState => {
          // Calculate disease progression with active policies
          const diseaseUpdates = calculateDisease(currentState, config, activePolicies);
          
          // Calculate economic impact including policy costs
          const economicUpdates = calculateEconomicImpact(
            currentState, 
            config, 
            diseaseUpdates,
            activePolicies
          );
          
          // Create intermediate state with disease updates
          const intermediateState = {
            ...currentState,
            ...diseaseUpdates,
            ...economicUpdates,
          };

          // Calculate vaccination updates based on post-disease state
          const vaccinationUpdates: Partial<SimulationState> = {};
          if (currentState.isVaccinationStarted && 
              currentState.vaccinationStartDay !== undefined) {
            
            const vaccinationPolicy = policyOptions.find(p => p.id === 'vaccination');
            const delayPeriod = vaccinationPolicy?.implementationDelay ?? 0;
            
            if (currentState.day > currentState.vaccinationStartDay + delayPeriod) {
              // Calculate daily vaccination capacity (1% of initial population)
              const dailyVaccinationCapacity = Math.floor(currentState.population * 0.01);
              
              // Calculate new vaccinations for today
              const dailyVaccinated = Math.min(
                dailyVaccinationCapacity,
                intermediateState.susceptible
              );
              
              vaccinationUpdates.dailyVaccinated = dailyVaccinated;
              vaccinationUpdates.totalVaccinated = (intermediateState.totalVaccinated || 0) + dailyVaccinated;
              vaccinationUpdates.susceptible = intermediateState.susceptible - dailyVaccinated;
            }
          }
          
          // Combine all updates
          const newState = {
            ...intermediateState,
            ...vaccinationUpdates,
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
  }, [state.isRunning, config, activePolicies]);

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