/**
 * Audit-Based Indicator Calculator
 * Computes all facility indicators and KPIs from audit form data
 * Ensures all dashboard data flows from audit values
 */

import { AuditData } from './auditSchema';

export interface ComputedIndicators {
  // Resilience & Uptime
  gridUptimePercentage: number;
  gridUptimeHoursPerDay: number;
  gridAvailabilityBand: { label: string; min: number; max: number };
  energyResilienceScore: 'high' | 'medium' | 'low';
  
  // Power Generation & Consumption
  totalElectricalLoadKW: number;
  estimatedDailyConsumptionKWh: number;
  estimatedAnnualGridConsumptionKWh: number;
  estimatedAnnualDieselConsumptionLitres: number;
  solarGenerationAnnualKWh: number;
  
  // Diesel & Emissions
  dieselDailyConsumptionLitres: number;
  dieselAnnualEmissionsTonnesCO2: number;
  gridAnnualEmissionsTonnesCO2: number;
  wasteIncinerationAnnualEmissionsTonnesCO2: number;
  totalAnnualGHGEmissionsTonnesCO2: number;
  
  // Diesel Displacement
  dieselDisplacementPercentage: number;
  renewableEnergyPercentage: number;
  
  // Operations & Maintenance
  omReadinessScore: number; // 0-100
  maintenanceCompliance: 'compliant' | 'partial' | 'non_compliant';
  
  // Environmental & Safety
  ehsComplianceStatus: 'compliant' | 'minor_defects' | 'major_defects';
  wasteManagementScore: number; // 0-100
  
  // Carbon Market Readiness
  carbonMarketReadiness: 'ready' | 'near_ready' | 'not_ready';
  mrvReadiness: 'ready' | 'near_ready' | 'not_ready';
  
  // Cold Chain & Critical Services
  coldChainReadiness: 'stable' | 'at_risk' | 'compromised';
  
  // Infrastructure Potential
  renewableUpgradePotential: 'high' | 'medium' | 'low';
  infrastructurePotential: 'high' | 'medium' | 'low';
  
  // Hours of Autonomy (for critical services)
  hoursOfAutonomy: number; // estimated hours of backup power
}

export class AuditIndicatorCalculator {
  /**
   * Calculate all indicators from audit data
   */
  static calculateAllIndicators(audit: Partial<AuditData>): ComputedIndicators {
    return {
      // Resilience & Uptime
      gridUptimePercentage: this.calculateGridUptimePercentage(audit),
      gridUptimeHoursPerDay: audit.gridUptimeHoursPerDay || 0,
      gridAvailabilityBand: this.calculateGridAvailabilityBand(audit),
      energyResilienceScore: audit.energyResilienceScore || 'medium',
      
      // Power Generation & Consumption
      totalElectricalLoadKW: this.calculateTotalElectricalLoad(audit),
      estimatedDailyConsumptionKWh: this.calculateEstimatedDailyConsumption(audit),
      estimatedAnnualGridConsumptionKWh: audit.gridElectricityConsumptionLast12MonthsKWh || 0,
      estimatedAnnualDieselConsumptionLitres: audit.dieselConsumptionLast12MonthsLitres || 0,
      solarGenerationAnnualKWh: audit.solarEnergyGenerationLast12MonthsKWh || 0,
      
      // Diesel & Emissions
      dieselDailyConsumptionLitres: this.calculateDieselDailyConsumption(audit),
      dieselAnnualEmissionsTonnesCO2: this.calculateDieselEmissions(audit),
      gridAnnualEmissionsTonnesCO2: this.calculateGridEmissions(audit),
      wasteIncinerationAnnualEmissionsTonnesCO2: this.calculateWasteIncinerationEmissions(audit),
      totalAnnualGHGEmissionsTonnesCO2: this.calculateTotalGHGEmissions(audit),
      
      // Diesel Displacement
      dieselDisplacementPercentage: this.calculateDieselDisplacement(audit),
      renewableEnergyPercentage: this.calculateRenewableEnergyPercentage(audit),
      
      // Operations & Maintenance
      omReadinessScore: this.calculateOMReadiness(audit),
      maintenanceCompliance: this.calculateMaintenanceCompliance(audit),
      
      // Environmental & Safety
      ehsComplianceStatus: (audit.ehs_ComplianceStatus as 'compliant' | 'minor_defects' | 'major_defects') || 'compliant',
      wasteManagementScore: this.calculateWasteManagementScore(audit),
      
      // Carbon Market Readiness
      carbonMarketReadiness: this.calculateCarbonMarketReadiness(audit),
      mrvReadiness: this.calculateMRVReadiness(audit),
      
      // Cold Chain & Critical Services
      coldChainReadiness: this.calculateColdChainReadiness(audit),
      
      // Infrastructure Potential
      renewableUpgradePotential: this.calculateRenewableUpgradePotential(audit),
      infrastructurePotential: this.calculateInfrastructurePotential(audit),
      
      // Hours of Autonomy
      hoursOfAutonomy: this.calculateHoursOfAutonomy(audit)
    };
  }

  // ============================================================================
  // RESILIENCE & UPTIME CALCULATIONS
  // ============================================================================

  private static calculateGridUptimePercentage(audit: Partial<AuditData>): number {
    const hoursPerDay = audit.gridUptimeHoursPerDay || 0;
    return (hoursPerDay / 24) * 100;
  }

  private static calculateGridAvailabilityBand(audit: Partial<AuditData>): { label: string; min: number; max: number } {
    const percentage = this.calculateGridUptimePercentage(audit);
    
    if (percentage >= 95) {
      return { label: '95–100%', min: 95, max: 100 };
    } else if (percentage >= 85) {
      return { label: '85–94%', min: 85, max: 94 };
    } else if (percentage >= 70) {
      return { label: '70–84%', min: 70, max: 84 };
    } else {
      return { label: '<70%', min: 0, max: 69 };
    }
  }

  // ============================================================================
  // POWER & ELECTRICAL CALCULATIONS
  // ============================================================================

  private static calculateTotalElectricalLoad(audit: Partial<AuditData>): number {
    let total = 0;

    // Equipment load
    if (audit.equipmentInventory) {
      audit.equipmentInventory.forEach(item => {
        total += (item.ratedPowerKW || 0) * (item.quantity || 1);
      });
    }

    // Lighting load
    if (audit.lightingInventory) {
      audit.lightingInventory.forEach(item => {
        const wattage = item.wattage || 0;
        const quantity = item.quantity || 1;
        total += (wattage * quantity) / 1000; // Convert to kW
      });
    }

    // Additional systems
    total += audit.waterPumpRatedPowerKW || 0;
    total += audit.coldChainEquipmentEnergyUseKW || 0;

    return Math.round(total * 10) / 10; // Round to 1 decimal place
  }

  private static calculateEstimatedDailyConsumption(audit: Partial<AuditData>): number {
    const load = this.calculateTotalElectricalLoad(audit);
    // Assume average 70% utilization
    return load * 0.7 * 24 / 1000; // in kWh
  }

  // ============================================================================
  // DIESEL & EMISSIONS CALCULATIONS
  // ============================================================================

  private static calculateDieselDailyConsumption(audit: Partial<AuditData>): number {
    const consumptionRate = audit.dieselFuelConsumptionRateLitresPerHour || 0;
    const operatingHours = audit.dieselGeneratorOperatingHoursPerDay || 0;
    return consumptionRate * operatingHours;
  }

  private static calculateDieselEmissions(audit: Partial<AuditData>): number {
    // Diesel emits approximately 2.68 kg CO2 per litre burned
    const annualDieselLitres = audit.dieselConsumptionLast12MonthsLitres || 0;
    return (annualDieselLitres * 2.68) / 1000; // Convert to tonnes CO2
  }

  private static calculateGridEmissions(audit: Partial<AuditData>): number {
    // Nigerian grid average is approximately 0.532 kg CO2 per kWh (varies by region)
    const annualGridKWh = audit.gridElectricityConsumptionLast12MonthsKWh || 0;
    return (annualGridKWh * 0.532) / 1000; // Convert to tonnes CO2
  }

  private static calculateWasteIncinerationEmissions(audit: Partial<AuditData>): number {
    if (!audit.wasteIncinerationPresent) return 0;

    // Medical waste incineration: ~1.5 kg CO2 per kg of waste
    const monthlyWasteKg = audit.wasteIncinerationVolumeMonthlyKg || 0;
    const annualWasteKg = monthlyWasteKg * 12;
    return (annualWasteKg * 1.5) / 1000; // Convert to tonnes CO2
  }

  private static calculateTotalGHGEmissions(audit: Partial<AuditData>): number {
    const diesel = this.calculateDieselEmissions(audit);
    const grid = this.calculateGridEmissions(audit);
    const waste = this.calculateWasteIncinerationEmissions(audit);
    return diesel + grid + waste;
  }

  private static calculateDieselDisplacement(audit: Partial<AuditData>): number {
    const totalEnergy = (audit.gridElectricityConsumptionLast12MonthsKWh || 0) + 
                       (audit.solarEnergyGenerationLast12MonthsKWh || 0);
    
    if (totalEnergy === 0) return 0;

    // Diesel displacement = (1 - (Diesel kWh / Total energy)) * 100
    // Assume 1 litre diesel generates ~2.5 kWh at ~35% efficiency
    const dieselKWh = (audit.dieselConsumptionLast12MonthsLitres || 0) * 2.5;
    return Math.max(0, Math.min(100, ((totalEnergy - dieselKWh) / totalEnergy) * 100));
  }

  private static calculateRenewableEnergyPercentage(audit: Partial<AuditData>): number {
    const totalEnergy = (audit.gridElectricityConsumptionLast12MonthsKWh || 0) + 
                       (audit.solarEnergyGenerationLast12MonthsKWh || 0) +
                       ((audit.dieselConsumptionLast12MonthsLitres || 0) * 2.5);
    
    if (totalEnergy === 0) return 0;

    const solarEnergy = audit.solarEnergyGenerationLast12MonthsKWh || 0;
    return (solarEnergy / totalEnergy) * 100;
  }

  // ============================================================================
  // OPERATIONS & MAINTENANCE CALCULATIONS
  // ============================================================================

  private static calculateOMReadiness(audit: Partial<AuditData>): number {
    let score = 0;
    let maxScore = 0;

    // Trained staff (30 points)
    maxScore += 30;
    if (audit.trainedOMStaffPresent) {
      const staffCount = audit.trainedOMStaffCount || 0;
      score += Math.min(30, staffCount * 5); // 5 points per trained staff, max 30
    }

    // Preventive maintenance schedule (25 points)
    maxScore += 25;
    if (audit.preventiveMaintenanceScheduleDocumented) score += 25;

    // Spare parts availability (20 points)
    maxScore += 20;
    if (audit.sparepartsAvailableForCriticalSystems) score += 20;

    // Service frequency (15 points)
    maxScore += 15;
    const frequency = audit.powerSystemsServiceFrequency;
    if (frequency === 'monthly') score += 15;
    else if (frequency === 'quarterly') score += 10;
    else if (frequency === 'annually') score += 5;

    // Staff skills rating (10 points)
    maxScore += 10;
    score += Math.min(10, ((audit.omStaffSkillsRating || 0) / 5) * 10);

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  private static calculateMaintenanceCompliance(audit: Partial<AuditData>): 'compliant' | 'partial' | 'non_compliant' {
    const omScore = this.calculateOMReadiness(audit);
    
    if (omScore >= 80) return 'compliant';
    if (omScore >= 50) return 'partial';
    return 'non_compliant';
  }

  // ============================================================================
  // ENVIRONMENTAL & SAFETY CALCULATIONS
  // ============================================================================

  private static calculateWasteManagementScore(audit: Partial<AuditData>): number {
    let score = 0;
    let maxScore = 0;

    // Waste segregation (25 points)
    maxScore += 25;
    if (audit.wasteSegmentationSystem) score += 25;

    // Documented disposal method (20 points)
    maxScore += 20;
    if (audit.wasteDisposalMethod && audit.wasteDisposalMethod.trim().length > 0) score += 20;

    // Air quality monitoring (20 points)
    maxScore += 20;
    if (audit.airQualityMonitoringSystem) score += 20;

    // Hazardous materials storage (20 points)
    maxScore += 20;
    if (audit.hazardousMaterialsStorageSafe) score += 20;

    // PPE availability (15 points)
    maxScore += 15;
    if (audit.adequatePPEAvailable) score += 15;

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  // ============================================================================
  // CARBON MARKET READINESS CALCULATIONS
  // ============================================================================

  private static calculateCarbonMarketReadiness(audit: Partial<AuditData>): 'ready' | 'near_ready' | 'not_ready' {
    let readyPoints = 0;
    let maxPoints = 0;

    // Historical records (25)
    maxPoints += 25;
    if (audit.historicalEnergyGHGRecords) readyPoints += 25;

    // MRV systems (25)
    maxPoints += 25;
    if (audit.mrvSystemsInPlace) readyPoints += 25;

    // Carbon credit interest (20)
    maxPoints += 20;
    if (audit.carbonCreditSchemeInterest) readyPoints += 20;

    // GHG reduction potential (30)
    maxPoints += 30;
    if (audit.estimatedGHGReductionPotentialTonnesCO2 && audit.estimatedGHGReductionPotentialTonnesCO2 > 10) {
      readyPoints += 30;
    } else if (audit.renewableEnergyUpgradePotentials && audit.renewableEnergyUpgradePotentials.length > 0) {
      readyPoints += 15;
    }

    const percentage = (readyPoints / maxPoints) * 100;
    if (percentage >= 80) return 'ready';
    if (percentage >= 50) return 'near_ready';
    return 'not_ready';
  }

  private static calculateMRVReadiness(audit: Partial<AuditData>): 'ready' | 'near_ready' | 'not_ready' {
    let readyPoints = 0;
    let maxPoints = 0;

    // MRV systems in place (40)
    maxPoints += 40;
    if (audit.mrvSystemsInPlace) readyPoints += 40;

    // Historical records (30)
    maxPoints += 30;
    if (audit.historicalEnergyGHGRecords) readyPoints += 30;

    // Data collection (20)
    maxPoints += 20;
    if ((audit.equipmentInventory && audit.equipmentInventory.length > 0) || 
        (audit.lightingInventory && audit.lightingInventory.length > 0)) {
      readyPoints += 20;
    }

    // Photo documentation (10)
    maxPoints += 10;
    if (audit.photoDocumentationCompleted) readyPoints += 10;

    const percentage = (readyPoints / maxPoints) * 100;
    if (percentage >= 80) return 'ready';
    if (percentage >= 50) return 'near_ready';
    return 'not_ready';
  }

  // ============================================================================
  // COLD CHAIN & CRITICAL SERVICES
  // ============================================================================

  private static calculateColdChainReadiness(audit: Partial<AuditData>): 'stable' | 'at_risk' | 'compromised' {
    const gridUptime = this.calculateGridUptimePercentage(audit);
    const omScore = this.calculateOMReadiness(audit);
    const backupAvailable = audit.backupPowerSources && audit.backupPowerSources.trim().length > 0;
    const energyResilience = audit.energyResilienceScore === 'high';

    const stability = (gridUptime >= 90 ? 25 : 10) + 
                     (omScore >= 70 ? 25 : 10) + 
                     (backupAvailable ? 25 : 10) + 
                     (energyResilience ? 25 : 10);

    if (stability >= 90) return 'stable';
    if (stability >= 50) return 'at_risk';
    return 'compromised';
  }

  // ============================================================================
  // INFRASTRUCTURE POTENTIAL CALCULATIONS
  // ============================================================================

  private static calculateRenewableUpgradePotential(audit: Partial<AuditData>): 'high' | 'medium' | 'low' {
    let potential = 0;

    if (audit.solarPVUpgradePotential) potential += 2;
    if (audit.hybridSystemUpgradePotential) potential += 2;
    if (audit.renewableEnergyUpgradePotentials && audit.renewableEnergyUpgradePotentials.length > 0) potential += 2;
    if (audit.prioritizedInterventionsLevel === 'high') potential += 1;

    if (potential >= 5) return 'high';
    if (potential >= 3) return 'medium';
    return 'low';
  }

  private static calculateInfrastructurePotential(audit: Partial<AuditData>): 'high' | 'medium' | 'low' {
    let potential = 0;

    if (audit.oxygenPlantFeasibility) potential += 2;
    if (audit.waste_to_energyFeasibility) potential += 2;
    if (audit.nearbyFacilitiesSharedEnergyBenefit) potential += 1;
    if (audit.additionalInfrastructurePotential && audit.additionalInfrastructurePotential.length > 0) potential += 1;

    if (potential >= 4) return 'high';
    if (potential >= 2) return 'medium';
    return 'low';
  }

  // ============================================================================
  // HOURS OF AUTONOMY
  // ============================================================================

  private static calculateHoursOfAutonomy(audit: Partial<AuditData>): number {
    const dieselCapacityKW = audit.dieselGeneratorCapacityKW || 
                            ((audit.dieselGeneratorCapacityKVA || 0) * 0.8); // Assume 0.8 power factor
    
    const estimatedLoadKW = this.calculateTotalElectricalLoad(audit);
    
    if (estimatedLoadKW === 0) return 0;

    // Assume typical fuel tank capacity ~1000 litres for tertiary facility
    // Calculate based on consumption rate and generator capacity
    const consumptionRate = audit.dieselFuelConsumptionRateLitresPerHour || 0;
    
    if (consumptionRate === 0) {
      // Estimate based on generator capacity (assume 0.2 L/kWh consumption)
      const hourlyConsumption = dieselCapacityKW * 0.2;
      return Math.round((1000 / hourlyConsumption) * 10) / 10;
    }

    return Math.round((1000 / consumptionRate) * 10) / 10;
  }
}

export default AuditIndicatorCalculator;
