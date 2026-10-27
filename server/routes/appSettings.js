import express from 'express';
import * as AppSettingsModel from '../models/appSettings.js';

const router = express.Router();

// Get all app settings
router.get('/', async (req, res) => {
  try {
    const settings = await AppSettingsModel.getAllAppSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific app setting
router.get('/:key', async (req, res) => {
  try {
    const value = await AppSettingsModel.getAppSetting(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save app setting
router.post('/:key', async (req, res) => {
  try {
    const { value, description } = req.body;
    const result = await AppSettingsModel.saveAppSetting(req.params.key, value, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update app setting
router.put('/:key', async (req, res) => {
  try {
    const { value, description } = req.body;
    const result = await AppSettingsModel.saveAppSetting(req.params.key, value, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete app setting
router.delete('/:key', async (req, res) => {
  try {
    const result = await AppSettingsModel.deleteAppSetting(req.params.key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
