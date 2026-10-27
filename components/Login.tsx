

/**
 * Login Component - NHERAMS
 * Two-column layout with branding on left and login form on right
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Loader, Heart, Trash2 } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clearAllSessions } from '../utils/sessionManager';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onRegisterClick, onForgotPasswordClick }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Check if error is about unverified email
  const isEmailVerificationError = error.includes('Email not verified') || error.includes('verification link');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed. Please check your credentials.');
      }

      const userData = await response.json();
      
      // Update auth context with user data - this will trigger navigation
      login(userData.user);
      
      // Call success callback
      onLoginSuccess(userData.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/users/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend verification email');
      }

      // Show success message
      setError('✅ Verification email sent! Please check your inbox and click the link to verify.');
      setResendCountdown(60);
      setResendLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column - Branding */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom right, #057A55, #03543F)'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <ShieldCheck className="w-16 h-16 text-[#057A55]" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">NHERAMS</h1>
          
          {/* Motto */}
          <p className="text-[#C99A2E] text-lg font-semibold mb-8">
            Nigerian Health Energy Resilience & Access Management System
          </p>

          {/* Description */}
          <div className="space-y-6 text-white max-w-sm">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-20">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Quality Healthcare</h3>
                <p className="text-sm text-green-100">
                  Improving health facilities across Nigeria through energy-resilient infrastructure
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-20">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Secure & Verified</h3>
                <p className="text-sm text-green-100">
                  Email-verified accounts with role-based access control
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-20">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Simple Access</h3>
                <p className="text-sm text-green-100">
                  Easy registration and login for all facility users
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-white border-opacity-20">
            <p className="text-sm text-green-100">
              © 2026 Federal Ministry of Health & Social Welfare
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div
                className="p-3 rounded-xl shadow-lg"
                style={{
                  background: 'linear-gradient(to bottom right, #057A55, #03543F)'
                }}
              >
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">NHERAMS</h1>
            <p className="text-[#057A55] text-xs mt-2 font-semibold">Nigerian Health Energy System</p>
          </div>

          {/* Form Container */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center md:text-left">Welcome Back</h2>
            <p className="text-slate-600 text-center md:text-left mb-8">Sign in to your account to continue</p>

            {error && (
              <div className={`mb-6 p-4 rounded-lg flex gap-3 border ${
                error.startsWith('✅') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  error.startsWith('✅') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    error.startsWith('✅') 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>{error}</p>
                  
                  {isEmailVerificationError && !error.startsWith('✅') && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading || resendCountdown > 0 || !formData.email}
                      className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                        resendCountdown > 0 || !formData.email || resendLoading
                          ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-60'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {resendLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : resendCountdown > 0 ? (
                        <>
                          ⏱️ Resend in {resendCountdown}s
                        </>
                      ) : (
                        <>
                          🔄 Resend Verification Email
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none text-sm font-medium transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-900">Password</label>
                  <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="text-xs font-semibold text-[#057A55] hover:text-[#045C41] transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none text-sm font-medium transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 py-3 px-4 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: loading
                    ? 'linear-gradient(to right, #057A55, #045C41)'
                    : 'linear-gradient(to right, #057A55, #045C41)',
                  backgroundSize: '200% 200%'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundPosition = '100% 0';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundPosition = '0% 0';
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-600 text-sm mb-4">Don't have an account?</p>
              <button
                type="button"
                onClick={onRegisterClick}
                className="w-full py-3 px-4 border-2 border-[#057A55] text-[#057A55] hover:bg-[#057A55] hover:text-white font-bold rounded-lg transition-all duration-200"
              >
                Create New Account
              </button>
            </div>

            {/* Clear Sessions - Admin/Development */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-xs mb-3">Development/Admin</p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all user sessions and reload? All logged-in users will be logged out.')) {
                    clearAllSessions();
                  }
                }}
                className="w-full py-2 px-4 border border-red-300 text-red-600 hover:bg-red-50 text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Sessions & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
