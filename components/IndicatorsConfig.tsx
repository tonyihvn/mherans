/**
 * Indicators Configuration Page
 * Manage emission factors and other indicator settings
 */

import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfigForm {
  gridFactor: string;
  dieselFactor: string;
  wasteFactor: string;
  defaultGridUptime: string;
}

const IndicatorsConfig: React.FC = () => {
  const { indicatorConfig, updateIndicatorConfig } = useAppState();
  const [form, setForm] = useState<ConfigForm>({
    gridFactor: indicatorConfig.gridFactor.toString(),
    dieselFactor: indicatorConfig.dieselFactor.toString(),
    wasteFactor: indicatorConfig.wasteFactor.toString(),
    defaultGridUptime: indicatorConfig.defaultGridUptime.toString()
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setLoading(true);
    try {
      // Validate inputs
      const gridFactor = parseFloat(form.gridFactor);
      const dieselFactor = parseFloat(form.dieselFactor);
      const wasteFactor = parseFloat(form.wasteFactor);
      const defaultGridUptime = parseFloat(form.defaultGridUptime);

      if (isNaN(gridFactor) || isNaN(dieselFactor) || isNaN(wasteFactor) || isNaN(defaultGridUptime)) {
        throw new Error('All fields must be valid numbers');
      }

      if (gridFactor <= 0 || dieselFactor <= 0 || wasteFactor <= 0 || defaultGridUptime <= 0) {
        throw new Error('All values must be greater than 0');
      }

      updateIndicatorConfig({
        gridFactor,
        dieselFactor,
        wasteFactor,
        defaultGridUptime
      });

      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to save configuration';
      setMessage({ type: 'error', text: errorText });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-[#03543F] mb-2">Indicators Configuration</h1>
          <p className="text-slate-600">Manage emission factors and indicator calculation parameters system-wide</p>
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

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">
          {/* Grid Factor */}
          <div>
            <label htmlFor="gridFactor" className="block text-sm font-semibold text-slate-700 mb-3">
              Grid Emission Factor
              <span className="text-slate-500 font-normal ml-2">(kgCO₂/kWh)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="gridFactor"
                name="gridFactor"
                step="0.01"
                min="0"
                value={form.gridFactor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                placeholder="0.43"
              />
              <p className="text-xs text-slate-500 mt-2">Used for calculating CO₂ emissions from grid electricity consumption</p>
            </div>
          </div>

          {/* Diesel Factor */}
          <div>
            <label htmlFor="dieselFactor" className="block text-sm font-semibold text-slate-700 mb-3">
              Diesel Emission Factor
              <span className="text-slate-500 font-normal ml-2">(kgCO₂/L)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="dieselFactor"
                name="dieselFactor"
                step="0.01"
                min="0"
                value={form.dieselFactor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                placeholder="2.67"
              />
              <p className="text-xs text-slate-500 mt-2">Used for calculating CO₂ emissions from diesel generator usage</p>
            </div>
          </div>

          {/* Waste Factor */}
          <div>
            <label htmlFor="wasteFactor" className="block text-sm font-semibold text-slate-700 mb-3">
              Waste Emission Factor
              <span className="text-slate-500 font-normal ml-2">(kgCO₂/kg)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="wasteFactor"
                name="wasteFactor"
                step="0.01"
                min="0"
                value={form.wasteFactor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                placeholder="0.95"
              />
              <p className="text-xs text-slate-500 mt-2">Used for calculating CO₂ emissions from waste generation</p>
            </div>
          </div>

          {/* Default Grid Uptime */}
          <div>
            <label htmlFor="defaultGridUptime" className="block text-sm font-semibold text-slate-700 mb-3">
              Default Grid Uptime
              <span className="text-slate-500 font-normal ml-2">(hours per day)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="defaultGridUptime"
                name="defaultGridUptime"
                step="0.5"
                min="0"
                max="24"
                value={form.defaultGridUptime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                placeholder="20"
              />
              <p className="text-xs text-slate-500 mt-2">Default grid availability for facilities when not specified</p>
            </div>
          </div>

          {/* Reference Table */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Reference Calculation</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">Grid Usage</p>
                <div className="text-2xl font-bold text-[#057A55]">
                  {(100 * parseFloat(form.gridFactor || '0')).toFixed(1)}
                </div>
                <p className="text-xs text-slate-500 mt-1">kgCO₂ per 100 kWh</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">Diesel Usage</p>
                <div className="text-2xl font-bold text-[#057A55]">
                  {(100 * parseFloat(form.dieselFactor || '0')).toFixed(1)}
                </div>
                <p className="text-xs text-slate-500 mt-1">kgCO₂ per 100 L</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">Waste Disposal</p>
                <div className="text-2xl font-bold text-[#057A55]">
                  {(1000 * parseFloat(form.wasteFactor || '0')).toFixed(1)}
                </div>
                <p className="text-xs text-slate-500 mt-1">kgCO₂ per 1,000 kg waste</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">Daily Grid Time</p>
                <div className="text-2xl font-bold text-[#057A55]">
                  {parseFloat(form.defaultGridUptime || '0').toFixed(1)}h
                </div>
                <p className="text-xs text-slate-500 mt-1">hours per day</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-slate-200 flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#057A55] hover:bg-[#03543F] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">About These Settings</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• These emission factors are used system-wide for all facility audits and calculations</li>
            <li>• Changes apply to all new audits and recalculations</li>
            <li>• Default values are based on Nigeria's national energy mix</li>
            <li>• Factors can be updated as national grid composition changes</li>
            <li>• All modifications are logged and tracked for audit purposes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndicatorsConfig;
