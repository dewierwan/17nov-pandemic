import { create } from 'zustand';
import { SimulationState, SimulationConfig, PolicyOption } from '../../../types';
import { getInitialState } from '../utils/state';
import { calculateDisease } from '../../disease/utils/disease';
import { calculateEconomicImpact } from '../../economics/utils/economics';
import { policyOptions } from '../../../data/policyDefinitions';
import { VACCINATION_CONSTANTS, SIMULATION_DEFAULTS } from '../utils/constants';

interface SimulationStore {
  // State
  config: SimulationConfig;
  state: SimulationState;
  usedPolicies: Set<string>;
  activePolicies: Set<string>;
  simulationInterval: number | undefined;

  // Actions
  setConfig: (newConfig: SimulationConfig) => void;
  setState: (newState: SimulationState) => void;
  reset: () => void;
  toggleSimulation: () => void;
  updateConfig: (newConfig: SimulationConfig) => void;
  implementPolicy: (policy: PolicyOption) => void;
  tick: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  config: {
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
  },
  state: getInitialState({
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
  }),
  usedPolicies: new Set<string>(),
  activePolicies: new Set<string>(),
  simulationInterval: undefined,

  setConfig: (newConfig) => set({ config: newConfig }),
  setState: (newState) => set({ state: newState }),

  reset: () => {
    const { config } = get();
    set({
      state: getInitialState(config),
      usedPolicies: new Set(),
      activePolicies: new Set()
    });
  },

  toggleSimulation: () => {
    const { state, config } = get();
    const newState = { ...state, isRunning: !state.isRunning };
    set({ state: newState });

    // Clear existing interval if any
    if (get().simulationInterval !== undefined) {
      clearInterval(get().simulationInterval);
      set({ simulationInterval: undefined });
    }

    // Start new interval if simulation is running
    if (newState.isRunning) {
      const interval = window.setInterval(() => {
        get().tick();
      }, 1000 / config.daysPerSecond);
      set({ simulationInterval: interval });
    }
  },

  updateConfig: (newConfig) => {
    const { config } = get();
    
    // Check if only date display settings changed
    const isOnlyDateDisplayChange = Object.keys(newConfig).every(key => 
      key === 'useDates' || 
      key === 'startDate' || 
      newConfig[key as keyof SimulationConfig] === config[key as keyof SimulationConfig]
    );

    if (isOnlyDateDisplayChange) {
      set({ config: newConfig });
      return;
    }

    // Update config with new gamma and sigma values
    const updatedConfig = {
      ...newConfig,
      gamma: 1 / newConfig.infectiousPeriod,
      sigma: 1 / newConfig.latentPeriod
    };

    set((state) => ({
      config: updatedConfig,
      state: {
        ...getInitialState(updatedConfig),
        isRunning: state.state.isRunning
      }
    }));
  },

  implementPolicy: (policy) => {
    if (policy.oneTime) {
      if (policy.id === 'vaccination') {
        set((state) => ({
          state: {
            ...state.state,
            isVaccinationStarted: true,
            vaccinationStartDay: state.state.day,
            totalCosts: state.state.totalCosts + VACCINATION_CONSTANTS.INITIAL_COST
          },
          usedPolicies: new Set([...state.usedPolicies, policy.id])
        }));
      }
    } else {
      set((state) => {
        const newActivePolicies = new Set(state.activePolicies);
        if (state.activePolicies.has(policy.id)) {
          newActivePolicies.delete(policy.id);
        } else {
          newActivePolicies.add(policy.id);
        }
        return {
          activePolicies: newActivePolicies,
          usedPolicies: new Set([...state.usedPolicies, policy.id])
        };
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
    if (state.isVaccinationStarted && state.vaccinationStartDay !== undefined) {
      const vaccinationPolicy = policyOptions.find((p: PolicyOption) => p.id === 'vaccination');
      const delayPeriod = vaccinationPolicy?.implementationDelay ?? 0;
      
      if (state.day > state.vaccinationStartDay + delayPeriod) {
        // Calculate daily vaccination capacity
        const dailyVaccinationCapacity = Math.floor(
          state.population * VACCINATION_CONSTANTS.DAILY_CAPACITY_PERCENTAGE
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
