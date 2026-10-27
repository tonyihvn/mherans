import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to transform DB row to API format
const transformFacility = (row) => {
  if (!row) return null;
  
  // Ensure latitude and longitude are numbers
  const lat = row.latitude ? parseFloat(row.latitude) : null;
  const lng = row.longitude ? parseFloat(row.longitude) : null;
  
  return {
    ...row,
    // Map ID to hfr_id if hfr_id doesn't exist
    hfr_id: row.hfr_id || row.id,
    // Map tier to level if level doesn't exist
    level: row.level || row.tier || 'Unknown',
    // Ensure numeric coordinates
    latitude: lat,
    longitude: lng,
    // Add multiple coordinate formats for frontend flexibility
    coordinates: lat && lng ? [lat, lng] : [0, 0],
    // Structure location data for MapDashboard
    location: {
      state_code: row.state_code || row.state,
      lga_name: row.lga_name || row.lga,
      coordinates: lat && lng ? { lat, lng } : null,
      latitude: lat,
      longitude: lng
    }
  };
};

export const getFacilities = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM facilities');
    connection.release();
    return rows.map(transformFacility);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    throw error;
  }
};

export const getFacilityById = async (id) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM facilities WHERE id = ? OR id = ?', [id, id]);
    connection.release();
    return transformFacility(rows[0] || null);
  } catch (error) {
    console.error('Error fetching facility:', error);
    throw error;
  }
};

export const createFacility = async (facility) => {
  let connection;
  try {
    console.log('[Facility.create] Starting facility creation');
    connection = await pool.getConnection();
    console.log('[Facility.create] Got database connection');
    
    // Generate ID if not provided - use hfr_id as primary key or generate UUID
    const facilityId = facility.id || facility.hfr_id || uuidv4();
    const {
      name,
      state,
      lga,
      latitude,
      longitude,
      region,
      ownership,
      tier,
      criticality,
      pilotFocus,
      isPrivate,
      level,
      state_code,
      lga_name
    } = facility;
    
    console.log(`[Facility.create] Creating facility with ID: ${facilityId}, Name: ${name}`);
    
    const query = `INSERT INTO facilities (id, name, state, lga, latitude, longitude, region, ownership, tier, criticality, pilotFocus, isPrivate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      facilityId,
      name,
      state || state_code,
      lga || lga_name,
      latitude,
      longitude,
      region,
      ownership,
      tier || level,
      criticality,
      pilotFocus,
      isPrivate || false
    ];
    
    console.log('[Facility.create] Executing INSERT query with values:', values);
    
    const result = await connection.query(query, values);
    console.log('[Facility.create] Query executed successfully, result:', result);
    
    connection.release();
    console.log('[Facility.create] Connection released');
    
    const response = transformFacility({ ...facility, id: facilityId });
    console.log('[Facility.create] Returning facility object:', response);
    return response;
  } catch (error) {
    console.error('[Facility.create] Error creating facility:', error.message);
    console.error('[Facility.create] Error code:', error.code);
    console.error('[Facility.create] Error SQL:', error.sql);
    console.error('[Facility.create] Full error:', error);
    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('[Facility.create] Error releasing connection:', e);
      }
    }
    throw error;
  }
};

export const updateFacility = async (id, facility) => {
  try {
    const connection = await pool.getConnection();
    const { name, state, lga, latitude, longitude, region, ownership, tier, criticality, pilotFocus, isPrivate } = facility;
    
    await connection.query(
      `UPDATE facilities SET name = ?, state = ?, lga = ?, latitude = ?, longitude = ?, region = ?, ownership = ?, tier = ?, criticality = ?, pilotFocus = ?, isPrivate = ? WHERE id = ?`,
      [name, state, lga, latitude, longitude, region, ownership, tier, criticality, pilotFocus, isPrivate, id]
    );
    connection.release();
    return transformFacility(facility);
  } catch (error) {
    console.error('Error updating facility:', error);
    throw error;
  }
};

export const deleteFacility = async (id) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM facilities WHERE id = ?', [id]);
    connection.release();
    return true;
  } catch (error) {
    console.error('Error deleting facility:', error);
    throw error;
  }
};
