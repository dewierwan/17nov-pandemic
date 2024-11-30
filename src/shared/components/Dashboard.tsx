import { useState } from 'react';
import { SimulationState } from '../../types';
import { Users, Heart, DollarSign, Activity, UserCheck, AlertTriangle, Shield, Syringe, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  state: SimulationState;
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

export default function Dashboard({ state }: DashboardProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  const totalInfectionPercentage = ((state.totalCases / state.population) * 100).toFixed(1);
  const activeCasePercentage = ((state.infected / state.totalCases) * 100).toFixed(1);
  const recoveryRate = ((state.recovered / state.totalCases) * 100).toFixed(1);
  const mortalityRate = ((state.deceased / state.totalCases) * 100).toFixed(1);
  const susceptiblePercentage = ((state.susceptible / state.population) * 100).toFixed(1);
  const vaccinatedPercentage = ((state.totalVaccinated / state.population) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button 
        onClick={() => setIsStatsExpanded(!isStatsExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Statistics</h2>
        </div>
        {isStatsExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isStatsExpanded && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Effective Reproduction (Rₑ)</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{state.re.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Current transmission rate</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">Daily Contact Rate (kₑ)</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{state.effectiveContacts.toFixed(1)}</p>
              <p className="text-sm text-gray-500">contacts/day</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Transmission Probability (πₑ)</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{(state.effectiveTransmissionRate * 100).toFixed(1)}%</p>
              <p className="text-sm text-gray-500">per contact</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <Shield className="w-5 h-5" />
                <h3 className="font-semibold">Susceptible Population</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.susceptible)}</p>
              <p className="text-sm text-gray-500">{susceptiblePercentage}% of {formatNumber(state.population)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-semibold">Exposed (Pre-infectious)</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.exposed)}</p>
              <p className="text-sm text-gray-500">
                {((state.exposed / state.population) * 100).toFixed(1)}% of population
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">Active Infections</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.infected)}</p>
              <p className="text-sm text-gray-500">{activeCasePercentage}% of total infections</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-600">
                <UserCheck className="w-5 h-5" />
                <h3 className="font-semibold">Recovered</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.recovered)}</p>
              <p className="text-sm text-gray-500">{recoveryRate}% of infections</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Heart className="w-5 h-5" />
                <h3 className="font-semibold">Deceased</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.deceased)}</p>
              <p className="text-sm text-gray-500">{mortalityRate}% of infections</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-teal-600">
                <Syringe className="w-5 h-5" />
                <h3 className="font-semibold">Vaccinated</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.totalVaccinated)}</p>
              <p className="text-sm text-gray-500">{vaccinatedPercentage}% of {formatNumber(state.population)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Total Infections</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.totalCases)}</p>
              <p className="text-sm text-gray-500">{totalInfectionPercentage}% of {formatNumber(state.population)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-emerald-600">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-semibold">Economic Cost</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatMoney(state.totalCosts)}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
