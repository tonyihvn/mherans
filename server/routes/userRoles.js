import express from 'express';
import * as UserRolesModel from '../models/userRoles.js';

const router = express.Router();

// Get all user roles
router.get('/', async (req, res) => {
  try {
    const roles = await UserRolesModel.getUserRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific user role
router.get('/:id', async (req, res) => {
  try {
    const role = await UserRolesModel.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user role
router.post('/', async (req, res) => {
  try {
    const { id, name, description, permissions } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' });
    }

    const role = await UserRolesModel.createUserRole({
      id,
      name,
      description,
      permissions
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/:id', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    const role = await UserRolesModel.updateUserRole(req.params.id, {
      name,
      description,
      permissions
    });

    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user role
router.delete('/:id', async (req, res) => {
  try {
    const result = await UserRolesModel.deleteUserRole(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
