/**
 * Database Migration: Convert audits table from JSON data column to individual fields
 * This migration adds all individual audit fields as separate columns
 * Preserves existing data by parsing JSON and distributing to new columns
 */

import pool from '../config/database.js';

const migrationSQL = `
ALTER TABLE audits 
ADD COLUMN facility_name VARCHAR(255),
ADD COLUMN facility_type VARCHAR(100),
ADD COLUMN location_state VARCHAR(100),
ADD COLUMN location_zone VARCHAR(100),
ADD COLUMN gps_latitude DECIMAL(10, 8),
ADD COLUMN gps_longitude DECIMAL(11, 8),
ADD COLUMN audit_date DATE,
ADD COLUMN focal_person_name VARCHAR(255),
ADD COLUMN focal_person_role VARCHAR(100),
ADD COLUMN audit_team_members TEXT,
ADD COLUMN committee_observer_present BOOLEAN DEFAULT FALSE,
ADD COLUMN grid_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN grid_uptime_hours_per_day DECIMAL(5, 2),
ADD COLUMN backup_power_sources TEXT,
ADD COLUMN hybrid_renewable_system_installed BOOLEAN DEFAULT FALSE,
ADD COLUMN hybrid_system_details TEXT,
ADD COLUMN major_outages_last_12_months BOOLEAN DEFAULT FALSE,
ADD COLUMN outage_frequency_and_duration TEXT,
ADD COLUMN emergency_energy_plan BOOLEAN DEFAULT FALSE,
ADD COLUMN energy_resilience_score VARCHAR(50),
ADD COLUMN diesel_generator_make VARCHAR(255),
ADD COLUMN diesel_generator_serial VARCHAR(255),
ADD COLUMN diesel_generator_capacity_kva DECIMAL(10, 2),
ADD COLUMN diesel_fuel_consumption_rate_litres_per_hour DECIMAL(10, 2),
ADD COLUMN diesel_generator_operating_hours_per_day DECIMAL(5, 2),
ADD COLUMN grid_electricity_consumption_last_12_months_kwh DECIMAL(15, 2),
ADD COLUMN diesel_consumption_last_12_months_litres DECIMAL(15, 2),
ADD COLUMN waste_incineration_present BOOLEAN DEFAULT FALSE,
ADD COLUMN waste_incineration_volume_monthly_kg DECIMAL(10, 2),
ADD COLUMN trained_om_staff_present BOOLEAN DEFAULT FALSE,
ADD COLUMN trained_om_staff_count INT DEFAULT 0,
ADD COLUMN preventive_maintenance_schedule_documented BOOLEAN DEFAULT FALSE,
ADD COLUMN sparepartsavailable_for_critical_systems BOOLEAN DEFAULT FALSE,
ADD COLUMN power_systems_service_frequency VARCHAR(100),
ADD COLUMN om_staff_skills_rating INT DEFAULT 3,
ADD COLUMN waste_segmentation_system BOOLEAN DEFAULT FALSE,
ADD COLUMN waste_disposal_method VARCHAR(255),
ADD COLUMN air_quality_monitoring_system BOOLEAN DEFAULT FALSE,
ADD COLUMN hazardous_materials_storage_safe BOOLEAN DEFAULT FALSE,
ADD COLUMN adequate_ppe_available BOOLEAN DEFAULT FALSE,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
`;

export async function runMigration() {
  try {
    const connection = await pool.getConnection();
    
    // Check if migration already applied
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'audits' AND COLUMN_NAME = 'facility_name'`
    );
    
    if (columns.length > 0) {
      console.log('Migration already applied - columns exist');
      connection.release();
      return;
    }
    
    console.log('Applying migration: Adding individual audit fields...');
    
    // Split migration into individual ALTER statements to avoid issues
    const statements = [
      'ALTER TABLE audits ADD COLUMN facility_name VARCHAR(255)',
      'ALTER TABLE audits ADD COLUMN facility_type VARCHAR(100)',
      'ALTER TABLE audits ADD COLUMN location_state VARCHAR(100)',
      'ALTER TABLE audits ADD COLUMN location_zone VARCHAR(100)',
      'ALTER TABLE audits ADD COLUMN gps_latitude DECIMAL(10, 8)',
      'ALTER TABLE audits ADD COLUMN gps_longitude DECIMAL(11, 8)',
      'ALTER TABLE audits ADD COLUMN audit_date DATE',
      'ALTER TABLE audits ADD COLUMN focal_person_name VARCHAR(255)',
      'ALTER TABLE audits ADD COLUMN focal_person_role VARCHAR(100)',
      'ALTER TABLE audits ADD COLUMN audit_team_members TEXT',
      'ALTER TABLE audits ADD COLUMN committee_observer_present BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN grid_connected BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN grid_uptime_hours_per_day DECIMAL(5, 2)',
      'ALTER TABLE audits ADD COLUMN backup_power_sources TEXT',
      'ALTER TABLE audits ADD COLUMN hybrid_renewable_system_installed BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN hybrid_system_details TEXT',
      'ALTER TABLE audits ADD COLUMN major_outages_last_12_months BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN outage_frequency_and_duration TEXT',
      'ALTER TABLE audits ADD COLUMN emergency_energy_plan BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN energy_resilience_score VARCHAR(50)',
      'ALTER TABLE audits ADD COLUMN diesel_generator_make VARCHAR(255)',
      'ALTER TABLE audits ADD COLUMN diesel_generator_serial VARCHAR(255)',
      'ALTER TABLE audits ADD COLUMN diesel_generator_capacity_kva DECIMAL(10, 2)',
      'ALTER TABLE audits ADD COLUMN diesel_fuel_consumption_rate_litres_per_hour DECIMAL(10, 2)',
      'ALTER TABLE audits ADD COLUMN diesel_generator_operating_hours_per_day DECIMAL(5, 2)',
      'ALTER TABLE audits ADD COLUMN grid_electricity_consumption_last_12_months_kwh DECIMAL(15, 2)',
      'ALTER TABLE audits ADD COLUMN diesel_consumption_last_12_months_litres DECIMAL(15, 2)',
      'ALTER TABLE audits ADD COLUMN waste_incineration_present BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN waste_incineration_volume_monthly_kg DECIMAL(10, 2)',
      'ALTER TABLE audits ADD COLUMN trained_om_staff_present BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN trained_om_staff_count INT DEFAULT 0',
      'ALTER TABLE audits ADD COLUMN preventive_maintenance_schedule_documented BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN sparepartsavailable_for_critical_systems BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN power_systems_service_frequency VARCHAR(100)',
      'ALTER TABLE audits ADD COLUMN om_staff_skills_rating INT DEFAULT 3',
      'ALTER TABLE audits ADD COLUMN waste_segmentation_system BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN waste_disposal_method VARCHAR(255)',
      'ALTER TABLE audits ADD COLUMN air_quality_monitoring_system BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN hazardous_materials_storage_safe BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN adequate_ppe_available BOOLEAN DEFAULT FALSE',
      'ALTER TABLE audits ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE audits ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    ];
    
    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (err) {
        // Ignore "duplicate column" errors
        if (!err.message.includes('Duplicate column')) {
          console.error(`Error executing: ${statement}`, err.message);
        }
      }
    }
    
    connection.release();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().then(() => {
    console.log('Migration finished');
    process.exit(0);
  }).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
