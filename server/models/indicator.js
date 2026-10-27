import pool from '../config/database.js';

export const getIndicators = async () => {
  try {
    console.log('[Indicators.getIndicators] Fetching all indicators');
    const connection = await pool.getConnection();
    
    console.log('[Indicators.getIndicators] Got database connection');
    
    const [indicators] = await connection.query(
      `SELECT id, name, unit, description, formula, category, dataSourceField, 
              thresholdHigh, thresholdMedium, thresholdLow, aggregationType, isActive
       FROM indicators 
       WHERE isActive = 1 
       ORDER BY category, name`
    );
    
    console.log(`[Indicators.getIndicators] Query executed successfully, found ${indicators.length} indicators`);
    connection.release();
    
    console.log('[Indicators.getIndicators] Connection released');
    console.log(`[Indicators.getIndicators] Returning ${indicators.length} indicator objects`);
    
    return indicators;
  } catch (error) {
    console.error('[Indicators.getIndicators] Error fetching indicators:', error.message);
    console.error('[Indicators.getIndicators] Error code:', error.code);
    console.error('[Indicators.getIndicators] Full error:', error);
    throw error;
  }
};

export const getIndicatorById = async (id) => {
  try {
    console.log(`[Indicators.getIndicatorById] Fetching indicator: ${id}`);
    const connection = await pool.getConnection();
    
    console.log('[Indicators.getIndicatorById] Got database connection');
    
    const [indicators] = await connection.query(
      `SELECT id, name, unit, description, formula, category, dataSourceField, 
              thresholdHigh, thresholdMedium, thresholdLow, aggregationType, isActive
       FROM indicators 
       WHERE id = ? AND isActive = 1`,
      [id]
    );
    
    connection.release();
    console.log('[Indicators.getIndicatorById] Connection released');
    
    if (indicators.length === 0) {
      console.log(`[Indicators.getIndicatorById] Indicator not found: ${id}`);
      return null;
    }
    
    console.log(`[Indicators.getIndicatorById] Found indicator: ${indicators[0].name}`);
    return indicators[0];
  } catch (error) {
    console.error('[Indicators.getIndicatorById] Error fetching indicator:', error.message);
    console.error('[Indicators.getIndicatorById] Error code:', error.code);
    console.error('[Indicators.getIndicatorById] Full error:', error);
    throw error;
  }
};

export const getIndicatorsByCategory = async (category) => {
  try {
    console.log(`[Indicators.getIndicatorsByCategory] Fetching indicators for category: ${category}`);
    const connection = await pool.getConnection();
    
    console.log('[Indicators.getIndicatorsByCategory] Got database connection');
    
    const [indicators] = await connection.query(
      `SELECT id, name, unit, description, formula, category, dataSourceField, 
              thresholdHigh, thresholdMedium, thresholdLow, aggregationType, isActive
       FROM indicators 
       WHERE category = ? AND isActive = 1 
       ORDER BY name`,
      [category]
    );
    
    connection.release();
    console.log('[Indicators.getIndicatorsByCategory] Connection released');
    
    console.log(`[Indicators.getIndicatorsByCategory] Found ${indicators.length} indicators in category`);
    return indicators;
  } catch (error) {
    console.error('[Indicators.getIndicatorsByCategory] Error fetching indicators:', error.message);
    console.error('[Indicators.getIndicatorsByCategory] Full error:', error);
    throw error;
  }
};

export const createIndicator = async (indicator) => {
  try {
    console.log('[Indicators.createIndicator] Starting indicator creation');
    const connection = await pool.getConnection();
    
    console.log('[Indicators.createIndicator] Got database connection');
    
    const id = indicator.id || 'ind_' + Date.now();
    
    console.log(`[Indicators.createIndicator] Creating indicator with ID: ${id}, Name: ${indicator.name}`);
    
    const [result] = await connection.query(
      `INSERT INTO indicators 
       (id, name, unit, description, formula, category, dataSourceField, thresholdHigh, thresholdMedium, thresholdLow, aggregationType) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        indicator.name,
        indicator.unit,
        indicator.description,
        indicator.formula || null,
        indicator.category || null,
        indicator.dataSourceField || null,
        indicator.thresholdHigh || null,
        indicator.thresholdMedium || null,
        indicator.thresholdLow || null,
        indicator.aggregationType || 'SUM'
      ]
    );
    
    console.log('[Indicators.createIndicator] Query executed successfully');
    connection.release();
    console.log('[Indicators.createIndicator] Connection released');
    
    return { id, ...indicator };
  } catch (error) {
    console.error('[Indicators.createIndicator] Error creating indicator:', error.message);
    console.error('[Indicators.createIndicator] Error code:', error.code);
    console.error('[Indicators.createIndicator] Full error:', error);
    throw error;
  }
};

export const updateIndicator = async (id, indicator) => {
  try {
    console.log(`[Indicators.updateIndicator] Updating indicator: ${id}`);
    const connection = await pool.getConnection();
    
    console.log('[Indicators.updateIndicator] Got database connection');
    
    const [result] = await connection.query(
      `UPDATE indicators 
       SET name = ?, unit = ?, description = ?, formula = ?, category = ?, 
           dataSourceField = ?, thresholdHigh = ?, thresholdMedium = ?, thresholdLow = ?
       WHERE id = ?`,
      [
        indicator.name,
        indicator.unit,
        indicator.description,
        indicator.formula || null,
        indicator.category || null,
        indicator.dataSourceField || null,
        indicator.thresholdHigh || null,
        indicator.thresholdMedium || null,
        indicator.thresholdLow || null,
        id
      ]
    );
    
    console.log('[Indicators.updateIndicator] Query executed successfully');
    connection.release();
    console.log('[Indicators.updateIndicator] Connection released');
    
    return { id, ...indicator };
  } catch (error) {
    console.error('[Indicators.updateIndicator] Error updating indicator:', error.message);
    console.error('[Indicators.updateIndicator] Full error:', error);
    throw error;
  }
};

export const deleteIndicator = async (id) => {
  try {
    console.log(`[Indicators.deleteIndicator] Soft-deleting indicator: ${id}`);
    const connection = await pool.getConnection();
    
    console.log('[Indicators.deleteIndicator] Got database connection');
    
    const [result] = await connection.query(
      `UPDATE indicators SET isActive = 0 WHERE id = ?`,
      [id]
    );
    
    console.log('[Indicators.deleteIndicator] Query executed successfully');
    connection.release();
    console.log('[Indicators.deleteIndicator] Connection released');
    
    return { success: true, id };
  } catch (error) {
    console.error('[Indicators.deleteIndicator] Error deleting indicator:', error.message);
    console.error('[Indicators.deleteIndicator] Full error:', error);
    throw error;
  }
};
