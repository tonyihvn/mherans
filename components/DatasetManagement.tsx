/**
 * Dataset Management
 * Connect to external APIs, fetch data, and create browseable datasets
 * All data saved to database - NO localStorage usage
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, AlertCircle, CheckCircle, Search, Download, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { datasetsService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Dataset {
  id: string;
  name: string;
  api_url: string;
  description?: string;
  data: Record<string, any>[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  rowCount?: number;
}

interface APIConnection {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

const DatasetManagement: React.FC = () => {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);

  const [form, setForm] = useState({
    name: '',
    apiUrl: '',
    description: '',
    method: 'GET' as 'GET' | 'POST',
    headers: '',
    params: ''
  });

  // Load datasets on mount
  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setIsLoadingDatasets(true);
    try {
      const response = await datasetsService.getAll();
      setDatasets(response.data || []);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to load datasets';
      setMessage({ type: 'error', text: errorText });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const filteredDatasets = useMemo(() => {
    return datasets.filter(ds => 
      ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.api_url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [datasets, searchTerm]);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
  
  const paginatedData = selectedDataset ? 
    selectedDataset.data.slice((currentPage - 1) * pageSize, currentPage * pageSize) : [];

  const totalPages = selectedDataset ? Math.ceil(selectedDataset.data.length / pageSize) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFetchData = async () => {
    if (!form.apiUrl) {
      setMessage({ type: 'error', text: 'API URL is required' });
      return;
    }

    setLoading(true);
    try {
      let url = form.apiUrl;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add custom headers
      if (form.headers) {
        try {
          const customHeaders = JSON.parse(form.headers);
          Object.assign(headers, customHeaders);
        } catch (e) {
          throw new Error('Invalid headers JSON format');
        }
      }

      // Add params to URL
      if (form.params && form.method === 'GET') {
        try {
          const params = JSON.parse(form.params);
          const queryString = new URLSearchParams(params).toString();
          url = `${url}?${queryString}`;
        } catch (e) {
          throw new Error('Invalid params JSON format');
        }
      }

      const response = await fetch(url, {
        method: form.method,
        headers,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      let data = await response.json();

      // Handle if response is wrapped in an object
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const firstArray = Object.values(data).find(v => Array.isArray(v));
        if (firstArray) {
          data = firstArray;
        } else {
          data = [data];
        }
      }

      if (!Array.isArray(data)) {
        data = [data];
      }

      // Save to backend
      if (editingId) {
        await datasetsService.update(editingId, form.name, form.apiUrl, form.description, data);
        setMessage({ type: 'success', text: 'Dataset updated successfully in database!' });
      } else {
        await datasetsService.create(form.name, form.apiUrl, form.description, data, user?.id);
        setMessage({ type: 'success', text: 'Dataset created and saved to database!' });
      }

      // Reload datasets
      await loadDatasets();
      resetForm();
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to fetch data';
      setMessage({ type: 'error', text: errorText });
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEdit = async (dataset: Dataset) => {
    try {
      // Fetch full dataset data
      const response = await datasetsService.getById(dataset.id);
      const fullDataset = response.data;
      
      setForm({
        name: fullDataset.name,
        apiUrl: fullDataset.api_url,
        description: fullDataset.description || '',
        method: 'GET',
        headers: '',
        params: ''
      });
      setEditingId(dataset.id);
      setShowForm(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load dataset for editing' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this dataset?')) {
      try {
        await datasetsService.delete(id);
        await loadDatasets();
        if (selectedDatasetId === id) {
          setSelectedDatasetId(null);
        }
        setMessage({ type: 'success', text: 'Dataset deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete dataset' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleExport = () => {
    if (!selectedDataset) return;

    try {
      const csv = [
        Object.keys(selectedDataset.data[0] || {}).join(','),
        ...selectedDataset.data.map(row =>
          Object.values(row).map(v =>
            typeof v === 'string' && v.includes(',') ? `"${v}"` : v
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDataset.name}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      apiUrl: '',
      description: '',
      method: 'GET',
      headers: '',
      params: ''
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
            <h1 className="text-3xl font-bold text-[#03543F] mb-2">Dataset Management</h1>
            <p className="text-slate-600">Connect to APIs, fetch data, and create browseable datasets - All data saved to database</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#057A55] hover:bg-[#03543F] text-white rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Dataset
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Dataset List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search datasets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {/* Dataset List */}
              <div className="overflow-y-auto max-h-96">
                {isLoadingDatasets ? (
                  <p className="p-4 text-center text-slate-500 text-sm">Loading datasets...</p>
                ) : filteredDatasets.length === 0 ? (
                  <p className="p-4 text-center text-slate-500 text-sm">No datasets found</p>
                ) : (
                  filteredDatasets.map(ds => (
                    <button
                      key={ds.id}
                      onClick={() => {
                        setSelectedDatasetId(ds.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left p-3 border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        selectedDatasetId === ds.id ? 'bg-blue-50 border-l-4 border-l-[#057A55]' : ''
                      }`}
                    >
                      <p className="font-media text-sm text-slate-900 truncate">{ds.name}</p>
                      <p className="text-xs text-slate-500 truncate">{ds.rowCount || 0} records</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Updated: {new Date(ds.updated_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* Stats */}
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600">Total Datasets: {datasets.length}</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Dataset Content or Form */}
          <div className="lg:col-span-2">
            {showForm ? (
              // API Connection Form
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#03543F]">
                    {editingId ? 'Edit Dataset' : 'Create New Dataset'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Dataset Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Facilities API Data"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    API URL <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="apiUrl"
                    value={form.apiUrl}
                    onChange={handleChange}
                    placeholder="https://api.example.com/data"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Method
                  </label>
                  <select
                    name="method"
                    value={form.method}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe this dataset..."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Headers (JSON)
                  </label>
                  <textarea
                    name="headers"
                    value={form.headers}
                    onChange={handleChange}
                    placeholder='{"Authorization": "Bearer token"}'
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Parameters (JSON)
                  </label>
                  <textarea
                    name="params"
                    value={form.params}
                    onChange={handleChange}
                    placeholder='{"limit": "100", "offset": "0"}'
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleFetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-[#057A55] hover:bg-[#03543F] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        Fetch Data
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedDataset ? (
              // Dataset DataTable
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {/* DataTable Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedDataset.name}</h3>
                    <p className="text-sm text-slate-500">{selectedDataset.data.length} total records</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(selectedDataset)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleExport}
                      className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedDataset.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DataTable */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {selectedDataset.data.length > 0 &&
                          Object.keys(selectedDataset.data[0]).map(key => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left text-xs font-semibold text-slate-700"
                            >
                              {key}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginatedData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {Object.values(row).map((value: any, i) => (
                            <td key={i} className="px-4 py-3 text-sm text-slate-600">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value={10}>10 rows</option>
                      <option value={25}>25 rows</option>
                      <option value={50}>50 rows</option>
                      <option value={100}>100 rows</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                <p className="text-slate-500 text-lg mb-2">No dataset selected</p>
                <p className="text-slate-400 text-sm">Create a new dataset or select one from the list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetManagement;
