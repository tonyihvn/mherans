

/**
 * Facility Dashboard Page
 * Comprehensive dashboard showing facility audit data and trends
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import { IndicatorDetailsProvider } from '../services/indicatorDetailsProvider';
import { TrendingUp, BarChart3, LineChart, PieChart, Settings, X, Plus, AlertCircle, Edit2, Eye, Trash2, Info, ChevronDown } from 'lucide-react';
import FeaturedIndicatorsPanel from './FeaturedIndicatorsPanel';
import IndicatorDetailsModal, { IndicatorInfo } from './IndicatorDetailsModal';

interface FacilityDashboardPageProps {
  facilityId?: string;
  onClose?: () => void;
}

interface TrendField {
  id: string;
  name: string;
  chartType: 'line' | 'bar' | 'area';
}

const FacilityDashboardPage: React.FC<FacilityDashboardPageProps> = ({ facilityId, onClose }) => {
  const navigate = useNavigate();
  const { facilities, audits } = useAppState();
  const [selectedTrendFields, setSelectedTrendFields] = useState<TrendField[]>([]);
  const [showTrendSelector, setShowTrendSelector] = useState(false);
  const [availableFields, setAvailableFields] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get facility
  const facility = useMemo(() => {
    return facilities.find(f => f.hfr_id === facilityId || f.id === facilityId);
  }, [facilities, facilityId]);

  // Get all audits sorted by date
  const facilityAudits = useMemo(() => {
    if (!facility) return [];

    // Use audits from context (includes all audits for the facility)
    const fAudits = (audits || []).filter(a => {
      const auditFacilityId = a.facility_id || a.facilityId;
      return (
        auditFacilityId === facility.hfr_id ||
        auditFacilityId === facility.id ||
        facility.hfr_id === auditFacilityId ||
        facility.id === auditFacilityId
      );
    });
    return fAudits.sort((a, b) =>
      new Date(b.createdAt || b.created_at || 0).getTime() -
      new Date(a.createdAt || a.created_at || 0).getTime()
    );
  }, [facility, audits]);

  // Get latest audit and indicators
  const latestAudit = useMemo(() => {
    return facilityAudits.length > 0 ? facilityAudits[0] : null;
  }, [facilityAudits]);

  const latestIndicators = useMemo(() => {
    return latestAudit ? AuditIndicatorCalculator.calculateAllIndicators(latestAudit as any) : null;
  }, [latestAudit]);

  // Calculate available fields for trends
  useMemo(() => {
    if (!latestIndicators) return;
    const fields = Object.entries(latestIndicators)
      .filter(([key, value]) => !key.startsWith('_') && typeof value === 'number')
      .map(([key, value]) => ({
        id: key,
        name: key.replace(/([A-Z])/g, ' $1').trim()
      }));
    setAvailableFields(fields);
  }, [latestIndicators]);

  // Prepare trend data for charts
  const trendData = useMemo(() => {
    const data: { [key: string]: any[] } = {};

    selectedTrendFields.forEach(field => {
      data[field.id] = facilityAudits.map(audit => {
        const indicators = AuditIndicatorCalculator.calculateAllIndicators(audit as any);
        return {
          date: new Date(audit.createdAt || audit.created_at || 0).toLocaleDateString(),
          value: indicators[field.id as keyof typeof indicators] || 0,
          fullDate: new Date(audit.createdAt || audit.created_at || 0)
        };
      });
    });

    return data;
  }, [selectedTrendFields, facilityAudits]);

  // Handler to show indicator details
  const handleIndicatorClick = (indicatorKey: string, indicatorValue: any) => {
    if (!latestAudit) return;
    const details = IndicatorDetailsProvider.getIndicatorDetails(
      indicatorKey,
      indicatorValue,
      latestAudit as any,
      false
    );
    setSelectedIndicator(details);
    setIsModalOpen(true);
  };

  if (!facility) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Facility Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{facility.name}</h1>
            <p className="text-slate-600 mt-2">
              {facility.state} | {facility.level} | ID: {facility.hfr_id}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          )}
        </div>

        {/* Featured Indicators Panel */}
        {latestAudit && (
          <div className="mb-6">
            <FeaturedIndicatorsPanel auditData={latestAudit as any} />
          </div>
        )}

        {/* Latest Audit Summary Cards */}
        {latestAudit && latestIndicators && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-[#057A55]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Latest Audit Summary</h2>
                <p className="text-sm text-slate-600">
                  {new Date(latestAudit.createdAt || latestAudit.created_at || 0).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Energy Resilience Score */}
              <button
                onClick={() => handleIndicatorClick('energyResilienceScore', latestIndicators.energyResilienceScore)}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-lg hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-semibold">Energy Resilience</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2 capitalize">
                      {latestIndicators.energyResilienceScore || 'N/A'}
                    </p>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${latestIndicators.energyResilienceScore === 'high' ? 100 : latestIndicators.energyResilienceScore === 'medium' ? 60 : 30}%` }}
                      />
                    </div>
                  </div>
                  <Info className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </button>

              {/* GHG Emissions */}
              <button
                onClick={() => handleIndicatorClick('totalAnnualGHGEmissionsTonnesCO2', latestIndicators.totalAnnualGHGEmissionsTonnesCO2)}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-lg hover:border-green-300 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-semibold">Annual GHG</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {typeof latestIndicators.totalAnnualGHGEmissionsTonnesCO2 === 'number' ? latestIndicators.totalAnnualGHGEmissionsTonnesCO2?.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">tCO₂e per year</p>
                  </div>
                  <Info className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </button>

              {/* Grid Uptime */}
              <button
                onClick={() => handleIndicatorClick('gridUptimeHoursPerDay', latestIndicators.gridUptimeHoursPerDay)}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 hover:shadow-lg hover:border-yellow-300 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-semibold">Grid Uptime</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                      {typeof latestIndicators.gridUptimeHoursPerDay === 'number' ? latestIndicators.gridUptimeHoursPerDay?.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">hours/day</p>
                  </div>
                  <Info className="w-4 h-4 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </button>

              {/* O&M Readiness */}
              <button
                onClick={() => handleIndicatorClick('omReadinessScore', latestIndicators.omReadinessScore)}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-semibold">O&M Readiness</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {typeof latestIndicators.omReadinessScore === 'number' ? latestIndicators.omReadinessScore?.toFixed(1) : 'N/A'}%
                    </p>
                    <div className="mt-2 bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, typeof latestIndicators.omReadinessScore === 'number' ? latestIndicators.omReadinessScore || 0 : 0)}%` }}
                      />
                    </div>
                  </div>
                  <Info className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </button>
            </div>

          </div>
        )}

        {/* No Audit Data Message */}
        {!latestAudit && !loading && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-amber-900">No Audit Data Available</h3>
                <p className="text-sm text-amber-700 mt-1">
                  There are no completed audits for this facility yet. Create an audit to see performance indicators and trends.
                </p>
                <p className="text-xs text-amber-600 mt-2 font-mono">
                  Facility ID: {facilityId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trend Analysis Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              <h2 className="text-2xl font-bold text-slate-900">Trend Analysis</h2>
              <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {facilityAudits.length} audits
              </span>
            </div>
            <button
              onClick={() => setShowTrendSelector(!showTrendSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] transition-colors"
            >
              <Settings className="w-4 h-4" />
              {selectedTrendFields.length > 0 ? 'Manage' : 'Add'} Trends
            </button>
          </div>

          {/* Trend Selector - Collapsible */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 mb-6">
            <button
              onClick={() => setShowTrendSelector(!showTrendSelector)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors"
            >
              <h3 className="font-semibold text-slate-900">Select Fields to Track</h3>
              <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${showTrendSelector ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Content */}
            {showTrendSelector && (
              <div className="border-t border-slate-200 p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableFields.map(field => (
                    <label key={field.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTrendFields.some(f => f.id === field.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrendFields([...selectedTrendFields, { id: field.id, name: field.name, chartType: 'line' }]);
                          } else {
                            setSelectedTrendFields(selectedTrendFields.filter(f => f.id !== field.id));
                          }
                        }}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm text-slate-700">{field.name}</span>
                    </label>
                  ))}
                </div>

                {/* Chart Type Selector for Each Field */}
                {selectedTrendFields.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-300">
                    <h4 className="font-semibold text-slate-900 mb-3">Chart Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTrendFields.map(field => (
                        <div key={field.id} className="flex items-center gap-3 p-2 bg-white rounded border border-slate-200">
                          <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{field.name}</span>
                          <select
                            value={field.chartType}
                            onChange={(e) => {
                              setSelectedTrendFields(
                                selectedTrendFields.map(f =>
                                  f.id === field.id ? { ...f, chartType: e.target.value as 'line' | 'bar' | 'area' } : f
                                )
                              );
                            }}
                            className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#057A55]"
                          >
                            <option value="line">Line</option>
                            <option value="bar">Bar</option>
                            <option value="area">Area</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trend Charts */}
          {selectedTrendFields.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedTrendFields.map(field => (
                <div key={field.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    {field.chartType === 'line' && <LineChart className="w-5 h-5 text-blue-600" />}
                    {field.chartType === 'bar' && <BarChart3 className="w-5 h-5 text-green-600" />}
                    {field.chartType === 'area' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                    <h3 className="font-semibold text-slate-900">{field.name}</h3>
                  </div>

                  {/* Chart Visualization */}
                  <div className="h-40 relative mb-2">
                    {field.chartType === 'bar' && (
                      <div className="h-full flex items-end gap-1 px-2">
                        {trendData[field.id]?.map((point, idx) => {
                          const maxValue = Math.max(...(trendData[field.id]?.map(p => p.value) || [0]));
                          const minValue = Math.min(...(trendData[field.id]?.map(p => p.value) || [0]));
                          const range = maxValue - minValue || 1;
                          const height = ((point.value - minValue) / range) * 100 || 5;
                          return (
                            <div
                              key={idx}
                              className="flex-1 bg-green-500 hover:bg-green-600 rounded-t transition-all"
                              style={{ height: `${Math.max(5, height)}%` }}
                              title={`${point.date}: ${point.value.toFixed(2)}`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {field.chartType === 'line' && trendData[field.id]?.length > 0 && (
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points={trendData[field.id].map((point, idx) => {
                            const maxValue = Math.max(...(trendData[field.id]?.map(p => p.value) || [0]));
                            const minValue = Math.min(...(trendData[field.id]?.map(p => p.value) || [0]));
                            const range = maxValue - minValue || 1;
                            const y = 100 - (((point.value - minValue) / range) * 80 + 10);
                            const x = (idx / (trendData[field.id].length - 1)) * 100;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                        />
                        {trendData[field.id].map((point, idx) => {
                          const maxValue = Math.max(...(trendData[field.id]?.map(p => p.value) || [0]));
                          const minValue = Math.min(...(trendData[field.id]?.map(p => p.value) || [0]));
                          const range = maxValue - minValue || 1;
                          const y = 100 - (((point.value - minValue) / range) * 80 + 10);
                          const x = (idx / (trendData[field.id].length - 1)) * 100;
                          return (
                            <circle key={`dot-${idx}`} cx={x} cy={y} r="2" fill="#3b82f6" />
                          );
                        })}
                      </svg>
                    )}

                    {field.chartType === 'area' && trendData[field.id]?.length > 0 && (
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`grad-${field.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        <polygon
                          points={`0,100 ${trendData[field.id].map((point, idx) => {
                            const maxValue = Math.max(...(trendData[field.id]?.map(p => p.value) || [0]));
                            const minValue = Math.min(...(trendData[field.id]?.map(p => p.value) || [0]));
                            const range = maxValue - minValue || 1;
                            const y = 100 - (((point.value - minValue) / range) * 80 + 10);
                            const x = (idx / (trendData[field.id].length - 1)) * 100;
                            return `${x},${y}`;
                          }).join(' ')} 100,100`}
                          fill={`url(#grad-${field.id})`}
                          stroke="#9333ea"
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Value Range */}
                  <div className="text-xs text-slate-600 text-center">
                    {trendData[field.id]?.[0]?.date} → {trendData[field.id]?.[trendData[field.id].length - 1]?.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="font-medium">No trends selected</p>
              <p className="text-sm">Click "Add Trends" to select fields and visualize trends over time</p>
            </div>
          )}
        </div>

        {/* Indicator Details Modal */}
        <IndicatorDetailsModal
          indicator={selectedIndicator}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Audit History Table */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Audit History ({facilityAudits.length})</h2>

          {facilityAudits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No audits available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left py-3 px-4 font-bold text-slate-900">#</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Date</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">GHG Emissions</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Energy Resilience</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityAudits.map((audit, idx) => {
                    const auditDate = new Date(audit.createdAt || audit.created_at || 0);
                    const indicators = AuditIndicatorCalculator.calculateAllIndicators(audit as any);
                    const isLatest = idx === facilityAudits.length - 1;

                    return (
                      <tr
                        key={audit.id}
                        className={`border-b border-slate-200 ${isLatest ? 'bg-green-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">#{idx + 1}</td>
                        <td className="py-3 px-4 text-slate-700">{auditDate.toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            isLatest
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isLatest ? 'Latest' : 'Past'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {typeof indicators.totalAnnualGHGEmissionsTonnesCO2 === 'number'
                            ? `${indicators.totalAnnualGHGEmissionsTonnesCO2.toFixed(1)} tCO₂e`
                            : 'N/A'
                          }
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                            indicators.energyResilienceScore === 'high'
                              ? 'bg-green-100 text-green-800'
                              : indicators.energyResilienceScore === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {indicators.energyResilienceScore || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/audit-form/${facilityId}?auditId=${audit.id}&mode=view`)}
                              title="View Audit"
                              className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => navigate(`/audit-form/${facilityId}?auditId=${audit.id}&mode=edit`)}
                              title="Edit Audit"
                              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-amber-600" />
                            </button>
                            {!isLatest && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this audit? This action cannot be undone.')) {
                                    // TODO: Implement delete API call
                                    console.log('Delete audit:', audit.id);
                                  }
                                }}
                                title="Delete Audit"
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityDashboardPage;
