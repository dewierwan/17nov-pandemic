import { SimulationState, SimulationConfig } from '../../../types';
import { calculatePolicyEffects } from '../../policies/utils/policyCalculations';

interface DiseaseTransitions {
  newExposed: number;
  newInfectious: number;
  newRecovered: number;
  newDeceased: number;
}

interface DiseaseState {
  susceptible: number;
  exposed: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  re: number;
}

interface DiseaseParameters {
  beta: number;
  gamma: number;
  sigma: number;
}

function calculateEffectiveR(
  beta: number,
  gamma: number,
  susceptible: number,
  population: number
): number {
  if (gamma <= 0 || population <= 0) {
    return 0;
  }
  return (beta * susceptible) / (population * gamma);
}

function calculateTransitions(
  state: SimulationState,
  params: DiseaseParameters,
  population: number,
  mortalityRate: number
): DiseaseTransitions {
  // dS/dt = -beta * S * I / N
  // dE/dt = beta * S * I / N - sigma * E
  // dI/dt = sigma * E - gamma * I
  // dR/dt = gamma * I * (1-mortalityRate)
  // dD/dt = gamma * I * mortalityRate

  // Calculate expected new exposures using beta
  const expectedNewExposures = params.beta * state.susceptible * state.infected / population;
  
  // Use probabilistic rounding for new exposures
  const wholeExposures = Math.floor(expectedNewExposures);
  const fractionalExposures = expectedNewExposures - wholeExposures;
  const extraExposure = Math.random() < fractionalExposures ? 1 : 0;
  const newExposed = Math.min(wholeExposures + extraExposure, state.susceptible);

  // Calculate transitions from exposed to infectious using sigma
  const expectedNewInfectious = state.sigma * state.exposed;
  
  // Use probabilistic rounding for new infectious
  const wholeInfectious = Math.floor(expectedNewInfectious);
  const fractionalInfectious = expectedNewInfectious - wholeInfectious;
  const extraInfectious = Math.random() < fractionalInfectious ? 1 : 0;
  const newInfectious = Math.min(wholeInfectious + extraInfectious, state.exposed);

  // Calculate total exits from infected compartment using gamma
  const expectedExits = params.gamma * state.infected;
  const wholeExits = Math.floor(expectedExits);
  const fractionalExits = expectedExits - wholeExits;
  const extraExit = Math.random() < fractionalExits ? 1 : 0;
  const totalExits = wholeExits + extraExit;

  // Split exits between recovered and deceased based on mortality rate
  const expectedDeaths = mortalityRate * totalExits;
  const wholeDeaths = Math.floor(expectedDeaths);
  const fractionalDeaths = expectedDeaths - wholeDeaths;
  const extraDeath = Math.random() < fractionalDeaths ? 1 : 0;
  const newDeceased = wholeDeaths + extraDeath;
  
  // Remainder become recovered
  const newRecovered = totalExits - newDeceased;

  return {
    newExposed,
    newInfectious,
    newRecovered,
    newDeceased
  };
}

function calculateNewState(
  state: SimulationState,
  transitions: DiseaseTransitions,
  currentRe: number
): DiseaseState {
  // Update each compartment based on transitions
  const newSusceptible = Math.max(0, state.susceptible - transitions.newExposed);
  const newExposed = Math.max(0, state.exposed + transitions.newExposed - transitions.newInfectious);
  const newInfected = Math.max(
    0,
    state.infected + transitions.newInfectious - (transitions.newRecovered + transitions.newDeceased)
  );
  const newRecovered = state.recovered + transitions.newRecovered;
  const newDeceased = state.deceased + transitions.newDeceased;

  return {
    susceptible: newSusceptible,
    exposed: newExposed,
    infected: newInfected,
    recovered: newRecovered,
    deceased: newDeceased,
    totalCases: state.totalCases + transitions.newExposed,
    re: currentRe,
  };
}

export function calculateDisease(
  state: SimulationState,
  config: SimulationConfig,
  activePolicies: Set<string>
) {
  const { contactReduction, transmissionReduction, exposedDetectionRate } = calculatePolicyEffects(activePolicies, state);
  
  // Calculate effective contacts and transmission probability
  const effectiveContacts = config.contactsPerDay * (1 - contactReduction);
  const effectiveTransmissionRate = config.transmissionProbability * (1 - transmissionReduction);
  
  // Calculate effective beta using both reductions
  const effectiveBeta = effectiveContacts * effectiveTransmissionRate;
  
  const currentRe = calculateEffectiveR(
    effectiveBeta,
    state.gamma,
    state.susceptible,
    state.population
  );

  // Detect and isolate exposed cases
  const detectedExposed = Math.floor(state.exposed * exposedDetectionRate);
  const adjustedExposed = state.exposed - detectedExposed;
  
  const transitions = calculateTransitions(
    {
      ...state,
      exposed: adjustedExposed  // Use adjusted exposed count for transitions
    }, 
    { beta: effectiveBeta, gamma: state.gamma, sigma: state.sigma }, 
    state.population,
    config.mortalityRate
  );
  
  return {
    ...calculateNewState(state, transitions, currentRe),
    effectiveContacts,
    effectiveTransmissionRate
  };
}
