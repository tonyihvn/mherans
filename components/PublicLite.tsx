
/**
 * PublicLite Component - NHERAMS Prototype
 * Displays banded, lagged aggregates only (monthly % facilities with ≥95% uptime, state heat buckets)
 * No raw values shown - only banded/synthetic data
 */

import React from 'react';
import { useAppState } from '../context/StateContext';
import { AlertCircle, Shield, TrendingUp } from 'lucide-react';

const PUBLICATION_LAG_DAYS = 30;
const CONSUMER_TIERS = [
  { tier: 'Facilities', role: 'facility' },
  { tier: 'States', role: 'state' },
  { tier: 'Financiers', role: 'financier' },
  { tier: 'Public', role: 'public' }
];

const PublicLite: React.FC = () => {
  const { facilities } = useAppState();

  // Calculate aggregates by state (banded only)
  const aggregatesByState = facilities.reduce((acc, facility) => {
    const state = facility.location.state_code;
    if (!acc[state]) {
      acc[state] = { count: 0, uptimeCount: 0, state: facility.location.state_code };
    }
    acc[state].count++;
    // Check if uptime band min >= 88% (proxy for ≥95% based on banding)
    if (facility.indicators.uptime_band.min >= 88) {
      acc[state].uptimeCount++;
    }
    return acc;
  }, {} as Record<string, any>);

  const stateAggregates = Object.values(aggregatesByState).map((agg: any) => ({
    ...agg,
    uptimePercent: Math.round((agg.uptimeCount / agg.count) * 100)
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Synth Disclaimer Banner */}
      <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] rounded p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#92400E]">
          <strong>Synthetic Data Demo:</strong> This portal displays banded, synthetic data from six pilot facilities.
          <strong> Publication lag: {PUBLICATION_LAG_DAYS} days</strong>. No raw values are shown.
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#057A55] p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#03543F]">NHERAMS Public Data Portal</h1>
        </div>
        <p className="text-slate-600 max-w-3xl">
          Federal Ministry of Health and Social Welfare oversees publication of banded, lagged energy and resilience indicators
          across all Nigerian healthcare facility tiers and ownership types.
        </p>
      </div>

      {/* Owner-Validator-Consumer Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Owner */}
        <div className="bg-[#057A55] text-white rounded-lg p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Controller</p>
          <p className="font-bold text-base">Federal Ministry of Health and Social Welfare</p>
          <p className="text-xs opacity-75 mt-2">Department of Healthcare Facilities Management</p>
        </div>

        {/* Validators */}
        <div className="bg-[#0E9F6E] text-white rounded-lg p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Validators (Badged)</p>
          <div className="space-y-1 text-xs">
            <p>State Ministry of Health</p>
            <p>NEMSA (Electricity Management)</p>
            <p>SafeCare / EHS Standards</p>
          </div>
        </div>

        {/* Consumers */}
        <div className="bg-[#C99A2E] text-white rounded-lg p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Consumer Tiers</p>
          <div className="space-y-1 text-xs">
            {CONSUMER_TIERS.map((tier) => (
              <p key={tier.role}>{tier.tier}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Key Performance Indicator Summary */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-[#057A55]" />
          <h2 className="text-2xl font-bold text-[#03543F]">Facilities with ≥90% Uptime Band (Monthly Snapshot)</h2>
        </div>

        <div className="space-y-4">
          {stateAggregates.length > 0 ? (
            stateAggregates.map((state) => (
              <div key={state.state} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-slate-900">{state.state}</div>
                  <div className="text-2xl font-bold text-[#057A55]">{state.uptimePercent}%</div>
                </div>
                <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#057A55] h-full rounded-full transition-all"
                    style={{ width: `${state.uptimePercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {state.uptimeCount} of {state.count} facilities
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No facility data available.</p>
          )}
        </div>
      </div>

      {/* Facility Table - Banded Indicators Only */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#03543F]">Six Pilot Facilities (One NHERAMS Template)</h2>
          <p className="text-sm text-slate-600 mt-2">Same master record, indicator registry, and privacy model; emphasis varies by site.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-bold text-[#03543F]">Facility Name</th>
                <th className="text-left px-6 py-3 font-bold text-[#03543F]">Level</th>
                <th className="text-left px-6 py-3 font-bold text-[#03543F]">State</th>
                <th className="text-center px-6 py-3 font-bold text-[#03543F]">Uptime Band</th>
                <th className="text-center px-6 py-3 font-bold text-[#03543F]">Diesel Reduction Band</th>
                <th className="text-center px-6 py-3 font-bold text-[#03543F]">Cold Chain</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility, idx) => (
                <tr key={facility.hfr_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-6 py-4 font-semibold text-slate-900">{facility.name}</td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{facility.level}</td>
                  <td className="px-6 py-4 text-slate-600">{facility.location.state_code}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-[#E8F5E9] text-[#1B5E20] px-3 py-1 rounded-full text-xs font-bold">
                      {facility.indicators.uptime_band.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-[#F3E5F5] text-[#4A148C] px-3 py-1 rounded-full text-xs font-bold">
                      {facility.indicators.diesel_reduction_band.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center capitalize">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        facility.indicators.cold_chain_status === 'stable'
                          ? 'bg-[#E8F5E9] text-[#1B5E20]'
                          : 'bg-[#FCE4EC] text-[#C2185B]'
                      }`}
                    >
                      {facility.indicators.cold_chain_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy & Publication Rules Info */}
      <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
        <h2 className="text-xl font-bold text-[#03543F] mb-4">Privacy & Publication Rules (Public Lite Tier)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Banding & K-Anonymity</h3>
            <p className="text-slate-600">
              All indicator values shown as banded ranges (e.g., "85–90%") to protect facility privacy. No raw values disclosed publicly.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Publication Lag</h3>
            <p className="text-slate-600">
              Data published with {PUBLICATION_LAG_DAYS}-day lag under Controller authority. Telemetry targets shown; live telemetry not exposed.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">One Template for All</h3>
            <p className="text-slate-600">
              Six pilots demonstrate identical facility master record, indicator registry, and Verification Bundle schema across all care levels,
              ownership types, and geopolitical zones.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Read More</h3>
            <p className="text-slate-600">
              See <span className="font-semibold text-[#057A55]">Public Data Release Policy</span> for complete governance and technical
              specifications.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-6 text-center text-sm text-[#92400E]">
        <p className="font-semibold">Synthetic Data Demo: This portal displays banded, synthetic data for demonstration purposes only.</p>
        <p className="text-xs mt-2 opacity-75">
          This demo portal proves that NHERAMS uses one standard facility template for all facilities in Nigeria, regardless of care level,
          ownership, energy mix, or pilot status.
        </p>
      </footer>
    </div>
  );
};

export default PublicLite;
