/**
 * Password Utility - NHERAMS
 * Handles password hashing and verification
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

export const verifyPassword = async (password, hash) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
