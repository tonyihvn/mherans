/**
 * Roles and Permissions Management System
 * Allows Super Admin to configure RBAC for all app routes, pages, and components
 */

import React, { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, Edit2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
}

interface Permission {
  id: string;
  resource: string; // route, page, component, api endpoint
  action: string; // create, read, update, delete, execute
  granted: boolean;
}

interface RolePermissionConfig {
  roleId: string;
  resource: string;
  action: string;
  granted: boolean;
}

const AVAILABLE_RESOURCES = [
  'dashboard',
  'facility-map',
  'audit-form',
  'audits',
  'facilities',
  'users',
  'indicators',
  'audit-periods',
  'settings',
  'roles',
  'validators',
  'facility-dashboard'
];

const AVAILABLE_ACTIONS = ['create', 'read', 'update', 'delete', 'execute'];

const ROLES_PRESETS = [
  {
    name: 'Super Admin',
    description: 'Full access to all features and configurations',
    type: 'ADMIN',
    defaultPermissions: AVAILABLE_RESOURCES.flatMap(resource =>
      AVAILABLE_ACTIONS.map(action => ({
        resource,
        action,
        granted: true
      }))
    )
  },
  {
    name: 'Validator',
    description: 'Can view and comment on audits',
    type: 'VALIDATOR',
    defaultPermissions: [
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'audits', action: 'update', granted: true }, // for comments/remarks
      { resource: 'dashboard', action: 'read', granted: true },
      { resource: 'facility-map', action: 'read', granted: true }
    ]
  },
  {
    name: 'State User',
    description: 'Can view audits and facilities within assigned state',
    type: 'STATE_USER',
    defaultPermissions: [
      { resource: 'dashboard', action: 'read', granted: true },
      { resource: 'facility-map', action: 'read', granted: true },
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'facilities', action: 'read', granted: true }
    ]
  },
  {
    name: 'Facility User',
    description: 'Can view and edit audits for assigned facility',
    type: 'FACILITY_USER',
    defaultPermissions: [
      { resource: 'audit-form', action: 'read', granted: true },
      { resource: 'audit-form', action: 'update', granted: true },
      { resource: 'audit-form', action: 'create', granted: true },
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'dashboard', action: 'read', granted: true }
    ]
  },
  {
    name: 'Facility Admin',
    description: 'Full administrative access for assigned facility',
    type: 'FACILITY_ADMIN',
    defaultPermissions: [
      { resource: 'audit-form', action: 'create', granted: true },
      { resource: 'audit-form', action: 'read', granted: true },
      { resource: 'audit-form', action: 'update', granted: true },
      { resource: 'audit-form', action: 'delete', granted: true },
      { resource: 'audits', action: 'create', granted: true },
      { resource: 'audits', action: 'read', granted: true },
      { resource: 'audits', action: 'update', granted: true },
      { resource: 'audits', action: 'delete', granted: true },
      { resource: 'dashboard', action: 'read', granted: true },
      { resource: 'facility-dashboard', action: 'read', granted: true }
    ]
  }
];

const RolesPermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [showNotification, setShowNotification] = useState('');
  const [loading, setLoading] = useState(true);

  // Load roles from database on mount
  useEffect(() => {
    loadRolesFromDatabase();
  }, []);

  const loadRolesFromDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/user-roles', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Parse permissions from JSON strings
        const parsedRoles = data.map((role: any) => ({
          ...role,
          permissions: typeof role.permissions === 'string'
            ? JSON.parse(role.permissions || '{}')
            : role.permissions
        }));
        setRoles(parsedRoles);
        setSelectedRoleId(parsedRoles[0]?.id || null);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setShowNotification('❌ Error loading roles');
      setTimeout(() => setShowNotification(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  const togglePermission = (resourceId: string, action: string) => {
    if (!selectedRoleId) return;

    setRoles(roles.map(role => {
      if (role.id !== selectedRoleId) return role;

      return {
        ...role,
        permissions: role.permissions.map(perm => {
          if (perm.resource === resourceId && perm.action === action) {
            return { ...perm, granted: !perm.granted };
          }
          return perm;
        })
      };
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    setShowNotification('💾 Saving permissions...');
    try {
      const response = await fetch(`http://localhost:5000/api/user-roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: selectedRole.name,
          description: selectedRole.description,
          permissions: selectedRole.permissions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save permissions');
      }

      setShowNotification('✓ Permissions saved successfully');
      setTimeout(() => setShowNotification(''), 3000);
    } catch (error) {
      console.error('Error saving permissions:', error);
      setShowNotification('❌ Error saving permissions');
      setTimeout(() => setShowNotification(''), 4000);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (roleId === 'SUPER_ADMIN') {
      alert('Cannot delete Super Admin role');
      return;
    }
    if (!confirm('Are you sure you want to delete this role?')) return;

    setShowNotification('🗑️ Deleting role...');
    try {
      const response = await fetch(`http://localhost:5000/api/user-roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      setRoles(roles.filter(r => r.id !== roleId));
      setSelectedRoleId(roles.find(r => r.id !== roleId)?.id || null);
      setShowNotification('✓ Role deleted successfully');
      setTimeout(() => setShowNotification(''), 3000);
    } catch (error) {
      console.error('Error deleting role:', error);
      setShowNotification(`❌ ${error instanceof Error ? error.message : 'Error deleting role'}`);
      setTimeout(() => setShowNotification(''), 4000);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      alert('Please enter a role name');
      return;
    }

    const roleId = `role-${Date.now()}`;
    const newPermissions = AVAILABLE_RESOURCES.flatMap(resource =>
      AVAILABLE_ACTIONS.map(action => ({
        id: `${Date.now()}-${resource}-${action}`,
        resource,
        action,
        granted: false
      }))
    );

    setShowNotification('✨ Creating role...');
    try {
      const response = await fetch('http://localhost:5000/api/user-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: roleId,
          name: newRoleName,
          description: newRoleDescription,
          permissions: newPermissions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      const newRole: Role = {
        id: roleId,
        name: newRoleName,
        description: newRoleDescription,
        permissions: newPermissions,
        createdAt: new Date().toISOString()
      };

      setRoles([...roles, newRole]);
      setSelectedRoleId(roleId);
      setNewRoleName('');
      setNewRoleDescription('');
      setShowNotification('✓ Role created successfully');
      setTimeout(() => setShowNotification(''), 3000);
    } catch (error) {
      console.error('Error creating role:', error);
      setShowNotification('❌ Error creating role');
      setTimeout(() => setShowNotification(''), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-8 h-8 text-[#057A55]" />
            <h1 className="text-3xl font-bold text-slate-900">Roles & Permissions</h1>
          </div>
          <p className="text-slate-600">Configure role-based access control for all app features</p>
        </div>

        {/* Notification */}
        {showNotification && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-900 font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {showNotification}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles List Sidebar */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-fit">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-bold text-slate-900 mb-4">Roles</h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedRoleId === role.id
                        ? 'bg-[#057A55] text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-semibold text-sm">{role.name}</div>
                    <div className={`text-xs ${selectedRoleId === role.id ? 'text-white/75' : 'text-slate-500'}`}>
                      {role.permissions.filter(p => p.granted).length}/{role.permissions.length} permissions
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Role */}
            <div className="p-4 space-y-2 border-t border-slate-200">
              <input
                type="text"
                placeholder="Role name..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#057A55]"
              />
              <input
                type="text"
                placeholder="Description..."
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#057A55]"
              />
              <button
                onClick={handleAddRole}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045A40] transition-colors text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Role
              </button>
            </div>
          </div>

          {/* Permissions Matrix */}
          {selectedRole && (
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedRole.name}</h2>
                  <p className="text-sm text-slate-600">{selectedRole.description}</p>
                </div>
                {selectedRole.id !== 'ADMIN' && (
                  <button
                    onClick={() => handleDeleteRole(selectedRole.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete role"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Permissions Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Resource</th>
                      {AVAILABLE_ACTIONS.map(action => (
                        <th key={action} className="px-4 py-3 text-center font-semibold text-slate-900">
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {AVAILABLE_RESOURCES.map(resource => (
                      <tr key={resource} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{resource}</td>
                        {AVAILABLE_ACTIONS.map(action => {
                          const permission = selectedRole.permissions.find(
                            p => p.resource === resource && p.action === action
                          );
                          return (
                            <td key={`${resource}-${action}`} className="px-4 py-3 text-center">
                              <button
                                onClick={() => togglePermission(resource, action)}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                  permission?.granted
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                {permission?.granted && <CheckCircle className="w-4 h-4 text-white" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedRoleId(null)}
                  className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="flex items-center gap-2 px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045A40] transition-colors font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Save Permissions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsManager;
