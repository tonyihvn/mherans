import express from 'express';
import * as DatasetModel from '../models/dataset.js';

const router = express.Router();

// GET all datasets
router.get('/', async (req, res) => {
  try {
    const datasets = await DatasetModel.getDatasets();
    // Don't return full data in list, just metadata
    const response = datasets.map(d => ({
      id: d.id,
      name: d.name,
      api_url: d.api_url,
      description: d.description,
      created_by: d.created_by,
      created_at: d.created_at,
      updated_at: d.updated_at,
      rowCount: d.data ? (JSON.parse(d.data).length || 0) : 0
    }));
    res.json({ status: 'success', data: response });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET single dataset by ID with full data
router.get('/:id', async (req, res) => {
  try {
    const dataset = await DatasetModel.getDatasetById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ status: 'error', message: 'Dataset not found' });
    }
    res.json({ status: 'success', data: dataset });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET datasets by facility
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const datasets = await DatasetModel.getDatasetsByFacility(req.params.facilityId);
    res.json({ status: 'success', data: datasets });
  } catch (error) {
    console.error('Error fetching facility datasets:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// CREATE new dataset
router.post('/', async (req, res) => {
  try {
    console.log('[Datasets] POST request received');
    const { name, apiUrl, description, data, createdBy } = req.body;

    console.log('[Datasets] Creating dataset:', { name, apiUrl, rowCount: Array.isArray(data) ? data.length : 0 });

    if (!name || !apiUrl || !data) {
      console.log('[Datasets] Validation failed - missing required fields');
      return res.status(400).json({ 
        status: 'error', 
        message: 'Name, API URL, and data are required' 
      });
    }

    if (!Array.isArray(data)) {
      console.log('[Datasets] Validation failed - data is not an array');
      return res.status(400).json({ 
        status: 'error', 
        message: 'Data must be an array' 
      });
    }

    console.log('[Datasets] Validation passed, calling createDataset...');
    const result = await DatasetModel.createDataset(name, apiUrl, description, data, createdBy);
    
    console.log('[Datasets] Dataset created successfully:', result);
    res.status(201).json({ 
      status: 'success', 
      message: `Dataset "${name}" created successfully`,
      data: result 
    });
  } catch (error) {
    console.error('[Datasets] Error in POST route:', error.message, error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// UPDATE dataset
router.put('/:id', async (req, res) => {
  try {
    const { name, apiUrl, description, data } = req.body;

    if (!name && !apiUrl && !description && !data) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'At least one field must be provided for update' 
      });
    }

    const result = await DatasetModel.updateDataset(req.params.id, name, apiUrl, description, data);
    res.json({ 
      status: 'success', 
      message: 'Dataset updated successfully',
      data: result 
    });
  } catch (error) {
    console.error('Error updating dataset:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE dataset
router.delete('/:id', async (req, res) => {
  try {
    await DatasetModel.deleteDataset(req.params.id);
    res.json({ 
      status: 'success', 
      message: 'Dataset deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// LINK dataset to facility
router.post('/:datasetId/link/:facilityId', async (req, res) => {
  try {
    const { datasetId, facilityId } = req.params;
    const { recordIndex = 0, createdBy } = req.body;

    await DatasetModel.linkDatasetToFacility(datasetId, facilityId, recordIndex, createdBy);
    res.json({ 
      status: 'success', 
      message: `Dataset linked to facility successfully` 
    });
  } catch (error) {
    console.error('Error linking dataset:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// UNLINK dataset from facility
router.delete('/:datasetId/link/:facilityId', async (req, res) => {
  try {
    const { datasetId, facilityId } = req.params;

    await DatasetModel.unlinkDatasetFromFacility(datasetId, facilityId);
    res.json({ 
      status: 'success', 
      message: `Dataset unlinked from facility successfully` 
    });
  } catch (error) {
    console.error('Error unlinking dataset:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// SEARCH datasets
router.get('/search/:query', async (req, res) => {
  try {
    const results = await DatasetModel.searchDatasets(req.params.query);
    res.json({ status: 'success', data: results });
  } catch (error) {
    console.error('Error searching datasets:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
