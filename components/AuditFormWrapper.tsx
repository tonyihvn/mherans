

/**
 * Audit Form Wrapper - Provides required props to AuditFormRedesigned
 * Handles facilityId from URL params or user context
 * Supports view-only mode via query parameters
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/StateContext';
import AuditFormRedesigned from './AuditFormRedesigned';
import AuditFormViewPage from './AuditFormViewPage';
import { AuditData } from '../services/auditSchema';
import { getApiBaseUrl } from '../utils/apiUrl';

interface AuditPeriod {
  id: string;
  title: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

const AuditFormWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { facilityId: paramsId } = useParams<{ facilityId?: string }>();
  const { user } = useAuth();
  const { audits, facilities } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [auditPeriods, setAuditPeriods] = useState<AuditPeriod[]>([]);
  const [selectedAuditPeriodId, setSelectedAuditPeriodId] = useState<string | null>(null);

  // Check if this is view-only mode
  const viewMode = searchParams.get('mode') === 'view';
  const viewAuditId = searchParams.get('auditId');

  // Initialize facility from URL params
  useEffect(() => {
    if (paramsId && !selectedFacilityId) {
      setSelectedFacilityId(paramsId);
    }
  }, [paramsId]);

  // Determine the facility ID to use
  const facilityId = paramsId || selectedFacilityId || user?.assigned_facility_id || '';

  // In form mode, require both facility AND audit period to be selected
  // In view mode, we only need facility (period comes from URL param ?auditId=X)
  const isFormReady = viewMode ? !!facilityId : (!!facilityId && !!selectedAuditPeriodId);


  // Get accessible facilities based on user role
  const accessibleFacilities = React.useMemo(() => {
    if (!user) return [];

    switch (user.user_type) {
      case 'ADMIN':
        return facilities;
      case 'VALIDATOR':
        return facilities;
      case 'STATE_USER':
      case 'STATE_ADMIN':
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

  // Find existing audit for this facility or specific audit if viewing
  const existingAudit = viewAuditId
    ? audits?.find(a => a.id === viewAuditId)
    : audits?.find(a => a.facility_id === facilityId || a.hfr_id === facilityId);

  // Find the selected facility object
  const selectedFacility = accessibleFacilities.find(f =>
    f.hfr_id === facilityId || f.id === facilityId
  );

  // Debug logging
  useEffect(() => {
    console.log('[AuditFormWrapper] Initialized:', {
      facilityId,
      viewMode,
      viewAuditId,
      userType: user?.user_type,
      assignedFacility: user?.assigned_facility_id,
      auditsCount: audits?.length || 0,
      facilitiesCount: facilities?.length || 0
    });
  }, [facilityId, user, audits, facilities, viewMode, viewAuditId]);

  // Load audit periods
  useEffect(() => {
    const loadAuditPeriods = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/audit-periods', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setAuditPeriods(data || []);
        }
      } catch (error) {
        console.error('Error loading audit periods:', error);
      }
    };
    loadAuditPeriods();
  }, []);

  // Initialize audit period from URL query params or from existing audit
  useEffect(() => {
    const periodFromUrl = searchParams.get('period');
    if (periodFromUrl) {
      setSelectedAuditPeriodId(periodFromUrl);
    } else if (viewAuditId && existingAudit && existingAudit.auditPeriodId) {
      // If editing an existing audit, use its period
      setSelectedAuditPeriodId(existingAudit.auditPeriodId);
    }
  }, [searchParams, viewAuditId, existingAudit]);

  // Handle save
  const handleSave = useCallback(async (data: Partial<AuditData>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        facility_id: facilityId,
        hfr_id: facilityId,
        updatedAt: new Date().toISOString()
      };

      const method = existingAudit ? 'PUT' : 'POST';
      const apiBaseUrl = getApiBaseUrl();
      const url = existingAudit
        ? `${apiBaseUrl}/audits/${existingAudit.id}`
        : `${apiBaseUrl}/audits`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save audit');
      }

      // Show success and navigate back
      alert('✅ Audit form saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving audit:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to save'}`);
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, existingAudit, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // In view mode with auditId, render the view page directly
  if (viewMode && viewAuditId && facilityId) {
    return <AuditFormViewPage />;
  }

  // Skip facility selection screen in view mode or when both facility and period are selected
  if (!isFormReady) {
    console.error('[AuditFormWrapper] Form not ready - missing facility or audit period');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Select a Facility</h2>
          <p className="text-slate-600 mb-6">Please select a facility and audit period to access the audit form.</p>

          {accessibleFacilities.length > 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Facility:
                </label>
                <select
                  value={selectedFacilityId || ''}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                >
                  <option value="">Choose a facility...</option>
                  {accessibleFacilities.map((facility) => (
                    <option key={facility.hfr_id || facility.id} value={facility.hfr_id || facility.id}>
                      {facility.name} ({facility.hfr_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Audit Period:
                </label>
                <select
                  value={selectedAuditPeriodId || ''}
                  onChange={(e) => setSelectedAuditPeriodId(e.target.value || null)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                >
                  <option value="">Select an audit period...</option>
                  {auditPeriods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.title} ({new Date(period.dateFrom).toLocaleDateString()} - {new Date(period.dateTo).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Select the audit period this form applies to
                </p>
              </div>

              <button
                onClick={() => {
                  if (selectedFacilityId && selectedAuditPeriodId) {
                    navigate(`/audit-form/${selectedFacilityId}?period=${selectedAuditPeriodId}`);
                  }
                }}
                disabled={!selectedFacilityId || !selectedAuditPeriodId}
                className="w-full px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#034F41] disabled:bg-slate-400 transition-colors font-semibold"
              >
                Proceed
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Go Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-600 mb-4">No facilities available for your role.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#034F41] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Prepare initial data with facility fields auto-populated
  const prepareInitialData = () => {
    const baseData = existingAudit || {};

    // Auto-populate facility fields from selected facility
    if (selectedFacility && !existingAudit) {
      // Map facility tier to facility type
      const facilityTypeMap: Record<string, string> = {
        'TERTIARY': 'teaching',
        'TEACHING': 'teaching',
        'SECONDARY': 'secondary',
        'PRIMARY': 'primary',
        'PRIVATE': 'private',
        'FAITH_BASED': 'faith_based',
        'FMC': 'fmc',
        'Federal Medical Centre': 'fmc',
        'Federal': 'fmc'
      };

      const facilityType = facilityTypeMap[selectedFacility.tier?.toUpperCase()] ||
                          facilityTypeMap[selectedFacility.tier] ||
                          'primary';

      return {
        ...baseData,
        facilityName: selectedFacility.name || '',
        facilityType,
        locationState: selectedFacility.state || '',
        locationZone: selectedFacility.region || '',
        gpsLatitude: selectedFacility.latitude ? parseFloat(selectedFacility.latitude) : 0,
        gpsLongitude: selectedFacility.longitude ? parseFloat(selectedFacility.longitude) : 0,
        auditPeriodId: selectedAuditPeriodId
      };
    }

    return baseData;
  };

  const initialDataForForm = prepareInitialData();

  console.log('[AuditFormWrapper] Rendering audit form:', {
    facilityId,
    auditPeriodId: selectedAuditPeriodId,
    hasExistingAudit: !!existingAudit
  });

  return (
    <AuditFormRedesigned
      facilityId={facilityId}
      selectedFacility={selectedFacility}
      facilityName={selectedFacility?.name}
      initialData={initialDataForForm}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isLoading}
      readOnly={viewMode}
    />
  );
};

export default AuditFormWrapper;
