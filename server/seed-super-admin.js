import pool from './config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createSuperAdmin() {
  try {
    console.log('Creating Super Admin Account...\n');

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'super@nherams.org';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const superAdminName = 'Super Administrator';
    const superAdminId = 'sa_' + Date.now();

    console.log(`📧 Email: ${superAdminEmail}`);
    console.log(`🔐 Password: ${superAdminPassword}`);
    console.log(`👤 Name: ${superAdminName}`);
    console.log(`🆔 ID: ${superAdminId}\n`);

    // Hash the password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);
    console.log('✓ Password hashed\n');

    const connection = await pool.getConnection();

    // Check if super admin already exists
    console.log('Checking if super admin already exists...');
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [superAdminEmail]
    );

    if (existingAdmin.length > 0) {
      console.log(`⚠️  Super admin with email ${superAdminEmail} already exists!`);
      console.log(`📊 Existing ID: ${existingAdmin[0].id}`);
      console.log('\nUpdating password...');
      
      // Update the existing super admin's password
      await connection.query(
        'UPDATE users SET password_hash = ?, email_verified = 1, user_type = ? WHERE email = ?',
        [passwordHash, 'ADMIN', superAdminEmail]
      );
      console.log('✓ Password updated successfully\n');
    } else {
      // Insert new super admin
      console.log('Creating new super admin account...');
      await connection.query(
        `INSERT INTO users 
         (id, name, email, password_hash, role, user_type, email_verified, assigned_facility_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [superAdminId, superAdminName, superAdminEmail, passwordHash, 'ADMIN', 'ADMIN', 1, null]
      );
      console.log('✓ Super admin account created successfully\n');
    }

    // Verify the account
    const [verifyUser] = await connection.query(
      'SELECT id, name, email, role, user_type, email_verified FROM users WHERE email = ?',
      [superAdminEmail]
    );

    if (verifyUser.length > 0) {
      const user = verifyUser[0];
      console.log('✅ Super Admin Account Verified:\n');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   User Type: ${user.user_type}`);
      console.log(`   Email Verified: ${user.email_verified ? 'YES ✓' : 'NO'}`);
      console.log('\n🎉 Super Admin account is ready to use!\n');
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSuperAdmin();
