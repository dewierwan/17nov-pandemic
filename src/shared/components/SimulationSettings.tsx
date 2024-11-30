import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { SimulationConfig } from '../../types';
import Tooltip from './Tooltip';

interface SimulationSettingsProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  disabled: boolean;
}

// Add tooltips configuration
const tooltips = {
  daysPerSecond: "Controls how fast the simulation runs. Higher values make the simulation run faster.",
  enableWinLose: "Enable win/lose conditions for a more game-like experience",
  maxDeathPercentage: "Maximum percentage of population that can die before losing",
  maxEconomicCost: "Maximum economic cost before losing",
};

const formatMoney = (amount: number) => {
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)} trillion`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} billion`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)} million`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
};

// Add a linear handler for percentage values (0-100%)
const percentageToSlider = (value: number) => value * 100;
const sliderToPercentage = (value: number) => value / 100;

// Create handlers for economic values
const economicHandlers = {
  minValue: 1e9,    // $1 billion
  maxValue: 1e13,   // $10 trillion
  valueToSlider: (value: number) => {
    const minLog = Math.log10(1e9);
    const maxLog = Math.log10(1e13);
    const scale = (maxLog - minLog) / 100;
    return Math.round((Math.log10(value) - minLog) / scale);
  },
  sliderToValue: (slider: number) => {
    const minLog = Math.log10(1e9);
    const maxLog = Math.log10(1e13);
    const scale = (maxLog - minLog) / 100;
    return Math.pow(10, minLog + (slider * scale));
  }
};

// Update the toggle styles
const toggleStyles = `
  .toggle-checkbox {
    height: 1.25rem;
    width: 2.5rem;
    left: 0;
  }
  .toggle-checkbox:checked {
    transform: translateX(1.25rem);
    border-color: #7C3AED;
    background-color: #7C3AED;
  }
  .toggle-label {
    width: 2.5rem;
    height: 1.25rem;
    background-color: #E5E7EB;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #DDD6FE;
  }
`;

export default function SimulationSettings({ config, onConfigChange, disabled }: SimulationSettingsProps) {
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

      if (field === 'maxEconomicCost') {
        onConfigChange({
          ...config,
          maxEconomicCost: economicHandlers.sliderToValue(numValue)
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
      <style>{toggleStyles}</style>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Simulation Settings</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-8">
          <div className={`grid grid-cols-1 md:grid-cols-2 ${
            config.enableWinLose ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
          } gap-4`}>
            {/* Simulation Speed */}
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

            {/* Win/Lose Toggle */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tooltip text={tooltips.enableWinLose} />
                Win/lose?
              </label>
              <div className="flex items-center h-[22px] mt-1">
                <div className="relative inline-block align-middle">
                  <input
                    type="checkbox"
                    id="enableWinLose"
                    checked={config.enableWinLose}
                    onChange={(e) => handleChange('enableWinLose', e.target.checked)}
                    disabled={disabled}
                    className="toggle-checkbox absolute block rounded-full bg-white border-2 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                  />
                  <label
                    htmlFor="enableWinLose"
                    className="toggle-label block rounded-full cursor-pointer"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                &nbsp;
              </div>
            </div>

            {/* Game Settings Sliders - Only show if enabled */}
            {config.enableWinLose && (
              <>
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
                    value={economicHandlers.valueToSlider(config.maxEconomicCost)}
                    onChange={(e) => handleChange('maxEconomicCost', e.target.value)}
                    disabled={disabled}
                    className="w-full mt-1"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {formatMoney(config.maxEconomicCost)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 