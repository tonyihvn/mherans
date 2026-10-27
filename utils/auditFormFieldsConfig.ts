/**
 * Default Audit Form Fields Configuration
 * Maps all audit fields to their sections with proper field types and validation
 */

export interface FormField {
  id: string;
  fieldName: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';
  section: number;
  sectionName: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  linkedIndicator?: string;
}

export const DEFAULT_AUDIT_FORM_FIELDS: FormField[] = [
  // Section 1: Facility Identification
  {
    id: 'field_facility_name',
    fieldName: 'facilityName',
    label: 'Facility Name',
    type: 'text',
    section: 1,
    sectionName: 'Facility Identification',
    required: true,
    placeholder: 'Enter the facility name',
    helperText: 'Full name of the healthcare facility'
  },
  {
    id: 'field_facility_type',
    fieldName: 'facilityType',
    label: 'Facility Type',
    type: 'select',
    section: 1,
    sectionName: 'Facility Identification',
    required: true,
    options: ['Teaching Hospital', 'Federal Medical Center', 'Secondary Health Center', 'Primary Health Center', 'Private Facility', 'Faith-based Facility'],
    helperText: 'Classification of the healthcare facility'
  },
  {
    id: 'field_location_state',
    fieldName: 'locationState',
    label: 'State',
    type: 'select',
    section: 1,
    sectionName: 'Facility Identification',
    required: true,
    options: ['Lagos', 'Ogun', 'Kano', 'Rivers', 'Kaduna', 'Edo', 'Katsina', 'Kogi', 'Cross River', 'Bauchi', 'Nasarawa', 'Zamfara', 'FCT'],
    helperText: 'State where facility is located'
  },
  {
    id: 'field_location_zone',
    fieldName: 'locationZone',
    label: 'Geopolitical Zone',
    type: 'text',
    section: 1,
    sectionName: 'Facility Identification',
    required: false,
    placeholder: 'e.g., South-West, North-Central',
    helperText: 'Geopolitical zone of the facility'
  },
  {
    id: 'field_gps_latitude',
    fieldName: 'gpsLatitude',
    label: 'GPS Latitude',
    type: 'number',
    section: 1,
    sectionName: 'Facility Identification',
    required: false,
    min: -90,
    max: 90,
    step: 0.0001,
    placeholder: '6.5244',
    helperText: 'Latitude coordinate of facility location'
  },
  {
    id: 'field_gps_longitude',
    fieldName: 'gpsLongitude',
    label: 'GPS Longitude',
    type: 'number',
    section: 1,
    sectionName: 'Facility Identification',
    required: false,
    min: -180,
    max: 180,
    step: 0.0001,
    placeholder: '3.3792',
    helperText: 'Longitude coordinate of facility location'
  },
  {
    id: 'field_audit_date',
    fieldName: 'auditDate',
    label: 'Audit Date',
    type: 'date',
    section: 1,
    sectionName: 'Facility Identification',
    required: true,
    helperText: 'Date when the audit was conducted'
  },
  {
    id: 'field_focal_person_name',
    fieldName: 'focalPersonName',
    label: 'Focal Person Name',
    type: 'text',
    section: 1,
    sectionName: 'Facility Identification',
    required: true,
    placeholder: 'Full name of facility focal person',
    helperText: 'Primary contact person at the facility'
  },
  {
    id: 'field_focal_person_role',
    fieldName: 'focalPersonRole',
    label: 'Focal Person Role',
    type: 'text',
    section: 1,
    sectionName: 'Facility Identification',
    required: false,
    placeholder: 'e.g., Head of Engineering, Chief Medical Officer',
    helperText: 'Position or role of the focal person'
  },
  {
    id: 'field_audit_team_members',
    fieldName: 'auditTeamMembers',
    label: 'Audit Team Members',
    type: 'textarea',
    section: 1,
    sectionName: 'Facility Identification',
    required: false,
    placeholder: 'List names and roles of audit team members',
    helperText: 'Names and designations of all team members conducting the audit'
  },
  {
    id: 'field_committee_observer_present',
    fieldName: 'committeeObserverPresent',
    label: 'Committee Observer Present',
    type: 'checkbox',
    section: 1,
    sectionName: 'Facility Identification',
    required: false,
    helperText: 'Was a committee observer present during the audit?'
  },

  // Section 2: Energy Source & Consumption
  {
    id: 'field_grid_connected',
    fieldName: 'gridConnected',
    label: 'Facility Connected to Grid',
    type: 'checkbox',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: true,
    helperText: 'Is the facility connected to the national electricity grid?',
    linkedIndicator: 'uptime_percentage'
  },
  {
    id: 'field_grid_uptime_hours',
    fieldName: 'gridUptimeHoursPerDay',
    label: 'Grid Uptime (hours/day)',
    type: 'number',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: true,
    min: 0,
    max: 24,
    step: 0.5,
    placeholder: '20',
    helperText: 'Average hours per day grid power is available',
    linkedIndicator: 'uptime_percentage'
  },
  {
    id: 'field_backup_power_sources',
    fieldName: 'backupPowerSources',
    label: 'Backup Power Sources',
    type: 'textarea',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: false,
    placeholder: 'e.g., Diesel generator (50kVA), Solar panels (10kW), Battery backup',
    helperText: 'Describe all backup power sources available at the facility'
  },
  {
    id: 'field_hybrid_renewable_installed',
    fieldName: 'hybridRenewableSystemInstalled',
    label: 'Hybrid/Renewable System Installed',
    type: 'checkbox',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: false,
    helperText: 'Does the facility have a hybrid or renewable energy system?'
  },
  {
    id: 'field_hybrid_system_details',
    fieldName: 'hybridSystemDetails',
    label: 'Hybrid System Details',
    type: 'textarea',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: false,
    placeholder: 'Describe the hybrid system type, components, and capacity',
    helperText: 'Detailed information about the hybrid/renewable system'
  },
  {
    id: 'field_major_outages_last_12m',
    fieldName: 'majorOutagesLast12Months',
    label: 'Major Outages in Last 12 Months',
    type: 'checkbox',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: false,
    helperText: 'Were there major power outages in the last 12 months?'
  },
  {
    id: 'field_outage_frequency',
    fieldName: 'outageFrequencyPerYear',
    label: 'Outage Frequency (per year)',
    type: 'number',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: false,
    min: 0,
    step: 1,
    placeholder: '12',
    helperText: 'Estimated number of outages per year'
  },
  {
    id: 'field_average_outage_duration',
    fieldName: 'averageOutageDurationHours',
    label: 'Average Outage Duration (hours)',
    type: 'number',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: false,
    min: 0,
    step: 0.5,
    placeholder: '4',
    helperText: 'Average duration of power outages'
  },
  {
    id: 'field_emergency_energy_plan',
    fieldName: 'emergencyEnergyPlan',
    label: 'Emergency Energy Plan in Place',
    type: 'checkbox',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: false,
    helperText: 'Does the facility have an emergency energy/power plan?'
  },
  {
    id: 'field_energy_resilience_score',
    fieldName: 'energyResilienceScore',
    label: 'Energy Resilience Score',
    type: 'select',
    section: 2,
    sectionName: 'Energy Source & Consumption',
    required: true,
    options: ['High', 'Medium', 'Low'],
    helperText: 'Overall assessment of facility energy resilience'
  },

  // Section 3: Diesel & Backup Power
  {
    id: 'field_diesel_gen_make',
    fieldName: 'dieselGeneratorMake',
    label: 'Diesel Generator Make',
    type: 'text',
    section: 3,
    sectionName: 'Diesel & Backup Power',
    required: false,
    placeholder: 'e.g., Caterpillar, Cummins, Perkins',
    helperText: 'Manufacturer of the diesel generator'
  },
  {
    id: 'field_diesel_gen_serial',
    fieldName: 'dieselGeneratorSerial',
    label: 'Diesel Generator Serial Number',
    type: 'text',
    section: 3,
    sectionName: 'Diesel & Backup Power',
    required: false,
    placeholder: 'Serial number from equipment nameplate',
    helperText: 'Unique identifier for the generator'
  },
  {
    id: 'field_diesel_gen_capacity_kva',
    fieldName: 'dieselGeneratorCapacityKVA',
    label: 'Diesel Generator Capacity (kVA)',
    type: 'number',
    section: 3,
    sectionName: 'Diesel & Backup Power',
    required: false,
    min: 0,
    step: 1,
    placeholder: '50',
    helperText: 'Rated capacity of diesel generator in kilovolt-amperes'
  },
  {
    id: 'field_diesel_consumption_rate',
    fieldName: 'dieselFuelConsumptionRateLitresPerHour',
    label: 'Diesel Consumption Rate (L/hour)',
    type: 'number',
    section: 3,
    sectionName: 'Diesel & Backup Power',
    required: false,
    min: 0,
    step: 0.1,
    placeholder: '12.5',
    helperText: 'Average fuel consumption rate under typical operation'
  },
  {
    id: 'field_diesel_gen_operating_hours',
    fieldName: 'dieselGeneratorOperatingHoursPerDay',
    label: 'Generator Operating Hours (per day)',
    type: 'number',
    section: 3,
    sectionName: 'Diesel & Backup Power',
    required: false,
    min: 0,
    max: 24,
    step: 0.5,
    placeholder: '4',
    helperText: 'Average daily operation hours',
    linkedIndicator: 'diesel_daily_consumption'
  },
  {
    id: 'field_diesel_consumption_annual',
    fieldName: 'dieselConsumptionLast12MonthsLitres',
    label: 'Annual Diesel Consumption (litres)',
    type: 'number',
    section: 3,
    sectionName: 'Diesel & Backup Power',
    required: false,
    min: 0,
    step: 10,
    placeholder: '15000',
    helperText: 'Total diesel fuel consumed in the last 12 months',
    linkedIndicator: 'diesel_consumption_annual'
  },

  // Section 4: Renewable Energy
  {
    id: 'field_solar_generation_annual',
    fieldName: 'solarEnergyGenerationLast12MonthsKWh',
    label: 'Solar Energy Generation (kWh/year)',
    type: 'number',
    section: 4,
    sectionName: 'Renewable Energy',
    required: false,
    min: 0,
    step: 100,
    placeholder: '25000',
    helperText: 'Total solar energy generated in the last 12 months'
  },
  {
    id: 'field_solar_pv_upgrade_potential',
    fieldName: 'solarPVUpgradePotential',
    label: 'Solar PV Upgrade Potential',
    type: 'checkbox',
    section: 4,
    sectionName: 'Renewable Energy',
    required: false,
    helperText: 'Is there potential to upgrade solar PV system?'
  },
  {
    id: 'field_hybrid_upgrade_potential',
    fieldName: 'hybridSystemUpgradePotential',
    label: 'Hybrid System Upgrade Potential',
    type: 'checkbox',
    section: 4,
    sectionName: 'Renewable Energy',
    required: false,
    helperText: 'Is there potential to upgrade hybrid system?'
  },
  {
    id: 'field_renewable_energy_potentials',
    fieldName: 'renewableEnergyUpgradePotentials',
    label: 'Renewable Energy Upgrade Potentials',
    type: 'textarea',
    section: 4,
    sectionName: 'Renewable Energy',
    required: false,
    placeholder: 'e.g., Wind power, biogas from waste, mini-hydro',
    helperText: 'Describe opportunities for renewable energy expansion'
  },

  // Section 5: Infrastructure & Load
  {
    id: 'field_grid_electricity_annual',
    fieldName: 'gridElectricityConsumptionLast12MonthsKWh',
    label: 'Grid Electricity Consumption (kWh/year)',
    type: 'number',
    section: 5,
    sectionName: 'Infrastructure & Load',
    required: false,
    min: 0,
    step: 100,
    placeholder: '120000',
    helperText: 'Total electricity from grid in last 12 months',
    linkedIndicator: 'grid_electricity_kwh_annual'
  },
  {
    id: 'field_water_pump_power',
    fieldName: 'waterPumpRatedPowerKW',
    label: 'Water Pump Rated Power (kW)',
    type: 'number',
    section: 5,
    sectionName: 'Infrastructure & Load',
    required: false,
    min: 0,
    step: 0.5,
    placeholder: '5',
    helperText: 'Capacity of water pumping system'
  },
  {
    id: 'field_cold_chain_energy',
    fieldName: 'coldChainEquipmentEnergyUseKW',
    label: 'Cold Chain Equipment Energy Use (kW)',
    type: 'number',
    section: 5,
    sectionName: 'Infrastructure & Load',
    required: false,
    min: 0,
    step: 0.1,
    placeholder: '2.5',
    helperText: 'Total power consumption of refrigeration equipment'
  },
  {
    id: 'field_oxygen_plant_operating',
    fieldName: 'oxygenPlantPresentAndOperating',
    label: 'Oxygen Plant Present and Operating',
    type: 'checkbox',
    section: 5,
    sectionName: 'Infrastructure & Load',
    required: false,
    helperText: 'Is an oxygen generation plant present and operational?'
  },

  // Section 6: Operations & Maintenance
  {
    id: 'field_trained_om_staff_present',
    fieldName: 'trainedOMStaffPresent',
    label: 'Trained O&M Staff Present',
    type: 'checkbox',
    section: 6,
    sectionName: 'Operations & Maintenance',
    required: true,
    helperText: 'Are trained operations and maintenance staff available?',
    linkedIndicator: 'om_staff_capacity'
  },
  {
    id: 'field_trained_om_staff_count',
    fieldName: 'trainedOMStaffCount',
    label: 'Number of Trained O&M Staff',
    type: 'number',
    section: 6,
    sectionName: 'Operations & Maintenance',
    required: false,
    min: 0,
    step: 1,
    placeholder: '3',
    helperText: 'Total count of trained staff dedicated to O&M',
    linkedIndicator: 'om_staff_capacity'
  },
  {
    id: 'field_preventive_maintenance_documented',
    fieldName: 'preventiveMaintenanceScheduleDocumented',
    label: 'Preventive Maintenance Schedule Documented',
    type: 'checkbox',
    section: 6,
    sectionName: 'Operations & Maintenance',
    required: false,
    helperText: 'Is there a documented preventive maintenance schedule?'
  },
  {
    id: 'field_spareparts_available',
    fieldName: 'sparepartsAvailableForCriticalSystems',
    label: 'Spare Parts Available for Critical Systems',
    type: 'checkbox',
    section: 6,
    sectionName: 'Operations & Maintenance',
    required: false,
    helperText: 'Are spare parts readily available for critical equipment?'
  },
  {
    id: 'field_service_frequency',
    fieldName: 'powerSystemsServiceFrequency',
    label: 'Power Systems Service Frequency',
    type: 'select',
    section: 6,
    sectionName: 'Operations & Maintenance',
    required: false,
    options: ['Monthly', 'Quarterly', 'Annually', 'As Needed'],
    helperText: 'How often are power systems serviced?'
  },
  {
    id: 'field_om_staff_skills_rating',
    fieldName: 'omStaffSkillsRating',
    label: 'O&M Staff Skills Rating (1-5)',
    type: 'number',
    section: 6,
    sectionName: 'Operations & Maintenance',
    required: false,
    min: 1,
    max: 5,
    step: 1,
    placeholder: '3',
    helperText: 'Assessment of technical competence (1=Low, 5=Excellent)',
    linkedIndicator: 'om_staff_skills'
  },

  // Section 7: Environmental & Safety
  {
    id: 'field_waste_segmentation',
    fieldName: 'wasteSegmentationSystem',
    label: 'Waste Segmentation System',
    type: 'checkbox',
    section: 7,
    sectionName: 'Environmental & Safety',
    required: false,
    helperText: 'Is there a waste segregation/separation system?'
  },
  {
    id: 'field_waste_disposal_method',
    fieldName: 'wasteDisposalMethod',
    label: 'Waste Disposal Method',
    type: 'textarea',
    section: 7,
    sectionName: 'Environmental & Safety',
    required: false,
    placeholder: 'e.g., Incineration, landfill, composting',
    helperText: 'Describe how facility waste is disposed'
  },
  {
    id: 'field_air_quality_monitoring',
    fieldName: 'airQualityMonitoringSystem',
    label: 'Air Quality Monitoring System',
    type: 'checkbox',
    section: 7,
    sectionName: 'Environmental & Safety',
    required: false,
    helperText: 'Is there an air quality monitoring system?'
  },
  {
    id: 'field_hazardous_materials_storage',
    fieldName: 'hazardousMaterialsStorageSafe',
    label: 'Hazardous Materials Storage Safe',
    type: 'checkbox',
    section: 7,
    sectionName: 'Environmental & Safety',
    required: false,
    helperText: 'Are hazardous materials stored safely?'
  },
  {
    id: 'field_ppe_available',
    fieldName: 'adequatePPEAvailable',
    label: 'Adequate Personal Protective Equipment Available',
    type: 'checkbox',
    section: 7,
    sectionName: 'Environmental & Safety',
    required: false,
    helperText: 'Is adequate PPE available for all staff?'
  },
  {
    id: 'field_ehs_compliance_status',
    fieldName: 'ehs_ComplianceStatus',
    label: 'EHS Compliance Status',
    type: 'select',
    section: 7,
    sectionName: 'Environmental & Safety',
    required: false,
    options: ['Compliant', 'Minor Defects', 'Major Defects'],
    helperText: 'Overall Environmental Health and Safety compliance assessment'
  },

  // Section 8: Waste Management
  {
    id: 'field_waste_incineration_present',
    fieldName: 'wasteIncinerationPresent',
    label: 'Waste Incineration Present',
    type: 'checkbox',
    section: 8,
    sectionName: 'Waste Management',
    required: false,
    helperText: 'Is there a waste incinerator at the facility?'
  },
  {
    id: 'field_waste_incineration_volume',
    fieldName: 'wasteIncinerationVolumeMonthlyKg',
    label: 'Waste Incineration Volume (kg/month)',
    type: 'number',
    section: 8,
    sectionName: 'Waste Management',
    required: false,
    min: 0,
    step: 10,
    placeholder: '500',
    helperText: 'Average monthly volume of waste incinerated'
  },
  {
    id: 'field_waste_incineration_fuel',
    fieldName: 'wasteIncinerationFuel',
    label: 'Incineration Fuel Type',
    type: 'select',
    section: 8,
    sectionName: 'Waste Management',
    required: false,
    options: ['Diesel', 'Natural Gas', 'Biomass', 'Mixed'],
    helperText: 'Type of fuel used for incineration'
  },
  {
    id: 'field_obvious_inefficiencies',
    fieldName: 'obviousInefficiencies',
    label: 'Obvious Inefficiencies',
    type: 'textarea',
    section: 8,
    sectionName: 'Waste Management',
    required: false,
    placeholder: 'List waste management inefficiencies observed',
    helperText: 'Document any obvious waste management inefficiencies'
  },

  // Section 9: Cold Chain & Critical Services
  {
    id: 'field_oxygen_plant_feasibility',
    fieldName: 'oxygenPlantFeasibility',
    label: 'Oxygen Plant Installation Feasibility',
    type: 'checkbox',
    section: 9,
    sectionName: 'Cold Chain & Critical Services',
    required: false,
    helperText: 'Is oxygen plant installation feasible?'
  },
  {
    id: 'field_waste_to_energy_feasibility',
    fieldName: 'waste_to_energyFeasibility',
    label: 'Waste-to-Energy Feasibility',
    type: 'checkbox',
    section: 9,
    sectionName: 'Cold Chain & Critical Services',
    required: false,
    helperText: 'Is waste-to-energy conversion feasible?'
  },

  // Section 10: Carbon & Climate
  {
    id: 'field_historical_energy_ghg_records',
    fieldName: 'historicalEnergyGHGRecords',
    label: 'Historical Energy/GHG Records Available',
    type: 'checkbox',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    helperText: 'Are there historical energy and GHG emission records?',
    linkedIndicator: 'ghg_annual_emissions'
  },
  {
    id: 'field_mrv_systems_in_place',
    fieldName: 'mrvSystemsInPlace',
    label: 'MRV Systems in Place',
    type: 'checkbox',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    helperText: 'Are monitoring, reporting, and verification systems implemented?'
  },
  {
    id: 'field_carbon_credit_interest',
    fieldName: 'carbonCreditSchemeInterest',
    label: 'Interest in Carbon Credit Schemes',
    type: 'checkbox',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    helperText: 'Is the facility interested in participating in carbon credit schemes?'
  },
  {
    id: 'field_carbon_credit_remarks',
    fieldName: 'carbonCreditRemarks',
    label: 'Carbon Credit Remarks',
    type: 'textarea',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    placeholder: 'e.g., Preferred carbon scheme, potential reductions, concerns',
    helperText: 'Additional notes on carbon credit interest and readiness'
  },
  {
    id: 'field_estimated_ghg_reduction',
    fieldName: 'estimatedGHGReductionPotentialTonnesCO2',
    label: 'Estimated GHG Reduction Potential (tonnes CO2)',
    type: 'number',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    min: 0,
    step: 1,
    placeholder: '50',
    helperText: 'Estimated annual GHG reduction potential from interventions'
  },
  {
    id: 'field_prioritized_interventions_level',
    fieldName: 'prioritizedInterventionsLevel',
    label: 'Prioritized Interventions Level',
    type: 'select',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    options: ['High', 'Medium', 'Low'],
    helperText: 'Priority level of recommended energy/climate interventions'
  },
  {
    id: 'field_nearby_facilities_shared_benefit',
    fieldName: 'nearbyFacilitiesSharedEnergyBenefit',
    label: 'Nearby Facilities Could Share Energy Benefits',
    type: 'checkbox',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    helperText: 'Could nearby facilities benefit from shared energy systems?'
  },
  {
    id: 'field_additional_infrastructure_potential',
    fieldName: 'additionalInfrastructurePotential',
    label: 'Additional Infrastructure Potential',
    type: 'textarea',
    section: 10,
    sectionName: 'Carbon & Climate',
    required: false,
    placeholder: 'e.g., Shared solar farm, mini-hydro, biogas digester',
    helperText: 'Describe other infrastructure development opportunities'
  }
];
