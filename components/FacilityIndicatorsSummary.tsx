/**
 * Facility Indicators Summary Page
 * Shows latest audit data and all audit history for a facility
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import { Eye, ChevronDown, ChevronUp, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

interface FacilityIndicatorsSummaryProps {
  facilityId?: string;
}

const FacilityIndicatorsSummary: React.FC<FacilityIndicatorsSummaryProps> = ({ facilityId: propFacilityId }) => {
  const { facilities, audits } = useAppState();
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [viewingAuditId, setViewingAuditId] = useState<string | null>(null);

  // Get facility
  const facility = useMemo(() => {
    return facilities.find(f => f.hfr_id === propFacilityId || f.id === propFacilityId);
  }, [facilities, propFacilityId]);

  // Get all audits for this facility, sorted by date
  const facilityAudits = useMemo(() => {
    if (!facility) return [];
    const fAudits = (audits || []).filter(a => a.facility_id === facility.hfr_id || a.facility_id === facility.id);
    return fAudits.sort((a, b) =>
      new Date(b.createdAt || b.created_at || 0).getTime() -
      new Date(a.createdAt || a.created_at || 0).getTime()
    );
  }, [facility, audits]);

  // Get latest audit
  const latestAudit = useMemo(() => {
    return facilityAudits.length > 0 ? facilityAudits[0] : null;
  }, [facilityAudits]);

  // Calculate indicators for latest audit
  const latestIndicators = useMemo(() => {
    return latestAudit ? AuditIndicatorCalculator.calculateAllIndicators(latestAudit as any) : null;
  }, [latestAudit]);

  // Get currently viewing audit data
  const viewingAudit = useMemo(() => {
    if (!viewingAuditId) return null;
    return facilityAudits.find(a => a.id === viewingAuditId);
  }, [facilityAudits, viewingAuditId]);

  // Calculate indicators for viewing audit
  const viewingIndicators = useMemo(() => {
    return viewingAudit ? AuditIndicatorCalculator.calculateAllIndicators(viewingAudit as any) : null;
  }, [viewingAudit]);

  if (!facility) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Facility Not Found</h2>
          <p className="text-slate-600 mt-2">The facility you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{facility.name}</h1>
          <p className="text-slate-600 mt-1">
            ID: {facility.hfr_id} | {facility.state} | {facility.level}
          </p>
        </div>

        {/* Latest Audit Indicators */}
        {latestAudit && latestIndicators && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-[#057A55]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#057A55]" />
              <h2 className="text-2xl font-bold text-slate-900">Latest Audit Summary</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Audit Date: {new Date(latestAudit.createdAt || latestAudit.created_at || 0).toLocaleDateString()}
            </p>

            {/* Key Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Energy Resilience Score */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-slate-700 font-semibold">Energy Resilience Score</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {latestIndicators.energyResilienceScore?.toFixed(1) || 'N/A'}%
                </p>
              </div>

              {/* GHG Emissions */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-slate-700 font-semibold">Annual GHG Emissions</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {latestIndicators.totalGHGEmissions?.toFixed(1) || 'N/A'} tCO₂e
                </p>
              </div>

              {/* Grid Uptime */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-slate-700 font-semibold">Avg Grid Uptime</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {latestIndicators.avgGridUptime?.toFixed(1) || 'N/A'} hrs/day
                </p>
              </div>

              {/* O&M Score */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-slate-700 font-semibold">O&M Readiness Score</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {latestIndicators.omReadinessScore?.toFixed(1) || 'N/A'}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* All Audits History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900">Audit History</h2>
          </div>

          {facilityAudits.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No audits available for this facility yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {facilityAudits.map((audit, index) => {
                const auditIndicators = AuditIndicatorCalculator.calculateAllIndicators(audit as any);
                const isExpanded = expandedAuditId === audit.id;
                const isViewing = viewingAuditId === audit.id;

                return (
                  <div
                    key={audit.id}
                    className={`border rounded-lg transition-all ${
                      isViewing
                        ? 'border-[#057A55] bg-green-50'
                        : isExpanded
                        ? 'border-slate-300 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Audit Row */}
                    <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedAuditId(isExpanded ? null : audit.id)}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              Audit #{index + 1}
                              {isViewing && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Currently Viewing</span>}
                            </p>
                            <p className="text-sm text-slate-600">
                              {new Date(audit.createdAt || audit.created_at || 0).toLocaleDateString()} at {
                                new Date(audit.createdAt || audit.created_at || 0).toLocaleTimeString()
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Summary Indicators */}
                      <div className="flex items-center gap-4 mr-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-600">Resilience</p>
                          <p className="font-bold text-blue-600">{auditIndicators.energyResilienceScore?.toFixed(1) || 'N/A'}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-600">GHG</p>
                          <p className="font-bold text-green-600">{auditIndicators.totalGHGEmissions?.toFixed(1) || 'N/A'} t</p>
                        </div>
                      </div>

                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 p-4 bg-white">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-600">Energy Resilience</p>
                            <p className="font-bold text-lg text-blue-600">
                              {auditIndicators.energyResilienceScore?.toFixed(1) || 'N/A'}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">GHG Emissions</p>
                            <p className="font-bold text-lg text-green-600">
                              {auditIndicators.totalGHGEmissions?.toFixed(1) || 'N/A'} tCO₂e
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Grid Uptime</p>
                            <p className="font-bold text-lg text-yellow-600">
                              {auditIndicators.avgGridUptime?.toFixed(1) || 'N/A'} hrs
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">O&M Readiness</p>
                            <p className="font-bold text-lg text-purple-600">
                              {auditIndicators.omReadinessScore?.toFixed(1) || 'N/A'}%
                            </p>
                          </div>
                        </div>

                        {/* View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingAuditId(isViewing ? null : audit.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {isViewing ? 'Hide Full Audit Data' : 'View Full Audit Data'}
                        </button>

                        {/* Full Audit Data Preview */}
                        {isViewing && viewingIndicators && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-bold text-slate-900 mb-3">Full Audit Indicators</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {Object.entries(viewingIndicators)
                                .filter(([key]) => !key.startsWith('_') && typeof viewingIndicators[key as keyof typeof viewingIndicators] === 'number')
                                .map(([key, value]) => (
                                  <div key={key} className="bg-white p-3 rounded border border-green-100">
                                    <p className="text-xs text-slate-600 font-semibold truncate">{key}</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                      {typeof value === 'number' ? value.toFixed(2) : 'N/A'}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityIndicatorsSummary;
