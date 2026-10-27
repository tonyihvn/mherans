/**
 * Email Verification Component - NHERAMS
 * Displays after user registration, guides user to verify email
 */

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onBackToLogin: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  email, 
  onVerificationComplete, 
  onBackToLogin 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      setSuccess(true);
      setTimeout(() => onVerificationComplete(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      setResendCountdown(60);
      setResendLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#057A55] to-[#03543F] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-600 mb-6">Your email has been successfully verified. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#057A55] to-[#03543F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <ShieldCheck className="w-8 h-8 text-[#057A55]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">NHERAMS</h1>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Verify Your Email</h2>
          <p className="text-sm text-slate-600 text-center mb-6">
            We've sent a verification link to<br />
            <strong>{email}</strong>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              Click the verification link sent to your email to confirm your account. The link expires in 24 hours.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Or enter your verification code:</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#057A55] focus:border-transparent outline-none text-sm"
                placeholder="Enter verification code"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !verificationCode}
              className="w-full py-3 px-4 bg-[#057A55] hover:bg-[#045C41] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-3">Didn't receive the email?</p>
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCountdown > 0}
              className="text-[#057A55] hover:text-[#045C41] font-bold text-sm disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : resendLoading
                ? 'Sending...'
                : 'Resend Verification Email'}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white text-xs mt-6">
          <p className="opacity-75">Check your spam folder if you don't see the verification email</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
