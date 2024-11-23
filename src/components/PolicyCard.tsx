import { PolicyOption } from '../types';
import { getAssetPath } from '../utils/assetHelpers';

interface PolicyCardProps {
  policy: PolicyOption;
  onSelect: () => void;
  isUsed: boolean;
  isActive: boolean;
}

export function PolicyCard({ policy, onSelect, isUsed, isActive }: PolicyCardProps) {
  const costPerCase = policy.dailyCostPerCase ?? 0;

  return (
    <button
      onClick={onSelect}
      disabled={policy.oneTime && isUsed}
      className={`p-4 rounded-lg border text-left transition-colors ${
        policy.oneTime
          ? isUsed
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'hover:bg-indigo-50 border-indigo-200'
          : isActive
            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
            : 'hover:bg-indigo-50 border-indigo-200'
      }`}
    >
      <div className="aspect-w-16 aspect-h-9 mb-3">
        <img
          src={getAssetPath(`assets/policies/${policy.id}.jpg`)}
          alt={policy.name}
          className="w-full h-48 object-cover rounded-lg mb-3"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <h3 className="font-semibold">{policy.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
      
      <div className="mt-3 space-y-2 border-t pt-2">
        {policy.contactReduction && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Contact reduction:</span>
            <span className="font-medium text-indigo-600">
              {(policy.contactReduction * 100).toFixed(0)}%
            </span>
          </div>
        )}
        
        {policy.transmissionReduction && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transmission reduction:</span>
            <span className="font-medium text-indigo-600">
              {(policy.transmissionReduction * 100).toFixed(0)}%
            </span>
          </div>
        )}
        
        {policy.exposedDetectionRate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Detection Rate:</span>
            <span className="font-medium text-indigo-600">
              {(policy.exposedDetectionRate * 100).toFixed(0)}%
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Implementation delay:</span>
          <span className="font-medium text-indigo-600">
            {policy.implementationDelay} days
          </span>
        </div>

        <div className="space-y-1 text-sm">
          {(policy.dailyCostPerPerson ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Cost per person:</span>
              <span className="font-medium text-red-600">
                ${policy.dailyCostPerPerson}/day
              </span>
            </div>
          )}
          {costPerCase > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Cost per active infection:</span>
              <span className="font-medium text-red-600">
                ${costPerCase}/day
              </span>
            </div>
          )}
        </div>

        {policy.vaccinationRate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Vaccination rate:</span>
            <span className="font-medium text-indigo-600">
              {(policy.vaccinationRate * 100).toFixed(0)}%/day
            </span>
          </div>
        )}

        {policy.costPerVaccination && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cost per vaccination:</span>
            <span className="font-medium text-red-600">
              ${policy.costPerVaccination}
            </span>
          </div>
        )}
      </div>
    </button>
  );
} 