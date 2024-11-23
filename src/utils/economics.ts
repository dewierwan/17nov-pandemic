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
  
  // Update policy costs
  const updatedPolicyCosts = new Map();
  state.policyCosts.forEach(cost => updatedPolicyCosts.set(cost.id, cost.totalCost));
  
  activePolicies.forEach(policyId => {
    if (policyId !== 'vaccination') {  // Skip vaccination as it's handled separately
      const currentCost = updatedPolicyCosts.get(policyId) || 0;
      updatedPolicyCosts.set(policyId, currentCost + policyDailyCosts);
    }
  });

  const policyCosts = Array.from(updatedPolicyCosts.entries()).map(([id, totalCost]) => ({
    id,
    totalCost
  }));

  return {
    totalCosts: state.totalCosts + newDeathCosts + newVaccinationCosts + policyDailyCosts,
    deathCosts: state.deathCosts + newDeathCosts,
    vaccineCosts: state.vaccineCosts + newVaccinationCosts,
    policyCosts
  };
}