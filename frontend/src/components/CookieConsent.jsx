import { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3, Settings2, ChevronDown } from 'lucide-react';

const COOKIE_KEY = 'vg_cookie_consent';

const categories = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Required for the website to function. Cannot be disabled.',
    icon: Shield,
    required: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how visitors interact with our site.',
    icon: BarChart3,
    required: false,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Remember your settings and preferences for future visits.',
    icon: Settings2,
    required: false,
  },
];

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, preferences: false });
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
    if (stored === 'accepted') setAccepted(true);
  }, []);

  const close = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, 300);
  };

  const acceptAll = () => {
    const data = JSON.stringify({ all: true, prefs: { analytics: true, preferences: true } });
    localStorage.setItem(COOKIE_KEY, data);
    setAccepted(true);
    close();
  };

  const acceptSelected = () => {
    const data = JSON.stringify({ all: false, prefs });
    localStorage.setItem(COOKIE_KEY, data);
    setAccepted(true);
    close();
  };

  const declineAll = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    close();
  };

  const reopen = () => {
    setAccepted(false);
    setVisible(true);
    setShowDetails(false);
  };

  if (!visible && !accepted) return null;

  if (accepted) {
    return (
      <button
        onClick={reopen}
        className="fixed bottom-4 right-4 z-[60] w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-blue hover:border-brand-blue hover:shadow-xl transition-all group"
        aria-label="Cookie settings"
      >
        <Cookie size={16} className="group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 ${
        leaving ? 'pointer-events-none' : ''
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${
          leaving ? 'opacity-0 transition-opacity duration-300' : 'opacity-100 transition-opacity duration-500'
        }`}
        onClick={declineAll}
      />

      <div
        className={`relative w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl border border-gray-100 ${
          leaving
            ? 'translate-y-full opacity-0 transition-all duration-300'
            : 'translate-y-0 opacity-100 transition-all duration-500'
        }`}
      >
        <div className="p-5 sm:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-blue/20">
              <Cookie size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">We value your privacy</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. Choose your preferences below.
              </p>
            </div>
            <button
              onClick={declineAll}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2 mb-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const checked = cat.required || prefs[cat.id];
              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    cat.required
                      ? 'bg-gray-50 border-gray-100'
                      : showDetails
                        ? 'bg-white border-gray-200 hover:border-brand-blue/30'
                        : 'bg-white border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    cat.required ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{cat.label}</span>
                      {cat.required && (
                        <span className="text-[10px] font-medium text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded">Required</span>
                      )}
                    </div>
                    {showDetails && <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>}
                  </div>
                  {!cat.required && showDetails && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setPrefs((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue" />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-brand-blue transition-colors mb-5"
          >
            <ChevronDown size={14} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Hide details' : 'Customize settings'}
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            {showDetails ? (
              <>
                <button
                  onClick={declineAll}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={acceptSelected}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 shadow-lg shadow-brand-blue/25 transition-all"
                >
                  Save Settings
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/15 transition-colors"
                >
                  Accept All
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={declineAll}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 shadow-lg shadow-brand-blue/25 transition-all"
                >
                  Accept All
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            By accepting, you consent to our use of cookies. See our{' '}
            <a href="/policy" className="text-brand-blue font-medium hover:underline">Cookie Policy</a> and{' '}
            <a href="/privacy" className="text-brand-blue font-medium hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
