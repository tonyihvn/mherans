

/**
 * Featured Indicators Panel
 * Displays all featured indicators as stat cards on the facility dashboard
 */

import React, { useMemo } from 'react';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import { indicatorCalculator } from '../services/indicatorCalculator';
import { AuditData } from '../services/auditSchema';
import { getIndicatorDisplayName } from '../utils/indicatorFormatting';
import { TrendingUp, TrendingDown, Zap, Activity, AlertCircle } from 'lucide-react';

interface FeaturedIndicatorsPanelProps {
  auditData: Partial<AuditData> | null;
}

const FeaturedIndicatorsPanel: React.FC<FeaturedIndicatorsPanelProps> = ({ auditData }) => {
  // Get all formulas and filter for featured ones
  const featuredIndicators = useMemo(() => {
    const formulas = indicatorCalculator.getAllFormulas();
    return formulas.filter(f => f.featured);
  }, []);

  // Calculate all indicators from audit data
  const calculatedIndicators = useMemo(() => {
    if (!auditData) return {};

    // Use the audit indicator calculator to get all computed indicators
    const indicators = AuditIndicatorCalculator.calculateAllIndicators(auditData);

    // Also get the formula-based indicators
    const formulaResults: { [key: string]: any } = {};
    featuredIndicators.forEach(formula => {
      formulaResults[formula.indicatorId] = indicatorCalculator.calculateIndicator(formula.indicatorId, auditData);
    });

    return { ...indicators, ...formulaResults };
  }, [auditData, featuredIndicators]);

  const getIndicatorColor = (band: string) => {
    switch (band) {
      case 'high':
        return 'from-green-50 to-green-100 border-green-200';
      case 'medium':
        return 'from-amber-50 to-amber-100 border-amber-200';
      case 'low':
        return 'from-red-50 to-red-100 border-red-200';
      default:
        return 'from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const getBandBgColor = (band: string) => {
    switch (band) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (!auditData || featuredIndicators.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Featured Indicators</h3>
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <AlertCircle className="w-5 h-5 text-slate-400" />
          <p className="text-slate-600">No audit data available. Complete an audit to see indicators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Featured Indicators</h3>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {featuredIndicators.map((formula) => {
          const value = calculatedIndicators[formula.indicatorId];
          let band = 'unknown';

          if (value !== null && value !== undefined) {
            if (value >= formula.bandingRules.high.min && value <= formula.bandingRules.high.max) {
              band = 'high';
            } else if (value >= formula.bandingRules.medium.min && value <= formula.bandingRules.medium.max) {
              band = 'medium';
            } else if (value >= formula.bandingRules.low.min && value <= formula.bandingRules.low.max) {
              band = 'low';
            }
          }

          return (
            <div
              key={formula.indicatorId}
              className={`rounded-lg border-2 p-4 bg-gradient-to-br ${getIndicatorColor(band)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {formula.iconClass && (
                      <i className={`fa-solid ${formula.iconClass} text-lg`}></i>
                    )}
                    <p className="text-sm font-semibold text-slate-700">{formula.indicatorName}</p>
                  </div>
                  {formula.description && (
                    <p className="text-xs text-slate-600 mt-1">{formula.description}</p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getBandBgColor(band)}`}>
                  {band.toUpperCase()}
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                {value !== null && value !== undefined ? (
                  <>
                    <span className="text-2xl font-bold text-slate-900">
                      {typeof value === 'number' ? value.toFixed(1) : value}
                    </span>
                    <span className="text-sm font-medium text-slate-600">{formula.unit}</span>
                  </>
                ) : (
                  <span className="text-lg text-slate-500 italic">No data</span>
                )}
              </div>

              {formula.helperText && (
                <p className="text-xs text-slate-600 mt-2">{formula.helperText}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedIndicatorsPanel;
