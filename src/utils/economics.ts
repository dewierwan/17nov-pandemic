import { SimulationState, SimulationConfig } from '../types';
import { policyOptions } from '../data/policyDefinitions';

export function calculateEconomicImpact(
  state: SimulationState, 
  config: SimulationConfig,
  diseaseUpdates: Partial<SimulationState>,
  activePolicies: Set<string>
) {
  const newDeaths = (diseaseUpdates.deceased || 0) - state.deceased;
  const newDeathCosts = newDeaths * config.economicCostPerDeath;
  const newVaccinationCosts = (state.dailyVaccinated || 0) * 20;
  
  // Calculate individual policy costs
  const policyEffects = new Map();
  activePolicies.forEach(policyId => {
    if (policyId !== 'vaccination') {  // Skip vaccination as it's handled separately
      const policy = policyOptions.find(p => p.id === policyId);
      if (policy && !policy.oneTime) {
        const baseCost = (policy.dailyCostPerPerson ?? 0) * state.population;
        const caseCost = (policy.dailyCostPerCase ?? 0) * (state.exposed + state.infected);
        policyEffects.set(policyId, baseCost + caseCost);
      }
    }
  });
  
  // Update policy costs
  const updatedPolicyCosts = new Map();
  state.policyCosts.forEach(cost => updatedPolicyCosts.set(cost.id, cost.totalCost));
  
  // Add daily costs to each policy's total
  policyEffects.forEach((dailyCost, policyId) => {
    const currentCost = updatedPolicyCosts.get(policyId) || 0;
    updatedPolicyCosts.set(policyId, currentCost + dailyCost);
  });

  const policyCosts = Array.from(updatedPolicyCosts.entries()).map(([id, totalCost]) => ({
    id,
    totalCost
  }));

  const totalDailyCosts = Array.from(policyEffects.values()).reduce((sum, cost) => sum + cost, 0);

  return {
    totalCosts: state.totalCosts + newDeathCosts + newVaccinationCosts + totalDailyCosts,
    deathCosts: state.deathCosts + newDeathCosts,
    vaccineCosts: state.vaccineCosts + newVaccinationCosts,
    policyCosts
  };
}