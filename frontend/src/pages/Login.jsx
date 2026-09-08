import React, { useState } from 'react';
import { Store, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Background Decorative Gold Orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 text-charcoal-950 shadow-gold-md mb-3 ring-4 ring-gold-500/20">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            ZaynZulfikar<span className="text-gold-400">Store</span>
          </h1>
          <p className="text-charcoal-400 text-xs font-medium tracking-wider uppercase mt-1">
            Sistem Kasir & Manajemen Stok
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-charcoal-900/90 backdrop-blur-xl border border-charcoal-800 rounded-3xl p-7 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Masuk Administrator</h2>
            <p className="text-xs text-charcoal-400 mt-1">
              Silakan masukkan kredensial akun toko untuk melanjutkan
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs font-medium animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-300 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800 text-white placeholder-charcoal-600 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800 text-white placeholder-charcoal-600 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-500 hover:text-charcoal-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 hover:from-gold-400 hover:to-amber-500 text-charcoal-950 font-bold text-sm flex items-center justify-center gap-2 shadow-gold-md hover:shadow-gold-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Buka Sistem Toko</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


        </div>

        <p className="text-center text-charcoal-500 text-xs mt-6 font-medium">
          &copy; {new Date().getFullYear()} ZaynZulfikarStore. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
