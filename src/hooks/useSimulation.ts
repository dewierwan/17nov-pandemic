import { useState, useEffect, useCallback } from 'react';
import { SimulationState, SimulationConfig, PolicyOption } from '../types';
import { calculateDisease } from '../utils/disease';
import { calculateEconomicImpact } from '../utils/economics';
import { getInitialState } from '../utils/state';
import { policyOptions } from '../data/policyDefinitions';
import { VACCINATION_CONSTANTS, SIMULATION_DEFAULTS } from '../utils/constants';

export function useSimulation() {
  const [config, setConfig] = useState<SimulationConfig>({
    population: SIMULATION_DEFAULTS.POPULATION,
    mortalityRate: SIMULATION_DEFAULTS.MORTALITY_RATE,
    infectiousPeriod: SIMULATION_DEFAULTS.INFECTIOUS_PERIOD,
    daysPerSecond: SIMULATION_DEFAULTS.DAYS_PER_SECOND,
    economicCostPerDeath: SIMULATION_DEFAULTS.ECONOMIC_COST_PER_DEATH,
    gamma: SIMULATION_DEFAULTS.GAMMA,
    contactsPerDay: SIMULATION_DEFAULTS.CONTACTS_PER_DAY,
    transmissionProbability: SIMULATION_DEFAULTS.TRANSMISSION_PROBABILITY,
    latentPeriod: SIMULATION_DEFAULTS.LATENT_PERIOD,
    useDates: false,
    startDate: undefined
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
    // If only the date display settings changed, don't reset the simulation
    const isOnlyDateDisplayChange = 
      Object.keys(newConfig).every(key => 
        key === 'useDates' || 
        key === 'startDate' || 
        newConfig[key as keyof SimulationConfig] === config[key as keyof SimulationConfig]
      );

    if (isOnlyDateDisplayChange) {
      setConfig(newConfig);
      return;
    }

    // Otherwise, proceed with full config update and simulation reset
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
  }, [config]);

  const implementPolicy = useCallback((policy: PolicyOption) => {
    if (policy.oneTime) {
      if (policy.id === 'vaccination') {
        setState(currentState => ({
          ...currentState,
          isVaccinationStarted: true,
          vaccinationStartDay: currentState.day,
          totalCosts: currentState.totalCosts + VACCINATION_CONSTANTS.INITIAL_COST
        }));
        setUsedPolicies(current => new Set(current).add(policy.id));
      }
    } else {
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
              // Calculate daily vaccination capacity
              const dailyVaccinationCapacity = Math.floor(
                currentState.population * VACCINATION_CONSTANTS.DAILY_CAPACITY_PERCENTAGE
              );
              
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