import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type ProfileProps = {
  currentUser: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    referralCode?: string;
    referredBy?: number|null;
  };
};

export default function Profile({ currentUser }: ProfileProps) {
  const navigate = useNavigate();
  const [copyMessage, setCopyMessage] = useState('');

  const referralLink = `${window.location.origin}/register${currentUser.referralCode ? `?ref=${currentUser.referralCode}` : ''}`;

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyMessage('Referral link copied!');
      setTimeout(() => setCopyMessage(''), 2500);
    } catch {
      setCopyMessage('Unable to copy referral link');
      setTimeout(() => setCopyMessage(''), 2500);
    }
  };

  return (
    <section className="page-section" id="profile">
      <div className="page-header">
        <h2>Your Profile</h2>
        <p>View your logged-in details and manage your profile.</p>
      </div>

      <div className="card profile-card">
        <div className="profile-card-header">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={`${currentUser.name} avatar`} className="profile-avatar" />
          ) : (
            <div className="profile-avatar">{currentUser.name.charAt(0)}</div>
          )}
          <div>
            <h3>{currentUser.name}</h3>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <div className="profile-meta">
          <div>
            <span>Member status</span>
            <strong>Active traveler</strong>
          </div>
          <div>
            <span>Member since</span>
            <strong>Today</strong>
          </div>
        </div>

        <button 
          className="primary-btn" 
          onClick={() => navigate('/edit-profile')} 
          style={{ marginTop: '24px' }}
        >
          Edit Profile
        </button>
      </div>

      <div className="card quick-info">
        <h3>Your referral link</h3>
        <p>Share your referral link with friends to let them sign up with your referral code.</p>
        <div className="referral-link-box">{referralLink}</div>
        <button type="button" className="secondary-btn" onClick={copyReferralLink}>
          Copy referral link
        </button>
        {copyMessage && <p className="success-message">{copyMessage}</p>}
        {currentUser.referredBy && (
          <p style={{ marginTop: 12 }}>
            Referred by user ID <strong>{currentUser.referredBy}</strong>
          </p>
        )}
      </div>

      <div className="card quick-info">
        <h3>Community access</h3>
        <p>
          As a logged-in member, you can view the community directory, join travel groups, and share stories with fellow travelers.
        </p>
      </div>
    </section>
  );
}
