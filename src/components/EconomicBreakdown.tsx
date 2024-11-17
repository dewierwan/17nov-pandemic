import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import { SimulationState, SimulationConfig, PolicyCost } from '../types';

interface EconomicBreakdownProps {
  state: SimulationState;
  config: SimulationConfig;
}

const formatMoney = (amount: number) => {
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)}T`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
  return `$${amount.toFixed(0)}`;
};

const policyNames: { [key: string]: string } = {
  'lockdown': 'Full Lockdown',
  'masks': 'Mandatory Mask Wearing',
  'testing': 'Testing and Contact Tracing',
  'distancing': 'Social Distancing Measures'
};

export default function EconomicBreakdown({ state }: EconomicBreakdownProps) {
  const data = [
    {
      name: 'Deaths',
      cost: state.deathCosts
    },
    {
      name: 'Vaccine (R&D)',
      cost: state.isVaccinationStarted ? 10_000_000_000 : 0
    },
    {
      name: 'Vaccine (Delivery)',
      cost: state.isVaccinationStarted ? state.vaccineCosts - 10_000_000_000 : 0
    },
    ...state.policyCosts.map((cost: PolicyCost) => ({
      name: policyNames[cost.id] || cost.id,
      cost: cost.totalCost
    }))
  ].filter(item => item.cost > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold">Economic Cost</h2>
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatMoney} />
            <Tooltip formatter={(value: number) => [formatMoney(value), 'Cost']} />
            <Bar dataKey="cost" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}