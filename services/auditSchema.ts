/**
 * Audit Data Schema
 * Defines all audit fields captured across 9 sections of auditform.md
 * Type-safe interface for form data and calculations
 * All facility indicators are derived from these audit values
 */

export interface EquipmentItem {
  id: string;
  name: string;
  make?: string;
  model?: string;
  quantity: number;
  ratedPowerKW: number;
  operatingHoursPerDay: number;
  backupPower: boolean;
}

export interface LightingItem {
  id: string;
  type: 'LED' | 'CFL' | 'Incandescent' | 'Other';
  quantity: number;
  wattage: number;
  operatingHoursPerDay: number;
}

export interface EvidenceDocument {
  id: string;
  title: string;
  documentType: 'photo' | 'report' | 'certificate' | 'receipt' | 'other';
  fileUrl: string;
  fileName: string;
  uploadedAt?: string;
  uploadedBy?: string;
  description?: string;
  section?: number; // Which section this evidence relates to
}

export interface SignOff {
  id: string;
  role: 'lead_auditor' | 'state_auditor' | 'validator' | 'facility_manager';
  name: string;
  email: string;
  designation?: string;
  signedAt?: string;
  signatureUrl?: string; // URL to digital signature or scanned signature
  comments?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AuditData {
  id?: string;
  facility_id?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'submitted' | 'reviewed' | 'approved';

  // Section 1: Facility Identification
  facilityName: string;
  hfrId?: string; // HFR ID
  facilityType: 'teaching' | 'fmc' | 'secondary' | 'primary' | 'private' | 'faith_based';
  facilityLevel?: string; // Facility Level (PRIMARY, SECONDARY, etc.)
  locationState: string;
  state?: string; // State (same as locationState)
  locationZone: string;
  lga?: string; // Local Government Area
  gpsLatitude: number;
  gpsLongitude: number;
  auditDate: string;
  focalPersonName: string;
  focalPersonRole: string;
  auditTeamMembers: string;
  committeeObserverPresent: boolean;

  // Section 2: Energy Access & Resilience Profile
  gridConnected: boolean;
  gridUptimeHoursPerDay: number;
  backupPowerSources: string;
  hybridRenewableSystemInstalled: boolean;
  hybridSystemType?: 'solar' | 'hybrid_solar_diesel' | 'hybrid_solar_grid' | 'wind' | 'other';
  hybridSystemDetails: string;
  hybridSystemCapacityKW?: number;
  solarCapacityKWp?: number; // Solar Capacity in KWp
  batteryStorageCapacityKWh?: number; // Battery Storage capacity
  majorOutagesLast12Months: boolean;
  outageFrequencyPerYear?: number;
  averageOutageDurationHours?: number;
  emergencyEnergyPlan: boolean;
  emergencyEnergyPlanDetails?: string;
  energyResilienceScore: 'high' | 'medium' | 'low';

  // Section 3: Electrical Load Inventory & Water/Sanitation
  equipmentInventory: EquipmentItem[];
  lightingInventory: LightingItem[];
  totalInstalledLoadKW?: number;
  totalWaterTanksCount?: number; // Total Water Tanks
  waterTankCapacityM3Total?: number; // Total Tank Capacity (m³)
  wasteWaterTreatmentType?: string; // Waste Water Treatment Type
  wasteDisposalMechanismType?: string; // Waste Disposal Type

  // Section 4: GHG Emissions Data Collection
  dieselGeneratorMake: string;
  dieselGeneratorModel?: string;
  dieselGeneratorSerial: string;
  dieselGeneratorCapacityKVA: number;
  dieselGeneratorCapacityKW?: number;
  dieselFuelConsumptionRateLitresPerHour: number;
  dieselGeneratorOperatingHoursPerDay: number;
  gridElectricityConsumptionLast12MonthsKWh: number;
  dieselConsumptionLast12MonthsLitres: number;
  solarEnergyGenerationLast12MonthsKWh?: number;
  fuelCostNaira?: number; // Fuel Cost
  operatingCostNaira?: number; // Operating Cost
  maintenanceCostNaira?: number; // Maintenance Cost
  wasteIncinerationPresent: boolean;
  wasteIncinerationVolumeMonthlyKg?: number;
  wasteIncinerationFuel?: string;
  waterPumpRatedPowerKW?: number;
  waterPumpOperatingHoursPerDay?: number;
  oxygenPlantPresentAndOperating?: boolean;
  coldChainEquipmentEnergyUseKW?: number;

  // Section 5: O&M Readiness Assessment
  trainedOMStaffPresent: boolean;
  trainedOMStaffCount: number;
  omStaffTrainingType?: string;
  omStaffCertification?: string;
  preventiveMaintenanceScheduleDocumented: boolean;
  maintenanceScheduleFrequency?: string;
  sparepartsAvailableForCriticalSystems: boolean;
  sparepartsInventoryDetails?: string;
  powerSystemsServiceFrequency: 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  lastMaintenanceDate?: string;
  omStaffSkillsRating: number; // 1-5 scale
  biomedicalWasteTrainingComplete?: boolean; // Biomedical Waste Staff Trained

  // Section 6: Environmental & Social Safeguards
  wasteSegmentationSystem: boolean;
  wasteDisposalMethod: string;
  airQualityMonitoringSystem: boolean;
  emissionStandardsCompliance?: boolean;
  hazardousMaterialsStorageSafe: boolean;
  hazardousMaterialsStorageDetails?: string;
  adequatePPEAvailable: boolean;
  ppeInventoryDetails?: string;
  ehs_ComplianceStatus?: 'compliant' | 'minor_defects' | 'major_defects';

  // Section 6b: Infrastructure Conditions
  buildingConditionRating?: number; // Building Condition (1-5)
  roofConditionRating?: number; // Roof Condition (1-5)
  wallsConditionRating?: number; // Walls Condition (1-5)
  floorsConditionRating?: number; // Floors Condition (1-5)

  // Section 7: GHG Reduction & Energy Efficiency
  renewableEnergyUpgradePotentials: string;
  solarPVUpgradePotential?: boolean;
  hybridSystemUpgradePotential?: boolean;
  otherRenewableUpgradePotential?: string;
  obviousInefficiencies: string;
  obviousInefficienciesSpecification: string;
  prioritizedInterventionsLevel: 'high' | 'medium' | 'low';
  estimatedGHGReductionPotentialTonnesCO2?: number;

  // Section 7b: Medical Equipment & Services
  operationalEquipmentCount?: number; // Operational Equipment Count
  totalEquipmentCount?: number; // Total Equipment Count
  equipmentUtilizationRate?: number; // Equipment Utilization Rate (%)
  bedOccupancyRate?: number; // Bed Occupancy Rate (%)
  outpatientAttendancePerDay?: number; // Outpatient Attendance/Day
  deliveriesPerMonth?: number; // Deliveries Per Month
  emergencyCasesPerMonth?: number; // Emergency Cases/Month

  // Section 8: Carbon Market Readiness
  historicalEnergyGHGRecords: boolean;
  recordsRetentionYears?: number;
  mrvSystemsInPlace: boolean;
  mrvSystemDetails?: string;
  carbonCreditSchemeInterest: boolean;
  preferredCarbonScheme?: string;
  carbonCreditRemarks: string;

  // Section 9: Environmental Scanning
  nearbyFacilitiesSharedEnergyBenefit: boolean;
  nearbyFacilitiesCount?: number;
  nearbyFacilitiesRemarks: string;
  additionalInfrastructurePotential: string;
  oxygenPlantFeasibility?: boolean;
  waste_to_energyFeasibility?: boolean;

  // Section 9b: Security & Compliance
  hasMedicinesStock?: boolean; // Has Medicines Stock
  hasVaccinesStock?: boolean; // Has Vaccines Stock
  complianceWithStandards?: number; // Compliance with Standards (%)
  auditScore?: number; // Overall Audit Score (%)

  // Section 10: Evidence Documents
  evidenceDocuments?: EvidenceDocument[];
  photoDocumentationCompleted?: boolean;
  photoDocumentationCount?: number;
  photoStorageLocation?: string;

  // Section 11: Sign-offs & Approvals
  signOffs?: SignOff[];
  auditCompletionDate?: string;
  auditApprovalStatus?: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  overallAuditComments?: string;

  // Completion info & Sign-off
  leadAuditorName: string;
  leadAuditorEmail?: string;
  ghgAnalystName: string;
  ghgAnalystEmail?: string;
}

/**
 * Create empty audit data object with default values
 */
export const createEmptyAuditData = (facilityId: string): Partial<AuditData> => ({
  facility_id: facilityId,
  status: 'draft',
  createdAt: new Date().toISOString(),
  
  // Section 1
  facilityName: '',
  facilityType: 'teaching',
  locationState: '',
  locationZone: '',
  gpsLatitude: 0,
  gpsLongitude: 0,
  auditDate: new Date().toISOString().split('T')[0],
  focalPersonName: '',
  focalPersonRole: '',
  auditTeamMembers: '',
  committeeObserverPresent: false,
  
  // Section 2
  gridConnected: false,
  gridUptimeHoursPerDay: 0,
  backupPowerSources: '',
  hybridRenewableSystemInstalled: false,
  hybridSystemDetails: '',
  majorOutagesLast12Months: false,
  emergencyEnergyPlan: false,
  energyResilienceScore: 'medium',
  
  // Section 3
  equipmentInventory: [],
  lightingInventory: [],
  
  // Section 4
  dieselGeneratorMake: '',
  dieselGeneratorSerial: '',
  dieselGeneratorCapacityKVA: 0,
  dieselFuelConsumptionRateLitresPerHour: 0,
  dieselGeneratorOperatingHoursPerDay: 0,
  gridElectricityConsumptionLast12MonthsKWh: 0,
  dieselConsumptionLast12MonthsLitres: 0,
  wasteIncinerationPresent: false,
  
  // Section 5
  trainedOMStaffPresent: false,
  trainedOMStaffCount: 0,
  preventiveMaintenanceScheduleDocumented: false,
  sparepartsAvailableForCriticalSystems: false,
  powerSystemsServiceFrequency: 'quarterly',
  omStaffSkillsRating: 3,
  
  // Section 6
  wasteSegmentationSystem: false,
  wasteDisposalMethod: '',
  airQualityMonitoringSystem: false,
  hazardousMaterialsStorageSafe: false,
  adequatePPEAvailable: false,
  
  // Section 7
  renewableEnergyUpgradePotentials: '',
  obviousInefficiencies: '',
  obviousInefficienciesSpecification: '',
  prioritizedInterventionsLevel: 'medium',
  
  // Section 8
  historicalEnergyGHGRecords: false,
  mrvSystemsInPlace: false,
  carbonCreditSchemeInterest: false,
  carbonCreditRemarks: '',
  
  // Section 9
  nearbyFacilitiesSharedEnergyBenefit: false,
  nearbyFacilitiesRemarks: '',
  additionalInfrastructurePotential: '',
  
  // Section 10
  evidenceDocuments: [],
  photoDocumentationCompleted: false,
  
  // Section 11
  signOffs: [],
  auditCompletionDate: new Date().toISOString().split('T')[0],
  auditApprovalStatus: 'pending',
  overallAuditComments: '',
  
  // Completion
  leadAuditorName: '',
  ghgAnalystName: ''
});

/**
 * Field definitions for form UI generation
 * Maps field names to labels, types, and sections
 */
export const auditFieldDefinitions = {
  // Section 1: General Information
  facilityName: { label: 'Facility Name', type: 'string', section: 1 },
  hfrId: { label: 'HFR ID', type: 'string', section: 1 },
  facilityLevel: { label: 'Facility Level', type: 'string', section: 1 },
  state: { label: 'State', type: 'string', section: 1 },
  lga: { label: 'Local Government Area', type: 'string', section: 1 },
  
  // Section 2: Energy Systems
  gridUptimeHoursPerDay: { label: 'Grid Uptime (hours/day)', type: 'number', section: 2 },
  gridElectricityConsumptionLast12MonthsKWh: { label: 'Grid Electricity (kWh)', type: 'number', section: 2 },
  solarCapacityKWp: { label: 'Solar Capacity (kWp)', type: 'number', section: 2 },
  solarProductionLast12MonthsKWh: { label: 'Solar Production (kWh)', type: 'number', section: 2 },
  dieselGeneratorCapacityKVA: { label: 'Generator Capacity (kVA)', type: 'number', section: 2 },
  batteryStorageCapacityKWh: { label: 'Battery Storage (kWh)', type: 'number', section: 2 },
  
  // Section 3: Water & Sanitation
  totalWaterTanksCount: { label: 'Total Water Tanks', type: 'number', section: 3 },
  waterTankCapacityM3Total: { label: 'Total Tank Capacity (m³)', type: 'number', section: 3 },
  wasteWaterTreatmentType: { label: 'Waste Water Treatment Type', type: 'string', section: 3 },
  wasteDisposalMechanismType: { label: 'Waste Disposal Type', type: 'string', section: 3 },
  
  // Section 4: Operations
  dieselConsumptionLast12MonthsLitres: { label: 'Diesel Consumed (litres)', type: 'number', section: 4 },
  fuelCostNaira: { label: 'Fuel Cost (₦)', type: 'number', section: 4 },
  operatingCostNaira: { label: 'Operating Cost (₦)', type: 'number', section: 4 },
  maintenanceCostNaira: { label: 'Maintenance Cost (₦)', type: 'number', section: 4 },
  
  // Section 5: Staffing & Skills
  trainedOMStaffCount: { label: 'Trained O&M Staff Count', type: 'number', section: 5 },
  omStaffSkillsRating: { label: 'O&M Staff Skills Rating (1-5)', type: 'number', section: 5 },
  biomedicalWasteTrainingComplete: { label: 'Biomedical Waste Staff Trained', type: 'boolean', section: 5 },
  
  // Section 6: Infrastructure
  buildingConditionRating: { label: 'Building Condition (1-5)', type: 'number', section: 6 },
  roofConditionRating: { label: 'Roof Condition (1-5)', type: 'number', section: 6 },
  wallsConditionRating: { label: 'Walls Condition (1-5)', type: 'number', section: 6 },
  floorsConditionRating: { label: 'Floors Condition (1-5)', type: 'number', section: 6 },
  
  // Section 7: Medical Equipment
  operationalEquipmentCount: { label: 'Operational Equipment Count', type: 'number', section: 7 },
  totalEquipmentCount: { label: 'Total Equipment Count', type: 'number', section: 7 },
  equipmentUtilizationRate: { label: 'Equipment Utilization Rate (%)', type: 'number', section: 7 },
  
  // Section 8: Services & Performance
  bedOccupancyRate: { label: 'Bed Occupancy Rate (%)', type: 'number', section: 8 },
  outpatientAttendancePerDay: { label: 'Outpatient Attendance/Day', type: 'number', section: 8 },
  deliveriesPerMonth: { label: 'Deliveries Per Month', type: 'number', section: 8 },
  emergencyCasesPerMonth: { label: 'Emergency Cases/Month', type: 'number', section: 8 },
  
  // Section 9: Security & Compliance
  hasMedicinesStock: { label: 'Has Medicines Stock', type: 'boolean', section: 9 },
  hasVaccinesStock: { label: 'Has Vaccines Stock', type: 'boolean', section: 9 },
  complianceWithStandards: { label: 'Compliance with Standards (%)', type: 'number', section: 9 },
  auditScore: { label: 'Overall Audit Score (%)', type: 'number', section: 9 }
};
