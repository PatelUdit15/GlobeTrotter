import { useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    tripReminders: true,
    budgetAlerts: false,
    newsletter: false,
  });

  const [profile, setProfile] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@company.com',
    phone: '+1 (555) 123-4567',
    city: 'New York',
    country: 'United States',
    bio: 'Adventure seeker & travel enthusiast. Always planning the next big trip!',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWjOL3iQnDzIYeSTPJR3JYBu0OKYAbryEZHlaG-o8873j_nsp5VuAoNPiL7DKfr8I0M7PJ34zCWJ9EL2hnARkNANx_afpjxJqN--0iH7GTC7H1wREDJruREhdwEHwMCeZCZ4du6R19EFtB1ghoK-ov-m8Uxqy2JStYPE9orKtZF965H25l8h0FT6JDzZjboM58jS17-IPX0lor5yx_VdFmsAsy0fVibs4tk4n0NH7DbhKn8YOpZ4U',
    membership: 'Premium Member'
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Combined Profile & Account Settings */}
        <div className="space-y-6">
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-surface-muted mb-6">
              {/* Avatar image container with edit option */}
              <div className="relative group w-24 h-24 rounded-full bg-surface-muted border-2 border-primary-container overflow-hidden flex-shrink-0 cursor-pointer">
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={profile.avatar}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                  <span className="text-[10px] text-white font-medium mt-0.5">Change</span>
                </div>
              </div>
              
              {/* Text Info */}
              <div className="text-center sm:text-left flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-on-surface">
                    {profile.firstName || ''} {profile.lastName || ''}
                  </h2>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 self-center">
                    {profile.membership}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">{profile.email}</p>
                <p className="text-xs text-on-surface-variant mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.city || profile.country || 'No location set'}
                </p>
              </div>
            </div>

            {/* Account Settings Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">First Name</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Last Name</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Email</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Phone Number</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    type="tel"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">City</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface"
                    value={profile.city}
                    onChange={(e) => handleProfileChange('city', e.target.value)}
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wider text-on-surface">Country</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface"
                    value={profile.country}
                    onChange={(e) => handleProfileChange('country', e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-on-surface">Bio</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-md border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm resize-none outline-none text-on-surface"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end gap-4">
            <button className="px-6 py-2 rounded-lg text-xs font-semibold tracking-wider text-on-surface hover:bg-surface-muted transition-colors border border-surface-muted cursor-pointer">
              Cancel
            </button>
            <button className="px-6 py-2 rounded-lg text-xs font-semibold tracking-wider bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm cursor-pointer">
              Save Changes
            </button>
          </div>
        </div>

        {/* Trips Section */}
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">explore</span> My Trips
          </h3>

          <div className="space-y-6">
            {/* Preplanned Trips */}
            <div>
              <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span> Preplanned Trips
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 p-3 rounded-lg border border-surface-muted bg-surface-bright hover:shadow-sm transition-all">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbcgJVd2HCe9GXm3-QyZrkiHK8GM6MD4W84JkE2ut9PB0CYC_aV41L2braz2y9Zs75skQShTaQDgmNuC1jdm4Ulz3QwtzfXwZCVvpngcJsGKKjPNXlL5a9dxcNyL35ycwx0KISpsExBa4IBuDyo3Mfyle_EC0_pbxVEEhF1GGUNEMk03Npl8wgsjq8rtztnp16IuQAbnF9r8wfAbRzFSeQ1WjUiOBlStfCxmTf79SkANq_0pzAH7A"
                    alt="Swiss Alps"
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-on-surface line-clamp-1">Swiss Alps Mountain Escape</h5>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">5 Days • Dec 2026</p>
                    </div>
                    <span className="text-[10px] font-semibold text-secondary flex items-center gap-0.5 hover:underline cursor-pointer">
                      View Details <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg border border-surface-muted bg-surface-bright hover:shadow-sm transition-all">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH87C1nG5VK8r9m-LoTQv_WGoI8BJpyANPt5Xj1s_-xA-PCgm9zwl0X_tU8dceBFUUCNuzsJBQ1cnvxnck5mzNVIKH_r-eEsrmKtp8T6NimY4V2RtEDYUaVsFbPogOerGIdi96wZWTo1LcUUxqjIGXKUGAPxy5iAVVvA_h1Wfp0-ZfHzajME06NW_qHNe2R9jo2MZyrJznA42rxL6afW0zv6bv-daPmYJsXuDAbfoF3SrTBGT6SjA"
                    alt="Bali"
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-on-surface line-clamp-1">Bali Tropical Wellness</h5>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">8 Days • Feb 2027</p>
                    </div>
                    <span className="text-[10px] font-semibold text-secondary flex items-center gap-0.5 hover:underline cursor-pointer">
                      View Details <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Trips */}
            <div>
              <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">history</span> Past Trips
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 p-3 rounded-lg border border-surface-muted bg-surface-bright hover:shadow-sm transition-all">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-fEHTGNWWB5-CKeMkCY7kGhbont-9Zr-IH3snu7XCvzedILzs4MJ7FeJjm9iqwzGxiZlcZCtr9RZEy-YpG4FyB1-RpvGXTq9iGiquWMLVrfzr3PSbCSA2W084rYMDt1s5yI_E3wmZrgWDKJzfRL5xlvt_aWpxJbpJyEHg2jQ7i1N7c8B8SVPOnqD1Z_zl9sdhh4Zjv6lXksQaDiSEOSFweixRf5UbAmfszDqM151N3jF_An_Jc3g"
                    alt="Paris"
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-on-surface line-clamp-1">Romantic Paris & French Riviera</h5>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">7 Days • Oct 2024</p>
                    </div>
                    <span className="text-[10px] font-semibold text-secondary flex items-center gap-0.5 hover:underline cursor-pointer">
                      View Memories <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg border border-surface-muted bg-surface-bright hover:shadow-sm transition-all">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGX3VOMCbkm5VzI5Daa734HAqbOMpMGOgzxURkzkKcdE1WnEd3couriBiidQv4VP-su6K_-hydA_NdSpRkKTY9C_CPocsZPUDCE6xqatoEs_KAYvQqkba111tYzjfKrGAy9n8lbV2hh8s0TmoiRlZKBmzrytABgzRbYTTC6ZgeiNgAHyA0E3up51lj5Rll03KsO0hU_eot69lyvTq7c8f8lO0T4rUb-thBlcMd4VbnrDyMrxgxHqs"
                    alt="Kyoto"
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-on-surface line-clamp-1">Kyoto Autumn Explorer</h5>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">10 Days • Nov 2023</p>
                    </div>
                    <span className="text-[10px] font-semibold text-secondary flex items-center gap-0.5 hover:underline cursor-pointer">
                      View Memories <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
