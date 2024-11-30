import { create } from 'zustand';
import { SimulationState, SimulationConfig, PolicyOption, NewsStory } from '../../../types';
import { getInitialState } from '../utils/state';
import { calculateDisease } from '../../disease/utils/disease';
import { calculateEconomicImpact } from '../../economics/utils/economics';
import { policyOptions } from '../../../data/policyDefinitions';
import { VACCINATION_CONSTANTS, SIMULATION_DEFAULTS } from '../utils/constants';
import { sendMessageToClaude } from '../../../services/claudeService';

interface PolicyHistory {
  id: string;
  name: string;
  startDay: number;
  endDay?: number;
}

interface SimulationStore {
  // State
  config: SimulationConfig;
  state: SimulationState;
  usedPolicies: Set<string>;
  activePolicies: Set<string>;
  simulationInterval: number | undefined;
  policyStartDays: Map<string, number>;
  aiResponse: string | null;
  isLoadingAi: boolean;
  policyHistory: PolicyHistory[];
  newsHistory: NewsStory[];

  // Actions
  setConfig: (newConfig: SimulationConfig) => void;
  setState: (newState: SimulationState) => void;
  reset: () => void;
  toggleSimulation: () => void;
  updateConfig: (newConfig: SimulationConfig) => void;
  implementPolicy: (policy: PolicyOption) => void;
  tick: () => void;
  stopSimulation: () => void;
  sendMessageToAI: (message: string, requestType?: 'advice' | 'news') => Promise<void>;
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
    startDate: undefined,
    enableWinLose: SIMULATION_DEFAULTS.ENABLE_WIN_LOSE,
    maxDeathPercentage: SIMULATION_DEFAULTS.MAX_DEATH_PERCENTAGE,
    maxEconomicCost: SIMULATION_DEFAULTS.MAX_ECONOMIC_COST
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
    startDate: undefined,
    enableWinLose: SIMULATION_DEFAULTS.ENABLE_WIN_LOSE,
    maxDeathPercentage: SIMULATION_DEFAULTS.MAX_DEATH_PERCENTAGE,
    maxEconomicCost: SIMULATION_DEFAULTS.MAX_ECONOMIC_COST
  }),
  usedPolicies: new Set<string>(),
  activePolicies: new Set<string>(),
  simulationInterval: undefined,
  policyStartDays: new Map(),
  aiResponse: null,
  isLoadingAi: false,
  policyHistory: [],
  newsHistory: [],

  setConfig: (newConfig) => set({ config: newConfig }),
  setState: (newState) => set({ state: newState }),

  reset: () => {
    const { config } = get();
    set({
      state: {
        ...getInitialState(config),
        hasStarted: false,
        isGameOver: false,
        hasWon: false
      },
      usedPolicies: new Set(),
      activePolicies: new Set(),
      policyStartDays: new Map(),
      policyHistory: [],
      newsHistory: [],
    });
  },

  toggleSimulation: () => {
    const { state, config } = get();
    
    if (state.isRunning) {
      // If running, stop it
      get().stopSimulation();
    } else {
      // If stopped, start it
      const interval = window.setInterval(() => {
        get().tick();
      }, 1000 / config.daysPerSecond);
      
      set({ 
        simulationInterval: interval,
        state: { 
          ...state, 
          isRunning: true,
          hasStarted: true
        }
      });
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
        isRunning: state.state.isRunning,
        isGameOver: false,
        hasWon: false
      }
    }));
  },

  implementPolicy: (policy) => {
    if (policy.oneTime) {
      if (policy.id === 'vaccination') {
        set((state) => {
          // Add to policy history
          const newHistory = [...state.policyHistory, {
            id: policy.id,
            name: policy.name,
            startDay: state.state.day
          }];

          return {
            state: {
              ...state.state,
              isVaccinationStarted: true,
              vaccinationStartDay: state.state.day,
              totalCosts: state.state.totalCosts + VACCINATION_CONSTANTS.INITIAL_COST
            },
            usedPolicies: new Set([...state.usedPolicies, policy.id]),
            policyHistory: newHistory
          };
        });
      }
    } else {
      set((state) => {
        const newActivePolicies = new Set(state.activePolicies);
        const newPolicyStartDays = new Map(state.policyStartDays);
        const newHistory = [...state.policyHistory];
        
        if (state.activePolicies.has(policy.id)) {
          // Policy is being deactivated
          newActivePolicies.delete(policy.id);
          newPolicyStartDays.delete(policy.id);
          
          // Find the most recent history entry for this policy and set its end day
          const lastIndex = newHistory.map(p => p.id).lastIndexOf(policy.id);
          if (lastIndex !== -1) {
            newHistory[lastIndex] = {
              ...newHistory[lastIndex],
              endDay: state.state.day
            };
          }
        } else {
          // Policy is being activated
          newActivePolicies.add(policy.id);
          newPolicyStartDays.set(policy.id, state.state.day);
          
          // Add new history entry
          newHistory.push({
            id: policy.id,
            name: policy.name,
            startDay: state.state.day
          });
        }
        
        return {
          activePolicies: newActivePolicies,
          policyStartDays: newPolicyStartDays,
          usedPolicies: new Set([...state.usedPolicies, policy.id]),
          policyHistory: newHistory,
          state: {
            ...state.state,
            isRunning: state.state.isRunning
          }
        };
      });
    }
  },

  tick: () => {
    const { state, config, activePolicies, policyStartDays } = get();
    
    // Calculate disease progression with active policies
    const diseaseUpdates = calculateDisease(state, config, activePolicies, policyStartDays);
    
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
      economicCost: newState.totalCosts,
      exposed: newState.exposed
    }];

    // Check win/lose conditions if enabled
    if (config.enableWinLose) {
      const deathPercentage = newState.deceased / newState.population;
      const hasLost = deathPercentage >= config.maxDeathPercentage || 
                     newState.totalCosts >= config.maxEconomicCost;
      const hasWon = newState.exposed === 0 && newState.infected === 0;

      if (hasLost || hasWon) {
        newState.isGameOver = true;
        newState.hasWon = hasWon;
        get().stopSimulation();
      }
    }

    set({ state: newState });
  },

  stopSimulation: () => {
    const { simulationInterval } = get();
    if (simulationInterval) {
      window.clearInterval(simulationInterval);
    }
    set({ 
      simulationInterval: undefined,
      state: { 
        ...get().state, 
        isRunning: false,
      }
    });
  },

  sendMessageToAI: async (message: string, requestType: 'advice' | 'news' = 'advice') => {
    const { state, activePolicies, policyHistory } = get();
    set({ isLoadingAi: true });
    try {
      const response = await sendMessageToClaude(message, state, activePolicies, policyHistory);
      
      if (requestType === 'news') {
        try {
          const newsData = JSON.parse(response);
          const newsStory: NewsStory = {
            ...newsData,
            day: state.day
          };
          set(state => ({ 
            newsHistory: [...state.newsHistory, newsStory],
            aiResponse: newsData.content,
            isLoadingAi: false 
          }));
        } catch (error) {
          console.error('Error parsing news response:', error);
          set({ 
            aiResponse: response,
            isLoadingAi: false 
          });
        }
      } else {
        set({ 
          aiResponse: response,
          isLoadingAi: false 
        });
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      set({ 
        aiResponse: 'Error communicating with AI assistant',
        isLoadingAi: false 
      });
    }
  },
}));
