/**
 * Indicator Details Modal
 * Displays calculation details for indicators including formula and source values
 */

import React from 'react';
import { X, Info } from 'lucide-react';
import { AuditData } from '../services/auditSchema';
import { useAppSettings } from '../context/AppSettingsContext';

export interface IndicatorInfo {
  name: string;
  value: any;
  unit?: string;
  formula?: string;
  description?: string;
  sourceFields?: { label: string; value: any; unit?: string }[];
  isSummation?: boolean;
  summationNote?: string;
}

interface IndicatorDetailsModalProps {
  indicator: IndicatorInfo | null;
  onClose: () => void;
  isOpen: boolean;
}

const IndicatorDetailsModal: React.FC<IndicatorDetailsModalProps> = ({ indicator, onClose, isOpen }) => {
  const { settings } = useAppSettings();
  if (!isOpen || !indicator) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
          {/* Header */}
          <div
            className="text-white px-6 py-4 flex items-center justify-between rounded-t-lg"
            style={{
              backgroundColor: settings?.headerBgColor || '#057A55'
            }}
          >
            <div>
              <h2 className="text-2xl font-bold" style={{ color: settings?.headerTextColor || '#ffffff' }}>
                {indicator.name}
              </h2>
              {indicator.description && (
                <p className="text-sm mt-1" style={{ color: settings?.headerTextColor ? `${settings.headerTextColor}dd` : '#c1ffd7' }}>
                  {indicator.description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors"
              style={{
                color: settings?.headerTextColor || '#ffffff'
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Value */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <p className="text-sm font-semibold text-slate-700 uppercase">Current Value</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-4xl font-bold text-blue-600">
                  {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value || 'N/A'}
                </p>
                {indicator.unit && (
                  <p className="text-lg text-blue-600 font-medium">{indicator.unit}</p>
                )}
              </div>
            </div>

            {/* Summation Note */}
            {indicator.isSummation && (
              <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500 flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Summation Indicator</p>
                  <p className="text-sm text-amber-800 mt-1">
                    {indicator.summationNote || 'This indicator is calculated as a summation of fields over the audit period.'}
                  </p>
                </div>
              </div>
            )}

            {/* Formula */}
            {indicator.formula && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Calculation Formula</h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-sm text-slate-700 overflow-x-auto">
                  {indicator.formula}
                </div>
              </div>
            )}

            {/* Source Fields */}
            {indicator.sourceFields && indicator.sourceFields.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Source Values</h3>
                <div className="space-y-2">
                  {indicator.sourceFields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{field.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {typeof field.value === 'number' ? field.value.toFixed(2) : field.value || '—'}
                        </p>
                        {field.unit && (
                          <p className="text-xs text-slate-600">{field.unit}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600">
                <strong>Note:</strong> This indicator is computed from the latest audit data. Values are updated when a new audit is submitted.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 rounded-b-lg p-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndicatorDetailsModal;
export type { IndicatorInfo };
