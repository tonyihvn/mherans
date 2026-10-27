/**
 * Indicator Calculation Service
 * Calculates all indicators from audit form data using configurable formulas
 */

import { AuditData } from './auditSchema';

export interface IndicatorFormula {
  indicatorId: string;
  indicatorName: string;
  description: string;
  formula: string; // e.g., "gridUptimeHoursPerDay / 24 * 100"
  unit: string;
  bandingRules: {
    high: { min: number; max: number };
    medium: { min: number; max: number };
    low: { min: number; max: number };
  };
  category: 'energy' | 'emissions' | 'operations' | 'resilience' | 'compliance';
  featured?: boolean; // Mark as featured for map marker popups
  iconClass?: string; // Font Awesome icon class (e.g., "fa-bolt", "fa-chart-line")
  isSummation?: boolean; // Indicates if indicator sums fields over a period
  summationNote?: string; // Description of what is being summed and over what period
  summationDateFrom?: string; // Start date for summation period (ISO string)
  summationDateTo?: string; // End date for summation period (ISO string)
}

export class IndicatorCalculator {
  private formulas: Map<string, IndicatorFormula> = new Map();

  constructor(formulas?: IndicatorFormula[]) {
    this.initializeDefaultFormulas();
    if (formulas) {
      formulas.forEach(f => this.formulas.set(f.indicatorId, f));
    }
  }

  private initializeDefaultFormulas() {
    // Default indicators
    const defaults: IndicatorFormula[] = [
      {
        indicatorId: 'uptime_percentage',
        indicatorName: 'Grid Uptime %',
        description: 'Percentage of grid availability hours',
        formula: '(gridUptimeHoursPerDay / 24) * 100',
        unit: '%',
        bandingRules: {
          high: { min: 95, max: 100 },
          medium: { min: 80, max: 94.9 },
          low: { min: 0, max: 79.9 }
        },
        category: 'resilience',
        featured: true,
        iconClass: 'fa-bolt'
      },
      {
        indicatorId: 'diesel_daily_consumption',
        indicatorName: 'Diesel Daily Consumption',
        description: 'Average daily diesel fuel consumption',
        formula: 'dieselFuelConsumptionRateLitresPerHour * dieselGeneratorOperatingHoursPerDay',
        unit: 'litres/day',
        bandingRules: {
          high: { min: 0, max: 50 },
          medium: { min: 50.1, max: 100 },
          low: { min: 100.1, max: 999999 }
        },
        category: 'emissions'
      },
      {
        indicatorId: 'grid_electricity_kwh_annual',
        indicatorName: 'Annual Grid Electricity',
        description: 'Total grid electricity consumed annually',
        formula: 'gridElectricityConsumptionLast12MonthsKWh',
        unit: 'kWh',
        bandingRules: {
          high: { min: 0, max: 500000 },
          medium: { min: 500001, max: 1000000 },
          low: { min: 1000001, max: 999999999 }
        },
        category: 'energy'
      },
      {
        indicatorId: 'diesel_consumption_annual',
        indicatorName: 'Annual Diesel Consumption',
        description: 'Total diesel consumed annually',
        formula: 'dieselConsumptionLast12MonthsLitres',
        unit: 'litres',
        bandingRules: {
          high: { min: 0, max: 5000 },
          medium: { min: 5001, max: 10000 },
          low: { min: 10001, max: 999999999 }
        },
        category: 'emissions',
        featured: true,
        iconClass: 'fa-gas-pump'
      },
      {
        indicatorId: 'om_staff_capacity',
        indicatorName: 'O&M Staff Capacity',
        description: 'Number of trained O&M staff',
        formula: 'trainedOMStaffCount',
        unit: 'count',
        bandingRules: {
          high: { min: 5, max: 999 },
          medium: { min: 2, max: 4 },
          low: { min: 0, max: 1 }
        },
        category: 'operations',
        featured: true,
        iconClass: 'fa-users'
      },
      {
        indicatorId: 'om_staff_skills',
        indicatorName: 'O&M Staff Skills Rating',
        description: 'Subjective O&M staff competency rating',
        formula: 'omStaffSkillsRating',
        unit: '1-5',
        bandingRules: {
          high: { min: 4, max: 5 },
          medium: { min: 2.5, max: 3.9 },
          low: { min: 0, max: 2.4 }
        },
        category: 'operations'
      },
      {
        indicatorId: 'emergency_preparedness',
        indicatorName: 'Emergency Preparedness Score',
        description: 'Score based on emergency planning',
        formula: `(emergencyEnergyPlan ? 50 : 0) + (preventiveMaintenanceScheduleDocumented ? 25 : 0) + (sparepartsAvailableForCriticalSystems ? 25 : 0)`,
        unit: 'score',
        bandingRules: {
          high: { min: 75, max: 100 },
          medium: { min: 50, max: 74 },
          low: { min: 0, max: 49 }
        },
        category: 'resilience',
        featured: true,
        iconClass: 'fa-shield'
      },
      {
        indicatorId: 'ghg_annual_emissions',
        indicatorName: 'Annual GHG Emissions (Est.)',
        description: 'Estimated CO2 from energy sources',
        formula: '(dieselConsumptionLast12MonthsLitres * 2.68) + (gridElectricityConsumptionLast12MonthsKWh * 0.421)',
        unit: 'kg CO2e',
        bandingRules: {
          high: { min: 0, max: 50000 },
          medium: { min: 50001, max: 100000 },
          low: { min: 100001, max: 9999999 }
        },
        category: 'emissions',
        featured: true,
        iconClass: 'fa-leaf'
      },
      {
        indicatorId: 'solar_production',
        indicatorName: 'Solar Energy Production',
        description: 'Total solar energy generated annually',
        formula: 'solarProductionLast12MonthsKWh',
        unit: 'kWh',
        bandingRules: {
          high: { min: 50000, max: 9999999 },
          medium: { min: 20000, max: 49999 },
          low: { min: 0, max: 19999 }
        },
        category: 'energy',
        featured: true,
        iconClass: 'fa-sun'
      },
      {
        indicatorId: 'equipment_utilization',
        indicatorName: 'Equipment Utilization Rate',
        description: 'Percentage of operational equipment',
        formula: 'totalEquipmentCount > 0 ? (operationalEquipmentCount / totalEquipmentCount) * 100 : 0',
        unit: '%',
        bandingRules: {
          high: { min: 85, max: 100 },
          medium: { min: 70, max: 84.9 },
          low: { min: 0, max: 69.9 }
        },
        category: 'operations'
      },
      {
        indicatorId: 'compliance_score',
        indicatorName: 'Compliance with Standards',
        description: 'Overall compliance percentage',
        formula: 'complianceWithStandards',
        unit: '%',
        bandingRules: {
          high: { min: 85, max: 100 },
          medium: { min: 70, max: 84.9 },
          low: { min: 0, max: 69.9 }
        },
        category: 'compliance'
      },
      {
        indicatorId: 'audit_score',
        indicatorName: 'Overall Audit Score',
        description: 'Comprehensive audit performance score',
        formula: 'auditScore',
        unit: '%',
        bandingRules: {
          high: { min: 75, max: 100 },
          medium: { min: 50, max: 74.9 },
          low: { min: 0, max: 49.9 }
        },
        category: 'compliance'
      }
    ];

    defaults.forEach(f => this.formulas.set(f.indicatorId, f));
  }

  calculateIndicator(indicatorId: string, auditData: Partial<AuditData>): number | null {
    const formula = this.formulas.get(indicatorId);
    if (!formula) return null;

    try {
      // Build a safe evaluation context
      const context = this.buildContext(auditData);
      const result = this.evaluateFormula(formula.formula, context);
      return typeof result === 'number' ? Math.round(result * 100) / 100 : null;
    } catch (error) {
      console.error(`Error calculating ${indicatorId}:`, error);
      return null;
    }
  }

  calculateAllIndicators(auditData: Partial<AuditData>): Record<string, { value: number | null; band: string }> {
    const results: Record<string, { value: number | null; band: string }> = {};

    this.formulas.forEach((formula, id) => {
      const value = this.calculateIndicator(id, auditData);
      const band = value !== null ? this.getBand(value, formula) : 'unknown';
      results[id] = { value, band };
    });

    return results;
  }

  private buildContext(auditData: Partial<AuditData>): Record<string, any> {
    return {
      // Facility Information
      facilityName: auditData.facilityName || '',
      hfrId: auditData.hfrId || '',
      facilityLevel: auditData.facilityLevel || '',
      state: auditData.state || auditData.locationState || '',
      lga: auditData.lga || auditData.locationZone || '',

      // Energy Systems - Numeric values
      gridUptimeHoursPerDay: auditData.gridUptimeHoursPerDay || 0,
      gridElectricityConsumptionLast12MonthsKWh: auditData.gridElectricityConsumptionLast12MonthsKWh || 0,
      solarCapacityKWp: auditData.solarCapacityKWp || 0,
      solarProductionLast12MonthsKWh: auditData.solarEnergyGenerationLast12MonthsKWh || 0,
      dieselGeneratorCapacityKVA: auditData.dieselGeneratorCapacityKVA || 0,
      batteryStorageCapacityKWh: auditData.batteryStorageCapacityKWh || 0,

      // Water & Sanitation
      totalWaterTanksCount: auditData.totalWaterTanksCount || 0,
      waterTankCapacityM3Total: auditData.waterTankCapacityM3Total || 0,
      wasteWaterTreatmentType: auditData.wasteWaterTreatmentType || '',
      wasteDisposalMechanismType: auditData.wasteDisposalMechanismType || '',

      // Operations & Costs
      dieselConsumptionLast12MonthsLitres: auditData.dieselConsumptionLast12MonthsLitres || 0,
      fuelCostNaira: auditData.fuelCostNaira || 0,
      operatingCostNaira: auditData.operatingCostNaira || 0,
      maintenanceCostNaira: auditData.maintenanceCostNaira || 0,
      dieselFuelConsumptionRateLitresPerHour: auditData.dieselFuelConsumptionRateLitresPerHour || 0,
      dieselGeneratorOperatingHoursPerDay: auditData.dieselGeneratorOperatingHoursPerDay || 0,

      // Staffing & Skills
      trainedOMStaffCount: auditData.trainedOMStaffCount || 0,
      omStaffSkillsRating: auditData.omStaffSkillsRating || 0,
      biomedicalWasteTrainingComplete: auditData.biomedicalWasteTrainingComplete ? 1 : 0,

      // Infrastructure Conditions
      buildingConditionRating: auditData.buildingConditionRating || 0,
      roofConditionRating: auditData.roofConditionRating || 0,
      wallsConditionRating: auditData.wallsConditionRating || 0,
      floorsConditionRating: auditData.floorsConditionRating || 0,

      // Medical Equipment & Services
      operationalEquipmentCount: auditData.operationalEquipmentCount || 0,
      totalEquipmentCount: auditData.totalEquipmentCount || 0,
      equipmentUtilizationRate: auditData.equipmentUtilizationRate || 0,
      bedOccupancyRate: auditData.bedOccupancyRate || 0,
      outpatientAttendancePerDay: auditData.outpatientAttendancePerDay || 0,
      deliveriesPerMonth: auditData.deliveriesPerMonth || 0,
      emergencyCasesPerMonth: auditData.emergencyCasesPerMonth || 0,

      // Security & Compliance
      hasMedicinesStock: auditData.hasMedicinesStock ? 1 : 0,
      hasVaccinesStock: auditData.hasVaccinesStock ? 1 : 0,
      complianceWithStandards: auditData.complianceWithStandards || 0,
      auditScore: auditData.auditScore || 0,

      // Waste Management
      wasteIncinerationVolumeMonthlyKg: auditData.wasteIncinerationVolumeMonthlyKg || 0,

      // Boolean values
      emergencyEnergyPlan: auditData.emergencyEnergyPlan ? 1 : 0,
      preventiveMaintenanceScheduleDocumented: auditData.preventiveMaintenanceScheduleDocumented ? 1 : 0,
      sparepartsAvailableForCriticalSystems: auditData.sparepartsAvailableForCriticalSystems ? 1 : 0,
      trainedOMStaffPresent: auditData.trainedOMStaffPresent ? 1 : 0
    };
  }

  private evaluateFormula(formula: string, context: Record<string, any>): number {
    // Create a function that safely evaluates the formula
    const keys = Object.keys(context);
    const values = Object.values(context);
    
    // Safe evaluation with function constructor
    try {
      const func = new Function(...keys, `return (${formula})`);
      return func(...values) as number;
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${formula}`);
    }
  }

  private getBand(value: number, formula: IndicatorFormula): 'high' | 'medium' | 'low' {
    const rules = formula.bandingRules;
    if (value >= rules.high.min && value <= rules.high.max) return 'high';
    if (value >= rules.medium.min && value <= rules.medium.max) return 'medium';
    if (value >= rules.low.min && value <= rules.low.max) return 'low';
    return 'low';
  }

  getAllFormulas(): IndicatorFormula[] {
    return Array.from(this.formulas.values());
  }

  getFeaturedFormulas(): IndicatorFormula[] {
    return Array.from(this.formulas.values()).filter(f => f.featured === true);
  }

  getFormulaById(id: string): IndicatorFormula | undefined {
    return this.formulas.get(id);
  }

  updateFormula(formula: IndicatorFormula): void {
    this.formulas.set(formula.indicatorId, formula);
  }

  addFormula(formula: IndicatorFormula): void {
    this.formulas.set(formula.indicatorId, formula);
  }
}

// Singleton instance
export const indicatorCalculator = new IndicatorCalculator();
