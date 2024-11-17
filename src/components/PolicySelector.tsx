import React from 'react';
import { Shield } from 'lucide-react';
import { PolicyOption } from '../types';
import { policyOptions } from '../data/policyDefinitions';

interface PolicySelectorProps {
  onSelectPolicy: (policy: PolicyOption) => void;
  usedPolicies: Set<string>;
  activePolicies: Set<string>;
}

export default function PolicySelector({ onSelectPolicy, usedPolicies, activePolicies }: PolicySelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold">Policy Options</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policyOptions.map((policy) => (
          <button
            key={policy.id}
            onClick={() => onSelectPolicy(policy)}
            disabled={policy.oneTime && usedPolicies.has(policy.id)}
            className={`p-4 rounded-lg border transition-colors ${
              policy.oneTime
                ? usedPolicies.has(policy.id)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'hover:bg-indigo-50 border-indigo-200'
                : activePolicies.has(policy.id)
                  ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                  : 'hover:bg-indigo-50 border-indigo-200'
            }`}
          >
            <h3 className="font-semibold">{policy.name}</h3>
            <p className="text-sm text-gray-600">{policy.description}</p>
            {!policy.oneTime && activePolicies.has(policy.id) && (
              <p className="text-sm text-green-700 mt-2">Active - Click to deactivate</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}