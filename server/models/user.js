import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword, generateVerificationToken } from '../services/passwordService.js';

export const getUsers = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM users');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

export const createUser = async (user) => {
  let connection;
  try {
    console.log('[User.create] Starting user creation');
    connection = await pool.getConnection();
    console.log('[User.create] Got database connection');
    
    const userId = user.id || uuidv4();
    const { name, email, password, user_type = 'PUBLIC_LITE', assigned_facility_id, assigned_state } = user;
    
    console.log(`[User.create] Creating user with ID: ${userId}, Name: ${name}, Type: ${user_type}`);
    
    // Hash password if provided
    const passwordHash = password ? await hashPassword(password) : null;
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const query = `INSERT INTO users (id, name, email, password_hash, user_type, email_verification_token, 
      verification_token_expires, assigned_facility_id, assigned_state, email_verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`;
    
    const values = [userId, name, email, passwordHash, user_type, verificationToken, tokenExpires, assigned_facility_id || null, assigned_state || null];
    
    console.log('[User.create] Executing INSERT query');
    
    const result = await connection.query(query, values);
    console.log('[User.create] Query executed successfully, result:', result);
    
    connection.release();
    console.log('[User.create] Connection released');
    
    const response = {
      id: userId,
      name,
      email,
      user_type,
      verificationToken,
      email_verified: false
    };
    console.log('[User.create] Returning user object:', response);
    return response;
  } catch (error) {
    console.error('[User.create] Error creating user:', error.message);
    console.error('[User.create] Error code:', error.code);
    console.error('[User.create] Error SQL:', error.sql);
    console.error('[User.create] Full error:', error);
    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('[User.create] Error releasing connection:', e);
      }
    }
    throw error;
  }
};

export const updateUser = async (id, user) => {
  try {
    const connection = await pool.getConnection();
    const { name, email, password, user_type, assigned_facility_id, assigned_state } = user;
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password !== undefined && password !== '') {
      // Hash password before saving
      const hashedPassword = await hashPassword(password);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }
    if (user_type !== undefined) {
      updates.push('user_type = ?');
      values.push(user_type);
    }
    if (assigned_facility_id !== undefined) {
      updates.push('assigned_facility_id = ?');
      values.push(assigned_facility_id || null);
    }
    if (assigned_state !== undefined) {
      updates.push('assigned_state = ?');
      values.push(assigned_state || null);
    }
    
    if (updates.length === 0) {
      connection.release();
      return user;
    }
    
    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    await connection.query(query, values);
    connection.release();
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    connection.release();
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    // Check if email is verified
    if (!user.email_verified) {
      throw new Error('Email not verified. Please check your email for verification link.');
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Return user without sensitive fields
    const { password_hash, email_verification_token, verification_token_expires, ...userSafe } = user;
    return userSafe;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

export const verifyEmailToken = async (token) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email_verification_token = ? AND verification_token_expires > NOW()',
      [token]
    );
    
    if (!rows || rows.length === 0) {
      connection.release();
      return null;
    }
    
    const user = rows[0];
    
    // Mark email as verified
    await connection.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [user.id]
    );
    
    connection.release();
    return user;
  } catch (error) {
    console.error('Error verifying email token:', error);
    throw error;
  }
};

export const getUsersByType = async (user_type) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE user_type = ?',
      [user_type]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching users by type:', error);
    throw error;
  }
};

export const getUsersByFacility = async (facilityId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE assigned_facility_id = ?',
      [facilityId]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching users by facility:', error);
    throw error;
  }
};

export const getUsersByState = async (state) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE assigned_state = ?',
      [state]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching users by state:', error);
    throw error;
  }
};

/**
 * Transform database user object to frontend format
 * Database uses: user_type, assigned_facility_id, assigned_state
 * Frontend uses: role, facilityId, stateName
 */
export const transformUserToFrontend = (dbUser) => {
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    user_type: dbUser.user_type,
    assigned_facility_id: dbUser.assigned_facility_id,
    assigned_state: dbUser.assigned_state,
    email_verified: dbUser.email_verified
  };
};
