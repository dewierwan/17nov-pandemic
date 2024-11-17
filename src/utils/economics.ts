import { SimulationState, SimulationConfig } from '../types';

export function calculateEconomicImpact(
  state: SimulationState, 
  config: SimulationConfig,
  diseaseUpdates: Partial<SimulationState>
) {
  // Calculate new deaths since last update
  const newDeaths = (diseaseUpdates.deceased || 0) - state.deceased;
  
  // Calculate economic impact of new deaths
  const newDeathCosts = newDeaths * config.economicCostPerDeath;
  
  // Update total costs
  const newTotalCosts = state.totalCosts + newDeathCosts;

  return {
    totalCosts: newTotalCosts
  };
}