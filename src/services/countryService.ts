import { Country } from '../data/countryData';

interface WorldBankMetadata {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

interface WorldBankCountry {
  id: string;           // ISO3 code
  name: string;         // Country name
  region: {
    id: string;
    value: string;
  };
  capitalCity: string;
  longitude: string;
  latitude: string;
}

interface WorldBankIndicator {
  countryCode: string;
  date: string;
  value: number;
  unit: string;
  obs_status: string;
  decimal: number;
}

interface WorldBankResponse<T> {
  [0]: WorldBankMetadata;
  [1]: T[];
}

// Add a cache for country names
const countryNameCache = new Map<string, string>();

export async function fetchCountryList(): Promise<Country[]> {
  try {
    // Get list of countries from World Bank
    const response = await fetch(
      'https://api.worldbank.org/v2/country?format=json&per_page=300'
    );
    const data: WorldBankResponse<WorldBankCountry> = await response.json();
    
    // Filter for countries (exclude regions and other non-country entries)
    const countries = data[1]
      .filter(country => 
        // Exclude aggregate regions and non-borrower entities
        !country.id.includes('_') && 
        country.region.id !== 'NA' &&
        country.longitude !== '' // Ensure it's a physical location
      )
      .map(country => {
        // Cache the country name
        countryNameCache.set(country.id, country.name);
        
        return {
          name: country.name,
          code: country.id,
          population: 0,
          gdpPerCapita: 0
        };
      })
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error('Error fetching country list:', error);
    return [];
  }
}

export async function fetchCountryData(countryCode: string): Promise<Partial<Country>> {
  try {
    const currentYear = new Date().getFullYear();
    const fiveYearsAgo = currentYear - 5;
    const dateRange = `${fiveYearsAgo}:${currentYear}`;

    // Fetch both indicators in parallel with a date range
    const [populationResponse, gdpResponse] = await Promise.all([
      fetch(
        `https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?format=json&date=${dateRange}&per_page=10`
      ),
      fetch(
        `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json&date=${dateRange}&per_page=10`
      )
    ]);

    const [populationData, gdpData]: [WorldBankResponse<WorldBankIndicator>, WorldBankResponse<WorldBankIndicator>] = 
      await Promise.all([
        populationResponse.json(),
        gdpResponse.json()
      ]);

    // Find the most recent non-null values within the last 5 years
    const population = populationData[1]?.find(entry => entry.value !== null)?.value || 0;
    const gdpPerCapita = gdpData[1]?.find(entry => entry.value !== null)?.value || 0;

    if (population === 0 || gdpPerCapita === 0) {
      console.warn(
        `Incomplete data for country ${countryCode}:`,
        `Population: ${population},`,
        `GDP per capita: ${gdpPerCapita}`
      );
    }

    return {
      population,
      gdpPerCapita
    };
  } catch (error) {
    console.error(`Error fetching data for country ${countryCode}:`, error);
    return { population: 0, gdpPerCapita: 0 };
  }
}

// Add a new function to get country name from code
export function getCountryName(countryCode: string): string | undefined {
  return countryNameCache.get(countryCode);
} 