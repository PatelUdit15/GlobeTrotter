import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'CA', name: 'Canada',        flag: '🇨🇦', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom',flag: '🇬🇧', dialCode: '+44' },
  { code: 'AU', name: 'Australia',     flag: '🇦🇺', dialCode: '+61' },
  { code: 'IN', name: 'India',         flag: '🇮🇳', dialCode: '+91' },
  { code: 'DE', name: 'Germany',       flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France',        flag: '🇫🇷', dialCode: '+33' },
  { code: 'JP', name: 'Japan',         flag: '🇯🇵', dialCode: '+81' },
  { code: 'CN', name: 'China',         flag: '🇨🇳', dialCode: '+86' },
  { code: 'BR', name: 'Brazil',        flag: '🇧🇷', dialCode: '+55' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SG', name: 'Singapore',     flag: '🇸🇬', dialCode: '+65' },
  { code: 'ZA', name: 'South Africa',  flag: '🇿🇦', dialCode: '+27' },
  { code: 'RU', name: 'Russia',        flag: '🇷🇺', dialCode: '+7' },
  { code: 'NZ', name: 'New Zealand',   flag: '🇳🇿', dialCode: '+64' },
  { code: 'ES', name: 'Spain',         flag: '🇪🇸', dialCode: '+34' },
  { code: 'IT', name: 'Italy',         flag: '🇮🇹', dialCode: '+39' },
  { code: 'MX', name: 'Mexico',        flag: '🇲🇽', dialCode: '+52' },
  { code: 'CH', name: 'Switzerland',   flag: '🇨🇭', dialCode: '+41' },
  { code: 'NL', name: 'Netherlands',   flag: '🇳🇱', dialCode: '+31' },
];

export default function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();

  const [activeForm, setActiveForm] = useState('login');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  // login fields
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // signup fields
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [signupEmail,  setSignupEmail]  = useState('');
  const [signupPassword,setSignupPassword] = useState('');
  const [city,         setCity]         = useState('');
  const [phoneNumber,  setPhoneNumber]  = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // If already logged in, go straight to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const selectedCountryObj = countries.find(c => c.code === selectedCountry);
  const filteredCountries  = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    c.dialCode.includes(countrySearchQuery)
  );

  const selectCountry = (country) => {
    setSelectedCountry(country.code);
    setPhoneNumber(country.dialCode + ' ');
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery('');
  };

  // ── Login submit ────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Signup submit ───────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        first_name: firstName,
        last_name:  lastName,
        email:      signupEmail,
        password:   signupPassword,
        phone:      phoneNumber || undefined,
        city:       city || undefined,
        country:    selectedCountryObj?.name || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-pure min-h-screen flex text-on-surface">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-muted relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtRbdF_rOdr6XekhMEtt2wozLDDgrIEqrTjhSkh7zOwAvHOihMLeGZPlBAGA19_cfMayaSBlCu3-WFlBtaE4B1Oay32QUFaxS_EEjiupyl_BC-u3S1juGRq_xaG4SJzz1x2n_gnWBubppjAIBXUmn18VrX3OkuZtfElZBI95vN_OyBXoRAC9kUqblmWAogbTLNoWOzJwRzZEbLCaX2OsFeViU3zsBFtYEcKWerXrE9SNYiSzzoS2k')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <h1 className="text-3xl font-bold text-on-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
            GlobeTrotter
          </h1>
          <div className="max-w-md">
            <h2 className="text-5xl font-bold text-on-primary mb-4 tracking-tight">Plan less. Explore more.</h2>
            <p className="text-base text-on-primary/90 leading-relaxed">
              Join thousands of travelers who use GlobeTrotter to seamlessly orchestrate their multi-city adventures.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile branding */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-3xl text-primary">flight_takeoff</span>
              GlobeTrotter
            </h1>
          </div>

          {/* Tab toggle */}
          <div className="flex mb-8 border-b border-surface-muted">
            {['login', 'signup'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveForm(tab); setError(''); }}
                className={`flex-1 pb-4 text-xl font-semibold transition-colors text-center cursor-pointer ${
                  activeForm === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant border-b-2 border-transparent hover:text-primary'
                }`}
              >
                {tab === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Global error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ─────────────────────────────────── */}
          {activeForm === 'login' && (
            <form className="flex flex-col gap-6" onSubmit={handleLogin}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-container text-on-primary py-3 rounded-sm text-xs font-semibold tracking-wider hover:bg-surface-tint transition-colors shadow-sm mt-4 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                {submitting ? 'Signing in…' : 'Log In'}
              </button>
            </form>
          )}

          {/* ── SIGNUP FORM ────────────────────────────────── */}
          {activeForm === 'signup' && (
            <form className="flex flex-col gap-5" onSubmit={handleSignup}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant">First Name</label>
                  <input
                    type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant">Last Name</label>
                  <input
                    type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant">Email Address</label>
                <input
                  type="email" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Country dropdown */}
                <div className="flex flex-col gap-1 relative">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant">Country</label>
                  {isCountryDropdownOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)} />
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface text-left flex items-center justify-between cursor-pointer relative z-40"
                  >
                    <span className="flex items-center gap-2">
                      {selectedCountryObj
                        ? <><span>{selectedCountryObj.flag}</span><span>{selectedCountryObj.name}</span></>
                        : <span className="text-outline-variant">Select country</span>
                      }
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
                  </button>
                  {isCountryDropdownOpen && (
                    <div className="absolute top-[100%] left-0 right-0 mt-1 bg-surface-pure border border-surface-muted rounded-sm shadow-lg z-50 flex flex-col max-h-60">
                      <div className="p-2 border-b border-surface-muted flex items-center gap-1.5 bg-surface-container-low">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
                        <input
                          type="text" placeholder="Search country…"
                          value={countrySearchQuery} onChange={e => setCountrySearchQuery(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="w-full bg-transparent border-none text-xs focus:outline-none text-on-surface outline-none"
                        />
                      </div>
                      <div className="overflow-y-auto flex-1 py-1">
                        {filteredCountries.map(c => (
                          <button
                            key={c.code} type="button" onClick={() => selectCountry(c)}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer ${selectedCountry === c.code ? 'bg-primary-container/20 font-semibold' : ''}`}
                          >
                            <span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></span>
                            <span className="text-on-surface-variant text-[10px]">{c.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant">City</label>
                  <input
                    type="text" value={city} onChange={e => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant">Phone Number</label>
                <input
                  type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant">Password</label>
                <input
                  type="password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                />
                <p className="text-[10px] font-semibold tracking-wider text-on-surface-variant mt-1">
                  Must be at least 6 characters.
                </p>
              </div>

              <p className="text-sm text-on-surface-variant">
                By creating an account, you agree to our{' '}
                <a className="text-secondary underline" href="#">Terms of Service</a> and{' '}
                <a className="text-secondary underline" href="#">Privacy Policy</a>.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-container text-on-primary py-3 rounded-sm text-xs font-semibold tracking-wider hover:bg-surface-tint transition-colors shadow-sm mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                {submitting ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
