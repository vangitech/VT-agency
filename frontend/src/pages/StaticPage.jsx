import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import API from '../api';
import { Loader2 } from 'lucide-react';

const pageFallback = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: '28 July 2026',
    content: [
      {
        heading: 'Introduction',
        body: 'Your privacy is important to us. This Privacy Policy outlines how Vangitech Limited ("Vangitech," "we," "us," or "our") collects, uses, stores, and protects your personal information when you visit our website, use our services, or interact with us. We are committed to safeguarding your privacy and ensuring that your personal data is handled in accordance with applicable data protection laws, including the Nigeria Data Protection Regulation (NDPR) and the General Data Protection Regulation (GDPR) where applicable.',
      },
      {
        heading: 'Information We Collect',
        body: 'We may collect the following types of information: Personal identification information such as your name, email address, phone number, and company name when you fill out forms on our website, request a quote, or contact us. Technical information including your IP address, browser type, device information, and browsing behavior through the use of cookies and similar technologies. Communication data including correspondence you send to us via email, contact forms, or other channels. Please refer to our Cookie Policy for more details on how we use cookies and similar tracking technologies.',
      },
      {
        heading: 'How We Use Your Information',
        body: 'We use the information we collect to: Provide, maintain, and improve our services and website. Respond to your inquiries, requests, and support needs. Send periodic emails regarding our services, offers, and industry updates — you may opt out at any time. Analyze website usage to enhance user experience and optimize our content. Comply with legal obligations and protect our rights. We will only use your personal data for the purposes for which we collected it, unless we reasonably consider that we need to use it for another compatible purpose.',
      },
      {
        heading: 'Data Sharing and Disclosure',
        body: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving you, provided they agree to keep your information confidential. These include cloud hosting providers, email service providers, analytics services, and payment processors. We may also disclose your information when required by law or to protect our rights, property, or safety.',
      },
      {
        heading: 'Data Security',
        body: 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include encryption of data in transit and at rest, access controls and authentication protocols, regular security audits and vulnerability assessments, and secure server infrastructure. While we strive to protect your data, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.',
      },
      {
        heading: 'Your Rights',
        body: 'Depending on your jurisdiction, you may have the following rights regarding your personal data: The right to access the personal data we hold about you. The right to request correction of inaccurate or incomplete data. The right to request deletion of your data (subject to legal obligations). The right to restrict or object to processing of your data. The right to data portability. The right to withdraw consent at any time where we rely on consent as a legal basis. To exercise any of these rights, please contact us at support@vangitech.com.',
      },
      {
        heading: 'Cookies and Tracking Technologies',
        body: 'Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. You have the right to choose whether to accept or reject cookies. You can manage your cookie preferences through our cookie consent banner or by adjusting your browser settings. For detailed information about the cookies we use and how to manage them, please see our Cookie Policy.',
      },
      {
        heading: 'Contact Us',
        body: 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us: Email: support@vangitech.com. Address: House C18A FRSC Estate Lokogoma, FCT-Abuja, Nigeria. Phone: +234 806 975 2912. We will respond to your request within a reasonable timeframe and in accordance with applicable data protection laws.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'June 2026',
    content: [
      { heading: 'Acceptance of Terms', body: 'By using our website and services, you accept these terms and conditions.' },
      { heading: 'Services', body: 'Vangitech provides technology services as defined in each engagement agreement.' },
      { heading: 'Intellectual Property', body: 'All IP rights remain with Vangitech until full payment is received.' },
      { heading: 'Contact', body: 'For questions, contact us at support@vangitech.com.' },
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
    lastUpdated: '28 July 2026',
    content: [
      {
        heading: 'What Are Cookies',
        body: 'Cookies are small text files that are stored on your browser or device when you visit a website. They are widely used to make websites work more efficiently, remember your preferences, and provide website owners with analytics about how their site is used. Cookies cannot run programs or deliver viruses to your computer.',
      },
      {
        heading: 'How We Use Cookies',
        body: 'Vangitech uses cookies for the following purposes: Essential cookies that are strictly necessary for the website to function properly — these enable core functionality such as security, network management, and account authentication. Analytics cookies that help us understand how visitors interact with our website by collecting anonymous data on pages visited, time spent, and error messages. Preference cookies that remember your settings and choices (such as language and region) to provide a personalized experience.',
      },
      {
        heading: 'Types of Cookies We Use',
        body: 'Session cookies: These are temporary cookies that expire when you close your browser. They enable the website to remember your actions during a single browsing session. Persistent cookies: These remain on your device for a set period or until you delete them. They help us remember your preferences and settings for future visits. First-party cookies: Set directly by Vangitech. Third-party cookies: Set by trusted partners for analytics and marketing purposes.',
      },
      {
        heading: 'Managing Your Cookie Preferences',
        body: 'You have full control over your cookie preferences. When you first visit our website, you can accept all cookies, decline non-essential cookies, or customize your preferences by category using our cookie consent banner. You can also adjust your browser settings to block or delete cookies at any time. Please note that disabling certain cookies may affect the functionality and performance of our website.',
      },
      {
        heading: 'How to Disable Cookies in Your Browser',
        body: 'You can manage cookie settings through your browser preferences. In most browsers, you can: view and delete stored cookies, block third-party cookies, block all cookies, or be notified when a cookie is set. The help feature in most browsers provides detailed instructions. Alternatively, visit aboutcookies.org for comprehensive guidance on managing cookies across different browsers.',
      },
      {
        heading: 'Changes to This Policy',
        body: 'We may update this Cookie Policy from time to time to reflect changes in our practices, legal requirements, or for operational reasons. When we make material changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this page periodically to stay informed about how we are using cookies.',
      },
      {
        heading: 'Contact Us',
        body: 'If you have any questions about our use of cookies or this Cookie Policy, please contact us at support@vangitech.com or write to: Vangitech Limited, House C18A FRSC Estate Lokogoma, FCT-Abuja, Nigeria. We are happy to provide more information about how we handle your data and privacy.',
      },
    ],
  },
};

const StaticPage = ({ slug }) => {
  const pageKey = slug || 'privacy';
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
      <SEO
        title={title}
        description={`${title} — Learn about how Vangitech handles your data, terms of service, and policies.`}
        url={`https://vangitech.com/${pageKey}`}
      />
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
