import { SimulationState, SimulationConfig } from '../types';

export function getInitialState(config: SimulationConfig): SimulationState {
  const initialInfected = 1;
  const gamma = 1 / config.recoveryDays;
  const beta = config.contactsPerDay * config.transmissionProbability;
  const r0 = beta / gamma;
  const herdImmunityThreshold = r0 > 1 ? Math.max(0, 1 - (1 / r0)) : 0;
  
  return {
    day: 0,
    population: config.population,
    susceptible: config.population - initialInfected,
    infected: initialInfected,
    recovered: 0,
    deceased: 0,
    totalCases: initialInfected,
    beta,
    gamma,
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
      r0: r0,
      re: r0,
      economicCost: 0
    }],
    totalVaccinated: 0,
    dailyVaccinated: 0,
    isVaccinationStarted: false,
    vaccinationStartDay: undefined,
    policyCosts: [],
    effectiveContacts: config.contactsPerDay,
    effectiveTransmissionRate: config.transmissionProbability,
  };
}