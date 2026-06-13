import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Mail, Lock, KeyRound, ShieldAlert, Check } from 'lucide-react';

const ResetPassword = () => {
  const { requestOTP, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = request, 2 = reset
  const [resetEmail, setResetEmail] = useState('');

  const { register: requestRegister, handleSubmit: handleRequestSubmit, formState: { errors: requestErrors } } = useForm();
  const { register: resetRegister, handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = useForm();

  const onRequestOtp = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await requestOTP(data.email, 'reset');
      if (result.success) {
        setResetEmail(data.email);
        setStep(2);
        setSuccess('Reset OTP sent successfully! Check your email inbox.');
      }
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await resetPassword(resetEmail, data.otp, data.newPassword);
      if (result.success) {
        setSuccess('Password updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-indigo-600 p-3 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-600/35 animate-pulse">
            <Code2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Account Password</h2>
          <p className="text-xs text-gray-400 mt-2 font-medium">Verify your email address to update details</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/35 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-400 text-xs">
            <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-950/35 border border-emerald-500/20 rounded-2xl flex items-start space-x-3 text-emerald-400 text-xs">
            <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestSubmit(onRequestOtp)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Account Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  {...requestRegister('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  })}
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
                />
              </div>
              {requestErrors.email && <span className="text-[11px] text-red-400 font-medium">{requestErrors.email.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl transition duration-300 shadow-lg shadow-indigo-600/20 active:translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Request Reset OTP</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
            {/* OTP input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Enter Reset OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="123456"
                  maxLength="6"
                  {...resetRegister('otp', { required: 'OTP code is required' })}
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
                />
              </div>
              {resetErrors.otp && <span className="text-[11px] text-red-400 font-medium">{resetErrors.otp.message}</span>}
            </div>

            {/* New Password input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Enter New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...resetRegister('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
                />
              </div>
              {resetErrors.newPassword && <span className="text-[11px] text-red-400 font-medium">{resetErrors.newPassword.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Remember credentials?{' '}
          <Link to="/login" className="text-brand-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
