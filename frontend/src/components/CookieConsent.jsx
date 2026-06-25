import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 hidden sm:flex">
          <Cookie size={24} className="text-brand-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1">We use cookies</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            This website uses cookies to enhance your browsing experience, analyze site traffic, and serve personalized content. By clicking "Accept", you consent to our use of cookies. See our{' '}
            <a href="/policy" className="text-brand-blue font-medium hover:underline">Cookie Policy</a> for details.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 shadow-lg shadow-brand-blue/25 transition-all"
          >
            Accept
          </button>
        </div>
        <button
          onClick={decline}
          className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
