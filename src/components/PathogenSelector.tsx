import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Pathogen } from '../types';
import { pathogenOptions } from '../data/pathogenDefinitions';
import { getAssetPath } from '../utils/assetHelpers';

interface PathogenSelectorProps {
  onSelectPathogen: (pathogen: Pathogen) => void;
  disabled: boolean;
}

export default function PathogenSelector({ onSelectPathogen, disabled }: PathogenSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold">Select Pathogen</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pathogenOptions.map((pathogen) => (
            <button
              key={pathogen.id}
              onClick={() => onSelectPathogen(pathogen)}
              disabled={disabled}
              className={`p-4 rounded-lg border text-left transition-colors
                ${disabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-red-50 border-red-200'
                }`}
            >
              <div className="aspect-w-16 aspect-h-9 mb-3">
                <img
                  src={getAssetPath(`assets/pathogens/${pathogen.id}.jpg`)}
                  alt={pathogen.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    console.error(`Failed to load image for ${pathogen.id}`);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <h3 className="font-semibold">{pathogen.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{pathogen.description}</p>
              {/*
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <p>Transmission rate: {(pathogen.transmissionProbability * 100).toFixed(1)}%</p>
                <p>Incubation period: {pathogen.latentPeriod} days</p>
                <p>Infectious period: {pathogen.recoveryDays} days</p>
                <p>Fatality rate: {(pathogen.mortalityRate * 100).toFixed(1)}%</p>
              </div>
              */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 