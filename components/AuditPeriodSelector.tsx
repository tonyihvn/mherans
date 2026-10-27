/**
 * Audit Period Selector
 * Dropdown to select audit period before filling the form
 */

import React from 'react';
import { Calendar } from 'lucide-react';

interface AuditPeriod {
  id: string;
  title: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  status: 'active' | 'inactive' | 'closed';
}

interface AuditPeriodSelectorProps {
  periods: AuditPeriod[];
  selectedPeriodId: string | null;
  onSelectPeriod: (periodId: string) => void;
  isLoading?: boolean;
}

const AuditPeriodSelector: React.FC<AuditPeriodSelectorProps> = ({
  periods,
  selectedPeriodId,
  onSelectPeriod,
  isLoading = false
}) => {
  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
  const activePeriods = periods.filter(p => p.status === 'active');

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-3">Select Audit Period</h3>

          <select
            value={selectedPeriodId || ''}
            onChange={(e) => onSelectPeriod(e.target.value)}
            disabled={isLoading || periods.length === 0}
            className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Choose an audit period --</option>
            {activePeriods.map(period => (
              <option key={period.id} value={period.id}>
                {period.title} ({new Date(period.dateFrom).toLocaleDateString()} - {new Date(period.dateTo).toLocaleDateString()})
              </option>
            ))}
          </select>

          {selectedPeriod && (
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Description:</span> {selectedPeriod.description}
              </p>
            </div>
          )}

          {periods.length === 0 && (
            <p className="text-sm text-blue-700 mt-2">
              No audit periods available. Please contact an administrator.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditPeriodSelector;
