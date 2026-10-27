
import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { UserRole, OwnershipType, FacilityTier, ClinicalCriticality, Facility, User } from '../types';
import { 
  Users, Building2, Settings2, Plus, Trash2, Edit2,
  MapPin, ShieldAlert, Save, X, Activity, UserPlus, AlertCircle, CheckCircle 
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { facilities, users, indicatorConfig, addFacility, updateFacility, deleteFacility, addUser, updateUser, deleteUser, updateIndicatorConfig } = useAppState();
  const [activeTab, setActiveTab] = useState<'facilities' | 'users' | 'indicators'>('facilities');
  
  // Modal states
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Loading and message states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New facility / user default states
  const [facilityForm, setFacilityForm] = useState<Partial<Facility>>({
    ownership: OwnershipType.FEDERAL_PUBLIC,
    tier: FacilityTier.TERTIARY,
    criticality: ClinicalCriticality.C1,
    coordinates: [9.0820, 8.6753]
  });

  const [userForm, setUserForm] = useState<Partial<User>>({
    role: UserRole.FACILITY_ADMIN
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFacilitySubmit = async () => {
    if (!facilityForm.name || !facilityForm.state) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...facilityForm,
        id: facilityForm.id || 'f_' + Math.random().toString(36).substr(2, 9),
        region: facilityForm.region || 'Central',
        isPrivate: facilityForm.ownership === OwnershipType.PRIVATE_FOR_PROFIT
      } as Facility;

      if (isAddingFacility) {
        await addFacility(data);
        showMessage('success', `Facility "${data.name}" created successfully!`);
      } else if (editingFacility?.id) {
        await updateFacility(editingFacility.id, data);
        showMessage('success', `Facility "${data.name}" updated successfully!`);
      }

      setIsAddingFacility(false);
      setEditingFacility(null);
      setFacilityForm({ ownership: OwnershipType.FEDERAL_PUBLIC, tier: FacilityTier.TERTIARY, criticality: ClinicalCriticality.C1, coordinates: [9.0820, 8.6753] });
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to save facility';
      console.error('Facility error:', error);
      showMessage('error', errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    if (!userForm.name) {
      showMessage('error', 'Please enter a user name');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...userForm,
        id: userForm.id || 'u_' + Math.random().toString(36).substr(2, 9)
      } as User;

      if (isAddingUser) {
        await addUser(data);
        showMessage('success', `User "${data.name}" created successfully!`);
      } else if (editingUser?.id) {
        await updateUser(editingUser.id, data);
        showMessage('success', `User "${data.name}" updated successfully!`);
      }

      setIsAddingUser(false);
      setEditingUser(null);
      setUserForm({ role: UserRole.FACILITY_ADMIN });
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to save user';
      console.error('User error:', error);
      showMessage('error', errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    
    setLoading(true);
    try {
      await deleteFacility(facilityId);
      showMessage('success', 'Facility deleted successfully!');
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to delete facility';
      console.error('Delete error:', error);
      showMessage('error', errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    try {
      await deleteUser(userId);
      showMessage('success', 'User deleted successfully!');
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to delete user';
      console.error('Delete error:', error);
      showMessage('error', errorText);
    } finally {
      setLoading(false);
    }
  };

  const FormField = ({ label, children }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} animate-in slide-in-from-top`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        {[
          { id: 'facilities', label: 'Facilities', icon: Building2 },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'indicators', label: 'Indicator Logic', icon: Settings2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-[#008489] text-[#008489]' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'facilities' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Facility Registry</h3>
            <button 
              onClick={() => { setIsAddingFacility(true); setFacilityForm({ ownership: OwnershipType.FEDERAL_PUBLIC, tier: FacilityTier.TERTIARY, criticality: ClinicalCriticality.C1, coordinates: [9.0820, 8.6753] }); }}
              className="flex items-center gap-2 bg-[#008489] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#006b6f] transition-all"
            >
              <Plus className="w-4 h-4" /> Register New Facility
            </button>
          </div>

          {(isAddingFacility || editingFacility) && (
            <div className="bg-white p-8 rounded-2xl border-2 border-[#008489]/20 shadow-xl space-y-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800">{isAddingFacility ? 'Register Facility' : 'Edit Facility'}</h4>
                <button onClick={() => { setIsAddingFacility(false); setEditingFacility(null); }}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Facility Name">
                  <input value={facilityForm.name || ''} placeholder="Facility Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setFacilityForm({...facilityForm, name: e.target.value})} />
                </FormField>
                <FormField label="State">
                  <input value={facilityForm.state || ''} placeholder="State" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setFacilityForm({...facilityForm, state: e.target.value})} />
                </FormField>
                <FormField label="Latitude">
                  <input type="number" step="any" value={facilityForm.coordinates?.[0] || 0} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setFacilityForm({...facilityForm, coordinates: [parseFloat(e.target.value), facilityForm.coordinates?.[1] || 0]})} />
                </FormField>
                <FormField label="Longitude">
                  <input type="number" step="any" value={facilityForm.coordinates?.[1] || 0} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setFacilityForm({...facilityForm, coordinates: [facilityForm.coordinates?.[0] || 0, parseFloat(e.target.value)]})} />
                </FormField>
                <FormField label="Ownership">
                  <select value={facilityForm.ownership} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setFacilityForm({...facilityForm, ownership: e.target.value as any})}>
                    {Object.values(OwnershipType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </FormField>
                <FormField label="Tier">
                  <select value={facilityForm.tier} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setFacilityForm({...facilityForm, tier: e.target.value as any})}>
                    {Object.values(FacilityTier).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </FormField>
              </div>
              <button onClick={handleFacilitySubmit} disabled={loading} className="w-full bg-[#008489] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : (isAddingFacility ? 'Create Facility' : 'Update Facility')}
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Facility Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Tier</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Coordinates</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {facilities.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{f.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{f.tier.split(' ')[0]}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono text-xs">{f.coordinates[0].toFixed(4)}, {f.coordinates[1].toFixed(4)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setEditingFacility(f); setFacilityForm(f); setIsAddingFacility(false); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all" disabled={loading}><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteFacility(f.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" disabled={loading}><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">User Management</h3>
            <button 
              onClick={() => { setIsAddingUser(true); setUserForm({ role: UserRole.FACILITY_ADMIN }); }}
              className="flex items-center gap-2 bg-[#008489] text-white px-4 py-2 rounded-xl font-bold text-sm"
            >
              <UserPlus className="w-4 h-4" /> Create User
            </button>
          </div>

          {(isAddingUser || editingUser) && (
            <div className="bg-white p-8 rounded-2xl border-2 border-[#008489]/20 shadow-xl space-y-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800">{isAddingUser ? 'Create User' : 'Edit User'}</h4>
                <button onClick={() => { setIsAddingUser(false); setEditingUser(null); }}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full Name">
                  <input value={userForm.name || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setUserForm({...userForm, name: e.target.value})} />
                </FormField>
                <FormField label="Role">
                  <select value={userForm.role} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}>
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FormField>
                {userForm.role === UserRole.FACILITY_ADMIN && (
                  <FormField label="Assigned Facility">
                    <select value={userForm.facilityId || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setUserForm({...userForm, facilityId: e.target.value})}>
                      <option value="">None / Unassigned</option>
                      {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </FormField>
                )}
              </div>
              <button onClick={handleUserSubmit} disabled={loading} className="w-full bg-[#008489] text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : (isAddingUser ? 'Create Account' : 'Save Changes')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-[#008489] flex items-center justify-center font-bold">{u.name.charAt(0)}</div>
                  <div>
                    <h4 className="font-bold text-slate-800">{u.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{u.role} {u.facilityId && `• ${facilities.find(f => f.id === u.facilityId)?.name.split(' ')[0]}`}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingUser(u); setUserForm(u); setIsAddingUser(false); }} className="p-2 text-slate-300 hover:text-[#008489]" disabled={loading}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-300 hover:text-red-500" disabled={loading}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'indicators' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Computational Factors</h3>
            <p className="text-sm text-slate-500">Configure global coefficients for environmental and resilience indicators.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-[#008489] flex items-center gap-2"><Activity className="w-4 h-4" /> Environmental Impacts</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Diesel Fuel (kg CO2/L)</span>
                  <input type="number" step="0.01" value={indicatorConfig.dieselFactor} className="w-20 p-2 border rounded-lg text-right font-bold" onChange={e => updateIndicatorConfig({...indicatorConfig, dieselFactor: parseFloat(e.target.value)})} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Grid Power (kg CO2/kWh)</span>
                  <input type="number" step="0.01" value={indicatorConfig.gridFactor} className="w-20 p-2 border rounded-lg text-right font-bold" onChange={e => updateIndicatorConfig({...indicatorConfig, gridFactor: parseFloat(e.target.value)})} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Medical Waste (kg CO2/kg)</span>
                  <input type="number" step="0.01" value={indicatorConfig.wasteFactor} className="w-20 p-2 border rounded-lg text-right font-bold" onChange={e => updateIndicatorConfig({...indicatorConfig, wasteFactor: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-[#008489] flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Resilience Thresholds</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Target Resilience (%)</span>
                  <input type="number" value={indicatorConfig.resilienceThreshold} className="w-20 p-2 border rounded-lg text-right font-bold" onChange={e => updateIndicatorConfig({...indicatorConfig, resilienceThreshold: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
