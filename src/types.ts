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
  gamma: number;
  contactsPerDay: number;
  transmissionProbability: number;
  latentPeriod: number;
  useDates: boolean;
  startDate?: Date;
}

export interface PolicyOption {
  id: string;
  name: string;
  description: string;
  economicImpact: number;
  socialCost: number;
  implementationDelay: number;
  oneTime: boolean;
  contactReduction?: number;
  transmissionReduction?: number;
  exposedDetectionRate?: number;
  dailyCostPerPerson?: number;
  dailyCostPerCase?: number;
  vaccinationRate?: number;
  costPerVaccination?: number;
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