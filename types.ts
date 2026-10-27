
// NHERAMS Facility Ownership Types


export enum OwnershipType {
  FEDERAL = 'federal',
  STATE = 'state',
  LOCAL_GOVERNMENT = 'local_government',
  PRIVATE = 'private',
  FAITH_BASED = 'faith_based'
}

// NHERAMS Facility Levels
export enum FacilityLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary'
}

export enum ClinicalCriticality {
  C1 = 'C1 (Basic)',
  C2 = 'C2 (Intermediate)',
  C3 = 'C3 (High)',
  C4 = 'C4 (Very High / Trauma)'
}

// Validator Organizations
export enum ValidatorOrg {
  STATE_MOH = 'state_moh',
  NEMSA = 'nemsa',
  SAFECARE_EHS = 'safecare_ehs'
}

// Validator Status
export enum ValidatorStatus {
  PENDING = 'pending',
  SIGNED = 'signed',
  NOT_APPLICABLE = 'not_applicable'
}

// Certificate Types
export enum CertificateType {
  ELECTRICAL_SAFETY = 'electrical_safety',
  QUALITY_SCHEME = 'quality_scheme',
  COMMISSIONING = 'commissioning'
}

// Certificate Status
export enum CertificateStatus {
  SUPPLIED = 'supplied',
  REQUESTED = 'requested',
  NOT_AVAILABLE = 'not_available'
}

// Telemetry Source
export enum TelemetrySource {
  API_LINKED = 'api_linked',
  BATCH_UPLOAD = 'batch_upload',
  NOT_LIVE = 'not_live'
}

// Publication Tier
export enum PublicationTier {
  PUBLIC_LITE = 'public_lite',
  FACILITY_SELF_SERVICE = 'facility_self_service',
  STATE_PRO = 'state_pro',
  FINANCIER = 'financier'
}

// Verification Bundle Tier
export enum BundleTier {
  T1_AUTO = 'T1_auto',
  T2_AUTHORITY = 'T2_authority',
  T3_INDEPENDENT_SAMPLING = 'T3_independent_sampling'
}

export enum ERLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High'
}

// Added PowerBand enum to fix missing export error in constants.ts and FacilityDetail.tsx
export enum PowerBand {
  BAND_12_20 = '12-20 Hours',
  LESS_12 = 'Less than 12 Hours',
  MORE_20 = 'More than 20 Hours'
}

// Added EnergyImpactBand enum to fix missing export error in constants.ts
export enum EnergyImpactBand {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

// NHERAMS Indicator Band (for banded data - no raw values shown publicly)
export interface IndicatorBand {
  label: string;
  min: number;
  max: number;
  unit: string;
}

// NHERAMS Validator Entry
export interface Validator {
  org: ValidatorOrg;
  status: ValidatorStatus;
}

// NHERAMS Certificate Evidence
export interface Certificate {
  type: CertificateType;
  ref: string;
  status: CertificateStatus;
}

// NHERAMS Telemetry Configuration
export interface TelemetryConfig {
  source: TelemetrySource;
  latency_target_minutes: number;
  availability_target: number;
}

// NHERAMS Evidence Pack
export interface Evidence {
  certificates: Certificate[];
  telemetry: TelemetryConfig;
  sampling_note: string;
}

// NHERAMS Publication Settings
export interface PublicationSettings {
  tier: PublicationTier;
  lag_days: number;
  published_at: string; // YYYY-MM-DD
  version: string;
}

// NHERAMS Facility (Master Schema - One Template for All)
export interface Facility {
  hfr_id: string;
  name: string;
  ownership: OwnershipType;
  level: FacilityLevel;
  location: {
    state_code: string;
    lga_name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  // Flat properties for easier access in forms
  state_code?: string;
  latitude?: number;
  longitude?: number;
  indicators: {
    uptime_band: IndicatorBand;
    diesel_reduction_band: IndicatorBand;
    cold_chain_status: 'stable' | 'at_risk' | 'unknown';
    electrical_safety_status: 'compliant' | 'minor_defects' | 'major_defects' | 'unknown';
    mdr_hours_band: IndicatorBand;
    ppp_eaas_kpi: IndicatorBand;
  };
  validators: Validator[];
  evidence: Evidence;
  publication: PublicationSettings;
  synthetic: boolean;
}

// NHERAMS Verification Bundle Sign-Off
export interface SignOff {
  role: 'controller' | 'validator_state' | 'validator_nemsa' | 'validator_safecare';
  org: string;
  name: string;
  timestamp: string; // ISO 8601 format
}

// NHERAMS Verification Bundle (Unchanged Structure for All Sites)
export interface VerificationBundle {
  bundle_id: string;
  hfr_id: string;
  tier: BundleTier;
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  contents: {
    telemetry_summary: string;
    authority_certificates: string[];
    sampling_report: string;
  };
  targets_met: {
    uptime_95pct_streak: boolean;
    diesel_reduction_50pct: boolean;
  };
  signoffs: SignOff[];
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FEDERAL_ADMIN = 'FEDERAL_ADMIN',
  STATE_ADMIN = 'STATE_ADMIN',
  FACILITY_ADMIN = 'FACILITY_ADMIN',
  FACILITY_USER = 'FACILITY_USER',
  VALIDATOR = 'VALIDATOR',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  role: UserRole;
  stateName?: string;
  facilityId?: string;
}

// Re-export AuditData from auditSchema for convenience
export type { AuditData } from './services/auditSchema';
