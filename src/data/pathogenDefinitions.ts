import { Pathogen } from '../types';

export const pathogenOptions: Pathogen[] = [
  {
    id: 'measles',
    name: 'Measles Virus',
    description: 'Highly contagious viral infection with respiratory transmission',
    transmissionProbability: 0.4,   // Very high transmission
    latentPeriod: 10,               // ~10 days from exposure to infectious
    infectiousPeriod: 4,                // ~4 days infectious period
    mortalityRate: 0.001            // ~0.1% IFR in modern settings
  },
  {
    id: 'spanish_flu',
    name: '1918 Influenza',
    description: 'The devastating 1918 "Spanish Flu" pandemic',
    transmissionProbability: 0.03,  // Moderate-high transmission
    latentPeriod: 2,                // ~2 days incubation
    infectiousPeriod: 7,            // ~7 days infectious period
    mortalityRate: 0.025            // ~2.5% IFR (estimates vary between 2-5%)
  },
  {
    id: 'smallpox',
    name: 'Smallpox',
    description: 'Historical viral disease, eradicated in 1980',
    transmissionProbability: 0.05,   // High transmission
    latentPeriod: 12,               // ~12 days incubation
    infectiousPeriod: 12,           // ~14 days infectious period
    mortalityRate: 0.3              // ~30% IFR (historical average)
  },
  {
    id: 'sars_cov_2',
    name: 'SARS-CoV-2',
    description: 'Coronavirus causing COVID-19. Original variant',
    transmissionProbability: 0.02,  // Moderate transmission
    latentPeriod: 5,                // ~5 days incubation
    infectiousPeriod: 10,                // ~8 days infectious period
    mortalityRate: 0.01             // ~1% IFR
  }
  /*
  {
    id: 'omicron',
    name: 'SARS-CoV-2 Omicron',
    description: 'Coronavirus causing COVID-19. Omicron variant',
    transmissionProbability: 0.08,  // Moderate transmission
    latentPeriod: 3,                // ~5 days incubation
    infectiousPeriod: 8,                // ~8 days infectious period
    mortalityRate: 0.002             // ~1% IFR
  },
  {
    id: 'hiv',
    name: 'HIV',
    description: 'Human Immunodeficiency Virus',
    transmissionProbability: 0.001,  // Low per-contact transmission
    latentPeriod: 21,               // ~3 weeks acute phase
    infectiousPeriod: 3650,             // Long-term infection (~10 years without treatment)
    mortalityRate: 0.95             // High mortality without treatment
  }
    */
]; 