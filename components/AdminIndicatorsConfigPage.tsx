/**
 * Admin Indicators Configuration Page
 * Allows admins to create/edit indicator formulas
 */

import React, { useState, useEffect, useMemo } from 'react';
import { indicatorCalculator, IndicatorFormula } from '../services/indicatorCalculator';
import { auditFieldDefinitions } from '../services/auditSchema';
import { FONT_AWESOME_ICONS } from '../utils/indicatorFormatting';
import { Save, Trash2, Plus, Edit2, AlertCircle, CheckCircle, X, Search, Settings, Play } from 'lucide-react';
import AdminIndicatorEditorModal from './AdminIndicatorEditorModal';
import { useAppState } from '../context/StateContext';
import { AuditIndicatorCalculator } from '../services/auditIndicatorCalculator';
import type { AuditData } from '../services/auditSchema';

const AdminIndicatorsConfigPage: React.FC = () => {
  const { facilities, audits } = useAppState();
  const [formulas, setFormulas] = useState<IndicatorFormula[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<IndicatorFormula>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [formulaPreview, setFormulaPreview] = useState('');
  const [formulaError, setFormulaError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIndicatorEditor, setShowIndicatorEditor] = useState(false);

  // Test indicator section state
  const [testFacilityId, setTestFacilityId] = useState<string>('');
  const [testAuditId, setTestAuditId] = useState<string>('');
  const [testIndicatorId, setTestIndicatorId] = useState<string>('');
  const [testResult, setTestResult] = useState<{ value: number | string; indicator: IndicatorFormula } | null>(null);
  const [testError, setTestError] = useState('');

  // Filter formulas based on search term
  const filteredFormulas = useMemo(() => {
    return formulas.filter(formula =>
      formula.indicatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formula.indicatorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formula.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formulas, searchTerm]);

  // Calculate available audits for selected facility
  const availableAudits = useMemo(() => {
    if (!testFacilityId) return [];
    return audits.filter(a => a.facility_id === testFacilityId);
  }, [testFacilityId, audits]);

  // Calculate test result
  useEffect(() => {
    if (testFacilityId && testAuditId && testIndicatorId) {
      const audit = audits.find(a => a.id === testAuditId);
      const indicator = formulas.find(f => f.id === testIndicatorId);

      if (audit && indicator) {
        try {
          const value = AuditIndicatorCalculator.calculateIndicator(indicator, audit as unknown as AuditData);
          setTestResult({ value, indicator });
          setTestError('');
        } catch (err) {
          setTestError(`Error calculating indicator: ${err instanceof Error ? err.message : String(err)}`);
          setTestResult(null);
        }
      }
    } else {
      setTestResult(null);
    }
  }, [testFacilityId, testAuditId, testIndicatorId, audits, formulas]);

  // Load all formulas on mount
  useEffect(() => {
    loadFormulas();
  }, []);

  const loadFormulas = () => {
    try {
      const allFormulas = indicatorCalculator.getAllFormulas();
      setFormulas(allFormulas);
      setError('');
    } catch (err) {
      setError('Failed to load formulas');
    }
  };

  const handleEdit = (formula: IndicatorFormula) => {
    setEditingId(formula.indicatorId);
    setEditForm({ ...formula });
    setShowNewForm(true);
  };

  const handleNewFormula = () => {
    setEditForm({
      indicatorId: `indicator_${Date.now()}`,
      indicatorName: '',
      description: '',
      formula: '',
      unit: '',
      category: 'custom',
      isSummation: false,
      summationNote: '',
      summationDateFrom: '',
      summationDateTo: '',
      bandingRules: {
        high: [80, 100],
        medium: [50, 79],
        low: [0, 49]
      }
    });
    setEditingId(null);
    setShowNewForm(true);
  };

  const validateFormula = (formula: string) => {
    try {
      // Get available fields from audit schema
      const fieldNames = Object.keys(auditFieldDefinitions);
      
      // Build context with sample values for validation
      const context: Record<string, any> = {};
      fieldNames.forEach(fieldName => {
        context[fieldName] = 100; // Use 100 as test value
      });

      // Try to evaluate formula
      const func = new Function(...Object.keys(context), `return ${formula}`);
      const result = func(...Object.values(context));
      
      if (typeof result !== 'number') {
        throw new Error('Formula must return a number');
      }
      
      setFormulaError('');
      setFormulaPreview(`✓ Formula valid (sample result: ${result})`);
      return true;
    } catch (err) {
      setFormulaError(err instanceof Error ? err.message : 'Invalid formula');
      setFormulaPreview('');
      return false;
    }
  };

  const handleFormulaChange = (value: string) => {
    setEditForm(prev => ({ ...prev, formula: value }));
    validateFormula(value);
  };

  const handleSave = async () => {
    if (!editForm.indicatorName || !editForm.formula) {
      setError('Name and formula are required');
      return;
    }

    if (!validateFormula(editForm.formula)) {
      setError('Formula is invalid');
      return;
    }

    try {
      if (editingId) {
        indicatorCalculator.updateFormula(editForm as IndicatorFormula);
        setSuccess(`Updated indicator: ${editForm.indicatorName}`);
      } else {
        indicatorCalculator.addFormula(editForm as IndicatorFormula);
        setSuccess(`Created new indicator: ${editForm.indicatorName}`);
      }

      loadFormulas();
      setShowNewForm(false);
      setEditForm({});
      setEditingId(null);
      setError('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save indicator');
    }
  };

  const handleDelete = (indicatorId: string) => {
    if (confirm('Delete this indicator?')) {
      try {
        // Note: indicatorCalculator needs a delete method
        setFormulas(formulas.filter(f => f.indicatorId !== indicatorId));
        setSuccess('Indicator deleted');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete indicator');
      }
    }
  };

  const handleCancel = () => {
    setShowNewForm(false);
    setEditForm({});
    setEditingId(null);
    setError('');
    setFormulaError('');
    setFormulaPreview('');
  };

  const handleSaveIndicatorConfig = async (config: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('Failed to save config');
      setSuccess('Indicator configuration updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save indicator configuration');
    }
  };

  // Get audit field names for autocomplete helper
  const fieldNames = Object.keys(auditFieldDefinitions);

  return (
    <div className="flex gap-6 pb-12">
      {/* Left Side - Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#03543F]">Indicator Configuration</h1>
          <p className="text-slate-600 mt-2">Create and manage indicators that calculate from audit form data</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowIndicatorEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold whitespace-nowrap text-sm"
          >
            <Settings className="w-4 h-4" />
            Global Settings
          </button>
          <button
            onClick={handleNewFormula}
            disabled={showNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] font-semibold disabled:opacity-50 whitespace-nowrap text-sm"
          >
            <Plus className="w-4 h-4" />
            New Indicator
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* New/Edit Formula Form */}
      {showNewForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-[#03543F]">
            {editingId ? 'Edit Indicator' : 'Create New Indicator'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm mb-2 text-slate-700">Indicator Name *</label>
              <input
                type="text"
                value={editForm.indicatorName || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, indicatorName: e.target.value }))}
                placeholder="e.g., Grid Uptime Percentage"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm mb-2 text-slate-700">Unit *</label>
              <input
                type="text"
                value={editForm.unit || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g., %, kWh, litres"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm mb-2 text-slate-700">Description</label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Explain what this indicator measures"
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
            />
          </div>

          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <input
              type="checkbox"
              id="featured-checkbox"
              checked={editForm.featured || false}
              onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 cursor-pointer accent-[#057A55]"
            />
            <label htmlFor="featured-checkbox" className="cursor-pointer flex-1">
              <span className="font-semibold text-slate-700">Mark as Featured</span>
              <p className="text-xs text-slate-600">Featured indicators will appear in facility map marker popups</p>
            </label>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <input
              type="checkbox"
              id="summation-checkbox"
              checked={editForm.isSummation || false}
              onChange={(e) => setEditForm(prev => ({ ...prev, isSummation: e.target.checked }))}
              className="w-4 h-4 cursor-pointer accent-[#057A55]"
            />
            <label htmlFor="summation-checkbox" className="cursor-pointer flex-1">
              <span className="font-semibold text-slate-700">Summation Indicator</span>
              <p className="text-xs text-slate-600">Check if this indicator sums fields over a period of time</p>
            </label>
          </div>

          {editForm.isSummation && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-sm mb-2 text-slate-700">Summation Note</label>
                <textarea
                  value={editForm.summationNote || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, summationNote: e.target.value }))}
                  placeholder="Describe which fields are summed and over what period (e.g., 'Sum of all equipment power consumption across the facility')"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sm mb-2 text-slate-700">Summation Period From</label>
                  <input
                    type="date"
                    value={editForm.summationDateFrom || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, summationDateFrom: e.target.value }))}
                    placeholder="Start date for summation period"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                  />
                  <p className="text-xs text-slate-500 mt-1">Start date - audits on or after this date will be included</p>
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-2 text-slate-700">Summation Period To</label>
                  <input
                    type="date"
                    value={editForm.summationDateTo || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, summationDateTo: e.target.value }))}
                    placeholder="End date for summation period"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                  />
                  <p className="text-xs text-slate-500 mt-1">End date - audits on or before this date will be included</p>
                </div>
              </div>
            </div>
          )}

          {/* Icon Selector */}
          <div>
            <label className="block font-semibold text-sm mb-2 text-slate-700">Indicator Icon (Font Awesome Free)</label>
            <div className="mb-4">
              <select
                value={editForm.iconClass || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, iconClass: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
              >
                <option value="">-- No Icon --</option>
                {Object.entries(FONT_AWESOME_ICONS).map(([category, icons]) => (
                  <optgroup key={category} label={category}>
                    {icons.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {editForm.iconClass && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center gap-3">
                <i className={`fa-solid ${editForm.iconClass} text-xl text-[#057A55]`}></i>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Preview</p>
                  <p className="text-xs text-slate-600 font-mono">{editForm.iconClass}</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block font-semibold text-sm mb-2 text-slate-700">Formula *</label>
            <textarea
              value={editForm.formula || ''}
              onChange={(e) => handleFormulaChange(e.target.value)}
              placeholder="e.g., (gridUptimeHoursPerDay / 24) * 100"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">Available fields ({fieldNames.length}): {fieldNames.join(', ')}</p>
            
            {formulaPreview && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                {formulaPreview}
              </div>
            )}
            {formulaError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {formulaError}
              </div>
            )}
          </div>

          {/* Banding Rules */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-4">Banding Rules (Result Ranges)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-sm mb-2 text-slate-700">High Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editForm.bandingRules?.high?.[0] || 0}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      bandingRules: {
                        ...prev.bandingRules || { high: [0, 100], medium: [50, 79], low: [0, 49] },
                        high: [parseFloat(e.target.value), prev.bandingRules?.high?.[1] || 100]
                      }
                    }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                  <span className="self-center">-</span>
                  <input
                    type="number"
                    value={editForm.bandingRules?.high?.[1] || 100}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      bandingRules: {
                        ...prev.bandingRules || { high: [0, 100], medium: [50, 79], low: [0, 49] },
                        high: [prev.bandingRules?.high?.[0] || 0, parseFloat(e.target.value)]
                      }
                    }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2 text-slate-700">Medium Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editForm.bandingRules?.medium?.[0] || 50}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      bandingRules: {
                        ...prev.bandingRules || { high: [0, 100], medium: [50, 79], low: [0, 49] },
                        medium: [parseFloat(e.target.value), prev.bandingRules?.medium?.[1] || 79]
                      }
                    }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                  <span className="self-center">-</span>
                  <input
                    type="number"
                    value={editForm.bandingRules?.medium?.[1] || 79}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      bandingRules: {
                        ...prev.bandingRules || { high: [0, 100], medium: [50, 79], low: [0, 49] },
                        medium: [prev.bandingRules?.medium?.[0] || 50, parseFloat(e.target.value)]
                      }
                    }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2 text-slate-700">Low Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editForm.bandingRules?.low?.[0] || 0}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      bandingRules: {
                        ...prev.bandingRules || { high: [0, 100], medium: [50, 79], low: [0, 49] },
                        low: [parseFloat(e.target.value), prev.bandingRules?.low?.[1] || 49]
                      }
                    }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                  <span className="self-center">-</span>
                  <input
                    type="number"
                    value={editForm.bandingRules?.low?.[1] || 49}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      bandingRules: {
                        ...prev.bandingRules || { high: [0, 100], medium: [50, 79], low: [0, 49] },
                        low: [prev.bandingRules?.low?.[0] || 0, parseFloat(e.target.value)]
                      }
                    }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] font-semibold"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'} Indicator
            </button>
          </div>
        </div>
      )}

      {/* Formulas List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#03543F]">
            {filteredFormulas.length} Indicator{filteredFormulas.length !== 1 ? 's' : ''} Configured
          </h2>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search indicators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
            />
          </div>
        </div>

        {filteredFormulas.length === 0 && formulas.length > 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-500 text-lg">No indicators match your search</p>
            <p className="text-slate-400 text-sm mt-2">Try adjusting your search terms</p>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-500 text-lg">No indicators configured yet</p>
            <p className="text-slate-400 text-sm mt-2">Create your first indicator to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFormulas.map((formula) => (
              <div key={formula.indicatorId} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{formula.indicatorName}</h3>
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded">
                        {formula.unit}
                      </span>
                      {formula.featured && (
                        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    {formula.description && (
                      <p className="text-sm text-slate-600 mt-2">{formula.description}</p>
                    )}

                    {/* Summation Badge */}
                    {(formula as any).isSummation && (
                      <div className="mt-2 inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                        ∑ Summation Indicator
                      </div>
                    )}

                    {/* Summation Note and Dates */}
                    {(formula as any).summationNote && (
                      <div className="mt-2 p-3 bg-amber-50 rounded border border-amber-200 text-sm text-amber-800">
                        <p className="font-semibold mb-1">Summation Note:</p>
                        <p>{(formula as any).summationNote}</p>
                        {(formula as any).summationDateFrom && (formula as any).summationDateTo && (
                          <p className="text-xs mt-2 font-mono">
                            Period: {new Date((formula as any).summationDateFrom).toLocaleDateString()} → {new Date((formula as any).summationDateTo).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Formula Display */}
                    <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 font-mono text-sm text-slate-700 break-words">
                      {formula.formula}
                    </div>

                    {/* Banding Display */}
                    <div className="mt-3 flex gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>High: {formula.bandingRules.high[0]}-{formula.bandingRules.high[1]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>Med: {formula.bandingRules.medium[0]}-{formula.bandingRules.medium[1]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Low: {formula.bandingRules.low[0]}-{formula.bandingRules.low[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(formula)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit indicator"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(formula.indicatorId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete indicator"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Available Audit Fields */}
      <div className="w-96 sticky top-0 max-h-screen overflow-y-auto">
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#03543F] mb-2">Available Fields ({fieldNames.length})</h3>
            <p className="text-xs text-slate-500 mb-4">Click any field to copy it to your clipboard. Use in formulas.</p>
          </div>
          
          <div className="space-y-2 grid grid-cols-1 gap-2 pb-6">
            {fieldNames.map((fieldName) => {
              const fieldLabel = auditFieldDefinitions[fieldName as keyof typeof auditFieldDefinitions]?.label || fieldName;
              return (
                <div 
                  key={fieldName}
                  className="p-3 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 cursor-pointer transition-colors group"
                  title={`${fieldLabel} - Click to copy: ${fieldName}`}
                  onClick={() => {
                    navigator.clipboard.writeText(fieldName);
                  }}
                >
                  <div className="text-xs font-mono text-slate-700 group-hover:text-blue-600 font-semibold">{fieldName}</div>
                  <div className="text-xs text-slate-500 group-hover:text-blue-500">{fieldLabel}</div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 pt-4 sticky bottom-0 bg-white">
            <p className="text-xs text-slate-600 mb-3">
              <strong>Example Formula:</strong>
            </p>
            <code className="text-xs bg-slate-50 p-2 rounded border border-slate-200 block whitespace-pre-wrap">
{`(gridUptimeHoursPerDay / 24) * 100`}
            </code>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sticky bottom-0 bg-white">
            <p className="text-xs text-blue-800">
              💡 All {fieldNames.length} fields available for use in indicator formulas
            </p>
          </div>
        </div>
      </div>

      {/* Test Indicator Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Play size={20} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Test Indicator</h2>
            <p className="text-sm text-gray-600 ml-auto">Preview indicator values with real audit data</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Facility Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Facility
              </label>
              <select
                value={testFacilityId}
                onChange={(e) => {
                  setTestFacilityId(e.target.value);
                  setTestAuditId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">-- Choose a facility --</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audit Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Audit Record
              </label>
              <select
                value={testAuditId}
                onChange={(e) => setTestAuditId(e.target.value)}
                disabled={!testFacilityId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">-- Choose an audit --</option>
                {availableAudits.map(a => (
                  <option key={a.id} value={a.id}>
                    {new Date(a.audit_date).toLocaleDateString()} - {a.audit_period_name || 'Audit'}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicator Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Indicator
              </label>
              <select
                value={testIndicatorId}
                onChange={(e) => setTestIndicatorId(e.target.value)}
                disabled={!testAuditId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">-- Choose an indicator --</option>
                {formulas.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.indicatorName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Display */}
          {testError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{testError}</p>
            </div>
          )}

          {testResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">{testResult.indicator.indicatorName}</h3>
                  <p className="text-sm text-green-700 mb-3">{testResult.indicator.description}</p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="bg-white rounded p-3 mt-3 border border-green-100">
                <p className="text-xs text-gray-600">Calculated Value</p>
                <p className="text-2xl font-bold text-green-700">
                  {typeof testResult.value === 'number' ? testResult.value.toFixed(2) : testResult.value}
                  {testResult.indicator.unit && <span className="text-lg text-gray-600 ml-2">{testResult.indicator.unit}</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AdminIndicatorEditorModal
        isOpen={showIndicatorEditor}
        onClose={() => setShowIndicatorEditor(false)}
        onSave={handleSaveIndicatorConfig}
      />
    </div>
    </div>
  );
};

export default AdminIndicatorsConfigPage;
