'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChefHat, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../../../lib/api';
import { setAuth, redirectByRole } from '../../../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setAuth(res.data.data.token, res.data.data.user);
        router.push(redirectByRole(res.data.data.user.role));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white/20 rounded-full" />
          <div className="absolute bottom-40 right-20 w-96 h-96 border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-white/10 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-white/60 text-sm font-medium tracking-widest uppercase">
                Restaurant Management
              </span>
            </div>

            <h1 className="text-5xl font-display text-white leading-tight mb-6">
              Elevated<br />
              <span className="text-amber-400">Dining</span> Experience
            </h1>

            <p className="text-white/50 text-lg max-w-md leading-relaxed">
              Streamline your restaurant operations with our intuitive management system.
            </p>
          </motion.div>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-[#FAFAF9]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
            <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-stone-600 font-display text-xl">Restaurant</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display text-stone-900 mb-2">Welcome back</h2>
            <p className="text-stone-500">Sign in to continue to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg focus-within:border-[var(--role,var(--admin))] focus-within:ring-2 focus-within:ring-[var(--role-light,var(--admin-light))] focus-within:outline-none transition-all duration-200">
                <Mail className="w-5 h-5 text-stone-400 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-stone-900 placeholder:text-gray-400"
                  placeholder="you@restaurant.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Password
              </label>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg focus-within:border-[var(--role,var(--admin))] focus-within:ring-2 focus-within:ring-[var(--role-light,var(--admin-light))] focus-within:outline-none transition-all duration-200">
                <Lock className="w-5 h-5 text-stone-400 flex-shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-stone-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-10 p-5 bg-stone-50 rounded-xl border border-stone-100">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              Demo Accounts
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-stone-600">
                <span className="font-medium">Admin:</span> admin@restaurant.com
              </p>
              <p className="text-stone-600">
                <span className="font-medium">Waiter:</span> waiter1@restaurant.com
              </p>
              <p className="text-stone-600">
                <span className="font-medium">Kitchen:</span> kitchen@restaurant.com
              </p>
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Password for all: admin123 / waiter123 / kitchen123
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}