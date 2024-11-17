import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { SimulationConfig } from '../types';

interface ConfigPanelProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  disabled: boolean;
}

const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

// Convert linear slider value (0-100) to logarithmic population
const sliderToPopulation = (value: number) => {
  const minLog = Math.log10(1e6); // 1 million
  const maxLog = Math.log10(1e10); // 10 billion
  const scale = (maxLog - minLog) / 100;
  return Math.round(Math.pow(10, minLog + (value * scale)));
};

// Convert population to linear slider value
const populationToSlider = (population: number) => {
  const minLog = Math.log10(1e6);
  const maxLog = Math.log10(1e10);
  const scale = (maxLog - minLog) / 100;
  return Math.round((Math.log10(population) - minLog) / scale);
};

export default function ConfigPanel({ config, onConfigChange, disabled }: ConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (key: keyof SimulationConfig, value: string) => {
    if (key === 'population') {
      // Convert linear slider value to logarithmic population
      onConfigChange({
        ...config,
        population: sliderToPopulation(parseInt(value)),
      });
    } else {
      onConfigChange({
        ...config,
        [key]: parseFloat(value),
      });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Initial Population
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
              Current: {formatNumber(config.population)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Basic Reproduction Number (R₀)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={config.initialR0}
              onChange={(e) => handleChange('initialR0', e.target.value)}
              disabled={disabled}
              className="w-full mt-1"
            />
            <div className="text-sm text-gray-600 mt-1">
              Current: {config.initialR0.toFixed(1)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mortality Rate (%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={config.mortalityRate}
              onChange={(e) => handleChange('mortalityRate', e.target.value)}
              disabled={disabled}
              className="w-full mt-1"
            />
            <div className="text-sm text-gray-600 mt-1">
              Current: {(config.mortalityRate * 100).toFixed(1)}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incubation Period (Days)
            </label>
            <input
              type="range"
              min="1"
              max="14"
              step="1"
              value={config.incubationDays}
              onChange={(e) => handleChange('incubationDays', e.target.value)}
              disabled={disabled}
              className="w-full mt-1"
            />
            <div className="text-sm text-gray-600 mt-1">
              Current: {config.incubationDays} days
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recovery Period (Days)
            </label>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={config.recoveryDays}
              onChange={(e) => handleChange('recoveryDays', e.target.value)}
              disabled={disabled}
              className="w-full mt-1"
            />
            <div className="text-sm text-gray-600 mt-1">
              Current: {config.recoveryDays} days
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Simulation Speed (Days/Second)
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
              Current: {config.daysPerSecond} days/second
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Economic Cost per Death
            </label>
            <input
              type="range"
              min="100000"
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
        </div>
      )}
    </div>
  );
}