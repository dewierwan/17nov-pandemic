import { SimulationState, SimulationConfig } from '../types';

export function getInitialState(config: SimulationConfig): SimulationState {
  const initialInfected = 100;
  const r0 = config.beta * config.recoveryDays;
  const herdImmunityThreshold = 1 - (1 / r0);
  
  return {
    day: 0,
    population: config.population,
    susceptible: config.population - initialInfected,
    infected: initialInfected,
    recovered: 0,
    deceased: 0,
    totalCases: initialInfected,
    beta: config.beta,
    recoveryDays: config.recoveryDays,
    r0: r0,
    re: r0,
    herdImmunityThreshold,
    immunityLevel: 0,
    isRunning: false,
    totalCosts: 0,
    deathCosts: 0,
    vaccineCosts: 0,
    timeSeriesData: [{
      day: 0,
      susceptible: config.population - initialInfected,
      infected: initialInfected,
      recovered: 0,
      deceased: 0,
      totalCases: initialInfected,
      r0: config.beta,
      re: r0,
      economicCost: 0
    }],
    totalVaccinated: 0,
    dailyVaccinated: 0,
    isVaccinationStarted: false,
    vaccinationStartDay: undefined,
    policyCosts: [],
  };
}