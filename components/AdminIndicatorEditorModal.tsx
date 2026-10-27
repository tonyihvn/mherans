

/**
 * Admin Indicator Config Editor Modal
 * Allows Super Admin to modify global indicator calculation factors
 */

import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

interface IndicatorConfig {
  dieselFactor: number;
  gridFactor: number;
  wasteFactor: number;
  resilienceThreshold: number;
}

interface AdminIndicatorEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: IndicatorConfig) => Promise<void>;
  currentConfig?: IndicatorConfig;
}

const AdminIndicatorEditorModal: React.FC<AdminIndicatorEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig = {
    dieselFactor: 2.68,
    gridFactor: 0.532,
    wasteFactor: 1.5,
    resilienceThreshold: 70
  }
}) => {
  const [config, setConfig] = useState(currentConfig);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
      setSuccess(false);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (config.dieselFactor <= 0) newErrors.dieselFactor = 'Must be greater than 0';
    if (config.gridFactor <= 0) newErrors.gridFactor = 'Must be greater than 0';
    if (config.wasteFactor <= 0) newErrors.wasteFactor = 'Must be greater than 0';
    if (config.resilienceThreshold < 0 || config.resilienceThreshold > 100) {
      newErrors.resilienceThreshold = 'Must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);

    try {
      await onSave(config);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Indicator Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
            ✅ Configuration saved successfully!
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Diesel Factor */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Diesel Emission Factor
                </label>
                <p className="text-xs text-slate-600 mb-3">
                  CO₂ emissions per liter of diesel burned. Default: 2.68 kg CO₂/L
                  <br />
                  Used to calculate: Diesel Annual Emissions (tonnes) = Litres × Factor ÷ 1000
                </p>
                <input
                  type="number"
                  step="0.01"
                  value={config.dieselFactor}
                  onChange={(e) => setConfig({ ...config, dieselFactor: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.dieselFactor ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.dieselFactor && <p className="text-red-600 text-xs mt-1">{errors.dieselFactor}</p>}
              </div>
            </div>
          </div>

          {/* Grid Factor */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Grid Electricity Emission Factor
                </label>
                <p className="text-xs text-slate-600 mb-3">
                  CO₂ emissions per kWh of grid electricity. Default: 0.532 kg CO₂/kWh (Nigeria average)
                  <br />
                  Used to calculate: Grid Annual Emissions (tonnes) = kWh × Factor ÷ 1000
                </p>
                <input
                  type="number"
                  step="0.001"
                  value={config.gridFactor}
                  onChange={(e) => setConfig({ ...config, gridFactor: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.gridFactor ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.gridFactor && <p className="text-red-600 text-xs mt-1">{errors.gridFactor}</p>}
              </div>
            </div>
          </div>

          {/* Waste Factor */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Medical Waste Incineration Factor
                </label>
                <p className="text-xs text-slate-600 mb-3">
                  CO₂ emissions per kg of medical waste incinerated. Default: 1.5 kg CO₂/kg
                  <br />
                  Used to calculate: Waste Annual Emissions (tonnes) = kg × Factor ÷ 1000
                </p>
                <input
                  type="number"
                  step="0.01"
                  value={config.wasteFactor}
                  onChange={(e) => setConfig({ ...config, wasteFactor: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.wasteFactor ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.wasteFactor && <p className="text-red-600 text-xs mt-1">{errors.wasteFactor}</p>}
              </div>
            </div>
          </div>

          {/* Resilience Threshold */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Energy Resilience Threshold (%)
                </label>
                <p className="text-xs text-slate-600 mb-3">
                  Minimum grid uptime percentage for facility to be considered energy-resilient. Default: 70%
                  <br />
                  Facilities with uptime ≥ threshold are classified as "High Resilience"
                </p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.resilienceThreshold}
                  onChange={(e) => setConfig({ ...config, resilienceThreshold: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.resilienceThreshold ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.resilienceThreshold && <p className="text-red-600 text-xs mt-1">{errors.resilienceThreshold}</p>}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> These factors are used globally across all facilities. Changes will affect all indicator calculations going forward.
              Update these only when regional emission factors change or for carbon accounting updates.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? '⏳ Saving...' : '✅ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminIndicatorEditorModal;
