

import React from 'react';
import { Layout, BarChart3, ShieldCheck, LogOut, FileSpreadsheet, Settings, HelpCircle, MapPin, Users, Building2, Gauge, ChevronLeft, ChevronRight, Database, Lock, FileText } from 'lucide-react';
import { UserRole } from '../types';
import { useAppSettings } from '../context/AppSettingsContext';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  role: UserRole;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange, onLogout, role, setIsOpen }) => {
  const { settings } = useAppSettings();

  const lightenColor = (color: string): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = 40;
    const usePound = true;
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return (usePound ? "#" : "") + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const darkenColor = (color: string): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = -60;
    const usePound = true;
    const R = Math.max(0, (num >> 16) + amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) + amt);
    const B = Math.max(0, (num & 0x0000FF) + amt);
    return (usePound ? "#" : "") + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const primaryColor = settings?.primaryColor || '#057A55';
  const darkerColor = darkenColor(primaryColor);
    // Super Admin items
    { id: 'console', label: 'Admin Console', icon: Lock, roles: [UserRole.SUPER_ADMIN], group: 'navigation' },
    { id: 'dashboard', label: 'Dashboard', icon: Layout, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN, UserRole.FACILITY_ADMIN], group: 'navigation' },
    { id: 'map', label: 'Facility Map', icon: MapPin, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN, UserRole.FACILITY_ADMIN, UserRole.GUEST], group: 'navigation' },
    { id: 'audit', label: 'Audit Center', icon: FileSpreadsheet, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN, UserRole.FACILITY_ADMIN, UserRole.VALIDATOR], group: 'navigation' },
    { id: 'auditForm', label: 'Audit Form', icon: FileText, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN, UserRole.FACILITY_ADMIN, UserRole.VALIDATOR, UserRole.STATE_ADMIN, UserRole.FACILITY_USER, UserRole.GUEST], group: 'navigation' },
    { id: 'public', label: 'Public Lite', icon: BarChart3, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN, UserRole.FACILITY_ADMIN, UserRole.GUEST], group: 'navigation' },
    // Admin/Super Admin management items
    { id: 'facilities', label: 'Facilities', icon: Building2, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN], group: 'management' },
    { id: 'users', label: 'Users', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN], group: 'management' },
    { id: 'config', label: 'Indicators', icon: Gauge, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN], group: 'management' },
    { id: 'datasets', label: 'Datasets', icon: Database, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN], group: 'management' },
    { id: 'settings', label: 'Admin Settings', icon: Settings, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN], group: 'other' },
    { id: 'help', label: 'Support', icon: HelpCircle, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERAL_ADMIN, UserRole.FACILITY_ADMIN], group: 'other' },
  ];

  const navigationItems = items.filter(i => i.group === 'navigation');
  const managementItems = items.filter(i => i.group === 'management');
  const otherItems = items.filter(i => i.group === 'other');

  const renderMenuGroup = (groupItems: typeof items, groupLabel: string) => (
    <div className="mb-6">
      {isOpen && groupItems.some(i => i.roles.includes(role)) && (
        <p className="text-xs text-white/60 uppercase font-bold mb-2.5 px-2 tracking-widest">{groupLabel}</p>
      )}
      <div className="space-y-1">
        {groupItems.map((item) => {
          if (!item.roles.includes(role)) return null;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={item.label}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-white/60'}`} />
              {isOpen && <span className="font-medium text-sm truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-screen text-slate-200 transition-all duration-300 z-40 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}
      style={{
        backgroundColor: primaryColor
      }}
    >
      <div className="p-6 flex items-center gap-3">
        <div
          className="min-w-[40px] h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg"
          style={{
            backgroundColor: lightenColor(primaryColor),
            boxShadow: `0 0 20px ${lightenColor(primaryColor)}33`
          }}
        >
          <ShieldCheck className="w-6 h-6" />
        </div>
        {isOpen && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-white font-bold text-xl tracking-tight">NHERAMS</h1>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">FMoH Portal</p>
          </div>
        )}
      </div>

      <div className="flex-1 mt-6 px-3 overflow-y-auto">
        {/* Navigation Group */}
        {renderMenuGroup(navigationItems, 'Navigation')}

        {/* Management Group - ADMIN ONLY */}
        {managementItems.some(i => i.roles.includes(role)) && renderMenuGroup(managementItems, 'Management')}

        {/* Other Group */}
        {renderMenuGroup(otherItems, 'Other')}
      </div>

      <div className="p-3 border-t border-white/10 space-y-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-white/70 text-sm"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {isOpen && <span className="font-medium">Collapse</span>}
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 hover:text-white transition-all text-white/70"
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
