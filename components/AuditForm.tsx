

/**
 * Comprehensive Audit Form Component
 * Captures all fields from auditform.md
 */

import React, { useState } from 'react';
import { AuditData, createEmptyAuditData } from '../services/auditSchema';
import { Save, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditFormProps {
  facilityId: string;
  initialData?: Partial<AuditData>;
  onSave: (data: Partial<AuditData>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const AuditForm: React.FC<AuditFormProps> = ({ 
  facilityId, 
  initialData, 
  onSave, 
  onCancel,
  isLoading = false,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<Partial<AuditData>>(
    initialData || createEmptyAuditData(facilityId)
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  const handleInputChange = (field: keyof AuditData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await onSave(formData);
      setSuccess('✓ Audit section saved successfully to database!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save audit data';
      setError(errorMsg);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { number: 1, title: 'Facility Identification' },
    { number: 2, title: 'Energy Access & Resilience Profile' },
    { number: 3, title: 'Electrical Load Inventory' },
    { number: 4, title: 'GHG Emissions Data' },
    { number: 5, title: 'O&M Readiness Assessment' },
    { number: 6, title: 'Environmental & Social Safeguards' },
    { number: 7, title: 'GHG Reduction & Energy Efficiency' },
    { number: 8, title: 'Carbon Market Readiness' },
    { number: 9, title: 'Environmental Scanning' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 1: Facility Identification</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Facility Name"
                value={formData.facilityName || ''}
                onChange={(e) => handleInputChange('facilityName', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <select
                value={formData.facilityType || ''}
                onChange={(e) => handleInputChange('facilityType', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">Facility Type</option>
                <option value="teaching">Teaching Hospital</option>
                <option value="fmc">Federal Medical Centre</option>
                <option value="secondary">Secondary Health Facility</option>
                <option value="primary">Primary Health Centre</option>
              </select>
              <input
                type="text"
                placeholder="Location State"
                value={formData.locationState || ''}
                onChange={(e) => handleInputChange('locationState', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                placeholder="Zone"
                value={formData.locationZone || ''}
                onChange={(e) => handleInputChange('locationZone', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="GPS Latitude"
                step="0.0001"
                value={formData.gpsLatitude || ''}
                onChange={(e) => handleInputChange('gpsLatitude', parseFloat(e.target.value))}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="GPS Longitude"
                step="0.0001"
                value={formData.gpsLongitude || ''}
                onChange={(e) => handleInputChange('gpsLongitude', parseFloat(e.target.value))}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="date"
                value={formData.auditDate || ''}
                onChange={(e) => handleInputChange('auditDate', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                placeholder="Focal Person Name"
                value={formData.focalPersonName || ''}
                onChange={(e) => handleInputChange('focalPersonName', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                placeholder="Focal Person Role"
                value={formData.focalPersonRole || ''}
                onChange={(e) => handleInputChange('focalPersonRole', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <textarea
                placeholder="Audit Team Members"
                value={formData.auditTeamMembers || ''}
                onChange={(e) => handleInputChange('auditTeamMembers', e.target.value)}
                disabled={readOnly}
                rows={2}
                className="px-4 py-2 border border-slate-300 rounded-lg col-span-2 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.committeeObserverPresent || false}
                  onChange={(e) => handleInputChange('committeeObserverPresent', e.target.checked)}
                />
                <span>Committee Observer Present</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 2: Energy Access & Resilience Profile</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.gridConnected || false}
                  onChange={(e) => handleInputChange('gridConnected', e.target.checked)}
                />
                <span>Connected to National Grid</span>
              </label>
              
              <div>
                <label className="block font-semibold text-sm mb-2">Average Grid Uptime (hours/day)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.gridUptimeHoursPerDay || 0}
                  onChange={(e) => handleInputChange('gridUptimeHoursPerDay', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2">Backup Power Sources (comma-separated)</label>
                <textarea
                  value={formData.backupPowerSources || ''}
                  onChange={(e) => handleInputChange('backupPowerSources', e.target.value)}
                  placeholder="e.g., Diesel Generator, Solar, Inverter"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hybridRenewableSystemInstalled || false}
                  onChange={(e) => handleInputChange('hybridRenewableSystemInstalled', e.target.checked)}
                />
                <span>Hybrid Renewable Energy System Installed</span>
              </label>

              {formData.hybridRenewableSystemInstalled && (
                <textarea
                  placeholder="Specify type and capacity"
                  value={formData.hybridSystemDetails || ''}
                  onChange={(e) => handleInputChange('hybridSystemDetails', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.majorOutagesLast12Months || false}
                  onChange={(e) => handleInputChange('majorOutagesLast12Months', e.target.checked)}
                />
                <span>Major Outages in Past 12 Months</span>
              </label>

              {formData.majorOutagesLast12Months && (
                <textarea
                  placeholder="Frequency and duration"
                  value={formData.outageFrequencyAndDuration || ''}
                  onChange={(e) => handleInputChange('outageFrequencyAndDuration' as keyof AuditData, e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.emergencyEnergyPlan || false}
                  onChange={(e) => handleInputChange('emergencyEnergyPlan', e.target.checked)}
                />
                <span>Emergency Energy Plan in Place</span>
              </label>

              <div>
                <label className="block font-semibold text-sm mb-2">Energy Resilience Score</label>
                <select
                  value={formData.energyResilienceScore || 'medium'}
                  onChange={(e) => handleInputChange('energyResilienceScore', e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 3: Electrical Load Inventory</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-sm mb-2">Section/Room Name</label>
                <input
                  type="text"
                  placeholder="e.g., Surgical Ward, ICU, Emergency Room"
                  value={formData.sectionRoomName || ''}
                  onChange={(e) => handleInputChange('sectionRoomName', e.target.value)}
                  disabled={readOnly}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="border border-slate-300 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-4 text-slate-700">Primary Equipment List</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-2 text-left">Equipment Type</th>
                        <th className="px-2 py-2 text-left">Make/Model</th>
                        <th className="px-2 py-2 text-left">Quantity</th>
                        <th className="px-2 py-2 text-left">Power (kW)</th>
                        <th className="px-2 py-2 text-left">Hours/Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.equipmentList && formData.equipmentList.length > 0 
                        ? formData.equipmentList 
                        : [{ type: '', makeModel: '', quantity: 0, powerKW: 0, hoursPerDay: 0 }]
                      ).map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-200">
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              placeholder="Type of equipment"
                              value={item?.type || ''}
                              onChange={(e) => {
                                const list = [...(formData.equipmentList || [])];
                                list[idx] = { ...list[idx], type: e.target.value };
                                handleInputChange('equipmentList', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              placeholder="Make/Model"
                              value={item?.makeModel || ''}
                              onChange={(e) => {
                                const list = [...(formData.equipmentList || [])];
                                list[idx] = { ...list[idx], makeModel: e.target.value };
                                handleInputChange('equipmentList', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item?.quantity || ''}
                              onChange={(e) => {
                                const list = [...(formData.equipmentList || [])];
                                list[idx] = { ...list[idx], quantity: parseInt(e.target.value) };
                                handleInputChange('equipmentList', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.1"
                              placeholder="kW"
                              value={item?.powerKW || ''}
                              onChange={(e) => {
                                const list = [...(formData.equipmentList || [])];
                                list[idx] = { ...list[idx], powerKW: parseFloat(e.target.value) };
                                handleInputChange('equipmentList', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.5"
                              placeholder="hrs"
                              value={item?.hoursPerDay || ''}
                              onChange={(e) => {
                                const list = [...(formData.equipmentList || [])];
                                list[idx] = { ...list[idx], hoursPerDay: parseFloat(e.target.value) };
                                handleInputChange('equipmentList', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(formData.equipmentList || [])];
                      list.push({ type: '', makeModel: '', quantity: 0, powerKW: 0, hoursPerDay: 0 });
                      handleInputChange('equipmentList', list);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    + Add More Equipment
                  </button>
                )}
              </div>

              <div className="border border-slate-300 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-4 text-slate-700">Lighting Inventory</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-2 text-left">Bulb Type</th>
                        <th className="px-2 py-2 text-left">Quantity</th>
                        <th className="px-2 py-2 text-left">Wattage (W)</th>
                        <th className="px-2 py-2 text-left">Hours/Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.lightingInventory && formData.lightingInventory.length > 0
                        ? formData.lightingInventory
                        : [{ bulbType: '', quantity: 0, wattage: 0, hoursPerDay: 0 }]
                      ).map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-200">
                          <td className="px-2 py-2">
                            <select
                              value={item?.bulbType || ''}
                              onChange={(e) => {
                                const list = [...(formData.lightingInventory || [])];
                                list[idx] = { ...list[idx], bulbType: e.target.value };
                                handleInputChange('lightingInventory', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            >
                              <option value="">Select type</option>
                              <option value="LED">LED</option>
                              <option value="CFL">CFL</option>
                              <option value="Incandescent">Incandescent</option>
                              <option value="Fluorescent">Fluorescent</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item?.quantity || ''}
                              onChange={(e) => {
                                const list = [...(formData.lightingInventory || [])];
                                list[idx] = { ...list[idx], quantity: parseInt(e.target.value) };
                                handleInputChange('lightingInventory', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Watts"
                              value={item?.wattage || ''}
                              onChange={(e) => {
                                const list = [...(formData.lightingInventory || [])];
                                list[idx] = { ...list[idx], wattage: parseFloat(e.target.value) };
                                handleInputChange('lightingInventory', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.5"
                              placeholder="hrs"
                              value={item?.hoursPerDay || ''}
                              onChange={(e) => {
                                const list = [...(formData.lightingInventory || [])];
                                list[idx] = { ...list[idx], hoursPerDay: parseFloat(e.target.value) };
                                handleInputChange('lightingInventory', list);
                              }}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(formData.lightingInventory || [])];
                      list.push({ bulbType: '', quantity: 0, wattage: 0, hoursPerDay: 0 });
                      handleInputChange('lightingInventory', list);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    + Add More Lighting
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 4: GHG Emissions Data Collection</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Generator Make/Model"
                value={formData.dieselGeneratorMake || ''}
                onChange={(e) => handleInputChange('dieselGeneratorMake', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                placeholder="Serial Number"
                value={formData.dieselGeneratorSerial || ''}
                onChange={(e) => handleInputChange('dieselGeneratorSerial', e.target.value)}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="Capacity (kVA)"
                step="0.1"
                value={formData.dieselGeneratorCapacityKVA || ''}
                onChange={(e) => handleInputChange('dieselGeneratorCapacityKVA', parseFloat(e.target.value))}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="Fuel Rate (litres/hour)"
                step="0.1"
                value={formData.dieselFuelConsumptionRateLitresPerHour || ''}
                onChange={(e) => handleInputChange('dieselFuelConsumptionRateLitresPerHour', parseFloat(e.target.value))}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="Generator Operating Hours/day"
                step="0.5"
                value={formData.dieselGeneratorOperatingHoursPerDay || ''}
                onChange={(e) => handleInputChange('dieselGeneratorOperatingHoursPerDay', parseFloat(e.target.value))}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="Grid Electricity (kWh/12 months)"
                value={formData.gridElectricityConsumptionLast12MonthsKWh || ''}
                onChange={(e) => handleInputChange('gridElectricityConsumptionLast12MonthsKWh', parseFloat(e.target.value))}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="Diesel Consumption (litres/12 months)"
                value={formData.dieselConsumptionLast12MonthsLitres || ''}
                onChange={(e) => handleInputChange('dieselConsumptionLast12MonthsLitres', parseFloat(e.target.value))}
                disabled={readOnly}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.wasteIncinerationPresent || false}
                  onChange={(e) => handleInputChange('wasteIncinerationPresent', e.target.checked)}
                />
                <span>Waste Incineration Present</span>
              </label>
              {formData.wasteIncinerationPresent && (
                <input
                  type="number"
                  placeholder="Waste Incinerated (kg/month)"
                  value={formData.wasteIncinerationVolumeMonthlyKg || ''}
                  onChange={(e) => handleInputChange('wasteIncinerationVolumeMonthlyKg', parseFloat(e.target.value))}
                  className="px-4 py-2 border border-slate-300 rounded-lg col-span-2"
                />
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 5: O&M Readiness Assessment</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.trainedOMStaffPresent || false}
                  onChange={(e) => handleInputChange('trainedOMStaffPresent', e.target.checked)}
                />
                <span>Trained O&M Staff Present</span>
              </label>

              {formData.trainedOMStaffPresent && (
                <input
                  type="number"
                  min="0"
                  placeholder="Number of trained staff"
                  value={formData.trainedOMStaffCount || ''}
                  onChange={(e) => handleInputChange('trainedOMStaffCount', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.preventiveMaintenanceScheduleDocumented || false}
                  onChange={(e) => handleInputChange('preventiveMaintenanceScheduleDocumented', e.target.checked)}
                />
                <span>Documented Preventive Maintenance Schedule</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sparepartsAvailableForCriticalSystems || false}
                  onChange={(e) => handleInputChange('sparepartsAvailableForCriticalSystems', e.target.checked)}
                />
                <span>Spare Parts Available for Critical Systems</span>
              </label>

              <div>
                <label className="block font-semibold text-sm mb-2">Power Systems Service Frequency</label>
                <select
                  value={formData.powerSystemsServiceFrequency || 'quarterly'}
                  onChange={(e) => handleInputChange('powerSystemsServiceFrequency', e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2">O&M Staff Skills Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.omStaffSkillsRating || 3}
                  onChange={(e) => handleInputChange('omStaffSkillsRating', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 6: Environmental & Social Safeguards</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.wasteSegregationSystem || false}
                  onChange={(e) => handleInputChange('wasteSegmentationSystem', e.target.checked)}
                />
                <span>Waste Segregation System</span>
              </label>

              <input
                type="text"
                placeholder="Waste Disposal Method"
                value={formData.wasteDisposalMethod || ''}
                onChange={(e) => handleInputChange('wasteDisposalMethod', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.airQualityMonitoringSystem || false}
                  onChange={(e) => handleInputChange('airQualityMonitoringSystem', e.target.checked)}
                />
                <span>Air Quality Monitoring System</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hazardousMaterialsStorageSafe || false}
                  onChange={(e) => handleInputChange('hazardousMaterialsStorageSafe', e.target.checked)}
                />
                <span>Hazardous Materials Stored Safely</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.adequatePPEAvailable || false}
                  onChange={(e) => handleInputChange('adequatePPEAvailable', e.target.checked)}
                />
                <span>Adequate PPE Available</span>
              </label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 7: GHG Reduction & Energy Efficiency Opportunities</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-sm mb-3">Renewable Energy Upgrade Potentials</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.solarPVPotential || false}
                      onChange={(e) => handleInputChange('solarPVPotential', e.target.checked)}
                      disabled={readOnly}
                    />
                    <span>Solar PV</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hybridSolarDieselPotential || false}
                      onChange={(e) => handleInputChange('hybridSolarDieselPotential', e.target.checked)}
                      disabled={readOnly}
                    />
                    <span>Hybrid (Solar-Diesel)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.otherRenewablePotential || false}
                      onChange={(e) => handleInputChange('otherRenewablePotential', e.target.checked)}
                      disabled={readOnly}
                    />
                    <span>Other</span>
                  </label>
                  {formData.otherRenewablePotential && (
                    <input
                      type="text"
                      placeholder="Specify other renewable option"
                      value={formData.otherRenewableSpecify || ''}
                      onChange={(e) => handleInputChange('otherRenewableSpecify', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed ml-6"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.obviousInefficienciesPresent || false}
                    onChange={(e) => handleInputChange('obviousInefficienciesPresent', e.target.checked)}
                    disabled={readOnly}
                  />
                  <span className="font-semibold">Obvious Inefficiencies in Equipment or Operational Practices</span>
                </label>
                {formData.obviousInefficienciesPresent && (
                  <textarea
                    placeholder="Specify inefficiencies found"
                    value={formData.obviousInefficienciesSpecify || ''}
                    onChange={(e) => handleInputChange('obviousInefficienciesSpecify', e.target.value)}
                    disabled={readOnly}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-3">Prioritize Recommended Interventions</label>
                <select
                  value={formData.prioritizedInterventions || ''}
                  onChange={(e) => handleInputChange('prioritizedInterventions', e.target.value)}
                  disabled={readOnly}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select priority level</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 8: Carbon Market Readiness</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.historicalEnergyGHGRecords || false}
                  onChange={(e) => handleInputChange('historicalEnergyGHGRecords', e.target.checked)}
                  disabled={readOnly}
                />
                <span className="font-semibold">Has Historical Energy or GHG Records</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.mrvSystemsInPlace || false}
                  onChange={(e) => handleInputChange('mrvSystemsInPlace', e.target.checked)}
                  disabled={readOnly}
                />
                <span className="font-semibold">Systems for Monitoring, Reporting & Verification (MRV)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.carbonCreditInterest || false}
                  onChange={(e) => handleInputChange('carbonCreditInterest', e.target.checked)}
                  disabled={readOnly}
                />
                <span className="font-semibold">Interested in Carbon Credit Schemes</span>
              </label>

              <div>
                <label className="block font-semibold text-sm mb-2">Remarks</label>
                <textarea
                  placeholder="Additional comments about carbon market readiness"
                  value={formData.carbonMarketRemarks || ''}
                  onChange={(e) => handleInputChange('carbonMarketRemarks', e.target.value)}
                  disabled={readOnly}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#03543F]">Section 9: Environmental Scanning for Additional Opportunities</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.nearbyFacilitiesSharedInterventions || false}
                  onChange={(e) => handleInputChange('nearbyFacilitiesSharedInterventions', e.target.checked)}
                  disabled={readOnly}
                />
                <span className="font-semibold">Nearby Facilities Could Benefit from Shared Energy Interventions</span>
              </label>

              {formData.nearbyFacilitiesSharedInterventions && (
                <textarea
                  placeholder="Details about nearby facilities and shared intervention opportunities"
                  value={formData.nearbyFacilitiesRemarks || ''}
                  onChange={(e) => handleInputChange('nearbyFacilitiesRemarks', e.target.value)}
                  disabled={readOnly}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              )}

              <div>
                <label className="block font-semibold text-sm mb-2">Potential for Additional Critical Infrastructure</label>
                <p className="text-xs text-slate-600 mb-3">e.g., oxygen plant, waste-to-energy, water treatment</p>
                <textarea
                  placeholder="Describe potential infrastructure opportunities at this facility"
                  value={formData.additionalInfrastructurePotential || ''}
                  onChange={(e) => handleInputChange('additionalInfrastructurePotential', e.target.value)}
                  disabled={readOnly}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-slate-500 py-8">
            <p>Section {activeSection} - Form development in progress</p>
            <p className="text-sm mt-2">Complete sections 1, 2, 4, 5, 6 first</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm font-semibold">Error saving audit</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.number}
              type="button"
              onClick={() => setActiveSection(section.number)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                activeSection === section.number
                  ? 'bg-[#057A55] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {section.number}
            </button>
          ))}
        </div>

        {/* Section Title */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-[#03543F]">
            {sections.find(s => s.number === activeSection)?.title}
          </h2>
        </div>

        {/* Form Content */}
        <div className="min-h-96">{renderSection()}</div>

        {/* Previous/Next Navigation */}
        <div className="flex gap-4 justify-between border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => setActiveSection(Math.max(1, activeSection - 1))}
            disabled={activeSection === 1}
            className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="text-sm text-slate-600 font-semibold self-center">
            Section {activeSection} of {sections.length}
          </div>
          
          <button
            type="button"
            onClick={() => setActiveSection(Math.min(sections.length, activeSection + 1))}
            disabled={activeSection === sections.length}
            className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] font-semibold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Section'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuditForm;
