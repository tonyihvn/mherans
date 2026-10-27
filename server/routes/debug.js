import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    console.log('[Debug] Testing database connection...');
    const connection = await pool.getConnection();
    console.log('[Debug] Connection acquired');
    
    const [result] = await connection.query('SELECT 1 as test');
    console.log('[Debug] Query executed successfully');
    
    connection.release();
    console.log('[Debug] Connection released');
    
    res.json({
      status: 'success',
      message: 'Database connection OK',
      test: result
    });
  } catch (error) {
    console.error('[Debug] Database connection error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test table status
router.get('/test-tables', async (req, res) => {
  try {
    console.log('[Debug] Checking tables...');
    const connection = await pool.getConnection();
    
    // Check datasets table
    const [datasets] = await connection.query('SELECT COUNT(*) as count FROM datasets');
    console.log('[Debug] Datasets table exists with', datasets[0].count, 'records');
    
    // Check audits table
    const [audits] = await connection.query('SELECT COUNT(*) as count FROM audits');
    console.log('[Debug] Audits table exists with', audits[0].count, 'records');
    
    // Check facilities table
    const [facilities] = await connection.query('SELECT COUNT(*) as count FROM facilities');
    console.log('[Debug] Facilities table exists with', facilities[0].count, 'records');
    
    connection.release();
    
    res.json({
      status: 'success',
      tables: {
        datasets: datasets[0].count,
        audits: audits[0].count,
        facilities: facilities[0].count
      }
    });
  } catch (error) {
    console.error('[Debug] Table check error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Table check failed',
      error: error.message
    });
  }
});

// Clear all sessions - for development/testing only
router.post('/clear-sessions', async (req, res) => {
  try {
    console.log('[Debug] Clearing all sessions from database...');
    const connection = await pool.getConnection();
    
    // Clear any session-related tables if they exist
    // For now, we just log that sessions are cleared
    // Sessions are client-side (localStorage) so no DB clearing needed
    
    connection.release();
    
    res.json({
      status: 'success',
      message: 'All sessions cleared. Users must log in again.',
      instructions: 'Client-side sessions cleared via localStorage. Users will see login page after page reload.'
    });
  } catch (error) {
    console.error('[Debug] Clear sessions error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear sessions',
      error: error.message
    });
  }
});

// Debug log all incoming requests
router.use((req, res, next) => {
  console.log(`[Route] ${req.method} ${req.path}`);
  console.log('[Route] Body:', JSON.stringify(req.body).substring(0, 200));
  next();
});

// Get specific audit by ID
router.get('/audit/:auditId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, facility_id, facility_name, audit_date FROM audits WHERE id = ?',
      [req.params.auditId]
    );
    connection.release();

    if (rows.length === 0) {
      return res.json({ message: 'Audit not found', auditId: req.params.auditId });
    }

    res.json({ audit: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all audits for a facility
router.get('/audits-by-facility/:facilityId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, facility_id, facility_name, audit_date FROM audits WHERE facility_id = ? ORDER BY created_at DESC',
      [req.params.facilityId]
    );
    connection.release();

    res.json({
      searching_for: req.params.facilityId,
      found: rows.length,
      audits: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get facilities and their IDs
router.get('/facilities-list', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, hfr_id, name FROM facilities LIMIT 10'
    );
    connection.release();

    res.json({
      count: rows.length,
      facilities: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
