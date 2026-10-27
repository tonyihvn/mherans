/**
 * Facilities Audit Overview Component
 * Displays all facilities with their latest audit data and featured indicators
 */

import React, { useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import { getIndicatorDisplayName } from '../utils/indicatorFormatting';
import { TrendingUp, AlertCircle, Eye } from 'lucide-react';

interface FacilitiesAuditOverviewProps {
  onViewFacility?: (facilityId: string) => void;
  facilities?: any[];
}

const FacilitiesAuditOverview: React.FC<FacilitiesAuditOverviewProps> = ({
  onViewFacility,
  facilities: externalFacilities
}) => {
  const { facilities: contextFacilities, audits } = useAppState();
  const facilities = externalFacilities || contextFacilities;

  // Get latest audit for each facility
  const facilitiesWithAudits = useMemo(() => {
    return facilities.map(facility => {
      const facilityAudits = (audits || []).filter(a =>
        a.facility_id === facility.hfr_id ||
        a.facilityId === facility.hfr_id ||
        a.facility_id === facility.id ||
        a.facilityId === facility.id
      );

      if (facilityAudits.length === 0) {
        return {
          facility,
          latestAudit: null,
          indicators: null
        };
      }

      const latestAudit = facilityAudits.sort((a, b) =>
        new Date(b.createdAt || b.created_at || 0).getTime() -
        new Date(a.createdAt || a.created_at || 0).getTime()
      )[0];

      const indicators = AuditIndicatorCalculator.calculateAllIndicators(latestAudit as any);

      return {
        facility,
        latestAudit,
        indicators
      };
    }).filter(f => f.latestAudit !== null);
  }, [facilities, audits]);

  if (facilitiesWithAudits.length === 0) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">No Audit Data Available</h2>
          <p className="text-slate-600 mt-2">No facilities have completed audits yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-[#057A55]" />
            Facilities Audit Overview
          </h2>
          <p className="text-slate-600 mt-2">
            Latest audit data for {facilitiesWithAudits.length} facilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {facilitiesWithAudits.map(({ facility, latestAudit, indicators }) => (
            <div
              key={facility.id || facility.hfr_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div
                className="text-white p-6"
                style={{
                  background: 'linear-gradient(to right, #057A55, #045C41)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{facility.name}</h3>
                    <p className="text-green-100 text-sm mt-1">
                      {facility.state} | {facility.level}
                    </p>
                    <p className="text-green-100 text-xs mt-2 font-mono">
                      ID: {facility.hfr_id || facility.id}
                    </p>
                  </div>
                  {onViewFacility && (
                    <button
                      onClick={() => onViewFacility(facility.hfr_id || facility.id)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="View facility details"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Audit Date */}
              {latestAudit && (
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase">Latest Audit</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">
                    {new Date(latestAudit.createdAt || latestAudit.created_at || 0).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Key Indicators */}
              {indicators && (
                <div className="p-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase">Key Indicators</h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Energy Resilience */}
                    <div className="bg-blue-50 rounded p-3 border border-blue-200">
                      <p className="text-xs text-slate-600 font-semibold">Energy Resilience</p>
                      <p className="text-lg font-bold text-blue-600 mt-1 capitalize">
                        {String(indicators.energyResilienceScore || 'N/A')}
                      </p>
                    </div>

                    {/* Grid Uptime */}
                    <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
                      <p className="text-xs text-slate-600 font-semibold">Grid Uptime</p>
                      <p className="text-lg font-bold text-yellow-600 mt-1">
                        {typeof indicators.gridUptimeHoursPerDay === 'number'
                          ? indicators.gridUptimeHoursPerDay.toFixed(1)
                          : indicators.gridUptimeHoursPerDay || 'N/A'} hrs
                      </p>
                    </div>

                    {/* Total Load */}
                    <div className="bg-purple-50 rounded p-3 border border-purple-200">
                      <p className="text-xs text-slate-600 font-semibold">Total Load</p>
                      <p className="text-lg font-bold text-purple-600 mt-1">
                        {typeof indicators.totalElectricalLoadKW === 'number'
                          ? indicators.totalElectricalLoadKW.toFixed(1)
                          : indicators.totalElectricalLoadKW || 'N/A'} kW
                      </p>
                    </div>

                    {/* Annual GHG */}
                    <div className="bg-green-50 rounded p-3 border border-green-200">
                      <p className="text-xs text-slate-600 font-semibold">Annual GHG</p>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {typeof indicators.totalAnnualGHGEmissionsTonnesCO2 === 'number'
                          ? indicators.totalAnnualGHGEmissionsTonnesCO2.toFixed(1)
                          : indicators.totalAnnualGHGEmissionsTonnesCO2 || 'N/A'} tCO₂e
                      </p>
                    </div>
                  </div>

                  {/* O&M Readiness */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-600 font-semibold uppercase">O&M Readiness</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-[#057A55] h-2 rounded-full transition-all"
                          style={{
                            width: `${typeof indicators.omReadinessScore === 'number'
                              ? Math.min(100, indicators.omReadinessScore || 0)
                              : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {typeof indicators.omReadinessScore === 'number'
                          ? indicators.omReadinessScore.toFixed(0)
                          : indicators.omReadinessScore || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Other Metrics */}
                  <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                    <p>
                      <span className="font-semibold">Diesel Displacement:</span>{' '}
                      {typeof indicators.dieselDisplacementPercentage === 'number'
                        ? indicators.dieselDisplacementPercentage.toFixed(1)
                        : indicators.dieselDisplacementPercentage || 0}%
                    </p>
                    <p>
                      <span className="font-semibold">Renewable Energy:</span>{' '}
                      {typeof indicators.renewableEnergyPercentage === 'number'
                        ? indicators.renewableEnergyPercentage.toFixed(1)
                        : indicators.renewableEnergyPercentage || 0}%
                    </p>
                    <p>
                      <span className="font-semibold">Maintenance:</span> {String(indicators.maintenanceCompliance || 'N/A')}
                    </p>
                  </div>
                </div>
              )}

              {!indicators && (
                <div className="p-6 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">No indicator data available</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesAuditOverview;
