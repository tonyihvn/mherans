/**
 * Audit List and Management Page
 * Shows existing audits with datatable, search, and role-based filtering
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/StateContext';
import { Plus, Eye, Edit2, Trash2, Search, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

interface AuditListPageProps {
  onSelectFacility?: (facilityId: string) => void;
  facilityOnly?: boolean;
}

type SortColumn = 'facilityName' | 'auditDate' | 'focalPerson' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const AuditListPage: React.FC<AuditListPageProps> = ({ onSelectFacility, facilityOnly = false }) => {
  const { user } = useAuth();
  const { facilities, audits } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterFacility, setFilterFacility] = useState<string>('');

  // Filter accessible facilities
  const accessibleFacilities = useMemo(() => {
    if (!user) return [];

    switch (user.user_type) {
      case 'ADMIN':
        return facilities;
      case 'VALIDATOR':
        return facilities;
      case 'STATE_USER':
        return facilities.filter(f => f.state === user.assigned_state);
      case 'FACILITY_USER':
      case 'FACILITY_ADMIN':
        return facilities.filter(f => f.hfr_id === user.assigned_facility_id || f.id === user.assigned_facility_id);
      default:
        return [];
    }
  }, [user, facilities]);

  // Filter audits based on user type
  const filteredAudits = useMemo(() => {
    if (!user) return [];

    let baseAudits = audits || [];

    switch (user.user_type) {
      case 'ADMIN':
        return baseAudits;
      case 'VALIDATOR':
        return baseAudits;
      case 'STATE_USER':
        return baseAudits.filter(audit => {
          const facilityId = audit.facility_id || audit.facilityId;
          const facility = facilities.find(f => f.hfr_id === facilityId || f.id === facilityId);
          return facility?.state === user.assigned_state;
        });
      case 'FACILITY_USER':
      case 'FACILITY_ADMIN':
        return baseAudits.filter(a => {
          const auditFacilityId = a.facility_id || a.facilityId;
          return auditFacilityId === user.assigned_facility_id;
        });
      default:
        return [];
    }
  }, [user, audits, facilities]);

  // Process audits with search and sort
  const processedAudits = useMemo(() => {
    let result = filteredAudits;

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(audit => {
        const facility = facilities.find(f => f.hfr_id === (audit.facility_id || audit.facilityId) || f.id === (audit.facility_id || audit.facilityId));
        return (
          (facility?.name || '').toLowerCase().includes(term) ||
          (facility?.hfr_id || '').toLowerCase().includes(term) ||
          (audit.focalPersonName || '').toLowerCase().includes(term)
        );
      });
    }

    // Apply facility filter
    if (filterFacility) {
      result = result.filter(a => (a.facility_id || a.facilityId) === filterFacility);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortColumn) {
        case 'facilityName':
          const facilityA = facilities.find(f => f.hfr_id === (a.facility_id || a.facilityId) || f.id === (a.facility_id || a.facilityId));
          const facilityB = facilities.find(f => f.hfr_id === (b.facility_id || b.facilityId) || f.id === (b.facility_id || b.facilityId));
          aVal = (facilityA?.name || '').toLowerCase();
          bVal = (facilityB?.name || '').toLowerCase();
          break;
        case 'focalPerson':
          aVal = (a.focalPersonName || '').toLowerCase();
          bVal = (b.focalPersonName || '').toLowerCase();
          break;
        case 'auditDate':
          aVal = new Date(a.auditDate || 0).getTime();
          bVal = new Date(b.auditDate || 0).getTime();
          break;
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt || a.created_at || 0).getTime();
          bVal = new Date(b.createdAt || b.created_at || 0).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [filteredAudits, searchTerm, sortColumn, sortDirection, filterFacility, facilities]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIndicator: React.FC<{ column: SortColumn }> = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Audits</h1>
          <p className="text-slate-600">
            {['FACILITY_ADMIN', 'FACILITY_USER'].includes(user?.user_type || '')
              ? 'Manage facility audits'
              : 'View and manage audits across facilities'}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Search Audits
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by facility, name, or person..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                />
              </div>
            </div>

            {!['FACILITY_ADMIN', 'FACILITY_USER'].includes(user?.user_type || '') && (
              <div className="w-64">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Filter by Facility
                </label>
                <select
                  value={filterFacility}
                  onChange={(e) => setFilterFacility(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                >
                  <option value="">All Facilities</option>
                  {accessibleFacilities.map((facility) => (
                    <option key={facility.hfr_id || facility.id} value={facility.hfr_id || facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-sm text-slate-600">
            Showing {processedAudits.length} audit{processedAudits.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Audits Table */}
        {processedAudits.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No audits found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('facilityName')}
                        className="font-semibold text-slate-900 flex items-center gap-2 hover:text-[#057A55] transition-colors"
                      >
                        Facility
                        <SortIndicator column="facilityName" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('auditDate')}
                        className="font-semibold text-slate-900 flex items-center gap-2 hover:text-[#057A55] transition-colors"
                      >
                        Audit Date
                        <SortIndicator column="auditDate" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('focalPerson')}
                        className="font-semibold text-slate-900 flex items-center gap-2 hover:text-[#057A55] transition-colors"
                      >
                        Focal Person
                        <SortIndicator column="focalPerson" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="font-semibold text-slate-900 flex items-center gap-2 hover:text-[#057A55] transition-colors"
                      >
                        Created
                        <SortIndicator column="createdAt" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {processedAudits.map((audit, index) => {
                    const facility = facilities.find(f => f.hfr_id === (audit.facility_id || audit.facilityId) || f.id === (audit.facility_id || audit.facilityId));
                    return (
                      <tr key={audit.id || index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-slate-900">{facility?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{facility?.hfr_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {audit.auditDate ? new Date(audit.auditDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {audit.focalPersonName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {audit.createdAt || audit.created_at ? new Date(audit.createdAt || audit.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <a
                              href={`/audit-form/${facility?.hfr_id || facility?.id}?auditId=${audit.id}&mode=view`}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={`/audit-form/${facility?.hfr_id || facility?.id}?auditId=${audit.id}&mode=edit`}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </a>
                            {user?.user_type === 'ADMIN' && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this audit?')) {
                                    fetch(`http://localhost:5000/api/audits/${audit.id}`, {
                                      method: 'DELETE',
                                      credentials: 'include'
                                    }).then(() => {
                                      window.location.reload();
                                    }).catch(err => {
                                      alert('Error deleting audit: ' + err.message);
                                    });
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditListPage;
