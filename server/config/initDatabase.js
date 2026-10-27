import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'nherams_db';

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database ${dbName} created or already exists`);

    // Close the initial connection and reconnect to the specific database
    await connection.end();
    
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName
    });

    // Create Facilities table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS facilities (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(100),
        lga VARCHAR(100),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        region VARCHAR(100),
        ownership VARCHAR(50),
        tier VARCHAR(50),
        criticality VARCHAR(50),
        pilotFocus TEXT,
        isPrivate BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Facilities table created');

    // Create Users table (authentication fields added by migration)
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create Audits table with all individual audit fields
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS audits (
        id VARCHAR(50) PRIMARY KEY,
        facility_id VARCHAR(50) NOT NULL,
        auditPeriodId VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        facility_name VARCHAR(255),
        facility_type VARCHAR(100),
        location_state VARCHAR(100),
        location_zone VARCHAR(100),
        gps_latitude DECIMAL(10, 8),
        gps_longitude DECIMAL(11, 8),
        audit_date DATE,
        focal_person_name VARCHAR(255),
        focal_person_role VARCHAR(100),
        audit_team_members TEXT,
        committee_observer_present BOOLEAN DEFAULT FALSE,
        grid_connected BOOLEAN DEFAULT FALSE,
        grid_uptime_hours_per_day DECIMAL(5, 2),
        backup_power_sources TEXT,
        hybrid_renewable_system_installed BOOLEAN DEFAULT FALSE,
        hybrid_system_details TEXT,
        major_outages_last_12_months BOOLEAN DEFAULT FALSE,
        outage_frequency_and_duration TEXT,
        emergency_energy_plan BOOLEAN DEFAULT FALSE,
        energy_resilience_score VARCHAR(50),
        diesel_generator_make VARCHAR(255),
        diesel_generator_serial VARCHAR(255),
        diesel_generator_capacity_kva DECIMAL(10, 2),
        diesel_fuel_consumption_rate_litres_per_hour DECIMAL(10, 2),
        diesel_generator_operating_hours_per_day DECIMAL(5, 2),
        grid_electricity_consumption_last_12_months_kwh DECIMAL(15, 2),
        diesel_consumption_last_12_months_litres DECIMAL(15, 2),
        waste_incineration_present BOOLEAN DEFAULT FALSE,
        waste_incineration_volume_monthly_kg DECIMAL(10, 2),
        trained_om_staff_present BOOLEAN DEFAULT FALSE,
        trained_om_staff_count INT DEFAULT 0,
        preventive_maintenance_schedule_documented BOOLEAN DEFAULT FALSE,
        sparepartsavailable_for_critical_systems BOOLEAN DEFAULT FALSE,
        power_systems_service_frequency VARCHAR(100),
        om_staff_skills_rating INT DEFAULT 3,
        waste_segmentation_system BOOLEAN DEFAULT FALSE,
        waste_disposal_method VARCHAR(255),
        air_quality_monitoring_system BOOLEAN DEFAULT FALSE,
        hazardous_materials_storage_safe BOOLEAN DEFAULT FALSE,
        adequate_ppe_available BOOLEAN DEFAULT FALSE,

        -- Section 3: Electrical Load Inventory
        section_room_name VARCHAR(255),
        equipment_list JSON,
        lighting_inventory JSON,

        -- Section 7: GHG Reduction & Energy Efficiency
        renewable_energy_potentials JSON,
        obvious_inefficiencies TEXT,
        intervention_priorities VARCHAR(100),

        -- Section 8: Carbon Market Readiness
        historical_energy_ghg_records BOOLEAN DEFAULT FALSE,
        mrv_system_present BOOLEAN DEFAULT FALSE,
        carbon_credit_interest BOOLEAN DEFAULT FALSE,
        carbon_market_remarks TEXT,

        -- Section 9: Environmental Scanning
        nearby_facilities_shared_interventions BOOLEAN DEFAULT FALSE,
        shared_interventions_details TEXT,
        additional_infrastructure_potential TEXT,

        FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
        FOREIGN KEY (auditPeriodId) REFERENCES audit_periods(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Audits table created');

    // Create Audit Periods table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS audit_periods (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        dateFrom DATE NOT NULL,
        dateTo DATE NOT NULL,
        status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Audit Periods table created');

    // Create IndicatorConfig table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS indicator_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dieselFactor DECIMAL(10, 2),
        gridFactor DECIMAL(10, 2),
        wasteFactor DECIMAL(10, 2),
        resilienceThreshold DECIMAL(10, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Indicator Config table created');

    // Create AppSettings table for appearance and system settings
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        settingKey VARCHAR(100) UNIQUE NOT NULL,
        settingValue TEXT,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ App Settings table created');

    // Create AuditFormFields table for dynamic form builder
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS audit_form_fields (
        id VARCHAR(50) PRIMARY KEY,
        fieldName VARCHAR(255) NOT NULL,
        fieldLabel VARCHAR(255) NOT NULL,
        fieldType VARCHAR(50) NOT NULL,
        section INT,
        isRequired BOOLEAN DEFAULT FALSE,
        linkedIndicators VARCHAR(500),
        description TEXT,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Audit Form Fields table created');

    // Create AuditValidations table for validator comments/remarks
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS audit_validations (
        id VARCHAR(50) PRIMARY KEY,
        auditId VARCHAR(50) NOT NULL,
        validatorId VARCHAR(50) NOT NULL,
        status VARCHAR(50),
        comments TEXT,
        remarks TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (auditId) REFERENCES audits(id) ON DELETE CASCADE,
        FOREIGN KEY (validatorId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Audit Validations table created');

    // Create UserRoles table for RBAC
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ User Roles table created');

    // Create EnergyProfiles table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS energy_profiles (
        id VARCHAR(50) PRIMARY KEY,
        facilityId VARCHAR(50) NOT NULL UNIQUE,
        uptime VARCHAR(50),
        erLevel VARCHAR(50),
        costImpact VARCHAR(50),
        outagesLast30Days INT,
        criticalLoadResilience DECIMAL(10, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Energy Profiles table created');

    // Add new columns for Sections 3, 7, 8, 9 if they don't exist
    const newColumns = [
      { name: 'auditPeriodId', definition: 'VARCHAR(50)' },
      { name: 'solar_energy_generation_last_12_months_kwh', definition: 'DECIMAL(15, 2)' },
      { name: 'section_room_name', definition: 'VARCHAR(255)' },
      { name: 'equipment_list', definition: 'JSON' },
      { name: 'lighting_inventory', definition: 'JSON' },
      { name: 'renewable_energy_potentials', definition: 'JSON' },
      { name: 'obvious_inefficiencies', definition: 'TEXT' },
      { name: 'intervention_priorities', definition: 'VARCHAR(100)' },
      { name: 'historical_energy_ghg_records', definition: 'BOOLEAN DEFAULT FALSE' },
      { name: 'mrv_system_present', definition: 'BOOLEAN DEFAULT FALSE' },
      { name: 'carbon_credit_interest', definition: 'BOOLEAN DEFAULT FALSE' },
      { name: 'carbon_market_remarks', definition: 'TEXT' },
      { name: 'nearby_facilities_shared_interventions', definition: 'BOOLEAN DEFAULT FALSE' },
      { name: 'shared_interventions_details', definition: 'TEXT' },
      { name: 'additional_infrastructure_potential', definition: 'TEXT' }
    ];

    // Try to add columns to existing audits table
    for (const column of newColumns) {
      try {
        await dbConnection.execute(`
          ALTER TABLE audits ADD COLUMN IF NOT EXISTS ${column.name} ${column.definition}
        `);
        console.log(`✓ Column ${column.name} added to audits table`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`  Column ${column.name} already exists`);
        } else {
          console.error(`  Warning: Could not add column ${column.name}:`, error.message);
        }
      }
    }

    await dbConnection.end();
    console.log('\n✓ Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

export default initDatabase;
