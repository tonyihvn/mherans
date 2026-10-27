import pool from '../config/database.js';

export const runMigration = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Create datasets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS datasets (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        api_url VARCHAR(500) NOT NULL,
        description TEXT,
        data LONGTEXT NOT NULL,
        facility_links TEXT,
        created_by VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_name (name)
      )
    `);

    // Create dataset_facility_links table for many-to-many relationship
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dataset_facility_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dataset_id VARCHAR(100) NOT NULL,
        facility_id VARCHAR(50) NOT NULL,
        record_index INT DEFAULT 0,
        linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(50),
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
        FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
        UNIQUE KEY unique_link (dataset_id, facility_id),
        INDEX idx_facility (facility_id)
      )
    `);

    console.log('✓ Datasets and dataset_facility_links tables created');
    
    connection.release();
  } catch (error) {
    console.error('Migration error:', error.message);
    if (connection) connection.release();
    throw error;
  }
};
