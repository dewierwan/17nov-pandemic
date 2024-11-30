import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { SimulationConfig } from '../../types';
import Tooltip from './Tooltip';

interface ConfigPanelProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  disabled: boolean;
}

interface LogSliderConfig {
  minValue: number;
  maxValue: number;
  minSlider?: number;
  maxSlider?: number;
}

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
const createLogSliderHandlers = (config: LogSliderConfig) => {
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

// Create specific handlers for each type of slider
const populationHandlers = createLogSliderHandlers({
  minValue: 1e3,  // 1 million
  maxValue: 1e10, // 10 billion
});

const probabilityHandlers = createLogSliderHandlers({
  minValue: 0.001, // 0.1%
  maxValue: 1,     // 100%
});

const mortalityHandlers = createLogSliderHandlers({
  minValue: 0.0001, // 0.01%
  maxValue: 1,      // 100%
});

const economicHandlers = createLogSliderHandlers({
  minValue: 1e9,    // $1 billion
  maxValue: 1e13,   // $10 trillion
});

// Replace the old conversion functions with the new handlers
const sliderToPopulation = populationHandlers.sliderToValue;
const populationToSlider = populationHandlers.valueToSlider;
const sliderToProbability = probabilityHandlers.sliderToValue;
const probabilityToSlider = probabilityHandlers.valueToSlider;
const sliderToMortality = mortalityHandlers.sliderToValue;
const mortalityToSlider = mortalityHandlers.valueToSlider;
const sliderToEconomic = economicHandlers.sliderToValue;
const economicToSlider = economicHandlers.valueToSlider;

// Add a linear handler for percentage values (0-100%)
const percentageToSlider = (value: number) => value * 100;
const sliderToPercentage = (value: number) => value / 100;

// Add tooltips configuration
const tooltips = {
  daysPerSecond: "Controls how fast the simulation runs. Higher values make the simulation run faster.",
  population: "The total number of people in the simulated population.",
  economicCostPerDeath: "The estimated economic impact of each death, including healthcare costs and lost productivity.",
  contactsPerDay: "Average number of close contacts each person has per day that could lead to disease transmission.",
  transmissionProbability: "The probability that an infectious contact results in disease transmission.",
  latentPeriod: "The time between exposure and becoming infectious (incubation period). During this period, individuals are infected but not yet contagious.",
  infectiousPeriod: "How long an infected person remains contagious.",
  mortalityRate: "The percentage of infected individuals who die from the disease (Infection Fatality Rate).",
  useDates: "Toggle between showing days since start or actual calendar dates",
  enableWinLose: "Enable win/lose conditions for a more game-like experience",
  maxDeathPercentage: "Maximum percentage of population that can die before losing",
  maxEconomicCost: "Maximum economic cost before losing",
};

export default function ConfigPanel({ config, onConfigChange, disabled }: ConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (field: keyof SimulationConfig, value: string | boolean | number) => {
    if (typeof value === 'boolean') {
      onConfigChange({
        ...config,
        [field]: value,
      });
      return;
    }

    if (typeof value === 'string') {
      const numValue = Number(value);
      if (isNaN(numValue)) return;

      if (field === 'population') {
        onConfigChange({
          ...config,
          population: sliderToPopulation(numValue)
        });
      } else if (field === 'transmissionProbability') {
        onConfigChange({
          ...config,
          transmissionProbability: sliderToProbability(numValue)
        });
      } else if (field === 'mortalityRate') {
        onConfigChange({
          ...config,
          mortalityRate: sliderToMortality(numValue)
        });
      } else if (field === 'maxEconomicCost') {
        onConfigChange({
          ...config,
          maxEconomicCost: sliderToEconomic(numValue)
        });
      } else if (field === 'maxDeathPercentage') {
        onConfigChange({
          ...config,
          maxDeathPercentage: sliderToPercentage(numValue)
        });
      } else {
        onConfigChange({
          ...config,
          [field]: numValue,
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-8">
          {/* Game Settings */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableWinLose"
                  checked={config.enableWinLose}
                  onChange={(e) => handleChange('enableWinLose', e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 text-purple-600"
                />
                <label htmlFor="enableWinLose" className="text-sm font-medium text-gray-700 flex items-center">
                  <Tooltip text={tooltips.enableWinLose} />
                  Enable Win/Lose Conditions
                </label>
              </div>

              {config.enableWinLose && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Tooltip text={tooltips.maxDeathPercentage} />
                      Max Death Percentage
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={percentageToSlider(config.maxDeathPercentage)}
                      onChange={(e) => handleChange('maxDeathPercentage', e.target.value)}
                      disabled={disabled}
                      className="w-full mt-1"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      {(config.maxDeathPercentage * 100).toFixed(1)}% of population
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Tooltip text={tooltips.maxEconomicCost} />
                      Max Economic Cost
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={economicToSlider(config.maxEconomicCost)}
                      onChange={(e) => handleChange('maxEconomicCost', e.target.value)}
                      disabled={disabled}
                      className="w-full mt-1"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      {formatMoney(config.maxEconomicCost)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Simulation Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.daysPerSecond} />
                Simulation speed
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={config.daysPerSecond}
                onChange={(e) => handleChange('daysPerSecond', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                {config.daysPerSecond} days/second
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.population} />
                Population
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={populationToSlider(config.population)}
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
                Current: {formatMoney(config.economicCostPerDeath)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.contactsPerDay} />
                Daily Contacts (k)
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
                k = {config.contactsPerDay} contacts per day
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.transmissionProbability} />
                Transmission probability per contact
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={probabilityToSlider(config.transmissionProbability)}
                onChange={(e) => handleChange('transmissionProbability', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                π = {(config.transmissionProbability * 100).toFixed(1)}% probability of transmission per contact
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.latentPeriod} />
                Latent period
              </label>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={config.latentPeriod}
                onChange={(e) => handleChange('latentPeriod', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                {config.latentPeriod} days (σ = {(1/config.latentPeriod).toFixed(3)})
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.infectiousPeriod} />
                Infectious period
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={config.infectiousPeriod}
                onChange={(e) => handleChange('infectiousPeriod', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                {config.infectiousPeriod} days (γ = {(1/config.infectiousPeriod).toFixed(3)})
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.mortalityRate} />
                Infection fatality rate (IFR)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={mortalityToSlider(config.mortalityRate)}
                onChange={(e) => handleChange('mortalityRate', e.target.value)}
                disabled={disabled}
                className="w-full mt-1"
              />
              <div className="text-sm text-gray-600 mt-1">
                {(config.mortalityRate * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
