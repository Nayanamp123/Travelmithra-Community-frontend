import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../api/client';

type EditProfileProps = {
  currentUser: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onUpdateProfile?: (name: string, email: string, avatar?: string) => void;
};

export default function EditProfile({ currentUser, onUpdateProfile }: EditProfileProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
  });
  const [previewAvatar, setPreviewAvatar] = useState<string | undefined>(currentUser.avatar);
  const [selectedAvatarName, setSelectedAvatarName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please choose a JPG, PNG, GIF, or WebP image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be smaller than 5MB');
        return;
      }
      setError('');
      setSelectedAvatarName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : undefined;
        setPreviewAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      if (currentUser.id) {
        await profileAPI.updateProfile(currentUser.id, formData.name, formData.email, previewAvatar);
      }
      onUpdateProfile?.(formData.name, formData.email, previewAvatar);
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <section className="ep-page" id="edit-profile">
      <header className="ep-page-header">
        <div>
          <span className="ep-kicker">Profile settings</span>
          <h2>Edit profile</h2>
          <p>Manage your personal details and how you appear to the Travel Mithra community.</p>
        </div>
        <button type="button" className="ep-back" onClick={() => navigate('/profile')}>
          ← Back to profile
        </button>
      </header>

      <div className="ep-layout">
        <aside className="ep-preview">
          <div className="ep-avatar">
            {previewAvatar ? (
              <img src={previewAvatar} alt="Profile preview" />
            ) : (
              <span>{formData.name.trim().charAt(0).toUpperCase() || 'T'}</span>
            )}
          </div>
          <h3>{formData.name.trim() || 'Traveler'}</h3>
          <p>{formData.email.trim() || 'No email added'}</p>
          <span className="ep-preview-badge">Community member</span>
        </aside>

        <form className="ep-form" onSubmit={handleSubmit}>
          <div className="ep-form-heading">
            <div>
              <h3>Account details</h3>
              <p>Keep your profile information accurate and up to date.</p>
            </div>
            <span>All fields are required</span>
          </div>

          <div className="ep-field">
            <label>Profile photo</label>
            <p className="ep-help">JPG, PNG, GIF or WebP. Maximum file size 5MB.</p>
            <label className="ep-upload" htmlFor="avatarInput">
              <span className="ep-upload-mark">↑</span>
              <span>
                <strong>{selectedAvatarName || 'Upload a new photo'}</strong>
                <small>{selectedAvatarName ? 'Select to replace this image' : 'Choose an image from your device'}</small>
              </span>
              <b>Browse</b>
            </label>
            <input id="avatarInput" className="ep-file-input" type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>

          <div className="ep-fields">
            <div className="ep-field">
              <label htmlFor="name">Display name</label>
              <p className="ep-help">This is the name other travelers will see.</p>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange}
                placeholder="Enter your name" autoComplete="name" />
            </div>
            <div className="ep-field">
              <label htmlFor="email">Email address</label>
              <p className="ep-help">Used for sign-in and important notifications.</p>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                placeholder="Enter your email" autoComplete="email" />
            </div>
          </div>

          {error && <div className="ep-error" role="alert">{error}</div>}

          <div className="ep-actions">
            <button type="button" className="ep-cancel" onClick={() => navigate('/profile')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="ep-save" disabled={loading}>
              {loading ? 'Saving changes…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
