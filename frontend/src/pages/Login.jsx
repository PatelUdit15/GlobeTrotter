import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
];

export default function Login() {
  const [activeForm, setActiveForm] = useState('login');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const navigate = useNavigate();

  const selectCountry = (country) => {
    setSelectedCountry(country.code);
    setPhoneNumber(country.dialCode + ' ');
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery('');
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    c.dialCode.includes(countrySearchQuery)
  );

  const selectedCountryObj = countries.find(c => c.code === selectedCountry);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="bg-surface-pure min-h-screen flex text-on-surface">
      {/* Left Side: Image / Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-muted relative overflow-hidden flex-col justify-between p-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtRbdF_rOdr6XekhMEtt2wozLDDgrIEqrTjhSkh7zOwAvHOihMLeGZPlBAGA19_cfMayaSBlCu3-WFlBtaE4B1Oay32QUFaxS_EEjiupyl_BC-u3S1juGRq_xaG4SJzz1x2n_gnWBubppjAIBXUmn18VrX3OkuZtfElZBI95vN_OyBXoRAC9kUqblmWAogbTLNoWOzJwRzZEbLCaX2OsFeViU3zsBFtYEcKWerXrE9SNYiSzzoS2k')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        </div>
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
              GlobeTrotter
            </h1>
          </div>
          <div className="max-w-md">
            <h2 className="text-5xl font-bold text-on-primary mb-4 tracking-tight">Plan less. Explore more.</h2>
            <p className="text-base text-on-primary/90 leading-relaxed">
              Join thousands of travelers who use GlobeTrotter to seamlessly orchestrate their multi-city adventures.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-md mx-auto relative overflow-hidden">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-3xl text-primary">flight_takeoff</span>
              GlobeTrotter
            </h1>
          </div>

          {/* Form Toggle */}
          <div className="flex mb-8 border-b border-surface-muted relative">
            <button
              className={`flex-1 pb-4 text-xl font-semibold transition-colors text-center cursor-pointer ${activeForm === 'login'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant border-b-2 border-transparent hover:text-primary'
                }`}
              onClick={() => setActiveForm('login')}
            >
              Log In
            </button>
            <button
              className={`flex-1 pb-4 text-xl font-semibold transition-colors text-center cursor-pointer ${activeForm === 'signup'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant border-b-2 border-transparent hover:text-primary'
                }`}
              onClick={() => setActiveForm('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          <div className="relative w-full min-h-[400px]">
            {/* Login Form */}
            <form
              className={`w-full flex flex-col gap-6 transition-all duration-300 ${activeForm === 'login' ? 'form-slide-enter' : 'form-slide-exit'
                }`}
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                  id="login-email"
                  placeholder="name@company.com"
                  type="email"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="login-password">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                  id="login-password"
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>
              <button
                className="w-full bg-primary-container text-on-primary py-3 rounded-sm text-xs font-semibold tracking-wider hover:bg-surface-tint transition-colors shadow-sm mt-4 cursor-pointer"
                type="submit"
              >
                Log In
              </button>
            </form>

            {/* Signup Form */}
            <form
              className={`w-full flex flex-col gap-5 transition-all duration-300 ${activeForm === 'signup' ? 'form-slide-enter' : 'form-slide-exit'
                }`}
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="signup-fname">
                    First Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                    id="signup-fname"
                    placeholder="Jane"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="signup-lname">
                    Last Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                    id="signup-lname"
                    placeholder="Doe"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="signup-email">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                  id="signup-email"
                  placeholder="name@company.com"
                  type="email"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 relative">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="signup-country">
                    Country
                  </label>
                  {isCountryDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCountryDropdownOpen(false)}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface text-left flex items-center justify-between cursor-pointer relative z-40"
                    id="signup-country"
                  >
                    <span className="flex items-center gap-2">
                      {selectedCountryObj ? (
                        <>
                          <span className="text-base">{selectedCountryObj.flag}</span>
                          <span>{selectedCountryObj.name}</span>
                        </>
                      ) : (
                        <span className="text-outline-variant">Select country</span>
                      )}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      expand_more
                    </span>
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute top-[100%] left-0 right-0 mt-1 bg-surface-pure border border-surface-muted rounded-sm shadow-lg z-50 flex flex-col max-h-60">
                      <div className="p-2 border-b border-surface-muted flex items-center gap-1.5 bg-surface-container-low">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={countrySearchQuery}
                          onChange={(e) => setCountrySearchQuery(e.target.value)}
                          className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-on-surface outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {countrySearchQuery && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCountrySearchQuery('');
                            }}
                            className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1 py-1">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => selectCountry(c)}
                              className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer ${
                                selectedCountry === c.code ? 'bg-primary-container/20 font-semibold' : ''
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              <span className="text-on-surface-variant text-[10px]">{c.dialCode}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-xs text-on-surface-variant">
                            No countries found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="signup-city">
                    City
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                    id="signup-city"
                    placeholder="New York"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="signup-phone">
                    Phone Number
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                    id="signup-phone"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="signup-password">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded-sm border border-surface-muted bg-surface-pure focus:outline-none focus:border-primary input-glow-focus transition-all text-sm text-on-surface placeholder:text-outline-variant"
                  id="signup-password"
                  placeholder="Min. 8 characters"
                  type="password"
                  required
                />
                <p className="text-[10px] font-semibold tracking-wider text-on-surface-variant mt-1">
                  Must contain letters, numbers, and symbols.
                </p>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">
                By creating an account, you agree to our{' '}
                <a className="text-secondary underline hover:text-secondary-fixed-dim" href="#">Terms of Service</a> and{' '}
                <a className="text-secondary underline hover:text-secondary-fixed-dim" href="#">Privacy Policy</a>.
              </p>
              <button
                className="w-full bg-primary-container text-on-primary py-3 rounded-sm text-xs font-semibold tracking-wider hover:bg-surface-tint transition-colors shadow-sm mt-2 cursor-pointer"
                type="submit"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
