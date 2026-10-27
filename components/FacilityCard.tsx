

/**
 * FacilityCard Component - NHERAMS Prototype
 * Displays facility details in a card with: header, indicators, validators, evidence, bundle button
 */

import React, { useState } from 'react';
import { Facility, VerificationBundle } from '../types';
import IndicatorCard from './IndicatorCard';
import ValidatorChip from './ValidatorChip';
import EvidenceAccordion from './EvidenceAccordion';
import { MapPin, Zap, Droplet, Shield, AlertCircle } from 'lucide-react';

interface FacilityCardProps {
  facility: Facility;
  bundle?: VerificationBundle;
  onViewBundle?: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, bundle, onViewBundle }) => {
  const [showBundlePreview, setShowBundlePreview] = useState(false);

  const getOwnershipColor = (ownership: string) => {
    switch (ownership) {
      case 'federal':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'state':
        return 'bg-green-50 text-green-900 border-green-200';
      case 'faith_based':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'private':
        return 'bg-orange-50 text-orange-900 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#057A55] to-[#03543F] text-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">HFR ID</p>
            <p className="font-mono text-xs text-white/90">{facility.hfr_id}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getOwnershipColor(
              facility.ownership
            )}`}
          >
            {facility.ownership.replace(/_/g, ' ')}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3">{facility.name}</h2>
        <div className="flex items-center gap-6 text-sm opacity-90">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>
              {facility.location.state_code} • {facility.location.lga_name}
            </span>
          </div>
          <div className="capitalize">{facility.level}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Validator Badges */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Validators</h3>
          <div className="flex flex-wrap gap-2">
            {facility.validators.map((validator, idx) => (
              <ValidatorChip key={idx} validator={validator} />
            ))}
          </div>
        </div>

        {/* Key Indicators Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
            Indicators (Banded - Synthetic Data)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IndicatorCard
              title="Uptime"
              band={facility.indicators.uptime_band}
              icon={<Zap className="w-5 h-5" />}
              definition="Percentage of hours facility has grid or backup power supply available for critical loads."
              color="green"
            />

            <IndicatorCard
              title="Diesel Reduction"
              band={facility.indicators.diesel_reduction_band}
              icon={<AlertCircle className="w-5 h-5" />}
              definition="Estimated percentage reduction in diesel consumption vs baseline due to energy efficiency and renewable integration."
              color="purple"
            />

            <IndicatorCard
              title="MDR Hours"
              band={facility.indicators.mdr_hours_band}
              icon={<Shield className="w-5 h-5" />}
              definition="Mean time to restore (MTTR): estimated hours to restore critical service after outage."
              color="blue"
            />

            {facility.indicators.ppp_eaas_kpi.max > 0 && (
              <IndicatorCard
                title={facility.indicators.ppp_eaas_kpi.label}
                band={facility.indicators.ppp_eaas_kpi}
                icon={<Shield className="w-5 h-5" />}
                definition="PPP/EaaS performance KPI: uptime target for private facility energy service agreement."
                color="orange"
              />
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-semibold mb-1">Cold Chain Status</p>
            <p
              className={`text-sm font-bold capitalize ${
                facility.indicators.cold_chain_status === 'stable'
                  ? 'text-green-700'
                  : 'text-orange-700'
              }`}
            >
              {facility.indicators.cold_chain_status}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-semibold mb-1">Electrical Safety</p>
            <p
              className={`text-sm font-bold capitalize ${
                facility.indicators.electrical_safety_status === 'compliant'
                  ? 'text-green-700'
                  : 'text-orange-700'
              }`}
            >
              {facility.indicators.electrical_safety_status}
            </p>
          </div>
        </div>

        {/* Evidence Accordion */}
        <EvidenceAccordion evidence={facility.evidence} />

        {/* Publication Info */}
        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4 text-sm text-[#92400E]">
          <p className="font-semibold mb-1">Publication Details</p>
          <p className="text-xs opacity-75">
            Tier: <span className="font-bold capitalize">{facility.publication.tier}</span> • Lag:{' '}
            <span className="font-bold">{facility.publication.lag_days} days</span>
          </p>
          <p className="text-xs opacity-75 mt-1">
            Published: {facility.publication.published_at} (v{facility.publication.version})
          </p>
        </div>

        {/* Bundle Preview Button */}
        {bundle && (
          <div className="border-t border-slate-200 pt-6">
            <button
              onClick={() => {
                setShowBundlePreview(!showBundlePreview);
                onViewBundle?.();
              }}
              className="w-full py-3 px-4 bg-[#057A55] hover:bg-[#03543F] text-white font-bold rounded-lg transition-colors"
            >
              View Verification Bundle
            </button>

            {showBundlePreview && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bundle ID</p>
                  <p className="font-mono text-xs text-slate-900">{bundle.bundle_id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Tier</p>
                  <p className="text-sm font-bold text-slate-900 capitalize">{bundle.tier.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Period</p>
                  <p className="text-sm text-slate-900">
                    {bundle.period_start} to {bundle.period_end}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Targets Met</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {bundle.targets_met.uptime_95pct_streak ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-red-600 font-bold">✗</span>
                      )}
                      <span className="text-sm">≥95% uptime streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {bundle.targets_met.diesel_reduction_50pct ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-red-600 font-bold">✗</span>
                      )}
                      <span className="text-sm">≥50% diesel reduction</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityCard;
