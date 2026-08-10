import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { adminAPI, authAPI } from '../api/client';
import type { AdminCredentials } from '../api/client';

type LoginProps = {
  onLogin: (user: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    referralCode?: string;
    referredBy?: number;
    role?: string;
  }) => void;
  onAdminLogin: (credentials: AdminCredentials) => void;
};

type LoginMode = 'traveler' | 'admin';

export default function Login({ onLogin, onAdminLogin }: LoginProps) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<LoginMode>('traveler');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = event.currentTarget;
    const email = (form.elements.namedItem('loginEmail') as HTMLInputElement).value;
    const password = (form.elements.namedItem('loginPassword') as HTMLInputElement).value;

    try {
      if (mode === 'admin') {
        const username = email.trim();
        const adminPassword = password.trim();
        await adminAPI.login(username, adminPassword);
        onAdminLogin({ username, password: adminPassword });
        navigate('/admin-management');
        return;
      }

      try {
        const response = await authAPI.login(email, password);
        const { user } = response;
        onLogin(user);
        navigate('/dashboard');
      } catch (travelerError) {
        await adminAPI.login(email.trim(), password.trim());
        onAdminLogin({ username: email.trim(), password: password.trim() });
        navigate('/admin-management');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <div className="login-mode-tabs" style={{ display: 'none' }} role="tablist" aria-label="Login type">
          <button
            type="button"
            className={mode === 'traveler' ? 'active' : ''}
            onClick={() => {
              setMode('traveler');
              setError('');
            }}
          >
            Traveler
          </button>
          <button
            type="button"
            className={mode === 'admin' ? 'active' : ''}
            onClick={() => {
              setMode('admin');
              setError('');
            }}
          >
            Admin
          </button>
        </div>
        <p className="section-kicker">{mode === 'admin' ? 'Admin management' : 'Welcome back'}</p>
        <h3>{mode === 'admin' ? 'Manage Community Members' : 'Login to Travelmithra'}</h3>
        <p className="auth-copy">
          {mode === 'admin'
            ? 'Sign in as admin to view members, update roles, export records, and remove accounts.'
            : 'Continue planning trips, viewing your profile, and exploring the community.'}
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="loginEmail">{mode === 'admin' ? 'Admin username' : 'Email address'}</label>
          <input
            id="loginEmail"
            name="loginEmail"
            type="text"
            placeholder="Email address or admin username"
            required
          />
          <label htmlFor="loginPassword">Password</label>
          <input id="loginPassword" name="loginPassword" type="password" placeholder="********" required />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Logging in...' : mode === 'admin' ? 'Open Admin Management' : 'Login'}
          </button>
        </form>
        {mode === 'traveler' && (
          <p className="auth-switch">
            New to Travelmithra? <Link to="/register">Create an account</Link>
          </p>
        )}
      </div>
    </section>
  );
}
