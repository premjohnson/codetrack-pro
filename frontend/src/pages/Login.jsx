import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const redirectPath = location.state?.from?.pathname || '';

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        const role = result.data.user.role;
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else {
          navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-brand-primary p-3 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-primary/35 animate-pulse">
            <Code2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome to CodeTrack</h2>
          <p className="text-xs text-gray-400 mt-2 font-medium">Student Management & Coding Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/35 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-400 text-xs">
            <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              <input
                type="email"
                placeholder="you@domain.com"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                })}
                className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-300"
              />
            </div>
            {errors.email && <span className="text-[11px] text-red-400 font-medium">{errors.email.message}</span>}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              <Link to="/reset-password" className="text-xs font-bold text-brand-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-11 pr-4 py-3 bg-dark-bg/60 border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-300"
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
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          New student?{' '}
          <Link to="/register" className="text-brand-primary font-bold hover:underline">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
