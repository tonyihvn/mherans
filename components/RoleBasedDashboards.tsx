/**
 * Role-Based Dashboard System
 * Different views for: Federal Admin, State Admin, Facility Manager, Guest/Public
 * All dashboards render audit-derived data
 */

import React from 'react';
import { AuditData } from '../services/auditSchema';
import { ComputedIndicators } from '../services/auditIndicatorCalculator';
import { TrendingUp, AlertCircle, CheckCircle, Zap, Leaf, Shield, Users, BarChart3, Calendar } from 'lucide-react';
import { BarChart, DonutChart, LineChart, Legend, StatCard } from './Charts';

export interface DashboardProps {
  userRole: 'federal_admin' | 'state_admin' | 'facility_admin' | 'guest';
  auditData: Partial<AuditData>;
  indicators: ComputedIndicators;
  facilityName: string;
  lastUpdated?: string;
}

// ============================================================================
// FEDERAL ADMIN DASHBOARD
// ============================================================================

export const FederalAdminDashboard: React.FC<DashboardProps> = ({
  auditData,
  indicators,
  facilityName,
  lastUpdated
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#03543F] mb-2">{facilityName}</h1>
          <p className="text-slate-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Date unavailable'}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Zap className="w-6 h-6" />}
            label="Grid Uptime"
            value={`${indicators.gridUptimePercentage.toFixed(1)}%`}
            band={indicators.gridAvailabilityBand.label}
            color="blue"
          />
          <MetricCard
            icon={<Leaf className="w-6 h-6" />}
            label="Annual GHG Emissions"
            value={`${indicators.totalAnnualGHGEmissionsTonnesCO2.toFixed(1)}`}
            unit="tonnes CO2"
            color="green"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Diesel Displacement"
            value={`${indicators.dieselDisplacementPercentage.toFixed(1)}%`}
            unit="of energy"
            color="purple"
          />
          <MetricCard
            icon={<Shield className="w-6 h-6" />}
            label="O&M Readiness"
            value={`${indicators.omReadinessScore}`}
            unit="/ 100"
            color="amber"
          />
        </div>

        {/* Charts & Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Energy Distribution Chart */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#057A55]" />
              Energy Mix
            </h3>
            <DonutChart 
              data={[
                {
                  label: 'Grid',
                  value: Math.round(indicators.estimatedAnnualGridConsumptionKWh / (indicators.estimatedAnnualGridConsumptionKWh + indicators.estimatedAnnualDieselConsumptionLitres * 2.5) * 100),
                  percentage: Math.round(indicators.estimatedAnnualGridConsumptionKWh / (indicators.estimatedAnnualGridConsumptionKWh + indicators.estimatedAnnualDieselConsumptionLitres * 2.5) * 100),
                  color: '#057A55'
                },
                {
                  label: 'Diesel',
                  value: Math.round(indicators.estimatedAnnualDieselConsumptionLitres * 2.5 / (indicators.estimatedAnnualGridConsumptionKWh + indicators.estimatedAnnualDieselConsumptionLitres * 2.5) * 100),
                  percentage: Math.round(indicators.estimatedAnnualDieselConsumptionLitres * 2.5 / (indicators.estimatedAnnualGridConsumptionKWh + indicators.estimatedAnnualDieselConsumptionLitres * 2.5) * 100),
                  color: '#EA580C'
                },
                {
                  label: 'Renewable',
                  value: Math.round(indicators.renewableEnergyPercentage),
                  percentage: Math.round(indicators.renewableEnergyPercentage),
                  color: '#10B981'
                }
              ]}
            />
          </div>

          {/* Emissions Breakdown */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              Emissions Breakdown
            </h3>
            <BarChart
              title="Annual GHG Emissions"
              data={[
                {
                  label: 'Grid GHG',
                  value: indicators.gridAnnualEmissionsTonnesCO2,
                  color: '#3B82F6',
                  percentage: (indicators.gridAnnualEmissionsTonnesCO2 / indicators.totalAnnualGHGEmissionsTonnesCO2) * 100
                },
                {
                  label: 'Diesel GHG',
                  value: indicators.dieselAnnualEmissionsTonnesCO2,
                  color: '#EA580C',
                  percentage: (indicators.dieselAnnualEmissionsTonnesCO2 / indicators.totalAnnualGHGEmissionsTonnesCO2) * 100
                }
              ]}
              unit="tonnes CO2"
            />
          </div>

          {/* Performance Metrics */}
          <div className="lg:col-span-1 space-y-4">
            <StatCard
              title="Grid Uptime"
              value={`${indicators.gridUptimePercentage.toFixed(1)}%`}
              trend={{
                value: Math.round(indicators.gridUptimePercentage),
                direction: indicators.gridUptimePercentage > 80 ? 'up' : 'down'
              }}
            />
            <StatCard
              title="Total GHG Emissions"
              value={`${indicators.totalAnnualGHGEmissionsTonnesCO2.toFixed(1)}`}
              trend={{
                value: Math.round(indicators.dieselDisplacementPercentage),
                direction: 'down'
              }}
            />
            <StatCard
              title="Renewable Energy"
              value={`${indicators.renewableEnergyPercentage.toFixed(1)}%`}
              trend={{
                value: Math.round(indicators.renewableEnergyPercentage),
                direction: 'up'
              }}
            />
          </div>
        </div>

        {/* Summary Legend */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Indicator Summary</h3>
          <Legend 
            items={[
              { label: 'Grid Connected', color: '#3B82F6', status: auditData.gridConnected ? 'good' : 'warning' },
              { label: 'High Uptime', color: '#10B981', status: indicators.gridUptimePercentage > 80 ? 'good' : 'warning' },
              { label: 'Renewable Generated', color: '#06B6D4', status: indicators.renewableEnergyPercentage > 30 ? 'good' : 'warning' },
              { label: 'O&M Ready', color: '#F59E0B', status: indicators.omReadinessScore > 70 ? 'good' : 'warning' }
            ]}
          />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Energy Profile */}
          <Section title="🔋 Energy Profile" icon={<Zap className="w-5 h-5" />}>
            <div className="space-y-4">
              <InfoRow label="Grid Connected" value={auditData.gridConnected ? 'Yes' : 'No'} />
              <InfoRow label="Grid Uptime (hrs/day)" value={`${auditData.gridUptimeHoursPerDay} / 24`} />
              <InfoRow label="Total Electrical Load" value={`${indicators.totalElectricalLoadKW.toFixed(1)} kW`} />
              <InfoRow label="Annual Grid Usage" value={`${indicators.estimatedAnnualGridConsumptionKWh.toLocaleString()} kWh`} />
              <InfoRow label="Annual Diesel Usage" value={`${indicators.estimatedAnnualDieselConsumptionLitres.toLocaleString()} L`} />
              <InfoRow label="Solar Generation" value={`${indicators.solarGenerationAnnualKWh.toLocaleString()} kWh`} />
              <InfoRow label="Renewable Energy" value={`${indicators.renewableEnergyPercentage.toFixed(1)}%`} />
              <InfoRow label="Energy Resilience" value={auditData.energyResilienceScore?.toUpperCase() || 'Unknown'} />
            </div>
          </Section>

          {/* GHG Emissions */}
          <Section title="💨 GHG Emissions & Carbon" icon={<Leaf className="w-5 h-5" />}>
            <div className="space-y-4">
              <InfoRow label="Diesel Emissions" value={`${indicators.dieselAnnualEmissionsTonnesCO2.toFixed(2)} tonnes CO2`} />
              <InfoRow label="Grid Emissions" value={`${indicators.gridAnnualEmissionsTonnesCO2.toFixed(2)} tonnes CO2`} />
              <InfoRow label="Waste Incineration" value={`${indicators.wasteIncinerationAnnualEmissionsTonnesCO2.toFixed(3)} tonnes CO2`} />
              <InfoRow label="Total GHG" value={`${indicators.totalAnnualGHGEmissionsTonnesCO2.toFixed(2)} tonnes CO2`} />
              <InfoRow label="Carbon Market Ready" value={indicators.carbonMarketReadiness.toUpperCase()} />
              <InfoRow label="MRV Ready" value={indicators.mrvReadiness.toUpperCase()} />
              <InfoRow label="GHG Reduction Potential" value={`${(auditData.estimatedGHGReductionPotentialTonnesCO2 || 0).toFixed(1)} tonnes CO2/yr`} />
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Operations & Maintenance */}
          <Section title="🔧 Operations & Maintenance" icon={<Users className="w-5 h-5" />}>
            <div className="space-y-4">
              <InfoRow label="Trained O&M Staff" value={auditData.trainedOMStaffCount || 0} />
              <InfoRow label="O&M Readiness Score" value={`${indicators.omReadinessScore} / 100`} />
              <InfoRow label="Maintenance Compliance" value={indicators.maintenanceCompliance.toUpperCase()} />
              <InfoRow label="Service Frequency" value={auditData.powerSystemsServiceFrequency?.toUpperCase() || 'Unknown'} />
              <InfoRow label="Preventive Maintenance" value={auditData.preventiveMaintenanceScheduleDocumented ? 'Documented' : 'Not Documented'} />
              <InfoRow label="Spare Parts Available" value={auditData.sparepartsAvailableForCriticalSystems ? 'Yes' : 'No'} />
              <InfoRow label="Staff Skills Rating" value={`${auditData.omStaffSkillsRating} / 5`} />
            </div>
          </Section>

          {/* Environmental & Safety */}
          <Section title="🛡️ Environmental & Safety" icon={<Shield className="w-5 h-5" />}>
            <div className="space-y-4">
              <InfoRow label="Waste Segmentation" value={auditData.wasteSegmentationSystem ? 'Yes' : 'No'} />
              <InfoRow label="Waste Management Score" value={`${indicators.wasteManagementScore} / 100`} />
              <InfoRow label="Air Quality Monitoring" value={auditData.airQualityMonitoringSystem ? 'Yes' : 'No'} />
              <InfoRow label="Hazmat Storage Safe" value={auditData.hazardousMaterialsStorageSafe ? 'Yes' : 'No'} />
              <InfoRow label="PPE Adequate" value={auditData.adequatePPEAvailable ? 'Yes' : 'No'} />
              <InfoRow label="EHS Compliance" value={indicators.ehsComplianceStatus.toUpperCase()} />
            </div>
          </Section>
        </div>

        {/* Infrastructure & Future */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Infrastructure Potential */}
          <Section title="🏗️ Infrastructure Potential" icon={<BarChart3 className="w-5 h-5" />}>
            <div className="space-y-4">
              <InfoRow label="Renewable Upgrade Potential" value={indicators.renewableUpgradePotential.toUpperCase()} />
              <InfoRow label="Infrastructure Potential" value={indicators.infrastructurePotential.toUpperCase()} />
              <InfoRow label="Oxygen Plant Feasible" value={auditData.oxygenPlantFeasibility ? 'Yes' : 'No'} />
              <InfoRow label="Waste-to-Energy Feasible" value={auditData.waste_to_energyFeasibility ? 'Yes' : 'No'} />
              <InfoRow label="Nearby Facility Collaboration" value={auditData.nearbyFacilitiesSharedEnergyBenefit ? 'Possible' : 'Not Feasible'} />
            </div>
          </Section>

          {/* Critical Services Readiness */}
          <Section title="🏥 Critical Services Readiness" icon={<Zap className="w-5 h-5" />}>
            <div className="space-y-4">
              <InfoRow label="Cold Chain Status" value={indicators.coldChainReadiness.toUpperCase()} />
              <InfoRow label="Hours of Autonomy" value={`${indicators.hoursOfAutonomy.toFixed(1)} hrs`} />
              <InfoRow label="Backup Power Available" value={auditData.backupPowerSources ? 'Yes' : 'No'} />
              <InfoRow label="Emergency Energy Plan" value={auditData.emergencyEnergyPlan ? 'In Place' : 'Not in Place'} />
              <InfoRow label="Resilience Score" value={auditData.energyResilienceScore?.toUpperCase() || 'Unknown'} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STATE ADMIN DASHBOARD
// ============================================================================

export const StateAdminDashboard: React.FC<DashboardProps> = ({
  auditData,
  indicators,
  facilityName,
  lastUpdated
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#03543F] mb-2">{facilityName}</h1>
          <p className="text-slate-600">State-Level Oversight Dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={<Zap className="w-6 h-6" />}
            label="Energy Status"
            value={indicators.gridUptimePercentage >= 85 ? '✓ Stable' : '⚠ Monitor'}
            color={indicators.gridUptimePercentage >= 85 ? 'green' : 'amber'}
          />
          <MetricCard
            icon={<Shield className="w-6 h-6" />}
            label="O&M Status"
            value={indicators.omReadinessScore >= 70 ? '✓ Ready' : '⚠ Review'}
            color={indicators.omReadinessScore >= 70 ? 'green' : 'amber'}
          />
          <MetricCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="EHS Compliance"
            value={indicators.ehsComplianceStatus === 'compliant' ? '✓ OK' : '⚠ Action'}
            color={indicators.ehsComplianceStatus === 'compliant' ? 'green' : 'red'}
          />
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Section title="Energy & Resilience" icon={<Zap className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="Grid Availability" value={`${indicators.gridUptimePercentage.toFixed(1)}% (${indicators.gridAvailabilityBand.label})`} />
              <InfoRow label="Annual Energy" value={`${indicators.estimatedAnnualGridConsumptionKWh.toLocaleString()} kWh grid + ${indicators.solarGenerationAnnualKWh.toLocaleString()} kWh solar`} />
              <InfoRow label="Resilience Score" value={auditData.energyResilienceScore?.toUpperCase() || 'Unknown'} />
            </div>
          </Section>

          <Section title="Emissions Profile" icon={<Leaf className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="Total GHG" value={`${indicators.totalAnnualGHGEmissionsTonnesCO2.toFixed(1)} tonnes CO2/yr`} />
              <InfoRow label="Renewable Energy" value={`${indicators.renewableEnergyPercentage.toFixed(1)}%`} />
              <InfoRow label="Carbon Market Ready" value={indicators.carbonMarketReadiness.toUpperCase()} />
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Section title="Operations Status" icon={<Users className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="O&M Readiness" value={`${indicators.omReadinessScore} / 100`} />
              <InfoRow label="Trained Staff" value={`${auditData.trainedOMStaffCount || 0} staff`} />
              <InfoRow label="Compliance" value={indicators.maintenanceCompliance.toUpperCase()} />
            </div>
          </Section>

          <Section title="Environmental Compliance" icon={<Shield className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="EHS Status" value={indicators.ehsComplianceStatus.toUpperCase()} />
              <InfoRow label="Waste Management" value={`${indicators.wasteManagementScore} / 100`} />
              <InfoRow label="Cold Chain" value={indicators.coldChainReadiness.toUpperCase()} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FACILITY MANAGER DASHBOARD
// ============================================================================

export const FacilityManagerDashboard: React.FC<DashboardProps> = ({
  auditData,
  indicators,
  facilityName,
  lastUpdated
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#03543F] mb-2">Your Facility</h1>
          <h2 className="text-xl text-slate-600">{facilityName}</h2>
        </div>

        {/* Health Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ScoreCard
            label="Energy Health"
            score={indicators.gridUptimePercentage}
            max={100}
            color={indicators.gridUptimePercentage >= 85 ? 'green' : 'amber'}
          />
          <ScoreCard
            label="O&M Readiness"
            score={indicators.omReadinessScore}
            max={100}
            color={indicators.omReadinessScore >= 70 ? 'green' : 'amber'}
          />
          <ScoreCard
            label="Waste Mgmt"
            score={indicators.wasteManagementScore}
            max={100}
            color={indicators.wasteManagementScore >= 70 ? 'green' : 'amber'}
          />
          <ScoreCard
            label="Cold Chain"
            score={indicators.coldChainReadiness === 'stable' ? 100 : indicators.coldChainReadiness === 'at_risk' ? 50 : 0}
            max={100}
            color={indicators.coldChainReadiness === 'stable' ? 'green' : indicators.coldChainReadiness === 'at_risk' ? 'amber' : 'red'}
          />
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Section title="Today's Energy" icon={<Zap className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="Grid Status" value={auditData.gridConnected ? 'Online' : 'Offline'} />
              <InfoRow label="Estimated Daily Use" value={`${indicators.estimatedDailyConsumptionKWh.toFixed(1)} kWh`} />
              <InfoRow label="Backup Available" value={auditData.backupPowerSources ? 'Yes' : 'No'} />
            </div>
          </Section>

          <Section title="Operations" icon={<Users className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="Next Service Due" value={auditData.lastMaintenanceDate ? 'Check schedule' : 'Not scheduled'} />
              <InfoRow label="Trained Staff" value={`${auditData.trainedOMStaffCount || 0} available`} />
              <InfoRow label="Skills Level" value={`${auditData.omStaffSkillsRating || 0} / 5`} />
            </div>
          </Section>

          <Section title="Sustainability" icon={<Leaf className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="Monthly GHG Est." value={`${(indicators.totalAnnualGHGEmissionsTonnesCO2 / 12).toFixed(2)} tonnes CO2`} />
              <InfoRow label="Solar Usage" value={`${indicators.renewableEnergyPercentage.toFixed(1)}%`} />
              <InfoRow label="Upgrade Opportunity" value={indicators.renewableUpgradePotential.toUpperCase()} />
            </div>
          </Section>
        </div>

        {/* Action Items */}
        <Section title="📋 Action Items" icon={<AlertCircle className="w-5 h-5" />}>
          <div className="space-y-3">
            {indicators.omReadinessScore < 70 && (
              <ActionItem priority="high" text="Review O&M readiness - staff training recommended" />
            )}
            {indicators.wasteManagementScore < 70 && (
              <ActionItem priority="medium" text="Review waste management procedures" />
            )}
            {indicators.coldChainReadiness !== 'stable' && (
              <ActionItem priority="high" text="Cold chain status needs attention - verify backup power" />
            )}
            {auditData.preventiveMaintenanceScheduleDocumented === false && (
              <ActionItem priority="medium" text="Document preventive maintenance schedule" />
            )}
            {!auditData.photoDocumentationCompleted && (
              <ActionItem priority="low" text="Complete photo documentation for audit" />
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

// ============================================================================
// PUBLIC GUEST DASHBOARD
// ============================================================================

export const PublicGuestDashboard: React.FC<DashboardProps> = ({
  auditData,
  indicators,
  facilityName,
  lastUpdated
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#03543F] mb-2">{facilityName}</h1>
          <p className="text-slate-600">Public Information Dashboard</p>
        </div>

        {/* Public Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            icon={<Zap className="w-6 h-6" />}
            label="Energy Resilience"
            value={auditData.energyResilienceScore?.toUpperCase() || 'Unknown'}
            color="blue"
          />
          <MetricCard
            icon={<Leaf className="w-6 h-6" />}
            label="Environmental Commitment"
            value={`${indicators.dieselDisplacementPercentage.toFixed(0)}%`}
            unit="Renewable energy"
            color="green"
          />
        </div>

        {/* Public Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Section title="About This Facility" icon={null}>
            <div className="space-y-3">
              <InfoRow label="Location" value={`${auditData.locationState}, ${auditData.locationZone || 'Unknown'}`} />
              <InfoRow label="Facility Type" value={auditData.facilityType?.replace(/_/g, ' ').toUpperCase() || 'Unknown'} />
              <InfoRow label="Grid Connection" value={auditData.gridConnected ? 'Connected' : 'Not connected'} />
            </div>
          </Section>

          <Section title="Sustainability Efforts" icon={<Leaf className="w-5 h-5" />}>
            <div className="space-y-3">
              <InfoRow label="Renewable Energy" value={`${indicators.renewableEnergyPercentage.toFixed(1)}% of total`} />
              <InfoRow label="Annual GHG Emissions" value={`${indicators.totalAnnualGHGEmissionsTonnesCO2.toFixed(1)} tonnes CO2`} />
              <InfoRow label="Waste Management" value={auditData.wasteSegmentationSystem ? 'Implemented' : 'In Progress'} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  band?: string;
  color?: string;
}> = ({ icon, label, value, unit, band, color = 'slate' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
    slate: 'bg-slate-50 border-slate-200',
    red: 'bg-red-50 border-red-200'
  };

  return (
    <div className={`border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.slate} rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`text-3xl`}>{icon}</div>
      </div>
      <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#03543F] mb-1">{value}</p>
      {unit && <p className="text-xs text-slate-500">{unit}</p>}
      {band && <p className="text-xs text-slate-500 font-medium">{band}</p>}
    </div>
  );
};

const Section: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
    {icon ? (
      <h3 className="text-lg font-bold text-[#03543F] mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
    ) : (
      <h3 className="text-lg font-bold text-[#03543F] mb-4">{title}</h3>
    )}
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
    <span className="text-slate-600 text-sm">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const ScoreCard: React.FC<{ label: string; score: number; max: number; color: string }> = ({
  label,
  score,
  max,
  color
}) => {
  const percentage = (score / max) * 100;
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg p-4`}>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="w-full bg-opacity-30 bg-slate-400 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            color === 'green' ? 'bg-green-600' : color === 'amber' ? 'bg-amber-600' : 'bg-red-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-lg font-bold">{Math.round(score)}</p>
    </div>
  );
};

const ActionItem: React.FC<{ priority: 'high' | 'medium' | 'low'; text: string }> = ({ priority, text }) => {
  const colors = {
    high: 'bg-red-50 border-red-200 text-red-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    low: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const icons = {
    high: '🔴',
    medium: '🟡',
    low: '🔵'
  };

  return (
    <div className={`border-l-4 ${colors[priority]} border rounded-r p-3 flex items-center gap-3`}>
      <span className="text-lg">{icons[priority]}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
};

export default {
  FederalAdminDashboard,
  StateAdminDashboard,
  FacilityManagerDashboard,
  PublicGuestDashboard
};
