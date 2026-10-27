import express from 'express';
import * as AuditModel from '../models/audit.js';

const router = express.Router();

// Get all audits
router.get('/', async (req, res) => {
  try {
    const audits = await AuditModel.getAudits();
    res.json(audits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit by facility ID
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const audit = await AuditModel.getAuditByFacilityId(req.params.facilityId);
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit by ID
router.get('/:auditId', async (req, res) => {
  try {
    const audit = await AuditModel.getAuditById(req.params.auditId);
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save new audit
router.post('/', async (req, res) => {
  try {
    console.log('[Audits] POST request received');
    // Accept both facilityId and facility_id
    const facilityId = req.body.facilityId || req.body.facility_id;
    const auditData = { ...req.body };
    delete auditData.facilityId;
    delete auditData.facility_id;

    console.log('[Audits] Audit data:', { facilityId, fieldCount: Object.keys(auditData).length });

    if (!facilityId) {
      console.log('[Audits] Validation failed - facilityId is required');
      return res.status(400).json({
        success: false,
        error: 'facilityId is required'
      });
    }

    console.log('[Audits] Calling saveAudit...');
    const audit = await AuditModel.saveAudit(facilityId, auditData);

    console.log('[Audits] Audit saved successfully:', audit.id);
    res.status(201).json({
      success: true,
      message: 'Audit saved successfully to database',
      data: audit
    });
  } catch (error) {
    console.error('[Audits] Error in POST route:', error.message, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save audit'
    });
  }
});

// Update existing audit
router.put('/:auditId', async (req, res) => {
  try {
    const audit = await AuditModel.updateAudit(req.params.auditId, req.body);
    res.status(200).json({ 
      success: true,
      message: 'Audit updated successfully in database',
      data: audit 
    });
  } catch (error) {
    console.error('Route error - Update audit:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to update audit'
    });
  }
});

// Delete audit
router.delete('/:id', async (req, res) => {
  try {
    await AuditModel.deleteAudit(req.params.id);
    res.json({ message: 'Audit deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed audits for all facilities (creates 4 audits per facility across two periods)
router.post('/seed/all', async (req, res) => {
  try {
    console.log('[Audits] Bulk seeding started for all facilities');

    // Get all facilities from database
    const FacilityModel = await import('../models/facility.js');
    const facilities = await FacilityModel.getFacilities();

    if (!facilities || facilities.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No facilities found in database'
      });
    }

    console.log(`[Audits] Found ${facilities.length} facilities to seed`);

    const results = {
      totalFacilities: facilities.length,
      auditsCreated: 0,
      facilityResults: []
    };

    // Seed each facility with 4 audits (2 audits per period)
    for (const facility of facilities) {
      const facilityId = facility.hfr_id || facility.id;
      console.log(`[Audits] Seeding facility: ${facilityId}`);

      let facilityAuditCount = 0;
      const facilityErrors = [];

      // Period 1: Q1-Q2 2026, Period 2: Q3-Q4 2026
      for (let period = 1; period <= 2; period++) {
        for (let auditNum = 1; auditNum <= 2; auditNum++) {
          const quarter = period === 1 ? auditNum : auditNum + 2;

          try {
            const auditData = generateSampleAudit(facilityId, auditNum, quarter);
            const audit = await AuditModel.saveAudit(facilityId, auditData);
            facilityAuditCount++;
            results.auditsCreated++;
            console.log(`[Audits] Created audit for ${facilityId} Q${quarter}-${auditNum}:`, audit.id);
          } catch (error) {
            const errMsg = `Q${quarter}-${auditNum}: ${error.message}`;
            facilityErrors.push(errMsg);
            console.error(`[Audits] Error creating audit for ${facilityId}:`, errMsg);
          }
        }
      }

      results.facilityResults.push({
        facilityId,
        facilityName: facility.name || facility.facility_name,
        auditsCreated: facilityAuditCount,
        errors: facilityErrors.length > 0 ? facilityErrors : undefined
      });
    }

    res.status(201).json({
      success: true,
      message: `Bulk seed completed: ${results.auditsCreated} audits created for ${results.totalFacilities} facilities`,
      summary: {
        totalFacilities: results.totalFacilities,
        totalAuditsCreated: results.auditsCreated,
        auditsPerFacility: 4,
        periods: 2
      },
      facilityDetails: results.facilityResults
    });
  } catch (error) {
    console.error('[Audits] Error in bulk seed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to seed audits for all facilities'
    });
  }
});

// Seed audits for testing (creates 8 audits across 4 quarters of 2026)
router.post('/seed/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    console.log('[Audits] Seeding audits for facility:', facilityId);

    const createdAudits = [];

    // Create 2 audits per quarter for all 4 quarters
    for (let quarter = 1; quarter <= 4; quarter++) {
      for (let auditNum = 1; auditNum <= 2; auditNum++) {
        const auditData = generateSampleAudit(facilityId, auditNum, quarter);

        try {
          const audit = await AuditModel.saveAudit(facilityId, auditData);
          createdAudits.push(audit);
          console.log(`[Audits] Created audit Q${quarter}-${auditNum}:`, audit.id);
        } catch (error) {
          console.error(`[Audits] Error creating audit Q${quarter}-${auditNum}:`, error.message);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Seeded ${createdAudits.length} audits for facility ${facilityId}`,
      data: createdAudits,
      summary: {
        total: createdAudits.length,
        facilityId,
        quarters: 4,
        auditsPerQuarter: 2
      }
    });
  } catch (error) {
    console.error('[Audits] Error seeding audits:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to seed audits'
    });
  }
});

/**
 * Generate sample audit data for a given quarter with ALL fields populated
 */
function generateSampleAudit(facilityId, auditNumber, quarter, year = 2026) {
  const monthStart = (quarter - 1) * 3 + 1;
  const day = 15 + (auditNumber * 5);
  const date = new Date(year, monthStart - 1, Math.min(day, 28));
  const variance = (auditNumber + quarter) * 0.1;

  // Generate audit period ID (ensure it's within period dates)
  const auditPeriodId = `Q${quarter}-${year}`;

  return {
    // Core identifiers
    facility_id: facilityId,
    facilityId: facilityId,
    hfr_id: facilityId,
    timestamp: date.toISOString(),
    created_at: date.toISOString(),
    updated_at: date.toISOString(),
    audit_date: date.toISOString(),
    auditPeriodId: auditPeriodId,

    // Section 1: Facility Identification
    facility_name: `Sample Facility - ${facilityId}`,
    facility_type: 'Primary Health Center',
    location_state: 'Lagos',
    location_zone: 'Southwest',
    gps_latitude: 6.5244 + variance,
    gps_longitude: 3.3792 + variance,
    focal_person_name: 'Dr. John Okafor',
    focal_person_role: 'Facility Manager',
    audit_team_members: ['Dr. John Okafor', 'Nurse Sarah Adeyemi', 'Technician Chukwu'],
    committee_observer_present: auditNumber === 2, // Every second audit has observer

    // Section 2: Energy Access & Resilience
    grid_connected: true,
    grid_uptime_hours_per_day: 16 + Math.floor(variance * 4),
    backup_power_sources: ['Diesel Generator', 'Solar System', 'Battery Storage'],
    hybrid_renewable_system_installed: true,
    hybrid_system_details: {
      solar_capacity_kwp: 10 + Math.floor(variance * 5),
      battery_capacity_kwh: 20 + Math.floor(variance * 10),
      diesel_capacity_kva: 60 + Math.floor(variance * 20),
      system_efficiency: 85 + Math.floor(variance * 10)
    },
    major_outages_last_12_months: 4 + Math.floor(variance * 2),
    outage_frequency_and_duration: `${4 + Math.floor(variance * 2)} outages, avg 4-6 hours each`,
    emergency_energy_plan: 'Yes, documented and tested quarterly',
    energy_resilience_score: variance < 0.3 ? 'low' : variance < 0.6 ? 'medium' : 'high',

    // Section 3: Diesel Generator Details
    diesel_generator_make: 'Caterpillar',
    diesel_generator_serial: `CAT-${facilityId}-001`,
    diesel_generator_capacity_kva: 60 + Math.floor(variance * 20),
    diesel_fuel_consumption_rate_litres_per_hour: 18 + Math.floor(variance * 5),
    diesel_generator_operating_hours_per_day: 6 + Math.floor(variance * 3),

    // Section 4: Electrical Consumption
    grid_electricity_consumption_last_12_months_kwh: 45000 + Math.floor(variance * 15000),
    diesel_consumption_last_12_months_litres: 12000 + Math.floor(variance * 4000),
    solar_energy_generation_last_12_months_kwh: 15000 + Math.floor(variance * 5000),

    // Section 5: Waste Management
    waste_incineration_present: true,
    waste_incineration_volume_monthly_kg: 850 + Math.floor(variance * 300),

    // Section 6: O&M Staff
    trained_om_staff_present: true,
    trained_om_staff_count: 4 + Math.floor(variance * 2),
    preventive_maintenance_schedule_documented: true,
    sparepartsavailable_for_critical_systems: true,
    power_systems_service_frequency: 'Quarterly',
    om_staff_skills_rating: 4 + Math.floor(variance * 1),

    // Section 7: Waste Management Details
    waste_segmentation_system: 'Three-bin system (organic, recyclable, hazardous)',
    waste_disposal_method: 'Incineration for medical waste, recycling for paper/plastic',

    // Section 8: Environmental & Health Safety
    air_quality_monitoring_system: 'Yes, monthly monitoring',
    hazardous_materials_storage_safe: true,
    adequate_ppe_available: true,

    // Section 9: Equipment & Lighting Inventory
    section_room_name: 'Main Hospital Building',
    equipment_list: [
      {
        id: 'eq1',
        name: 'ICU Equipment',
        quantity: 5,
        ratedPowerKW: 3.5,
        operatingHoursPerDay: 24,
        backupPower: true
      },
      {
        id: 'eq2',
        name: 'Laboratory Machines',
        quantity: 8,
        ratedPowerKW: 2.0,
        operatingHoursPerDay: 12,
        backupPower: true
      },
      {
        id: 'eq3',
        name: 'Refrigerators',
        quantity: 12,
        ratedPowerKW: 0.75,
        operatingHoursPerDay: 24,
        backupPower: true
      },
      {
        id: 'eq4',
        name: 'Water Pump',
        quantity: 2,
        ratedPowerKW: 5.0,
        operatingHoursPerDay: 8,
        backupPower: false
      }
    ],
    lighting_inventory: [
      {
        id: 'lt1',
        type: 'LED',
        quantity: 150,
        wattage: 18,
        operatingHoursPerDay: 12
      },
      {
        id: 'lt2',
        type: 'Fluorescent',
        quantity: 40,
        wattage: 40,
        operatingHoursPerDay: 12
      }
    ],

    // Section 10: Energy Potential Analysis
    renewable_energy_potentials: {
      solar: 'High - 6-7 peak hours daily',
      wind: 'Low - 2-3 m/s average',
      biomass: 'Medium - Medical waste available'
    },
    obvious_inefficiencies: [
      'Old fluorescent lighting still in use',
      'Diesel generator not optimally loaded',
      'Air conditioning not zoned by usage'
    ],
    intervention_priorities: [
      'Replace remaining fluorescent lights with LED',
      'Install building energy management system',
      'Improve solar panel orientation for 5% gain'
    ],

    // Section 11: Carbon Market Readiness
    historical_energy_ghg_records: {
      year_2024: { grid_kwh: 42000, diesel_litres: 11500, ghg_tonnes_co2: 98 },
      year_2025: { grid_kwh: 43500, diesel_litres: 11800, ghg_tonnes_co2: 101 },
      year_2026_ytd: { grid_kwh: 11250 * quarter, diesel_litres: 3000 * quarter, ghg_tonnes_co2: 26 * quarter }
    },
    mrv_system_present: true,
    carbon_credit_interest: true,
    carbon_market_remarks: 'Facility interested in CDM gold standard projects',

    // Section 12: Environmental Scanning
    nearby_facilities_shared_interventions: true,
    shared_interventions_details: 'Coordinating solar energy pooling with adjacent clinic',
    additional_infrastructure_potential: 'Adequate land for 50 kWp solar array expansion',

    // Data
    data: {
      sections: 12,
      totalFields: 98,
      completionPercentage: 100
    }
  };
}

export default router;
