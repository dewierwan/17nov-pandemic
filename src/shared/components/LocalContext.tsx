import { useState, useEffect } from 'react';
import { Users, DollarSign, Users2, Globe } from 'lucide-react';
import { SimulationConfig } from '../../types';
import Tooltip from './Tooltip';
import Select, { SingleValue } from 'react-select';
import { fetchCountryList, fetchCountryData } from '../../services/countryService';

// Define the type for our select options
type CountryOption = {
  value: string;
  label: string;
};

interface LocalContextProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  disabled: boolean;
}

// Add GDP multiplier constant at the top of the file
const GDP_TO_DEATH_COST_MULTIPLIER = 40;

// Add tooltips configuration
const tooltips = {
  population: "The total number of people in the simulated population.",
  economicCostPerDeath: `The estimated economic impact of each death, including healthcare costs and lost productivity. By default, this is set to ${GDP_TO_DEATH_COST_MULTIPLIER}x the country's GDP per capita.`,
  contactsPerDay: "Average number of close contacts each person has per day that could lead to disease transmission.",
  country: "Select a country to automatically set population and economic parameters",
};

const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

const formatMoney = (amount: number) => {
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)} trillion`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} billion`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)} million`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
};

// Create a generic function for logarithmic slider conversions
const createLogSliderHandlers = (config: {
  minValue: number;
  maxValue: number;
  minSlider?: number;
  maxSlider?: number;
}) => {
  const {
    minValue,
    maxValue,
    minSlider = 0,
    maxSlider = 100
  } = config;

  const valueToSlider = (value: number) => {
    if (value <= minValue) return minSlider;
    if (value >= maxValue) return maxSlider;
    const minLog = Math.log10(minValue);
    const maxLog = Math.log10(maxValue);
    const scale = (maxLog - minLog) / (maxSlider - minSlider);
    return Math.round((Math.log10(value) - minLog) / scale) + minSlider;
  };

  const sliderToValue = (slider: number) => {
    if (slider <= minSlider) return minValue;
    if (slider >= maxSlider) return maxValue;
    const minLog = Math.log10(minValue);
    const maxLog = Math.log10(maxValue);
    const scale = (maxLog - minLog) / (maxSlider - minSlider);
    return Math.pow(10, minLog + ((slider - minSlider) * scale));
  };

  return { valueToSlider, sliderToValue };
};

// Create specific handlers for population
const populationHandlers = createLogSliderHandlers({
  minValue: 1e3,  // 1 thousand
  maxValue: 1e10, // 10 billion
});

export default function LocalContext({ config, onConfigChange, disabled }: LocalContextProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [isLoadingCountry, setIsLoadingCountry] = useState(false);

  useEffect(() => {
    async function loadCountries() {
      const countries = await fetchCountryList();
      setCountryOptions(countries.map(country => ({
        value: country.code,
        label: country.name
      })));
    }
    loadCountries();
  }, []);

  const handleChange = (field: keyof SimulationConfig, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;

    if (field === 'population') {
      onConfigChange({
        ...config,
        population: populationHandlers.sliderToValue(numValue)
      });
    } else {
      onConfigChange({
        ...config,
        [field]: numValue,
      });
    }
  };

  const handleCountryChange = async (selectedOption: SingleValue<CountryOption>) => {
    if (!selectedOption) {
      onConfigChange({
        ...config,
        selectedCountry: undefined
      });
      return;
    }

    setIsLoadingCountry(true);
    try {
      const countryData = await fetchCountryData(selectedOption.value);
      
      if (countryData.population && countryData.gdpPerCapita) {
        onConfigChange({
          ...config,
          population: countryData.population,
          economicCostPerDeath: countryData.gdpPerCapita * GDP_TO_DEATH_COST_MULTIPLIER,
          selectedCountry: selectedOption.value
        });
      }
    } catch (error) {
      console.error('Error loading country data:', error);
    } finally {
      setIsLoadingCountry(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center space-x-2">
          <Users2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Local Context</h2>
        </div>
      </button>
      
      {isExpanded && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.country} />
                <Globe className="w-4 h-4 mr-1 text-gray-500" />
                Country
              </label>
              <Select<CountryOption>
                className="mt-1"
                options={countryOptions}
                value={config.selectedCountry ? {
                  value: config.selectedCountry,
                  label: countryOptions.find(opt => opt.value === config.selectedCountry)?.label || ''
                } : null}
                onChange={handleCountryChange}
                isDisabled={disabled || isLoadingCountry}
                isLoading={isLoadingCountry}
                isClearable
                placeholder="Select a country..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.population} />
                <Users className="w-4 h-4 mr-1 text-gray-500" />
                Population
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={populationHandlers.valueToSlider(config.population)}
                onChange={(e) => handleChange('population', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                {formatNumber(config.population)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.economicCostPerDeath} />
                <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                Economic cost per Death
              </label>
              <input
                type="range"
                min="0"
                max="20000000"
                step="100000"
                value={config.economicCostPerDeath}
                onChange={(e) => handleChange('economicCostPerDeath', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                {formatMoney(config.economicCostPerDeath)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.contactsPerDay} />
                <Users2 className="w-4 h-4 mr-1 text-gray-500" />
                Daily Contacts
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={config.contactsPerDay}
                onChange={(e) => handleChange('contactsPerDay', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                {config.contactsPerDay} contacts per day
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 