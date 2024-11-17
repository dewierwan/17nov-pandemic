import React from 'react';
import { PolicyOption } from '../types';
import { Shield, Check, X, Syringe } from 'lucide-react';

interface PolicySelectorProps {
  policies: PolicyOption[];
  activePolicies: PolicyOption[];
  onSelectPolicy: (policy: PolicyOption) => void;
  onStartVaccination: () => void;
  isVaccinationStarted: boolean;
}

export default function PolicySelector({ 
  policies, 
  activePolicies, 
  onSelectPolicy,
  onStartVaccination,
  isVaccinationStarted 
}: PolicySelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold">Policy Options</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((policy) => {
          const isActive = activePolicies.some(p => p.id === policy.id);
          return (
            <button
              key={policy.id}
              onClick={() => onSelectPolicy(policy)}
              className={`p-4 rounded-lg transition-all ${
                isActive
                  ? 'bg-indigo-100 border-2 border-indigo-500'
                  : 'bg-gray-50 border-2 border-transparent hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{policy.name}</h3>
                {isActive ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    <Check className="w-4 h-4 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    <X className="w-4 h-4 mr-1" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
              <div className="space-y-1 text-sm">
                <p className="text-red-600">Cost: ${policy.dailyCostPerPerson} per person per day</p>
                <p className="text-green-600">Reduces transmission by {policy.transmissionReduction * 100}%</p>
                <p className="text-blue-600">Takes effect in {policy.implementationDelay} days</p>
              </div>
            </button>
          );
        })}

        {/* Vaccination Program Button */}
        <button
          onClick={onStartVaccination}
          disabled={isVaccinationStarted}
          className={`p-4 rounded-lg transition-all ${
            isVaccinationStarted
              ? 'bg-indigo-100 border-2 border-indigo-500'
              : 'bg-gray-50 border-2 border-transparent hover:border-indigo-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">Vaccination Program</h3>
            {isVaccinationStarted ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                <Check className="w-4 h-4 mr-1" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                <Syringe className="w-4 h-4 mr-1" />
                Available
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Implement a nationwide vaccination program
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-red-600">R&D Cost: $10B</p>
            <p className="text-red-600">Delivery Cost: $20 per vaccine</p>
            <p className="text-green-600">Vaccination Rate: 1% of population per day</p>
            <p className="text-blue-600">Implementation: 100 days</p>
          </div>
        </button>
      </div>
    </div>
  );
}