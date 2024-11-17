export interface SimulationState {
  day: number;
  population: number;
  susceptible: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  beta: number;
  recoveryDays: number;
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
  beta: number;
  mortalityRate: number;
  recoveryDays: number;
  daysPerSecond: number;
  economicCostPerDeath: number;
}

export interface PolicyOption {
  id: string;
  name: string;
  description: string;
  economicImpact: number;
  transmissionReduction: number;
  socialCost: number;
  implementationDelay: number;
  dailyCostPerPerson: number;
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