import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { SimulationConfig } from '../../types';
import Tooltip from './Tooltip';
import {
  sliderToPopulation,
  probabilityToSlider,
  sliderToProbability,
  mortalityToSlider,
  sliderToMortality,
  sliderToEconomic
} from '../utils/sliderHelpers';

interface DiseaseParametersProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  disabled: boolean;
}

// Add tooltips configuration
const tooltips = {
  transmissionProbability: "The probability that an infectious contact results in disease transmission.",
  latentPeriod: "The time between exposure and becoming infectious (incubation period). During this period, individuals are infected but not yet contagious.",
  infectiousPeriod: "How long an infected person remains contagious.",
  mortalityRate: "The percentage of infected individuals who die from the disease (Infection Fatality Rate).",
  useDates: "Toggle between showing days since start or actual calendar dates",
};

export default function DiseaseParameters({ config, onConfigChange, disabled }: DiseaseParametersProps) {
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
      } else {
        onConfigChange({
          ...config,
          [field]: numValue,
        });
      }
    }
  };

  // Calculate R0 and herd immunity threshold
  const r0 = config.contactsPerDay * config.transmissionProbability * config.infectiousPeriod;
  const herdImmunityThreshold = Math.max(0, 1 - (1 / r0));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Disease Parameters</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-8">
          {/* Simulation Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

          {/* Add R0 and Herd Immunity boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-blue-900">Basic Reproduction Number (R₀)</h3>
                <Tooltip text="The average number of secondary infections caused by one infected individual in a completely susceptible population" />
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {r0.toFixed(2)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-green-900">Herd Immunity Threshold</h3>
                <Tooltip text="The proportion of the population that needs to be immune to stop disease spread" />
              </div>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {(herdImmunityThreshold * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 