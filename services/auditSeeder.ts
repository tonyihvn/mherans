/**
 * Database Seeding Script
 * Creates 8 sample audits across 4 quarters of 2026
 * Run this via API: POST /api/seed/audits
 * Or include it in your server startup
 */

import { AuditData } from './auditSchema';

export class AuditSeeder {
  /**
   * Generate sample audit data
   */
  static generateSampleAudit(
    facilityId: string,
    auditNumber: number,
    quarter: number,
    year: number = 2026
  ): Partial<AuditData> {
    // Calculate date within quarter
    const monthStart = (quarter - 1) * 3 + 1;
    const day = 15 + (auditNumber * 5); // Spread audits through month
    const date = new Date(year, monthStart - 1, Math.min(day, 28));

    // Generate varied data based on audit number and quarter
    const variance = (auditNumber + quarter) * 0.1;

    return {
      id: `audit_${facilityId}_Q${quarter}_${auditNumber}_2026`,
      facility_id: facilityId,
      facilityId: facilityId,
      hfr_id: facilityId,
      createdAt: date.toISOString(),
      created_at: date.toISOString(),
      updatedAt: date.toISOString(),

      // Section 1: Facility Identification
      facilityName: `Sample Facility - ${facilityId}`,
      facilityType: 'primary',
      locationState: 'Lagos',
      locationZone: 'Southwest',
      gpsLatitude: 6.5244 + variance,
      gpsLongitude: 3.3792 + variance,
      focalPersonName: 'Dr. John Okafor',
      focalPersonPhone: '+234 701 234 5678',

      // Section 2: Energy Access & Resilience
      mainPowerSupply: 'grid',
      gridUptimeHoursPerDay: 16 + Math.floor(variance * 4),
      energyResilienceScore: variance < 0.3 ? 'low' : variance < 0.6 ? 'medium' : 'high',
      hasDieselGenerator: true,
      dieselGeneratorCapacityKVA: 60 + Math.floor(variance * 20),
      hasSolarSystem: true,
      solarSystemCapacityKWp: 10 + Math.floor(variance * 5),
      hasBatteryStorage: true,
      batteryStorageCapacityKWh: 20 + Math.floor(variance * 10),

      // Section 3: Electrical Load Inventory
      equipmentInventory: [
        {
          id: 'eq1',
          name: 'ICU Equipment',
          quantity: 5,
          ratedPowerKW: 3.5,
          operatingHoursPerDay: 24,
          backupPower: true
        },
        {
          id: 'eq2',
          name: 'Laboratory Machines',
          quantity: 8,
          ratedPowerKW: 2.0,
          operatingHoursPerDay: 12,
          backupPower: true
        },
        {
          id: 'eq3',
          name: 'Refrigerators',
          quantity: 12,
          ratedPowerKW: 0.75,
          operatingHoursPerDay: 24,
          backupPower: true
        },
        {
          id: 'eq4',
          name: 'Water Pump',
          quantity: 2,
          ratedPowerKW: 5.0,
          operatingHoursPerDay: 8,
          backupPower: false
        }
      ],
      lightingInventory: [
        {
          id: 'lt1',
          type: 'LED',
          quantity: 150,
          wattage: 18,
          operatingHoursPerDay: 12
        },
        {
          id: 'lt2',
          type: 'Fluorescent',
          quantity: 40,
          wattage: 40,
          operatingHoursPerDay: 12
        }
      ],

      // Section 4: GHG Emissions Data
      gridElectricityConsumptionLast12MonthsKWh: 45000 + Math.floor(variance * 15000),
      dieselConsumptionLast12MonthsLitres: 12000 + Math.floor(variance * 4000),
      solarEnergyGenerationLast12MonthsKWh: 15000 + Math.floor(variance * 5000),
      wasteIncinerationTonsPerYear: 85 + Math.floor(variance * 30),

      // Section 5: O&M Readiness
      maintenancePlanAvailable: true,
      trainingProgramsAvailable: true,
      sparePartsAvailable: true,
      technicalManualsAvailable: true,

      // Section 6: Environmental & Social Safeguards
      wasteManagementSystem: true,
      hasEHSPolicy: true,
      wastewaterTreatment: true,
      ehs_ComplianceStatus: variance < 0.4 ? 'major_defects' : variance < 0.7 ? 'minor_defects' : 'compliant',

      // Section 7: GHG Reduction & Efficiency
      energyEfficiencyActionsPlanned: true,
      renewableEnergyPotential: 'high',

      // Section 8: Carbon Market Readiness
      mrvSystemsAvailable: true,
      interestedInCarbonMarket: true,

      // Section 9: Environmental Scanning
      environmentalScanningNotes: `Q${quarter} 2026 Audit - Energy systems performing well. Grid reliability improving. Solar system efficiency stable at ${92 + Math.floor(variance * 5)}%.`
    };
  }

  /**
   * Create seed audits for a facility
   */
  static createSeedAudits(facilityId: string): Partial<AuditData>[] {
    const audits: Partial<AuditData>[] = [];

    // Create 2 audits per quarter
    for (let quarter = 1; quarter <= 4; quarter++) {
      for (let auditNum = 1; auditNum <= 2; auditNum++) {
        audits.push(
          this.generateSampleAudit(facilityId, auditNum, quarter, 2026)
        );
      }
    }

    return audits;
  }
}
