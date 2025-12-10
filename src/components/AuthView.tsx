import React, { useState } from 'react';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

export function AuthView() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(getErrorMessage(signInError.message));
        }
      } else if (mode === 'register') {
        if (password.length < 6) {
          setError('Passwort muss mindestens 6 Zeichen haben.');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          setError(getErrorMessage(signUpError.message));
        } else {
          setMessage('Bestätigungsmail gesendet! Bitte prüfe dein Postfach.');
          setMode('login');
        }
      } else if (mode === 'reset') {
        const { error: resetError } = await resetPassword(email);
        if (resetError) {
          setError(getErrorMessage(resetError.message));
        } else {
          setMessage('Link zum Zurücksetzen wurde gesendet!');
          setMode('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
    if (message.includes('Invalid login')) return 'E-Mail oder Passwort falsch.';
    if (message.includes('already registered')) return 'E-Mail bereits registriert.';
    if (message.includes('valid email')) return 'Bitte gültige E-Mail eingeben.';
    return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
            <span className="text-2xl">🔥</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Kalorien Tracker</h1>
          <p className="text-slate-500 mt-1">
            {mode === 'login' && 'Willkommen zurück!'}
            {mode === 'register' && 'Erstelle deinen Account'}
            {mode === 'reset' && 'Passwort zurücksetzen'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm">
              {message}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Anmelden'}
                  {mode === 'register' && 'Registrieren'}
                  {mode === 'reset' && 'Link senden'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Mode Switchers */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-center text-sm">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Noch kein Account? <span className="font-semibold">Registrieren</span>
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Passwort vergessen?
                </button>
              </>
            )}

            {mode === 'register' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-600 hover:text-slate-900"
              >
                Bereits registriert? <span className="font-semibold">Anmelden</span>
              </button>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-600 hover:text-slate-900"
              >
                ← Zurück zur Anmeldung
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
