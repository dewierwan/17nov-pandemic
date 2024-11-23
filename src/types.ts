export interface SimulationState {
  day: number;
  population: number;
  susceptible: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  beta: number;
  gamma: number;
  infectiousPeriod: number;
  r0: number;
  re: number;
  herdImmunityThreshold: number;
  immunityLevel: number;
  isRunning: boolean;
  timeSeriesData: TimeSeriesDataPoint[];
  totalCosts: number;
  deathCosts: number;
  vaccineCosts: number;
  totalVaccinated: number;
  isVaccinationStarted: boolean;
  vaccinationStartDay?: number;
  dailyVaccinated: number;
  policyCosts: PolicyCost[];
  effectiveContacts: number;
  effectiveTransmissionRate: number;
  exposed: number;
  latentPeriod: number;
  sigma: number;
}

export interface TimeSeriesDataPoint {
  day: number;
  susceptible: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  r0: number;
  re: number;
  economicCost: number;
}

export interface SimulationConfig {
  population: number;
  mortalityRate: number;
  infectiousPeriod: number;
  daysPerSecond: number;
  economicCostPerDeath: number;
  gamma?: number;
  contactsPerDay: number;
  transmissionProbability: number;
  latentPeriod: number;
}

export interface PolicyOption {
  id: string;
  name: string;
  description: string;
  economicImpact: number;
  contactReduction?: number;
  transmissionReduction?: number;
  exposedDetectionRate?: number;
  socialCost: number;
  implementationDelay: number;
  dailyCostPerPerson: number;
  dailyCostPerCase?: number;
  oneTime?: boolean;
}

export interface PolicyCost {
  id: string;
  totalCost: number;
}

export interface DiseaseParameters {
  beta: number;
  gamma: number;
}

export interface Pathogen {
  id: string;
  name: string;
  description: string;
  transmissionProbability: number;  // pi
  latentPeriod: number;            // 1/sigma
  infectiousPeriod: number;        // 1/gamma
  mortalityRate: number;           // IFR
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  oneTime: boolean;
  effect: (state: any, config: any) => any; // You may want to properly type these based on your state and config types
}