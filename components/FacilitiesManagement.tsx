/**
 * Facilities Management Page
 * View, manage, and view audit records for all facilities
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { Search, MapPin, Users, TrendingUp, Edit, Eye, Plus, Filter } from 'lucide-react';

interface FacilitiesManagementProps {
  onViewFacility?: (facilityId: string) => void;
  onEditAudit?: (facilityId: string) => void;
}

const FacilitiesManagement: React.FC<FacilitiesManagementProps> = ({ 
  onViewFacility, 
  onEditAudit 
}) => {
  const { facilities, audits } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const states = useMemo(() => {
    return [...new Set(facilities.map(f => f.state_code))].sort();
  }, [facilities]);

  const levels = useMemo(() => {
    return [...new Set(facilities.map(f => f.level))].sort();
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      const matchesSearch = 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.hfr_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = !selectedState || f.state_code === selectedState;
      const matchesLevel = !selectedLevel || f.level === selectedLevel;
      return matchesSearch && matchesState && matchesLevel;
    });
  }, [facilities, searchTerm, selectedState, selectedLevel]);

  const getAuditCount = (facilityId: string) => {
    return audits?.filter(a => a.facility_id === facilityId).length || 0;
  };

  const getLatestAuditDate = (facilityId: string) => {
    const facilityAudits = audits?.filter(a => a.facility_id === facilityId) || [];
    if (facilityAudits.length === 0) return null;
    const latest = facilityAudits.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0];
    return latest.created_at ? new Date(latest.created_at).toLocaleDateString() : null;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'tertiary': 'bg-purple-100 text-purple-800',
      'secondary': 'bg-blue-100 text-blue-800',
      'primary': 'bg-green-100 text-green-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-[#03543F] mb-4">Facilities Management</h1>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or HFR ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span>{filteredFacilities.length} matching facilities</span>
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="p-6 max-w-7xl mx-auto">
        {filteredFacilities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No facilities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFacilities.map((facility) => {
              const auditCount = getAuditCount(facility.hfr_id);
              const latestAuditDate = getLatestAuditDate(facility.hfr_id);

              return (
                <div
                  key={facility.hfr_id}
                  className="bg-white rounded-lg shadow border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    {/* Facility Info */}
                    <div className="md:col-span-2">
                      <h3 className="font-bold text-slate-900 text-lg">{facility.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">HFR ID: {facility.hfr_id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(facility.level)}`}>
                          {facility.level.charAt(0).toUpperCase() + facility.level.slice(1)}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                          {facility.state_code}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="md:col-span-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-slate-900 font-medium">{facility.location?.lga_name}</p>
                          <p className="text-slate-500">{facility.location?.state_code}</p>
                        </div>
                      </div>
                    </div>

                    {/* Audit Info */}
                    <div className="md:col-span-1">
                      <div className="text-sm">
                        <p className="text-slate-600">
                          <TrendingUp className="w-4 h-4 text-[#057A55] inline mr-1" />
                          <span className="font-semibold">{auditCount}</span> audits
                        </p>
                        {latestAuditDate && (
                          <p className="text-xs text-slate-500 mt-1">Latest: {latestAuditDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewFacility?.(facility.hfr_id)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => onEditAudit?.(facility.hfr_id)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Audit</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitiesManagement;
