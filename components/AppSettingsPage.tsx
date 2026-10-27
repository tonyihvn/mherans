/**
 * App Settings Page - Centralized configuration for Super Admin
 * All settings saved to database via API
 */

import React, { useState, useEffect } from 'react';
import { Settings, Palette, FileText, Gauge, Cog, Loader, Upload, X } from 'lucide-react';
import AdminIndicatorEditorModal from './AdminIndicatorEditorModal';
import AdminAuditFormBuilder from './AdminAuditFormBuilder';
import { useAppSettings } from '../context/AppSettingsContext';

type SettingsTab = 'appearance' | 'loginPage' | 'auditForm' | 'indicators' | 'system';

const AppSettingsPage: React.FC = () => {
  const { settings, updateSettings, loading: contextLoading } = useAppSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState('#057A55');
  const [headerBgColor, setHeaderBgColor] = useState('#ffffff');
  const [headerTextColor, setHeaderTextColor] = useState('#1f2937');
  const [sidebarBgColor, setSidebarBgColor] = useState('#057A55');
  const [buttonBgColor, setButtonBgColor] = useState('#057A55');
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
  const [menuTextColor, setMenuTextColor] = useState('#ffffff');
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [loginPageTitle, setLoginPageTitle] = useState('');
  const [loginPageSubtitle, setLoginPageSubtitle] = useState('');
  const [loginPageDescription, setLoginPageDescription] = useState('');
  const [showNotification, setShowNotification] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from context on mount
  useEffect(() => {
    if (settings) {
      setTheme(settings.theme);
      setPrimaryColor(settings.primaryColor);
      setHeaderBgColor(settings.headerBgColor || '#ffffff');
      setHeaderTextColor(settings.headerTextColor || '#1f2937');
      setSidebarBgColor(settings.sidebarBgColor || '#057A55');
      setButtonBgColor(settings.buttonBgColor || '#057A55');
      setButtonTextColor(settings.buttonTextColor || '#ffffff');
      setMenuTextColor(settings.menuTextColor || '#ffffff');
      setLogoBase64(settings.logoBase64 || '');
      setLoading(false);
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      setLogoBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    try {
      const updates: any = {};
      if (settings.theme !== theme) updates.theme = theme;
      if (settings.primaryColor !== primaryColor) updates.primaryColor = primaryColor;
      if (settings.headerBgColor !== headerBgColor) updates.headerBgColor = headerBgColor;
      if (settings.headerTextColor !== headerTextColor) updates.headerTextColor = headerTextColor;
      if (settings.sidebarBgColor !== sidebarBgColor) updates.sidebarBgColor = sidebarBgColor;
      if (settings.buttonBgColor !== buttonBgColor) updates.buttonBgColor = buttonBgColor;
      if (settings.buttonTextColor !== buttonTextColor) updates.buttonTextColor = buttonTextColor;
      if (settings.menuTextColor !== menuTextColor) updates.menuTextColor = menuTextColor;
      if (settings.logoBase64 !== logoBase64) updates.logoBase64 = logoBase64;

      if (Object.keys(updates).length > 0) {
        await updateSettings(updates);
      }

      setShowNotification('✓ Appearance settings saved');
      setTimeout(() => setShowNotification(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save settings';
      setShowNotification(`❌ Error: ${errorMsg}`);
      setTimeout(() => setShowNotification(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLoginPage = async () => {
    setSaving(true);
    try {
      const updates: any = {};
      if (settings.loginPageTitle !== loginPageTitle) updates.loginPageTitle = loginPageTitle;
      if (settings.loginPageSubtitle !== loginPageSubtitle) updates.loginPageSubtitle = loginPageSubtitle;
      if (settings.loginPageDescription !== loginPageDescription) updates.loginPageDescription = loginPageDescription;

      if (Object.keys(updates).length > 0) {
        await updateSettings(updates);
      }

      setShowNotification('✓ Login page settings saved');
      setTimeout(() => setShowNotification(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save settings';
      setShowNotification(`❌ Error: ${errorMsg}`);
      setTimeout(() => setShowNotification(''), 4000);
    } finally {
      setSaving(false);
    }
  }

  const handleSaveAuditForm = async (fields: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/audit-form-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fields })
      });

      if (!response.ok) throw new Error('Failed to save audit form configuration');

      setShowNotification('✓ Audit form fields saved to database');
      setTimeout(() => setShowNotification(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save audit form';
      setShowNotification(`❌ Error: ${errorMsg}`);
      setTimeout(() => setShowNotification(''), 4000);
      throw error;
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'loginPage', label: 'Login Page', icon: FileText },
    { id: 'auditForm', label: 'Audit Form', icon: FileText },
    { id: 'indicators', label: 'Indicators', icon: Gauge },
    { id: 'system', label: 'System', icon: Cog }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-[#057A55]" />
            <h1 className="text-3xl font-bold text-slate-900">App Settings</h1>
          </div>
          <p className="text-slate-600">Configure application-wide settings and preferences</p>
        </div>

        {/* Notification */}
        {showNotification && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-900 font-medium">
            {showNotification}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 bg-white rounded-lg p-1 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#057A55] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Appearance Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Choose the application color scheme</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Used for buttons, links, and highlights</p>
                </div>

                {/* Header Background Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Header Background Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={headerBgColor}
                      onChange={(e) => setHeaderBgColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={headerBgColor}
                      onChange={(e) => setHeaderBgColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Color for the top navigation bar</p>
                </div>

                {/* Header Text Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Header Text Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={headerTextColor}
                      onChange={(e) => setHeaderTextColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={headerTextColor}
                      onChange={(e) => setHeaderTextColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Text color for the top navigation bar</p>
                </div>

                {/* Sidebar Background Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Sidebar Background Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={sidebarBgColor}
                      onChange={(e) => setSidebarBgColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={sidebarBgColor}
                      onChange={(e) => setSidebarBgColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Color for the left sidebar navigation</p>
                </div>

                {/* Button Background Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Button Background Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={buttonBgColor}
                      onChange={(e) => setButtonBgColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonBgColor}
                      onChange={(e) => setButtonBgColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Background color for all action buttons</p>
                </div>

                {/* Button Text Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Button Text Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Text color for all action buttons</p>
                </div>

                {/* Menu Text Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Menu Text Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={menuTextColor}
                      onChange={(e) => setMenuTextColor(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={menuTextColor}
                      onChange={(e) => setMenuTextColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55] font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Text color for sidebar and menu items</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Application Logo
                  </label>
                  <div className="flex items-start gap-4">
                    {logoBase64 && (
                      <div className="relative">
                        <img
                          src={logoBase64}
                          alt="Logo preview"
                          className="w-24 h-24 object-contain bg-slate-100 rounded-lg border border-slate-300"
                        />
                        <button
                          onClick={() => setLogoBase64('')}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="logo-input"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo-input"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Logo</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-2">PNG, JPG, or SVG (max 2MB)</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveAppearance}
                  disabled={saving || loading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#057A55] text-white font-semibold rounded-lg hover:bg-[#045A40] disabled:bg-slate-400 transition-colors"
                >
                  {saving && <Loader className="w-4 h-4 animate-spin" />}
                  {loading ? 'Loading...' : 'Save Appearance Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Login Page Tab */}
          {activeTab === 'loginPage' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Login Page Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={loginPageTitle}
                    onChange={(e) => setLoginPageTitle(e.target.value)}
                    placeholder="e.g., NHERAMS Dashboard"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                  />
                  <p className="text-xs text-slate-500 mt-1">Main heading on login page</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Page Subtitle
                  </label>
                  <input
                    type="text"
                    value={loginPageSubtitle}
                    onChange={(e) => setLoginPageSubtitle(e.target.value)}
                    placeholder="e.g., Healthcare Resilience & Sustainability Monitoring"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                  />
                  <p className="text-xs text-slate-500 mt-1">Secondary heading on login page</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Page Description
                  </label>
                  <textarea
                    value={loginPageDescription}
                    onChange={(e) => setLoginPageDescription(e.target.value)}
                    placeholder="e.g., Monitor and optimize healthcare facility energy resilience and sustainability"
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057A55]"
                  />
                  <p className="text-xs text-slate-500 mt-1">Description text on login page</p>
                </div>

                <button
                  onClick={handleSaveLoginPage}
                  disabled={saving || loading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#057A55] text-white font-semibold rounded-lg hover:bg-[#045A40] disabled:bg-slate-400 transition-colors"
                >
                  {saving && <Loader className="w-4 h-4 animate-spin" />}
                  {loading ? 'Loading...' : 'Save Login Page Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Audit Form Tab */}
          {activeTab === 'auditForm' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Audit Form Configuration</h2>
              <p className="text-slate-600">Customize audit form fields and structure</p>

              <button
                onClick={() => setShowFormBuilder(true)}
                className="px-6 py-3 bg-[#057A55] text-white font-semibold rounded-lg hover:bg-[#045A40] transition-colors flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Edit Audit Form Fields
              </button>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Current Status</h3>
                <p className="text-sm text-slate-600">
                  Click the button above to add, edit, or remove audit form fields.
                  You can customize field types, validation rules, and which audit sections they belong to.
                </p>
              </div>
            </div>
          )}

          {/* Indicators Tab */}
          {activeTab === 'indicators' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Indicator Configuration</h2>
              <p className="text-slate-600">Configure global indicator calculation factors</p>

              <button
                onClick={() => setShowIndicatorModal(true)}
                className="px-6 py-3 bg-[#057A55] text-white font-semibold rounded-lg hover:bg-[#045A40] transition-colors flex items-center gap-2"
              >
                <Gauge className="w-5 h-5" />
                Edit Indicator Factors
              </button>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Global Factors</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Diesel Consumption Factor</li>
                  <li>• Grid Electricity Factor</li>
                  <li>• Waste Incineration Factor</li>
                  <li>• Energy Resilience Threshold</li>
                </ul>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Application Name</span>
                  <span className="text-sm text-slate-600">NHERAMS v1.0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Environment</span>
                  <span className="text-sm text-slate-600">Production</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Database</span>
                  <span className="text-sm text-slate-600">MySQL 8.0+</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-slate-900">API Version</span>
                  <span className="text-sm text-slate-600">v1.0</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Info:</strong> System settings are managed through environment variables.
                  Contact your system administrator to modify core system configuration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showIndicatorModal && (
        <AdminIndicatorEditorModal onClose={() => setShowIndicatorModal(false)} />
      )}
      {showFormBuilder && (
        <AdminAuditFormBuilder
          isOpen={showFormBuilder}
          onClose={() => setShowFormBuilder(false)}
          onSave={handleSaveAuditForm}
        />
      )}
    </div>
  );
};

export default AppSettingsPage;
