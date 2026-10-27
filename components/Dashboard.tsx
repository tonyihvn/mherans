/**
 * Dashboard Component - NHERAMS
 * Shows Leaflet map with all facilities, indicators in popups, and navigation
 * Supports multiple audits per facility (shows latest audit data)
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppState } from '../context/StateContext';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import { indicatorCalculator } from '../services/indicatorCalculator';
import { MapPin, X } from 'lucide-react';
import { AuditData } from '../services/auditSchema';
import FacilitiesAuditOverview from './FacilitiesAuditOverview';

interface DashboardProps {
  onSelectFacility: (facilityId: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectFacility, onLogout }) => {
  const { facilities, audits } = useAppState();
  const { user } = useAuth();
  const { settings } = useAppSettings();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [popupFacilityId, setPopupFacilityId] = useState<string | null>(null);

  // Get latest audit for a facility
  const getLatestAudit = (facilityId: string): AuditData | null => {
    const facilityAudits = audits?.filter(a => a.facility_id === facilityId) || [];
    if (facilityAudits.length === 0) return null;
    return facilityAudits.sort((a, b) =>
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    )[0] as AuditData;
  };

  // Calculate audit count for facility
  const getAuditCount = (facilityId: string): number => {
    return audits?.filter(a => a.facility_id === facilityId).length || 0;
  };

  // Initialize map and popup styles
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Inject popup styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }

      .leaflet-popup {
        z-index: 99999 !important;
        margin: auto !important;
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        width: 40% !important;
        transform: translate(-50%, -50%) !important;
        display: none;
      }

      .leaflet-popup.leaflet-popup-open {
        display: block !important;
      }

      .leaflet-pane.leaflet-popup-pane {
        z-index: 99999 !important;
      }

      .leaflet-popup-content-wrapper {
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4) !important;
        border: none;
        background-color: white;
        overflow: visible;
        position: relative;
        z-index: 99999 !important;
      }

      .leaflet-popup-content {
        margin: 0 !important;
        padding: 0 !important;
        width: 100%;
      }

      .leaflet-popup-tip {
        display: none;
      }

      .leaflet-popup-close-button {
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        font-size: 28px;
        line-height: 32px;
        color: #6b7280;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000 !important;
        cursor: pointer;
      }

      .leaflet-popup-close-button:hover {
        background: white;
        color: #1f2937;
      }

      .facility-popup-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        min-width: 320px;
        max-width: 650px;
        position: relative;
        z-index: 99999 !important;
      }

      .facility-popup-header {
        background: linear-gradient(135deg, #057A55 0%, #045C41 100%);
        color: white;
        padding: 16px;
        border-bottom: 2px solid #e5e7eb;
      }

      .facility-popup-header h3 {
        font-weight: 700;
        font-size: 15px;
        margin: 0 0 6px 0;
        line-height: 1.2;
      }

      .facility-popup-header p {
        font-size: 11px;
        margin: 3px 0;
        opacity: 0.9;
      }

      .facility-popup-indicators {
        padding: 16px;
      }

      .indicators-title {
        font-weight: 600;
        font-size: 12px;
        color: #1f2937;
        margin: 0 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .indicators-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 12px;
      }

      .indicator-card {
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        transition: all 0.2s ease;
        border: none;
        position: relative;
        overflow: hidden;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: white;
      }

      .indicator-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.1;
        z-index: 0;
      }

      .indicator-card > * {
        position: relative;
        z-index: 1;
      }

      .indicator-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }

      .indicator-card.color-1 {
        background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
      }
      .indicator-card.color-2 {
        background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
      }
      .indicator-card.color-3 {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      }
      .indicator-card.color-4 {
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      }
      .indicator-card.color-5 {
        background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
      }
      .indicator-card.color-6 {
        background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
      }
      .indicator-card.color-7 {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      }
      .indicator-card.color-8 {
        background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
      }
      .indicator-card.color-9 {
        background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
      }
      .indicator-card.color-10 {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      }
      .indicator-card.color-11 {
        background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      }
      .indicator-card.color-12 {
        background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
      }

      .indicator-value {
        font-weight: 700;
        font-size: 18px;
        line-height: 1.2;
        margin: 2px 0;
      }

      .indicator-unit {
        font-size: 10px;
        font-weight: 500;
        opacity: 0.9;
      }

      .indicator-name {
        font-size: 10px;
        font-weight: 600;
        margin-top: 6px;
        line-height: 1.1;
        opacity: 0.95;
      }

      .facility-popup-footer {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
      }

      .facility-popup-footer button {
        width: 100%;
        padding: 10px 16px;
        background: linear-gradient(135deg, #057A55 0%, #045C41 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .facility-popup-footer button:hover {
        background: linear-gradient(135deg, #045C41 0%, #034835 100%);
        box-shadow: 0 4px 12px rgba(5, 122, 85, 0.3);
      }

      .no-audit-message {
        background: #fef3c7;
        border: 1px solid #fcd34d;
        border-radius: 8px;
        padding: 12px;
        font-size: 11px;
        color: #92400e;
        text-align: center;
      }
    `;
    document.head.appendChild(style);

    map.current = L.map(mapContainer.current).setView([9.0765, 7.3986], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      document.head.removeChild(style);
    };
  }, []);

  // Update markers when facilities or audits change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Add facility markers
    facilities.forEach((facility) => {
      if (!facility.location?.coordinates) return;

      const { lat, lng } = facility.location.coordinates;
      const latestAudit = getLatestAudit(facility.hfr_id);
      const auditCount = getAuditCount(facility.hfr_id);

      // Get color based on ownership
      const getOwnershipColor = (ownership: string) => {
        const colors: Record<string, string> = {
          federal: '#057A55',
          state: '#0E9F6E',
          local_government: '#06B6D4',
          private: '#EC4899',
          faith_based: '#F59E0B'
        };
        return colors[ownership] || '#6366F1';
      };

      const color = getOwnershipColor(facility.ownership);

      const markerIcon = L.divIcon({
        html: `<svg width="30" height="40" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C6.48 0 2 4.48 2 10c0 7.25 10 22 10 22s10-14.75 10-22c0-5.52-4.48-10-10-10z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="12" cy="10" r="4" fill="white"/></svg>`,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
        className: 'facility-marker'
      });

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map.current!);

      // Get featured indicators
      const featuredIndicators = indicatorCalculator.getFeaturedFormulas();

      // Calculate featured indicator values for this facility
      let indicatorValues: Record<string, { value: number | null; formula: any }> = {};
      if (latestAudit) {
        featuredIndicators.forEach(formula => {
          try {
            const value = indicatorCalculator.calculateIndicator(formula.indicatorId, latestAudit as AuditData);
            indicatorValues[formula.indicatorId] = { value, formula };
          } catch (err) {
            console.error(`Error calculating ${formula.indicatorName}:`, err);
            indicatorValues[formula.indicatorId] = { value: null, formula };
          }
        });
      }

      const popupContent = `
        <div class="facility-popup-card">
          <div class="facility-popup-header">
            <h3>${facility.name}</h3>
            <p><strong>HFR ID:</strong> ${facility.hfr_id}</p>
            <p><strong>Level:</strong> ${facility.level}</p>
            <p><strong>Audits:</strong> ${auditCount}</p>
          </div>

          <div class="facility-popup-indicators">
            ${latestAudit ? `
              <p class="indicators-title">Featured Indicators (${featuredIndicators.length})</p>
              <div class="indicators-grid">
                ${featuredIndicators.map((formula, index) => {
                  const data = indicatorValues[formula.indicatorId];
                  const value = data?.value;
                  const displayValue = value !== null && value !== undefined
                    ? (typeof value === 'number' ? value.toFixed(1) : value)
                    : 'N/A';
                  const colorClass = `color-${((index % 12) + 1)}`;
                  return `
                    <div class="indicator-card ${colorClass}">
                      <div class="indicator-value">${displayValue}</div>
                      <div class="indicator-unit">${formula.unit || ''}</div>
                      <div class="indicator-name">${formula.indicatorName}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div class="no-audit-message">
                📊 No audit data available yet
              </div>
            `}
          </div>

          <div class="facility-popup-footer">
            <button onclick="window.dispatchEvent(new CustomEvent('selectFacility', {detail: '${facility.hfr_id}'}));">
              View Full Details →
            </button>
          </div>
        </div>
      `;

      marker.on('click', () => {
        setPopupFacilityId(facility.hfr_id);
      });

      markers.current.push(marker);
    });
  }, [facilities, audits]);

  // Popup modal component
  const popupFacility = useMemo(() => {
    if (!popupFacilityId) return null;
    return facilities.find(f => f.hfr_id === popupFacilityId);
  }, [popupFacilityId, facilities]);

  const popupAudit = useMemo(() => {
    if (!popupFacilityId) return null;
    return getLatestAudit(popupFacilityId);
  }, [popupFacilityId]);

  const popupIndicatorValues = useMemo(() => {
    if (!popupAudit) return {};
    const featuredIndicators = indicatorCalculator.getFeaturedFormulas();
    const values: Record<string, { value: number | null; formula: any }> = {};

    featuredIndicators.forEach(formula => {
      try {
        const value = indicatorCalculator.calculateIndicator(formula.indicatorId, popupAudit as AuditData);
        values[formula.indicatorId] = { value, formula };
      } catch (err) {
        values[formula.indicatorId] = { value: null, formula };
      }
    });

    return values;
  }, [popupAudit]);

  // Handle facility selection events
  useEffect(() => {
    const handleSelectFacility = (e: Event) => {
      const customEvent = e as CustomEvent;
      const facilityId = customEvent.detail;
      selectFacilityHandler(facilityId);
    };

    window.addEventListener('selectFacility', handleSelectFacility);
    return () => window.removeEventListener('selectFacility', handleSelectFacility);
  }, [onSelectFacility]);

  const selectFacilityHandler = (facilityId: string) => {
    setSelectedFacility(facilityId);
    setShowModal(true);
    onSelectFacility(facilityId);
  };

  const accessibleFacilities = facilities.filter(f => {
    if (user?.user_type === 'ADMIN' || user?.user_type === 'PUBLIC_LITE') return true;
    if (user?.user_type === 'STATE_USER') return f.location?.state_code === user.assigned_state || f.state === user.assigned_state;
    if (user?.user_type === 'FACILITY_USER' || user?.user_type === 'FACILITY_ADMIN') return f.hfr_id === user.assigned_facility_id || f.id === user.assigned_facility_id;
    if (user?.user_type === 'VALIDATOR') return true;
    return false;
  });

  // Get selected facility object
  const selectedFacilityObj = useMemo(() => {
    return facilities.find(f => f.hfr_id === selectedFacility || f.id === selectedFacility);
  }, [selectedFacility, facilities]);

  return (
    <div className="flex-1 flex flex-col w-full">
      <main className="flex-1 p-6 max-w-full w-full">
        {/* ## Facility Map */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#057A55]" />
            Facility Map
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div
                ref={mapContainer}
                style={{ height: '500px', width: '100%' }}
                className="relative z-0"
              />
            </div>

            {/* Facility Details - Only show when selected */}
            {selectedFacility && selectedFacilityObj && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                <div
                  className="text-white p-4 border-b border-slate-200"
                  style={{
                    background: 'linear-gradient(to right, #057A55, #045C41)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{selectedFacilityObj.name}</h3>
                      <p className="text-xs opacity-90 mt-1">{selectedFacilityObj.hfr_id}</p>
                    </div>
                    <button
                      onClick={() => setSelectedFacility(null)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <FacilitiesAuditOverview
                    facilities={[selectedFacilityObj]}
                    onViewFacility={() => {}}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Modal for selected facility */}
      {showModal && selectedFacilityObj && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div
              className="sticky top-0 p-6 flex items-start justify-between"
              style={{
                backgroundColor: settings?.headerBgColor || '#057A55'
              }}
            >
              <div>
                <h3 className="text-2xl font-bold" style={{ color: settings?.headerTextColor || '#ffffff' }}>
                  {selectedFacilityObj.name}
                </h3>
                <p className="text-sm mt-1" style={{ color: settings?.headerTextColor ? `${settings.headerTextColor}dd` : '#c1ffd7' }}>
                  {selectedFacilityObj.state} | {selectedFacilityObj.level}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: settings?.headerTextColor || '#ffffff'
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Audit Overview Card */}
            <div className="p-6">
              <FacilitiesAuditOverview
                facilities={[selectedFacilityObj]}
                onViewFacility={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Popup Modal for Map Markers */}
      {popupFacilityId && popupFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={() => setPopupFacilityId(null)}>
          <div className="max-w-2xl w-96 max-h-[80vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="p-5 flex-shrink-0" style={{ backgroundColor: '#057A55' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold leading-tight line-clamp-2 text-white">{popupFacility.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-opacity-20 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    {popupFacility.level}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-opacity-20 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    {popupFacility.state}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPopupFacilityId(null)}
                className="p-2 rounded-lg transition-colors flex-shrink-0 text-white hover:opacity-80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Featured Indicators */}
            {popupAudit && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  Featured Indicators ({indicatorCalculator.getFeaturedFormulas().length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {indicatorCalculator.getFeaturedFormulas().map((formula, index) => {
                    const data = popupIndicatorValues[formula.indicatorId];
                    const value = data?.value;
                    const displayValue = value !== null && value !== undefined
                      ? (typeof value === 'number' ? value.toFixed(1) : value)
                      : 'N/A';
                    const colorClass = `color-${((index % 12) + 1)}`;
                    const colors = ['#0EA5E9', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#F97316'];
                    const bgColor = colors[index % 12];

                    return (
                      <div
                        key={formula.indicatorId}
                        className="rounded-lg p-3 text-center transition-all hover:shadow-lg hover:-translate-y-0.5 text-white"
                        style={{
                          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
                        }}
                      >
                        <div className="font-bold text-lg mb-1">{displayValue}</div>
                        <div className="text-xs opacity-90">{formula.unit || ''}</div>
                        <div className="text-xs font-semibold mt-2 leading-tight">{formula.indicatorName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 p-4 flex-shrink-0 space-y-2">
            <button
              onClick={() => setPopupFacilityId(null)}
              className="w-full px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;
