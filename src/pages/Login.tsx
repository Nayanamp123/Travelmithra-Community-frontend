import { useNavigate, Link } from 'react-router-dom';
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

export default function Login({
  onLogin,
  onAdminLogin,
}: LoginProps) {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<LoginMode>('traveler');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    const form = event.currentTarget;

    const email = (
      form.elements.namedItem('loginEmail') as HTMLInputElement
    ).value;

    const password = (
      form.elements.namedItem('loginPassword') as HTMLInputElement
    ).value;

    try {
      // =========================
      // ADMIN LOGIN
      // =========================
      if (mode === 'admin') {
        const username = email.trim();
        const adminPassword = password.trim();

        await adminAPI.login(
          username,
          adminPassword
        );

        onAdminLogin({
          username,
          password: adminPassword,
        });

        navigate('/admin-management');
        return;
      }

      // =========================
      // TRAVELER LOGIN
      // =========================
      try {
        const response = await authAPI.login(
          email,
          password
        );

        const { user } = response;

        onLogin(user);

        navigate('/dashboard');
      } catch {
        // =========================
        // FALLBACK ADMIN LOGIN
        // =========================
        const username = email.trim();
        const adminPassword = password.trim();

        await adminAPI.login(
          username,
          adminPassword
        );

        onAdminLogin({
          username,
          password: adminPassword,
        });

        navigate('/admin-management');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="auth-page"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="card auth-card"
        style={{
          width: '100%',
          maxWidth: '360px',
          padding: '22px 24px',
          margin: '0 auto',
          boxSizing: 'border-box',
          borderRadius: '12px',
        }}
      >

        {/* =========================
            LOGIN MODE TABS
        ========================= */}
        <div
          className="login-mode-tabs"
          style={{ display: 'none' }}
          role="tablist"
          aria-label="Login type"
        >
          <button
            type="button"
            className={
              mode === 'traveler'
                ? 'active'
                : ''
            }
            onClick={() => {
              setMode('traveler');
              setError('');
            }}
          >
            Traveler
          </button>

          <button
            type="button"
            className={
              mode === 'admin'
                ? 'active'
                : ''
            }
            onClick={() => {
              setMode('admin');
              setError('');
            }}
          >
            Admin
          </button>
        </div>

        {/* =========================
            HEADER
        ========================= */}
        <p
          className="section-kicker"
          style={{
            marginTop: 0,
            marginBottom: '6px',
          }}
        >
          {mode === 'admin'
            ? 'Admin management'
            : 'Welcome back'}
        </p>

        <h3
          style={{
            marginTop: 0,
            marginBottom: '8px',
            fontSize: '22px',
          }}
        >
          {mode === 'admin'
            ? 'Manage Community Members'
            : 'Login to Travelmithra'}
        </h3>

        <p
          className="auth-copy"
          style={{
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '14px',
            lineHeight: 1.4,
          }}
        >
          {mode === 'admin'
            ? 'Sign in as admin to view members, update roles, export records, and remove accounts.'
            : 'Continue planning trips, viewing your profile, and exploring the community.'}
        </p>

        {/* =========================
            ERROR MESSAGE
        ========================= */}
        {error && (
          <div
            className="error-message"
            style={{
              marginBottom: '10px',
              padding: '8px 10px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            LOGIN FORM
        ========================= */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
          }}
        >
          <label
            htmlFor="loginEmail"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              marginTop: '3px',
            }}
          >
            {mode === 'admin'
              ? 'Admin username'
              : 'Email address'}
          </label>

          <input
            id="loginEmail"
            name="loginEmail"
            type="text"
            placeholder=""
            defaultValue="admin"
            required
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 11px',
              boxSizing: 'border-box',
              borderRadius: '7px',
              fontSize: '14px',
            }}
          />

          <label
            htmlFor="loginPassword"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              marginTop: '3px',
            }}
          >
            Password
          </label>

          <input
            id="loginPassword"
            name="loginPassword"
            type="password"
            placeholder=""
            defaultValue="admin"
            required
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 11px',
              boxSizing: 'border-box',
              borderRadius: '7px',
              fontSize: '14px',
            }}
          />

          {/* =========================
              LOGIN BUTTON
          ========================= */}
          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 14px',
              marginTop: '7px',
              borderRadius: '7px',
              fontSize: '14px',
            }}
          >
            {loading
              ? 'Logging in...'
              : mode === 'admin'
                ? 'Open Admin Management'
                : 'Login'}
          </button>
        </form>

        {/* =========================
            REGISTER LINK
        ========================= */}
        {mode === 'traveler' && (
          <p
            className="auth-switch"
            style={{
              marginTop: '12px',
              marginBottom: 0,
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            New to Travelmithra?{' '}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        )}

      </div>
    </section>
  );
}