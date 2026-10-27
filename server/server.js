import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import initDatabase from './config/initDatabase.js';
import { runMigration } from './migrations/001_add_audit_individual_fields.js';
import { runMigration as runAuthMigration } from './migrations/002_user_authentication.js';
import { runMigration as runDatasetsMigration } from './migrations/003_create_datasets_table.js';
import { runMigration as populateFormFieldsMigration } from './migrations/004_populate_audit_form_fields.js';
import { runMigration as seedDefaultRolesMigration } from './migrations/005_seed_default_roles.js';
import { setupSuperAdmin } from './services/setupSuperAdmin.js';
import facilitiesRouter from './routes/facilities.js';
import usersRouter from './routes/users.js';
import auditsRouter from './routes/audits.js';
import auditPeriodsRouter from './routes/auditPeriods.js';
import appSettingsRouter from './routes/appSettings.js';
import userRolesRouter from './routes/userRoles.js';
import configRouter from './routes/config.js';
import datasetsRouter from './routes/datasets_new.js';
import debugRouter from './routes/debug.js';
import indicatorsRouter from './routes/indicators.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import * as FacilityModel from './models/facility.js';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Sample pilot facilities to seed if none exist
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

async function ensureFacilitiesExist() {
  try {
    const facilities = await FacilityModel.getFacilities();
    if (facilities.length === 0) {
      console.log('🌱 No facilities found, seeding default pilot facilities...');
      for (const facility of PILOT_FACILITIES) {
        await FacilityModel.createFacility(facility);
      }
      console.log(`✅ Seeded ${PILOT_FACILITIES.length} pilot facilities`);
    } else {
      console.log(`✅ Database already contains ${facilities.length} facilities`);
    }
  } catch (error) {
    console.error('⚠️  Error ensuring facilities exist:', error.message);
  }
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
// Increase body parser limits for large datasets
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body).substring(0, 300);
    console.log(`  Body: ${bodyStr}${JSON.stringify(req.body).length > 300 ? '...' : ''}`);
  }
  next();
});

// Initialize database and run migrations
console.log('🔄 Initializing database...');
try {
  await initDatabase();
  console.log('✅ Database initialized');
  
  console.log('🔄 Running migrations...');
  await runMigration();
  await runAuthMigration();
  await runDatasetsMigration();
  await populateFormFieldsMigration();
  await seedDefaultRolesMigration();
  console.log('✅ All migrations completed');
  
  await setupSuperAdmin();
  console.log('✅ Super admin setup completed');

  await ensureFacilitiesExist();
  console.log('✅ Facilities initialization completed');
} catch (error) {
  console.error('❌ Initialization error:', error.message);
  process.exit(1);
}

// Routes
app.use('/api/debug', debugRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/users', usersRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/audit-periods', auditPeriodsRouter);
app.use('/api/app-settings', appSettingsRouter);
app.use('/api/user-roles', userRolesRouter);
app.use('/api/config', configRouter);
app.use('/api/datasets', datasetsRouter);
app.use('/api/indicators', indicatorsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 NHERAMS Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation:`);
  console.log(`   GET  /api/facilities         - Get all facilities`);
  console.log(`   GET  /api/facilities/:id     - Get facility by ID`);
  console.log(`   POST /api/facilities         - Create facility`);
  console.log(`   PUT  /api/facilities/:id     - Update facility`);
  console.log(`   DELETE /api/facilities/:id   - Delete facility`);
  console.log(`\n   GET  /api/users             - Get all users`);
  console.log(`   POST /api/users             - Create user`);
  console.log(`\n   GET  /api/audits            - Get all audits`);
  console.log(`   POST /api/audits            - Save audit`);
  console.log(`\n   GET  /api/audit-periods     - Get all audit periods`);
  console.log(`   GET  /api/audit-periods/:id - Get audit period by ID`);
  console.log(`   POST /api/audit-periods     - Create audit period`);
  console.log(`   PUT  /api/audit-periods/:id - Update audit period`);
  console.log(`   DELETE /api/audit-periods/:id - Delete audit period`);
  console.log(`\n   GET  /api/config            - Get indicator config`);
  console.log(`   PUT  /api/config            - Update config\n`);
});
