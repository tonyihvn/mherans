

/**
 * Enhanced Facility Dashboard Component
 * Shows facility details, audit data, and calculated indicators with a map view
 * Organized in a three-column layout with comprehensive sections
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Edit2, TrendingUp, AlertCircle, Plus, Zap, Users, Leaf, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/StateContext';
import AuditForm from './AuditForm';
import { indicatorCalculator } from '../services/indicatorCalculator';
import type { AuditData } from '../services/auditSchema.ts';

declare const L: any;

interface Facility {
  id: string;
  hfr_id: string;
  name: string;
  type?: string;
  state?: string;
  level?: string;
  ownership?: string;
  latitude?: number;
  longitude?: number;
  owner?: string;
  location?: {
    state_code?: string;
    lga_name?: string;
    coordinates?: { lat: number; lng: number };
    latitude?: number;
    longitude?: number;
  };
}

interface FacilityDashboardProps {
  facilityId: string;
  facility?: Facility;
  onBack: () => void;
}

const FacilityDashboardEnhanced: React.FC<FacilityDashboardProps> = ({ 
  facilityId, 
  facility,
  onBack 
}) => {
  const { user } = useAuth();
  const { getFacilityById } = useAppState();
  const [auditData, setAuditData] = useState<Partial<AuditData> | null>(null);
  const [facilityData, setFacilityData] = useState<any>(null);
  const [indicators, setIndicators] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load audit data on component mount
  useEffect(() => {
    // Load facility data from context
    const data = getFacilityById(facilityId);
    setFacilityData(data);
    loadAuditData();
  }, [facilityId]);

  // Initialize map after component mounts
  useEffect(() => {
    if (!facilityData?.location?.coordinates || mapRef.current) return;

    const { lat, lng } = facilityData.location.coordinates;
    if (!containerRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([lat, lng], 13);

    // Use OpenStreetMap tiles (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 2
    }).addTo(mapRef.current);

    // Add marker
    const marker = L.circleMarker([lat, lng], {
      radius: 15,
      fillColor: '#057A55',
      color: '#fff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(mapRef.current);

    marker.bindPopup(`
      <div style="font-size: 12px;">
        <strong>${facilityData.name}</strong><br/>
        ${facilityData.location.state_code} • ${facilityData.level}
      </div>
    `);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [facilityData]);

  // Calculate indicators when audit data changes
  useEffect(() => {
    if (auditData) {
      try {
        const calculated = indicatorCalculator.calculateAllIndicators(auditData as AuditData);
        setIndicators(calculated);
      } catch (err) {
        console.error('Error calculating indicators:', err);
      }
    }
  }, [auditData]);

  const loadAuditData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/audits/facility/${facilityId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAuditData(data);
      } else {
        // No audit data yet - this is normal for new facilities
        setAuditData({});
      }
    } catch (err) {
      setError('Failed to load audit data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAudit = async (data: Partial<AuditData>) => {
    setError('');
    try {
      if (!auditData?.id) {
        // Create new audit
        const response = await fetch(import.meta.env.VITE_API_URL + '/audits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ facilityId, ...data })
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to save audit');
        }
        setAuditData(result.data || result);
        alert('✓ Audit saved successfully to database');
      } else {
        // Update existing audit
        const response = await fetch(`${import.meta.env.VITE_API_URL}/audits/${auditData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update audit');
        }
        setAuditData(result.data || result);
        alert('✓ Audit updated successfully in database');
      }
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save audit';
      setError(errorMessage);
      console.error('Save audit error:', err);
      throw new Error(errorMessage);
    }
  };

  // Check if user can edit (facility owner or admin)
  const canEdit = user?.role === 'admin' || user?.role === facility?.owner;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#057A55]"></div>
          <p className="text-slate-600 mt-4">Loading facility data...</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <AuditForm
          facilityId={facilityId}
          initialData={auditData}
          onSave={handleSaveAudit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{facilityData?.name || 'Facility'}</h1>
            <p className="text-slate-600 text-sm mt-1">
              {facilityData?.location?.state_code || facilityData?.state} • {facilityData?.level} • {facilityData?.ownership}
            </p>
          </div>
          {(user?.role === 'FACILITY_ADMIN' || user?.role === 'STATE_ADMIN') && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] font-semibold"
            >
              <Plus className="w-4 h-4" />
              {auditData && Object.keys(auditData).length > 0 ? 'Edit Audit' : 'Create Audit'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Map Section - Full Width */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-96 bg-slate-200 relative" ref={containerRef}>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">Initializing map...</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {facilityData?.location?.coordinates?.lat.toFixed(3)}, {facilityData?.location?.coordinates?.lng.toFixed(3)}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {facilityData?.location?.state_code} • {facilityData?.location?.lga_name}
            </span>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Facility Information */}
          <div className="space-y-6">
            {/* Facility Identification Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#057A55]" />
                Facility Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Facility Name</p>
                  <p className="text-slate-900 font-semibold text-base">{facilityData?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Facility Level</p>
                    <p className="text-slate-900 font-semibold">{facilityData?.level}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ownership</p>
                    <p className="text-slate-900 font-semibold">{facilityData?.ownership}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">State</p>
                    <p className="text-slate-900 font-semibold">{facilityData?.location?.state_code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">LGA</p>
                    <p className="text-slate-900 font-semibold">{facilityData?.location?.lga_name}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">HFR ID</p>
                  <p className="text-slate-900 font-mono text-sm">{facilityData?.hfr_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Audit Details */}
          <div className="space-y-6">
            {auditData && Object.keys(auditData).length > 1 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#057A55]" />
                  Audit Details
                </h3>
                <div className="space-y-4">
                  {auditData.auditDate && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Audit Date</p>
                      <p className="text-slate-900 font-semibold">{auditData.auditDate}</p>
                    </div>
                  )}
                  {auditData.focalPersonName && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Focal Person</p>
                      <p className="text-slate-900 font-semibold">{auditData.focalPersonName}</p>
                    </div>
                  )}
                  {auditData.gridUptimeHoursPerDay !== undefined && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Grid Uptime</p>
                      <p className="text-blue-900 font-bold text-lg">{auditData.gridUptimeHoursPerDay} <span className="text-sm">hours/day</span></p>
                    </div>
                  )}
                  {auditData.trainedOMStaffCount !== undefined && auditData.trainedOMStaffCount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700 font-semibold mb-1">Trained O&M Staff</p>
                      <p className="text-green-900 font-bold text-lg">{auditData.trainedOMStaffCount}</p>
                    </div>
                  )}
                  {auditData.omStaffSkillsRating && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-700 font-semibold mb-1">O&M Skills Rating</p>
                      <p className="text-purple-900 font-bold text-lg">{auditData.omStaffSkillsRating} <span className="text-sm">/5</span></p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-dashed border-slate-300 p-6">
                <p className="text-slate-600 text-sm font-semibold">No Audit Data Yet</p>
                <p className="text-slate-500 text-xs mt-2">Create an audit record to see audit details here.</p>
              </div>
            )}
          </div>

          {/* Right Column: Key Indicators */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#057A55]" />
                Key Indicators
              </h3>
              
              {Object.keys(indicators).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(indicators).slice(0, 5).map(([id, indicator]: [string, any]) => (
                    <div key={id} className={`rounded-lg p-3 border ${
                      indicator.band === 'high' ? 'bg-green-50 border-green-200' :
                      indicator.band === 'medium' ? 'bg-amber-50 border-amber-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-xs font-semibold ${
                            indicator.band === 'high' ? 'text-green-700' :
                            indicator.band === 'medium' ? 'text-amber-700' :
                            'text-red-700'
                          }`}>{indicator.indicatorName}</p>
                          <p className={`text-lg font-bold mt-1 ${
                            indicator.band === 'high' ? 'text-green-900' :
                            indicator.band === 'medium' ? 'text-amber-900' :
                            'text-red-900'
                          }`}>
                            {indicator.value?.toFixed(1) || 'N/A'} <span className="text-xs font-normal">{indicator.unit}</span>
                          </p>
                        </div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          indicator.band === 'high' ? 'bg-green-200 text-green-800' :
                          indicator.band === 'medium' ? 'bg-amber-200 text-amber-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {indicator.band}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {/* Placeholder Cards */}
                  {[
                    { label: 'Grid Uptime', icon: Zap },
                    { label: 'O&M Staff', icon: Users },
                    { label: 'GHG Emissions', icon: Leaf },
                    { label: 'Emergency Prep.', icon: AlertCircle }
                  ].map((placeholder, idx) => {
                    const Icon = placeholder.icon;
                    return (
                      <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-dashed border-slate-300 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-600">{placeholder.label}</p>
                            <p className="text-sm font-bold text-slate-400 mt-1">—</p>
                          </div>
                          <Icon className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Card */}
            {!isEditing && (user?.role === 'FACILITY_ADMIN' || user?.role === 'STATE_ADMIN') && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] font-semibold transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {auditData && Object.keys(auditData).length > 0 ? 'Update Audit' : 'Start Audit'}
                </button>
                <p className="text-xs text-blue-800 mt-3">
                  {auditData && Object.keys(auditData).length > 0
                    ? 'Update facility audit data to recalculate indicators.'
                    : 'Create your first audit to enable indicator calculations.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDashboardEnhanced;
