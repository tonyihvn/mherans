

/**
 * Field Mapping Reference
 * Sync between Database (SQL), TypeScript Interface, and Indicator Configuration
 * This is the source of truth for all field mappings across the application
 */

/**
 * Complete field mapping showing:
 * - Database field name (SQL snake_case)
 * - TypeScript field name (camelCase in AuditData interface)
 * - Indicator config field name
 * - Data type
 * - Description
 */
export const FIELD_MAPPINGS = [
  // SECTION 1: FACILITY IDENTIFICATION
  {
    dbField: 'facility_name',
    tsField: 'facilityName',
    indicatorField: 'facilityName',
    type: 'string',
    description: 'Facility Name',
    section: 1
  },
  {
    dbField: 'hfr_id', // Note: Database doesn't have this yet, may need to add
    tsField: 'hfrId',
    indicatorField: 'hfrId',
    type: 'string',
    description: 'HFR ID',
    section: 1
  },
  {
    dbField: 'facility_type',
    tsField: 'facilityType',
    indicatorField: 'facilityType',
    type: 'string',
    description: 'Facility Type',
    section: 1
  },
  {
    dbField: 'facility_level', // Note: May need to add to database
    tsField: 'facilityLevel',
    indicatorField: 'facilityLevel',
    type: 'string',
    description: 'Facility Level (PRIMARY, SECONDARY, etc.)',
    section: 1
  },
  {
    dbField: 'location_state',
    tsField: 'locationState / state',
    indicatorField: 'state',
    type: 'string',
    description: 'State',
    section: 1
  },
  {
    dbField: 'location_zone',
    tsField: 'locationZone / lga',
    indicatorField: 'lga',
    type: 'string',
    description: 'Local Government Area',
    section: 1
  },
  {
    dbField: 'gps_latitude',
    tsField: 'gpsLatitude',
    indicatorField: 'gpsLatitude',
    type: 'number',
    description: 'GPS Latitude',
    section: 1
  },
  {
    dbField: 'gps_longitude',
    tsField: 'gpsLongitude',
    indicatorField: 'gpsLongitude',
    type: 'number',
    description: 'GPS Longitude',
    section: 1
  },
  {
    dbField: 'audit_date',
    tsField: 'auditDate',
    indicatorField: 'auditDate',
    type: 'string',
    description: 'Audit Date',
    section: 1
  },
  {
    dbField: 'focal_person_name',
    tsField: 'focalPersonName',
    indicatorField: 'focalPersonName',
    type: 'string',
    description: 'Focal Person Name',
    section: 1
  },

  // SECTION 2: ENERGY SYSTEMS
  {
    dbField: 'grid_uptime_hours_per_day',
    tsField: 'gridUptimeHoursPerDay',
    indicatorField: 'gridUptimeHoursPerDay',
    type: 'number',
    description: 'Grid Uptime (hours/day)',
    section: 2,
    featured: true
  },
  {
    dbField: 'grid_electricity_consumption_last_12_months_kwh',
    tsField: 'gridElectricityConsumptionLast12MonthsKWh',
    indicatorField: 'gridElectricityConsumptionLast12MonthsKWh',
    type: 'number',
    description: 'Grid Electricity (kWh)',
    section: 2
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'solarCapacityKWp',
    indicatorField: 'solarCapacityKWp',
    type: 'number',
    description: 'Solar Capacity (kWp)',
    section: 2,
    status: 'needs_db_field'
  },
  {
    dbField: 'solar_energy_generation_last_12_months_kwh',
    tsField: 'solarEnergyGenerationLast12MonthsKWh',
    indicatorField: 'solarProductionLast12MonthsKWh',
    type: 'number',
    description: 'Solar Production (kWh)',
    section: 2
  },
  {
    dbField: 'diesel_generator_capacity_kva',
    tsField: 'dieselGeneratorCapacityKVA',
    indicatorField: 'dieselGeneratorCapacityKVA',
    type: 'number',
    description: 'Generator Capacity (kVA)',
    section: 2
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'batteryStorageCapacityKWh',
    indicatorField: 'batteryStorageCapacityKWh',
    type: 'number',
    description: 'Battery Storage (kWh)',
    section: 2,
    status: 'needs_db_field'
  },
  {
    dbField: 'energy_resilience_score',
    tsField: 'energyResilienceScore',
    indicatorField: 'energyResilienceScore',
    type: 'string',
    description: 'Energy Resilience Score',
    section: 2,
    featured: true
  },

  // SECTION 3: WATER & SANITATION
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'totalWaterTanksCount',
    indicatorField: 'totalWaterTanksCount',
    type: 'number',
    description: 'Total Water Tanks',
    section: 3,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'waterTankCapacityM3Total',
    indicatorField: 'waterTankCapacityM3Total',
    type: 'number',
    description: 'Total Tank Capacity (m³)',
    section: 3,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'wasteWaterTreatmentType',
    indicatorField: 'wasteWaterTreatmentType',
    type: 'string',
    description: 'Waste Water Treatment Type',
    section: 3,
    status: 'needs_db_field'
  },
  {
    dbField: 'waste_disposal_method',
    tsField: 'wasteDisposalMethod / wasteDisposalMechanismType',
    indicatorField: 'wasteDisposalMechanismType',
    type: 'string',
    description: 'Waste Disposal Type',
    section: 3
  },

  // SECTION 4: OPERATIONS & COSTS
  {
    dbField: 'diesel_consumption_last_12_months_litres',
    tsField: 'dieselConsumptionLast12MonthsLitres',
    indicatorField: 'dieselConsumptionLast12MonthsLitres',
    type: 'number',
    description: 'Diesel Consumed (litres)',
    section: 4,
    featured: true
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'fuelCostNaira',
    indicatorField: 'fuelCostNaira',
    type: 'number',
    description: 'Fuel Cost (₦)',
    section: 4,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'operatingCostNaira',
    indicatorField: 'operatingCostNaira',
    type: 'number',
    description: 'Operating Cost (₦)',
    section: 4,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'maintenanceCostNaira',
    indicatorField: 'maintenanceCostNaira',
    type: 'number',
    description: 'Maintenance Cost (₦)',
    section: 4,
    status: 'needs_db_field'
  },
  {
    dbField: 'diesel_fuel_consumption_rate_litres_per_hour',
    tsField: 'dieselFuelConsumptionRateLitresPerHour',
    indicatorField: 'dieselFuelConsumptionRateLitresPerHour',
    type: 'number',
    description: 'Diesel Fuel Consumption Rate (litres/hour)',
    section: 4
  },
  {
    dbField: 'diesel_generator_operating_hours_per_day',
    tsField: 'dieselGeneratorOperatingHoursPerDay',
    indicatorField: 'dieselGeneratorOperatingHoursPerDay',
    type: 'number',
    description: 'Diesel Generator Operating Hours/Day',
    section: 4
  },

  // SECTION 5: STAFFING & SKILLS
  {
    dbField: 'trained_om_staff_count',
    tsField: 'trainedOMStaffCount',
    indicatorField: 'trainedOMStaffCount',
    type: 'number',
    description: 'Trained O&M Staff Count',
    section: 5,
    featured: true
  },
  {
    dbField: 'om_staff_skills_rating',
    tsField: 'omStaffSkillsRating',
    indicatorField: 'omStaffSkillsRating',
    type: 'number',
    description: 'O&M Staff Skills Rating (1-5)',
    section: 5
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'biomedicalWasteTrainingComplete',
    indicatorField: 'biomedicalWasteTrainingComplete',
    type: 'boolean',
    description: 'Biomedical Waste Staff Trained',
    section: 5,
    status: 'needs_db_field'
  },

  // SECTION 6: INFRASTRUCTURE CONDITIONS
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'buildingConditionRating',
    indicatorField: 'buildingConditionRating',
    type: 'number',
    description: 'Building Condition (1-5)',
    section: 6,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'roofConditionRating',
    indicatorField: 'roofConditionRating',
    type: 'number',
    description: 'Roof Condition (1-5)',
    section: 6,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'wallsConditionRating',
    indicatorField: 'wallsConditionRating',
    type: 'number',
    description: 'Walls Condition (1-5)',
    section: 6,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'floorsConditionRating',
    indicatorField: 'floorsConditionRating',
    type: 'number',
    description: 'Floors Condition (1-5)',
    section: 6,
    status: 'needs_db_field'
  },

  // SECTION 7: MEDICAL EQUIPMENT & SERVICES
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'operationalEquipmentCount',
    indicatorField: 'operationalEquipmentCount',
    type: 'number',
    description: 'Operational Equipment Count',
    section: 7,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'totalEquipmentCount',
    indicatorField: 'totalEquipmentCount',
    type: 'number',
    description: 'Total Equipment Count',
    section: 7,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'equipmentUtilizationRate',
    indicatorField: 'equipmentUtilizationRate',
    type: 'number',
    description: 'Equipment Utilization Rate (%)',
    section: 7,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'bedOccupancyRate',
    indicatorField: 'bedOccupancyRate',
    type: 'number',
    description: 'Bed Occupancy Rate (%)',
    section: 7,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'outpatientAttendancePerDay',
    indicatorField: 'outpatientAttendancePerDay',
    type: 'number',
    description: 'Outpatient Attendance/Day',
    section: 7,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'deliveriesPerMonth',
    indicatorField: 'deliveriesPerMonth',
    type: 'number',
    description: 'Deliveries Per Month',
    section: 7,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'emergencyCasesPerMonth',
    indicatorField: 'emergencyCasesPerMonth',
    type: 'number',
    description: 'Emergency Cases/Month',
    section: 7,
    status: 'needs_db_field'
  },

  // SECTION 8: COMPLIANCE
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'hasMedicinesStock',
    indicatorField: 'hasMedicinesStock',
    type: 'boolean',
    description: 'Has Medicines Stock',
    section: 8,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'hasVaccinesStock',
    indicatorField: 'hasVaccinesStock',
    type: 'boolean',
    description: 'Has Vaccines Stock',
    section: 8,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'complianceWithStandards',
    indicatorField: 'complianceWithStandards',
    type: 'number',
    description: 'Compliance with Standards (%)',
    section: 9,
    status: 'needs_db_field'
  },
  {
    dbField: null, // NEW FIELD - Not yet in database
    tsField: 'auditScore',
    indicatorField: 'auditScore',
    type: 'number',
    description: 'Overall Audit Score (%)',
    section: 9,
    featured: true,
    status: 'needs_db_field'
  }
];

/**
 * Quick lookup functions for field mapping
 */
export const FieldMappingUtils = {
  /**
   * Get TypeScript field name from database field name
   */
  getTsFieldFromDb(dbField: string): string | undefined {
    const mapping = FIELD_MAPPINGS.find(m => m.dbField === dbField);
    return mapping?.tsField;
  },

  /**
   * Get database field name from TypeScript field name
   */
  getDbFieldFromTs(tsField: string): string | undefined {
    const mapping = FIELD_MAPPINGS.find(m => m.tsField?.includes(tsField));
    return mapping?.dbField || undefined;
  },

  /**
   * Get all fields that need to be added to database
   */
  getMissingDbFields() {
    return FIELD_MAPPINGS.filter(m => m.dbField === null || m.status === 'needs_db_field')
      .map(m => ({
        tsField: m.tsField,
        indicatorField: m.indicatorField,
        type: m.type,
        description: m.description
      }));
  },

  /**
   * Get all featured indicator fields
   */
  getFeaturedFields() {
    return FIELD_MAPPINGS.filter(m => m.featured)
      .map(m => ({
        tsField: m.tsField,
        description: m.description,
        section: m.section
      }));
  },

  /**
   * Get fields by section
   */
  getFieldsBySection(section: number) {
    return FIELD_MAPPINGS.filter(m => m.section === section);
  }
};
