import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { authAPI } from '../api/client';

type RegisterProps = { onRegister: (user: { id?: number; name: string; email: string; avatar?: string; role?: string }) => void };
type RegistrationData = { name: string; username: string; phone: string; password: string; avatar?: string; referral?: string; salesExecutive?: string };

export default function Register({ onRegister }: RegisterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'details' | 'rules'>('details');
  const [pending, setPending] = useState<RegistrationData | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultantId] = useState(() => `TM-${Math.floor(100000 + Math.random() * 900000)}`);
  const referral = new URLSearchParams(location.search).get('ref') || '';

  const readFile = (file?: File) => new Promise<string | undefined>((resolve, reject) => {
    if (!file) return resolve(undefined);
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxSize = 512;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('Failed to process profile picture'));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to read profile picture')); };
    image.src = objectUrl;
  });

  const continueToRules = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const form = event.currentTarget;
    const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim();
    try {
      const avatar = await readFile((form.elements.namedItem('registerAvatar') as HTMLInputElement).files?.[0]);
      setPending({ name: value('registerName'), username: value('registerUsername'), phone: value('registerPhone'), password: value('registerPassword'), avatar, referral, salesExecutive: value('salesExecutive') });
      setStep('rules');
    } catch (err) { setError(err instanceof Error ? err.message : 'Please check your details'); }
  };

  const submitRegistration = async () => {
    if (!pending || !agreed) return;
    setLoading(true); setError('');
    try {
      const response = await authAPI.register(pending.name, pending.username, pending.phone, pending.password, pending.avatar, pending.referral || undefined, true, consultantId, pending.salesExecutive);
      onRegister(response.user); navigate('/dashboard');
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); setLoading(false); }
  };

  const downloadAgreement = () => {
    const agreement = `TRAVELMITHRA ASSOCIATE TRAVEL CONSULTANT AGREEMENT\n\nConsultant ID: ${consultantId}\n\nI acknowledge that I have read and agree to the Travelmithra agent rules and regulations. I agree to provide accurate customer and booking information, protect customer privacy, represent Travelmithra honestly, follow approved pricing and payment procedures, and accept responsibility for activity performed through my account.\n\nRules version: agent-rules-v1\nAgreement status: Accepted upon submission\n\nConsultant name: ______________________________\nUsername: _____________________________________\nPhone number: __________________________________\nSignature: _____________________________________\nDate: _________________________________________\n\nFor administrative and legal records, this agreement is submitted to Travelmithra when registration is completed.`;
    const blob = new Blob([agreement], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `Travelmithra-Agreement-${consultantId}.txt`; link.click(); URL.revokeObjectURL(url);
  };

  return <section className={`auth-page ${step === 'rules' ? 'rules-auth-page' : ''}`}><div className={step === 'rules' ? 'rules-card' : 'card auth-card compact-register-card'}>
    {step === 'details' ? <>
      <p className="section-kicker">Join Travelmithra</p><h3>Create your account</h3><p className="auth-copy">Enter your details to apply as an agent.</p>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={continueToRules}>
        <label htmlFor="registerName">Member name</label><input id="registerName" name="registerName" type="text" placeholder="Your name" required />
        <label htmlFor="consultantId">Consultant ID</label><input id="consultantId" name="consultantId" type="text" value={consultantId} readOnly aria-label="Automatically generated consultant ID" />
        <label htmlFor="registerPhone">Phone number</label><input id="registerPhone" name="registerPhone" type="tel" placeholder="Your phone number" required />
        <label htmlFor="salesExecutive">Team Lead</label><select id="salesExecutive" name="salesExecutive" defaultValue="SANJU" required><option value="SANJU">SANJU</option><option value="UMA MAHESHWARI">UMA MAHESHWARI</option></select>
        <label htmlFor="registerUsername">Username</label><input id="registerUsername" name="registerUsername" type="text" placeholder="Choose a username" required />
        <label htmlFor="registerPassword">Password</label><input id="registerPassword" name="registerPassword" type="password" placeholder="Choose a password" required />
        <label htmlFor="registerAvatar">Profile picture</label><label className="file-input-wrapper" htmlFor="registerAvatar"><input id="registerAvatar" name="registerAvatar" type="file" accept="image/*" /><span className="file-input-icon">Choose profile image</span></label>
        <button type="submit" className="primary-btn">Continue to rules</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
    </> : <>
      <p className="section-kicker">Agent application</p><h3>Rules &amp; regulations</h3>
      <div className="agent-rules handbook-frame"><iframe title="Associate Travel Consultant Handbook" scrolling="no" src="/associate-travel-consultant-handbook.pdf#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&view=FitH&zoom=page-width" /></div>
      <p className="handbook-download"><a href="/associate-travel-consultant-handbook.pdf" download="Travelmithra-Associate-Travel-Consultant-Handbook.pdf">Save handbook</a></p>
      {error && <div className="error-message">{error}</div>}
      <label className="rules-consent"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> I have read and agree to the agent rules and regulations.</label>
      <button type="button" className="primary-btn" disabled={!agreed || loading} onClick={submitRegistration}>{loading ? 'Submitting application...' : 'Agree & submit application'}</button>
      <button type="button" className="secondary-btn" onClick={() => setStep('details')}>Back to details</button>
    </>}
  </div></section>;
}
