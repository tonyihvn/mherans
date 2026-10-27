import React, { createContext, useContext, useState } from 'react';
import { Facility, User, UserRole, VerificationBundle } from '../types';

interface StateContextType {
  facilities: Facility[];
  bundles: VerificationBundle[];
  users: User[];
  loading: boolean;
  error: string | null;
  getFacilityById: (hfrId: string) => Facility | undefined;
  getBundlesByFacilityId: (hfrId: string) => VerificationBundle[];
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facilities] = useState<Facility[]>([]);
  const [bundles] = useState<VerificationBundle[]>([]);
  const [users] = useState<User[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const getFacilityById = (hfrId: string) => {
    return facilities.find(f => f.hfr_id === hfrId);
  };

  const getBundlesByFacilityId = (hfrId: string) => {
    return bundles.filter(b => b.hfr_id === hfrId);
  };

  return (
    <StateContext.Provider value={{ 
      facilities, 
      bundles, 
      users, 
      loading, 
      error,
      getFacilityById,
      getBundlesByFacilityId
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
