import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { policyOptions } from '../data/policyDefinitions';

interface PolicySelectorProps {
  onSelectPolicy: (policy: any) => void;
  usedPolicies: Set<string>;
  activePolicies: Set<string>;
}

export default function PolicySelector({ onSelectPolicy, usedPolicies, activePolicies }: PolicySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold">Policy Options</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {policyOptions.map((policy) => (
            <button
              key={policy.id}
              onClick={() => onSelectPolicy(policy)}
              disabled={policy.oneTime && usedPolicies.has(policy.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                policy.oneTime
                  ? usedPolicies.has(policy.id)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-indigo-50 border-indigo-200'
                  : activePolicies.has(policy.id)
                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                    : 'hover:bg-indigo-50 border-indigo-200'
              }`}
            >
              <div className="aspect-w-16 aspect-h-9 mb-3">
                <img
                  src={`/assets/policies/${policy.id}.jpg`}
                  alt={policy.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    // Hide the image element if loading fails
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <h3 className="font-semibold">{policy.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
              {!policy.oneTime && activePolicies.has(policy.id) && (
                <p className="text-sm text-green-700 mt-2">Active - Click to deactivate</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}