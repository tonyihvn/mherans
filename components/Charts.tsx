

/**
 * Charts and Legends Components
 * Beautiful visualizations for dashboard indicators
 */

import React from 'react';
import { TrendingUp, BarChart3, PieChart, AlertCircle } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface BarChartProps {
  title: string;
  data: ChartData[];
  unit?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, unit = '', height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" style={{ height }}>
        <p className="text-slate-500 flex items-center justify-center h-full gap-2">
          <AlertCircle className="w-4 h-4" />
          No data available
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const scale = 100 / maxValue;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#057A55]" />
        {title}
      </h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <span className="text-sm font-bold text-slate-900">
                {item.value.toFixed(2)} {unit}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.value * scale}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PieChartProps {
  title: string;
  data: ChartData[];
  size?: number;
}

export const DonutChart: React.FC<PieChartProps> = ({ title, data, size = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <p className="text-slate-500 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          No data available
        </p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const radius = size / 2;
    const innerRadius = radius * 0.6;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${radius + innerRadius * Math.cos(startRad)} ${
      radius + innerRadius * Math.sin(startRad)
    } L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${
      radius + innerRadius * Math.cos(endRad)
    } ${radius + innerRadius * Math.sin(endRad)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${
      radius + innerRadius * Math.cos(startRad)
    } ${radius + innerRadius * Math.sin(startRad)}`;

    return { path, color: item.color, item, angle };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-[#057A55]" />
        {title}
      </h3>
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mb-6">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </svg>
        <div className="space-y-2 w-full">
          {data.map((item) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <span className="font-medium text-slate-900">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
}

interface LegendProps {
  title: string;
  items: LegendItem[];
  columns?: number;
}

export const Legend: React.FC<LegendProps> = ({ title, items, columns = 2 }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <div className={`grid grid-cols-${columns} gap-4`}>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span
              className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-slate-300"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 text-sm">
              <p className="font-medium text-slate-900">{item.label}</p>
              {item.value !== undefined && (
                <p className="text-xs text-slate-600">
                  {item.value} {item.unit || ''}
                </p>
              )}
            </div>
            {item.status && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                {item.status.toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  trend,
  color = '[#057A55]'
}) => {
  return (
    <div className={`bg-gradient-to-br from-${color} to-${color}/80 rounded-lg shadow-sm p-6 text-white`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold opacity-90">{title}</h3>
        {icon && <span className="opacity-75">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold">{value}</span>
        {unit && <span className="text-sm opacity-90">{unit}</span>}
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <TrendingUp
            className={`w-4 h-4 ${trend.direction === 'up' ? 'text-green-200' : 'text-red-200'}`}
            style={{
              transform: trend.direction === 'down' ? 'rotateZ(180deg)' : 'none'
            }}
          />
          <span className="opacity-90">
            {Math.abs(trend.value)}% {trend.direction === 'up' ? 'increase' : 'decrease'}
          </span>
        </div>
      )}
    </div>
  );
};

interface TimeSeriesChartProps {
  title: string;
  data: Array<{ date: string; value: number }>;
  height?: number;
}

export const LineChart: React.FC<TimeSeriesChartProps> = ({ title, data, height = 250 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" style={{ height }}>
        <p className="text-slate-500 flex items-center justify-center h-full gap-2">
          <AlertCircle className="w-4 h-4" />
          No data available
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 100;
    return `${x},${y}`;
  });

  const pathData = points.join(' ');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#057A55]" />
        {title}
      </h3>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height, width: '100%' }}>
        <polyline
          points={pathData}
          fill="none"
          stroke="#057A55"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - minValue) / range) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="#057A55"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="flex justify-between mt-4 text-xs text-slate-600">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};
