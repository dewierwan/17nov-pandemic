import { PolicyOption } from '../types';
import { policyOptions } from '../data/policyDefinitions';

interface PolicyEffects {
  transmissionReduction: number;
  dailyCosts: number;
}

export function calculatePolicyEffects(
  activePolicies: Set<string>,
  state: { population: number }
): PolicyEffects {
  let transmissionReduction = 0;
  let dailyCosts = 0;

  // Calculate cumulative effects of all active policies
  activePolicies.forEach(policyId => {
    const policy = policyOptions.find(p => p.id === policyId);
    if (policy && !policy.oneTime) {
      transmissionReduction += policy.transmissionReduction;
      dailyCosts += policy.dailyCostPerPerson * state.population;
    }
  });

  // Cap transmission reduction at 95% to prevent complete elimination
  transmissionReduction = Math.min(transmissionReduction, 0.95);

  return {
    transmissionReduction,
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