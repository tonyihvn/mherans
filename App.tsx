

/**
 * NHERAMS App - Main Application Component
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StateProvider } from './context/StateContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Registration from './components/Registration';
import EmailVerification from './components/EmailVerification';
import EmailVerificationPage from './components/EmailVerificationPage';
import RoleBasedDashboard from './components/RoleBasedDashboardLayout';
import FacilityAdminDashboard from './components/FacilityAdminDashboard';
import AuditFormWrapper from './components/AuditFormWrapper';
import AuditSeedingPage from './components/AuditSeedingPage';
import UsersManager from './components/UsersManager';
import FacilitiesManager from './components/FacilitiesManager';
import SuperAdminConsole from './components/SuperAdminConsole';

interface AppContentProps {
  onLogout: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ onLogout }) => {
  const { user, isLoading, logout } = useAuth();
  const [authFlow, setAuthFlow] = useState<'login' | 'register' | 'email_verification' | 'forgot_password'>('login');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleLogout = () => {
    logout();
    onLogout();
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #057A55 0%, #03543F 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
      }}>
        <div style={{textAlign: 'center', color: 'white'}}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authFlow === 'login' && (
          <Login
            onSwitchToRegister={() => setAuthFlow('register')}
            onSwitchToForgotPassword={() => setAuthFlow('forgot_password')}
            onLoginSuccess={() => {}}
          />
        )}
        {authFlow === 'register' && (
          <Registration
            onSwitchToLogin={() => setAuthFlow('login')}
            onRegistrationSuccess={(email) => {
              setRegisteredEmail(email);
              setAuthFlow('email_verification');
            }}
          />
        )}
        {authFlow === 'email_verification' && (
          <EmailVerification
            email={registeredEmail}
            onVerificationSuccess={() => setAuthFlow('login')}
            onSwitchToLogin={() => setAuthFlow('login')}
          />
        )}
        {authFlow === 'forgot_password' && (
          <ForgotPassword onSwitchToLogin={() => setAuthFlow('login')} />
        )}
      </>
    );
  }

  return (
    <Routes>
      <Route path="/email-verification" element={<EmailVerificationPage />} />
      <Route path="/dashboard" element={<RoleBasedDashboard onLogout={handleLogout} />} />
      <Route path="/facility/:facilityId/dashboard" element={<RoleBasedDashboard onLogout={handleLogout} initialPage="facilityDashboard" />} />
      <Route path="/facility-admin" element={<FacilityAdminDashboard onLogout={handleLogout} />} />
      <Route path="/audit-form/:facilityId" element={<AuditFormWrapper />} />
      <Route path="/audit-form" element={<AuditFormWrapper />} />
      <Route path="/audit-seeding" element={<AuditSeedingPage />} />
      <Route path="/users" element={<UsersManager />} />
      <Route path="/facilities" element={<FacilitiesManager />} />
      <Route path="/super-admin" element={<SuperAdminConsole />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <StateProvider>
      <AppSettingsProvider>
        <AuthProvider>
          <Router>
            <AppContent onLogout={() => window.location.reload()} />
          </Router>
        </AuthProvider>
      </AppSettingsProvider>
    </StateProvider>
  );
};

export default App;
