


import { Facility, OwnershipType, FacilityTier, ClinicalCriticality, PowerBand, ERLevel, EnergyImpactBand, EnergyProfile } from './types';

export const NIGERIA_LAT_LNG: [number, number] = [9.0820, 8.6753];

export const PILOT_FACILITIES: Facility[] = [
  {
    id: 'f1',
    name: 'Usmanu Danfodiyo University Teaching Hospital (UDUTH)',
    state: 'Sokoto',
    lga: 'Sokoto North',
    coordinates: [13.0627, 5.2427],
    region: 'North West',
    ownership: OwnershipType.FEDERAL_PUBLIC,
    tier: FacilityTier.TERTIARY,
    criticality: ClinicalCriticality.C4,
    pilotFocus: 'High-acuity tertiary hospital; ER-level computation; GHG module integration.',
    isPrivate: false
  },
  {
    id: 'f2',
    name: 'Yerwa Primary Health Care Centre',
    state: 'Borno',
    lga: 'Shehuri South',
    coordinates: [11.8333, 13.1500],
    region: 'North East',
    ownership: OwnershipType.STATE_LGA_PUBLIC,
    tier: FacilityTier.PHC,
    criticality: ClinicalCriticality.C1,
    pilotFocus: 'PHC-level resilience; continuity of primary-care; cold-chain metrics.',
    isPrivate: false
  },
  {
    id: 'f3',
    name: 'Wuse General Hospital',
    state: 'FCT Abuja',
    lga: 'AMAC',
    coordinates: [9.0520, 7.4720],
    region: 'North Central',
    ownership: OwnershipType.FEDERAL_PUBLIC,
    tier: FacilityTier.SECONDARY,
    criticality: ClinicalCriticality.C3,
    pilotFocus: 'Mid-level hospital; grid-diesel profile; service-linked energy metrics.',
    isPrivate: false
  },
  {
    id: 'f4',
    name: 'Lagos University Teaching Hospital (LUTH)',
    state: 'Lagos',
    lga: 'Idi-Araba',
    coordinates: [6.5160, 3.3590],
    region: 'South West',
    ownership: OwnershipType.FEDERAL_PUBLIC,
    tier: FacilityTier.TERTIARY,
    criticality: ClinicalCriticality.C4,
    pilotFocus: 'Large urban tertiary complex; complex load segmentation (ICU, data centres).',
    isPrivate: false
  },
  {
    id: 'f5',
    name: 'Abakpa Nike Health Centre',
    state: 'Enugu',
    lga: 'Enugu East',
    coordinates: [6.4860, 7.5450],
    region: 'South East',
    ownership: OwnershipType.STATE_LGA_PUBLIC,
    tier: FacilityTier.PHC,
    criticality: ClinicalCriticality.C1,
    pilotFocus: 'Community PHC; service-centred metrics; low-cost data collection.',
    isPrivate: false
  },
  {
    id: 'f6',
    name: 'Save A Life Mission Hospital',
    state: 'Rivers',
    lga: 'Port Harcourt',
    coordinates: [4.8156, 7.0498],
    region: 'South South',
    ownership: OwnershipType.PRIVATE_FOR_PROFIT,
    tier: FacilityTier.PRIVATE_MULTI,
    criticality: ClinicalCriticality.C3,
    pilotFocus: 'Private-sector pilot; HFN survey theme alignment; cost-to-patient KPIs.',
    isPrivate: true
  }
];

export const BASELINE_ENERGY_DATA: EnergyProfile[] = [
  {
    facilityId: 'f1',
    uptime: PowerBand.BAND_12_20,
    erLevel: ERLevel.MODERATE,
    costImpact: EnergyImpactBand.MEDIUM,
    outagesLast30Days: 42,
    criticalLoadResilience: 45,
    services: [
      { service: 'ICU', status: 'Sometimes', explanation: 'Limited by diesel supply during grid failures.' },
      { service: 'Theatres', status: 'Always', explanation: 'Backed by dedicated gen-set.' },
      { service: 'Imaging', status: 'Sometimes' }
    ],
    assets: [
      { type: 'Grid', name: 'KAEDCO', details: 'Band A, 1.5MW capacity' },
      { type: 'Generator', name: 'Perkins 1000kVA', details: '2019 installation, Primary backup' }
    ],
    majorConsumers: ['Air-conditioning and cooling systems', 'Medical equipment', 'Lighting'],
    impactCheckboxes: { 'Cost of services to patients': true, 'Emergency service delivery': true },
    monthlyGridKWh: 150000,
    monthlyDieselLitres: 12000,
    monthlyEnergySpend: 45000000
  },
  {
    facilityId: 'f2',
    uptime: PowerBand.LESS_12,
    erLevel: ERLevel.LOW,
    costImpact: EnergyImpactBand.HIGH,
    outagesLast30Days: 120,
    criticalLoadResilience: 80,
    services: [
      { service: 'Cold Chain', status: 'Always', explanation: 'Solar direct drive fridge.' },
      { service: 'Maternity', status: 'Rarely', explanation: 'No night light during grid failures.' }
    ],
    assets: [
      { type: 'Solar', name: '5kWp Hybrid System', details: 'BESS 10kWh' },
      { type: 'Grid', name: 'YEDC', details: 'Unreliable grid' }
    ],
    majorConsumers: ['Lighting', 'Cold chain'],
    impactCheckboxes: { 'Quality of service delivery': true, 'Equipment uptime or downtime': true },
    monthlyGridKWh: 1200,
    monthlyDieselLitres: 200,
    monthlyEnergySpend: 800000
  },
  {
    facilityId: 'f3',
    uptime: PowerBand.BAND_12_20,
    erLevel: ERLevel.MODERATE,
    costImpact: EnergyImpactBand.HIGH,
    outagesLast30Days: 35,
    criticalLoadResilience: 30,
    services: [
      { service: 'Theatre', status: 'Always' },
      { service: 'Labs', status: 'Sometimes' }
    ],
    assets: [
      { type: 'Grid', name: 'AEDC', details: 'Band B' },
      { type: 'Generator', name: '500kVA Diesel', details: 'Old asset' }
    ],
    majorConsumers: ['Air-conditioning and cooling systems', 'Medical equipment'],
    impactCheckboxes: { 'Cost of pharma products': true, 'Cost of services to patients': true },
    monthlyGridKWh: 45000,
    monthlyDieselLitres: 5000,
    monthlyEnergySpend: 15000000
  },
  {
    facilityId: 'f4',
    uptime: PowerBand.MORE_20,
    erLevel: ERLevel.HIGH,
    costImpact: EnergyImpactBand.MEDIUM,
    outagesLast30Days: 15,
    criticalLoadResilience: 60,
    services: [
      { service: 'ICU', status: 'Always' },
      { service: 'Data Centres', status: 'Always' }
    ],
    assets: [
      { type: 'Grid', name: 'EKEDC', details: 'Direct injection' },
      { type: 'Generator', name: '2MW Gas Turbine', details: 'On-site power plant' }
    ],
    majorConsumers: ['Air-conditioning and cooling systems', 'Medical equipment', 'Information systems/ICT'],
    impactCheckboxes: { 'Facility expansion plans': true, 'Cost of reagents': true },
    monthlyGridKWh: 850000,
    monthlyDieselLitres: 0,
    monthlyEnergySpend: 120000000
  },
  {
    facilityId: 'f5',
    uptime: PowerBand.LESS_12,
    erLevel: ERLevel.LOW,
    costImpact: EnergyImpactBand.MEDIUM,
    outagesLast30Days: 60,
    criticalLoadResilience: 100,
    services: [
      { service: 'Immunisation', status: 'Always' },
      { service: 'Maternity', status: 'Sometimes' }
    ],
    assets: [
      { type: 'Solar', name: '2.5kWp System', details: 'PHC scale' },
      { type: 'Grid', name: 'EEDC', details: 'Frequent surges' }
    ],
    majorConsumers: ['Lighting', 'Information systems/ICT'],
    impactCheckboxes: { 'Quality of service delivery': true },
    monthlyGridKWh: 800,
    monthlyDieselLitres: 50,
    monthlyEnergySpend: 450000
  },
  {
    facilityId: 'f6',
    uptime: PowerBand.MORE_20,
    erLevel: ERLevel.HIGH,
    costImpact: EnergyImpactBand.HIGH,
    outagesLast30Days: 8,
    criticalLoadResilience: 90,
    services: [
      { service: 'Theatre', status: 'Always' },
      { service: 'Fertility suites', status: 'Always' }
    ],
    assets: [
      { type: 'Grid', name: 'PHED', details: 'Band A' },
      { type: 'Generator', name: '350kVA Generator', details: 'Prime rated' },
      { type: 'Solar', name: '100kWp Solar PV', details: 'Hybrid configuration' }
    ],
    majorConsumers: ['Air-conditioning and cooling systems', 'Medical equipment'],
    impactCheckboxes: { 'Cost of services to patients': true, 'Quality of service delivery': true, 'Virtually all operations affected': true },
    monthlyGridKWh: 35000,
    monthlyDieselLitres: 4000,
    monthlyEnergySpend: 18000000
  }
];
