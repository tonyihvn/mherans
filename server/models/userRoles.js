import pool from '../config/database.js';

export const getUserRoles = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM user_roles ORDER BY name');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

export const getRoleById = async (roleId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM user_roles WHERE id = ?', [roleId]);
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
};

export const createUserRole = async (data) => {
  try {
    const connection = await pool.getConnection();
    const { id, name, description, permissions } = data;
    const permissionsJson = JSON.stringify(permissions || {});

    await connection.query(
      `INSERT INTO user_roles (id, name, description, permissions)
       VALUES (?, ?, ?, ?)`,
      [id, name, description, permissionsJson]
    );

    connection.release();
    return { id, name, description, permissions };
  } catch (error) {
    console.error('Error creating user role:', error);
    throw error;
  }
};

export const updateUserRole = async (roleId, data) => {
  try {
    const connection = await pool.getConnection();
    const { name, description, permissions } = data;
    const permissionsJson = JSON.stringify(permissions || {});

    await connection.query(
      `UPDATE user_roles
       SET name = ?, description = ?, permissions = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, permissionsJson, roleId]
    );

    connection.release();
    return { id: roleId, name, description, permissions };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUserRole = async (roleId) => {
  try {
    const connection = await pool.getConnection();

    // Check if any users have this role
    const [users] = await connection.query(
      'SELECT COUNT(*) as count FROM users WHERE user_type = ?',
      [roleId]
    );

    if (users[0].count > 0) {
      connection.release();
      throw new Error('Cannot delete role with assigned users');
    }

    await connection.query('DELETE FROM user_roles WHERE id = ?', [roleId]);
    connection.release();
    return { success: true };
  } catch (error) {
    console.error('Error deleting user role:', error);
    throw error;
  }
};
