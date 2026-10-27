/**
 * Forgot Password Component - NHERAMS
 * Allows users to reset their password via email verification
 */

import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

type ForgotPasswordStep = 'email' | 'reset' | 'success';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Request password reset email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      const data = await response.json();
      setMessage(data.message);
      setStep('reset');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
      setLoading(false);
    }
  };

  // Step 2: Reset password with token
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: resetToken,
          password 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      setStep('success');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#057A55] to-[#03543F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <ShieldCheck className="w-8 h-8 text-[#057A55]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NHERAMS</h1>
          <p className="text-[#C99A2E] text-xs mt-2 font-semibold">Nigerian Health Energy System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
              <p className="text-slate-600 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm font-semibold">{message}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none text-sm font-medium transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#057A55] to-[#045C41] hover:from-[#045C41] hover:to-[#033B2F] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Reset Password */}
          {step === 'reset' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Enter Reset Code</h2>
              <p className="text-slate-600 text-sm mb-6">
                Check your email for the reset code and enter your new password
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-5">
                {/* Reset Token/Code */}
                <div>
                  <label htmlFor="token" className="block text-sm font-semibold text-slate-900 mb-2">
                    Reset Code
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none text-sm font-medium transition-all"
                    placeholder="Paste the code from your email"
                    required
                  />
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none text-sm font-medium transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !resetToken || !password || !confirmPassword}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#057A55] to-[#045C41] hover:from-[#045C41] hover:to-[#033B2F] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful!</h2>
                <p className="text-slate-600 text-sm mb-6">
                  Your password has been reset successfully. You can now login with your new password.
                </p>

                <button
                  onClick={onBackToLogin}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#057A55] to-[#045C41] hover:from-[#045C41] hover:to-[#033B2F] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* Back Link */}
          {step !== 'success' && (
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="flex items-center justify-center gap-2 text-[#057A55] hover:text-[#045C41] font-semibold text-sm transition-colors w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
