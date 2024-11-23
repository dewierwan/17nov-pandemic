import { PolicyOption } from '../types';
import { policyOptions } from '../data/policyDefinitions';

interface PolicyEffects {
  contactReduction: number;
  transmissionReduction: number;
  exposedDetectionRate: number;
  dailyCosts: number;
}

export function calculatePolicyEffects(
  activePolicies: Set<string>,
  state: { population: number; exposed: number; infected: number }
): PolicyEffects {
  let contactReduction = 0;
  let transmissionReduction = 0;
  let exposedDetectionRate = 0;
  let dailyCosts = 0;

  // Calculate cumulative effects of all active policies
  activePolicies.forEach(policyId => {
    const policy = policyOptions.find(p => p.id === policyId);
    if (policy && !policy.oneTime) {
      contactReduction += policy.contactReduction || 0;
      transmissionReduction += policy.transmissionReduction || 0;
      exposedDetectionRate = Math.max(exposedDetectionRate, policy.exposedDetectionRate || 0);
      
      // Calculate daily costs based on both population and active cases
      const baseCost = (policy.dailyCostPerPerson ?? 0) * state.population;
      const caseCost = (policy.dailyCostPerCase ?? 0) * (state.exposed + state.infected);
      
      dailyCosts += baseCost + caseCost;
    }
  });

  // Cap reductions at 95% to prevent complete elimination
  contactReduction = Math.min(contactReduction, 0.95);
  transmissionReduction = Math.min(transmissionReduction, 0.95);
  exposedDetectionRate = Math.min(exposedDetectionRate, 0.95);

  return {
    contactReduction,
    transmissionReduction,
    exposedDetectionRate,
    dailyCosts
  };
}

export function getPolicyById(id: string): PolicyOption | undefined {
  return policyOptions.find(policy => policy.id === id);
}

export function isOneTimePolicy(policy: PolicyOption): boolean {
  return policy.oneTime === true;
}

export function isPolicyActive(
  policy: PolicyOption,
  activePolicies: Set<string>
): boolean {
  return activePolicies.has(policy.id);
} 