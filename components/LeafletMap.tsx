


import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/StateContext';
import { indicatorCalculator } from '../services/indicatorCalculator';
import { MapPin, TrendingUp, Zap, Users } from 'lucide-react';

declare const L: any;

interface LeafletMapProps {
  onSelectFacility?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

interface FacilityIndicators {
  [facilityId: string]: {
    uptime?: number;
    omStaff?: number;
    emissions?: number;
    band?: 'high' | 'medium' | 'low';
  };
}

const LeafletMap: React.FC<LeafletMapProps> = ({ onSelectFacility, center = [9.0820, 8.6753], zoom = 6 }) => {
  const { facilities } = useAppState();
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicators, setIndicators] = useState<FacilityIndicators>({});
  const [loading, setLoading] = useState(true);

  // Fetch audit data and calculate indicators for each facility
  useEffect(() => {
    const loadIndicators = async () => {
      setLoading(true);
      const indicatorsData: FacilityIndicators = {};

      for (const facility of facilities) {
        try {
          // Fetch latest audit for facility
          const response = await fetch(import.meta.env.VITE_API_URL + '/audits/facility/${facility.hfr_id}`, {
            credentials: 'include'
          });
          if (response.ok) {
            const auditData = await response.json();

            // Calculate indicators
            const allIndicators = indicatorCalculator.calculateAllIndicators(auditData);

            // Extract key indicators for display
            indicatorsData[facility.hfr_id] = {
              uptime: allIndicators.uptime_percentage?.value,
              omStaff: allIndicators.om_staff_capacity?.value,
              emissions: allIndicators.ghg_annual_emissions?.value,
              band: allIndicators.uptime_percentage?.band || 'medium'
            };
          }
        } catch (err) {
          console.log(`No audit data for facility ${facility.hfr_id}`);
          // Facility has no audit data yet
        }
      }

      setIndicators(indicatorsData);
      setLoading(false);
    };

    if (facilities.length > 0) {
      loadIndicators();
    }
  }, [facilities]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView(center, zoom);

    // Use OpenStreetMap tiles (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 2
    }).addTo(mapRef.current);

    // Create custom icon based on indicator band
    const createMarkerIcon = (band?: 'high' | 'medium' | 'low') => {
      let color = '#6B7280'; // gray for no data
      if (band === 'high') color = '#10B981'; // green
      else if (band === 'medium') color = '#F59E0B'; // amber
      else if (band === 'low') color = '#EF4444'; // red

      return L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            📍
          </div>
        `,
        iconSize: [32, 32],
        popupAnchor: [0, -16]
      });
    };

    // Add facility markers
    facilities.forEach((f) => {
      if (f.location?.coordinates) {
        const facilityIndicators = indicators[f.hfr_id];
        const band = facilityIndicators?.band;

        const marker = L.marker([f.location.coordinates.lat, f.location.coordinates.lng], { 
          icon: createMarkerIcon(band)
        }).addTo(mapRef.current!);

        // Build popup content with indicator summary
        const indicatorSummary = facilityIndicators
          ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">
              <div style="background: #F0F9FF; padding: 8px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">Grid Uptime</div>
                <div style="font-weight: bold; color: #0369A1;">${facilityIndicators.uptime ? facilityIndicators.uptime.toFixed(1) : 'N/A'}%</div>
              </div>
              <div style="background: #F0FDF4; padding: 8px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">O&M Staff</div>
                <div style="font-weight: bold; color: #059669;">${facilityIndicators.omStaff ? Math.round(facilityIndicators.omStaff) : 'N/A'}</div>
              </div>
              <div style="background: #FEF3C7; padding: 8px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">GHG Emissions</div>
                <div style="font-weight: bold; color: #B45309;">${facilityIndicators.emissions ? (facilityIndicators.emissions / 1000).toFixed(1) : 'N/A'} tCO₂e</div>
              </div>
              <div style="background: ${band === 'high' ? '#D1FAE5' : band === 'medium' ? '#FEF3C7' : '#FEE2E2'}; padding: 8px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">Overall</div>
                <div style="font-weight: bold; color: ${band === 'high' ? '#059669' : band === 'medium' ? '#B45309' : '#DC2626'};">${band ? band.toUpperCase() : 'N/A'}</div>
              </div>
            </div>
          `
          : `<p style="font-size: 12px; color: #94A3B8; margin-bottom: 12px;">No audit data yet</p>`;

        const popupContent = `
          <div style="width: 280px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="margin-bottom: 12px;">
              <h4 style="font-weight: bold; font-size: 14px; color: #1E293B; margin-bottom: 4px;">${f.name}</h4>
              <p style="font-size: 11px; color: #64748B; margin: 2px 0;">${f.location?.state_code} • ${f.level}</p>
              <p style="font-size: 11px; color: #94A3B8;">HFR ID: ${f.hfr_id}</p>
            </div>

            <div style="border-top: 1px solid #E2E8F0; padding-top: 12px;">
              <p style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Key Indicators</p>
              ${indicatorSummary}
            </div>

            <button 
              onclick="window.location.href='/facility/${f.hfr_id}'; event.stopPropagation();"
              style="
                width: 100%;
                background-color: #008489;
                color: white;
                border: none;
                padding: 8px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 12px;
                cursor: pointer;
                margin-top: 12px;
                text-transform: uppercase;
              "
            >
              View Dashboard
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });
        marker.on('click', () => {
          if (onSelectFacility) onSelectFacility(f.id);
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [facilities, indicators, onSelectFacility]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} className="w-full h-full min-h-[400px]" />
      {loading && facilities.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#64748B',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          Loading indicators...
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
