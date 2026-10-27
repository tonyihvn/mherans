

import React, { useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import { DonutChart, BarChart, StatCard, Legend } from './Charts';
import { Zap, Leaf, TrendingUp } from 'lucide-react';

interface DashboardSummaryProps {
  facilityId?: string;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ facilityId }) => {
  const { facilities, audits } = useAppState();

  // Filter facilities based on facilityId
  const filteredFacilities = useMemo(() => {
    if (!facilityId) return facilities;
    return facilities.filter(f => f.hfr_id === facilityId || f.id === facilityId);
  }, [facilities, facilityId]);

  // Build latest audit per facility
  const latestAudits = useMemo(() => {
    return filteredFacilities.map(f => {
      const fAudits = (audits || []).filter(a => a.facility_id === f.hfr_id);
      if (fAudits.length === 0) return null;
      return fAudits.sort((a, b) => new Date(b.updatedAt || b.updated_at || 0).getTime() - new Date(a.updatedAt || a.updated_at || 0).getTime())[0];
    }).filter(Boolean as any);
  }, [filteredFacilities, audits]);

  const indicatorsList = useMemo(() => {
    return (latestAudits || []).map(a => AuditIndicatorCalculator.calculateAllIndicators(a as any));
  }, [latestAudits]);

  const aggregates = useMemo(() => {
    const count = filteredFacilities.length || 0;
    if (count === 0) return {
      totalFacilities: 0,
      avgGridUptime: 0,
      totalGHG: 0,
      avgOMScore: 0,
      energyMix: { grid: 0, diesel: 0, renewable: 0 }
    };

    let gridKWh = 0;
    let dieselLitres = 0;
    let renewableKWh = 0;
    let ghg = 0;
    let omSum = 0;
    let have = 0;

    indicatorsList.forEach(ind => {
      gridKWh += ind.estimatedAnnualGridConsumptionKWh || 0;
      dieselLitres += ind.estimatedAnnualDieselConsumptionLitres || 0;
      renewableKWh += ind.solarGenerationAnnualKWh || 0;
      ghg += ind.totalAnnualGHGEmissionsTonnesCO2 || 0;
      omSum += ind.omReadinessScore || 0;
      have += 1;
    });

    const avgGridUptime = have ? (indicatorsList.reduce((s, i) => s + (i.gridUptimePercentage || 0), 0) / have) : 0;
    const avgOMScore = have ? omSum / have : 0;

    const gridEnergy = gridKWh;
    const dieselEnergyEquivalent = dieselLitres * 2.5; // rough conversion used elsewhere in app
    const renewableEnergy = renewableKWh;
    const totalEnergy = gridEnergy + dieselEnergyEquivalent + renewableEnergy || 1;

    return {
      totalFacilities: count,
      avgGridUptime,
      totalGHG: ghg,
      avgOMScore,
      energyMix: {
        grid: (gridEnergy / totalEnergy) * 100,
        diesel: (dieselEnergyEquivalent / totalEnergy) * 100,
        renewable: (renewableEnergy / totalEnergy) * 100
      }
    };
  }, [filteredFacilities.length, indicatorsList]);

  const donutData = [
    { label: 'Grid', value: isNaN(aggregates.energyMix.grid) ? 0 : Math.round(aggregates.energyMix.grid), color: '#057A55' },
    { label: 'Diesel', value: isNaN(aggregates.energyMix.diesel) ? 0 : Math.round(aggregates.energyMix.diesel), color: '#EA580C' },
    { label: 'Renewable', value: isNaN(aggregates.energyMix.renewable) ? 0 : Math.round(aggregates.energyMix.renewable), color: '#10B981' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#03543F]">Indicators Summary</h1>
            <p className="text-sm text-slate-600">Overview across {aggregates.totalFacilities} facilities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Avg. Grid Uptime" value={`${aggregates.avgGridUptime.toFixed(1)}%`} icon={<Zap />} />
          <StatCard title="Total GHG (tonnes)" value={`${aggregates.totalGHG.toFixed(1)}`} icon={<Leaf />} />
          <StatCard title="Avg O&M Score" value={`${aggregates.avgOMScore.toFixed(0)} / 100`} icon={<TrendingUp />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {latestAudits.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center text-slate-600">
                <p className="text-sm">No audit data available</p>
              </div>
            ) : (
              <DonutChart title="Energy Mix" data={donutData.map(d => ({ label: d.label, value: d.value, color: d.color }))} size={220} />
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BarChart
              title="Top Contributors - Estimated Annual GHG (tonnes)"
              data={(indicatorsList || []).slice(0,6).map((ind, idx) => ({
                label: `Site ${idx + 1}`,
                value: ind.totalAnnualGHGEmissionsTonnesCO2 || 0,
                color: ['#3B82F6','#EA580C','#10B981','#8B5CF6','#F59E0B','#EF4444'][idx % 6]
              }))}
              unit="tCO2"
            />

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
              <h3 className="text-lg font-bold mb-4">Quick Legend</h3>
              <Legend
                title="Summary Legend"
                items={[
                  { label: 'High Uptime (>85%)', color: '#10B981', status: 'good' },
                  { label: 'Moderate Uptime (60-85%)', color: '#F59E0B', status: 'warning' },
                  { label: 'Low Uptime (<60%)', color: '#EF4444', status: 'critical' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
