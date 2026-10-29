

/**
 * Comprehensive Audit Form Component
 * Captures all audit fields conforming to auditform.md requirements
 * Sections: Facility ID, Energy, Load Inventory, GHG, O&M, EHS, Efficiency, Carbon, Environmental Scanning
 */

import React, { useState } from 'react';
import { AuditData, EquipmentItem, LightingItem, EvidenceDocument, SignOff, createEmptyAuditData } from '../services/auditSchema';
import { useAuth } from '../context/AuthContext';
import { Save, X, ChevronRight, ChevronLeft, AlertCircle, Plus, Trash2, FileText, Upload, CheckCircle, XCircle } from 'lucide-react';

interface AuditFormProps {
  facilityId: string;
  selectedFacility?: any;
  facilityName?: string;
  initialData?: Partial<AuditData>;
  onSave: (data: Partial<AuditData>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const AuditFormRedesigned: React.FC<AuditFormProps> = ({
  facilityId,
  selectedFacility,
  facilityName,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
  readOnly = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<AuditData>>(() => {
    const baseData = initialData || createEmptyAuditData(facilityId);
    // Pre-populate facility name if selected facility is provided
    if (selectedFacility?.name && !baseData.facilityName) {
      return {
        ...baseData,
        facilityName: selectedFacility.name
      };
    }
    return baseData;
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const sections = [
    { number: 1, title: 'Facility Identification', icon: '🏥' },
    { number: 2, title: 'Energy Access & Resilience', icon: '⚡' },
    { number: 3, title: 'Electrical Load Inventory', icon: '📋' },
    { number: 4, title: 'GHG Emissions Data', icon: '💨' },
    { number: 5, title: 'O&M Readiness', icon: '🔧' },
    { number: 6, title: 'Environmental & Social Safeguards', icon: '🛡️' },
    { number: 7, title: 'GHG Reduction & Efficiency', icon: '🌱' },
    { number: 8, title: 'Carbon Market Readiness', icon: '📊' },
    { number: 9, title: 'Environmental Scanning', icon: '🔍' },
    { number: 10, title: 'Evidence Documents', icon: '📸' },
    ...(user?.role === 'VALIDATOR' ? [{ number: 11, title: 'Sign-offs & Approvals', icon: '✅' }] : [])
  ];

  const handleInputChange = (field: keyof AuditData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddEquipment = () => {
    const newItem: EquipmentItem = {
      id: Math.random().toString(),
      name: '',
      quantity: 1,
      ratedPowerKW: 0,
      operatingHoursPerDay: 24,
      backupPower: false
    };
    setFormData(prev => ({
      ...prev,
      equipmentInventory: [...(prev.equipmentInventory || []), newItem]
    }));
  };

  const handleRemoveEquipment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentInventory: (prev.equipmentInventory || []).filter(item => item.id !== id)
    }));
  };

  const handleUpdateEquipment = (id: string, field: keyof EquipmentItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      equipmentInventory: (prev.equipmentInventory || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddLighting = () => {
    const newItem: LightingItem = {
      id: Math.random().toString(),
      type: 'LED',
      quantity: 1,
      wattage: 18,
      operatingHoursPerDay: 12
    };
    setFormData(prev => ({
      ...prev,
      lightingInventory: [...(prev.lightingInventory || []), newItem]
    }));
  };

  const handleRemoveLighting = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lightingInventory: (prev.lightingInventory || []).filter(item => item.id !== id)
    }));
  };

  const handleUpdateLighting = (id: string, field: keyof LightingItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      lightingInventory: (prev.lightingInventory || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddDocument = () => {
    const newDoc: EvidenceDocument = {
      id: Math.random().toString(),
      title: '',
      documentType: 'photo',
      fileUrl: '',
      fileName: '',
      description: '',
      uploadedAt: new Date().toISOString()
    };
    setFormData(prev => ({
      ...prev,
      evidenceDocuments: [...(prev.evidenceDocuments || []), newDoc]
    }));
  };

  const handleRemoveDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      evidenceDocuments: (prev.evidenceDocuments || []).filter(doc => doc.id !== id)
    }));
  };

  const handleUpdateDocument = (id: string, field: keyof EvidenceDocument, value: any) => {
    setFormData(prev => ({
      ...prev,
      evidenceDocuments: (prev.evidenceDocuments || []).map(doc =>
        doc.id === id ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const handleAddSignOff = () => {
    const newSignOff: SignOff = {
      id: Math.random().toString(),
      role: 'lead_auditor',
      name: '',
      email: '',
      status: 'pending'
    };
    setFormData(prev => ({
      ...prev,
      signOffs: [...(prev.signOffs || []), newSignOff]
    }));
  };

  const handleUpdateSignOff = (id: string, field: keyof SignOff, value: any) => {
    setFormData(prev => ({
      ...prev,
      signOffs: (prev.signOffs || []).map(so =>
        so.id === id ? { ...so, [field]: value } : so
      )
    }));
  };

  const handleRemoveSignOff = (id: string) => {
    setFormData(prev => ({
      ...prev,
      signOffs: (prev.signOffs || []).filter(so => so.id !== id)
    }));
  };

  const validateSection = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeSection === 1) {
      if (!formData.facilityName?.trim()) newErrors.facilityName = 'Facility name required';
      if (!formData.locationState?.trim()) newErrors.locationState = 'State required';
      if (!formData.focalPersonName?.trim()) newErrors.focalPersonName = 'Focal person name required';
    }

    if (activeSection === 4) {
      if (formData.dieselGeneratorCapacityKVA && formData.dieselGeneratorCapacityKVA <= 0) {
        newErrors.dieselGeneratorCapacityKVA = 'Must be greater than 0';
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextSection = () => {
    if (validateSection() && activeSection < sections.length) {
      setActiveSection(activeSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSection()) return;

    setIsSaving(true);
    setError('');
    try {
      await onSave({ ...formData, updatedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save audit data');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 1:
        return <Section1_FacilityIdentification formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} selectedFacility={selectedFacility} />;
      case 2:
        return <Section2_EnergyResilience formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />;
      case 3:
        return <Section3_ElectricalLoadInventory 
          formData={formData} 
          onAddEquipment={handleAddEquipment}
          onRemoveEquipment={handleRemoveEquipment}
          onUpdateEquipment={handleUpdateEquipment}
          onAddLighting={handleAddLighting}
          onRemoveLighting={handleRemoveLighting}
          onUpdateLighting={handleUpdateLighting}
        />;
      case 4:
        return <Section4_GHGEmissions formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />;
      case 5:
        return <Section5_OMReadiness formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />;
      case 6:
        return <Section6_EHS formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />;
      case 7:
        return <Section7_GHGReduction formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />;
      case 8:
        return <Section8_CarbonMarket formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />;
      case 9:
        return <Section9_EnvironmentalScanning formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />;
      case 10:
        return <Section10_EvidenceDocuments 
          formData={formData} 
          onAddDocument={handleAddDocument}
          onRemoveDocument={handleRemoveDocument}
          validationErrors={validationErrors}
        />;
      case 11:
        return user?.role === 'VALIDATOR' ? (
          <Section11_SignOffsApprovals 
            formData={formData}
            onAddSignOff={handleAddSignOff}
            onUpdateSignOff={handleUpdateSignOff}
            onRemoveSignOff={handleRemoveSignOff}
            handleInputChange={handleInputChange}
            validationErrors={validationErrors}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <form onSubmit={handleSubmit} className="w-full">
        {/* Facility Header */}
        <div className="bg-gradient-to-r from-[#057A55] to-[#045C41] text-white px-6 md:px-8 py-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{facilityName || 'Unknown Facility'}</h1>
              <p className="text-green-100 text-sm mt-1">ID: {facilityId}</p>
            </div>
            <div className="text-right text-sm text-green-100">
              <p>Section {activeSection} of {sections.length}</p>
              <p className="font-semibold text-white mt-1">{sections[activeSection - 1].title}</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
            <div
              className="bg-[#057A55] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(activeSection / sections.length) * 100}%` }}
            />
          </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-900 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Section Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
          {sections.map((section, idx) => (
            <button
              key={section.number}
              type="button"
              onClick={() => activeSection !== section.number && validateSection() && setActiveSection(section.number)}
              className={`py-2 px-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                activeSection === section.number
                  ? 'bg-[#057A55] text-white shadow-md'
                  : idx < activeSection - 1
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={section.title}
            >
              <span className="hidden sm:inline text-lg font-bold">{section.number}</span>
              <span className="sm:hidden text-xl">{section.icon}</span>
              <span className="text-xs font-semibold text-center leading-tight line-clamp-2 max-w-xs">
                {section.title}
              </span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-[#03543F] mb-6">
            {sections[activeSection - 1].icon} {sections[activeSection - 1].title}
          </h2>

          <div className="space-y-6">
            {renderSection()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pb-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrevSection}
              disabled={activeSection === 1}
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextSection}
              disabled={activeSection === sections.length}
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-[#057A55] text-white rounded-lg font-semibold hover:bg-[#03543F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Audit'}
            </button>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

const Section1_FacilityIdentification: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
  selectedFacility?: any;
}> = ({ formData, handleInputChange, validationErrors, selectedFacility }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Facility Name *" error={validationErrors.facilityName}>
        <input
          type="text"
          value={formData.facilityName || ''}
          onChange={(e) => handleInputChange('facilityName', e.target.value)}
          readOnly={!!selectedFacility}
          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent ${
            selectedFacility ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
          placeholder="Enter facility name"
        />
      </FormField>

      <FormField label="Facility Type">
        <select
          value={formData.facilityType || ''}
          onChange={(e) => handleInputChange('facilityType', e.target.value)}
          readOnly={!!selectedFacility}
          disabled={!!selectedFacility}
          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent ${
            selectedFacility ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
        >
          <option value="">Select facility type</option>
          <option value="teaching">Teaching Hospital</option>
          <option value="fmc">Federal Medical Centre</option>
          <option value="secondary">Secondary Health Facility</option>
          <option value="primary">Primary Health Centre</option>
          <option value="private">Private Facility</option>
          <option value="faith_based">Faith-based Facility</option>
        </select>
      </FormField>

      <FormField label="State *" error={validationErrors.locationState}>
        <input
          type="text"
          value={formData.locationState || ''}
          onChange={(e) => handleInputChange('locationState', e.target.value)}
          readOnly={!!selectedFacility}
          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent ${
            selectedFacility ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
          placeholder="Enter state"
        />
      </FormField>

      <FormField label="Zone/Region">
        <input
          type="text"
          value={formData.locationZone || ''}
          onChange={(e) => handleInputChange('locationZone', e.target.value)}
          readOnly={!!selectedFacility}
          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent ${
            selectedFacility ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
          placeholder="Enter zone/region"
        />
      </FormField>

      <FormField label="GPS Latitude">
        <input
          type="number"
          step="0.0001"
          value={formData.gpsLatitude || ''}
          onChange={(e) => handleInputChange('gpsLatitude', parseFloat(e.target.value))}
          readOnly={!!selectedFacility}
          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent ${
            selectedFacility ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
          placeholder="e.g., 9.0765"
        />
      </FormField>

      <FormField label="GPS Longitude">
        <input
          type="number"
          step="0.0001"
          value={formData.gpsLongitude || ''}
          onChange={(e) => handleInputChange('gpsLongitude', parseFloat(e.target.value))}
          readOnly={!!selectedFacility}
          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent ${
            selectedFacility ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
          placeholder="e.g., 7.3986"
        />
      </FormField>

      <FormField label="Date of Audit">
        <input
          type="date"
          value={formData.auditDate || ''}
          onChange={(e) => handleInputChange('auditDate', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>

      <FormField label="Focal Person Name *" error={validationErrors.focalPersonName}>
        <input
          type="text"
          value={formData.focalPersonName || ''}
          onChange={(e) => handleInputChange('focalPersonName', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Enter name"
        />
      </FormField>

      <FormField label="Focal Person Role">
        <input
          type="text"
          value={formData.focalPersonRole || ''}
          onChange={(e) => handleInputChange('focalPersonRole', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="e.g., Chief Medical Director"
        />
      </FormField>

      <FormField label="Audit Team Members" className="md:col-span-2">
        <textarea
          value={formData.auditTeamMembers || ''}
          onChange={(e) => handleInputChange('auditTeamMembers', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="List audit team members"
          rows={3}
        />
      </FormField>

      <FormField label="Committee Observer Present">
        <select
          value={formData.committeeObserverPresent ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('committeeObserverPresent', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>
    </div>
  </>
);

const Section2_EnergyResilience: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, handleInputChange, validationErrors }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Grid Connected">
        <select
          value={formData.gridConnected ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('gridConnected', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Grid Uptime (hours/day)">
        <input
          type="number"
          step="0.5"
          max="24"
          value={formData.gridUptimeHoursPerDay || ''}
          onChange={(e) => handleInputChange('gridUptimeHoursPerDay', parseFloat(e.target.value))}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="0-24 hours"
        />
      </FormField>

      <FormField label="Backup Power Sources" className="md:col-span-2">
        <textarea
          value={formData.backupPowerSources || ''}
          onChange={(e) => handleInputChange('backupPowerSources', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="e.g., Diesel generator, Solar, Inverter, etc."
          rows={2}
        />
      </FormField>

      <FormField label="Hybrid Renewable System Installed">
        <select
          value={formData.hybridRenewableSystemInstalled ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('hybridRenewableSystemInstalled', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      {formData.hybridRenewableSystemInstalled && (
        <>
          <FormField label="Hybrid System Type">
            <select
              value={formData.hybridSystemType || ''}
              onChange={(e) => handleInputChange('hybridSystemType', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="solar">Solar Only</option>
              <option value="hybrid_solar_diesel">Solar-Diesel Hybrid</option>
              <option value="hybrid_solar_grid">Solar-Grid Hybrid</option>
              <option value="wind">Wind</option>
              <option value="other">Other</option>
            </select>
          </FormField>

          <FormField label="System Capacity (kW)">
            <input
              type="number"
              step="0.5"
              value={formData.hybridSystemCapacityKW || ''}
              onChange={(e) => handleInputChange('hybridSystemCapacityKW', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            />
          </FormField>
        </>
      )}

      <FormField label="Hybrid System Details" className="md:col-span-2">
        <textarea
          value={formData.hybridSystemDetails || ''}
          onChange={(e) => handleInputChange('hybridSystemDetails', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Describe the renewable energy system"
          rows={2}
        />
      </FormField>

      <FormField label="Major Outages in Past 12 Months">
        <select
          value={formData.majorOutagesLast12Months ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('majorOutagesLast12Months', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      {formData.majorOutagesLast12Months && (
        <>
          <FormField label="Outage Frequency (per year)">
            <input
              type="number"
              step="0.5"
              value={formData.outageFrequencyPerYear || ''}
              onChange={(e) => handleInputChange('outageFrequencyPerYear', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            />
          </FormField>

          <FormField label="Average Outage Duration (hours)">
            <input
              type="number"
              step="0.5"
              value={formData.averageOutageDurationHours || ''}
              onChange={(e) => handleInputChange('averageOutageDurationHours', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            />
          </FormField>
        </>
      )}

      <FormField label="Emergency Energy Plan in Place">
        <select
          value={formData.emergencyEnergyPlan ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('emergencyEnergyPlan', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Energy Resilience Score">
        <select
          value={formData.energyResilienceScore || 'medium'}
          onChange={(e) => handleInputChange('energyResilienceScore', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </FormField>
    </div>
  </>
);

const Section3_ElectricalLoadInventory: React.FC<{
  formData: Partial<AuditData>;
  onAddEquipment: () => void;
  onRemoveEquipment: (id: string) => void;
  onUpdateEquipment: (id: string, field: keyof EquipmentItem, value: any) => void;
  onAddLighting: () => void;
  onRemoveLighting: (id: string) => void;
  onUpdateLighting: (id: string, field: keyof LightingItem, value: any) => void;
}> = ({ formData, onAddEquipment, onRemoveEquipment, onUpdateEquipment, onAddLighting, onRemoveLighting, onUpdateLighting }) => (
  <>
    <div className="space-y-8">
      {/* Equipment Inventory */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#03543F]">Equipment Inventory</h3>
          <button
            type="button"
            onClick={onAddEquipment}
            className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#03543F] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>

        {(formData.equipmentInventory || []).length === 0 ? (
          <p className="text-slate-500 italic">No equipment added yet</p>
        ) : (
          <div className="space-y-4">
            {(formData.equipmentInventory || []).map((item, idx) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-slate-700">Equipment {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => onRemoveEquipment(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Equipment Name">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateEquipment(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                      placeholder="e.g., AC Unit"
                    />
                  </FormField>
                  <FormField label="Quantity">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateEquipment(item.id, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    />
                  </FormField>
                  <FormField label="Power (kW)">
                    <input
                      type="number"
                      step="0.1"
                      value={item.ratedPowerKW}
                      onChange={(e) => onUpdateEquipment(item.id, 'ratedPowerKW', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    />
                  </FormField>
                  <FormField label="Operating Hours/Day">
                    <input
                      type="number"
                      step="0.5"
                      max="24"
                      value={item.operatingHoursPerDay}
                      onChange={(e) => onUpdateEquipment(item.id, 'operatingHoursPerDay', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    />
                  </FormField>
                  <FormField label="Backup Power">
                    <select
                      value={item.backupPower ? 'yes' : 'no'}
                      onChange={(e) => onUpdateEquipment(item.id, 'backupPower', e.target.value === 'yes')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lighting Inventory */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#03543F]">Lighting Inventory</h3>
          <button
            type="button"
            onClick={onAddLighting}
            className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#03543F] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lighting
          </button>
        </div>

        {(formData.lightingInventory || []).length === 0 ? (
          <p className="text-slate-500 italic">No lighting items added yet</p>
        ) : (
          <div className="space-y-4">
            {(formData.lightingInventory || []).map((item, idx) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-slate-700">Lighting {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => onRemoveLighting(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField label="Type">
                    <select
                      value={item.type}
                      onChange={(e) => onUpdateLighting(item.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    >
                      <option value="LED">LED</option>
                      <option value="CFL">CFL</option>
                      <option value="Incandescent">Incandescent</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>
                  <FormField label="Quantity">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateLighting(item.id, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    />
                  </FormField>
                  <FormField label="Wattage">
                    <input
                      type="number"
                      step="0.5"
                      value={item.wattage}
                      onChange={(e) => onUpdateLighting(item.id, 'wattage', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    />
                  </FormField>
                  <FormField label="Operating Hours/Day">
                    <input
                      type="number"
                      step="0.5"
                      max="24"
                      value={item.operatingHoursPerDay}
                      onChange={(e) => onUpdateLighting(item.id, 'operatingHoursPerDay', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);

const Section4_GHGEmissions: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, handleInputChange, validationErrors }) => (
  <>
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Diesel Generator Details</h3>
        <p className="text-blue-800 text-sm">Record nameplate and operational data for all diesel generators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Generator Make">
          <input
            type="text"
            value={formData.dieselGeneratorMake || ''}
            onChange={(e) => handleInputChange('dieselGeneratorMake', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., Caterpillar"
          />
        </FormField>

        <FormField label="Model">
          <input
            type="text"
            value={formData.dieselGeneratorModel || ''}
            onChange={(e) => handleInputChange('dieselGeneratorModel', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., C18 DITA"
          />
        </FormField>

        <FormField label="Serial Number">
          <input
            type="text"
            value={formData.dieselGeneratorSerial || ''}
            onChange={(e) => handleInputChange('dieselGeneratorSerial', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="Serial number"
          />
        </FormField>

        <FormField label="Capacity (kVA)" error={validationErrors.dieselGeneratorCapacityKVA}>
          <input
            type="number"
            step="0.5"
            value={formData.dieselGeneratorCapacityKVA || ''}
            onChange={(e) => handleInputChange('dieselGeneratorCapacityKVA', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., 500"
          />
        </FormField>

        <FormField label="Capacity (kW)">
          <input
            type="number"
            step="0.5"
            value={formData.dieselGeneratorCapacityKW || ''}
            onChange={(e) => handleInputChange('dieselGeneratorCapacityKW', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., 400"
          />
        </FormField>

        <FormField label="Fuel Consumption (litres/hour)">
          <input
            type="number"
            step="0.1"
            value={formData.dieselFuelConsumptionRateLitresPerHour || ''}
            onChange={(e) => handleInputChange('dieselFuelConsumptionRateLitresPerHour', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., 98.5"
          />
        </FormField>

        <FormField label="Operating Hours per Day">
          <input
            type="number"
            step="0.5"
            max="24"
            value={formData.dieselGeneratorOperatingHoursPerDay || ''}
            onChange={(e) => handleInputChange('dieselGeneratorOperatingHoursPerDay', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="0-24"
          />
        </FormField>

        <FormField label="Grid Electricity - Last 12 Months (kWh)">
          <input
            type="number"
            step="1000"
            value={formData.gridElectricityConsumptionLast12MonthsKWh || ''}
            onChange={(e) => handleInputChange('gridElectricityConsumptionLast12MonthsKWh', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., 500000"
          />
        </FormField>

        <FormField label="Diesel Consumption - Last 12 Months (litres)">
          <input
            type="number"
            step="100"
            value={formData.dieselConsumptionLast12MonthsLitres || ''}
            onChange={(e) => handleInputChange('dieselConsumptionLast12MonthsLitres', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., 50000"
          />
        </FormField>

        <FormField label="Solar Energy Generation - Last 12 Months (kWh)">
          <input
            type="number"
            step="1000"
            value={formData.solarEnergyGenerationLast12MonthsKWh || ''}
            onChange={(e) => handleInputChange('solarEnergyGenerationLast12MonthsKWh', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., 100000"
          />
        </FormField>

        <FormField label="Waste Incineration Present">
          <select
            value={formData.wasteIncinerationPresent ? 'yes' : 'no'}
            onChange={(e) => handleInputChange('wasteIncinerationPresent', e.target.value === 'yes')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </FormField>

        {formData.wasteIncinerationPresent && (
          <FormField label="Waste Incineration Volume (kg/month)">
            <input
              type="number"
              step="100"
              value={formData.wasteIncinerationVolumeMonthlyKg || ''}
              onChange={(e) => handleInputChange('wasteIncinerationVolumeMonthlyKg', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            />
          </FormField>
        )}

        <FormField label="Oxygen Plant Operating">
          <select
            value={formData.oxygenPlantPresentAndOperating ? 'yes' : 'no'}
            onChange={(e) => handleInputChange('oxygenPlantPresentAndOperating', e.target.value === 'yes')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </FormField>

        <FormField label="Cold Chain Equipment Energy Use (kW)">
          <input
            type="number"
            step="0.1"
            value={formData.coldChainEquipmentEnergyUseKW || ''}
            onChange={(e) => handleInputChange('coldChainEquipmentEnergyUseKW', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          />
        </FormField>
      </div>
    </div>
  </>
);

const Section5_OMReadiness: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, handleInputChange, validationErrors }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Trained O&M Staff Present">
        <select
          value={formData.trainedOMStaffPresent ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('trainedOMStaffPresent', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      {formData.trainedOMStaffPresent && (
        <FormField label="Number of Trained Staff">
          <input
            type="number"
            min="0"
            value={formData.trainedOMStaffCount || ''}
            onChange={(e) => handleInputChange('trainedOMStaffCount', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          />
        </FormField>
      )}

      <FormField label="Preventive Maintenance Schedule Documented">
        <select
          value={formData.preventiveMaintenanceScheduleDocumented ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('preventiveMaintenanceScheduleDocumented', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Spare Parts Available for Critical Systems">
        <select
          value={formData.sparepartsAvailableForCriticalSystems ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('sparepartsAvailableForCriticalSystems', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Power Systems Service Frequency">
        <select
          value={formData.powerSystemsServiceFrequency || 'quarterly'}
          onChange={(e) => handleInputChange('powerSystemsServiceFrequency', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annually">Annually</option>
          <option value="as_needed">As Needed</option>
        </select>
      </FormField>

      <FormField label="Last Maintenance Date">
        <input
          type="date"
          value={formData.lastMaintenanceDate || ''}
          onChange={(e) => handleInputChange('lastMaintenanceDate', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>

      <FormField label="O&M Staff Skills Rating (1-5)">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="5"
            value={formData.omStaffSkillsRating || 3}
            onChange={(e) => handleInputChange('omStaffSkillsRating', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-lg font-bold text-[#057A55] w-8 text-center">{formData.omStaffSkillsRating || 3}</span>
        </div>
      </FormField>

      <FormField label="Maintenance Schedule Frequency">
        <input
          type="text"
          value={formData.maintenanceScheduleFrequency || ''}
          onChange={(e) => handleInputChange('maintenanceScheduleFrequency', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="e.g., Weekly, Monthly"
        />
      </FormField>
    </div>
  </>
);

const Section6_EHS: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, handleInputChange, validationErrors }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Waste Segregation System">
        <select
          value={formData.wasteSegmentationSystem ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('wasteSegmentationSystem', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Waste Disposal Method">
        <input
          type="text"
          value={formData.wasteDisposalMethod || ''}
          onChange={(e) => handleInputChange('wasteDisposalMethod', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="e.g., Incineration, Landfill"
        />
      </FormField>

      <FormField label="Air Quality Monitoring System">
        <select
          value={formData.airQualityMonitoringSystem ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('airQualityMonitoringSystem', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Emission Standards Compliance">
        <select
          value={formData.emissionStandardsCompliance ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('emissionStandardsCompliance', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Hazardous Materials Stored Safely">
        <select
          value={formData.hazardousMaterialsStorageSafe ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('hazardousMaterialsStorageSafe', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Adequate PPE Available">
        <select
          value={formData.adequatePPEAvailable ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('adequatePPEAvailable', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="EHS Compliance Status">
        <select
          value={formData.ehs_ComplianceStatus || 'compliant'}
          onChange={(e) => handleInputChange('ehs_ComplianceStatus', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="compliant">Compliant</option>
          <option value="minor_defects">Minor Defects</option>
          <option value="major_defects">Major Defects</option>
        </select>
      </FormField>

      <FormField label="Hazardous Materials Storage Details" className="md:col-span-2">
        <textarea
          value={formData.hazardousMaterialsStorageDetails || ''}
          onChange={(e) => handleInputChange('hazardousMaterialsStorageDetails', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Describe storage location, security measures, etc."
          rows={2}
        />
      </FormField>

      <FormField label="PPE Inventory Details" className="md:col-span-2">
        <textarea
          value={formData.ppeInventoryDetails || ''}
          onChange={(e) => handleInputChange('ppeInventoryDetails', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="List available PPE items"
          rows={2}
        />
      </FormField>
    </div>
  </>
);

const Section7_GHGReduction: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, handleInputChange, validationErrors }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Solar PV Upgrade Potential">
        <select
          value={formData.solarPVUpgradePotential ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('solarPVUpgradePotential', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Hybrid System Upgrade Potential">
        <select
          value={formData.hybridSystemUpgradePotential ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('hybridSystemUpgradePotential', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Renewable Energy Upgrade Potentials" className="md:col-span-2">
        <textarea
          value={formData.renewableEnergyUpgradePotentials || ''}
          onChange={(e) => handleInputChange('renewableEnergyUpgradePotentials', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Describe renewable energy upgrade opportunities"
          rows={2}
        />
      </FormField>

      <FormField label="Obvious Inefficiencies Present">
        <select
          value={formData.obviousInefficiencies ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('obviousInefficiencies', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Inefficiencies Specification" className="md:col-span-2">
        <textarea
          value={formData.obviousInefficienciesSpecification || ''}
          onChange={(e) => handleInputChange('obviousInefficienciesSpecification', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Describe energy inefficiencies found"
          rows={3}
        />
      </FormField>

      <FormField label="Prioritized Interventions Level">
        <select
          value={formData.prioritizedInterventionsLevel || 'medium'}
          onChange={(e) => handleInputChange('prioritizedInterventionsLevel', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </FormField>

      <FormField label="Estimated GHG Reduction Potential (tonnes CO2)">
        <input
          type="number"
          step="0.1"
          value={formData.estimatedGHGReductionPotentialTonnesCO2 || ''}
          onChange={(e) => handleInputChange('estimatedGHGReductionPotentialTonnesCO2', parseFloat(e.target.value))}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>
    </div>
  </>
);

const Section8_CarbonMarket: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, handleInputChange, validationErrors }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Historical Energy/GHG Records Available">
        <select
          value={formData.historicalEnergyGHGRecords ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('historicalEnergyGHGRecords', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      {formData.historicalEnergyGHGRecords && (
        <FormField label="Records Retention (years)">
          <input
            type="number"
            step="1"
            value={formData.recordsRetentionYears || ''}
            onChange={(e) => handleInputChange('recordsRetentionYears', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          />
        </FormField>
      )}

      <FormField label="MRV Systems in Place">
        <select
          value={formData.mrvSystemsInPlace ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('mrvSystemsInPlace', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Carbon Credit Scheme Interest">
        <select
          value={formData.carbonCreditSchemeInterest ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('carbonCreditSchemeInterest', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      {formData.carbonCreditSchemeInterest && (
        <FormField label="Preferred Carbon Scheme">
          <input
            type="text"
            value={formData.preferredCarbonScheme || ''}
            onChange={(e) => handleInputChange('preferredCarbonScheme', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            placeholder="e.g., Gold Standard, VCS"
          />
        </FormField>
      )}

      <FormField label="MRV System Details" className="md:col-span-2">
        <textarea
          value={formData.mrvSystemDetails || ''}
          onChange={(e) => handleInputChange('mrvSystemDetails', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Describe MRV systems"
          rows={2}
        />
      </FormField>

      <FormField label="Carbon Credit Remarks" className="md:col-span-2">
        <textarea
          value={formData.carbonCreditRemarks || ''}
          onChange={(e) => handleInputChange('carbonCreditRemarks', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Additional remarks about carbon market readiness"
          rows={3}
        />
      </FormField>
    </div>
  </>
);

const Section9_EnvironmentalScanning: React.FC<{
  formData: Partial<AuditData>;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, handleInputChange, validationErrors }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Nearby Facilities Could Benefit from Shared Energy">
        <select
          value={formData.nearbyFacilitiesSharedEnergyBenefit ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('nearbyFacilitiesSharedEnergyBenefit', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      {formData.nearbyFacilitiesSharedEnergyBenefit && (
        <FormField label="Number of Nearby Facilities">
          <input
            type="number"
            min="0"
            value={formData.nearbyFacilitiesCount || ''}
            onChange={(e) => handleInputChange('nearbyFacilitiesCount', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          />
        </FormField>
      )}

      <FormField label="Oxygen Plant Feasibility">
        <select
          value={formData.oxygenPlantFeasibility ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('oxygenPlantFeasibility', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Waste-to-Energy Feasibility">
        <select
          value={formData.waste_to_energyFeasibility ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('waste_to_energyFeasibility', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      <FormField label="Nearby Facilities Remarks" className="md:col-span-2">
        <textarea
          value={formData.nearbyFacilitiesRemarks || ''}
          onChange={(e) => handleInputChange('nearbyFacilitiesRemarks', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Describe opportunities for collaboration"
          rows={2}
        />
      </FormField>

      <FormField label="Additional Infrastructure Potential" className="md:col-span-2">
        <textarea
          value={formData.additionalInfrastructurePotential || ''}
          onChange={(e) => handleInputChange('additionalInfrastructurePotential', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          placeholder="Describe potential for new infrastructure (oxygen plant, waste-to-energy, etc.)"
          rows={3}
        />
      </FormField>

      <FormField label="Lead Auditor Name" className="md:col-span-2">
        <input
          type="text"
          value={formData.leadAuditorName || ''}
          onChange={(e) => handleInputChange('leadAuditorName', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>

      <FormField label="Lead Auditor Email">
        <input
          type="email"
          value={formData.leadAuditorEmail || ''}
          onChange={(e) => handleInputChange('leadAuditorEmail', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>

      <FormField label="GHG Analyst Name">
        <input
          type="text"
          value={formData.ghgAnalystName || ''}
          onChange={(e) => handleInputChange('ghgAnalystName', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>

      <FormField label="GHG Analyst Email">
        <input
          type="email"
          value={formData.ghgAnalystEmail || ''}
          onChange={(e) => handleInputChange('ghgAnalystEmail', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>

      <FormField label="Photo Documentation Completed">
        <select
          value={formData.photoDocumentationCompleted ? 'yes' : 'no'}
          onChange={(e) => handleInputChange('photoDocumentationCompleted', e.target.value === 'yes')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>

      {formData.photoDocumentationCompleted && (
        <>
          <FormField label="Number of Photos">
            <input
              type="number"
              min="0"
              value={formData.photoDocumentationCount || ''}
              onChange={(e) => handleInputChange('photoDocumentationCount', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            />
          </FormField>

          <FormField label="Photo Storage Location">
            <input
              type="text"
              value={formData.photoStorageLocation || ''}
              onChange={(e) => handleInputChange('photoStorageLocation', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
              placeholder="e.g., Google Drive, OneDrive, Server path"
            />
          </FormField>
        </>
      )}
    </div>
  </>
);

// ============================================================================
// SECTION 10: Evidence Documents
// ============================================================================

const Section10_EvidenceDocuments: React.FC<{
  formData: Partial<AuditData>;
  onAddDocument: () => void;
  onRemoveDocument: (id: string) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, onAddDocument, onRemoveDocument, validationErrors }) => (
  <>
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#057A55]" />
          Upload Evidence Documents
        </h3>
        <button
          type="button"
          onClick={onAddDocument}
          className="flex items-center gap-2 bg-[#057A55] text-white px-4 py-2 rounded-lg hover:bg-[#03543F] font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      <p className="text-slate-600 text-sm mb-4">
        Upload photos, certificates, reports, and other evidence documents related to this audit.
      </p>

      {(formData.evidenceDocuments || []).length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No documents uploaded yet</p>
          <p className="text-slate-500 text-sm">Click "Add Document" to upload evidence</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(formData.evidenceDocuments || []).map((doc) => (
            <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{doc.title}</p>
                  <p className="text-xs text-slate-500">{doc.fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveDocument(doc.id)}
                  className="text-red-600 hover:text-red-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]">
                    <option value="photo">Photo</option>
                    <option value="report">Report</option>
                    <option value="certificate">Certificate</option>
                    <option value="receipt">Receipt</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Related Section</label>
                  <input type="number" min="1" max="9" placeholder="1-9" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]" />
                </div>
              </div>

              {/* File Upload Field */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Upload File *</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-[#057A55] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xlsx"
                    className="w-full"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        console.log('File selected:', file.name);
                        // Store file info in document
                      }
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Drag and drop files here or click to browse. Accepted: images, PDF, Word, Excel
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="What does this document show?"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1" />
        <div>
          <p className="font-semibold text-blue-900">All photographic documentation is complete</p>
          <p className="text-sm text-blue-700">Confirm that all required facility areas have been photographed</p>
        </div>
      </label>
    </div>
  </>
);

// ============================================================================
// SECTION 11: Sign-offs & Approvals (Validator Only)
// ============================================================================

const Section11_SignOffsApprovals: React.FC<{
  formData: Partial<AuditData>;
  onAddSignOff: () => void;
  onUpdateSignOff: (id: string, field: keyof SignOff, value: any) => void;
  onRemoveSignOff: (id: string) => void;
  handleInputChange: (field: keyof AuditData, value: any) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, onAddSignOff, onUpdateSignOff, onRemoveSignOff, handleInputChange, validationErrors }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <FormField label="Audit Completion Date">
        <input
          type="date"
          value={formData.auditCompletionDate || ''}
          onChange={(e) => handleInputChange('auditCompletionDate', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        />
      </FormField>

      <FormField label="Audit Approval Status">
        <select
          value={formData.auditApprovalStatus || 'pending'}
          onChange={(e) => handleInputChange('auditApprovalStatus', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="revision_needed">Revision Needed</option>
        </select>
      </FormField>
    </div>

    <FormField label="Overall Audit Comments" className="mb-6">
      <textarea
        value={formData.overallAuditComments || ''}
        onChange={(e) => handleInputChange('overallAuditComments', e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
        placeholder="Enter any final comments or recommendations"
        rows={4}
      />
    </FormField>

    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#057A55]" />
          Sign-offs & Approvals
        </h3>
        <button
          type="button"
          onClick={onAddSignOff}
          className="flex items-center gap-2 bg-[#057A55] text-white px-4 py-2 rounded-lg hover:bg-[#03543F] font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add Sign-off
        </button>
      </div>

      {(formData.signOffs || []).length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No sign-offs yet</p>
          <p className="text-slate-500 text-sm">Add auditor approvals and signatures</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(formData.signOffs || []).map((signoff) => (
            <div key={signoff.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-800 capitalize">{signoff.role.replace('_', ' ')}</span>
                    {signoff.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {signoff.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
                    {signoff.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <p className="text-sm text-slate-600">{signoff.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSignOff(signoff.id)}
                  className="text-red-600 hover:text-red-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={signoff.name}
                  onChange={(e) => onUpdateSignOff(signoff.id, 'name', e.target.value)}
                  placeholder="Full Name"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                />
                <input
                  type="email"
                  value={signoff.email}
                  onChange={(e) => onUpdateSignOff(signoff.id, 'email', e.target.value)}
                  placeholder="Email"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signature Date</label>
                  <input 
                    type="date" 
                    value={signoff.signedAt?.split('T')[0] || ''}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    value={signoff.status}
                    onChange={(e) => onUpdateSignOff(signoff.id, 'status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {signoff.status === 'rejected' && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
                  <textarea 
                    value={signoff.rejectionReason || ''}
                    onChange={(e) => onUpdateSignOff(signoff.id, 'rejectionReason', e.target.value)}
                    placeholder="Why is this audit being rejected?"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
                  />
                </div>
              )}

              <textarea
                value={signoff.comments || ''}
                onChange={(e) => onUpdateSignOff(signoff.id, 'comments', e.target.value)}
                placeholder="Comments / Notes"
                rows={2}
                className="w-full mt-4 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#057A55]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  </>
);

// ============================================================================
// Helper Components
// ============================================================================

const FormField: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    {children}
    {error && <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>}
  </div>
);

export default AuditFormRedesigned;
