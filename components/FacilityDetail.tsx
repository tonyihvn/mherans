


import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { UserRole, ERLevel } from '../types';
import { 
  Building2, Zap, Activity, DollarSign, FileText, CheckCircle2, 
  AlertTriangle, Battery, Sun, Server, Thermometer, ShieldCheck,
  Upload, Download, Info, BrainCircuit
} from 'lucide-react';
import StatCard from './StatCard';
import AIInsights from './AIInsights';

interface FacilityDetailProps {
  facilityId: string;
  userRole: UserRole;
}

const FacilityDetail: React.FC<FacilityDetailProps> = ({ facilityId, userRole }) => {
  const { facilities, audits } = useAppState();
  const facility = facilities.find(f => f.id === facilityId);
  const audit = audits[facilityId];
  
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'energy' | 'intelligence' | 'services' | 'costs' | 'evidence'>('overview');

  if (!facility) return <div className="p-12 text-center text-slate-400">Facility profile not found in registry.</div>;

  const canEdit = userRole === UserRole.ADMIN || (userRole === UserRole.FACILITY_ADMIN);

  const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
      <Icon className="w-5 h-5 text-[#008489]" />
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Facility Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
              {facility.ownership}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
              {facility.criticality || 'PHC/Secondary'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{facility.name}</h1>
          <p className="text-slate-500 flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4" /> {facility.lga || 'N/A'}, {facility.state} • {facility.region || 'Pilot Zone'} Zone
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {audit ? (
            <div className="text-center px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Audit Verified
              </p>
            </div>
          ) : (
            <div className="text-center px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
              <p className="text-sm font-bold text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Baseline Pending
              </p>
            </div>
          )}
          {canEdit && (
            <button className="flex items-center gap-2 px-6 py-3 bg-[#008489] text-white rounded-2xl font-bold hover:bg-[#006b6f] transition-colors shadow-lg shadow-[#008489]/20">
              <Upload className="w-4 h-4" /> Update Facility Profile
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: Info },
          { id: 'intelligence', label: 'AI Intelligence', icon: BrainCircuit },
          { id: 'energy', label: 'Energy Profile', icon: Zap },
          { id: 'services', label: 'Health Services', icon: Activity },
          { id: 'costs', label: 'Costs & Risks', icon: DollarSign },
          { id: 'evidence', label: 'Evidence Store', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'bg-[#008489] text-white shadow-xl shadow-teal-100' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeSubTab === 'intelligence' ? (
        <AIInsights facility={facility} auditData={audit} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          {activeSubTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <SectionTitle title="Identity & Profile" icon={Building2} />
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase">Pilot focus area</dt>
                    <dd className="text-slate-700 font-medium leading-relaxed">{facility.pilotFocus || 'HeRAMS standard infrastructure monitoring.'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase">Facility Tier</dt>
                    <dd className="text-slate-700 font-medium">{facility.tier}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase">Registry ID</dt>
                    <dd className="text-slate-700 font-mono text-xs">{facility.id}</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#008489]" /> Monitoring Progress
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className={`w-4 h-4 ${audit ? 'text-emerald-500' : 'text-slate-300'}`} /> {audit ? 'Baseline Audit Verified' : 'Baseline Audit Pending'}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" /> GHG Inventory (In Progress)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" /> Carbon Market Readiness
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSubTab === 'energy' && (
            <div className="space-y-12">
              {audit ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Audit Grid Uptime" value={`${audit.gridUptime}h`} icon={Zap} trend="Daily Avg" />
                  <StatCard label="Grid Consumption" value={`${audit.totalKWh} kWh`} icon={Activity} trend="Annual" />
                  <StatCard label="Diesel Consumption" value={`${audit.totalDiesel} L`} icon={Server} trend="Annual" />
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Zap className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Detailed energy telemetry requires a verified audit.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="py-20 text-center text-slate-400 italic">
            Select intelligence tab for AI-driven recommendations.
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityDetail;
