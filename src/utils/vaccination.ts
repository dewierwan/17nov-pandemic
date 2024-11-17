import { SimulationState } from '../types';

export function calculateVaccination(state: SimulationState) {
  // If vaccination hasn't started or waiting period hasn't elapsed, return current state
  if (!state.isVaccinationStarted || 
      !state.vaccinationStartDay || 
      state.day < state.vaccinationStartDay + 100) {
    return {
      totalVaccinated: state.totalVaccinated,
      dailyVaccinated: 0,
      susceptible: state.susceptible
    };
  }

  // Calculate daily vaccination capacity (1% of initial population)
  const dailyVaccinationCapacity = Math.floor(state.population * 0.01);
  
  // Calculate remaining alive population that can be vaccinated
  const alivePopulation = state.population - state.deceased;
  const remainingToVaccinate = alivePopulation - state.totalVaccinated;

  if (remainingToVaccinate <= 0) {
    return {
      totalVaccinated: state.totalVaccinated,
      dailyVaccinated: 0,
      susceptible: state.susceptible
    };
  }

  // Calculate new vaccinations for today
  const dailyVaccinated = Math.min(dailyVaccinationCapacity, remainingToVaccinate);

  // Calculate how many of these vaccinations will go to susceptible people
  const unvaccinatedAlive = alivePopulation - state.totalVaccinated;
  const susceptibleProportion = state.susceptible / unvaccinatedAlive;
  const vaccinesForSusceptible = Math.floor(dailyVaccinated * susceptibleProportion);

  return {
    totalVaccinated: state.totalVaccinated + dailyVaccinated,
    dailyVaccinated,
    susceptible: Math.max(0, state.susceptible - vaccinesForSusceptible)
  };
}