/**
 * Super Admin Setup Service
 * Creates super admin account on server startup if it doesn't exist
 */

import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const setupSuperAdmin = async () => {
  try {
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.trim();
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD?.trim();

    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
      console.warn('⚠️  SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not configured in .env');
      console.warn(`   SUPER_ADMIN_EMAIL: ${SUPER_ADMIN_EMAIL || 'NOT SET'}`);
      console.warn(`   SUPER_ADMIN_PASSWORD: ${SUPER_ADMIN_PASSWORD ? 'SET' : 'NOT SET'}`);
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Check if super admin already exists
      const [existingAdmin] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [SUPER_ADMIN_EMAIL]
      );

      if (existingAdmin.length > 0) {
        console.log('✓ Super admin account already exists');
        return;
      }

      // Hash the password
      const password_hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

      // Create super admin user
      await connection.query(
        `INSERT INTO users (
          name, 
          email, 
          password_hash, 
          user_type, 
          email_verified, 
          role,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          'Super Administrator',
          SUPER_ADMIN_EMAIL,
          password_hash,
          'ADMIN',
          true, // Email already verified for super admin
          'ADMIN' // Keep legacy role field for compatibility
        ]
      );

      console.log(`✓ Super admin account created: ${SUPER_ADMIN_EMAIL}`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error setting up super admin:', error.message);
    // Don't throw - allow server to continue even if super admin setup fails
  }
};
