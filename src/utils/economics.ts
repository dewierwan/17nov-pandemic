import { SimulationState, SimulationConfig, PolicyCost } from '../types';

export function calculateEconomicImpact(
  state: SimulationState, 
  config: SimulationConfig,
  diseaseUpdates: Partial<SimulationState>
) {
  // Update policy costs
  const newPolicyCosts: PolicyCost[] = [...state.policyCosts];
  let dailyCosts = 0;

  // Calculate policy costs
  state.activePolicies.forEach(policy => {
    if (policy.id !== 'vaccination') {
      const dailyCost = policy.dailyCostPerPerson * (state.population - state.deceased);
      dailyCosts += dailyCost;
      
      const existingCost = newPolicyCosts.find(p => p.id === policy.id);
      if (existingCost) {
        existingCost.totalCost += dailyCost;
        existingCost.daysActive += 1;
      } else {
        newPolicyCosts.push({
          id: policy.id,
          daysActive: 1,
          totalCost: dailyCost
        });
      }
    }
  });

  // Calculate vaccination delivery costs
  const newVaccinations = (diseaseUpdates.vaccinated || 0) - state.vaccinated;
  const newVaccineDeliveryCost = newVaccinations * 20;
  const newVaccineCosts = state.vaccineCosts + newVaccineDeliveryCost;

  // Calculate death costs
  const newDeaths = (diseaseUpdates.deceased || 0) - state.deceased;
  const newDeathCosts = state.deathCosts + (newDeaths * config.economicCostPerDeath);

  // Calculate total costs
  const newTotalCosts = newPolicyCosts.reduce((sum, cost) => sum + cost.totalCost, 0) +
                       newDeathCosts + newVaccineCosts;

  return {
    policyCosts: newPolicyCosts,
    deathCosts: newDeathCosts,
    vaccineCosts: newVaccineCosts,
    totalCosts: newTotalCosts
  };
}