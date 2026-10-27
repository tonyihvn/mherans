/**
 * Indicator Charts Component
 * Displays charts and visualizations for selected indicators
 */

import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

interface Indicator {
  id: string;
  name: string;
  value: number;
  unit: string;
  category?: string;
  isFeatured?: boolean;
}

interface IndicatorChartsProps {
  indicators: Indicator[];
  title?: string;
  compact?: boolean;
  showOnly?: string[]; // IDs of indicators to show
}

const IndicatorCharts: React.FC<IndicatorChartsProps> = ({
  indicators,
  title = 'Key Indicators',
  compact = false,
  showOnly
}) => {
  // Filter to only featured/marked or specified indicators
  const displayIndicators = useMemo(() => {
    let filtered = indicators || [];

    if (showOnly && showOnly.length > 0) {
      filtered = filtered.filter(i => showOnly.includes(i.id));
    } else {
      // Show featured indicators by default
      filtered = filtered.filter(i => i.isFeatured);
    }

    return filtered.slice(0, compact ? 4 : 8);
  }, [indicators, showOnly, compact]);

  if (displayIndicators.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No indicators available</p>
      </div>
    );
  }

  // Calculate max value for scaling
  const maxValue = Math.max(...displayIndicators.map(i => i.value));
  const minValue = Math.min(...displayIndicators.map(i => i.value));
  const range = maxValue - minValue || 1;

  // Color mapping based on value
  const getColor = (value: number) => {
    const normalized = (value - minValue) / range;
    if (normalized > 0.7) return 'bg-green-500';
    if (normalized > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={compact ? '' : 'bg-white rounded-lg shadow p-6 mb-6'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
      )}

      {compact ? (
        // Compact grid view
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {displayIndicators.map(indicator => (
            <div
              key={indicator.id}
              className="bg-white rounded border border-slate-200 p-2 hover:shadow-md transition-shadow"
              title={`${indicator.name}: ${indicator.value.toFixed(2)} ${indicator.unit}`}
            >
              <p className="text-xs font-semibold text-slate-700 truncate">{indicator.name}</p>
              <div className="w-full bg-slate-100 rounded h-2 mt-1">
                <div
                  className={`h-full rounded ${getColor(indicator.value)} transition-all`}
                  style={{
                    width: `${Math.max(5, Math.min(100, ((indicator.value - minValue) / range) * 100))}%`
                  }}
                />
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {indicator.value.toFixed(1)} {indicator.unit}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Full grid view with bars
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayIndicators.map(indicator => (
            <div
              key={indicator.id}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
            >
              {/* Indicator Name */}
              <p className="text-sm font-semibold text-slate-700 mb-2 line-clamp-2">
                {indicator.name}
              </p>

              {/* Bar Chart */}
              <div className="flex items-end gap-1 h-32 mb-3">
                <div className="flex-1">
                  <div className="w-full bg-slate-300 rounded-t h-full flex flex-col justify-end">
                    <div
                      className={`w-full rounded-t ${getColor(indicator.value)} transition-all`}
                      style={{
                        height: `${Math.max(5, Math.min(100, ((indicator.value - minValue) / range) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Value Display */}
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {indicator.value.toFixed(1)}
                </p>
                <p className="text-xs text-slate-600 mt-1">{indicator.unit}</p>
              </div>

              {/* Category Badge */}
              {indicator.category && (
                <p className="text-xs text-slate-500 mt-2 text-center bg-slate-200 rounded px-2 py-1">
                  {indicator.category}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndicatorCharts;
