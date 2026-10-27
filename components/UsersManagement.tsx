/**
 * Users Management Page
 * Manage system users, roles, and access permissions
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  state?: string;
  facility?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

interface UsersManagementProps {
  onAddUser?: () => void;
  onEditUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({
  onAddUser,
  onEditUser,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Dr. Adeyemi Okonkwo',
      email: 'adeyemi.okonkwo@fmoh.gov.ng',
      role: 'FEDERAL_ADMIN',
      phone: '+234 801 234 5678',
      active: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Mrs. Folake Adebayo',
      email: 'folake.adebayo@lagoshealth.gov.ng',
      role: 'STATE_ADMIN',
      state: 'LA',
      phone: '+234 802 345 6789',
      active: true,
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      name: 'Mr. Chinedu Nwankwo',
      email: 'chinedu.nwankwo@luth.gov.ng',
      role: 'FACILITY_ADMIN',
      facility: 'LUTH',
      phone: '+234 803 456 7890',
      active: true,
      createdAt: '2024-01-20'
    },
    {
      id: '4',
      name: 'Public Guest User',
      email: 'guest@nherams.gov.ng',
      role: 'GUEST',
      phone: '+234 804 567 8901',
      active: true,
      createdAt: '2024-01-01'
    }
  ]);

  const roleDescriptions: Record<string, string> = {
    FEDERAL_ADMIN: 'Full system access, manage states and facilities',
    STATE_ADMIN: 'State level access, manage own state facilities',
    FACILITY_ADMIN: 'Facility level access, submit audits',
    GUEST: 'Read-only public data access'
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || u.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      FEDERAL_ADMIN: 'bg-red-100 text-red-800',
      STATE_ADMIN: 'bg-blue-100 text-blue-800',
      FACILITY_ADMIN: 'bg-green-100 text-green-800',
      GUEST: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#03543F]">Users Management</h1>
            <p className="text-slate-600 text-sm mt-1">Manage system users and access permissions</p>
          </div>
          <button
            onClick={onAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] transition-colors font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="FEDERAL_ADMIN">Federal Admin</option>
            <option value="STATE_ADMIN">State Admin</option>
            <option value="FACILITY_ADMIN">Facility Admin</option>
            <option value="GUEST">Guest</option>
          </select>

          <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
            <span className="font-semibold">{filteredUsers.length}</span>
            <span>users found</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 max-w-7xl mx-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        {user.phone && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {user.state && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{user.state}</span>
                          </div>
                        )}
                        {user.facility && (
                          <p className="text-slate-600 text-xs mt-1">{user.facility}</p>
                        )}
                        {!user.state && !user.facility && (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => onEditUser?.(user.id)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete user ${user.name}?`)) {
                              setUsers(users.filter(u => u.id !== user.id));
                              onDeleteUser?.(user.id);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Role Legend */}
        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Role Descriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(roleDescriptions).map(([role, description]) => (
              <div key={role} className="flex gap-3">
                <Shield className="w-5 h-5 text-[#057A55] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">{role.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-slate-600 mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
