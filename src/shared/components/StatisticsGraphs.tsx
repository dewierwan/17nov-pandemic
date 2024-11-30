import { useState, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { TimeSeriesDataPoint, SimulationConfig } from '../../types';
import { format } from 'date-fns';

interface StatisticsGraphsProps {
  data: TimeSeriesDataPoint[];
  config: SimulationConfig;
  onDateDisplayChange: (useDates: boolean) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: number;
  useDates?: boolean;
  startDate?: Date;
}

const CustomTooltip = ({ active, payload, label, useDates, startDate }: CustomTooltipProps) => {
  if (!active || !payload) return null;

  let dateStr = '';
  if (useDates && startDate && label !== undefined) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + label);
    dateStr = format(date, 'dd MMM, yyyy');
  }

  const formatValue = (value: number, name: string) => {
    if (name.includes('Economic Cost')) {
      if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
      return `$${value.toFixed(0)}`;
    } else {
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      return value.toFixed(0);
    }
  };

  return (
    <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
      <div className="mb-2">
        <p className="font-medium">Day {label}</p>
        {dateStr && <p className="text-gray-600 text-sm">{dateStr}</p>}
      </div>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }}>
          {`${entry.name} : ${formatValue(entry.value, entry.name)}`}
        </p>
      ))}
    </div>
  );
};

export default function StatisticsGraphs({ data, config, onDateDisplayChange }: StatisticsGraphsProps) {
  if (data.length <= 1) {
    return null;
  }

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
    { key: 'exposed', name: 'Exposed', color: '#F59E0B', yAxisId: 'left' },
    { key: 'infected', name: 'Infectious', color: '#3B82F6', yAxisId: 'left' },
    { key: 'recovered', name: 'Recovered', color: '#10B981', yAxisId: 'left' },
    { key: 'deceased', name: 'Deceased', color: '#DC2626', yAxisId: 'left' }
  ], []);

  const dailyDataLines = useMemo(() => [
    { key: 'exposed', name: 'Newly Exposed', color: '#F59E0B', yAxisId: 'left' },
    { key: 'newCases', name: 'Newly Infectious', color: '#3B82F6', yAxisId: 'left' },
    { key: 'newDeaths', name: 'New Deaths', color: '#DC2626', yAxisId: 'right' }
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
          exposed: 0,
          newCases: 0,
          newDeaths: 0
        };
      }
      const prevPoint = data[index - 1];
      return {
        day: point.day,
        exposed: Math.max(0, point.exposed - prevPoint.exposed),
        newCases: Math.max(0, point.infected - prevPoint.infected),
        newDeaths: point.deceased - prevPoint.deceased
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

  const formatXAxis = useCallback((value: number) => {
    if (!config.useDates || !config.startDate) {
      return value.toString();
    }
    const date = new Date(config.startDate);
    date.setDate(date.getDate() + value);
    return format(date, 'dd MMM');
  }, [config.useDates, config.startDate]);

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
    <div className="bg-white rounded-xl shadow-lg p-6 h-[550px] relative">
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
            margin={{ top: 20, right: 65, left: 65, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              tickFormatter={formatXAxis}
              label={{ 
                value: config.useDates ? 'Date' : 'Days', 
                position: 'insideBottom', 
                offset: -10 
              }} 
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={formatNumber}
              label={{ 
                value: view === 'cumulative' ? 'Population' : 'Daily Cases/Deaths',
                angle: -90, 
                position: 'insideLeft',
                offset: -45,
                style: { textAnchor: 'middle' }
              }}
              dx={-10}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatNumber}
              label={{
                value: view === 'cumulative' ? 'Population' : 'Daily Deaths',
                angle: 90,
                position: 'insideRight',
                offset: -45,
                style: { textAnchor: 'middle' }
              }}
              dx={10}
            />
            <Tooltip 
              content={
                <CustomTooltip 
                  useDates={config.useDates} 
                  startDate={config.startDate} 
                />
              }
            />
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
      
      <div className="absolute bottom-6 right-6">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.useDates}
            onChange={(e) => onDateDisplayChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">
            {config.useDates ? 'Calendar Dates' : 'Days Since Start'}
          </span>
        </label>
      </div>
    </div>
  );
}
