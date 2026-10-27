/**
 * Audit Seeding & Indicator Verification Page
 * Used for testing and verification of audit data and indicator calculations
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';

const AuditSeedingPage: React.FC = () => {
  const { facilities, audits } = useAppState();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);

  const handleSeedAudits = async () => {
    if (!selectedFacilityId) {
      setError('Please select a facility');
      return;
    }

    setSeeding(true);
    setError('');
    setSeedResult(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/audits/seed/${selectedFacilityId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to seed audits');
      }

      const result = await response.json();
      setSeedResult(result);
      console.log('Seeding result:', result);

      // Refresh indicators after seeding
      setTimeout(() => {
        verifyIndicators();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error seeding audits');
    } finally {
      setSeeding(false);
    }
  };

  const verifyIndicators = () => {
    if (!selectedFacilityId) return;

    // Get audits for the facility
    const facilityAudits = (audits || []).filter(a =>
      a.facility_id === selectedFacilityId || a.facilityId === selectedFacilityId
    );

    console.log('Facility audits:', facilityAudits.length);

    // Calculate indicators for each audit
    const indicatorsByAudit = facilityAudits.map((audit, idx) => {
      const indicators = AuditIndicatorCalculator.calculateAllIndicators(audit as any);
      return {
        auditIndex: idx + 1,
        date: new Date(audit.createdAt || audit.created_at).toLocaleDateString(),
        indicators
      };
    });

    setVerificationData({
      facilityId: selectedFacilityId,
      totalAudits: facilityAudits.length,
      auditsByIndicator: indicatorsByAudit
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Audit Seeding & Verification</h1>
          <p className="text-slate-600 mt-2">Create sample audits across Q1-Q4 2026 and verify indicator calculations</p>
        </div>

        {/* Seeding Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Seed Sample Audits</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Facility
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55]"
              >
                <option value="">-- Choose a facility --</option>
                {facilities.map(f => (
                  <option key={f.id || f.hfr_id} value={f.id || f.hfr_id}>
                    {f.name} ({f.id || f.hfr_id})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSeedAudits}
              disabled={seeding || !selectedFacilityId}
              className="w-full px-6 py-3 bg-[#057A55] text-white rounded-lg font-semibold hover:bg-[#045C41] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {seeding ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Seeding Audits...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Seed 8 Audits (Q1-Q4 2026)
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {seedResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 font-semibold">{seedResult.message}</p>
                  <div className="mt-2 text-sm text-green-600 space-y-1">
                    <p>✓ Total Audits Created: {seedResult.summary.total}</p>
                    <p>✓ Quarters Covered: {seedResult.summary.quarters}</p>
                    <p>✓ Audits per Quarter: {seedResult.summary.auditsPerQuarter}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Section */}
        {verificationData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Indicator Verification</h2>
              <button
                onClick={verifyIndicators}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Facility:</strong> {verificationData.facilityId}<br />
                <strong>Total Audits:</strong> {verificationData.totalAudits}
              </p>
            </div>

            {/* Indicators Summary */}
            <div className="space-y-6">
              {verificationData.auditsByIndicator.map((auditData: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-slate-900 mb-4">
                    Audit #{auditData.auditIndex} - {auditData.date}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Energy Resilience */}
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Energy Resilience</p>
                      <p className="text-lg font-bold text-blue-600 mt-1 capitalize">
                        {auditData.indicators.energyResilienceScore}
                      </p>
                    </div>

                    {/* Grid Uptime */}
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Grid Uptime</p>
                      <p className="text-lg font-bold text-yellow-600 mt-1">
                        {auditData.indicators.gridUptimeHoursPerDay?.toFixed(1)} hrs/day
                      </p>
                    </div>

                    {/* Total Load */}
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Total Load</p>
                      <p className="text-lg font-bold text-purple-600 mt-1">
                        {auditData.indicators.totalElectricalLoadKW?.toFixed(1)} kW
                      </p>
                    </div>

                    {/* Daily Consumption */}
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Daily Consumption</p>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {auditData.indicators.estimatedDailyConsumptionKWh?.toFixed(1)} kWh
                      </p>
                    </div>

                    {/* Annual GHG */}
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Annual GHG</p>
                      <p className="text-lg font-bold text-red-600 mt-1">
                        {auditData.indicators.totalAnnualGHGEmissionsTonnesCO2?.toFixed(1)} tCO₂e
                      </p>
                    </div>

                    {/* O&M Readiness */}
                    <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">O&M Score</p>
                      <p className="text-lg font-bold text-indigo-600 mt-1">
                        {auditData.indicators.omReadinessScore?.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Additional Indicators */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Additional Metrics</p>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p>• Diesel Displacement: {auditData.indicators.dieselDisplacementPercentage?.toFixed(1)}%</p>
                      <p>• Renewable Energy: {auditData.indicators.renewableEnergyPercentage?.toFixed(1)}%</p>
                      <p>• Maintenance Compliance: {auditData.indicators.maintenanceCompliance}</p>
                      <p>• EHS Compliance: {auditData.indicators.ehsComplianceStatus}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
          <p className="text-sm text-slate-700">
            <strong>How to use:</strong> Select a facility and click "Seed 8 Audits" to create sample audit data across all 4 quarters of 2026 (2 audits per quarter).
            The system will automatically calculate and display indicators from the seeded audits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditSeedingPage;
