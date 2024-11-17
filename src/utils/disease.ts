import { SimulationState, SimulationConfig } from '../types';
import { calculatePolicyEffects } from './policyCalculations';

interface DiseaseTransitions {
  newInfected: number;
  newRecovered: number;
  newDeceased: number;
}

interface DiseaseState {
  susceptible: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  re: number;
}

interface DiseaseParameters {
  beta: number;
  gamma: number;
}

function calculateDiseaseParameters(config: SimulationConfig): DiseaseParameters {
  const gamma = 1 / config.recoveryDays;
  return { beta: config.beta, gamma };
}

function calculateEffectiveR(
  beta: number,
  gamma: number,
  susceptible: number,
  population: number
): number {
  // R(t) = (beta * gamma) / (S(t) * N)
  return (beta * gamma ) / (susceptible * population);
}

function calculateTransitions(
  state: SimulationState,
  params: DiseaseParameters,
  population: number,
  mortalityRate: number
): DiseaseTransitions {
  // Calculate expected new infections using beta
  const expectedNewInfections = params.beta * state.susceptible * state.infected / population;
  
  // Use probabilistic rounding for new infections
  const wholePart = Math.floor(expectedNewInfections);
  const fractionalPart = expectedNewInfections - wholePart;
  const extraInfection = Math.random() < fractionalPart ? 1 : 0;
  const newInfected = Math.min(wholePart + extraInfection, state.susceptible);

  // Calculate expected recoveries/deaths using gamma
  const expectedExits = params.gamma * state.infected;
  
  // Use probabilistic rounding for exits
  const wholeExits = Math.floor(expectedExits);
  const fractionalExits = expectedExits - wholeExits;
  const extraExit = Math.random() < fractionalExits ? 1 : 0;
  const totalExits = Math.min(wholeExits + extraExit, state.infected);

  // Calculate deaths and recoveries using passed mortality rate
  const newDeceased = Math.floor(totalExits * mortalityRate);
  const newRecovered = totalExits - newDeceased;

  return { newInfected, newRecovered, newDeceased };
}

function calculateNewState(
  state: SimulationState,
  transitions: DiseaseTransitions,
  currentRe: number
): DiseaseState {
  const newInfected = Math.max(
    0,
    state.infected + transitions.newInfected - (transitions.newRecovered + transitions.newDeceased)
  );
  const newRecovered = state.recovered + transitions.newRecovered;
  const newDeceased = state.deceased + transitions.newDeceased;

  // Update susceptible population by subtracting new infections
  const newSusceptible = Math.max(0, state.susceptible - transitions.newInfected);

  return {
    susceptible: newSusceptible,
    infected: newInfected,
    recovered: newRecovered,
    deceased: newDeceased,
    totalCases: state.totalCases + transitions.newInfected,
    re: currentRe,
  };
}export function calculateDisease(
  state: SimulationState, 
  config: SimulationConfig,
  activePolicies: Set<string>
): DiseaseState {
  const { beta, gamma } = calculateDiseaseParameters(config);
  
  const { transmissionReduction } = calculatePolicyEffects(activePolicies, state);
  
  const adjustedBeta = beta * Math.max(0, 1 - transmissionReduction);
  
  const currentRe = calculateEffectiveR(
    adjustedBeta,
    gamma,
    state.susceptible,
    state.population
  );
  
  const transitions = calculateTransitions(
    state, 
    { beta: adjustedBeta, gamma }, 
    state.population,
    config.mortalityRate
  );
  return calculateNewState(state, transitions, currentRe);
}

