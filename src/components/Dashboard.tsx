import React, { useState } from 'react';
import { SimulationState } from '../types';
import { TrendingUp, Users, Heart, DollarSign, Activity, UserCheck, AlertTriangle, Shield, Syringe, ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardProps {
  state: SimulationState;
}

const formatNumber = (num: number) => new Intl.NumberFormat().format(Math.round(num));
const formatPercent = (num: number) => (num * 100).toFixed(1);

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function Dashboard({ state }: DashboardProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  const totalInfectionPercentage = ((state.totalCases / state.population) * 100).toFixed(1);
  const activeCasePercentage = ((state.infected / state.totalCases) * 100).toFixed(1);
  const recoveryRate = ((state.recovered / state.totalCases) * 100).toFixed(1);
  const mortalityRate = ((state.deceased / state.totalCases) * 100).toFixed(1);
  const susceptiblePercentage = ((state.susceptible / state.population) * 100).toFixed(1);
  const vaccinatedPercentage = ((state.peopleVaccinated / state.population) * 100).toFixed(1);

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
                <Shield className="w-5 h-5" />
                <h3 className="font-semibold">Susceptible Population</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatNumber(state.susceptible)}</p>
              <p className="text-sm text-gray-500">{susceptiblePercentage}% of {formatNumber(state.population)}</p>
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
              <p className="text-2xl font-bold mt-2">{formatNumber(state.peopleVaccinated)}</p>
              <p className="text-sm text-gray-500">{vaccinatedPercentage}% of {formatNumber(state.population)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-emerald-600">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-semibold">Economic Impact</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatMoney(state.totalCosts)}</p>
              <p className="text-sm text-gray-500">Total economic damage</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Reproduction Numbers</h3>
              </div>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">R₀:</span>
                  <span className="font-bold">{state.r0.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rₑ:</span>
                  <span className="font-bold">{state.re.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Herd Immunity:</span>
                  <span className="font-bold">{(state.herdImmunityThreshold * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}