import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import { Loader2 } from 'lucide-react';

const pageMap = {
  privacy: { title: 'Privacy Policy', slug: 'privacy' },
  terms: { title: 'Terms & Conditions', slug: 'terms' },
  faq: { title: 'Frequently Asked Questions', slug: 'faq' },
  policy: { title: 'Cookie Policy', slug: 'policy' },
};

const pageFallback = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'June 2026',
    content: [
      { heading: 'Introduction', body: 'Your privacy is important to us. This privacy policy outlines how Vangitech collects, uses, and protects your personal information when you use our website and services.' },
      { heading: 'Information We Collect', body: 'We may collect your name, contact information, and other details when you fill out forms or correspond with us.' },
      { heading: 'How We Use Your Information', body: 'We use your information to provide services, improve our offerings, and communicate with you.' },
      { heading: 'Contact Us', body: 'If you have any questions, please contact us at support@vangitech.online.' },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'June 2026',
    content: [
      { heading: 'Acceptance of Terms', body: 'By using our website and services, you accept these terms and conditions.' },
      { heading: 'Services', body: 'Vangitech provides technology services as defined in each engagement agreement.' },
      { heading: 'Intellectual Property', body: 'All IP rights remain with Vangitech until full payment is received.' },
      { heading: 'Contact', body: 'For questions, contact us at support@vangitech.online.' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    lastUpdated: 'June 2026',
    content: [
      { heading: 'What services does Vangitech offer?', body: 'We offer software development, cybersecurity, IT consulting, and audit services.' },
      { heading: 'How can I get a quote?', body: 'Contact us through our website form and we will respond within 24-48 hours.' },
      { heading: 'What industries do you serve?', body: 'We serve finance, education, healthcare, technology, and government sectors.' },
      { heading: 'How do I get started?', body: 'Contact us to schedule an initial consultation.' },
    ],
  },
  policy: {
    title: 'Cookie Policy',
    lastUpdated: 'June 2026',
    content: [
      { heading: 'What Are Cookies', body: 'Cookies are small text files stored on your device when you visit a website.' },
      { heading: 'How We Use Cookies', body: 'We use cookies for essential functionality, analytics, and preferences.' },
      { heading: 'Managing Cookies', body: 'You can accept or reject cookies through your browser settings.' },
      { heading: 'Contact', body: 'For questions, contact us at support@vangitech.online.' },
    ],
  },
};

const StaticPage = ({ slug }) => {
  const pageKey = slug || 'privacy';
  const pageInfo = pageMap[pageKey] || pageMap.privacy;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await API.get(`/public/page-content/${pageKey}`);
        setData(res.data.sections);
      } catch {
        setData(pageFallback[pageKey]);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [pageKey]);

  if (loading) {
    return (
      <div className="pt-16 md:pt-20">
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        </div>
      </div>
    );
  }

  const { title, lastUpdated, content } = data || pageFallback[pageKey];

  return (
    <div className="pt-16 md:pt-20">
      <section className="bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full mb-4">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{title}</h1>
          {lastUpdated && (
            <p className="text-sm text-white/60">Last updated: {lastUpdated}</p>
          )}
        </div>
      </section>
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-10">
            {content.map((section, index) => (
              <div key={index}>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{section.heading}</h2>
                <p className="text-gray-600 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaticPage;
