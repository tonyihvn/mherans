import pool from '../config/database.js';

const AVAILABLE_RESOURCES = [
  'dashboard',
  'facility-map',
  'audit-form',
  'audits',
  'facilities',
  'users',
  'indicators',
  'audit-periods',
  'settings',
  'roles',
  'validators',
  'facility-dashboard'
];

const AVAILABLE_ACTIONS = ['create', 'read', 'update', 'delete', 'execute'];

const ROLES_PRESETS = [
  {
    id: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full access to all features and configurations',
    permissions: AVAILABLE_RESOURCES.flatMap(resource =>
      AVAILABLE_ACTIONS.map(action => ({
        resource,
        action,
        granted: true
      }))
    )
  },
  {
    id: 'VALIDATOR',
    name: 'Validator',
    description: 'Can view and comment on audits',
    permissions: [
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'audits', action: 'update', granted: true },
      { resource: 'dashboard', action: 'read', granted: true },
      { resource: 'facility-map', action: 'read', granted: true },
      // All other permissions denied
      ...AVAILABLE_RESOURCES.flatMap(resource =>
        AVAILABLE_ACTIONS.map(action => ({
          resource,
          action,
          granted: ['audits', 'dashboard', 'facility-map'].includes(resource) &&
                   (resource === 'audits' ? ['read', 'update'] : ['read']).includes(action)
        }))
      ).filter((p, idx, self) => self.findIndex(x => x.resource === p.resource && x.action === p.action) === idx)
    ]
  },
  {
    id: 'STATE_USER',
    name: 'State User',
    description: 'Can view audits and facilities within assigned state',
    permissions: [
      { resource: 'dashboard', action: 'read', granted: true },
      { resource: 'facility-map', action: 'read', granted: true },
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'facilities', action: 'read', granted: true },
      // All other permissions denied
      ...AVAILABLE_RESOURCES.flatMap(resource =>
        AVAILABLE_ACTIONS.map(action => ({
          resource,
          action,
          granted: ['dashboard', 'facility-map', 'audits', 'facilities'].includes(resource) &&
                   ['read'].includes(action)
        }))
      ).filter((p, idx, self) => self.findIndex(x => x.resource === p.resource && x.action === p.action) === idx)
    ]
  },
  {
    id: 'FACILITY_USER',
    name: 'Facility User',
    description: 'Can view and edit audits for assigned facility',
    permissions: [
      { resource: 'audit-form', action: 'read', granted: true },
      { resource: 'audit-form', action: 'update', granted: true },
      { resource: 'audit-form', action: 'create', granted: true },
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'dashboard', action: 'read', granted: true }
    ]
  },
  {
    id: 'FACILITY_ADMIN',
    name: 'Facility Admin',
    description: 'Full administrative access for assigned facility',
    permissions: [
      { resource: 'audit-form', action: 'create', granted: true },
      { resource: 'audit-form', action: 'read', granted: true },
      { resource: 'audit-form', action: 'update', granted: true },
      { resource: 'audit-form', action: 'delete', granted: true },
      { resource: 'audits', action: 'create', granted: true },
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'audits', action: 'update', granted: true },
      { resource: 'audits', action: 'delete', granted: true },
      { resource: 'dashboard', action: 'read', granted: true },
      { resource: 'facility-dashboard', action: 'read', granted: true }
    ]
  }
];

export async function runMigration() {
  const connection = await pool.getConnection();

  try {
    console.log('🔄 Seeding default roles and permissions...');

    // Check if roles already exist
    const [existingRoles] = await connection.query(
      'SELECT COUNT(*) as count FROM user_roles'
    );

    if (existingRoles[0].count > 0) {
      console.log(`✓ Roles already exist (${existingRoles[0].count} found), skipping seed`);
      connection.release();
      return;
    }

    // Insert all preset roles
    let insertedCount = 0;
    for (const role of ROLES_PRESETS) {
      try {
        const permissionsJson = JSON.stringify(role.permissions);

        await connection.query(
          `INSERT INTO user_roles (id, name, description, permissions)
           VALUES (?, ?, ?, ?)`,
          [role.id, role.name, role.description, permissionsJson]
        );
        console.log(`✓ Inserted role: ${role.name}`);
        insertedCount++;
      } catch (error) {
        console.error(`⚠️  Error inserting role ${role.id}:`, error.message);
      }
    }

    console.log(`✅ Seeded ${insertedCount} default roles`);
    connection.release();
  } catch (error) {
    console.error('❌ Error in migration:', error.message);
    connection.release();
    throw error;
  }
}

export default runMigration;
