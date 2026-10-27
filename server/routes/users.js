import express from 'express';
import * as UserModel from '../models/user.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { generateVerificationToken } from '../services/passwordService.js';
import { transformUserToFrontend } from '../models/user.js';

const router = express.Router();

// Register new user - All new users are PUBLIC_LITE by default
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Check if user already exists
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Create user as PUBLIC_LITE
    const newUser = await UserModel.createUser({
      email,
      password,
      name,
      user_type: 'PUBLIC_LITE'
    });
    
    // Send verification email with timeout
    try {
      const emailTimeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Email service timeout - please try again later')), 10000);
      });
      
      await Promise.race([
        sendVerificationEmail(email, newUser.verificationToken, name),
        emailTimeout
      ]);
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      // Don't fail registration if email service is down - user can resend verification later
      console.warn('Verification email could not be sent, but user was created');
    }
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: transformUserToFrontend(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    const user = await UserModel.verifyEmailToken(token);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    res.json({
      message: 'Email verified successfully',
      user: transformUserToFrontend(user)
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: error.message || 'Email verification failed' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await UserModel.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    // Generate new token
    const { generateVerificationToken } = await import('../services/passwordService.js');
    const newToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Update user with new token
    const connection = await (await import('../config/database.js')).default.getConnection();
    await connection.query(
      'UPDATE users SET email_verification_token = ?, verification_token_expires = ? WHERE id = ?',
      [newToken, tokenExpires, user.id]
    );
    connection.release();
    
    // Send verification email
    await sendVerificationEmail(email, newToken, user.name);
    
    res.json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to resend verification email' });
  }
});

// Login endpoint - users login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await UserModel.authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({
      message: 'Login successful',
      user: transformUserToFrontend(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Get all users (admin only - should add auth middleware)
router.get('/', async (req, res) => {
  try {
    const users = await UserModel.getUsers();
    // Transform to frontend format
    const transformedUsers = users.map(transformUserToFrontend);
    res.json(transformedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Transform to frontend format
    res.json(transformUserToFrontend(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (Admin only - to create STATE_USER, FACILITY_USER, VALIDATOR, or ADMIN)
router.post('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware to verify admin
    let { email, password, name, user_type, assigned_facility_id, assigned_state } = req.body;
    
    // Validate
    if (!email || !password || !name || !user_type) {
      return res.status(400).json({ error: 'Email, password, name, and user_type are required' });
    }
    
    // Validate: FACILITY_USER must have assigned_facility_id
    if (user_type === 'FACILITY_USER' && !assigned_facility_id) {
      return res.status(400).json({ error: 'FACILITY_USER role requires assigned_facility_id' });
    }
    
    // Auto-promote to FACILITY_USER if facility is assigned and not FACILITY_ADMIN
    if (assigned_facility_id && user_type !== 'FACILITY_ADMIN') {
      user_type = 'FACILITY_USER';
    }
    
    // Only admin can create non-PUBLIC_LITE users
    if (user_type === 'PUBLIC_LITE') {
      return res.status(400).json({ error: 'Use /register endpoint for public users' });
    }
    
    // Check if user already exists
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Create user with specified type
    const newUser = await UserModel.createUser({
      email,
      password,
      name,
      user_type,
      assigned_facility_id,
      assigned_state
    });
    
    // Send verification email
    await sendVerificationEmail(email, newUser.verificationToken, name);
    
    res.status(201).json({
      message: 'User created successfully',
      user: transformUserToFrontend(newUser)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    let { name, email, password, user_type, assigned_facility_id, assigned_state } = req.body;
    
    // Validate: FACILITY_USER must have assigned_facility_id
    if (user_type === 'FACILITY_USER' && !assigned_facility_id) {
      return res.status(400).json({ error: 'FACILITY_USER role requires assigned_facility_id' });
    }
    
    // Auto-promote to FACILITY_USER if facility is assigned and not FACILITY_ADMIN
    if (assigned_facility_id && user_type !== 'FACILITY_ADMIN') {
      user_type = 'FACILITY_USER';
    }
    
    const user = await UserModel.updateUser(req.params.id, {
      name,
      email,
      password,
      user_type,
      assigned_facility_id,
      assigned_state
    });
    res.json(transformUserToFrontend(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await UserModel.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        message: 'If an account exists with this email, a password reset link will be sent.' 
      });
    }
    
    // Generate reset token
    const { generateResetToken } = await import('../services/passwordService.js');
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Update user with reset token
    const connection = await (await import('../config/database.js')).default.getConnection();
    try {
      await connection.query(
        'UPDATE users SET password_reset_token = ?, password_reset_token_expires = ? WHERE id = ?',
        [resetToken, resetTokenExpires, user.id]
      );
    } finally {
      connection.release();
    }
    
    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.name);
    
    res.json({ 
      message: 'If an account exists with this email, a password reset link will be sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Failed to process forgot password request' });
  }
});

// Reset Password - Verify token and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const connection = await (await import('../config/database.js')).default.getConnection();
    try {
      // Find user with valid reset token
      const [users] = await connection.query(
        'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_token_expires > NOW()',
        [token]
      );
      
      if (users.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      const user = users[0];
      
      // Hash new password
      const { hashPassword } = await import('../services/passwordService.js');
      const newPasswordHash = await hashPassword(password);
      
      // Update password and clear reset token
      await connection.query(
        'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_token_expires = NULL WHERE id = ?',
        [newPasswordHash, user.id]
      );
      
      res.json({
        message: 'Password reset successfully. You can now login with your new password.',
        user: transformUserToFrontend(user)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[Users] DELETE /:id - deleting user: ${req.params.id}`);
    await UserModel.deleteUser(req.params.id);
    console.log(`[Users] Successfully deleted user: ${req.params.id}`);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('[Users] Error deleting user:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
