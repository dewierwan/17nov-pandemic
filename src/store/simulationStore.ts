// Not used right now

// Import necessary types and utilities
import { create } from 'zustand';
import { SimulationState, SimulationConfig, PolicyOption } from '../types';
import { getInitialState } from '../utils/state';
import { calculateDisease } from '../utils/disease';
import { calculateEconomicImpact } from '../utils/economics';
import { policyOptions } from '../data/policyDefinitions';

interface SimulationStore {
  // State
  state: SimulationState;
  config: SimulationConfig;
  usedPolicies: Set<string>;
  activePolicies: Set<string>;

  // Actions
  reset: () => void;
  toggleSimulation: () => void;
  updateConfig: (newConfig: SimulationConfig) => void;
  implementPolicy: (policy: PolicyOption) => void;
  tick: () => void;
}

const initialConfig: SimulationConfig = {
  population: 1_000_000,
  mortalityRate: 0.02,
  infectiousPeriod: 14,
  daysPerSecond: 10,
  economicCostPerDeath: 1_000_000,
  gamma: 1/14,
  contactsPerDay: 10,
  transmissionProbability: 0.015,
  latentPeriod: 5,
  useDates: false,
  startDate: undefined
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  state: getInitialState(initialConfig),
  config: initialConfig,
  usedPolicies: new Set<string>(),
  activePolicies: new Set<string>(),

  // Actions
  reset: () => {
    const { config } = get();
    set({
      state: getInitialState(config),
      usedPolicies: new Set(),
      activePolicies: new Set()
    });
  },

  toggleSimulation: () => {
    const { state } = get();
    set({
      state: { ...state, isRunning: !state.isRunning }
    });
  },

  updateConfig: (newConfig) => {
    const { state } = get();
    const updatedConfig = {
      ...newConfig,
      gamma: 1 / newConfig.infectiousPeriod,
      sigma: 1 / newConfig.latentPeriod
    };
    
    set({
      config: updatedConfig,
      state: {
        ...getInitialState(updatedConfig),
        isRunning: state.isRunning
      }
    });
  },

  implementPolicy: (policy) => {
    const { state, usedPolicies, activePolicies } = get();
    
    if (policy.oneTime) {
      if (policy.id === 'vaccination') {
        set({
          state: {
            ...state,
            isVaccinationStarted: true,
            vaccinationStartDay: state.day,
            totalCosts: state.totalCosts + 10_000_000_000
          },
          usedPolicies: new Set([...usedPolicies, policy.id])
        });
      }
    } else {
      const newActivePolicies = new Set(activePolicies);
      if (activePolicies.has(policy.id)) {
        newActivePolicies.delete(policy.id);
      } else {
        newActivePolicies.add(policy.id);
      }
      
      set({
        activePolicies: newActivePolicies,
        usedPolicies: new Set([...usedPolicies, policy.id])
      });
    }
  },

  tick: () => {
    const { state, config, activePolicies } = get();
    
    // Calculate disease progression with active policies
    const diseaseUpdates = calculateDisease(state, config, activePolicies);
    
    // Calculate economic impact including policy costs
    const economicUpdates = calculateEconomicImpact(
      state, 
      config, 
      diseaseUpdates,
      activePolicies
    );
    
    // Create intermediate state with disease updates
    const intermediateState = {
      ...state,
      ...diseaseUpdates,
      ...economicUpdates,
    };

    // Calculate vaccination updates based on post-disease state
    const vaccinationUpdates: Partial<SimulationState> = {};
    if (state.isVaccinationStarted && 
        state.vaccinationStartDay !== undefined) {
      
      const vaccinationPolicy = policyOptions.find(p => p.id === 'vaccination');
      const delayPeriod = vaccinationPolicy?.implementationDelay ?? 0;
      
      if (state.day > state.vaccinationStartDay + delayPeriod) {
        // Calculate daily vaccination capacity (1% of initial population)
        const dailyVaccinationCapacity = Math.floor(state.population * 0.01);
        
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
      day: state.day + 1,
    };

    // Update time series data
    newState.timeSeriesData = [...state.timeSeriesData, {
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

    set({ state: newState });
  }
})); 