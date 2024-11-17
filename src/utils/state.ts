import { SimulationState, SimulationConfig } from '../types';

export function getInitialState(config: SimulationConfig): SimulationState {
  const initialInfected = 100;
  const herdImmunityThreshold = 1 - (1 / config.initialR0);
  
  return {
    day: 0,
    population: config.population,
    susceptible: config.population - initialInfected,
    exposed: 0,
    infected: initialInfected,
    recovered: 0,
    deceased: 0,
    totalCases: initialInfected,
    vaccinated: 0,
    peopleVaccinated: 0,
    r0: config.initialR0,
    re: config.initialR0,
    herdImmunityThreshold,
    immunityLevel: 0,
    activePolicies: [],
    historicalPolicies: new Set(),
    isRunning: false,
    vaccinationStartDay: null,
    isVaccinationStarted: false,
    policyCosts: [],
    deathCosts: 0,
    vaccineCosts: 0,
    totalCosts: 0,
    config,
    timeSeriesData: [{
      day: 0,
      susceptible: config.population - initialInfected,
      exposed: 0,
      infected: initialInfected,
      recovered: 0,
      deceased: 0,
      totalCases: initialInfected,
      gdpImpact: 0,
      r0: config.initialR0,
      re: config.initialR0,
      policyCosts: [],
      deathCosts: 0,
      vaccineCosts: 0
    }]
  };
}