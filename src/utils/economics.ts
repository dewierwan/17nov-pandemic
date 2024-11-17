import { SimulationState, SimulationConfig } from '../types';
import { calculatePolicyEffects } from './policyCalculations';

export function calculateEconomicImpact(
  state: SimulationState, 
  config: SimulationConfig,
  diseaseUpdates: Partial<SimulationState>,
  activePolicies: Set<string>
) {
  const newDeaths = (diseaseUpdates.deceased || 0) - state.deceased;
  const newDeathCosts = newDeaths * config.economicCostPerDeath;
  const newVaccinationCosts = (state.dailyVaccinated || 0) * 20;
  
  const { dailyCosts: policyDailyCosts } = calculatePolicyEffects(activePolicies, state);
  
  return {
    totalCosts: state.totalCosts + newDeathCosts + newVaccinationCosts + policyDailyCosts
  };
}