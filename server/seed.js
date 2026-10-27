import pool from './config/database.js';
import initDatabase from './config/initDatabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample facility data - Updated facilities list
const PILOT_FACILITIES = [
  {
    id: 'NG-KD-ABUTH-0001',
    name: 'Ahmadu Bello University Teaching Hospital',
    state: 'Kaduna',
    lga: 'Zaria',
    latitude: 11.1821,
    longitude: 7.6412,
    region: 'North West',
    ownership: 'FEDERAL_PUBLIC',
    tier: 'TERTIARY',
    criticality: 'C4',
    pilotFocus: 'Tertiary teaching hospital with comprehensive services',
    isPrivate: false
  },
  {
    id: 'NG-BO-UMTH-0001',
    name: 'University of Maiduguri Teaching Hospital',
    state: 'Borno',
    lga: 'Maiduguri Metropolitan',
    latitude: 11.8333,
    longitude: 13.1500,
    region: 'North East',
    ownership: 'FEDERAL_PUBLIC',
    tier: 'TERTIARY',
    criticality: 'C4',
    pilotFocus: 'Tertiary teaching hospital with specialized care',
    isPrivate: false
  },
  {
    id: 'NG-KW-OFFA-0001',
    name: 'Offa Specialist Hospital',
    state: 'Kwara',
    lga: 'Offa',
    latitude: 8.1406,
    longitude: 4.7407,
    region: 'North Central',
    ownership: 'STATE_LGA_PUBLIC',
    tier: 'SECONDARY',
    criticality: 'C3',
    pilotFocus: 'Secondary care specialist hospital',
    isPrivate: false
  },
  {
    id: 'NG-LA-IDIARABAPHC-0001',
    name: 'Idi-Araba Primary Health Centre',
    state: 'Lagos',
    lga: 'Lagos Mainland',
    latitude: 6.5160,
    longitude: 3.3590,
    region: 'South West',
    ownership: 'STATE_LGA_PUBLIC',
    tier: 'PRIMARY',
    criticality: 'C1',
    pilotFocus: 'Community primary healthcare delivery',
    isPrivate: false
  },
  {
    id: 'NG-AK-MBAKPHC-0001',
    name: 'Mbak Primary Health Centre',
    state: 'Akwa Ibom',
    lga: 'Eastern Obolo',
    latitude: 4.8000,
    longitude: 8.1333,
    region: 'South South',
    ownership: 'STATE_LGA_PUBLIC',
    tier: 'PRIMARY',
    criticality: 'C1',
    pilotFocus: 'Community primary healthcare delivery',
    isPrivate: false
  },
  {
    id: 'NG-AN-SCB-0001',
    name: 'St. Charles Borromeo Specialist Hospital, Onitsha',
    state: 'Anambra',
    lga: 'Onitsha',
    latitude: 6.1350,
    longitude: 7.1900,
    region: 'South East',
    ownership: 'PRIVATE_FOR_PROFIT',
    tier: 'SECONDARY',
    criticality: 'C3',
    pilotFocus: 'Private specialist hospital with diverse services',
    isPrivate: true
  }
];

const SAMPLE_USERS = [
  {
    id: 'admin1',
    name: 'Lead Administrator',
    role: 'ADMIN',
    facilityId: null
  },
  {
    id: 'user1',
    name: 'Facility Admin - ABUTH',
    role: 'FACILITY_ADMIN',
    facilityId: 'NG-KD-ABUTH-0001'
  },
  {
    id: 'user2',
    name: 'Facility Admin - UMTH',
    role: 'FACILITY_ADMIN',
    facilityId: 'NG-BO-UMTH-0001'
  }
];

const DEFAULT_CONFIG = {
  dieselFactor: 2.68,
  gridFactor: 0.5,
  wasteFactor: 0.95,
  resilienceThreshold: 70
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');
    
    // Initialize database tables first
    console.log('Initializing database tables...');
    await initDatabase();
    console.log('✓ Database tables initialized\n');
    
    const connection = await pool.getConnection();

    // Clear existing data
    console.log('Clearing existing data...');
    await connection.query('DELETE FROM audits');
    await connection.query('DELETE FROM energy_profiles');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM facilities');
    await connection.query('DELETE FROM indicator_config');
    console.log('✓ Cleared existing data\n');

    // Insert facilities
    console.log('Seeding facilities...');
    for (const facility of PILOT_FACILITIES) {
      await connection.query(
        `INSERT INTO facilities (id, name, state, lga, latitude, longitude, region, ownership, tier, criticality, pilotFocus, isPrivate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facility.id,
          facility.name,
          facility.state,
          facility.lga,
          facility.latitude,
          facility.longitude,
          facility.region,
          facility.ownership,
          facility.tier,
          facility.criticality,
          facility.pilotFocus,
          facility.isPrivate
        ]
      );
    }
    console.log(`✓ Seeded ${PILOT_FACILITIES.length} facilities\n`);

    // Insert users
    console.log('Seeding users...');
    for (const user of SAMPLE_USERS) {
      await connection.query(
        `INSERT INTO users (id, name, role, facilityId) VALUES (?, ?, ?, ?)`,
        [user.id, user.name, user.role, user.facilityId]
      );
    }
    console.log(`✓ Seeded ${SAMPLE_USERS.length} users\n`);

    // Insert default config
    console.log('Seeding default indicator config...');
    await connection.query(
      `INSERT INTO indicator_config (dieselFactor, gridFactor, wasteFactor, resilienceThreshold)
       VALUES (?, ?, ?, ?)`,
      [
        DEFAULT_CONFIG.dieselFactor,
        DEFAULT_CONFIG.gridFactor,
        DEFAULT_CONFIG.wasteFactor,
        DEFAULT_CONFIG.resilienceThreshold
      ]
    );
    console.log('✓ Seeded default config\n');

    connection.release();
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
