import express from 'express';
import * as FacilityModel from '../models/facility.js';

const router = express.Router();

// Get all facilities
router.get('/', async (req, res) => {
  try {
    console.log('[Facilities] GET / - fetching all facilities');
    const facilities = await FacilityModel.getFacilities();
    console.log(`[Facilities] Retrieved ${facilities.length} facilities from database`);
    res.json(facilities);
  } catch (error) {
    console.error('[Facilities] Error fetching facilities:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

// Get facility by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[Facilities] GET /:id - fetching facility: ${req.params.id}`);
    const facility = await FacilityModel.getFacilityById(req.params.id);
    if (!facility) {
      console.log(`[Facilities] Facility not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Facility not found' });
    }
    console.log(`[Facilities] Retrieved facility: ${facility.name}`);
    res.json(facility);
  } catch (error) {
    console.error('[Facilities] Error fetching facility:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

// Create facility
router.post('/', async (req, res) => {
  try {
    console.log('[Facilities] POST / - creating new facility');
    console.log('[Facilities] Request body:', JSON.stringify(req.body).substring(0, 300));
    const facility = await FacilityModel.createFacility(req.body);
    console.log(`[Facilities] Successfully created facility: ${facility.id} - ${facility.name}`);
    res.status(201).json(facility);
  } catch (error) {
    console.error('[Facilities] Error creating facility:', error.message);
    console.error('[Facilities] Full error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Update facility
router.put('/:id', async (req, res) => {
  try {
    console.log(`[Facilities] PUT /:id - updating facility: ${req.params.id}`);
    const facility = await FacilityModel.updateFacility(req.params.id, req.body);
    console.log(`[Facilities] Successfully updated facility: ${facility.name}`);
    res.json(facility);
  } catch (error) {
    console.error('[Facilities] Error updating facility:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

// Delete facility
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[Facilities] DELETE /:id - deleting facility: ${req.params.id}`);
    await FacilityModel.deleteFacility(req.params.id);
    console.log(`[Facilities] Successfully deleted facility: ${req.params.id}`);
    res.json({ message: 'Facility deleted' });
  } catch (error) {
    console.error('[Facilities] Error deleting facility:', error.message, error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
