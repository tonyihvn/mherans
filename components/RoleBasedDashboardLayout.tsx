

/**
 * Role-Based Dashboard Layout - NHERAMS
 * Adapts dashboard layout based on user type with working sidebar navigation
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/StateContext';
import { useAppSettings } from '../context/AppSettingsContext';
import DashboardSummary from './DashboardSummary';
import Dashboard from './Dashboard';
import MapDashboard from './MapDashboard';
import FacilitiesManager from './FacilitiesManager';
import UsersManager from './UsersManager';
import AdminIndicatorsConfigPage from './AdminIndicatorsConfigPage';
import AuditListPage from './AuditListPage';
import AuditFormWrapper from './AuditFormWrapper';
import AuditPeriodManager from './AuditPeriodManager';
import FacilityIndicatorsSummary from './FacilityIndicatorsSummary';
import FacilityDashboardPage from './FacilityDashboardPage';
import AppSettingsPage from './AppSettingsPage';
import RolesPermissionsManager from './RolesPermissionsManager';
import Breadcrumb from './Breadcrumb';
import { Facility } from '../types';
import { LogOut, Menu, X, ChevronDown, LayoutGrid, Building2, Users, Gauge, Settings, Map as MapIcon, FileText, Plus, ClipboardList, Calendar, Lock } from 'lucide-react';

interface RoleBasedDashboardProps {
  onLogout: () => void;
  initialPage?: 'dashboard' | 'map' | 'facilities' | 'users' | 'config' | 'auditForm' | 'viewAudits' | 'auditPeriods' | 'facilityIndicators' | 'facilityDashboard' | 'settings' | 'rolesPermissions';
}

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ onLogout, initialPage = 'map' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ facilityId?: string }>();
  const { user, logout } = useAuth();
  const { facilities } = useAppState();
  const { settings } = useAppSettings();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(params.facilityId || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'map' | 'facilities' | 'users' | 'config' | 'auditForm' | 'viewAudits' | 'auditPeriods' | 'facilityIndicators' | 'facilityDashboard' | 'settings' | 'rolesPermissions'>(initialPage);

  // Initialize page when URL facility param is present
  useEffect(() => {
    if (params.facilityId) {
      setSelectedFacilityId(params.facilityId);
      setCurrentPage('facilityDashboard');
    }
  }, [params.facilityId]);

  // Debug log
  React.useEffect(() => {
    console.log('[RoleBasedDashboard] User type:', user?.user_type, 'User:', user?.name);
  }, [user]);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Auto-select facility for FACILITY_USER and FACILITY_ADMIN
  React.useEffect(() => {
    if ((user?.user_type === 'FACILITY_USER' || user?.user_type === 'FACILITY_ADMIN') && 
        user?.assigned_facility_id && 
        !selectedFacilityId) {
      setSelectedFacilityId(user.assigned_facility_id);
    }
  }, [user?.user_type, user?.assigned_facility_id, selectedFacilityId]);

  // Filter facilities based on user type
  const accessibleFacilities = useMemo(() => {
    if (!user) return [];
    
    switch (user.user_type) {
      case 'ADMIN':
        return facilities;
      case 'PUBLIC_LITE':
        return facilities;
      case 'VALIDATOR':
        return facilities;
      case 'STATE_USER':
        return facilities.filter(f => 
          f.location?.state_code === user.assigned_state || 
          f.state === user.assigned_state
        );
      case 'FACILITY_USER':
      case 'FACILITY_ADMIN':
        return facilities.filter(f => 
          f.hfr_id === user.assigned_facility_id || 
          f.id === user.assigned_facility_id
        );
      default:
        return [];
    }
  }, [user, facilities]);

  // Get selected facility details
  const selectedFacility = useMemo(() => {
    if (!selectedFacilityId) return null;
    return accessibleFacilities.find(f => f.hfr_id === selectedFacilityId || f.id === selectedFacilityId);
  }, [selectedFacilityId, accessibleFacilities]);

  const showSidebar = true; // Show sidebar for all users
  const showFacilityDropdown = ['ADMIN', 'STATE_USER', 'VALIDATOR'].includes(user?.user_type || '');
  const adminNavigation = ['ADMIN', 'STATE_USER', 'VALIDATOR', 'PUBLIC_LITE'].includes(user?.user_type || '');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header
        className="border-b border-slate-200 sticky top-0 z-50"
        style={{
          backgroundColor: settings?.headerBgColor || '#ffffff'
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {showSidebar && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" style={{ color: settings?.headerTextColor || '#1f2937' }} />
                ) : (
                  <Menu className="w-5 h-5" style={{ color: settings?.headerTextColor || '#1f2937' }} />
                )}
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ color: settings?.headerTextColor || '#1f2937' }}>NHERAMS Dashboard</h1>
              <p className="text-xs" style={{ color: settings?.headerTextColor ? `${settings.headerTextColor}99` : '#6b7280' }}>
                {selectedFacility ? selectedFacility.name : (
                  <>
                    {user?.user_type === 'PUBLIC_LITE' && 'Public User'}
                    {user?.user_type === 'FACILITY_USER' && 'Facility User'}
                    {user?.user_type === 'FACILITY_ADMIN' && 'Facility Admin'}
                    {user?.user_type === 'STATE_USER' && `State User - ${user.assigned_state}`}
                    {user?.user_type === 'VALIDATOR' && 'Validator'}
                    {user?.user_type === 'ADMIN' && 'Administrator'}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold" style={{ color: settings?.headerTextColor || '#1f2937' }}>{user?.name}</p>
              <p className="text-xs" style={{ color: settings?.headerTextColor ? `${settings.headerTextColor}99` : '#6b7280' }}>{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: settings?.buttonBgColor || '#057A55',
                color: settings?.buttonTextColor || '#ffffff'
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage={currentPage} />

      {/* Facility Selector Dropdown - For Admin/State User/Validator */}
      {showFacilityDropdown && currentPage === 'dashboard' && (
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Select Facility:</label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-900 min-w-max"
              >
                {selectedFacility?.name || 'Choose a facility...'}
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-max">
                  {accessibleFacilities.map((facility) => (
                    <button
                      key={facility.hfr_id || facility.id}
                      onClick={() => {
                        setSelectedFacilityId(facility.hfr_id || facility.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        selectedFacilityId === (facility.hfr_id || facility.id)
                          ? 'bg-[#057A55] text-white'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold">{facility.name}</div>
                      <div className="text-xs opacity-75">{facility.hfr_id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Navigation for all users */}
        {showSidebar && (
          <aside
            className={`text-slate-200 transition-all duration-300 overflow-y-auto ${
              sidebarOpen ? 'w-64' : 'w-0'
            }`}
            style={{
              backgroundColor: settings?.primaryColor || '#057A55'
            }}
          >
            {sidebarOpen && (
              <div className="p-6 space-y-8">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">
                    N
                  </div>
                  <div className="text-white font-bold">NHERAMS</div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Navigation</h2>

                  {/* Facility Map - Primary navigation for all users */}
                  {user && (
                    <button
                      onClick={() => setCurrentPage('map')}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === 'map' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <MapIcon className="w-4 h-4" />
                      Facility Map
                    </button>
                  )}

                  {/* Audit Form - for all users */}
                  {user && (
                    <button
                      onClick={() => setCurrentPage('auditForm')}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === 'auditForm' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Audit Form
                    </button>
                  )}

                  {/* View Audits - for facility_admin or show Audits for other roles */}
                  {user?.user_type === 'FACILITY_ADMIN' && (
                    <button
                      onClick={() => setCurrentPage('viewAudits')}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === 'viewAudits' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      View Audits
                    </button>
                  )}

                  {/* Audits - for admin/validator/state_user */}
                  {['ADMIN', 'VALIDATOR', 'STATE_USER'].includes(user?.user_type || '') && (
                    <button
                      onClick={() => setCurrentPage('viewAudits')}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === 'viewAudits' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      Audits
                    </button>
                  )}
                </nav>

                {/* Admin-only Navigation */}
                {['ADMIN', 'STATE_USER', 'VALIDATOR'].includes(user?.user_type || '') && (
                  <nav className="space-y-2">
                    <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Management</h2>

                    {user?.user_type === 'ADMIN' && (
                      <>
                        <button
                          onClick={() => setCurrentPage('auditPeriods')}
                          className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === 'auditPeriods' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          Audit Periods
                        </button>

                        <button
                          onClick={() => setCurrentPage('facilities')}
                          className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === 'facilities' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          Facilities
                        </button>

                        <button
                          onClick={() => setCurrentPage('users')}
                          className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === 'users' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          Users
                        </button>

                        <button
                          onClick={() => setCurrentPage('config')}
                          className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === 'config' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <Gauge className="w-4 h-4" />
                          Indicators
                        </button>

                        <button
                          onClick={() => setCurrentPage('rolesPermissions')}
                          className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === 'rolesPermissions' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <Lock className="w-4 h-4" />
                          Roles & Permissions
                        </button>
                      </>
                    )}
                  </nav>
                )}

                {/* Settings */}
                <nav className="space-y-2">
                  <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Settings</h2>
                  {user?.user_type === 'ADMIN' && (
                    <button
                      onClick={() => setCurrentPage('settings')}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === 'settings' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors text-slate-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Dashboard Page - Show facilities map */}
          {currentPage === 'dashboard' && (
            <div className="h-full">
              <div className="bg-white">
                <Dashboard
                  onSelectFacility={(id) => {
                    setSelectedFacilityId(id);
                    setCurrentPage('facilityDashboard');
                  }}
                  onLogout={onLogout}
                />
              </div>
            </div>
          )}

          {/* Map View Page - Show enhanced map with facility markers */}
          {currentPage === 'map' && (
            <MapDashboard 
              onFacilitySelect={(id) => setSelectedFacilityId(id)}
            />
          )}

          {/* Facilities Management Page */}
          {currentPage === 'facilities' && (
            <FacilitiesManager
              onViewDashboard={(facilityId) => {
                setSelectedFacilityId(facilityId);
                setCurrentPage('facilityDashboard');
              }}
            />
          )}

          {/* Users Management Page */}
          {currentPage === 'users' && (
            <UsersManager />
          )}

          {/* Indicators Configuration Page */}
          {currentPage === 'config' && (
            <AdminIndicatorsConfigPage />
          )}

          {/* Audit List and Management Page */}
          {currentPage === 'auditForm' && (
            <div className="p-6">
              <AuditFormWrapper />
            </div>
          )}

          {/* View Audits List Page - for facility_admin */}
          {currentPage === 'viewAudits' && (
            <AuditListPage
              onSelectFacility={(id) => setSelectedFacilityId(id)}
              facilityOnly={true}
            />
          )}

          {/* Audit Periods Configuration Page - Admin only */}
          {currentPage === 'auditPeriods' && (
            <AuditPeriodManager />
          )}

          {/* Facility Indicators Summary Page */}
          {currentPage === 'facilityIndicators' && selectedFacilityId && (
            <FacilityIndicatorsSummary facilityId={selectedFacilityId} />
          )}

          {/* Facility Dashboard Page */}
          {currentPage === 'facilityDashboard' && selectedFacilityId && (
            <FacilityDashboardPage facilityId={selectedFacilityId} />
          )}

          {/* App Settings Page */}
          {currentPage === 'settings' && (
            <AppSettingsPage />
          )}

          {/* Roles & Permissions Management Page */}
          {currentPage === 'rolesPermissions' && (
            <RolesPermissionsManager />
          )}
        </main>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
