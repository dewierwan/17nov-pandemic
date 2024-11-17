import { SimulationState, SimulationConfig } from '../types';

export function calculateDisease(state: SimulationState, config: SimulationConfig) {
  // Calculate policy effects on transmission
  const policyEffect = state.activePolicies.reduce((total, policy) => 
    total * (1 - policy.transmissionReduction), 1);

  // Calculate proportion of population that is susceptible
  const susceptibleProportion = state.susceptible / state.population;

  // Calculate effective reproduction number
  const currentRe = Math.max(0, state.r0 * susceptibleProportion * policyEffect);

  // Calculate new exposures
  const newExposuresPerInfected = currentRe / config.recoveryDays;
  const newExposed = Math.floor(
    state.infected * 
    newExposuresPerInfected * 
    (state.susceptible / state.population)
  );

  // Calculate new infections
  const newInfected = Math.floor(state.exposed / config.incubationDays);

  // Calculate recoveries and deaths
  const totalExits = Math.floor(state.infected / config.recoveryDays);
  const newDeceased = Math.floor(totalExits * config.mortalityRate);
  const newRecovered = totalExits - newDeceased;

  return {
    susceptible: Math.max(0, state.susceptible - newExposed),
    exposed: Math.max(0, state.exposed + newExposed - newInfected),
    infected: Math.max(0, state.infected + newInfected - totalExits),
    recovered: state.recovered + newRecovered,
    deceased: state.deceased + newDeceased,
    totalCases: state.totalCases + newInfected,
    re: currentRe
  };
}