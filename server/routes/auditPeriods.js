import express from 'express';
import * as AuditPeriodModel from '../models/auditPeriod.js';

const router = express.Router();

// Get all audit periods
router.get('/', async (req, res) => {
  try {
    const periods = await AuditPeriodModel.getAuditPeriods();
    res.json(periods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit period by ID
router.get('/:id', async (req, res) => {
  try {
    const period = await AuditPeriodModel.getAuditPeriodById(req.params.id);
    if (!period) {
      return res.status(404).json({ error: 'Audit period not found' });
    }
    res.json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create audit period
router.post('/', async (req, res) => {
  try {
    const { id, title, description, dateFrom, dateTo, status } = req.body;

    if (!id || !title || !dateFrom || !dateTo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const period = await AuditPeriodModel.createAuditPeriod({
      id,
      title,
      description,
      dateFrom,
      dateTo,
      status
    });

    res.status(201).json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update audit period
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dateFrom, dateTo, status } = req.body;

    if (!title || !dateFrom || !dateTo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const period = await AuditPeriodModel.updateAuditPeriod(req.params.id, {
      title,
      description,
      dateFrom,
      dateTo,
      status
    });

    res.json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete audit period
router.delete('/:id', async (req, res) => {
  try {
    const result = await AuditPeriodModel.deleteAuditPeriod(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
