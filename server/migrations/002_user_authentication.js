/**
 * Migration: Add user authentication fields
 * Adds email, password, email verification, and user role fields
 */

import pool from '../config/database.js';

export const runMigration = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('Running migration 002: Add user authentication fields...');
    
    // Add authentication fields to users table
    // Add email as nullable first (to handle existing rows), then add constraints
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT NULL
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type ENUM(
        'SUPER_ADMIN',
        'ADMIN',
        'FEDERAL_ADMIN',
        'STATE_ADMIN',
        'FACILITY_ADMIN',
        'FACILITY_USER',
        'VALIDATOR',
        'GUEST'
      ) DEFAULT 'GUEST'
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) DEFAULT NULL
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires DATETIME DEFAULT NULL
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_facility_id VARCHAR(255) DEFAULT NULL
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_state VARCHAR(255) DEFAULT NULL
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    
    // Add UNIQUE constraint to email column if not already present
    try {
      await connection.query(`
        ALTER TABLE users ADD UNIQUE KEY unique_email (email)
      `);
    } catch (e) {
      // Constraint may already exist, which is fine
      if (e.code !== 'ER_DUP_KEYNAME') {
        throw e;
      }
    }
    
    connection.release();
    console.log('Migration 002 completed successfully');
  } catch (error) {
    console.error('Migration 002 failed:', error);
    throw error;
  }
};
