export interface SimulationState {
  day: number;
  population: number;
  susceptible: number;
  infected: number;
  recovered: number;
  deceased: number;
  totalCases: number;
  r0: number;
  re: number;
  herdImmunityThreshold: number;
  immunityLevel: number;
  isRunning: boolean;
  timeSeriesData: TimeSeriesDataPoint[];
  totalCosts: number;
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
  initialR0: number;
  mortalityRate: number;
  recoveryDays: number;
  daysPerSecond: number;
  economicCostPerDeath: number;
}