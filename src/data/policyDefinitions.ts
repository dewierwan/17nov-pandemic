import { PolicyOption } from '../types';

export const policyOptions: PolicyOption[] = [
  {
    id: 'masks',
    name: 'Mandatory Mask Wearing',
    description: 'Require masks in all public spaces.',
    economicImpact: 0,
    transmissionReduction: 0.3,
    implementationDelay: 3,
    dailyCostPerPerson: 2,
    oneTime: false
  },
  {
    id: 'rapid_containment',
    name: 'Rapid Detection & Containment',
    description: 'Implement aggressive testing and isolation',
    economicImpact: 0,
    contactReduction: 0.8,
    exposedDetectionRate: 0.5,
    implementationDelay: 5,
    dailyCostPerPerson: 5,
    dailyCostPerCase: 200,
    oneTime: false
  },
  {
    id: 'vaccination',
    name: 'Mass Vaccination Program',
    description: 'Launch an immediate vaccination program.',
    economicImpact: 0,
    vaccinationRate: 0.01,
    implementationDelay: 100,
    costPerVaccination: 20,
    oneTime: true
  },
  {
    id: 'lockdown',
    name: 'Full Lockdown',
    description: 'Implement a complete lockdown of non-essential activities.',
    economicImpact: 0,
    contactReduction: 0.95,
    implementationDelay: 10,
    dailyCostPerPerson: 100,
    oneTime: false
  }  
];

export default policyOptions;
