import pool from '../config/database.js';

export const getAppSetting = async (key) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT settingValue FROM app_settings WHERE settingKey = ?',
      [key]
    );
    connection.release();
    return rows.length > 0 ? rows[0].settingValue : null;
  } catch (error) {
    console.error('Error fetching app setting:', error);
    throw error;
  }
};

export const getAllAppSettings = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT settingKey, settingValue FROM app_settings');
    connection.release();
    return rows.reduce((acc, row) => {
      acc[row.settingKey] = row.settingValue;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching app settings:', error);
    throw error;
  }
};

export const saveAppSetting = async (key, value, description = null) => {
  try {
    const connection = await pool.getConnection();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await connection.query(
      `INSERT INTO app_settings (settingKey, settingValue, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue), description = VALUES(description)`,
      [key, stringValue, description]
    );

    connection.release();
    return { key, value };
  } catch (error) {
    console.error('Error saving app setting:', error);
    throw error;
  }
};

export const deleteAppSetting = async (key) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM app_settings WHERE settingKey = ?', [key]);
    connection.release();
    return { success: true };
  } catch (error) {
    console.error('Error deleting app setting:', error);
    throw error;
  }
};
