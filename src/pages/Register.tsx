import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { authAPI } from '../api/client';

type RegisterProps = {
  onRegister: (user: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    referralCode?: string;
    referredBy?: number;
    role?: string;
  }) => void;
};

export default function Register({ onRegister }: RegisterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountRole, setAccountRole] = useState('traveler');

  const referralCodeFromLink =
    new URLSearchParams(location.search).get('ref') ||
    new URLSearchParams(location.search).get('referralCode') ||
    '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = event.currentTarget;
    const name = (form.elements.namedItem('registerName') as HTMLInputElement).value || 'Traveler';
    const email = (form.elements.namedItem('registerEmail') as HTMLInputElement).value;
    const password = (form.elements.namedItem('registerPassword') as HTMLInputElement).value;
    const role = (form.elements.namedItem('registerRole') as HTMLSelectElement).value;
    const salesExecutive = (form.elements.namedItem('salesExecutive') as HTMLSelectElement)?.value || undefined;
    const referralCodeOrLink = (form.elements.namedItem('registerReferral') as HTMLInputElement).value.trim();
    const fileInput = form.elements.namedItem('registerAvatar') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const avatar = typeof reader.result === 'string' ? reader.result : undefined;

      try {
        const response = await authAPI.register(name, email, password, referralCodeOrLink || undefined, role, salesExecutive);
        onRegister(response.user);
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      try {
        const response = await authAPI.register(name, email, password, referralCodeOrLink || undefined, role, salesExecutive);
        onRegister(response.user);
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        setLoading(false);
      }
    }
  };

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <p className="section-kicker">Join the community</p>
        <h3>Create your account</h3>
        <p className="auth-copy">Save your profile and connect with other travelers in one place.</p>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="registerName">Display name</label>
          <input id="registerName" name="registerName" type="text" placeholder="Your name" required />

          <label htmlFor="registerEmail">Email address</label>
          <input id="registerEmail" name="registerEmail" type="email" placeholder="you@example.com" required />

          <label htmlFor="registerPassword">Password</label>
          <input id="registerPassword" name="registerPassword" type="password" placeholder="Enter password" required />

          <label htmlFor="registerRole">Account type</label>
          <select id="registerRole" name="registerRole" value={accountRole} onChange={(event) => setAccountRole(event.target.value)}>
            <option value="traveler">Traveler</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="sales_executive">Sales Executive</option>
          </select>

          {accountRole === 'sales_executive' && <>
            <label htmlFor="salesExecutive">Sales Executive</label>
            <select id="salesExecutive" name="salesExecutive" defaultValue="Aliya">
              <option value="Aliya">Aliya</option>
              <option value="Keerthi">Keerthi</option>
            </select>
          </>}

          <label htmlFor="registerReferral">Referral code or link (optional)</label>
          <input
            id="registerReferral"
            name="registerReferral"
            type="text"
            placeholder="Paste referral code or link"
            defaultValue={referralCodeFromLink}
          />

          <label htmlFor="registerAvatar">Profile picture</label>
          <label className="file-input-wrapper" htmlFor="registerAvatar">
            <input id="registerAvatar" name="registerAvatar" type="file" accept="image/*" />
            <span className="file-input-icon">Choose profile image</span>
          </label>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
