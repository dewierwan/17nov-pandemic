import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { TimeSeriesDataPoint } from '../types';
import { useMemo, useCallback, useState } from 'react';

interface DailyStatsGraphProps {
  data: TimeSeriesDataPoint[];
}

interface DataLine {
  key: string;
  name: string;
  color: string;
  yAxisId: 'left' | 'right';
}

export default function DailyStatsGraph({ data }: DailyStatsGraphProps) {
  const dataLines = useMemo<DataLine[]>(() => [
    { key: 'newCases', name: 'New Cases', color: '#3B82F6', yAxisId: 'left' },
    { key: 'newDeaths', name: 'New Deaths', color: '#DC2626', yAxisId: 'left' },
    { key: 'dailyEconomicCost', name: 'Daily Economic Cost', color: '#F59E0B', yAxisId: 'right' }
  ], []);

  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    new Set(dataLines.map(line => line.key))
  );

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

  const tooltipFormatter = useCallback((value: number, name: string) => {
    if (name === 'Daily Economic Cost') {
      return [formatMoney(value), name];
    }
    return [formatNumber(value), name];
  }, [formatNumber, formatMoney]);

  const CustomLegend = useMemo(() => {
    return () => (
      <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
        {dataLines.map(line => (
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
  }, [dataLines, visibleLines, toggleLine]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-[550px]">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-6 h-6 text-orange-600" />
        <h2 className="text-xl font-bold">Daily Statistics</h2>
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              label={{ value: 'Days', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={formatNumber}
              label={{ 
                value: 'Daily Cases/Deaths', 
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
                value: 'Daily Economic Cost',
                angle: 90,
                position: 'insideRight',
                offset: 15
              }}
            />
            <Tooltip formatter={tooltipFormatter} />
            {dataLines.map(line => (
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