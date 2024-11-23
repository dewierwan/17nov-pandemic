import { useState, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { TimeSeriesDataPoint } from '../types';

interface StatisticsGraphsProps {
  data: TimeSeriesDataPoint[];
}

export default function StatisticsGraphs({ data }: StatisticsGraphsProps) {
  const [view, setView] = useState<'daily' | 'cumulative'>('daily');

  // Shared formatting functions
  const formatNumber = useCallback((num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  }, []);

  const formatMoney = useCallback((num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  }, []);

  // Data lines configuration
  const cumulativeDataLines = useMemo(() => [
    { key: 'susceptible', name: 'Susceptible', color: '#8B5CF6', yAxisId: 'left' },
    { key: 'infected', name: 'Active Cases', color: '#3B82F6', yAxisId: 'left' },
    { key: 'recovered', name: 'Recovered', color: '#10B981', yAxisId: 'left' },
    { key: 'deceased', name: 'Deceased', color: '#DC2626', yAxisId: 'left' },
    { key: 'economicCost', name: 'Economic Cost ($)', color: '#F59E0B', yAxisId: 'right' }
  ], []);

  const dailyDataLines = useMemo(() => [
    { key: 'newCases', name: 'New Cases', color: '#3B82F6', yAxisId: 'left' },
    { key: 'newDeaths', name: 'New Deaths', color: '#DC2626', yAxisId: 'left' },
    { key: 'dailyEconomicCost', name: 'Daily Economic Cost', color: '#F59E0B', yAxisId: 'right' }
  ], []);

  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    new Set([...cumulativeDataLines, ...dailyDataLines].map(line => line.key))
  );

  // Calculate daily changes
  const dailyData = useMemo(() => {
    return data.map((point, index) => {
      if (index === 0) {
        return {
          day: point.day,
          newCases: 0,
          newDeaths: 0,
          dailyEconomicCost: 0
        };
      }
      const prevPoint = data[index - 1];
      return {
        day: point.day,
        newCases: point.totalCases - prevPoint.totalCases,
        newDeaths: point.deceased - prevPoint.deceased,
        dailyEconomicCost: point.economicCost - prevPoint.economicCost
      };
    });
  }, [data]);

  const toggleLine = useCallback((lineKey: string) => {
    setVisibleLines(prev => {
      const next = new Set(prev);
      if (next.has(lineKey)) {
        next.delete(lineKey);
      } else {
        next.add(lineKey);
      }
      return next;
    });
  }, []);

  const tooltipFormatter = useCallback((value: number, name: string) => {
    if (name === 'Economic Cost ($)' || name === 'Daily Economic Cost') {
      return [formatMoney(value), name];
    }
    return [formatNumber(value), name];
  }, [formatNumber, formatMoney]);

  const CustomLegend = useMemo(() => {
    const currentDataLines = view === 'cumulative' ? cumulativeDataLines : dailyDataLines;
    
    return () => (
      <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
        {currentDataLines.map(line => (
          <button
            key={line.key}
            onClick={() => toggleLine(line.key)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              visibleLines.has(line.key)
                ? 'bg-gray-100 text-gray-900'
                : 'bg-gray-50 text-gray-400'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <span className="font-medium">{line.name}</span>
          </button>
        ))}
      </div>
    );
  }, [view, cumulativeDataLines, dailyDataLines, visibleLines, toggleLine]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-[550px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {view === 'cumulative' ? (
            <TrendingUp className="w-6 h-6 text-blue-600" />
          ) : (
            <Activity className="w-6 h-6 text-orange-600" />
          )}
          <h2 className="text-xl font-bold">
            {view === 'cumulative' ? 'Pandemic Progress' : 'Daily Statistics'}
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('cumulative')}
            className={`px-3 py-1 rounded-lg text-sm ${
              view === 'cumulative'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Cumulative
          </button>
          <button
            onClick={() => setView('daily')}
            className={`px-3 py-1 rounded-lg text-sm ${
              view === 'daily'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <LineChart 
            data={view === 'cumulative' ? data : dailyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              label={{ value: 'Days', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={formatNumber}
              label={{ 
                value: view === 'cumulative' ? 'Population' : 'Daily Cases/Deaths',
                angle: -90, 
                position: 'insideLeft',
                offset: 15
              }} 
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatMoney}
              label={{
                value: view === 'cumulative' ? 'Economic Cost' : 'Daily Economic Cost',
                angle: 90,
                position: 'insideRight',
                offset: 15
              }}
            />
            <Tooltip formatter={tooltipFormatter} />
            {(view === 'cumulative' ? cumulativeDataLines : dailyDataLines).map(line => (
              visibleLines.has(line.key) && (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  name={line.name}
                  dot={false}
                  yAxisId={line.yAxisId}
                  isAnimationActive={false}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend />
    </div>
  );
} 