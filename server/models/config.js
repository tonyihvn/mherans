import pool from '../config/database.js';

export const getConfig = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM indicator_config LIMIT 1');
    connection.release();
    
    if (rows.length === 0) {
      // Return default config if none exists
      return {
        dieselFactor: 2.68,
        gridFactor: 0.5,
        wasteFactor: 0.95,
        resilienceThreshold: 70
      };
    }
    
    const { id, createdAt, updatedAt, ...config } = rows[0];
    return config;
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
};

export const updateConfig = async (config) => {
  try {
    const connection = await pool.getConnection();
    const { dieselFactor, gridFactor, wasteFactor, resilienceThreshold } = config;
    
    // Check if config exists
    const [rows] = await connection.query('SELECT * FROM indicator_config LIMIT 1');
    
    if (rows.length === 0) {
      // Insert new config
      await connection.query(
        `INSERT INTO indicator_config (dieselFactor, gridFactor, wasteFactor, resilienceThreshold) 
         VALUES (?, ?, ?, ?)`,
        [dieselFactor, gridFactor, wasteFactor, resilienceThreshold]
      );
    } else {
      // Update existing config
      await connection.query(
        `UPDATE indicator_config SET dieselFactor = ?, gridFactor = ?, wasteFactor = ?, resilienceThreshold = ?`,
        [dieselFactor, gridFactor, wasteFactor, resilienceThreshold]
      );
    }
    
    connection.release();
    return config;
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
};
