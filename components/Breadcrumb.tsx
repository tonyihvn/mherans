

/**
 * Breadcrumb Navigation Component
 * Shows current location with URL based on internal page state
 */

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  currentPage: string;
  selectedFacility?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPage, selectedFacility }) => {
  // Map internal page states to breadcrumb info
  const pageMap: { [key: string]: { label: string; url: string } } = {
    'dashboard': { label: 'Dashboard', url: '/dashboard' },
    'map': { label: 'Facility Map', url: '/dashboard/facility-map' },
    'auditForm': { label: 'Audit Form', url: '/dashboard/audit-form' },
    'viewAudits': { label: 'Audits', url: '/dashboard/audits' },
    'facilities': { label: 'Facilities', url: '/dashboard/facilities' },
    'users': { label: 'Users', url: '/dashboard/users' },
    'config': { label: 'Indicators', url: '/dashboard/indicators' },
    'auditPeriods': { label: 'Audit Periods', url: '/dashboard/audit-periods' },
    'facilityDashboard': { label: 'Facility Dashboard', url: '/dashboard/facility' },
    'facilityIndicators': { label: 'Facility Indicators', url: '/dashboard/indicators' },
    'settings': { label: 'Settings', url: '/dashboard/settings' },
    'rolesPermissions': { label: 'Roles & Permissions', url: '/dashboard/roles-permissions' },
  };

  const getCurrentBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Dashboard', url: '/dashboard' }
    ];

    if (pageMap[currentPage]) {
      breadcrumbs.push(pageMap[currentPage]);
    }

    return breadcrumbs;
  };

  const breadcrumbs = getCurrentBreadcrumbs();

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center gap-2 text-sm">
        <a href="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-[#057A55] transition-colors">
          <Home className="w-4 h-4" />
          Home
        </a>

        {breadcrumbs.slice(1).map((crumb, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 font-medium">
              {crumb.label}
            </span>
            <span className="text-xs text-slate-500">
              ({crumb.url})
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;
