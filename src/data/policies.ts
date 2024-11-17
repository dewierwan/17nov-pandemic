import { PolicyOption } from '../types';

export const policyOptions: PolicyOption[] = [
  {
    id: 'lockdown',
    name: 'Full Lockdown',
    description: 'Restrict all non-essential movement',
    economicImpact: -8.0,
    transmissionReduction: 0.7,
    socialCost: 9.0,
    implementationDelay: 2,
    dailyCostPerPerson: 100
  },
  {
    id: 'masks',
    name: 'Mandatory Mask Wearing',
    description: 'Require masks in public spaces',
    economicImpact: -1.0,
    transmissionReduction: 0.1,
    socialCost: 2.0,
    implementationDelay: 1,
    dailyCostPerPerson: 1
  },
  {
    id: 'testing',
    name: 'Testing and Contact Tracing',
    description: 'Identify and isolate cases rapidly',
    economicImpact: -2.0,
    transmissionReduction: 0.2,
    socialCost: 3.0,
    implementationDelay: 3,
    dailyCostPerPerson: 3
  },
  {
    id: 'distancing',
    name: 'Social Distancing Measures',
    description: 'Limit gatherings and enforce distancing',
    economicImpact: -3.0,
    transmissionReduction: 0.3,
    socialCost: 4.0,
    implementationDelay: 1,
    dailyCostPerPerson: 20
  }
];