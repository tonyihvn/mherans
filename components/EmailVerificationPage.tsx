

/**
 * Email Verification Page - NHERAMS
 * Handles email verification when user clicks the link from email
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No verification token provided');
          setLoading(false);
          return;
        }

        const response = await fetch(import.meta.env.VITE_API_URL + '/users/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Verification failed');
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLoading(false);

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

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
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {loading ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Email</h2>
              <p className="text-slate-600">Please wait while we confirm your email address...</p>
            </>
          ) : success ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
              <p className="text-slate-600 mb-6">Your email has been successfully verified. You can now log in to your account.</p>
              <p className="text-sm text-slate-500 animate-pulse">Redirecting to login page...</p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
              <p className="text-red-600 mb-6 text-sm">{error}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-2 px-4 bg-[#057A55] hover:bg-[#045C41] text-white font-bold rounded-lg transition-all"
              >
                Back to Login
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-white text-xs mt-6">
          <p className="opacity-75">NHERAMS Pilot Portal</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
