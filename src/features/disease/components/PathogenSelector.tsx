import { Shield, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Pathogen, ThreatType } from '../../../types';
import { pathogenOptions } from '../../../data/pathogenDefinitions';
import { getAssetPath } from '../../../shared/utils/assetHelpers';

interface PathogenSelectorProps {
  onSelectPathogen: (pathogen: Pathogen) => void;
  disabled: boolean;
  selectedThreatType: ThreatType;
  onThreatTypeChange: (type: ThreatType) => void;
  selectedPathogenId?: string;
}

export default function PathogenSelector({ onSelectPathogen, disabled, selectedThreatType, onThreatTypeChange, selectedPathogenId }: PathogenSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleMysteryThreatSelect = () => {
    const randomIndex = Math.floor(Math.random() * pathogenOptions.length);
    onThreatTypeChange('mystery');
    onSelectPathogen(pathogenOptions[randomIndex]);
  };

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
        <>
          <div className="mb-6">
            <div className="flex space-x-4 mb-2">
              <button
                onClick={() => onThreatTypeChange('known')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedThreatType === 'known'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                }`}
              >
                Known Threat
              </button>
              <button
                onClick={() => onThreatTypeChange('custom')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedThreatType === 'custom'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                }`}
              >
                Custom Parameters
              </button>
              <button
                onClick={handleMysteryThreatSelect}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedThreatType === 'mystery'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                }`}
              >
                Mystery Pathogen
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {selectedThreatType === 'known' && "Select from known historical or contemporary pathogens."}
              {selectedThreatType === 'custom' && "Customize pathogen parameters to explore different scenarios."}
              {selectedThreatType === 'mystery' && "Face an unknown pathogen with characteristics that are revealed over time."}
            </p>
          </div>

          {selectedThreatType !== 'mystery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pathogenOptions.map((pathogen) => (
                <button
                  key={pathogen.id}
                  onClick={() => onSelectPathogen(pathogen)}
                  disabled={disabled}
                  className={`p-4 rounded-lg border text-left transition-colors
                    ${disabled 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : selectedPathogenId === pathogen.id
                        ? 'bg-red-50 border-red-300 ring-2 ring-red-500 ring-opacity-50'
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
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
