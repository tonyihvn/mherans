

/**
 * Facilities Manager
 * CRUD interface for managing healthcare facilities
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { Plus, Edit, Trash2, X, Save, AlertCircle, CheckCircle, Search, Filter, Download, Eye, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Facility } from '../types';

interface FacilityForm {
  id: string;
  name: string;
  state: string;
  lga: string;
  tier: string;
  ownership: string;
  latitude: string;
  longitude: string;
  region?: string;
  criticality?: string;
}

interface FacilitiesManagerProps {
  onViewDashboard?: (facilityId: string) => void;
}

const FacilitiesManager: React.FC<FacilitiesManagerProps> = ({ onViewDashboard }) => {
  const navigate = useNavigate();
  const { facilities, addFacility, updateFacility, deleteFacility } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('');
  const [filterOwnership, setFilterOwnership] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FacilityForm>({
    id: '',
    name: '',
    state: '',
    lga: '',
    tier: '',
    ownership: '',
    latitude: '',
    longitude: '',
    region: '',
    criticality: ''
  });

  // Filter facilities based on search and filter criteria
  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      const matchesSearch = 
        facility.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.lga?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTier = !filterTier || facility.tier === filterTier;
      const matchesOwnership = !filterOwnership || facility.ownership === filterOwnership;
      
      return matchesSearch && matchesTier && matchesOwnership;
    });
  }, [facilities, searchTerm, filterTier, filterOwnership]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!form.id || !form.name || !form.tier) {
        throw new Error('Please fill in all required fields (ID, Name, Tier)');
      }

      if (editingId) {
        await updateFacility(editingId, {
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined
        } as any);
        setMessage({ type: 'success', text: 'Facility updated successfully!' });
      } else {
        await addFacility({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined
        } as any);
        setMessage({ type: 'success', text: 'Facility added successfully!' });
      }

      resetForm();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'An error occurred';
      setMessage({ type: 'error', text: errorText });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (facility: any) => {
    setForm({
      id: facility.id,
      name: facility.name,
      state: facility.state || '',
      lga: facility.lga || '',
      tier: facility.tier || '',
      ownership: facility.ownership || '',
      latitude: facility.latitude?.toString() || '',
      longitude: facility.longitude?.toString() || '',
      region: facility.region || '',
      criticality: facility.criticality || ''
    });
    setEditingId(facility.id);
    setShowForm(true);
  };

  const handleViewDashboard = (facilityId: string) => {
    if (onViewDashboard) {
      onViewDashboard(facilityId);
    } else {
      // Use hfr_id for dashboard navigation
      const facility = facilities.find(f => f.id === facilityId);
      const hfrId = facility?.hfr_id || facilityId;
      navigate(`/facility/${hfrId}/dashboard`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        setLoading(true);
        await deleteFacility(id);
        setMessage({ type: 'success', text: 'Facility deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        const errorText = error instanceof Error ? error.message : 'Failed to delete facility';
        setMessage({ type: 'error', text: errorText });
        setTimeout(() => setMessage(null), 5000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'State', 'LGA', 'Tier', 'Ownership', 'Region'],
      ...filteredFacilities.map(f => [
        f.id,
        f.name,
        f.state,
        f.lga,
        f.tier,
        f.ownership,
        f.region || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facilities_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      state: '',
      lga: '',
      tier: '',
      ownership: '',
      latitude: '',
      longitude: '',
      region: '',
      criticality: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#03543F] mb-2">Facilities Management</h1>
            <p className="text-slate-600">Create, update, and manage healthcare facilities</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#057A55] hover:bg-[#03543F] text-white rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Facility
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#03543F]">
                  {editingId ? 'Edit Facility' : 'Add New Facility'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Facility ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={form.id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., NG-LA-IDIARABAPHC-0001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Facility Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., General Hospital"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tier <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="tier"
                      value={form.tier}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                    >
                      <option value="">Select Tier</option>
                      <option value="PRIMARY">Primary</option>
                      <option value="SECONDARY">Secondary</option>
                      <option value="TERTIARY">Tertiary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">LGA</label>
                    <input
                      type="text"
                      name="lga"
                      value={form.lga}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., Lagos Mainland"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Region</label>
                    <input
                      type="text"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., South West"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Ownership</label>
                    <select
                      name="ownership"
                      value={form.ownership}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                    >
                      <option value="">Select Ownership</option>
                      <option value="FEDERAL_PUBLIC">Federal Public</option>
                      <option value="STATE_LGA_PUBLIC">State/LGA Public</option>
                      <option value="PRIVATE_FOR_PROFIT">Private For-Profit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Criticality</label>
                    <select
                      name="criticality"
                      value={form.criticality}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                    >
                      <option value="">Select Criticality</option>
                      <option value="C1">C1 - Critical</option>
                      <option value="C2">C2 - Important</option>
                      <option value="C3">C3 - Standard</option>
                      <option value="C4">C4 - Enhanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., 6.5160"
                      step="0.0001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., 3.3590"
                      step="0.0001"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-[#057A55] hover:bg-[#03543F] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

         {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Total Facilities</p>
            <p className="text-3xl font-bold text-[#057A55]">{facilities.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Facilities with Coordinates</p>
            <p className="text-3xl font-bold text-[#057A55]">
              {facilities.filter((f: any) => f.latitude && f.longitude).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">States Covered</p>
            <p className="text-3xl font-bold text-[#057A55]">
              {new Set(facilities.map((f: any) => f.state)).size}
            </p>
          </div>
        </div>

        {/* Facilities Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, name, state, or LGA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                />
              </div>
              
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
              >
                <option value="">All Tiers</option>
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
                <option value="TERTIARY">Tertiary</option>
              </select>

              <select
                value={filterOwnership}
                onChange={(e) => setFilterOwnership(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
              >
                <option value="">All Ownership</option>
                <option value="FEDERAL_PUBLIC">Federal Public</option>
                <option value="STATE_LGA_PUBLIC">State/LGA Public</option>
                <option value="PRIVATE_FOR_PROFIT">Private For-Profit</option>
              </select>

              <button
                onClick={handleExport}
                disabled={filteredFacilities.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ownership</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFacilities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      {facilities.length === 0 ? 'No facilities found' : 'No facilities match your search'}
                    </td>
                  </tr>
                ) : (
                  filteredFacilities.map((facility: any) => (
                    <tr key={facility.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{facility.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{facility.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{facility.tier || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {facility.lga || '-'} {facility.state ? `(${facility.state})` : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{facility.ownership || '-'}</td>
                      <td className="px-6 py-4 text-center space-x-2 flex justify-center">
                        <button
                          onClick={() => handleViewDashboard(facility.id)}
                          className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          title="View facility dashboard"
                          disabled={loading}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(facility)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit facility"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(facility.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete facility"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default FacilitiesManager;
