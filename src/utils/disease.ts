import { SimulationState, SimulationConfig } from '../types';

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

function calculateEffectiveR(
  r0: number, 
  susceptible: number, 
  population: number
): number {
  const susceptibleProportion = susceptible / population;
  return Math.max(0, r0 * susceptibleProportion);
}

function calculateTransitions(
  state: SimulationState, 
  config: SimulationConfig, 
  currentRe: number
): DiseaseTransitions {
  // Calculate expected new infections
  const expectedNewInfections = state.infected * (currentRe / config.recoveryDays);
  
  // Use probabilistic rounding for new infections
  const wholePart = Math.floor(expectedNewInfections);
  const fractionalPart = expectedNewInfections - wholePart;
  const extraInfection = Math.random() < fractionalPart ? 1 : 0;
  const newInfected = Math.min(wholePart + extraInfection, state.susceptible);

  // Calculate expected recoveries/deaths
  const expectedExits = state.infected / config.recoveryDays;
  
  // Use probabilistic rounding for exits
  const wholeExits = Math.floor(expectedExits);
  const fractionalExits = expectedExits - wholeExits;
  const extraExit = Math.random() < fractionalExits ? 1 : 0;
  const totalExits = Math.min(wholeExits + extraExit, state.infected);

  // Calculate deaths and recoveries
  const newDeceased = Math.floor(totalExits * config.mortalityRate);
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
}

export function calculateDisease(
  state: SimulationState, 
  config: SimulationConfig
): DiseaseState {
  const currentRe = calculateEffectiveR(
    state.r0,
    state.susceptible,
    state.population
  );
  
  const transitions = calculateTransitions(state, config, currentRe);
  return calculateNewState(state, transitions, currentRe);
}