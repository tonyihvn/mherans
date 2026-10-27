

/**
 * Authentication Context - NHERAMS
 * Manages user authentication, role-based access, and facility permissions
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  user_type: 'PUBLIC_LITE' | 'STATE_USER' | 'FACILITY_USER' | 'FACILITY_ADMIN' | 'VALIDATOR' | 'ADMIN';
  assigned_facility_id?: string;
  assigned_state?: string;
  email_verified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  canAccessFacility: (facilityId: string, facilityState?: string) => boolean;
  canEditAudit: () => boolean;
  canValidateAudit: () => boolean;
  canManageUsers: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const canAccessFacility = (facilityId: string, facilityState?: string): boolean => {
    if (!user) return false;
    
    // Admin can access all facilities
    if (user.user_type === 'ADMIN') return true;
    
    // PUBLIC_LITE can access all facilities (read-only)
    if (user.user_type === 'PUBLIC_LITE') return true;
    
    // VALIDATOR can access all facilities
    if (user.user_type === 'VALIDATOR') return true;
    
    // STATE_USER can access facilities in their state
    if (user.user_type === 'STATE_USER' && facilityState) {
      return user.assigned_state === facilityState;
    }
    
    // FACILITY_USER and FACILITY_ADMIN can only access their assigned facility
    if (user.user_type === 'FACILITY_USER' || user.user_type === 'FACILITY_ADMIN') {
      return user.assigned_facility_id === facilityId;
    }
    
    return false;
  };

  const canEditAudit = (): boolean => {
    if (!user) return false;
    // FACILITY_USER, FACILITY_ADMIN, and STATE_USER can enter audits, ADMIN can too
    return user.user_type === 'FACILITY_USER' || 
           user.user_type === 'FACILITY_ADMIN' || 
           user.user_type === 'STATE_USER' || 
           user.user_type === 'ADMIN';
  };

  const canValidateAudit = (): boolean => {
    if (!user) return false;
    // Only VALIDATOR and ADMIN can validate
    return user.user_type === 'VALIDATOR' || user.user_type === 'ADMIN';
  };

  const canManageUsers = (): boolean => {
    if (!user) return false;
    // Only ADMIN can manage users
    return user.user_type === 'ADMIN';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      canAccessFacility,
      canEditAudit,
      canValidateAudit,
      canManageUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
