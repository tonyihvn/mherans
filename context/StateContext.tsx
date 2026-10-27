

import React, { createContext, useContext, useState, useEffect } from 'react';
import { facilitiesService, usersService, auditsService, configService, indicatorsService } from '../services/api';
import { Facility, User, UserRole, VerificationBundle, AuditData } from '../types';

interface Indicator {
  id: string;
  name: string;
  unit: string;
  description: string;
  formula?: string;
  category?: string;
  dataSourceField?: string;
  thresholdHigh?: number;
  thresholdMedium?: number;
  thresholdLow?: number;
  aggregationType?: string;
}

interface IndicatorConfig {
  gridFactor: number;
  dieselFactor: number;
  wasteFactor: number;
  defaultGridUptime: number;
}

interface StateContextType {
  facilities: Facility[];
  bundles: VerificationBundle[];
  users: User[];
  audits: AuditData[];
  indicators: Indicator[];
  indicatorConfig: IndicatorConfig;
  loading: boolean;
  error: string | null;
  getFacilityById: (hfrId: string) => Facility | undefined;
  getBundlesByFacilityId: (hfrId: string) => VerificationBundle[];
  getAuditsByFacilityId: (facilityId: string) => AuditData[];
  saveAudit: (facilityId: string, auditData: AuditData) => void;
  updateAudit: (auditId: string, auditData: AuditData) => void;
  deleteAudit: (auditId: string) => void;
  updateIndicatorConfig: (config: IndicatorConfig) => void;
  addFacility: (facility: Facility) => void;
  updateFacility: (hfrId: string, facility: Facility) => void;
  deleteFacility: (hfrId: string) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, user: User) => void;
  deleteUser: (userId: string) => void;
  addIndicator: (indicator: Indicator) => void;
  updateIndicator: (indicatorId: string, indicator: Indicator) => void;
  deleteIndicator: (indicatorId: string) => void;
  refreshData: () => Promise<void>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bundles, setBundles] = useState<VerificationBundle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<AuditData[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig>({
    gridFactor: 0.43,
    dieselFactor: 2.67,
    wasteFactor: 0.95,
    defaultGridUptime: 20
  });

  // Load all data from database on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StateContext] Loading all data from database...');

      // Fetch in parallel
      const [facilitiesData, usersData, auditsData, indicatorsData] = await Promise.all([
        facilitiesService.getAll().catch(err => {
          console.error('[StateContext] Failed to load facilities:', err);
          return [];
        }),
        usersService.getAll().catch(err => {
          console.error('[StateContext] Failed to load users:', err);
          return [];
        }),
        auditsService.getAll().catch(err => {
          console.error('[StateContext] Failed to load audits:', err);
          return [];
        }),
        indicatorsService.getAll().catch(err => {
          console.error('[StateContext] Failed to load indicators:', err);
          return [];
        })
      ]);

      console.log(`[StateContext] Loaded ${facilitiesData.length} facilities`);
      console.log(`[StateContext] Loaded ${usersData.length} users`);
      console.log(`[StateContext] Loaded ${auditsData.length} audits`);
      console.log(`[StateContext] Loaded ${indicatorsData.length} indicators`);

      setFacilities(facilitiesData);
      setUsers(usersData);
      setAudits(auditsData);
      setIndicators(indicatorsData);
      setLoading(false);
    } catch (err) {
      console.error('[StateContext] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('[StateContext] Manually refreshing all data...');
    await loadAllData();
  };

  const getFacilityById = (hfrId: string) => {
    return facilities.find(f => f.hfr_id === hfrId);
  };

  const getBundlesByFacilityId = (hfrId: string) => {
    return bundles.filter(b => b.hfr_id === hfrId);
  };

  const getAuditsByFacilityId = (facilityId: string) => {
    return audits.filter(a => a.facility_id === facilityId);
  };

  const saveAudit = (facilityId: string, auditData: AuditData) => {
    const newAudit: AuditData = {
      ...auditData,
      facility_id: facilityId,
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'submitted'
    };
    setAudits(prev => [...prev, newAudit]);
    
    // Save to backend (best-effort)
    auditsService.save(facilityId, newAudit).catch(err => console.error('Failed to save audit to backend:', err));
  };

  const updateAudit = (auditId: string, auditData: AuditData) => {
    setAudits(prev => prev.map(a => a.id === auditId ? { ...auditData, id: auditId, updatedAt: new Date().toISOString() } : a));
  };

  const deleteAudit = (auditId: string) => {
    setAudits(prev => prev.filter(a => a.id !== auditId));
    // Delete from backend (best-effort)
    auditsService.delete(auditId).catch(err => console.error('Failed to delete audit from backend:', err));
  };

  const updateIndicatorConfig = (config: IndicatorConfig) => {
    setIndicatorConfig(config);
    // Save to backend
    configService.update(config).catch(err => console.error('Failed to save config:', err));
  };

  const addFacility = async (facility: Facility) => {
    try {
      console.log('[Facility] Creating facility:', facility.name);
      // Call backend first, only update state if successful
      const response = await facilitiesService.create(facility);
      console.log('[Facility] Successfully created:', response);
      setFacilities(prev => [...prev, facility]);
      return response;
    } catch (err) {
      console.error('[Facility] Failed to create facility:', err);
      throw err; // Re-throw so component can handle the error
    }
  };

  const updateFacility = async (hfrId: string, facility: Facility) => {
    try {
      console.log('[Facility] Updating facility:', hfrId);
      const response = await facilitiesService.update(hfrId, facility);
      console.log('[Facility] Successfully updated:', response);
      setFacilities(prev => prev.map(f => f.hfr_id === hfrId ? { ...f, ...facility } : f));
      return response;
    } catch (err) {
      console.error('[Facility] Failed to update facility:', err);
      throw err;
    }
  };

  const deleteFacility = async (hfrId: string) => {
    try {
      console.log('[Facility] Deleting facility:', hfrId);
      const response = await facilitiesService.delete(hfrId);
      console.log('[Facility] Successfully deleted:', response);
      setFacilities(prev => prev.filter(f => f.hfr_id !== hfrId));
      return response;
    } catch (err) {
      console.error('[Facility] Failed to delete facility:', err);
      throw err;
    }
  };

  const addUser = async (user: User) => {
    try {
      console.log('[User] Creating user:', user.name);
      const response = await usersService.create(user);
      console.log('[User] Successfully created:', response);
      setUsers(prev => [...prev, user]);
      return response;
    } catch (err) {
      console.error('[User] Failed to create user:', err);
      throw err;
    }
  };

  const updateUser = async (userId: string, user: User) => {
    try {
      console.log('[User] Updating user:', userId);
      const response = await usersService.update(userId, user);
      console.log('[User] Successfully updated:', response);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...user } : u));
      return response;
    } catch (err) {
      console.error('[User] Failed to update user:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('[User] Deleting user:', userId);
      const response = await usersService.delete(userId);
      console.log('[User] Successfully deleted:', response);
      setUsers(prev => prev.filter(u => u.id !== userId));
      return response;
    } catch (err) {
      console.error('[User] Failed to delete user:', err);
      throw err;
    }
  };

  const addIndicator = async (indicator: Indicator) => {
    try {
      console.log('[Indicator] Creating indicator:', indicator.name);
      const response = await indicatorsService.create(indicator);
      console.log('[Indicator] Successfully created:', response);
      setIndicators(prev => [...prev, response]);
      return response;
    } catch (err) {
      console.error('[Indicator] Failed to create indicator:', err);
      throw err;
    }
  };

  const updateIndicator = async (indicatorId: string, indicator: Indicator) => {
    try {
      console.log('[Indicator] Updating indicator:', indicatorId);
      const response = await indicatorsService.update(indicatorId, indicator);
      console.log('[Indicator] Successfully updated:', response);
      setIndicators(prev => prev.map(i => i.id === indicatorId ? response : i));
      return response;
    } catch (err) {
      console.error('[Indicator] Failed to update indicator:', err);
      throw err;
    }
  };

  const deleteIndicator = async (indicatorId: string) => {
    try {
      console.log('[Indicator] Deleting indicator:', indicatorId);
      const response = await indicatorsService.delete(indicatorId);
      console.log('[Indicator] Successfully deleted:', response);
      setIndicators(prev => prev.filter(i => i.id !== indicatorId));
      return response;
    } catch (err) {
      console.error('[Indicator] Failed to delete indicator:', err);
      throw err;
    }
  };

  return (
    <StateContext.Provider value={{ 
      facilities, 
      bundles, 
      users,
      audits,
      indicators,
      indicatorConfig,
      loading, 
      error,
      getFacilityById,
      getBundlesByFacilityId,
      getAuditsByFacilityId,
      saveAudit,
      updateAudit,
      deleteAudit,
      updateIndicatorConfig,
      addFacility,
      updateFacility,
      deleteFacility,
      addUser,
      updateUser,
      deleteUser,
      addIndicator,
      updateIndicator,
      deleteIndicator,
      refreshData
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be used within StateProvider');
  return context;
};
