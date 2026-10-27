/**
 * Facility User / Admin Dashboard - Audit form and facility info
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/StateContext';
import { useAppSettings } from '../context/AppSettingsContext';
import AuditForm from './AuditForm';
import { LogOut, Menu, X, FileText, Home, Building2, Settings } from 'lucide-react';
import { AuditData } from '../types';

interface FacilityDashboardProps {
  onLogout: () => void;
}

const FacilityAdminDashboard: React.FC<FacilityDashboardProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { facilities, saveAudit, loading, error } = useAppState();
  const { settings } = useAppSettings();
  const [showErrors, setShowErrors] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'audit' | 'info'>('dashboard');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('[FacilityAdminDashboard] Component mounted');
    console.log('[FacilityAdminDashboard] User:', user);
    console.log('[FacilityAdminDashboard] User type:', user?.user_type);
    console.log('[FacilityAdminDashboard] Assigned Facility ID:', user?.assigned_facility_id);
  }, [user, loading, error]);

  const userTypeLabel = user?.user_type === 'FACILITY_ADMIN' ? 'Facility Admin' : 'Facility User';

  // Get the facility assigned to this user
  const assignedFacility = React.useMemo(() => {
    if (!user?.assigned_facility_id) return null;
    return facilities.find(f => f.hfr_id === user.assigned_facility_id || f.id === user.assigned_facility_id);
  }, [user?.assigned_facility_id, facilities]);

  const handleSaveAudit = async (data: Partial<AuditData>) => {
    if (!assignedFacility) throw new Error('Facility not found');
    
    try {
      saveAudit(assignedFacility.hfr_id || assignedFacility.id, {
        ...data,
        facility_id: assignedFacility.hfr_id || assignedFacility.id,
        lastAuditDate: new Date().toISOString()
      });
      
      setSuccessMessage('✓ Audit saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Error Display */}
      {showErrors && error && (
        <div className="bg-red-50 border-b-2 border-red-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-red-900">Error</h3>
                <div className="text-sm text-red-800 mt-2">
                  <p>{error}</p>
                </div>
              </div>
              <button
                onClick={() => setShowErrors(false)}
                className="text-red-900 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with logout */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-slate-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">NHERAMS - Facility Dashboard</h1>
              <p className="text-xs text-slate-500">{userTypeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
                
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>

                <button 
                  onClick={() => setActiveTab('audit')}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'audit' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Submit Audit
                </button>

                <button 
                  onClick={() => setActiveTab('info')}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'info' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Facility Info
                </button>
              </nav>

              {/* Settings */}
              <nav className="space-y-2">
                <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Settings</h2>
                <button 
                  onClick={onLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors text-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-full bg-slate-50">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 border-4 border-[#057A55] border-t-transparent animate-spin"></div>
                <p className="text-slate-700 font-semibold">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {!loading && activeTab === 'dashboard' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Welcome back, {user?.name}!</h2>
                
                {assignedFacility && (
                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#057A55]">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{assignedFacility.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-slate-600">
                      <div>
                        <p className="text-sm font-semibold">HFR ID</p>
                        <p className="text-base">{assignedFacility.hfr_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Type</p>
                        <p className="text-base">{assignedFacility.type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">State</p>
                        <p className="text-base">{assignedFacility.state || assignedFacility.location?.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">LGA</p>
                        <p className="text-base">{assignedFacility.lga || assignedFacility.location?.lga || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {!loading && activeTab === 'audit' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Audit Form</h2>
                
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-900 font-semibold">
                    {successMessage}
                  </div>
                )}

                {assignedFacility ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-slate-600 mb-6">
                      Facility: <span className="font-bold">{assignedFacility.name}</span>
                    </p>
                    <AuditForm
                      facilityId={assignedFacility.hfr_id || assignedFacility.id}
                      onSave={handleSaveAudit}
                      onCancel={() => setActiveTab('dashboard')}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-slate-600 font-semibold">Facility information not available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Facility Info Tab */}
          {!loading && activeTab === 'info' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Facility Information</h2>
                
                {assignedFacility ? (
                  <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-slate-600 font-semibold">Facility Name</p>
                          <p className="text-slate-900">{assignedFacility.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold">HFR ID</p>
                          <p className="text-slate-900">{assignedFacility.hfr_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold">Type</p>
                          <p className="text-slate-900">{assignedFacility.type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold">State</p>
                          <p className="text-slate-900">{assignedFacility.state || assignedFacility.location?.state || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold">LGA</p>
                          <p className="text-slate-900">{assignedFacility.lga || assignedFacility.location?.lga || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold">Ward</p>
                          <p className="text-slate-900">{assignedFacility.ward || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {assignedFacility.location && (
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Location Coordinates</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-slate-600 font-semibold">Latitude</p>
                            <p className="text-slate-900">{assignedFacility.location.latitude}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 font-semibold">Longitude</p>
                            <p className="text-slate-900">{assignedFacility.location.longitude}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-slate-600 font-semibold">Facility information not available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FacilityAdminDashboard;
