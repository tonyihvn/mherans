import pool from '../config/database.js';
import { randomUUID } from 'crypto';

/**
 * Get all datasets
 */
export const getDatasets = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM datasets ORDER BY created_at DESC');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
};

/**
 * Get dataset by ID
 */
export const getDatasetById = async (datasetId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM datasets WHERE id = ?', [datasetId]);
    connection.release();
    if (rows.length === 0) return null;
    const dataset = rows[0];
    
    // Parse JSON data
    try {
      dataset.data = JSON.parse(dataset.data || '[]');
    } catch (e) {
      dataset.data = [];
    }
    
    return dataset;
  } catch (error) {
    console.error('Error fetching dataset:', error);
    throw error;
  }
};

/**
 * Create new dataset
 */
export const createDataset = async (name, apiUrl, description, data, createdBy) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const datasetId = `dataset_${randomUUID()}`;
    const dataJson = JSON.stringify(data);
    const now = new Date().toISOString();

    console.log(`[Dataset] Creating dataset: ${name} with ${Array.isArray(data) ? data.length : 1} records`);

    const result = await connection.query(
      'INSERT INTO datasets (id, name, api_url, description, data, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [datasetId, name, apiUrl, description || null, dataJson, createdBy || null, now, now]
    );

    console.log(`[Dataset] Successfully created dataset: ${datasetId}`);
    connection.release();
    
    return {
      id: datasetId,
      name,
      apiUrl,
      description,
      rowCount: Array.isArray(data) ? data.length : 1,
      createdAt: now
    };
  } catch (error) {
    if (connection) connection.release();
    console.error('[Dataset] Error creating dataset:', error.message, error);
    throw error;
  }
};

/**
 * Update existing dataset
 */
export const updateDataset = async (datasetId, name, apiUrl, description, data) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const dataJson = data ? JSON.stringify(data) : null;
    const now = new Date().toISOString();

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (apiUrl) {
      updates.push('api_url = ?');
      params.push(apiUrl);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description || null);
    }
    if (dataJson) {
      updates.push('data = ?');
      params.push(dataJson);
    }
    
    updates.push('updated_at = ?');
    params.push(now);
    params.push(datasetId);

    if (updates.length > 1) {
      // At least updated_at
      console.log(`[Dataset] Updating dataset: ${datasetId}`);
      await connection.query(
        `UPDATE datasets SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      console.log(`[Dataset] Successfully updated dataset: ${datasetId}`);
    }

    connection.release();
    return {
      id: datasetId,
      name: name || 'Dataset',
      apiUrl: apiUrl || '',
      description,
      rowCount: data && Array.isArray(data) ? data.length : 0,
      updatedAt: now
    };
  } catch (error) {
    if (connection) connection.release();
    console.error('[Dataset] Error updating dataset:', error.message, error);
    throw error;
  }
};

/**
 * Delete dataset
 */
export const deleteDataset = async (datasetId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log(`[Dataset] Deleting dataset: ${datasetId}`);
    
    // Delete facility links first
    await connection.query('DELETE FROM dataset_facility_links WHERE dataset_id = ?', [datasetId]);
    
    // Delete dataset
    await connection.query('DELETE FROM datasets WHERE id = ?', [datasetId]);
    
    console.log(`[Dataset] Successfully deleted dataset: ${datasetId}`);
    
    connection.release();
    return true;
  } catch (error) {
    if (connection) connection.release();
    console.error('[Dataset] Error deleting dataset:', error.message, error);
    throw error;
  }
};

/**
 * Link dataset to facility
 */
export const linkDatasetToFacility = async (datasetId, facilityId, recordIndex = 0, createdBy = null) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log(`[Dataset] Linking dataset ${datasetId} to facility ${facilityId}`);
    
    await connection.query(
      'INSERT INTO dataset_facility_links (dataset_id, facility_id, record_index, created_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE record_index = ?, created_by = ?, linked_at = CURRENT_TIMESTAMP',
      [datasetId, facilityId, recordIndex, createdBy, recordIndex, createdBy]
    );
    
    console.log(`[Dataset] Successfully linked dataset to facility`);
    
    connection.release();
    return true;
  } catch (error) {
    if (connection) connection.release();
    console.error('[Dataset] Error linking dataset:', error.message, error);
    throw error;
  }
};

/**
 * Get datasets linked to a facility
 */
export const getDatasetsByFacility = async (facilityId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, dfl.record_index 
      FROM datasets d
      INNER JOIN dataset_facility_links dfl ON d.id = dfl.dataset_id
      WHERE dfl.facility_id = ?
      ORDER BY dfl.linked_at DESC
    `, [facilityId]);
    
    connection.release();
    
    return rows.map(row => {
      try {
        row.data = JSON.parse(row.data || '[]');
      } catch (e) {
        row.data = [];
      }
      return row;
    });
  } catch (error) {
    console.error('[Dataset] Error fetching facility datasets:', error.message, error);
    throw error;
  }
};

/**
 * Unlink dataset from facility
 */
export const unlinkDatasetFromFacility = async (datasetId, facilityId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log(`[Dataset] Unlinking dataset ${datasetId} from facility ${facilityId}`);
    
    await connection.query(
      'DELETE FROM dataset_facility_links WHERE dataset_id = ? AND facility_id = ?',
      [datasetId, facilityId]
    );
    
    console.log(`[Dataset] Successfully unlinked dataset from facility`);
    
    connection.release();
    return true;
  } catch (error) {
    if (connection) connection.release();
    console.error('[Dataset] Error unlinking dataset:', error.message, error);
    throw error;
  }
};

/**
 * Search datasets by name or API URL
 */
export const searchDatasets = async (query) => {
  try {
    const connection = await pool.getConnection();
    const searchTerm = `%${query}%`;
    const [rows] = await connection.query(
      'SELECT * FROM datasets WHERE name LIKE ? OR api_url LIKE ? OR description LIKE ? ORDER BY created_at DESC',
      [searchTerm, searchTerm, searchTerm]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('[Dataset] Error searching datasets:', error.message, error);
    throw error;
  }
};
