

/**
 * Audit Period Manager
 * Allows admins to create and manage audit periods with database persistence
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, AlertCircle, Loader } from 'lucide-react';

interface AuditPeriod {
  id: string;
  title: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  status: 'active' | 'inactive' | 'closed';
  createdAt?: string;
}

interface AuditPeriodForm {
  title: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  status: 'active' | 'inactive' | 'closed';
}

const AuditPeriodManager: React.FC = () => {
  const [periods, setPeriods] = useState<AuditPeriod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AuditPeriodForm>({
    title: '',
    description: '',
    dateFrom: '',
    dateTo: '',
    status: 'active'
  });

  // Load audit periods from database on mount
  useEffect(() => {
    loadAuditPeriods();
  }, []);

  const loadAuditPeriods = async () => {
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/audit-periods', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPeriods(data || []);
      } else {
        throw new Error('Failed to load audit periods');
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to load audit periods';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.title || !form.dateFrom || !form.dateTo) {
        throw new Error('Please fill in all required fields');
      }

      if (new Date(form.dateFrom) >= new Date(form.dateTo)) {
        throw new Error('End date must be after start date');
      }

      setSubmitting(true);

      if (editingId) {
        // Update existing period
        const response = await fetch(import.meta.env.VITE_API_URL + '/audit-periods/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update audit period');
        }

        const updated = await response.json();
        setPeriods(periods.map(p => p.id === editingId ? { ...p, ...updated } : p));
        setMessage({ type: 'success', text: 'Audit period updated successfully!' });
        setEditingId(null);
      } else {
        // Create new period
        const newId = `period-${Date.now()}`;
        const response = await fetch(import.meta.env.VITE_API_URL + '/audit-periods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: newId,
            ...form
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create audit period');
        }

        const created = await response.json();
        setPeriods([...periods, created]);
        setMessage({ type: 'success', text: 'Audit period created successfully!' });
      }

      resetForm();
      setShowForm(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'An error occurred';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (period: AuditPeriod) => {
    setForm({
      title: period.title,
      description: period.description,
      dateFrom: period.dateFrom,
      dateTo: period.dateTo,
      status: period.status
    });
    setEditingId(period.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this audit period?')) return;

    try {
      setSubmitting(true);
      const response = await fetch(import.meta.env.VITE_API_URL + '/audit-periods/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete audit period');
      }

      setPeriods(periods.filter(p => p.id !== id));
      setMessage({ type: 'success', text: 'Audit period deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to delete audit period';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      dateFrom: '',
      dateTo: '',
      status: 'active'
    });
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Audit Periods</h1>
            <p className="text-slate-600 mt-1">Configure audit period schedules for data collection</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] disabled:bg-slate-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Audit Period
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`} />
            <p className={`text-sm font-semibold ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>{message.text}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Audit Period' : 'Create New Audit Period'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={submitting}
                className="p-2 hover:bg-slate-100 disabled:hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Q1 2026 Audit"
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none disabled:bg-slate-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={form.dateFrom}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={form.dateTo}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional description..."
                  disabled={submitting}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] disabled:bg-slate-400 transition-colors font-semibold"
              >
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update Period' : 'Create Period'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={submitting}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 disabled:hover:bg-slate-50 rounded-lg transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-[#057A55] animate-spin" />
          </div>
        )}

        {/* Periods Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {periods.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-600 font-medium">No audit periods created yet</p>
                <p className="text-slate-500 text-sm mt-1">Click "New Audit Period" to get started</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Title</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Period</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Created</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {periods.map(period => (
                    <tr key={period.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-900">{period.title}</div>
                          <div className="text-sm text-slate-500">{period.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(period.dateFrom).toLocaleDateString()} → {new Date(period.dateTo).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          period.status === 'active' ? 'bg-green-100 text-green-800' :
                          period.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {period.createdAt ? new Date(period.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(period)}
                            disabled={submitting}
                            className="p-2 text-slate-600 hover:bg-slate-100 disabled:hover:bg-slate-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(period.id)}
                            disabled={submitting}
                            className="p-2 text-red-600 hover:bg-red-100 disabled:hover:bg-slate-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPeriodManager;
