

/**
 * Audit Form View Page - Displays completed audit as a professional report
 * Shows all data on one page without tabs or form inputs
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { AuditData } from '../services/auditSchema';
import { useAppState } from '../context/StateContext';
import { useAppSettings } from '../context/AppSettingsContext';

const AuditFormViewPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { audits, facilities } = useAppState();
  const { settings } = useAppSettings();
  const [auditData, setAuditData] = useState<Partial<AuditData> | null>(null);
  const [facility, setFacility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const auditId = searchParams.get('auditId');

  useEffect(() => {
    const loadAuditData = async () => {
      try {
        setLoading(true);
        if (auditId) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/audits/${auditId}`, {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setAuditData(data);
          } else {
            setError('Failed to load audit data');
          }
        }
      } catch (err) {
        setError('Error loading audit: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadAuditData();
  }, [auditId]);

  useEffect(() => {
    if (facilityId && facilities) {
      const found = facilities.find(f => f.hfr_id === facilityId || f.id === facilityId);
      setFacility(found);
    }
  }, [facilityId, facilities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#057A55] mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading audit data...</p>
        </div>
      </div>
    );
  }

  if (error || !auditData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold text-red-900">Error Loading Audit</h2>
                <p className="text-red-700 mt-2">{error || 'The requested audit could not be found.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="text-white px-6 md:px-8 py-6 shadow-lg"
        style={{
          backgroundColor: settings?.headerBgColor || '#ffffff'
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: settings?.headerTextColor || '#1f2937' }}>
              {facility?.name || 'Unknown Facility'}
            </h1>
            <p className="text-sm mt-1" style={{ color: settings?.headerTextColor ? `${settings.headerTextColor}99` : '#6b7280' }}>
              ID: {facilityId} | Audit: {auditId}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: settings?.headerBgColor === '#ffffff' ? '#f3f4f6' : 'rgba(255,255,255,0.2)',
                color: settings?.headerTextColor || '#1f2937'
              }}
              title="Print audit"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: settings?.headerBgColor === '#ffffff' ? '#f3f4f6' : 'rgba(255,255,255,0.2)',
                color: settings?.headerTextColor || '#1f2937'
              }}
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Audit Metadata */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-[#057A55]">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Audit Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Audit Date</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {auditData.createdAt ? new Date(auditData.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Facility Name</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{auditData.facilityName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Facility Type</p>
              <p className="text-sm font-medium text-slate-900 mt-1 capitalize">{auditData.facilityType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Location</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{auditData.locationState || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Facility Identification */}
        {auditData && (
          <>
            <ReportSection title="1. Facility Identification">
              <ReportGrid columns={2}>
                <ReportField label="Facility Name" value={auditData.facilityName} />
                <ReportField label="Facility Type" value={auditData.facilityType} />
                <ReportField label="State" value={auditData.locationState} />
                <ReportField label="Zone/Region" value={auditData.locationZone} />
                <ReportField label="GPS Latitude" value={auditData.gpsLatitude} />
                <ReportField label="GPS Longitude" value={auditData.gpsLongitude} />
                <ReportField label="Focal Person" value={auditData.focalPersonName} />
                <ReportField label="Contact Phone" value={auditData.focalPersonPhone} />
              </ReportGrid>
            </ReportSection>

            {/* Section 2: Energy Access & Resilience */}
            <ReportSection title="2. Energy Access & Resilience">
              <ReportGrid columns={2}>
                <ReportField label="Main Power Supply" value={auditData.mainPowerSupply} />
                <ReportField label="Grid Uptime (hours/day)" value={auditData.gridUptimeHoursPerDay} />
                <ReportField label="Has Diesel Generator" value={auditData.hasDieselGenerator ? 'Yes' : 'No'} />
                <ReportField label="Generator Capacity (kVA)" value={auditData.dieselGeneratorCapacityKVA} />
                <ReportField label="Has Solar System" value={auditData.hasSolarSystem ? 'Yes' : 'No'} />
                <ReportField label="Solar Capacity (kWp)" value={auditData.solarSystemCapacityKWp} />
                <ReportField label="Has Battery Storage" value={auditData.hasBatteryStorage ? 'Yes' : 'No'} />
                <ReportField label="Battery Capacity (kWh)" value={auditData.batteryStorageCapacityKWh} />
              </ReportGrid>
            </ReportSection>

            {/* Section 3: Electrical Load Inventory */}
            {auditData.equipmentInventory && auditData.equipmentInventory.length > 0 && (
              <ReportSection title="3. Electrical Load Inventory - Equipment">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Equipment</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Quantity</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Rated Power (kW)</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Hours/Day</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {auditData.equipmentInventory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-700">{item.name}</td>
                          <td className="px-4 py-2 text-slate-700">{item.quantity}</td>
                          <td className="px-4 py-2 text-slate-700">{item.ratedPowerKW}</td>
                          <td className="px-4 py-2 text-slate-700">{item.operatingHoursPerDay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ReportSection>
            )}

            {auditData.lightingInventory && auditData.lightingInventory.length > 0 && (
              <ReportSection title="3. Electrical Load Inventory - Lighting">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Type</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Quantity</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Wattage</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Hours/Day</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {auditData.lightingInventory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-700">{item.type}</td>
                          <td className="px-4 py-2 text-slate-700">{item.quantity}</td>
                          <td className="px-4 py-2 text-slate-700">{item.wattage}</td>
                          <td className="px-4 py-2 text-slate-700">{item.operatingHoursPerDay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ReportSection>
            )}

            {/* Section 4: GHG Emissions Data */}
            <ReportSection title="4. GHG Emissions Data">
              <ReportGrid columns={2}>
                <ReportField label="Grid Electricity Consumption (kWh/year)" value={auditData.gridElectricityConsumptionLast12MonthsKWh} />
                <ReportField label="Diesel Consumption (litres/year)" value={auditData.dieselConsumptionLast12MonthsLitres} />
                <ReportField label="Solar Generation (kWh/year)" value={auditData.solarEnergyGenerationLast12MonthsKWh} />
                <ReportField label="Waste Incineration (tons/year)" value={auditData.wasteIncinerationTonsPerYear} />
              </ReportGrid>
            </ReportSection>

            {/* Section 5: O&M Readiness */}
            <ReportSection title="5. O&M Readiness">
              <ReportGrid columns={2}>
                <ReportField label="Maintenance Plan Available" value={auditData.maintenancePlanAvailable ? 'Yes' : 'No'} />
                <ReportField label="Training Programs" value={auditData.trainingProgramsAvailable ? 'Yes' : 'No'} />
                <ReportField label="Spare Parts Availability" value={auditData.sparePartsAvailable ? 'Yes' : 'No'} />
                <ReportField label="Technical Manuals Available" value={auditData.technicalManualsAvailable ? 'Yes' : 'No'} />
              </ReportGrid>
            </ReportSection>

            {/* Section 6: Environmental & Social Safeguards */}
            <ReportSection title="6. Environmental & Social Safeguards">
              <ReportGrid columns={2}>
                <ReportField label="Waste Management System" value={auditData.wasteManagementSystem ? 'Yes' : 'No'} />
                <ReportField label="EHS Policy" value={auditData.hasEHSPolicy ? 'Yes' : 'No'} />
                <ReportField label="Wastewater Treatment" value={auditData.wastewaterTreatment ? 'Yes' : 'No'} />
                <ReportField label="Compliance Status" value={auditData.ehs_ComplianceStatus} />
              </ReportGrid>
            </ReportSection>

            {/* Section 7: GHG Reduction & Efficiency */}
            <ReportSection title="7. GHG Reduction & Efficiency">
              <ReportGrid columns={2}>
                <ReportField label="Energy Efficiency Actions" value={auditData.energyEfficiencyActionsPlanned ? 'Yes' : 'No'} />
                <ReportField label="Renewable Energy Potential" value={auditData.renewableEnergyPotential} />
              </ReportGrid>
            </ReportSection>

            {/* Section 8: Carbon Market Readiness */}
            <ReportSection title="8. Carbon Market Readiness">
              <ReportGrid columns={2}>
                <ReportField label="MRV Systems Available" value={auditData.mrvSystemsAvailable ? 'Yes' : 'No'} />
                <ReportField label="Interest in Carbon Market" value={auditData.interestedInCarbonMarket ? 'Yes' : 'No'} />
              </ReportGrid>
            </ReportSection>

            {/* Section 9: Environmental Scanning */}
            <ReportSection title="9. Environmental Scanning">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {auditData.environmentalScanningNotes || 'No notes provided'}
                </p>
              </div>
            </ReportSection>

            {/* Section 10: Evidence Documents */}
            {auditData.evidenceDocuments && auditData.evidenceDocuments.length > 0 && (
              <ReportSection title="10. Evidence Documents">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auditData.evidenceDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="font-semibold text-slate-900 text-sm">{doc.title || 'Document ' + (idx + 1)}</p>
                      <p className="text-xs text-slate-600 mt-1">{doc.documentType}</p>
                      {doc.description && (
                        <p className="text-sm text-slate-700 mt-2">{doc.description}</p>
                      )}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#057A55] hover:underline mt-2 inline-block"
                        >
                          View Document →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </ReportSection>
            )}

            {/* Section 11: Sign-offs & Approvals */}
            {auditData.signOffs && auditData.signOffs.length > 0 && (
              <ReportSection title="11. Sign-offs & Approvals">
                <div className="space-y-4">
                  {auditData.signOffs.map((signOff, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">{signOff.role?.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-slate-700 mt-1">{signOff.name}</p>
                          <p className="text-xs text-slate-600">{signOff.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {signOff.status === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                          )}
                          <span className={`text-sm font-medium capitalize ${signOff.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`}>
                            {signOff.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ReportSection>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            This audit report was generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-[#057A55]">
    <h2 className="text-lg font-bold text-slate-900 mb-6">{title}</h2>
    {children}
  </div>
);

interface ReportGridProps {
  columns?: number;
  children: React.ReactNode;
}

const ReportGrid: React.FC<ReportGridProps> = ({ columns = 2, children }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`} style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))` }}>
    {children}
  </div>
);

interface ReportFieldProps {
  label: string;
  value?: any;
}

const ReportField: React.FC<ReportFieldProps> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-slate-600 uppercase">{label}</p>
    <p className="text-sm font-medium text-slate-900 mt-1">
      {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
    </p>
  </div>
);

export default AuditFormViewPage;
