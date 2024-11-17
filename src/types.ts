export interface PolicyCost {
  id: string;
  daysActive: number;
  totalCost: number;
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
}

export interface SimulationState {
  day: number;
  population: number;
  susceptible: number;
  exposed: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  gdpImpact: number;
  r0: number;
  re: number;
  herdImmunityThreshold: number;
  immunityLevel: number;
  activePolicies: PolicyOption[];
  historicalPolicies: Set<string>;
  policyCosts: PolicyCost[];
  isRunning: boolean;
  timeSeriesData: TimeSeriesDataPoint[];
  vaccinationStartDay: number | null;
  peopleVaccinated: number;
  isVaccinationStarted: boolean;
  config: SimulationConfig; // Store config in state
}

export interface TimeSeriesDataPoint {
  day: number;
  susceptible: number;
  exposed: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  gdpImpact: number;
  immunityLevel: number;
  herdImmunityThreshold: number;
  r0: number;
  re: number;
}

export interface SimulationConfig {
  population: number;
  initialR0: number;
  mortalityRate: number;
  incubationDays: number;
  recoveryDays: number;
  seasonalityAmplitude: number;
  complianceFatigue: number;
  daysPerSecond: number;
  economicCostPerDeath: number;
}