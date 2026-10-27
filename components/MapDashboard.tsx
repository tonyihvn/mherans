

/**
 * Map Dashboard Component
 * Displays all facilities on a Leaflet map with markers and popups
 * Each marker links to the facility dashboard and shows indicators
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, AlertCircle, Loader, TrendingUp, CheckCircle, AlertTriangle, BarChart3, PieChart, X } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { indicatorCalculator } from '../services/indicatorCalculator';

// Format indicator names: convert camelCase to sentence case with spaces
const formatIndicatorName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
};

interface Facility {
  id: string;
  hfr_id: string;
  name: string;
  location?: {
    coordinates?: { lat: number; lng: number };
    latitude?: number;
    longitude?: number;
    state_code?: string;
  };
  latitude?: number;
  longitude?: number;
  state?: string;
  level?: string;
}

interface FacilityIndicators {
  [key: string]: any;
}

interface MapDashboardProps {
  onFacilitySelect?: (facilityId: string) => void;
  facilities?: Facility[];
}

declare const L: any;

const MapDashboard: React.FC<MapDashboardProps> = ({ onFacilitySelect, facilities: externalFacilities }) => {
  const { facilities: contextFacilities } = useAppState();
  const { settings } = useAppSettings();
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [facilitiesWithCoords, setFacilitiesWithCoords] = useState<Facility[]>([]);
  const [showVisualizations, setShowVisualizations] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedFacilityIndicators, setSelectedFacilityIndicators] = useState<FacilityIndicators | null>(null);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);

  // Get facilities from props or context
  const facilities = externalFacilities || contextFacilities;

  // Log on mount and when facilities change
  useEffect(() => {
    console.log('[MapDashboard] Mounted - Facilities available:', facilities.length);
    console.log('[MapDashboard] Context facilities:', contextFacilities.length);
    console.log('[MapDashboard] External facilities:', externalFacilities?.length || 'None');
    console.log('[MapDashboard] Window.L available:', !!window.L);
    
    return () => {
      console.log('[MapDashboard] Unmounting');
    };
  }, []);

  // Load indicators for selected facility
  useEffect(() => {
    if (!selectedFacility) {
      setSelectedFacilityIndicators(null);
      return;
    }

    const loadFacilityIndicators = async () => {
      setIndicatorsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/audits/facility/${selectedFacility.hfr_id}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const auditData = await response.json();
          const allIndicators = indicatorCalculator.calculateAllIndicators(auditData);
          setSelectedFacilityIndicators(allIndicators);
        } else {
          setSelectedFacilityIndicators(null);
        }
      } catch (err) {
        console.error('Error loading facility indicators:', err);
        setSelectedFacilityIndicators(null);
      } finally {
        setIndicatorsLoading(false);
      }
    };

    loadFacilityIndicators();
  }, [selectedFacility]);

  // Calculate facility statistics
  const statistics = useMemo(() => {
    if (facilitiesWithCoords.length === 0) return null;
    
    const levelCounts = facilitiesWithCoords.reduce((acc: Record<string, number>, f: Facility) => {
      const level = f.level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const stateCounts = facilitiesWithCoords.reduce((acc: Record<string, number>, f: Facility) => {
      const state = f.location?.state_code || f.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFacilities: facilitiesWithCoords.length,
      levelCounts,
      stateCounts,
      topStates: Object.entries(stateCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([state, count]) => ({ state, count }))
    };
  }, [facilitiesWithCoords]);

  // Process facilities to count those with coordinates
  useEffect(() => {
    try {
      console.log('[MapDashboard] Processing facilities:', facilities.length);
      
      const facilitiesWithCoordinates = facilities
        .filter(f => {
          const lat = f.location?.coordinates?.lat || f.location?.latitude || f.latitude;
          const lng = f.location?.coordinates?.lng || f.location?.longitude || f.longitude;
          
          // Debug logging for first few facilities
          if (facilities.indexOf(f) < 3) {
            console.log(`[MapDashboard] Facility: ${f.name}, Lat: ${lat}, Lng: ${lng}`, f);
          }
          
          return lat && lng;
        })
        .slice(0, 100);

      console.log('[MapDashboard] Facilities with coordinates:', facilitiesWithCoordinates.length);
      setFacilitiesWithCoords(facilitiesWithCoordinates);
      setError('');
    } catch (err) {
      console.error('Error processing facilities:', err);
      setError('Failed to process facility data');
    } finally {
      setLoading(false);
    }
  }, [facilities]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || !window.L) {
      return;
    }

    if (facilitiesWithCoords.length === 0) {
      return;
    }

    try {
      const centerLat = facilitiesWithCoords[0]?.location?.coordinates?.lat || 
                       facilitiesWithCoords[0]?.location?.latitude || 
                       facilitiesWithCoords[0]?.latitude || 9.0;
      const centerLng = facilitiesWithCoords[0]?.location?.coordinates?.lng || 
                       facilitiesWithCoords[0]?.location?.longitude || 
                       facilitiesWithCoords[0]?.longitude || 7.5;

      if (mapRef.current) {
        mapRef.current.remove();
      }

      mapRef.current = L.map(containerRef.current).setView([centerLat, centerLng], 6);

      // Use OpenStreetMap tiles (free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 2
      }).addTo(mapRef.current);

      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      facilitiesWithCoords.forEach((facility) => {
        const lat = facility.location?.coordinates?.lat || 
                   facility.location?.latitude || 
                   facility.latitude;
        const lng = facility.location?.coordinates?.lng || 
                   facility.location?.longitude || 
                   facility.longitude;

        if (!lat || !lng) return;

        // Get featured indicators
        const allFormulas = indicatorCalculator.getAllFormulas();
        const featuredFormulas = allFormulas.filter(f => f.featured);

        // Create simple map pin marker without solid background circle
        const customIcon = L.divIcon({
          html: `<svg width="30" height="40" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C6.48 0 2 4.48 2 10c0 7.25 10 22 10 22s10-14.75 10-22c0-5.52-4.48-10-10-10z" fill="#057A55" stroke="white" stroke-width="1.5"/><circle cx="12" cy="10" r="4" fill="white"/></svg>`,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -40],
          className: 'leaflet-marker-icon-transparent'
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);

        const dashboardLink = `/facility/${facility.hfr_id}/dashboard`;

        // Build featured indicators HTML
        // Handle marker click to show floating card instead of popup
        if (onFacilitySelect) {
          marker.on('click', () => {
            setSelectedFacility(facility);
            onFacilitySelect(facility.id || facility.hfr_id);
          });
        } else {
          marker.on('click', () => {
            setSelectedFacility(facility);
          });
        }

        markersRef.current.push(marker);
      });

      console.log(`Map initialized with ${facilitiesWithCoords.length} facilities`);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [facilitiesWithCoords, onFacilitySelect]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      {/* Map Section */}
      <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#057A55]" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Facility Map Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              {facilitiesWithCoords.length > 0 
                ? `${facilitiesWithCoords.length} facilities mapped across Nigeria` 
                : 'Loading facilities...'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ height: '600px' }}>
        {error && (
          <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 z-30 max-w-md">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-700 text-sm font-semibold">Error loading map</p>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 bg-opacity-50 z-30">
            <div className="text-center bg-white p-6 rounded-lg shadow-lg">
              <Loader className="w-8 h-8 text-[#057A55] animate-spin mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Initializing map...</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full bg-slate-200"
          style={{
            minHeight: '600px',
            background: '#e2e8f0'
          }}
        >
          {facilitiesWithCoords.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">No facilities with coordinates found</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Backdrop */}
        {selectedFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 9998 }} onClick={() => setSelectedFacility(null)} />
        )}

        {/* Floating Facility Card */}
        {selectedFacility && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 9999 }}>
            <div className="w-11/12 md:w-2/3 max-h-[85vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in flex flex-col pointer-events-auto" style={{ maxWidth: '700px' }}>
            {/* Header */}
            <div
              className="p-5 flex-shrink-0"
              style={{
                backgroundColor: settings?.headerBgColor || '#057A55'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold leading-tight line-clamp-2" style={{ color: settings?.headerTextColor || '#ffffff' }}>
                    {selectedFacility.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 bg-opacity-20 rounded-lg text-xs font-medium"
                      style={{
                        color: settings?.headerTextColor || '#ffffff',
                        backgroundColor: settings?.headerTextColor ? `${settings.headerTextColor}33` : 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {selectedFacility.level}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 bg-opacity-20 rounded-lg text-xs font-medium"
                      style={{
                        color: settings?.headerTextColor || '#ffffff',
                        backgroundColor: settings?.headerTextColor ? `${settings.headerTextColor}33` : 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {selectedFacility.location?.state_code || selectedFacility.state}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="p-2 rounded-lg transition-colors flex-shrink-0 hover:opacity-80"
                  style={{
                    color: settings?.headerTextColor || '#ffffff'
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Facility Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Facility Details
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-blue-600 font-semibold">HFR ID</p>
                    <p className="text-blue-900 font-mono font-bold mt-1">{selectedFacility.hfr_id}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-semibold">Coordinates</p>
                    <p className="text-blue-900 font-mono mt-1">
                      {(selectedFacility.location?.coordinates?.lat || selectedFacility.latitude)?.toFixed(4)}°N<br/>
                      {(selectedFacility.location?.coordinates?.lng || selectedFacility.longitude)?.toFixed(4)}°E
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured Indicators Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#057A55]" />
                  Featured Indicators
                </h3>

                {indicatorsLoading ? (
                  <div className="flex items-center justify-center py-6 bg-slate-50 rounded-lg">
                    <Loader className="w-4 h-4 text-[#057A55] animate-spin mr-2" />
                    <span className="text-xs text-slate-600">Loading indicators...</span>
                  </div>
                ) : selectedFacilityIndicators && Object.keys(selectedFacilityIndicators).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedFacilityIndicators).slice(0, 8).map(([key, indicator]: [string, any]) => {
                      const bandConfig = {
                        'high': { bg: 'from-green-50 to-green-100', border: 'border-green-300', text: 'text-green-700', valueBold: 'text-green-900', badge: 'bg-green-200 text-green-800' },
                        'medium': { bg: 'from-amber-50 to-amber-100', border: 'border-amber-300', text: 'text-amber-700', valueBold: 'text-amber-900', badge: 'bg-amber-200 text-amber-800' },
                        'low': { bg: 'from-red-50 to-red-100', border: 'border-red-300', text: 'text-red-700', valueBold: 'text-red-900', badge: 'bg-red-200 text-red-800' }
                      };
                      
                      const config = bandConfig[indicator.band as 'high' | 'medium' | 'low'] || bandConfig['medium'];

                      return (
                        <div key={key} className={`bg-gradient-to-br ${config.bg} rounded-lg p-3 border-2 ${config.border}`}>
                          <div className="flex items-start justify-between mb-2">
                            <p className={`${config.text} font-bold text-xs leading-tight flex-1 pr-1`}>{formatIndicatorName(indicator.indicatorName || key)}</p>
                            <span className={`${config.badge} text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0`}>
                              {indicator.band}
                            </span>
                          </div>
                          <p className={`${config.valueBold} text-lg font-bold`}>
                            {indicator.value !== undefined 
                              ? typeof indicator.value === 'number' 
                                ? indicator.value.toFixed(1) 
                                : indicator.value
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{indicator.unit || ''}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-xs text-amber-700 font-semibold">No Audit Data</p>
                    <p className="text-xs text-amber-600 mt-1">Create an audit to see indicators.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Action Buttons */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 p-4 flex-shrink-0 space-y-2">
              <a
                href={`/facility/${selectedFacility.hfr_id}/dashboard`}
                className="w-full block text-center bg-[#057A55] hover:bg-[#045d47] active:bg-[#034435] text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm shadow-md"
              >
                📊 View Dashboard
              </a>
              <button
                onClick={() => setSelectedFacility(null)}
                className="w-full px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Visualizations Section */}
      {facilitiesWithCoords.length > 0 && statistics && (
        <div className="bg-white border-t border-slate-200 flex-1">
          {/* Toggle Section */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4 flex items-center gap-2">
            <button
              onClick={() => setShowVisualizations(!showVisualizations)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
            >
              {showVisualizations ? '▼' : '▶'} Analytics & Insights
            </button>
          </div>

          {/* Charts Grid */}
          {showVisualizations && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Facility Level Distribution */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900">Facility Levels</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(statistics.levelCounts).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">{level}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-300 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{
                                width: `${(count as number / statistics.totalFacilities) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-900 min-w-[30px] text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top States */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-slate-900">Top States</h3>
                  </div>
                  <div className="space-y-3">
                    {statistics.topStates.map(({ state, count }, idx) => (
                      <div key={state} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <span className="text-sm text-slate-700">{state}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-xs text-purple-600 font-semibold uppercase">Total Facilities</p>
                        <p className="text-2xl font-bold text-slate-900">{statistics.totalFacilities}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                      <div>
                        <p className="text-xs text-orange-600 font-semibold uppercase">Mapped Facilities</p>
                        <p className="text-2xl font-bold text-slate-900">{facilitiesWithCoords.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="text-xs text-red-600 font-semibold uppercase">Coverage</p>
                        <p className="text-2xl font-bold text-slate-900">100%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* State Distribution */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Facilities by State
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(statistics.stateCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([state, count]) => (
                      <div key={state} className="bg-white rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-600 font-semibold">{state}</p>
                        <p className="text-lg font-bold text-slate-900">{count}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-popup-tip {
          background-color: white;
        }
      `}</style>
    </div>
  );
};

export default MapDashboard;
