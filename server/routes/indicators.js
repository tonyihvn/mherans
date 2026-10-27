import express from 'express';
import * as IndicatorModel from '../models/indicator.js';

const router = express.Router();

// Get all indicators
router.get('/', async (req, res) => {
  try {
    console.log('[Indicators] GET / - fetching all indicators');
    const indicators = await IndicatorModel.getIndicators();
    console.log(`[Indicators] Retrieved ${indicators.length} indicators from database`);
    res.json(indicators);
  } catch (error) {
    console.error('[Indicators] Error fetching indicators:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

// Get indicator by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[Indicators] GET /:id - fetching indicator: ${req.params.id}`);
    const indicator = await IndicatorModel.getIndicatorById(req.params.id);
    if (!indicator) {
      console.log(`[Indicators] Indicator not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Indicator not found' });
    }
    console.log(`[Indicators] Retrieved indicator: ${indicator.name}`);
    res.json(indicator);
  } catch (error) {
    console.error('[Indicators] Error fetching indicator:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

// Get indicators by category
router.get('/category/:category', async (req, res) => {
  try {
    console.log(`[Indicators] GET /category/:category - fetching indicators for: ${req.params.category}`);
    const indicators = await IndicatorModel.getIndicatorsByCategory(req.params.category);
    console.log(`[Indicators] Retrieved ${indicators.length} indicators in category`);
    res.json(indicators);
  } catch (error) {
    console.error('[Indicators] Error fetching indicators by category:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

// Create indicator (admin only)
router.post('/', async (req, res) => {
  try {
    console.log('[Indicators] POST / - creating new indicator');
    console.log('[Indicators] Request body:', JSON.stringify(req.body).substring(0, 300));
    const indicator = await IndicatorModel.createIndicator(req.body);
    console.log(`[Indicators] Successfully created indicator: ${indicator.id} - ${indicator.name}`);
    res.status(201).json(indicator);
  } catch (error) {
    console.error('[Indicators] Error creating indicator:', error.message);
    console.error('[Indicators] Full error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Update indicator (admin only)
router.put('/:id', async (req, res) => {
  try {
    console.log(`[Indicators] PUT /:id - updating indicator: ${req.params.id}`);
    const indicator = await IndicatorModel.updateIndicator(req.params.id, req.body);
    console.log(`[Indicators] Successfully updated indicator: ${indicator.id} - ${indicator.name}`);
    res.json(indicator);
  } catch (error) {
    console.error('[Indicators] Error updating indicator:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete indicator (admin only) - soft delete
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[Indicators] DELETE /:id - deleting indicator: ${req.params.id}`);
    const result = await IndicatorModel.deleteIndicator(req.params.id);
    console.log(`[Indicators] Successfully deleted indicator: ${req.params.id}`);
    res.json(result);
  } catch (error) {
    console.error('[Indicators] Error deleting indicator:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
