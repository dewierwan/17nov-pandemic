import { PolicyOption } from '../types';

export const policyOptions: PolicyOption[] = [
  {
    id: 'vaccination',
    name: 'Mass Vaccination Program',
    description: `Launch an immediate vaccination program.
Vaccination rate: 1% of population per day.
Cost: $20 per person vaccinated.
Effective after: 100 days`,
    economicImpact: 0,
    transmissionReduction: 1.0,  // doesn't do anything, given it's a "one-time" policy
    socialCost: 0,
    implementationDelay: 100,
    dailyCostPerPerson: 0,
    oneTime: true
  },
  {
    id: 'lockdown',
    name: 'Full Lockdown',
    description: `Implement a complete lockdown of non-essential activities.
Reduces transmission significantly.
Cost: $100 per person per day.
High economic and social costs.
Effective immediately.`,
    economicImpact: 0,
    transmissionReduction: 0.7,
    socialCost: 0,
    implementationDelay: 10,
    dailyCostPerPerson: 100,
    oneTime: false
  }
];