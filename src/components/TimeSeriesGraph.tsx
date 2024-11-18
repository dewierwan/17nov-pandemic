import React, { useState, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesDataPoint } from '../types';
import { TrendingUp } from 'lucide-react';

interface TimeSeriesGraphProps {
  data: TimeSeriesDataPoint[];
}

interface DataLine {
  key: keyof TimeSeriesDataPoint;
  name: string;
  color: string;
}

export default function TimeSeriesGraph({ data }: TimeSeriesGraphProps) {
  const dataLines = useMemo<DataLine[]>(() => [
    { key: 'susceptible', name: 'Susceptible', color: '#8B5CF6' },
    { key: 'infected', name: 'Active Cases', color: '#3B82F6' },
    { key: 'recovered', name: 'Recovered', color: '#10B981' },
    { key: 'deceased', name: 'Deceased', color: '#DC2626' },
    { key: 'economicCost', name: 'Economic Cost ($)', color: '#F59E0B' }
  ], []);

  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    new Set(dataLines.map(line => line.key))
  );

  const formatNumber = useCallback((num: number) => 
    new Intl.NumberFormat().format(Math.round(num)), []);
  
  const formatMoney = useCallback((num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)} trillion`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)} billion`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)} million`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  }, []);
  
  const formatYAxis = useCallback((value: number, dataKey?: string) => {
    if (dataKey === 'economicCost') {
      return formatMoney(value);
    }
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)}M`;
    }
    return value.toString();
  }, [formatMoney]);

  const toggleLine = useCallback((key: string) => {
    setVisibleLines(prev => {
      const newSet = new Set(prev);
      if (prev.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

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

  const tooltipFormatter = useCallback((value: number, name: string) => [
    name === 'Economic Cost ($)' ? formatMoney(value) : formatNumber(value),
    name
  ], [formatMoney, formatNumber]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-[550px]">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold">Pandemic Progress</h2>
      </div>
      
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              label={{ value: 'Days', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => formatYAxis(value)}
              label={{ 
                value: 'Population', 
                angle: -90, 
                position: 'insideLeft',
                offset: 15
              }} 
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => formatYAxis(value, 'economicCost')}
              label={{
                value: 'Economic Cost',
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
                  yAxisId={line.key === 'economicCost' ? 'right' : 'left'}
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