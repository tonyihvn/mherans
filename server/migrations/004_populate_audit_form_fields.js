import pool from '../config/database.js';

const formFields = [
  // Section 1: Facility Identification
  { id: 'facility_name', name: 'facilityName', label: 'Facility Name', type: 'text', section: 1, required: true },
  { id: 'facility_type', name: 'facilityType', label: 'Facility Type', type: 'select', section: 1, required: true },
  { id: 'location_state', name: 'locationState', label: 'State', type: 'select', section: 1, required: true },
  { id: 'location_zone', name: 'locationZone', label: 'Zone', type: 'text', section: 1, required: false },
  { id: 'gps_latitude', name: 'gpsLatitude', label: 'GPS Latitude', type: 'number', section: 1, required: false },
  { id: 'gps_longitude', name: 'gpsLongitude', label: 'GPS Longitude', type: 'number', section: 1, required: false },
  { id: 'audit_date', name: 'auditDate', label: 'Audit Date', type: 'date', section: 1, required: true },
  { id: 'focal_person_name', name: 'focalPersonName', label: 'Focal Person Name', type: 'text', section: 1, required: true },
  { id: 'focal_person_role', name: 'focalPersonRole', label: 'Focal Person Role', type: 'text', section: 1, required: true },
  { id: 'audit_team_members', name: 'auditTeamMembers', label: 'Audit Team Members', type: 'textarea', section: 1, required: false },
  { id: 'committee_observer_present', name: 'committeeObserverPresent', label: 'Committee Observer Present', type: 'checkbox', section: 1, required: false },

  // Section 2: Energy Access & Resilience
  { id: 'grid_connected', name: 'gridConnected', label: 'Grid Connected', type: 'checkbox', section: 2, required: true },
  { id: 'grid_uptime_hours_per_day', name: 'gridUptimeHoursPerDay', label: 'Grid Uptime (Hours/Day)', type: 'number', section: 2, required: false },
  { id: 'backup_power_sources', name: 'backupPowerSources', label: 'Backup Power Sources', type: 'textarea', section: 2, required: false },
  { id: 'hybrid_renewable_system_installed', name: 'hybridRenewableSystemInstalled', label: 'Hybrid Renewable System Installed', type: 'checkbox', section: 2, required: true },
  { id: 'hybrid_system_details', name: 'hybridSystemDetails', label: 'Hybrid System Details', type: 'textarea', section: 2, required: false },
  { id: 'major_outages_last_12_months', name: 'majorOutagesLast12Months', label: 'Major Outages Last 12 Months', type: 'checkbox', section: 2, required: true },
  { id: 'outage_frequency_and_duration', name: 'outageFrequencyAndDuration', label: 'Outage Frequency & Duration', type: 'textarea', section: 2, required: false },
  { id: 'emergency_energy_plan', name: 'emergencyEnergyPlan', label: 'Emergency Energy Plan', type: 'checkbox', section: 2, required: true },
  { id: 'energy_resilience_score', name: 'energyResilienceScore', label: 'Energy Resilience Score', type: 'select', section: 2, required: false },

  // Section 3: Electrical Load Inventory
  { id: 'equipment_list', name: 'equipmentInventory', label: 'Equipment List', type: 'object', section: 3, required: false },
  { id: 'lighting_inventory', name: 'lightingInventory', label: 'Lighting Inventory', type: 'object', section: 3, required: false },
  { id: 'total_installed_load_kw', name: 'totalInstalledLoadKW', label: 'Total Installed Load (kW)', type: 'number', section: 3, required: false },

  // Section 4: GHG Emissions Data
  { id: 'diesel_generator_make', name: 'dieselGeneratorMake', label: 'Diesel Generator Make', type: 'text', section: 4, required: false },
  { id: 'diesel_generator_serial', name: 'dieselGeneratorSerial', label: 'Diesel Generator Serial', type: 'text', section: 4, required: false },
  { id: 'diesel_generator_capacity_kva', name: 'dieselGeneratorCapacityKVA', label: 'Diesel Generator Capacity (kVA)', type: 'number', section: 4, required: false },
  { id: 'diesel_fuel_consumption_rate_litres_per_hour', name: 'dieselFuelConsumptionRateLitresPerHour', label: 'Diesel Fuel Consumption Rate (L/Hour)', type: 'number', section: 4, required: false },
  { id: 'diesel_generator_operating_hours_per_day', name: 'dieselGeneratorOperatingHoursPerDay', label: 'Diesel Generator Operating Hours/Day', type: 'number', section: 4, required: false },
  { id: 'grid_electricity_consumption_last_12_months_kwh', name: 'gridElectricityConsumptionLast12MonthsKWh', label: 'Grid Electricity Consumption (Last 12 Months - kWh)', type: 'number', section: 4, required: false },
  { id: 'diesel_consumption_last_12_months_litres', name: 'dieselConsumptionLast12MonthsLitres', label: 'Diesel Consumption (Last 12 Months - Litres)', type: 'number', section: 4, required: false },
  { id: 'solar_energy_generation_last_12_months_kwh', name: 'solarEnergyGenerationLast12MonthsKWh', label: 'Solar Energy Generation (Last 12 Months - kWh)', type: 'number', section: 4, required: false },
  { id: 'waste_incineration_present', name: 'wasteIncinerationPresent', label: 'Waste Incineration Present', type: 'checkbox', section: 4, required: true },
  { id: 'waste_incineration_volume_monthly_kg', name: 'wasteIncinerationVolumeMonthlyKg', label: 'Waste Incineration Volume (Monthly - kg)', type: 'number', section: 4, required: false },

  // Section 5: O&M Readiness
  { id: 'trained_om_staff_present', name: 'trainedOMStaffPresent', label: 'Trained O&M Staff Present', type: 'checkbox', section: 5, required: true },
  { id: 'trained_om_staff_count', name: 'trainedOMStaffCount', label: 'Trained O&M Staff Count', type: 'number', section: 5, required: false },
  { id: 'preventive_maintenance_schedule_documented', name: 'preventiveMaintenanceScheduleDocumented', label: 'Preventive Maintenance Schedule Documented', type: 'checkbox', section: 5, required: true },
  { id: 'sparepartsavailable_for_critical_systems', name: 'sparepartsAvailableForCriticalSystems', label: 'Spare Parts Available for Critical Systems', type: 'checkbox', section: 5, required: true },
  { id: 'power_systems_service_frequency', name: 'powerSystemsServiceFrequency', label: 'Power Systems Service Frequency', type: 'select', section: 5, required: false },
  { id: 'om_staff_skills_rating', name: 'omStaffSkillsRating', label: 'O&M Staff Skills Rating (1-5)', type: 'number', section: 5, required: false },

  // Section 6: Environmental & Social Safeguards
  { id: 'waste_segmentation_system', name: 'wasteSegmentationSystem', label: 'Waste Segmentation System', type: 'checkbox', section: 6, required: true },
  { id: 'waste_disposal_method', name: 'wasteDisposalMethod', label: 'Waste Disposal Method', type: 'text', section: 6, required: false },
  { id: 'air_quality_monitoring_system', name: 'airQualityMonitoringSystem', label: 'Air Quality Monitoring System', type: 'checkbox', section: 6, required: true },
  { id: 'hazardous_materials_storage_safe', name: 'hazardousMaterialsStorageSafe', label: 'Hazardous Materials Storage Safe', type: 'checkbox', section: 6, required: true },
  { id: 'adequate_ppe_available', name: 'adequatePPEAvailable', label: 'Adequate PPE Available', type: 'checkbox', section: 6, required: true },

  // Section 7: GHG Reduction & Energy Efficiency
  { id: 'renewable_energy_potentials', name: 'renewableEnergyUpgradePotentials', label: 'Renewable Energy Upgrade Potentials', type: 'textarea', section: 7, required: false },
  { id: 'obvious_inefficiencies', name: 'obviousInefficiencies', label: 'Obvious Inefficiencies', type: 'textarea', section: 7, required: false },
  { id: 'intervention_priorities', name: 'prioritizedInterventionsLevel', label: 'Intervention Priorities', type: 'select', section: 7, required: false },

  // Section 8: Carbon Market Readiness
  { id: 'historical_energy_ghg_records', name: 'historicalEnergyGHGRecords', label: 'Historical Energy/GHG Records', type: 'checkbox', section: 8, required: true },
  { id: 'mrv_system_present', name: 'mrvSystemsInPlace', label: 'MRV System Present', type: 'checkbox', section: 8, required: true },
  { id: 'carbon_credit_interest', name: 'carbonCreditSchemeInterest', label: 'Carbon Credit Scheme Interest', type: 'checkbox', section: 8, required: true },
  { id: 'carbon_market_remarks', name: 'carbonCreditRemarks', label: 'Carbon Market Remarks', type: 'textarea', section: 8, required: false },

  // Section 9: Environmental Scanning
  { id: 'nearby_facilities_shared_interventions', name: 'nearbyFacilitiesSharedEnergyBenefit', label: 'Nearby Facilities Shared Interventions', type: 'checkbox', section: 9, required: true },
  { id: 'shared_interventions_details', name: 'nearbyFacilitiesRemarks', label: 'Shared Interventions Details', type: 'textarea', section: 9, required: false },
  { id: 'additional_infrastructure_potential', name: 'additionalInfrastructurePotential', label: 'Additional Infrastructure Potential', type: 'textarea', section: 9, required: false },

  // Section 10: Evidence Documents
  { id: 'evidence_documents', name: 'evidenceDocuments', label: 'Evidence Documents', type: 'object', section: 10, required: false }
];

export async function runMigration() {
  const connection = await pool.getConnection();

  try {
    console.log('🔄 Populating audit_form_fields table...');

    // Clear existing fields
    await connection.query('DELETE FROM audit_form_fields');

    // Insert all form fields
    let insertedCount = 0;
    for (const field of formFields) {
      try {
        await connection.query(
          `INSERT INTO audit_form_fields (id, fieldName, fieldLabel, fieldType, section, isRequired, sortOrder)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            field.id,
            field.name,
            field.label,
            field.type,
            field.section,
            field.required ? 1 : 0,
            insertedCount
          ]
        );
        insertedCount++;
      } catch (error) {
        console.error(`⚠️  Error inserting field ${field.id}:`, error.message);
      }
    }

    console.log(`✅ Populated ${insertedCount} audit form fields`);
    connection.release();
  } catch (error) {
    console.error('❌ Error in migration:', error.message);
    connection.release();
    throw error;
  }
}

export default runMigration;
