import pool from '../config/database.js';

export const getAuditPeriods = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, title, description, dateFrom, dateTo, status, createdAt FROM audit_periods ORDER BY dateFrom DESC'
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching audit periods:', error);
    throw error;
  }
};

export const getAuditPeriodById = async (id) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM audit_periods WHERE id = ?',
      [id]
    );
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching audit period:', error);
    throw error;
  }
};

export const createAuditPeriod = async (data) => {
  try {
    const connection = await pool.getConnection();
    const { id, title, description, dateFrom, dateTo, status } = data;

    await connection.query(
      `INSERT INTO audit_periods (id, title, description, dateFrom, dateTo, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, description, dateFrom, dateTo, status || 'active']
    );

    connection.release();
    return { id, title, description, dateFrom, dateTo, status: status || 'active' };
  } catch (error) {
    console.error('Error creating audit period:', error);
    throw error;
  }
};

export const updateAuditPeriod = async (id, data) => {
  try {
    const connection = await pool.getConnection();
    const { title, description, dateFrom, dateTo, status } = data;

    await connection.query(
      `UPDATE audit_periods
       SET title = ?, description = ?, dateFrom = ?, dateTo = ?, status = ?
       WHERE id = ?`,
      [title, description, dateFrom, dateTo, status, id]
    );

    connection.release();
    return { id, title, description, dateFrom, dateTo, status };
  } catch (error) {
    console.error('Error updating audit period:', error);
    throw error;
  }
};

export const deleteAuditPeriod = async (id) => {
  try {
    const connection = await pool.getConnection();

    // Check if any audits use this period
    const [audits] = await connection.query(
      'SELECT COUNT(*) as count FROM audits WHERE auditPeriodId = ?',
      [id]
    );

    if (audits[0].count > 0) {
      throw new Error('Cannot delete audit period that has associated audits');
    }

    await connection.query('DELETE FROM audit_periods WHERE id = ?', [id]);
    connection.release();
    return { success: true };
  } catch (error) {
    console.error('Error deleting audit period:', error);
    throw error;
  }
};
