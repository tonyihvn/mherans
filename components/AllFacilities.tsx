/**
 * AllFacilities Component - NHERAMS Prototype
 * Displays all facilities with map view and facility cards
 */

import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import FacilityCard from './FacilityCard';
import LeafletMap from './LeafletMap';
import { AlertCircle, Map, Grid3x3, ChevronLeft } from 'lucide-react';

const AllFacilities: React.FC = () => {
  const { facilities, bundles, getBundlesByFacilityId } = useAppState();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedFacilityForMap, setSelectedFacilityForMap] = useState<string | null>(null);

  // Filter facilities to show on map (those with coordinates)
  const facilitiesWithCoordinates = facilities.filter(f => 
    f.coordinates || (f.location?.coordinates)
  );

  if (viewMode === 'map') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Grid
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Facilities Map</h1>
                <p className="text-sm text-slate-600">{facilitiesWithCoordinates.length} facilities with coordinates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 overflow-hidden">
          <LeafletMap
            onSelectFacility={(facilityId) => {
              setSelectedFacilityForMap(facilityId);
            }}
            facilities={facilitiesWithCoordinates}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Synth Disclaimer Banner */}
      <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] rounded p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#92400E]">
          <strong>Synthetic Data Demo:</strong> All facility data is banded and synthetic. See each facility card for publication lag and
          banding details. No raw values exposed.
        </div>
      </div>

      {/* Header with View Toggle */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#03543F] mb-2">Six NHERAMS Pilot Facilities</h1>
            <p className="text-slate-600 max-w-3xl">
              One standard facility template across all care levels, ownership types, energy profiles, and geopolitical zones.
            </p>
          </div>
          <button
            onClick={() => setViewMode('map')}
            className="flex items-center gap-2 px-6 py-3 bg-[#057A55] hover:bg-[#045C41] text-white rounded-lg font-semibold transition-all"
            title={`View map of ${facilitiesWithCoordinates.length} facilities with coordinates`}
          >
            <Map className="w-5 h-5" />
            Map View
          </button>
        </div>

        {/* Owner-Validator-Consumer Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Owner */}
          <div className="bg-[#057A55] text-white rounded-lg p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Controller</p>
            <p className="font-bold text-sm">Federal Ministry of Health</p>
          </div>

          {/* Validators */}
          <div className="bg-[#0E9F6E] text-white rounded-lg p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Validators (Badged)</p>
            <p className="text-xs">State MOH, NEMSA, SafeCare/EHS</p>
          </div>

          {/* Consumers */}
          <div className="bg-[#C99A2E] text-white rounded-lg p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Consumer Tiers</p>
            <p className="text-xs">Facilities • States • Financiers • Public</p>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 gap-8">
        {facilities.map((facility) => {
          const facilityBundles = getBundlesByFacilityId(facility.hfr_id);
          const bundle = facilityBundles.length > 0 ? facilityBundles[0] : undefined;

          return (
            <FacilityCard key={facility.hfr_id} facility={facility} bundle={bundle} />
          );
        })}
      </div>

      {/* Footer - Synth Disclaimer */}
      <footer className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-6 text-center text-sm text-[#92400E]">
        <p className="font-semibold">Synthetic Data Demo: All facility data shown is banded and synthetic for demonstration purposes.</p>
        <p className="text-xs mt-2 opacity-75">
          This portal demonstrates that NHERAMS uses one master facility record, indicator registry, validator model, and Verification Bundle
          structure for all facilities—regardless of level, ownership, energy mix, or geographic location.
        </p>
      </footer>
    </div>
  );
};

export default AllFacilities;
