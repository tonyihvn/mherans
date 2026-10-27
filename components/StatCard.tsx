


import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-teal-50 group-hover:text-[#008489] transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                <span className="text-[9px] font-bold text-[#008489]">{trend}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
