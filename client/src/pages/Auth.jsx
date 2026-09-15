import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api.js';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateUsername = (v) => {
    setError('');
    setUsername(v);
  };
  const updatePassword = (v) => {
    setError('');
    setPassword(v);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/api/auth/${mode}`, {
        username: username.trim(),
        password,
      });
      localStorage.setItem('st_token', data.token);
      localStorage.setItem('st_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-6">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-smoke/80 p-8 backdrop-blur">
        <h1 className="font-display text-2xl uppercase tracking-widest text-white">
          {mode === 'login' ? 'Sign In' : 'Create Identity'}
        </h1>
        <p className="mt-1 text-sm text-white/40">No email. No real name. Ever.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => updateUsername(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-asphalt px-4 py-3 text-white placeholder-white/30 outline-none focus:border-neon-cyan"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-asphalt px-4 py-3 text-white placeholder-white/30 outline-none focus:border-neon-cyan"
            required
          />
          {error && <p className="text-sm text-neon-orange">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="font-display w-full rounded-md bg-neon-purple py-3 text-sm font-semibold uppercase tracking-widest text-black transition hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Enter' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          {mode === 'login' ? 'New here?' : 'Already have an identity?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-neon-cyan hover:underline"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs uppercase tracking-widest text-white/25 hover:text-white/50">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
}
