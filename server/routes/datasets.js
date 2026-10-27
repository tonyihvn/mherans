/**
 * Datasets API Routes
 * CRUD operations for managing datasets obtained from external APIs
 */

import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET all datasets
router.get('/', (req, res) => {
  try {
    const query = `SELECT * FROM datasets ORDER BY created_at DESC`;
    db.all(query, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch datasets', details: err.message });
      }
      res.json({
        status: 'success',
        count: rows?.length || 0,
        data: rows || []
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// GET single dataset by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM datasets WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch dataset', details: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Dataset not found' });
      }
      
      // Try to parse JSON data
      try {
        row.data = JSON.parse(row.data || '[]');
      } catch (e) {
        row.data = [];
      }
      
      res.json({ status: 'success', data: row });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// CREATE new dataset
router.post('/', (req, res) => {
  try {
    const { name, apiUrl, description, data } = req.body;

    if (!name || !apiUrl || !data) {
      return res.status(400).json({ error: 'Name, API URL, and data are required' });
    }

    // Validate data is array
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }

    const dataJson = JSON.stringify(data);
    const now = new Date().toISOString();

    const query = `
      INSERT INTO datasets (id, name, api_url, description, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const id = `dataset_${Date.now()}`;

    db.run(
      query,
      [id, name, apiUrl, description || null, dataJson, now, now],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create dataset', details: err.message });
        }
        res.status(201).json({
          status: 'success',
          message: `Dataset "${name}" created successfully`,
          data: { id, name, apiUrl, description, rowCount: data.length }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// UPDATE dataset
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, apiUrl, description, data } = req.body;

    if (!name && !apiUrl && !description && !data) {
      return res.status(400).json({ error: 'At least one field must be provided for update' });
    }

    // Fetch existing dataset first
    const getQuery = `SELECT * FROM datasets WHERE id = ?`;
    db.get(getQuery, [id], (err, existingDataset) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch dataset', details: err.message });
      }
      if (!existingDataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      // Prepare update values
      const updatedName = name || existingDataset.name;
      const updatedApiUrl = apiUrl || existingDataset.api_url;
      const updatedDescription = description !== undefined ? description : existingDataset.description;
      const updatedData = data ? JSON.stringify(data) : existingDataset.data;
      const updatedAt = new Date().toISOString();

      const updateQuery = `
        UPDATE datasets 
        SET name = ?, api_url = ?, description = ?, data = ?, updated_at = ?
        WHERE id = ?
      `;

      db.run(
        updateQuery,
        [updatedName, updatedApiUrl, updatedDescription, updatedData, updatedAt, id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update dataset', details: err.message });
          }
          
          let parsedData = [];
          try {
            parsedData = JSON.parse(updatedData || '[]');
          } catch (e) {
            parsedData = [];
          }
          
          res.json({
            status: 'success',
            message: `Dataset "${updatedName}" updated successfully`,
            data: {
              id,
              name: updatedName,
              apiUrl: updatedApiUrl,
              description: updatedDescription,
              rowCount: parsedData.length,
              updatedAt
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// DELETE dataset
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // First get the dataset to know its name
    const getQuery = `SELECT name FROM datasets WHERE id = ?`;
    db.get(getQuery, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch dataset', details: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const deleteQuery = `DELETE FROM datasets WHERE id = ?`;
      db.run(deleteQuery, [id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete dataset', details: err.message });
        }
        res.json({
          status: 'success',
          message: `Dataset "${row.name}" deleted successfully`
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// SEARCH datasets by name
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchQuery = `SELECT id, name, api_url, description, created_at, updated_at FROM datasets WHERE name LIKE ? OR api_url LIKE ? ORDER BY created_at DESC`;
    const searchTerm = `%${query}%`;

    db.all(searchQuery, [searchTerm, searchTerm], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to search datasets', details: err.message });
      }
      res.json({
        status: 'success',
        count: rows?.length || 0,
        query,
        data: rows || []
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// GET dataset statistics
router.get('/stats/summary', (req, res) => {
  try {
    const countQuery = `SELECT COUNT(*) as total_datasets FROM datasets`;
    const sizeQuery = `SELECT SUM(LENGTH(data)) as total_size FROM datasets`;

    db.get(countQuery, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get statistics', details: err.message });
      }

      db.get(sizeQuery, (err, sizeResult) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to get statistics', details: err.message });
        }

        res.json({
          status: 'success',
          stats: {
            totalDatasets: countResult?.total_datasets || 0,
            totalSizeBytes: sizeResult?.total_size || 0,
            timestamp: new Date().toISOString()
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
