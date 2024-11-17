import { SimulationState } from '../types';

export function calculateVaccination(state: SimulationState) {
  // If vaccination hasn't started or waiting period hasn't elapsed, return current state
  if (!state.isVaccinationStarted || 
      !state.vaccinationStartDay || 
      state.day < state.vaccinationStartDay + 100) {
    return {
      vaccinated: state.vaccinated,
      peopleVaccinated: state.peopleVaccinated,
      susceptible: state.susceptible
    };
  }

  // Calculate daily vaccination capacity (1% of initial population)
  const dailyVaccineCapacity = Math.floor(state.population * 0.01);
  
  // Calculate remaining alive population that can be vaccinated
  const alivePopulation = state.population - state.deceased;
  const remainingToVaccinate = alivePopulation - state.peopleVaccinated;

  if (remainingToVaccinate <= 0) {
    return {
      vaccinated: state.vaccinated,
      peopleVaccinated: state.peopleVaccinated,
      susceptible: state.susceptible
    };
  }

  // Calculate new vaccinations for today
  const newVaccinationsToday = Math.min(dailyVaccineCapacity, remainingToVaccinate);

  // Calculate how many of these vaccinations will go to susceptible people
  // The proportion of susceptible people in the alive and unvaccinated population determines
  // what fraction of vaccines go to susceptible people
  const unvaccinatedAlive = alivePopulation - state.peopleVaccinated;
  const susceptibleProportion = state.susceptible / unvaccinatedAlive;
  const vaccinesForSusceptible = Math.floor(newVaccinationsToday * susceptibleProportion);

  return {
    vaccinated: state.vaccinated + newVaccinationsToday,
    peopleVaccinated: state.peopleVaccinated + newVaccinationsToday,
    susceptible: Math.max(0, state.susceptible - vaccinesForSusceptible)
  };
}