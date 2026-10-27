

/**
 * App Settings Context
 * Manages application-wide settings including theme, colors, logo, and login text
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppSettings {
  theme: 'light' | 'dark';
  primaryColor: string;
  sidebarBgColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  menuTextColor?: string;
  logoUrl?: string;
  logoBase64?: string;
  loginPageTitle?: string;
  loginPageSubtitle?: string;
  loginPageDescription?: string;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  primaryColor: '#057A55',
  sidebarBgColor: '#057A55',
  headerBgColor: '#ffffff',
  headerTextColor: '#1f2937',
  buttonBgColor: '#057A55',
  buttonTextColor: '#ffffff',
  menuTextColor: '#ffffff',
  loginPageTitle: 'NHERAMS Dashboard',
  loginPageSubtitle: 'Healthcare Resilience & Sustainability Monitoring',
  loginPageDescription: 'Monitor and optimize healthcare facility energy resilience and sustainability'
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage and database on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply theme and color to document
  useEffect(() => {
    applyThemeAndColor();
  }, [settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Try to load from API first
      const response = await fetch(import.meta.env.VITE_API_URL + '/app-settings', {
        credentials: 'include'
      });

      if (response.ok) {
        const apiSettings = await response.json();

        // Transform API response to our format
        const transformedSettings: AppSettings = {
          theme: apiSettings['app-theme'] || defaultSettings.theme,
          primaryColor: apiSettings['app-primary-color'] || defaultSettings.primaryColor,
          sidebarBgColor: apiSettings['sidebar-bg-color'] || defaultSettings.sidebarBgColor,
          headerBgColor: apiSettings['header-bg-color'] || defaultSettings.headerBgColor,
          headerTextColor: apiSettings['header-text-color'] || defaultSettings.headerTextColor,
          buttonBgColor: apiSettings['button-bg-color'] || defaultSettings.buttonBgColor,
          buttonTextColor: apiSettings['button-text-color'] || defaultSettings.buttonTextColor,
          menuTextColor: apiSettings['menu-text-color'] || defaultSettings.menuTextColor,
          logoUrl: apiSettings['app-logo-url'],
          logoBase64: apiSettings['app-logo-base64'],
          loginPageTitle: apiSettings['login-page-title'] || defaultSettings.loginPageTitle,
          loginPageSubtitle: apiSettings['login-page-subtitle'] || defaultSettings.loginPageSubtitle,
          loginPageDescription: apiSettings['login-page-description'] || defaultSettings.loginPageDescription,
        };

        setSettings(transformedSettings);

        // Cache in localStorage - EXCLUDE logoBase64 to avoid quota issues
        const cachedSettings = { ...transformedSettings };
        delete (cachedSettings as any).logoBase64;
        try {
          localStorage.setItem('appSettings', JSON.stringify(cachedSettings));
        } catch (e) {
          console.warn('Failed to cache settings in localStorage:', e);
        }
      } else {
        // Fall back to localStorage
        const cached = localStorage.getItem('appSettings');
        if (cached) {
          setSettings(JSON.parse(cached));
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);

      // Try localStorage as fallback
      const cached = localStorage.getItem('appSettings');
      if (cached) {
        setSettings(JSON.parse(cached));
      }

      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const applyThemeAndColor = () => {
    // Apply theme
    const html = document.documentElement;
    if (settings.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Apply all colors as CSS variables
    const root = document.documentElement;
    const colors = {
      '--primary-color': settings.primaryColor,
      '--sidebar-bg-color': settings.sidebarBgColor,
      '--header-bg-color': settings.headerBgColor,
      '--header-text-color': settings.headerTextColor,
      '--button-bg-color': settings.buttonBgColor,
      '--button-text-color': settings.buttonTextColor,
      '--menu-text-color': settings.menuTextColor,
    };

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Create and inject dynamic styles
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --primary-color: ${settings.primaryColor};
        --sidebar-bg-color: ${settings.sidebarBgColor};
        --header-bg-color: ${settings.headerBgColor};
        --header-text-color: ${settings.headerTextColor};
        --button-bg-color: ${settings.buttonBgColor};
        --button-text-color: ${settings.buttonTextColor};
        --menu-text-color: ${settings.menuTextColor};
      }
    `;

    // Remove old style if it exists
    const oldStyle = document.getElementById('app-theme-style');
    if (oldStyle) {
      oldStyle.remove();
    }

    style.id = 'app-theme-style';
    document.head.appendChild(style);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      setLoading(true);
      const merged = { ...settings, ...newSettings };

      // Save each setting to API
      const savePromises: Promise<any>[] = [];

      const settingsMap: { [key: string]: string } = {
        theme: 'app-theme',
        primaryColor: 'app-primary-color',
        sidebarBgColor: 'sidebar-bg-color',
        headerBgColor: 'header-bg-color',
        headerTextColor: 'header-text-color',
        buttonBgColor: 'button-bg-color',
        buttonTextColor: 'button-text-color',
        menuTextColor: 'menu-text-color',
        logoBase64: 'app-logo-base64',
        loginPageTitle: 'login-page-title',
        loginPageSubtitle: 'login-page-subtitle',
        loginPageDescription: 'login-page-description',
      };

      Object.entries(newSettings).forEach(([key, value]) => {
        const settingKey = settingsMap[key];
        if (settingKey && value !== undefined) {
          savePromises.push(
            fetch(import.meta.env.VITE_API_URL + '/app-settings/${settingKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ value })
            })
          );
        }
      });

      await Promise.all(savePromises);

      // Update local state
      setSettings(merged);

      // Cache in localStorage - EXCLUDE logoBase64 to avoid quota issues
      const cachedSettings = { ...merged };
      delete (cachedSettings as any).logoBase64;
      try {
        localStorage.setItem('appSettings', JSON.stringify(cachedSettings));
      } catch (e) {
        console.warn('Failed to cache settings in localStorage:', e);
      }

      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, loading, error }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};
