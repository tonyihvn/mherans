import express from 'express';
import * as ConfigModel from '../models/config.js';

const router = express.Router();

// Get config
router.get('/', async (req, res) => {
  try {
    const config = await ConfigModel.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update config
router.put('/', async (req, res) => {
  try {
    const config = await ConfigModel.updateConfig(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
