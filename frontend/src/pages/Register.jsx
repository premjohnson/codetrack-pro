import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Mail, Lock, User, ShieldAlert, Check } from 'lucide-react';

const Register = () => {
  const { register: authRegister, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm();

  const onRegisterSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await authRegister(data.name, data.email, data.password);
      if (result.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onOtpVerify = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await verifyOTP(registeredEmail, data.otp, 'verification');
      if (result.success) {
        setSuccess('Account verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-indigo-600 p-3 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-600/35 animate-pulse">
            <Code2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Student Account</h2>
          <p className="text-xs text-gray-400 mt-2 font-medium">Register to begin coding and tracking progress</p>
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

        {!showOtpScreen ? (
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
                />
              </div>
              {errors.name && <span className="text-[11px] text-red-400 font-medium">{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="email"
                  placeholder="student@domain.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  })}
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
                />
              </div>
              {errors.email && <span className="text-[11px] text-red-400 font-medium">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                    validate: {
                      hasUppercase: (value) => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                      hasLowercase: (value) => /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                      hasNumber: (value) => /[0-9]/.test(value) || 'Password must contain at least one number',
                      hasSpecial: (value) => /[@$!%*?&#]/.test(value) || 'Password must contain at least one special character'
                    }
                  })}
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
                />
              </div>
              {errors.password && <span className="text-[11px] text-red-400 font-medium">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl transition duration-300 shadow-lg shadow-indigo-600/20 active:translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit(onOtpVerify)} className="space-y-5">
            {/* OTP Code input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Enter Verification OTP</label>
              <input
                type="text"
                placeholder="123456"
                maxLength="6"
                {...registerOtp('otp', { 
                  required: 'OTP is required',
                  pattern: { value: /^[0-9]{6}$/, message: 'OTP must be exactly 6 digits' }
                })}
                className="w-full tracking-[1.5em] text-center font-bold font-mono py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-lg focus:outline-none focus:border-indigo-500 transition duration-300"
              />
              {otpErrors.otp && <span className="text-[11px] text-red-400 font-medium block text-center">{otpErrors.otp.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Verify & Activate</span>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
