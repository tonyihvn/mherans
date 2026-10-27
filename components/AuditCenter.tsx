import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { UserRole, AuditData, ERLevel } from '../types';
import { 
  ClipboardCheck, Zap, BarChart, UserCog, HardHat, Droplets, Leaf,
  Trash2, Plus, Send, CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert, Lock, AlertCircle
} from 'lucide-react';

const AuditCenter: React.FC<{ user: any }> = ({ user }) => {
  const { facilities, saveAudit, indicatorConfig } = useAppState();
  const [step, setStep] = useState(1);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [auditFrequency, setAuditFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [auditFormsOpen, setAuditFormsOpen] = useState(localStorage.getItem('auditFormsOpen') !== 'false');
  
  useEffect(() => {
    if (user.role === UserRole.FACILITY_ADMIN && user.facilityId) {
      setSelectedFacility(user.facilityId);
    }
  }, [user]);

  useEffect(() => {
    // Check every 2 seconds if audit forms status changed (controlled by Super Admin)
    const interval = setInterval(() => {
      const isOpen = localStorage.getItem('auditFormsOpen') !== 'false';
      setAuditFormsOpen(isOpen);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState<AuditData>({
    focalPersonName: '',
    focalPersonRole: '',
    auditTeam: [''],
    committeeObserver: false,
    gridConnected: false,
    avgGridUptime: 0,
    backupSources: [],
    hybridSystem: false,
    hybridDetails: '',
    majorOutagesLast12Months: false,
    outageDetails: '',
    emergencyEnergyPlan: false,
    resilienceScore: ERLevel.MODERATE,
    loads: [{ type: '', model: '', qty: 1, powerKW: 0, hoursPerDay: 0, backup: false }],
    lightingInventory: [{ bulbType: '', quantity: 1, wattage: 0, operatingHours: 0 }],
    dieselGenNameplate: { make: '', serial: '', capacity: '', fuelRate: '', opHours: '' },
    gridKWhLast12Months: 0,
    dieselLitresLast12Months: 0,
    wasteIncinerationPresent: false,
    wasteIncineratedMonthly: 0,
    waterEnergyUse: { pumpPowerKW: 0, opHours: 0 },
    trainedOMStaff: false,
    omStaffCount: 0,
    preventiveMaintenanceSchedule: false,
    sparePartsAvailable: false,
    serviceFrequency: 'Quarterly',
    staffSkillsRating: 3,
    wasteSegregation: false,
    wasteDisposalMethod: '',
    airQualityMonitoring: false,
    hazardousStorage: false,
    adequatePPE: false,
    renewablePotentials: [],
    obviousInefficiencies: '',
    prioritizedInterventions: 'Medium',
    historicalRecords: false,
    mrvSystems: false,
    carbonCreditInterest: false,
    nearbyFacilitiesSharedInterventions: false,
    nearbyFacilitiesRemarks: '',
    additionalInfrastructurePotential: '',
    evidenceUploads: [],
    validatorEndorsements: []
  });

  const handleSave = () => {
    if (!auditFormsOpen) {
      alert('Audit forms are currently closed. Please try again later.');
      return;
    }

    if (!selectedFacility) {
      alert('Please select a facility');
      return;
    }
    
    // Add audit frequency metadata
    const auditDataWithFrequency = {
      ...formData,
      facility_id: selectedFacility,
      auditFrequency: auditFrequency,
      lastAuditDate: new Date().toISOString()
    };
    
    saveAudit(selectedFacility, auditDataWithFrequency);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-teal-50 text-[#008489] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Audit Submitted</h2>
        <p className="text-slate-500 mb-8">Data synchronized with the Federal Monitoring System</p>
        <button 
          onClick={() => { setSubmitted(false); setStep(1); }} 
          className="px-12 py-4 bg-[#008489] text-white rounded-xl font-bold hover:bg-teal-700"
        >
          New Audit Entry
        </button>
      </div>
    );
  }

  const FormField = ({ label, description, children }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</label>
      {description && <p className="text-xs text-slate-500 italic">{description}</p>}
      {children}
    </div>
  );

  const YesNoToggle = ({ value, onChange }: any) => (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs transition-all ${
          value === true ? 'bg-[#008489] text-white border-[#008489]' : 'bg-slate-50 text-slate-600 border-slate-200'
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs transition-all ${
          value === false ? 'bg-[#008489] text-white border-[#008489]' : 'bg-slate-50 text-slate-600 border-slate-200'
        }`}
      >
        No
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-4xl font-black text-slate-900">Energy Audit Form</h2>
        <p className="text-slate-500 mt-2">Section {step} of 11</p>
      </div>

      {!auditFormsOpen && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 flex items-start gap-4">
          <Lock className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Audit Forms Currently Closed</h3>
            <p className="text-red-800">
              The Super Admin has temporarily closed audit form submission for the system. 
              You can view previously submitted audits, but cannot edit or submit new ones at this time. 
              Please check back later or contact your administrator for more information.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-11 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`aspect-square rounded-lg font-bold transition-all text-xs ${
              step === s
                ? 'bg-[#008489] text-white shadow-lg'
                : step > s
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-400'
            }`}
            title={s === 9 ? 'Environmental Scanning' : s === 10 ? 'Evidence & Documents' : s === 11 ? 'Validator Endorsement' : ''}
          >
            {s} & Audit Schedule
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg min-h-96">
        {/* Section 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Facility Identification</h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Facility Name">
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={selectedFacility}
                  disabled={user.role === UserRole.FACILITY_ADMIN}
                  onChange={e => setSelectedFacility(e.target.value)}
                >
                  <option value="">Select facility...</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </FormField>
              <FormField label="Facility Focal Person (Name & Role)">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.focalPersonName}
                  onChange={e => setFormData({...formData, focalPersonName: e.target.value})}
                />
              </FormField>
              <FormField label="Focal Person Role (Title)">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.focalPersonRole}
                  onChange={e => setFormData({...formData, focalPersonRole: e.target.value})}
                />
              </FormField>
              <FormField label="Committee Observer Present (Yes/No)">
                <YesNoToggle value={formData.committeeObserver} onChange={(v: any) => setFormData({...formData, committeeObserver: v})} />
              </FormField>
              <FormField label="Audit Frequency Schedule">
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={auditFrequency}
                  onChange={e => setAuditFrequency(e.target.value as 'monthly' | 'quarterly' | 'annual')}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly (Every 3 Months)</option>
                  <option value="annual">Annual (Yearly)</option>
                </select>
              </FormField>
              <div className="col-span-2">
                <FormField label="Audit Team Members Present (Lead Auditor, GHG Analyst)">
                  <div className="space-y-2">
                    {formData.auditTeam.map((member, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                          placeholder="Team member name"
                          value={member}
                          onChange={e => {
                            const newTeam = [...formData.auditTeam];
                            newTeam[i] = e.target.value;
                            setFormData({...formData, auditTeam: newTeam});
                          }}
                        />
                        {i > 0 && (
                          <button
                            onClick={() => setFormData({...formData, auditTeam: formData.auditTeam.filter((_, idx) => idx !== i)})}
                            className="p-2 bg-red-50 text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({...formData, auditTeam: [...formData.auditTeam, '']})}
                      className="text-[#008489] text-xs font-bold mt-2 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Team Member
                    </button>
                  </div>
                </FormField>
              </div>
            </div>
          </div>
        )}

        {/* Section 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Energy Access & Resilience</h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Is The Facility Connected To The National Grid?">
                <YesNoToggle value={formData.gridConnected} onChange={(v: any) => setFormData({...formData, gridConnected: v})} />
              </FormField>
              <FormField label="What Is The Average Grid Uptime (Hours/Day)?">
                <input 
                  type="number"
                  step="0.1"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.avgGridUptime}
                  onChange={e => setFormData({...formData, avgGridUptime: parseFloat(e.target.value)})}
                />
              </FormField>
              <FormField label="List All Backup Power Sources (E.G., Diesel Generator, Solar, Inverter)">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.backupSources.join(', ')}
                  onChange={e => setFormData({...formData, backupSources: e.target.value.split(',').map(s => s.trim())})}
                />
              </FormField>
              <FormField label="Is There A Hybrid Renewable Energy System Installed?">
                <YesNoToggle value={formData.hybridSystem} onChange={(v: any) => setFormData({...formData, hybridSystem: v})} />
              </FormField>
              {formData.hybridSystem && (
                <FormField label="If Yes, Specify Type And Capacity">
                  <input 
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg col-span-2"
                    value={formData.hybridDetails}
                    onChange={e => setFormData({...formData, hybridDetails: e.target.value})}
                  />
                </FormField>
              )}
              <FormField label="Has The Facility Experienced Major Energy Outages In The Past 12 Months?">
                <YesNoToggle value={formData.majorOutagesLast12Months} onChange={(v: any) => setFormData({...formData, majorOutagesLast12Months: v})} />
              </FormField>
              {formData.majorOutagesLast12Months && (
                <FormField label="If Yes, Indicate Frequency And Duration">
                  <input 
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                    value={formData.outageDetails}
                    onChange={e => setFormData({...formData, outageDetails: e.target.value})}
                  />
                </FormField>
              )}
              <FormField label="Is There An Emergency Energy Plan In Place?">
                <YesNoToggle value={formData.emergencyEnergyPlan} onChange={(v: any) => setFormData({...formData, emergencyEnergyPlan: v})} />
              </FormField>
              <FormField label="Energy Resilience Score (Subjective Assessment: High / Medium / Low)">
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.resilienceScore}
                  onChange={e => setFormData({...formData, resilienceScore: e.target.value as ERLevel})}
                >
                  <option value={ERLevel.LOW}>Low</option>
                  <option value={ERLevel.MODERATE}>Moderate</option>
                  <option value={ERLevel.HIGH}>High</option>
                </select>
              </FormField>
            </div>
          </div>
        )}

        {/* Section 3 */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Electrical Load Inventory</h3>
            <div className="space-y-4">
              {formData.loads.map((load, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold">Equipment #{i + 1}</span>
                    {formData.loads.length > 1 && (
                      <button
                        onClick={() => setFormData({...formData, loads: formData.loads.filter((_, idx) => idx !== i)})}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Equipment Type">
                      <input 
                        type="text"
                        className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                        placeholder="e.g., ICU Fridge"
                        value={load.type}
                        onChange={e => {
                          const newLoads = [...formData.loads];
                          newLoads[i].type = e.target.value;
                          setFormData({...formData, loads: newLoads});
                        }}
                      />
                    </FormField>
                    <FormField label="Make/Model">
                      <input 
                        type="text"
                        className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                        value={load.model}
                        onChange={e => {
                          const newLoads = [...formData.loads];
                          newLoads[i].model = e.target.value;
                          setFormData({...formData, loads: newLoads});
                        }}
                      />
                    </FormField>
                    <FormField label="Quantity">
                      <input 
                        type="number"
                        className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                        value={load.qty}
                        onChange={e => {
                          const newLoads = [...formData.loads];
                          newLoads[i].qty = parseInt(e.target.value);
                          setFormData({...formData, loads: newLoads});
                        }}
                      />
                    </FormField>
                    <FormField label="Rated Power (kW)">
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                        value={load.powerKW}
                        onChange={e => {
                          const newLoads = [...formData.loads];
                          newLoads[i].powerKW = parseFloat(e.target.value);
                          setFormData({...formData, loads: newLoads});
                        }}
                      />
                    </FormField>
                    <FormField label="Operating Hours (hrs/day)">
                      <input 
                        type="number"
                        step="0.5"
                        className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                        value={load.hoursPerDay}
                        onChange={e => {
                          const newLoads = [...formData.loads];
                          newLoads[i].hoursPerDay = parseFloat(e.target.value);
                          setFormData({...formData, loads: newLoads});
                        }}
                      />
                    </FormField>
                    <FormField label="Backup Power (Yes/No)">
                      <select 
                        className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                        value={load.backup ? 'yes' : 'no'}
                        onChange={e => {
                          const newLoads = [...formData.loads];
                          newLoads[i].backup = e.target.value === 'yes';
                          setFormData({...formData, loads: newLoads});
                        }}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setFormData({...formData, loads: [...formData.loads, { type: '', model: '', qty: 1, powerKW: 0, hoursPerDay: 0, backup: false }]})}
                className="w-full py-2 border-2 border-dashed border-[#008489] text-[#008489] rounded-lg font-bold text-sm hover:bg-teal-50"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Add Equipment
              </button>
            </div>

            {/* Lighting Inventory Subsection */}
            <div className="mt-8 pt-6 border-t border-slate-300">
              <h4 className="text-lg font-bold mb-4 text-slate-800">Lighting Inventory</h4>
              <div className="space-y-4">
                {formData.lightingInventory.map((lighting, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold">Lighting #{i + 1}</span>
                      {formData.lightingInventory.length > 1 && (
                        <button
                          onClick={() => setFormData({...formData, lightingInventory: formData.lightingInventory.filter((_, idx) => idx !== i)})}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Bulb Type (LED/CFL/Etc.)">
                        <input 
                          type="text"
                          className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                          placeholder="E.G., LED, CFL, Incandescent"
                          value={lighting.bulbType}
                          onChange={e => {
                            const newLighting = [...formData.lightingInventory];
                            newLighting[i].bulbType = e.target.value;
                            setFormData({...formData, lightingInventory: newLighting});
                          }}
                        />
                      </FormField>
                      <FormField label="Quantity">
                        <input 
                          type="number"
                          className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                          value={lighting.quantity}
                          onChange={e => {
                            const newLighting = [...formData.lightingInventory];
                            newLighting[i].quantity = parseInt(e.target.value) || 1;
                            setFormData({...formData, lightingInventory: newLighting});
                          }}
                        />
                      </FormField>
                      <FormField label="Wattage (W)">
                        <input 
                          type="number"
                          step="0.5"
                          className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                          value={lighting.wattage}
                          onChange={e => {
                            const newLighting = [...formData.lightingInventory];
                            newLighting[i].wattage = parseFloat(e.target.value) || 0;
                            setFormData({...formData, lightingInventory: newLighting});
                          }}
                        />
                      </FormField>
                      <FormField label="Operating Hours (hrs/day)">
                        <input 
                          type="number"
                          step="0.5"
                          className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                          value={lighting.operatingHours}
                          onChange={e => {
                            const newLighting = [...formData.lightingInventory];
                            newLighting[i].operatingHours = parseFloat(e.target.value) || 0;
                            setFormData({...formData, lightingInventory: newLighting});
                          }}
                        />
                      </FormField>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setFormData({...formData, lightingInventory: [...formData.lightingInventory, { bulbType: '', quantity: 1, wattage: 0, operatingHours: 0 }]})}
                  className="w-full py-2 border-2 border-dashed border-[#008489] text-[#008489] rounded-lg font-bold text-sm hover:bg-teal-50"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Add Lighting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 4 */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">GHG Emissions Data</h3>
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200 mb-4">
              <p className="text-xs text-emerald-600 font-bold uppercase mb-2">Live Emissions</p>
              <h4 className="text-3xl font-black text-emerald-700">
                {((formData.gridKWhLast12Months * (indicatorConfig?.gridFactor || 0.43) + 
                  formData.dieselLitresLast12Months * (indicatorConfig?.dieselFactor || 2.67) + 
                  formData.wasteIncineratedMonthly * 12 * (indicatorConfig?.wasteFactor || 0.95)) / 1000).toFixed(2)} tCO2e/year
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Grid Electricity Consumption (Last 12 Months - Total kWh)">
                <input 
                  type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.gridKWhLast12Months}
                  onChange={e => setFormData({...formData, gridKWhLast12Months: parseFloat(e.target.value)})}
                />
              </FormField>
              <FormField label="Diesel Consumption (Last 12 Months - Total Litres)">
                <input 
                  type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.dieselLitresLast12Months}
                  onChange={e => setFormData({...formData, dieselLitresLast12Months: parseFloat(e.target.value)})}
                />
              </FormField>
              <FormField label="Diesel Generator Make/Model">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.dieselGenNameplate.make}
                  onChange={e => setFormData({...formData, dieselGenNameplate: {...formData.dieselGenNameplate, make: e.target.value}})}
                />
              </FormField>
              <FormField label="Serial Number">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.dieselGenNameplate.serial}
                  onChange={e => setFormData({...formData, dieselGenNameplate: {...formData.dieselGenNameplate, serial: e.target.value}})}
                />
              </FormField>
              <FormField label="Capacity (kVA/kW)">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.dieselGenNameplate.capacity}
                  onChange={e => setFormData({...formData, dieselGenNameplate: {...formData.dieselGenNameplate, capacity: e.target.value}})}
                />
              </FormField>
              <FormField label="Fuel Consumption Rate (Litres/Hour)">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.dieselGenNameplate.fuelRate}
                  onChange={e => setFormData({...formData, dieselGenNameplate: {...formData.dieselGenNameplate, fuelRate: e.target.value}})}
                />
              </FormField>
              <FormField label="Operating Hours (hrs/day)">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.dieselGenNameplate.opHours}
                  onChange={e => setFormData({...formData, dieselGenNameplate: {...formData.dieselGenNameplate, opHours: e.target.value}})}
                />
              </FormField>
              <FormField label="Water Supply & Treatment Energy Use - Pump Rated Power (kW)">
                <input 
                  type="number"
                  step="0.01"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.waterEnergyUse.pumpPowerKW}
                  onChange={e => setFormData({...formData, waterEnergyUse: {...formData.waterEnergyUse, pumpPowerKW: parseFloat(e.target.value)}})}
                />
              </FormField>
              <FormField label="Operating Hours (hrs/day)">
                <input 
                  type="number"
                  step="0.01"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.waterEnergyUse.opHours}
                  onChange={e => setFormData({...formData, waterEnergyUse: {...formData.waterEnergyUse, opHours: parseFloat(e.target.value)}})}
                />
              </FormField>
              <FormField label="Waste Incineration Present (Yes/No)">
                <YesNoToggle value={formData.wasteIncinerationPresent} onChange={(v: any) => setFormData({...formData, wasteIncinerationPresent: v})} />
              </FormField>
              {formData.wasteIncinerationPresent && (
                <FormField label="If Yes, Volume Of Waste Incinerated Monthly (Kg/Tonnes)">
                  <input 
                    type="number"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                    value={formData.wasteIncineratedMonthly}
                    onChange={e => setFormData({...formData, wasteIncineratedMonthly: parseFloat(e.target.value)})}
                  />
                </FormField>
              )}
            </div>
          </div>
        )}

        {/* Section 5 */}
        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">O&M Readiness</h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Does The Facility Have Trained O&M Staff For Power Systems (Yes/No)?">
                <YesNoToggle value={formData.trainedOMStaff} onChange={(v: any) => setFormData({...formData, trainedOMStaff: v})} />
              </FormField>
              {formData.trainedOMStaff && (
                <FormField label="If Yes, How Many?">
                  <input 
                    type="number"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                    value={formData.omStaffCount}
                    onChange={e => setFormData({...formData, omStaffCount: parseInt(e.target.value)})}
                  />
                </FormField>
              )}
              <FormField label="Is There A Documented Preventive Maintenance Schedule For Generators And Energy Systems (Yes/No)?">
                <YesNoToggle value={formData.preventiveMaintenanceSchedule} onChange={(v: any) => setFormData({...formData, preventiveMaintenanceSchedule: v})} />
              </FormField>
              <FormField label="Are Spare Parts For Critical Systems Readily Available (Yes/No)?">
                <YesNoToggle value={formData.sparePartsAvailable} onChange={(v: any) => setFormData({...formData, sparePartsAvailable: v})} />
              </FormField>
              <FormField label="How Frequently Are Power Systems Serviced (Monthly/Quarterly/Annually)?">
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  value={formData.serviceFrequency}
                  onChange={e => setFormData({...formData, serviceFrequency: e.target.value as any})}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </FormField>
              <FormField label="O&M Staff Skills Rating (Subjective 1-5)">
                <div className="flex items-center gap-3">
                  <input 
                    type="range"
                    min="1"
                    max="5"
                    className="flex-1 accent-[#008489]"
                    value={formData.staffSkillsRating}
                    onChange={e => setFormData({...formData, staffSkillsRating: parseInt(e.target.value)})}
                  />
                  <span className="font-bold text-[#008489] w-8">{formData.staffSkillsRating}/5</span>
                </div>
              </FormField>
            </div>
          </div>
        )}

        {/* Section 6 */}
        {step === 6 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Environmental Health & Safety</h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Is There A Waste Segregation System (Medical/General Waste) (Yes/No)?">
                <YesNoToggle value={formData.wasteSegregation} onChange={(v: any) => setFormData({...formData, wasteSegregation: v})} />
              </FormField>
              <FormField label="Method Of Waste Disposal (E.G., Incineration, Landfill)">
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="E.G., Incineration, Landfill"
                  value={formData.wasteDisposalMethod}
                  onChange={e => setFormData({...formData, wasteDisposalMethod: e.target.value})}
                />
              </FormField>
              <FormField label="Is There An Air Quality Monitoring System (For Emissions From Generators/Incinerators) (Yes/No)?">
                <YesNoToggle value={formData.airQualityMonitoring} onChange={(v: any) => setFormData({...formData, airQualityMonitoring: v})} />
              </FormField>
              <FormField label="Are Hazardous Materials (E.G., Fuel, Chemicals) Stored Safely (Yes/No)?">
                <YesNoToggle value={formData.hazardousStorage} onChange={(v: any) => setFormData({...formData, hazardousStorage: v})} />
              </FormField>
              <FormField label="Is There Adequate PPE For Staff Working In High-Risk Zones (E.G., Generator House, Waste Areas) (Yes/No)?">
                <YesNoToggle value={formData.adequatePPE} onChange={(v: any) => setFormData({...formData, adequatePPE: v})} />
              </FormField>
            </div>
          </div>
        )}

        {/* Section 7 */}
        {step === 7 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Efficiency & Interventions</h3>
            <FormField label="Are There Obvious Inefficiencies In Equipment Or Operational Practices?">
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                rows={4}
                placeholder="Describe leaks, old equipment, etc."
                value={formData.obviousInefficiencies}
                onChange={e => setFormData({...formData, obviousInefficiencies: e.target.value})}
              />
            </FormField>
            <FormField label="Are There Any Renewable Energy Upgrade Potentials?">
              <div className="space-y-2">
                {['Solar PV', 'Hybrid (Solar-Diesel)', 'Other'].map(option => (
                  <label key={option} className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.renewablePotentials.includes(option)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData({...formData, renewablePotentials: [...formData.renewablePotentials, option]});
                        } else {
                          setFormData({...formData, renewablePotentials: formData.renewablePotentials.filter(p => p !== option)});
                        }
                      }}
                      className="w-4 h-4 accent-[#008489]"
                    />
                    <span className="text-sm font-bold">{option}</span>
                  </label>
                ))}
              </div>
            </FormField>
            <FormField label="Prioritize Recommended Interventions (High / Medium / Low)">
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                value={formData.prioritizedInterventions}
                onChange={e => setFormData({...formData, prioritizedInterventions: e.target.value as any})}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </FormField>
          </div>
        )}

        {/* Section 8 */}
        {step === 8 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Carbon Market Readiness</h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Does The Facility Have Historical Energy Or GHG Records?">
                <YesNoToggle value={formData.historicalRecords} onChange={(v: any) => setFormData({...formData, historicalRecords: v})} />
              </FormField>
              <FormField label="Are There Systems In Place For Data Monitoring, Reporting, And Verification (MRV)?">
                <YesNoToggle value={formData.mrvSystems} onChange={(v: any) => setFormData({...formData, mrvSystems: v})} />
              </FormField>
              <FormField label="Is The Facility Interested In Participating In Carbon Credit Schemes?">
                <YesNoToggle value={formData.carbonCreditInterest} onChange={(v: any) => setFormData({...formData, carbonCreditInterest: v})} />
              </FormField>
            </div>
          </div>
        )}

        {/* Section 9 */}
        {step === 9 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Environmental Scanning For Additional Opportunities</h3>
            <div className="space-y-6">
              <FormField label="Are There Nearby Facilities That Could Benefit From Shared Energy Interventions (Yes/No)?">
                <YesNoToggle value={formData.nearbyFacilitiesSharedInterventions} onChange={(v: any) => setFormData({...formData, nearbyFacilitiesSharedInterventions: v})} />
              </FormField>
              <FormField label="Remarks">
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  rows={3}
                  placeholder="Enter remarks about nearby facilities and shared interventions..."
                  value={formData.nearbyFacilitiesRemarks}
                  onChange={e => setFormData({...formData, nearbyFacilitiesRemarks: e.target.value})}
                />
              </FormField>
              <FormField label="Potential For Siting Additional Critical Infrastructure (E.g., Oxygen Plant, Waste-To-Energy)">
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  rows={4}
                  placeholder="Describe potential for additional critical infrastructure at this facility..."
                  value={formData.additionalInfrastructurePotential}
                  onChange={e => setFormData({...formData, additionalInfrastructurePotential: e.target.value})}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Evidence & File Uploads */}
        {step === 10 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Evidence & Documentation</h3>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">Upload supporting documents, photographs, and evidence for this audit. Each file must have a title and description.</p>
              </div>
              
              {/* Upload Form */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-800">Add New Document</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Document Title">
                    <input 
                      type="text"
                      id="fileTitle"
                      className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                      placeholder="e.g., Diesel Generator Photo, Electrical Panel"
                    />
                  </FormField>
                  <FormField label="File">
                    <input 
                      type="file"
                      id="fileInput"
                      className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                    />
                  </FormField>
                </div>
                <FormField label="Description">
                  <textarea 
                    id="fileDescription"
                    className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                    rows={2}
                    placeholder="Describe the content, location, equipment details, or relevance to the audit..."
                  />
                </FormField>
                <button
                  onClick={() => {
                    const titleInput = document.getElementById('fileTitle') as HTMLInputElement;
                    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                    const descInput = document.getElementById('fileDescription') as HTMLTextAreaElement;
                    
                    if (!titleInput?.value || !fileInput?.files?.[0] || !descInput?.value) {
                      alert('Please provide title, file, and description');
                      return;
                    }
                    
                    const file = fileInput.files[0];
                    const newUpload = {
                      id: Date.now().toString(),
                      title: titleInput.value,
                      description: descInput.value,
                      fileName: file.name,
                      fileSize: file.size,
                      uploadedAt: new Date().toISOString(),
                      fileType: file.type
                    };
                    
                    setFormData({
                      ...formData,
                      evidenceUploads: [...formData.evidenceUploads, newUpload]
                    });
                    
                    // Clear inputs
                    titleInput.value = '';
                    fileInput.value = '';
                    descInput.value = '';
                  }}
                  className="px-4 py-2 bg-[#008489] text-white rounded-lg font-bold text-sm hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 inline mr-2" /> Upload Document
                </button>
              </div>

              {/* Uploaded Files List */}
              {formData.evidenceUploads.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800">Uploaded Documents ({formData.evidenceUploads.length})</h4>
                  {formData.evidenceUploads.map((upload, i) => (
                    <div key={upload.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{upload.title}</p>
                          <p className="text-sm text-slate-600 mt-1">{upload.description}</p>
                          <p className="text-xs text-slate-500 mt-2">File: {upload.fileName} ({(upload.fileSize / 1024).toFixed(1)} KB)</p>
                          <p className="text-xs text-slate-400 mt-1">Uploaded: {new Date(upload.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            evidenceUploads: formData.evidenceUploads.filter(u => u.id !== upload.id)
                          })}
                          className="text-red-500 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validators Endorsement Section */}
        {step === 11 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-2xl font-bold border-b pb-4">Validator Endorsement</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800"><span className="font-bold">Note:</span> Only Validators can endorse or approve this audit. The Lead Auditor cannot endorse their own audit.</p>
            </div>
            
            {formData.validatorEndorsements.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500">This audit has not yet been submitted for validator endorsement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.validatorEndorsements.map((endorsement, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{endorsement.validatorName}</p>
                        <p className="text-sm text-slate-600">{endorsement.validatorRole}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        endorsement.status === 'Endorsed' ? 'bg-emerald-100 text-emerald-700' :
                        endorsement.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {endorsement.status}
                      </span>
                    </div>
                    {endorsement.comments && (
                      <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">{endorsement.comments}</p>
                    )}
                    {endorsement.endorsedAt && (
                      <p className="text-xs text-slate-500">{new Date(endorsement.endorsedAt).toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {step < 11 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-[#008489] text-white rounded-lg font-bold hover:bg-teal-700"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!auditFormsOpen}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold ${
              auditFormsOpen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" /> {auditFormsOpen ? 'Submit Audit' : 'Audit Forms Closed'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuditCenter;
