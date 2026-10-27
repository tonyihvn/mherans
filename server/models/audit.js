import pool from '../config/database.js';
import { randomUUID } from 'crypto';

// Transform snake_case database fields to camelCase for frontend
const transformAuditToFrontend = (auditData) => {
  if (!auditData) return null;

  const snakeToCamelMap = {
    'facility_name': 'facilityName',
    'facility_type': 'facilityType',
    'location_state': 'locationState',
    'location_zone': 'locationZone',
    'gps_latitude': 'gpsLatitude',
    'gps_longitude': 'gpsLongitude',
    'audit_date': 'auditDate',
    'focal_person_name': 'focalPersonName',
    'focal_person_role': 'focalPersonRole',
    'audit_team_members': 'auditTeamMembers',
    'committee_observer_present': 'committeeObserverPresent',
    'grid_connected': 'gridConnected',
    'grid_uptime_hours_per_day': 'gridUptimeHoursPerDay',
    'backup_power_sources': 'backupPowerSources',
    'hybrid_renewable_system_installed': 'hybridRenewableSystemInstalled',
    'hybrid_system_details': 'hybridSystemDetails',
    'major_outages_last_12_months': 'majorOutagesLast12Months',
    'outage_frequency_and_duration': 'outageFrequencyAndDuration',
    'emergency_energy_plan': 'emergencyEnergyPlan',
    'energy_resilience_score': 'energyResilienceScore',
    'diesel_generator_make': 'dieselGeneratorMake',
    'diesel_generator_serial': 'dieselGeneratorSerial',
    'diesel_generator_capacity_kva': 'dieselGeneratorCapacityKVA',
    'diesel_fuel_consumption_rate_litres_per_hour': 'dieselFuelConsumptionRateLitresPerHour',
    'diesel_generator_operating_hours_per_day': 'dieselGeneratorOperatingHoursPerDay',
    'grid_electricity_consumption_last_12_months_kwh': 'gridElectricityConsumptionLast12MonthsKWh',
    'diesel_consumption_last_12_months_litres': 'dieselConsumptionLast12MonthsLitres',
    'solar_energy_generation_last_12_months_kwh': 'solarEnergyGenerationLast12MonthsKWh',
    'waste_incineration_present': 'wasteIncinerationPresent',
    'waste_incineration_volume_monthly_kg': 'wasteIncinerationVolumeMonthlyKg',
    'trained_om_staff_present': 'trainedOMStaffPresent',
    'trained_om_staff_count': 'trainedOMStaffCount',
    'preventive_maintenance_schedule_documented': 'preventiveMaintenanceScheduleDocumented',
    'sparepartsavailable_for_critical_systems': 'sparepartsAvailableForCriticalSystems',
    'power_systems_service_frequency': 'powerSystemsServiceFrequency',
    'om_staff_skills_rating': 'omStaffSkillsRating',
    'waste_segmentation_system': 'wasteSegmentationSystem',
    'waste_disposal_method': 'wasteDisposalMethod',
    'air_quality_monitoring_system': 'airQualityMonitoringSystem',
    'hazardous_materials_storage_safe': 'hazardousMaterialsStorageSafe',
    'adequate_ppe_available': 'adequatePPEAvailable',
    'section_room_name': 'sectionRoomName',
    'equipment_list': 'equipmentList',
    'lighting_inventory': 'lightingInventory',
    'renewable_energy_potentials': 'renewableEnergyPotentials',
    'obvious_inefficiencies': 'obviousInefficiencies',
    'intervention_priorities': 'interventionPriorities',
    'historical_energy_ghg_records': 'historicalEnergyGHGRecords',
    'mrv_system_present': 'mrvSystemPresent',
    'carbon_credit_interest': 'carbonCreditInterest',
    'carbon_market_remarks': 'carbonMarketRemarks',
    'nearby_facilities_shared_interventions': 'nearbyFacilitiesSharedInterventions',
    'shared_interventions_details': 'sharedInterventionsDetails',
    'additional_infrastructure_potential': 'additionalInfrastructurePotential',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    'facility_id': 'facilityId',
    'audit_period_id': 'auditPeriodId'
  };

  const transformed = {};
  Object.entries(auditData).forEach(([key, value]) => {
    const camelKey = snakeToCamelMap[key] || key;
    // Parse JSON fields back to objects
    if ((key === 'equipment_list' || key === 'lighting_inventory' ||
         key === 'renewable_energy_potentials') && typeof value === 'string') {
      try {
        transformed[camelKey] = JSON.parse(value);
      } catch {
        transformed[camelKey] = value;
      }
    } else {
      transformed[camelKey] = value;
    }
  });

  return transformed;
};

/**
 * Get all audits
 * Returns all audit records with individual fields, converted to camelCase
 */
export const getAudits = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM audits ORDER BY created_at DESC');
    connection.release();
    return rows.map(transformAuditToFrontend);
  } catch (error) {
    console.error('Error fetching audits:', error);
    throw error;
  }
};

/**
 * Get audit by facility ID
 * Returns the most recent audit for a facility, converted to camelCase
 * Handles both direct facility_id match and hfr_id lookup
 */
export const getAuditByFacilityId = async (facilityId) => {
  try {
    const connection = await pool.getConnection();

    // First try direct facility_id match
    let [rows] = await connection.query(
      'SELECT * FROM audits WHERE facility_id = ? ORDER BY created_at DESC LIMIT 1',
      [facilityId]
    );

    // If not found, try looking up by hfr_id in facilities table
    if (rows.length === 0) {
      const [facilities] = await connection.query(
        'SELECT id FROM facilities WHERE hfr_id = ? LIMIT 1',
        [facilityId]
      );

      if (facilities.length > 0) {
        const actualFacilityId = facilities[0].id;
        [rows] = await connection.query(
          'SELECT * FROM audits WHERE facility_id = ? ORDER BY created_at DESC LIMIT 1',
          [actualFacilityId]
        );
      }
    }

    connection.release();
    if (rows.length === 0) return null;
    return transformAuditToFrontend(rows[0]);
  } catch (error) {
    console.error('Error fetching audit:', error);
    throw error;
  }
};

/**
 * Get audit by ID
 * Returns a single audit record by its ID
 */
export const getAuditById = async (auditId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM audits WHERE id = ? LIMIT 1',
      [auditId]
    );
    connection.release();
    if (rows.length === 0) return null;
    return transformAuditToFrontend(rows[0]);
  } catch (error) {
    console.error('Error fetching audit by ID:', error);
    throw error;
  }
};

/**
 * Save new audit - inserts into database with all individual fields
 * Saves all 57+ audit fields as individual columns
 * Structure: { facilityId, ...auditFields }
 */
export const saveAudit = async (facilityId, auditData) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const auditId = randomUUID();
    
    // Build dynamic query with all audit fields
    const allowedFields = [
      // Core fields
      'facility_id',

      // Section 1: Facility Identification
      'facility_name', 'facility_type', 'location_state', 'location_zone',
      'gps_latitude', 'gps_longitude', 'audit_date', 'focal_person_name',
      'focal_person_role', 'audit_team_members', 'committee_observer_present',
      
      // Section 2: Energy Access
      'grid_connected', 'grid_uptime_hours_per_day', 'backup_power_sources',
      'hybrid_renewable_system_installed', 'hybrid_system_details', 'major_outages_last_12_months',
      'outage_frequency_and_duration', 'emergency_energy_plan', 'energy_resilience_score',
      
      // Section 3: Electrical Load Inventory
      'section_room_name', 'equipment_list', 'lighting_inventory',
      
      // Section 4: GHG Emissions
      'diesel_generator_make', 'diesel_generator_serial', 'diesel_generator_capacity_kva',
      'diesel_fuel_consumption_rate_litres_per_hour', 'diesel_generator_operating_hours_per_day',
      'grid_electricity_consumption_last_12_months_kwh', 'diesel_consumption_last_12_months_litres',
      'solar_energy_generation_last_12_months_kwh',
      'waste_incineration_present', 'waste_incineration_volume_monthly_kg',
      
      // Section 5: O&M Readiness
      'trained_om_staff_present', 'trained_om_staff_count', 'preventive_maintenance_schedule_documented',
      'sparepartsavailable_for_critical_systems', 'power_systems_service_frequency', 'om_staff_skills_rating',
      
      // Section 6: Environmental & Social
      'waste_segmentation_system', 'waste_disposal_method', 'air_quality_monitoring_system',
      'hazardous_materials_storage_safe', 'adequate_ppe_available',
      
      // Section 7: GHG Reduction & Energy Efficiency
      'renewable_energy_potentials', 'obvious_inefficiencies', 'intervention_priorities',
      
      // Section 8: Carbon Market Readiness
      'historical_energy_ghg_records', 'mrv_system_present', 'carbon_credit_interest', 'carbon_market_remarks',
      
      // Section 9: Environmental Scanning
      'nearby_facilities_shared_interventions', 'shared_interventions_details', 'additional_infrastructure_potential'
    ];

    // Map camelCase from frontend to snake_case for database
    const fieldMapping = {
      'facilityName': 'facility_name',
      'facilityType': 'facility_type',
      'locationState': 'location_state',
      'locationZone': 'location_zone',
      'gpsLatitude': 'gps_latitude',
      'gpsLongitude': 'gps_longitude',
      'auditDate': 'audit_date',
      'focalPersonName': 'focal_person_name',
      'focalPersonRole': 'focal_person_role',
      'auditTeamMembers': 'audit_team_members',
      'committeeObserverPresent': 'committee_observer_present',
      'gridConnected': 'grid_connected',
      'gridUptimeHoursPerDay': 'grid_uptime_hours_per_day',
      'backupPowerSources': 'backup_power_sources',
      'hybridRenewableSystemInstalled': 'hybrid_renewable_system_installed',
      'hybridSystemDetails': 'hybrid_system_details',
      'majorOutagesLast12Months': 'major_outages_last_12_months',
      'outageFrequencyAndDuration': 'outage_frequency_and_duration',
      'emergencyEnergyPlan': 'emergency_energy_plan',
      'energyResilienceScore': 'energy_resilience_score',
      'dieselGeneratorMake': 'diesel_generator_make',
      'dieselGeneratorSerial': 'diesel_generator_serial',
      'dieselGeneratorCapacityKVA': 'diesel_generator_capacity_kva',
      'dieselFuelConsumptionRateLitresPerHour': 'diesel_fuel_consumption_rate_litres_per_hour',
      'dieselGeneratorOperatingHoursPerDay': 'diesel_generator_operating_hours_per_day',
      'gridElectricityConsumptionLast12MonthsKWh': 'grid_electricity_consumption_last_12_months_kwh',
      'dieselConsumptionLast12MonthsLitres': 'diesel_consumption_last_12_months_litres',
      'solarEnergyGenerationLast12MonthsKWh': 'solar_energy_generation_last_12_months_kwh',
      'wasteIncinerationPresent': 'waste_incineration_present',
      'wasteIncinerationVolumeMonthlyKg': 'waste_incineration_volume_monthly_kg',
      'trainedOMStaffPresent': 'trained_om_staff_present',
      'trainedOMStaffCount': 'trained_om_staff_count',
      'preventiveMaintenanceScheduleDocumented': 'preventive_maintenance_schedule_documented',
      'sparepartsAvailableForCriticalSystems': 'sparepartsavailable_for_critical_systems',
      'powerSystemsServiceFrequency': 'power_systems_service_frequency',
      'omStaffSkillsRating': 'om_staff_skills_rating',
      'wasteSegmentationSystem': 'waste_segmentation_system',
      'wasteDisposalMethod': 'waste_disposal_method',
      'airQualityMonitoringSystem': 'air_quality_monitoring_system',
      'hazardousMaterialsStorageSafe': 'hazardous_materials_storage_safe',
      'adequatePPEAvailable': 'adequate_ppe_available',
      
      // Section 3: Electrical Load Inventory
      'sectionRoomName': 'section_room_name',
      'equipmentList': 'equipment_list',
      'lightingInventory': 'lighting_inventory',
      
      // Section 7: GHG Reduction & Energy Efficiency
      'renewableEnergyPotentials': 'renewable_energy_potentials',
      'obviousInefficiencies': 'obvious_inefficiencies',
      'interventionPriorities': 'intervention_priorities',
      
      // Section 8: Carbon Market Readiness
      'historicalEnergyGHGRecords': 'historical_energy_ghg_records',
      'mrvSystemPresent': 'mrv_system_present',
      'carbonCreditInterest': 'carbon_credit_interest',
      'carbonMarketRemarks': 'carbon_market_remarks',
      
      // Section 9: Environmental Scanning
      'nearbyFacilitiesSharedInterventions': 'nearby_facilities_shared_interventions',
      'sharedInterventionsDetails': 'shared_interventions_details',
      'additionalInfrastructurePotential': 'additional_infrastructure_potential'
    };

    // Start with required fields
    const dbData = { id: auditId, facility_id: facilityId, created_at: new Date() };

    // Convert and add optional fields
    Object.entries(auditData).forEach(([key, value]) => {
      // Skip null/undefined values to use defaults, skip hfr_id (redundant with facility_id)
      if (value === null || value === undefined || value === '' || key === 'hfr_id') return;

      const dbKey = fieldMapping[key] || key;
      if (allowedFields.includes(dbKey)) {
        // Convert objects and arrays to JSON strings for storage
        if (typeof value === 'object') {
          dbData[dbKey] = JSON.stringify(value);
        } else {
          dbData[dbKey] = value;
        }
      }
    });

    // Build INSERT query dynamically
    const columns = Object.keys(dbData);
    const values = Object.values(dbData);
    const placeholders = columns.map(() => '?').join(', ');
    
    const query = `INSERT INTO audits (${columns.join(', ')}) VALUES (${placeholders})`;
    
    console.log(`[Audit Save] Inserting audit for facility ${facilityId}: Query = ${query}`);
    const result = await connection.query(query, values);
    console.log(`[Audit Save] Success: Audit ${auditId} saved for facility ${facilityId}`);
    
    return { 
      success: true,
      message: 'Audit saved successfully',
      id: auditId, 
      facility_id: facilityId, 
      ...auditData 
    };
  } catch (error) {
    console.error('Error saving audit:', error);
    throw new Error(`Failed to save audit: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Update existing audit - updates specific fields
 * Saves changes to individual fields
 */
export const updateAudit = async (auditId, auditData) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const fieldMapping = {
      'facilityName': 'facility_name',
      'facilityType': 'facility_type',
      'locationState': 'location_state',
      'locationZone': 'location_zone',
      'gpsLatitude': 'gps_latitude',
      'gpsLongitude': 'gps_longitude',
      'auditDate': 'audit_date',
      'focalPersonName': 'focal_person_name',
      'focalPersonRole': 'focal_person_role',
      'auditTeamMembers': 'audit_team_members',
      'committeeObserverPresent': 'committee_observer_present',
      'gridConnected': 'grid_connected',
      'gridUptimeHoursPerDay': 'grid_uptime_hours_per_day',
      'backupPowerSources': 'backup_power_sources',
      'hybridRenewableSystemInstalled': 'hybrid_renewable_system_installed',
      'hybridSystemDetails': 'hybrid_system_details',
      'majorOutagesLast12Months': 'major_outages_last_12_months',
      'outageFrequencyAndDuration': 'outage_frequency_and_duration',
      'emergencyEnergyPlan': 'emergency_energy_plan',
      'energyResilienceScore': 'energy_resilience_score',
      'dieselGeneratorMake': 'diesel_generator_make',
      'dieselGeneratorSerial': 'diesel_generator_serial',
      'dieselGeneratorCapacityKVA': 'diesel_generator_capacity_kva',
      'dieselFuelConsumptionRateLitresPerHour': 'diesel_fuel_consumption_rate_litres_per_hour',
      'dieselGeneratorOperatingHoursPerDay': 'diesel_generator_operating_hours_per_day',
      'gridElectricityConsumptionLast12MonthsKWh': 'grid_electricity_consumption_last_12_months_kwh',
      'dieselConsumptionLast12MonthsLitres': 'diesel_consumption_last_12_months_litres',
      'solarEnergyGenerationLast12MonthsKWh': 'solar_energy_generation_last_12_months_kwh',
      'wasteIncinerationPresent': 'waste_incineration_present',
      'wasteIncinerationVolumeMonthlyKg': 'waste_incineration_volume_monthly_kg',
      'trainedOMStaffPresent': 'trained_om_staff_present',
      'trainedOMStaffCount': 'trained_om_staff_count',
      'preventiveMaintenanceScheduleDocumented': 'preventive_maintenance_schedule_documented',
      'sparepartsAvailableForCriticalSystems': 'sparepartsavailable_for_critical_systems',
      'powerSystemsServiceFrequency': 'power_systems_service_frequency',
      'omStaffSkillsRating': 'om_staff_skills_rating',
      'wasteSegmentationSystem': 'waste_segmentation_system',
      'wasteDisposalMethod': 'waste_disposal_method',
      'airQualityMonitoringSystem': 'air_quality_monitoring_system',
      'hazardousMaterialsStorageSafe': 'hazardous_materials_storage_safe',
      'adequatePPEAvailable': 'adequate_ppe_available',

      // Section 3: Electrical Load Inventory
      'sectionRoomName': 'section_room_name',
      'equipmentList': 'equipment_list',
      'equipmentInventory': 'equipment_inventory',
      'lightingInventory': 'lighting_inventory',

      // Section 7: GHG Reduction & Energy Efficiency
      'renewableEnergyPotentials': 'renewable_energy_potentials',
      'obviousInefficiencies': 'obvious_inefficiencies',
      'interventionPriorities': 'intervention_priorities',

      // Section 8: Carbon Market Readiness
      'historicalEnergyGHGRecords': 'historical_energy_ghg_records',
      'mrvSystemPresent': 'mrv_system_present',
      'carbonCreditInterest': 'carbon_credit_interest',
      'carbonMarketRemarks': 'carbon_market_remarks',

      // Section 9: Environmental Scanning
      'nearbyFacilitiesSharedInterventions': 'nearby_facilities_shared_interventions',
      'sharedInterventionsDetails': 'shared_interventions_details',
      'additionalInfrastructurePotential': 'additional_infrastructure_potential'
    };

    // Fields to skip (these shouldn't be updated)
    const skipFields = new Set(['facilityId', 'facility_id', 'id', 'auditId', 'hfr_id', 'createdAt', 'created_at', 'updatedAt', 'updated_at']);

    // Build UPDATE query
    const updates = [];
    const values = [];
    Object.entries(auditData).forEach(([key, value]) => {
      // Skip fields that shouldn't be updated
      if (skipFields.has(key)) return;

      // Skip null/undefined values
      if (value === null || value === undefined) return;

      const dbKey = fieldMapping[key] || key;

      // Skip unknown fields that aren't in the mapping
      if (dbKey === key && !['total', 'count', 'hfr_id', 'auditPeriodId', 'audit_period_id'].includes(key)) {
        // Check if this is a valid column by seeing if it's in camelCase and not yet mapped
        // If it looks like a field name but isn't mapped, log a warning but don't update
        if (/^[a-z][a-zA-Z0-9]*$/.test(key) && key.includes && !key.startsWith('_')) {
          console.warn(`[Audit Update] Unmapped field: ${key}`);
          return;
        }
      }

      // Handle JSON fields
      if (typeof value === 'object' && (key === 'equipmentInventory' || key === 'lightingInventory' || key === 'equipmentList')) {
        updates.push(`${dbKey} = ?`);
        values.push(JSON.stringify(value));
      } else {
        updates.push(`${dbKey} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(auditId);

    const query = `UPDATE audits SET ${updates.join(', ')} WHERE id = ?`;

    console.log(`[Audit Update] Updating audit ${auditId}: Query = ${query}`);
    const result = await connection.query(query, values);
    console.log(`[Audit Update] Success: Audit ${auditId} updated`);
    
    return { 
      success: true,
      message: 'Audit updated successfully',
      id: auditId, 
      ...auditData 
    };
  } catch (error) {
    console.error('Error updating audit:', error);
    throw new Error(`Failed to update audit: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Delete audit
 */
export const deleteAudit = async (id) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM audits WHERE id = ?', [id]);
    connection.release();
    return true;
  } catch (error) {
    console.error('Error deleting audit:', error);
    throw error;
  }
};
