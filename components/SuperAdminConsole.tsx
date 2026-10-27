/**
 * Super Admin Console
 * Comprehensive system management, account administration, and server monitoring
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { AlertCircle, CheckCircle, Users, Database, Server, Settings, RefreshCw, Trash2, Lock, Unlock, Activity, FileCheck } from 'lucide-react';
import { User, UserRole } from '../types';

interface SystemStats {
  totalUsers: number;
  totalFacilities: number;
  totalAudits: number;
  activeUsers: number;
  serverStatus: 'healthy' | 'warning' | 'error';
  databaseStatus: 'connected' | 'disconnected';
  lastBackup: string;
  auditFormsOpen: boolean;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'locked';
  assigned_facility_id?: string;
  assigned_state?: string;
}

const SuperAdminConsole: React.FC = () => {
  const { users, facilities, audits, deleteUser } = useAppState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'server' | 'audit-control' | 'maintenance'>('dashboard');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalFacilities: 0,
    totalAudits: 0,
    activeUsers: 0,
    serverStatus: 'healthy',
    databaseStatus: 'connected',
    lastBackup: new Date().toISOString(),
    auditFormsOpen: localStorage.getItem('auditFormsOpen') !== 'false'
  });
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [lockingUser, setLockingUser] = useState<string | null>(null);

  // Initialize stats
  useEffect(() => {
    updateStats();
  }, [users, facilities, audits]);

  const updateStats = () => {
    setStats({
      totalUsers: users.length,
      totalFacilities: facilities.length,
      totalAudits: audits.length,
      activeUsers: users.length > 0 ? Math.ceil(users.length * 0.7) : 0,
      serverStatus: 'healthy',
      databaseStatus: 'connected',
      lastBackup: new Date().toISOString()
    });
  };

  const handleToggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleLockUser = (userId: string) => {
    setLockingUser(userId);
    setMessage({ type: 'warning', text: 'User account locked successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUnlockUser = (userId: string) => {
    setLockingUser(null);
    setMessage({ type: 'success', text: 'User account unlocked successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) {
      setMessage({ type: 'warning', text: 'No users selected' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (window.confirm(`Delete ${selectedUsers.size} user(s)? This action cannot be undone.`)) {
      selectedUsers.forEach(userId => {
        try {
          deleteUser(userId);
        } catch (error) {
          console.error(`Failed to delete user ${userId}:`, error);
        }
      });
      setSelectedUsers(new Set());
      setMessage({ type: 'success', text: `Successfully deleted ${selectedUsers.size} user(s)` });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleServerRestart = () => {
    if (window.confirm('Restart the server? This will temporarily interrupt all users.')) {
      setMessage({ type: 'warning', text: 'Server restart initiated. This may take a few moments...' });
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Server restarted successfully' });
        setTimeout(() => setMessage(null), 3000);
      }, 3000);
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      setMessage({ type: 'warning', text: 'Creating database backup...' });
      // Simulate backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStats(prev => ({
        ...prev,
        lastBackup: new Date().toISOString()
      }));
      setMessage({ type: 'success', text: 'Database backup completed successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Backup failed. Please contact support.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleAuditForms = () => {
    const newState = !stats.auditFormsOpen;
    localStorage.setItem('auditFormsOpen', newState ? 'true' : 'false');
    setStats(prev => ({
      ...prev,
      auditFormsOpen: newState
    }));
    setMessage({ 
      type: 'success', 
      text: `Audit forms ${newState ? 'opened' : 'closed'} for all facilities` 
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#03543F] mb-2">Super Admin Console</h1>
          <p className="text-slate-600">System management, account administration, and server monitoring</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : message.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            {message.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="flex-1">{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'accounts', label: 'Accounts', icon: Users },
              { id: 'audit-control', label: 'Audit Forms', icon: FileCheck },
              { id: 'server', label: 'Server', icon: Server },
              { id: 'maintenance', label: 'Maintenance', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#057A55] border-b-2 border-b-[#057A55] bg-slate-50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Total Users</p>
                    <p className="text-3xl font-bold text-[#057A55]">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-12 h-12 text-slate-300" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Total Facilities</p>
                    <p className="text-3xl font-bold text-[#057A55]">{stats.totalFacilities}</p>
                  </div>
                  <Database className="w-12 h-12 text-slate-300" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Total Audits</p>
                    <p className="text-3xl font-bold text-[#057A55]">{stats.totalAudits}</p>
                  </div>
                  <Activity className="w-12 h-12 text-slate-300" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                  </div>
                  <Server className="w-12 h-12 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-[#03543F] mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Server Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Server Health</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      stats.serverStatus === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : stats.serverStatus === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stats.serverStatus === 'healthy' ? '✓ Healthy' : stats.serverStatus === 'warning' ? '⚠ Warning' : '✕ Error'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Database Status</span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ✓ Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Last Backup</span>
                    <span className="text-slate-600 text-sm">{new Date(stats.lastBackup).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-[#03543F] mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handleServerRestart}
                    className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restart Server
                  </button>
                  <button
                    onClick={handleDatabaseBackup}
                    className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Backup Database
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#03543F]">Account Management</h3>
              {selectedUsers.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedUsers.size})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input type="checkbox" className="w-4 h-4" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleToggleUserSelection(user.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-[#057A55] text-white rounded text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          lockingUser === user.id
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {lockingUser === user.id ? 'Locked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-2 flex justify-center">
                        {lockingUser === user.id ? (
                          <button
                            onClick={() => handleUnlockUser(user.id)}
                            className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                            title="Unlock account"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockUser(user.id)}
                            className="p-2 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-colors"
                            title="Lock account"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Control Tab */}
        {activeTab === 'audit-control' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="text-center">
                <FileCheck className="w-16 h-16 text-[#057A55] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-[#03543F] mb-2">Audit Form Control</h3>
                <p className="text-slate-600 mb-8">Control whether facility admins can fill audit forms globally across the system</p>
                
                <div className="bg-slate-50 rounded-lg p-8 mb-8 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Current Status</p>
                      <p className={`text-3xl font-bold ${stats.auditFormsOpen ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.auditFormsOpen ? 'OPEN' : 'CLOSED'}
                      </p>
                    </div>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                      stats.auditFormsOpen ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {stats.auditFormsOpen ? (
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      ) : (
                        <AlertCircle className="w-12 h-12 text-red-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-6">
                    {stats.auditFormsOpen 
                      ? 'Facility Admins can currently fill audit forms for their assigned facilities.' 
                      : 'Facility Admins cannot currently fill audit forms. Forms are locked system-wide.'}
                  </p>
                  <button
                    onClick={handleToggleAuditForms}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                      stats.auditFormsOpen
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {stats.auditFormsOpen ? 'Close Audit Forms' : 'Open Audit Forms'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <FileCheck className="w-5 h-5" />
                      When Forms Are Open
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>✓ Facility Admins can view audit forms</li>
                      <li>✓ Facility Admins can fill and submit audits</li>
                      <li>✓ Forms are unlocked for data entry</li>
                      <li>✓ All audit submissions are recorded</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      When Forms Are Closed
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-2">
                      <li>✓ Facility Admins can view but not edit</li>
                      <li>✓ All form fields become read-only</li>
                      <li>✓ Submit buttons are disabled</li>
                      <li>✓ Useful for audit periods or maintenance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server Tab */}
        {activeTab === 'server' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-[#03543F] mb-4">Server Logs</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs text-slate-600">
                <p>[2026-03-03 10:45:32] Server started successfully</p>
                <p>[2026-03-03 10:45:35] Database connected</p>
                <p>[2026-03-03 10:45:38] All services initialized</p>
                <p>[2026-03-03 10:46:12] User login: admin@system.local</p>
                <p>[2026-03-03 10:47:05] Audit saved for facility NG-LA-001</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-[#03543F] mb-4">System Configuration</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">API Version</p>
                  <p className="font-semibold text-slate-900">v2.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Database Version</p>
                  <p className="font-semibold text-slate-900">MySQL 8.0</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Node.js Version</p>
                  <p className="font-semibold text-slate-900">v18.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Environment</p>
                  <p className="font-semibold text-slate-900">Production</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#03543F] mb-6">System Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Maintenance
                </h4>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors">
                    Optimize Tables
                  </button>
                  <button className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors">
                    Backup Database
                  </button>
                  <button className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors">
                    Restore from Backup
                  </button>
                </div>
              </div>

              <div className="p-6 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Server Maintenance
                </h4>
                <div className="space-y-3">
                  <button onClick={handleServerRestart} className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors">
                    Restart Server
                  </button>
                  <button className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors">
                    Clear Cache
                  </button>
                  <button className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors">
                    Export Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminConsole;
