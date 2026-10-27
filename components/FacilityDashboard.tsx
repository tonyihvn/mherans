

/**
 * Facility Dashboard Component - Enhanced Version
 * Shows facility details, audit data, and calculated indicators with a map view
 * Organized in a three-column layout with comprehensive sections
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Edit2, TrendingUp, AlertCircle, Plus, Zap, Users, Leaf, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/StateContext';
import AuditForm from './AuditForm';
import { AuditIndicatorCalculator, ComputedIndicators } from '../services/auditIndicatorCalculator';
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

const FacilityDashboard: React.FC<FacilityDashboardProps> = ({ 
  facilityId, 
  facility,
  onBack 
}) => {
  const { user } = useAuth();
  const { getFacilityById } = useAppState();
  const [auditData, setAuditData] = useState<Partial<AuditData> | null>(null);
  const [facilityData, setFacilityData] = useState<any>(null);
  const [indicators, setIndicators] = useState<Partial<ComputedIndicators>>({});
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

    const popupContent = document.createElement('div');
    popupContent.style.cssText = 'font-size: 12px; white-space: nowrap; z-index: 9999;';
    popupContent.innerHTML = `
      <div>
        <strong>${facilityData.name}</strong><br/>
        ${facilityData.location.state_code} • ${facilityData.level}
      </div>
    `;

    marker.bindPopup(popupContent, {
      offset: [0, -20],
      closeButton: true,
      autoPan: true,
      autoPanPaddingTopLeft: [50, 50],
      autoPanPaddingBottomRight: [50, 50]
    });

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
        const calculated = AuditIndicatorCalculator.calculateAllIndicators(auditData as AuditData);
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
        // Show success message
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
        // Show success message
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
              {facilityData?.location?.state_code} • {facilityData?.level} • {facilityData?.ownership}
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
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-md">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#057A55]" />
              Facility Location
            </h2>
            <div className="text-sm text-slate-600 font-mono">
              {facilityData?.location?.coordinates?.lat.toFixed(4)}°N, {facilityData?.location?.coordinates?.lng.toFixed(4)}°E
            </div>
          </div>
          <div className="h-80 bg-slate-200 relative" ref={containerRef}>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">Initializing map...</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm">
            <span className="text-slate-700 font-medium">
              📍 {facilityData?.location?.state_code} • {facilityData?.location?.lga_name}
            </span>
            <a 
              href={`https://maps.google.com/?q=${facilityData?.location?.coordinates?.lat},${facilityData?.location?.coordinates?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#057A55] hover:text-[#045d47] font-semibold text-xs"
            >
              View in Google Maps →
            </a>
          </div>
        </div>

        {/* Main Content Grid - Two Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Facility Information (1 column) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Facility Identification Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                  Facility Info
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Name</p>
                  <p className="text-slate-900 font-bold text-base leading-snug">{facilityData?.name}</p>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Level</p>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    {facilityData?.level}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Ownership</p>
                  <p className="text-slate-900 font-semibold text-sm">{facilityData?.ownership}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Location</p>
                  <div className="space-y-2">
                    <p className="text-slate-900 font-semibold text-sm">
                      {facilityData?.location?.state_code}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {facilityData?.location?.lga_name}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">HFR ID</p>
                  <p className="text-slate-900 font-mono font-bold text-xs bg-slate-100 p-2 rounded border border-slate-300">
                    {facilityData?.hfr_id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle & Right: Audit Details and Indicators (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Audit Details Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Audit Details
                </h3>
              </div>
              
              {auditData && Object.keys(auditData).length > 1 ? (
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {auditData.auditDate && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Audit Date</p>
                        <p className="text-slate-900 font-semibold">{auditData.auditDate}</p>
                      </div>
                    )}
                    {auditData.focalPersonName && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Focal Person</p>
                        <p className="text-slate-900 font-semibold">{auditData.focalPersonName}</p>
                      </div>
                    )}
                    {auditData.gridUptimeHoursPerDay !== undefined && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-xs text-blue-700 font-bold uppercase mb-1 tracking-wide">Grid Uptime</p>
                        <p className="text-blue-900 font-bold text-2xl">{auditData.gridUptimeHoursPerDay}</p>
                        <p className="text-xs text-blue-600 mt-1">hours/day</p>
                      </div>
                    )}
                    {auditData.trainedOMStaffCount !== undefined && auditData.trainedOMStaffCount > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-xs text-purple-700 font-bold uppercase mb-1 tracking-wide">O&M Staff</p>
                        <p className="text-purple-900 font-bold text-2xl">{auditData.trainedOMStaffCount}</p>
                        <p className="text-xs text-purple-600 mt-1">trained personnel</p>
                      </div>
                    )}
                    {auditData.omStaffSkillsRating && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-xs text-orange-700 font-bold uppercase mb-1 tracking-wide">Skills Rating</p>
                        <p className="text-orange-900 font-bold text-2xl">{auditData.omStaffSkillsRating}</p>
                        <p className="text-xs text-orange-600 mt-1">/5 stars</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-lg border-2 border-dashed border-yellow-300 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-slate-900 font-bold text-sm mb-1">No Audit Data Yet</p>
                    <p className="text-slate-600 text-xs">Create an audit record to see detailed audit information.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Key Indicators Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Performance Indicators
                </h3>
              </div>

              {indicators && Object.keys(indicators).length > 0 ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Grid Uptime */}
                    {indicators.gridUptimePercentage !== undefined && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">Grid Uptime</p>
                          <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                            {indicators.gridUptimePercentage >= 95 ? 'High' : indicators.gridUptimePercentage >= 80 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-blue-900 text-3xl font-bold">{indicators.gridUptimePercentage?.toFixed(1)}%</p>
                          <p className="text-xs text-slate-600 mt-1">Availability</p>
                        </div>
                      </div>
                    )}

                    {/* Energy Resilience */}
                    {indicators.energyResilienceScore && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-green-700 font-bold uppercase tracking-wide">Energy Resilience</p>
                          <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">
                            {indicators.energyResilienceScore}
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-green-900 text-3xl font-bold capitalize">{indicators.energyResilienceScore}</p>
                          <p className="text-xs text-slate-600 mt-1">Score</p>
                        </div>
                      </div>
                    )}

                    {/* Total Electrical Load */}
                    {indicators.totalElectricalLoadKW !== undefined && (
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-2 border-yellow-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-yellow-700 font-bold uppercase tracking-wide">Total Load</p>
                          <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                            Current
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-yellow-900 text-3xl font-bold">{indicators.totalElectricalLoadKW?.toFixed(1)}</p>
                          <p className="text-xs text-slate-600 mt-1">kW</p>
                        </div>
                      </div>
                    )}

                    {/* Diesel Displacement */}
                    {indicators.dieselDisplacementPercentage !== undefined && (
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-orange-700 font-bold uppercase tracking-wide">Diesel Displacement</p>
                          <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded">
                            {indicators.dieselDisplacementPercentage >= 50 ? 'High' : indicators.dieselDisplacementPercentage >= 25 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-orange-900 text-3xl font-bold">{indicators.dieselDisplacementPercentage?.toFixed(1)}%</p>
                          <p className="text-xs text-slate-600 mt-1">Reduced</p>
                        </div>
                      </div>
                    )}

                    {/* Renewable Energy */}
                    {indicators.renewableEnergyPercentage !== undefined && (
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border-2 border-emerald-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide">Renewable Energy</p>
                          <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                            {indicators.renewableEnergyPercentage >= 50 ? 'High' : indicators.renewableEnergyPercentage >= 25 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-emerald-900 text-3xl font-bold">{indicators.renewableEnergyPercentage?.toFixed(1)}%</p>
                          <p className="text-xs text-slate-600 mt-1">Generated</p>
                        </div>
                      </div>
                    )}

                    {/* O&M Readiness */}
                    {indicators.omReadinessScore !== undefined && (
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border-2 border-indigo-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-indigo-700 font-bold uppercase tracking-wide">O&M Readiness</p>
                          <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
                            {indicators.omReadinessScore >= 75 ? 'Ready' : indicators.omReadinessScore >= 50 ? 'Partial' : 'Need Work'}
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-indigo-900 text-3xl font-bold">{indicators.omReadinessScore?.toFixed(0)}%</p>
                          <p className="text-xs text-slate-600 mt-1">Score</p>
                        </div>
                      </div>
                    )}

                    {/* Total Annual GHG */}
                    {indicators.totalAnnualGHGEmissionsTonnesCO2 !== undefined && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-red-700 font-bold uppercase tracking-wide">Annual GHG</p>
                          <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded">
                            {indicators.totalAnnualGHGEmissionsTonnesCO2 >= 500 ? 'High' : indicators.totalAnnualGHGEmissionsTonnesCO2 >= 250 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-red-900 text-3xl font-bold">{indicators.totalAnnualGHGEmissionsTonnesCO2?.toFixed(0)}</p>
                          <p className="text-xs text-slate-600 mt-1">tCO₂e</p>
                        </div>
                      </div>
                    )}

                    {/* Waste Management Score */}
                    {indicators.wasteManagementScore !== undefined && (
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border-2 border-pink-300">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-pink-700 font-bold uppercase tracking-wide">Waste Mgmt</p>
                          <span className="bg-pink-200 text-pink-800 text-xs font-bold px-2 py-1 rounded">
                            {indicators.wasteManagementScore >= 75 ? 'Good' : indicators.wasteManagementScore >= 50 ? 'Fair' : 'Need Work'}
                          </span>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-pink-900 text-3xl font-bold">{indicators.wasteManagementScore?.toFixed(0)}%</p>
                          <p className="text-xs text-slate-600 mt-1">Score</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Grid Uptime', icon: Zap },
                      { label: 'Energy Resilience', icon: Zap },
                      { label: 'Total Load', icon: Zap },
                      { label: 'Diesel Displacement', icon: Leaf },
                      { label: 'Renewable Energy', icon: Leaf },
                      { label: 'O&M Readiness', icon: Users },
                      { label: 'Annual GHG', icon: Leaf },
                      { label: 'Waste Management', icon: AlertCircle }
                    ].map((placeholder, idx) => {
                      const Icon = placeholder.icon;
                      return (
                        <div key={idx} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">{placeholder.label}</p>
                              <p className="text-sm font-bold text-slate-400 mt-2">—</p>
                            </div>
                            <Icon className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Card */}
        {!isEditing && (user?.role === 'FACILITY_ADMIN' || user?.role === 'STATE_ADMIN') && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              Next Steps
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-blue-100">
                {auditData && Object.keys(auditData).length > 0
                  ? '📈 Update facility audit data to recalculate indicators and track progress.'
                  : '📋 Create your first audit to enable indicator calculations and track facility performance.'}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 font-bold transition-colors whitespace-nowrap shadow-md"
              >
                {auditData && Object.keys(auditData).length > 0 ? '✏️ Update Audit' : '🆕 Create Audit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityDashboard;
