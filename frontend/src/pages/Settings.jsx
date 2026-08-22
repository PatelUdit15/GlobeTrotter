import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api';

export default function Settings() {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    firstName: user?.first_name || '',
    lastName:  user?.last_name  || '',
    email:     user?.email      || '',
    phone:     user?.phone      || '',
    city:      user?.city       || '',
    country:   user?.country    || '',
    bio:       user?.bio        || '',
  });

  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState('');
  const [saveError,     setSaveError]     = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      await usersApi.updateMe({
        first_name: profile.firstName,
        last_name:  profile.lastName,
        email:      profile.email,
        phone:      profile.phone,
        city:       profile.city,
        country:    profile.country,
        bio:        profile.bio,
      });
      await refreshUser();
      setSaveMsg('Profile saved successfully!');
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await usersApi.uploadAvatar(file);
      await refreshUser();
    } catch (err) {
      setSaveError('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarSrc = user?.avatar_url
    ? `http://localhost:5000${user.avatar_url}`
    : null;

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-6">
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-surface-muted mb-6">
              {/* Avatar */}
              <div
                className="relative group w-24 h-24 rounded-full bg-surface-muted border-2 border-primary-container overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary text-2xl font-bold">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {uploadingAvatar
                    ? <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
                    : <><span className="material-symbols-outlined text-white text-xl">photo_camera</span><span className="text-[10px] text-white font-medium mt-0.5">Change</span></>
                  }
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Name & info */}
              <div className="text-center sm:text-left flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-on-surface">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 self-center capitalize">
                    {user?.membership_tier} Member
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">{user?.email}</p>
                {(user?.city || user?.country) && (
                  <p className="text-xs text-on-surface-variant mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {[user?.city, user?.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">First Name</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface"
                    value={profile.firstName}
                    onChange={e => handleProfileChange('firstName', e.target.value)}
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Last Name</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface"
                    value={profile.lastName}
                    onChange={e => handleProfileChange('lastName', e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Email</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface"
                    value={profile.email}
                    onChange={e => handleProfileChange('email', e.target.value)}
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Phone Number</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface"
                    value={profile.phone}
                    onChange={e => handleProfileChange('phone', e.target.value)}
                    type="tel"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">City</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface"
                    value={profile.city}
                    onChange={e => handleProfileChange('city', e.target.value)}
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Country</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface"
                    value={profile.country}
                    onChange={e => handleProfileChange('country', e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-on-surface">Bio</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm resize-none outline-none text-on-surface"
                  value={profile.bio}
                  onChange={e => handleProfileChange('bio', e.target.value)}
                  rows="3"
                />
              </div>

              {/* Feedback */}
              {saveMsg && (
                <p className="text-xs font-semibold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>{saveMsg}
                </p>
              )}
              {saveError && (
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">error</span>{saveError}
                </p>
              )}

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setProfile({
                    firstName: user?.first_name || '', lastName: user?.last_name || '',
                    email: user?.email || '', phone: user?.phone || '',
                    city: user?.city || '', country: user?.country || '', bio: user?.bio || '',
                  })}
                  className="px-6 py-2 rounded-lg text-xs font-semibold tracking-wider text-on-surface hover:bg-surface-muted transition-colors border border-surface-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-lg text-xs font-semibold tracking-wider bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
