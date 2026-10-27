import pool from './config/database.js';

const INDICATORS = [
  {
    id: 'ind_grid_uptime',
    name: 'Grid Uptime %',
    unit: '%',
    description: 'Percentage of grid availability hours',
    formula: '(gridUptimeHoursPerDay / 24) * 100',
    category: 'Energy Supply',
    dataSourceField: 'gridUptimeHoursPerDay',
    thresholdHigh: 95.00,
    thresholdMedium: 80.00,
    thresholdLow: 60.00,
    aggregationType: 'AVG'
  },
  {
    id: 'ind_diesel_daily',
    name: 'Diesel Daily Consumption',
    unit: 'litres/day',
    description: 'Average daily diesel fuel consumption',
    formula: 'dieselFuelConsumptionRateLitresPerHour * dieselGeneratorOperatingHoursPerDay',
    category: 'Fuel Consumption',
    dataSourceField: 'dieselFuelConsumptionRateLitresPerHour',
    thresholdHigh: 500.00,
    thresholdMedium: 300.00,
    thresholdLow: 100.00,
    aggregationType: 'SUM'
  },
  {
    id: 'ind_grid_annual',
    name: 'Annual Grid Electricity',
    unit: 'kWh',
    description: 'Total grid electricity consumed annually',
    formula: 'gridElectricityConsumptionLast12MonthsKWh',
    category: 'Energy Consumption',
    dataSourceField: 'gridElectricityConsumptionLast12MonthsKWh',
    thresholdHigh: 500000.00,
    thresholdMedium: 300000.00,
    thresholdLow: 100000.00,
    aggregationType: 'SUM'
  },
  {
    id: 'ind_diesel_annual',
    name: 'Annual Diesel Consumption',
    unit: 'litres',
    description: 'Total diesel consumed annually',
    formula: 'dieselConsumptionLast12MonthsLitres',
    category: 'Fuel Consumption',
    dataSourceField: 'dieselConsumptionLast12MonthsLitres',
    thresholdHigh: 150000.00,
    thresholdMedium: 100000.00,
    thresholdLow: 50000.00,
    aggregationType: 'SUM'
  },
  {
    id: 'ind_om_staff_capacity',
    name: 'O&M Staff Capacity',
    unit: 'count',
    description: 'Number of trained O&M staff',
    formula: 'trainedOMStaffCount',
    category: 'Operations & Maintenance',
    dataSourceField: 'trainedOMStaffCount',
    thresholdHigh: 10.00,
    thresholdMedium: 5.00,
    thresholdLow: 2.00,
    aggregationType: 'COUNT'
  },
  {
    id: 'ind_om_staff_skills',
    name: 'O&M Staff Skills Rating',
    unit: '1-5',
    description: 'Subjective O&M staff competency rating',
    formula: 'omStaffSkillsRating',
    category: 'Operations & Maintenance',
    dataSourceField: 'omStaffSkillsRating',
    thresholdHigh: 4.50,
    thresholdMedium: 3.00,
    thresholdLow: 2.00,
    aggregationType: 'AVG'
  },
  {
    id: 'ind_emergency_prep',
    name: 'Emergency Preparedness Score',
    unit: 'score',
    description: 'Score based on emergency planning',
    formula: '(emergencyEnergyPlan ? 50 : 0) + (preventiveMaintenanceScheduleDocumented ? 25 : 0) + (sparepartsAvailableForCriticalSystems ? 25 : 0)',
    category: 'Resilience',
    dataSourceField: 'emergencyPreparednessScore',
    thresholdHigh: 90.00,
    thresholdMedium: 60.00,
    thresholdLow: 30.00,
    aggregationType: 'FORMULA'
  },
  {
    id: 'ind_ghg_emissions',
    name: 'Annual GHG Emissions (Est.)',
    unit: 'kg CO2e',
    description: 'Estimated CO2 from energy sources',
    formula: '(dieselConsumptionLast12MonthsLitres * 2.68) + (gridElectricityConsumptionLast12MonthsKWh * 0.421)',
    category: 'Environmental Impact',
    dataSourceField: null,
    thresholdHigh: 500000.00,
    thresholdMedium: 300000.00,
    thresholdLow: 100000.00,
    aggregationType: 'FORMULA'
  }
];

async function seedIndicators() {
  try {
    console.log('Starting indicators seeding...\n');

    const connection = await pool.getConnection();

    // Clear existing indicators
    console.log('Clearing existing indicators...');
    await connection.query('DELETE FROM indicators');
    console.log('✓ Cleared existing indicators\n');

    // Insert all indicators
    console.log('Seeding 8 indicators...');
    for (const indicator of INDICATORS) {
      await connection.query(
        `INSERT INTO indicators 
         (id, name, unit, description, formula, category, dataSourceField, thresholdHigh, thresholdMedium, thresholdLow, aggregationType) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          indicator.id,
          indicator.name,
          indicator.unit,
          indicator.description,
          indicator.formula,
          indicator.category,
          indicator.dataSourceField,
          indicator.thresholdHigh,
          indicator.thresholdMedium,
          indicator.thresholdLow,
          indicator.aggregationType
        ]
      );
      console.log(`  ✓ ${indicator.name}`);
    }

    console.log('\n✓ Seeded all 8 indicators\n');

    // Verify
    const [result] = await connection.query('SELECT COUNT(*) as count FROM indicators');
    console.log(`Total indicators in database: ${result[0].count}\n`);

    // Display all indicators
    const [allIndicators] = await connection.query(
      'SELECT id, name, unit, category FROM indicators ORDER BY category, name'
    );
    
    console.log('✅ All Indicators Seeded:\n');
    let currentCategory = '';
    for (const ind of allIndicators) {
      if (currentCategory !== ind.category) {
        currentCategory = ind.category;
        console.log(`\n📊 ${currentCategory}:`);
      }
      console.log(`  • ${ind.name} (${ind.unit})`);
    }

    connection.release();
    console.log('\n🎉 Indicators seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding indicators:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedIndicators();
