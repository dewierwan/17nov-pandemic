import { SimulationState, SimulationConfig } from '../types';

export function getInitialState(config: SimulationConfig): SimulationState {
  const initialInfected = 100;
  const herdImmunityThreshold = 1 - (1 / config.initialR0);
  
  return {
    day: 0,
    population: config.population,
    susceptible: config.population - initialInfected,
    infected: initialInfected,
    recovered: 0,
    deceased: 0,
    totalCases: initialInfected,
    r0: config.initialR0,
    re: config.initialR0,
    herdImmunityThreshold,
    immunityLevel: 0,
    isRunning: false,
    config,
    totalCosts: 0,
    timeSeriesData: [{
      day: 0,
      susceptible: config.population - initialInfected,
      infected: initialInfected,
      recovered: 0,
      deceased: 0,
      totalCases: initialInfected,
      r0: config.initialR0,
      re: config.initialR0,
      economicCost: 0
    }]
  };
}