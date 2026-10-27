

/**
 * Indicator Details Provider
 * Maps indicators to their calculation details, formulas, and source values
 */

import { AuditData } from './auditSchema';
import { ComputedIndicators } from './auditIndicatorCalculator';
import { IndicatorInfo } from '../components/IndicatorDetailsModal';

export class IndicatorDetailsProvider {
  /**
   * Get detailed information for an indicator
   */
  static getIndicatorDetails(
    indicatorKey: string,
    indicatorValue: any,
    auditData: Partial<AuditData>,
    isSummationIndicator?: boolean
  ): IndicatorInfo {
    const details: Record<string, IndicatorInfo> = {
      // Energy & Grid
      gridUptimeHoursPerDay: {
        name: 'Grid Uptime (hours/day)',
        value: indicatorValue,
        unit: 'hours',
        description: 'Average hours per day the facility has access to grid power',
        formula: 'Directly from audit form: gridUptimeHoursPerDay',
        sourceFields: [
          { label: 'Grid Uptime (hours/day)', value: auditData.gridUptimeHoursPerDay, unit: 'hours' }
        ]
      },

      gridUptimePercentage: {
        name: 'Grid Uptime Percentage',
        value: indicatorValue,
        unit: '%',
        description: 'Percentage of time facility has grid access',
        formula: '(gridUptimeHoursPerDay / 24) × 100',
        sourceFields: [
          { label: 'Grid Uptime (hours/day)', value: auditData.gridUptimeHoursPerDay, unit: 'hours' }
        ]
      },

      energyResilienceScore: {
        name: 'Energy Resilience Score',
        value: indicatorValue,
        description: 'Overall assessment of facility energy resilience (high/medium/low)',
        formula: 'Qualitative assessment from audit: energyResilienceScore',
        sourceFields: [
          { label: 'Energy Resilience Score', value: auditData.energyResilienceScore }
        ]
      },

      // Electrical Load
      totalElectricalLoadKW: {
        name: 'Total Electrical Load',
        value: indicatorValue,
        unit: 'kW',
        description: 'Sum of all electrical equipment and lighting loads',
        formula: 'Sum of (equipment_rated_power × quantity) + Sum of (lighting_wattage × quantity / 1000)',
        sourceFields: [
          { label: 'Equipment Inventory Count', value: auditData.equipmentInventory?.length || 0, unit: 'items' },
          { label: 'Lighting Inventory Count', value: auditData.lightingInventory?.length || 0, unit: 'items' }
        ],
        isSummation: true,
        summationNote: 'Total electrical load is the sum of all equipment and lighting installed in the facility.'
      },

      estimatedDailyConsumptionKWh: {
        name: 'Estimated Daily Consumption',
        value: indicatorValue,
        unit: 'kWh',
        description: 'Estimated daily energy consumption based on equipment operating hours',
        formula: 'Sum of (equipment_rated_power × operating_hours) + Sum of (lighting_wattage × operating_hours / 1000)',
        sourceFields: [
          { label: 'Total Equipment Load', value: auditData.equipmentInventory?.reduce((sum, item) => sum + ((item.ratedPowerKW || 0) * (item.quantity || 1)), 0) || 0, unit: 'kW' },
          { label: 'Total Lighting Load', value: (auditData.lightingInventory?.reduce((sum, item) => sum + ((item.wattage || 0) * (item.quantity || 1)), 0) || 0) / 1000, unit: 'kW' }
        ],
        isSummation: true
      },

      estimatedAnnualGridConsumptionKWh: {
        name: 'Annual Grid Consumption',
        value: indicatorValue,
        unit: 'kWh',
        description: 'Grid electricity consumption over the last 12 months',
        formula: 'Directly from audit: gridElectricityConsumptionLast12MonthsKWh',
        sourceFields: [
          { label: 'Grid Consumption (12 months)', value: auditData.gridElectricityConsumptionLast12MonthsKWh, unit: 'kWh' }
        ]
      },

      // Generation
      solarGenerationAnnualKWh: {
        name: 'Annual Solar Generation',
        value: indicatorValue,
        unit: 'kWh',
        description: 'Solar energy generated over the last 12 months',
        formula: 'Directly from audit: solarEnergyGenerationLast12MonthsKWh',
        sourceFields: [
          { label: 'Solar Generation (12 months)', value: auditData.solarEnergyGenerationLast12MonthsKWh, unit: 'kWh' },
          { label: 'Solar System Capacity', value: auditData.solarCapacityKWp, unit: 'kWp' }
        ]
      },

      // Diesel & Consumption
      dieselDailyConsumptionLitres: {
        name: 'Daily Diesel Consumption',
        value: indicatorValue,
        unit: 'litres',
        description: 'Estimated daily diesel generator consumption',
        formula: 'Based on generator capacity and daily operating hours'
      },

      estimatedAnnualDieselConsumptionLitres: {
        name: 'Annual Diesel Consumption',
        value: indicatorValue,
        unit: 'litres',
        description: 'Diesel fuel consumption over the last 12 months',
        formula: 'Directly from audit: dieselConsumptionLast12MonthsLitres',
        sourceFields: [
          { label: 'Diesel Consumption (12 months)', value: auditData.dieselConsumptionLast12MonthsLitres, unit: 'litres' },
          { label: 'Generator Capacity', value: auditData.dieselGeneratorCapacityKVA, unit: 'kVA' }
        ]
      },

      // Emissions
      totalAnnualGHGEmissionsTonnesCO2: {
        name: 'Total Annual GHG Emissions',
        value: indicatorValue,
        unit: 'tCO₂e',
        description: 'Total greenhouse gas emissions from all sources (diesel, grid, waste)',
        formula: '(dieselConsumption × 2.68 + gridConsumption × 0.532 + wasteVolume × 1.5) / 1000',
        sourceFields: [
          { label: 'Diesel Emissions', value: (auditData.dieselConsumptionLast12MonthsLitres || 0) * 2.68 / 1000, unit: 'tCO₂e' },
          { label: 'Grid Emissions', value: (auditData.gridElectricityConsumptionLast12MonthsKWh || 0) * 0.532 / 1000, unit: 'tCO₂e' },
          { label: 'Waste Incineration Emissions', value: ((auditData.wasteIncinerationVolumeMonthlyKg || 0) * 12 * 1.5) / 1000, unit: 'tCO₂e' }
        ],
        isSummation: true,
        summationNote: 'Total GHG emissions are calculated by summing emissions from diesel, grid electricity, and waste incineration.'
      },

      dieselAnnualEmissionsTonnesCO2: {
        name: 'Diesel Annual Emissions',
        value: indicatorValue,
        unit: 'tCO₂e',
        description: 'CO₂ emissions from diesel generator use',
        formula: '(dieselConsumptionLitres × 2.68) / 1000',
        sourceFields: [
          { label: 'Diesel Consumption', value: auditData.dieselConsumptionLast12MonthsLitres, unit: 'litres' },
          { label: 'Emission Factor', value: 2.68, unit: 'kg CO₂/litre' }
        ]
      },

      gridAnnualEmissionsTonnesCO2: {
        name: 'Grid Annual Emissions',
        value: indicatorValue,
        unit: 'tCO₂e',
        description: 'CO₂ emissions from grid electricity consumption',
        formula: '(gridConsumptionKWh × 0.532) / 1000',
        sourceFields: [
          { label: 'Grid Consumption', value: auditData.gridElectricityConsumptionLast12MonthsKWh, unit: 'kWh' },
          { label: 'Emission Factor', value: 0.532, unit: 'kg CO₂/kWh (Nigeria avg)' }
        ]
      },

      wasteIncinerationAnnualEmissionsTonnesCO2: {
        name: 'Waste Incineration Emissions',
        value: indicatorValue,
        unit: 'tCO₂e',
        description: 'CO₂ emissions from medical waste incineration',
        formula: '(wasteIncinerationMonthlyKg × 12 × 1.5) / 1000',
        sourceFields: [
          { label: 'Waste Incineration (monthly)', value: auditData.wasteIncinerationVolumeMonthlyKg, unit: 'kg/month' },
          { label: 'Annual Waste', value: (auditData.wasteIncinerationVolumeMonthlyKg || 0) * 12, unit: 'kg/year' },
          { label: 'Emission Factor', value: 1.5, unit: 'kg CO₂/kg waste' }
        ]
      },

      // Renewable Energy
      dieselDisplacementPercentage: {
        name: 'Diesel Displacement',
        value: indicatorValue,
        unit: '%',
        description: 'Percentage of energy from renewable sources vs total',
        formula: '(solarGeneration / (solarGeneration + dieselConsumption)) × 100'
      },

      renewableEnergyPercentage: {
        name: 'Renewable Energy Percentage',
        value: indicatorValue,
        unit: '%',
        description: 'Percentage of total energy from renewable sources',
        formula: '(renewableGeneration / totalEnergyConsumption) × 100'
      },

      // O&M Readiness
      omReadinessScore: {
        name: 'O&M Readiness Score',
        value: indicatorValue,
        unit: '%',
        description: 'Assessment of operations and maintenance readiness (0-100)',
        formula: 'Score based on: maintenance plan, training staff count, spare parts availability, service frequency, staff skills',
        sourceFields: [
          { label: 'Preventive Maintenance Documented', value: auditData.preventiveMaintenanceScheduleDocumented ? 'Yes' : 'No' },
          { label: 'Trained O&M Staff', value: auditData.trainedOMStaffCount || 0, unit: 'staff' },
          { label: 'Spare Parts Available', value: auditData.sparepartsAvailableForCriticalSystems ? 'Yes' : 'No' },
          { label: 'Service Frequency', value: auditData.powerSystemsServiceFrequency || 'Not specified' },
          { label: 'Staff Skills Rating', value: auditData.omStaffSkillsRating || 0, unit: '1-5' }
        ]
      },

      // Waste Management
      wasteManagementScore: {
        name: 'Waste Management Score',
        value: indicatorValue,
        unit: '%',
        description: 'Assessment of waste management readiness (0-100)',
        formula: 'Score based on waste segmentation, disposal method, air quality monitoring, hazardous materials storage, PPE availability',
        sourceFields: [
          { label: 'Waste Segmentation System', value: auditData.wasteSegmentationSystem ? 'Yes' : 'No' },
          { label: 'Disposal Method Documented', value: auditData.wasteDisposalMethod ? 'Yes' : 'No' },
          { label: 'Air Quality Monitoring', value: auditData.airQualityMonitoringSystem ? 'Yes' : 'No' },
          { label: 'Hazardous Materials Storage', value: auditData.hazardousMaterialsStorageSafe ? 'Yes' : 'No' },
          { label: 'Adequate PPE Available', value: auditData.adequatePPEAvailable ? 'Yes' : 'No' }
        ]
      },

      // Carbon Market
      carbonMarketReadiness: {
        name: 'Carbon Market Readiness',
        value: indicatorValue,
        description: 'Assessment of facility readiness for carbon market participation',
        sourceFields: [
          { label: 'MRV Systems In Place', value: auditData.mrvSystemsInPlace ? 'Yes' : 'No' },
          { label: 'Interest in Carbon Market', value: auditData.carbonCreditSchemeInterest ? 'Yes' : 'No' },
          { label: 'Historical Energy Records', value: auditData.historicalEnergyGHGRecords ? 'Yes' : 'No' }
        ]
      },

      mrvReadiness: {
        name: 'MRV Readiness',
        value: indicatorValue,
        description: 'Measurement, Reporting, and Verification system readiness',
        sourceFields: [
          { label: 'MRV Systems In Place', value: auditData.mrvSystemsInPlace ? 'Yes' : 'No' },
          { label: 'Historical Energy Records', value: auditData.historicalEnergyGHGRecords ? 'Yes' : 'No' }
        ]
      }
    };

    return details[indicatorKey] || {
      name: indicatorKey.replace(/([A-Z])/g, ' $1').trim(),
      value: indicatorValue,
      description: 'Indicator value from audit data',
      sourceFields: []
    };
  }

  /**
   * Get all indicators with their details
   */
  static getAllIndicatorDetails(
    indicators: ComputedIndicators,
    auditData: Partial<AuditData>,
    summationIndicators: string[] = []
  ): Record<string, IndicatorInfo> {
    const result: Record<string, IndicatorInfo> = {};

    Object.entries(indicators).forEach(([key, value]) => {
      if (!key.startsWith('_')) {
        result[key] = this.getIndicatorDetails(
          key,
          value,
          auditData,
          summationIndicators.includes(key)
        );
      }
    });

    return result;
  }
}
