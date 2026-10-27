/**
 * Users Manager
 * CRUD interface for managing system users
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { getStateOptions, getStateName } from '../utils/statesMapping';
import { Plus, Edit, Trash2, X, Save, AlertCircle, CheckCircle, Search, Download } from 'lucide-react';
import { User, UserRole } from '../types';

declare module 'react/jsx-runtime';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface UserForm {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  password?: string;
  confirmPassword?: string;
  facilityId?: string;
  stateName?: string;
  facility?: string;
  info?: string;
}

const UsersManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, facilities } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [form, setForm] = useState<UserForm>({
    id: '',
    name: '',
    role: UserRole.GUEST,
    email: '',
    password: '',
    confirmPassword: '',
    facilityId: '',
    stateName: '',
    facility: '',
    info: ''
  });

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !filterRole || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    try {
      if (!form.name || !form.role) {
        throw new Error('Please fill in all required fields');
      }

      // Validate password for new users
      if (!editingId && !form.password) {
        throw new Error('Password is required for new users');
      }

      // Validate password if provided
      if (form.password) {
        if (form.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      // Validate: FACILITY_USER must have a facility assigned
      if (form.role === UserRole.FACILITY_USER && !form.facilityId) {
        throw new Error('Facility User role requires a facility to be assigned');
      }

      let finalRole = form.role;
      
      // Auto-promote to FACILITY_USER if facility is assigned and not already a FACILITY_ADMIN
      if (form.facilityId && form.role !== UserRole.FACILITY_ADMIN) {
        finalRole = UserRole.FACILITY_USER;
      }

      const userData: any = {
        id: form.id || `user-${Date.now()}`,
        name: form.name,
        role: finalRole,
        email: form.email,
        ...(form.password && { password: form.password })
      };

      // Always include assigned facility/state if provided
      if (form.facilityId) {
        userData.facilityId = form.facilityId;
      }
      if (form.stateName) {
        userData.stateName = form.stateName;
      }

      if (editingId) {
        updateUser(editingId, userData);
        setMessage({ type: 'success', text: 'User updated successfully!' });
      } else {
        addUser(userData);
        setMessage({ type: 'success', text: 'User added successfully!' });
      }

      resetForm();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'An error occurred';
      setMessage({ type: 'error', text: errorText });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEdit = (user: User) => {
    setForm({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      password: '',
      confirmPassword: '',
      facilityId: user.facilityId,
      stateName: user.stateName
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        deleteUser(userId);
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete user' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      role: UserRole.GUEST,
      email: '',
      password: '',
      confirmPassword: '',
      facilityId: '',
      stateName: '',
      facility: '',
      info: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleExport = () => {
    try {
      const csv = [
        ['User ID', 'Name', 'Email', 'Role', 'Assignment'].join(','),
        ...filteredUsers.map(u => [
          u.id,
          `"${u.name}"`,
          u.email || '',
          getRoleLabel(u.role),
          u.facilityId ? `Facility: ${facilities.find(f => f.hfr_id === u.facilityId)?.name || u.facilityId}` : (u.stateName ? `State: ${u.stateName}` : '')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Federal Admin',
      [UserRole.FEDERAL_ADMIN]: 'Federal Admin',
      [UserRole.STATE_ADMIN]: 'State Admin',
      [UserRole.FACILITY_USER]: 'Facility User',
      [UserRole.FACILITY_ADMIN]: 'Facility Admin',
      [UserRole.VALIDATOR]: 'Validator',
      [UserRole.GUEST]: 'Guest'
    };
    return labels[role];
  };

  const stateOptions = getStateOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#03543F] mb-2">Users Management</h1>
            <p className="text-slate-600">Create, update, and manage system users and their roles</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#057A55] hover:bg-[#03543F] text-white rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#03543F]">
                  {editingId ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="e.g., John Okafor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Password <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={form.password || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                        placeholder="Enter a secure password"
                      />
                    </div>
                  )}
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirm Password <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                        placeholder="Confirm your password"
                      />
                    </div>
                  )}
                  {editingId && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Password (Leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={form.password || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                        placeholder="Leave blank if no change"
                      />
                    </div>
                  )}
                  {editingId && form.password && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirm New Password <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                        placeholder="Confirm new password"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Role <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                    >
                      <option value={UserRole.GUEST}>Guest (Read-only)</option>
                      <option value={UserRole.FACILITY_USER}>Facility User</option>
                      <option value={UserRole.VALIDATOR}>Validator</option>
                      <option value={UserRole.STATE_ADMIN}>State Admin</option>
                      <option value={UserRole.FACILITY_ADMIN}>Facility Admin</option>
                      <option value={UserRole.ADMIN}>Federal Admin</option>
                      <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                    </select>
                  </div>

                  {(form.role === UserRole.FACILITY_USER || form.role === UserRole.FACILITY_ADMIN || form.role === UserRole.SUPER_ADMIN) && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Assign Facility {form.role === UserRole.FACILITY_USER && <span className="text-red-600">*</span>}
                      </label>
                      <select
                        name="facilityId"
                        value={form.facilityId || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none ${
                          form.role === UserRole.FACILITY_USER && !form.facilityId 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-slate-300'
                        }`}
                      >
                        <option value="">Select a facility</option>
                        {facilities.map(f => (
                          <option key={f.hfr_id} value={f.hfr_id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                      {form.role === UserRole.FACILITY_USER && !form.facilityId && (
                        <p className="text-red-600 text-sm mt-1">A facility must be assigned for Facility User role</p>
                      )}
                    </div>
                  )}

                  {form.role === UserRole.VALIDATOR && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Assign Facility
                      </label>
                      <select
                        name="facility"
                        value={form.facility || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      >
                        <option value="">Select a facility</option>
                        {facilities.map(f => (
                          <option key={f.hfr_id} value={f.hfr_id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(form.role === UserRole.STATE_ADMIN || form.role === UserRole.SUPER_ADMIN) && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Assign State
                      </label>
                      <select
                        name="stateName"
                        value={form.stateName || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      >
                        <option value="">Select a state</option>
                        {stateOptions.map(state => (
                          <option key={state.code} value={state.code}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Info / Notes
                    </label>
                    <textarea
                      name="info"
                      value={form.info || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                      placeholder="Additional information about this user..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Role Permissions:</strong>
                  </p>
                  <p className="text-xs text-blue-800 mt-2">
                    {form.role === UserRole.SUPER_ADMIN && 'Full system access with server management, account administration, and system console access'}
                    {(form.role === UserRole.ADMIN || form.role === UserRole.FEDERAL_ADMIN) && 'Full system access including facility, user, and configuration management'}
                    {form.role === UserRole.STATE_ADMIN && 'Can view and manage audits for facilities in their assigned state'}
                    {form.role === UserRole.FACILITY_ADMIN && 'Can manage audits and view data for their assigned facility'}
                    {form.role === UserRole.VALIDATOR && 'Can validate and review audits at assigned facility'}
                    {form.role === UserRole.GUEST && 'Read-only access to public facility data and dashboards'}
                  </p>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 bg-[#057A55] hover:bg-[#03543F] text-white rounded-lg font-semibold transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
         {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Total Users</p>
            <p className="text-3xl font-bold text-[#057A55]">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Super Admins</p>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter(u => u.role === UserRole.SUPER_ADMIN).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Federal Admins</p>
            <p className="text-3xl font-bold text-[#057A55]">
              {users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.FEDERAL_ADMIN).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Facility Admins</p>
            <p className="text-3xl font-bold text-[#057A55]">
              {users.filter(u => u.role === UserRole.FACILITY_ADMIN).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Facility Users</p>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.role === UserRole.FACILITY_USER).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Validators</p>
            <p className="text-3xl font-bold text-[#057A55]">
              {users.filter(u => u.role === UserRole.VALIDATOR).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Guests</p>
            <p className="text-3xl font-bold text-[#057A55]">
              {users.filter(u => u.role === UserRole.GUEST).length}
            </p>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none"
              >
                <option value="">All Roles</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                <option value={UserRole.ADMIN}>Federal Admin</option>
                <option value={UserRole.FEDERAL_ADMIN}>Federal Admin</option>
                <option value={UserRole.STATE_ADMIN}>State Admin</option>
                <option value={UserRole.FACILITY_USER}>Facility User</option>
                <option value={UserRole.FACILITY_ADMIN}>Facility Admin</option>
                <option value={UserRole.VALIDATOR}>Validator</option>
                <option value={UserRole.GUEST}>Guest</option>
              </select>

              <button
                onClick={handleExport}
                disabled={filteredUsers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Assignment</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      {users.length === 0 ? 'No users found' : 'No users match your search'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-[#057A55] text-white rounded-full text-xs font-semibold">
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.facilityId && `Facility: ${facilities.find(f => f.hfr_id === user.facilityId)?.name || user.facilityId}`}
                        {user.stateName && `State: ${getStateName(user.stateName)}`}
                        {!user.facilityId && !user.stateName && '-'}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2 flex justify-center">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default UsersManager;
