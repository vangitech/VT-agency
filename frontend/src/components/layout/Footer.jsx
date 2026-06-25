import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import API from '../../api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    API.get('/public/settings')
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, []);

  const s = (key, fallback) => settings[key] || fallback;

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Projects', path: '/projects' },
      { name: 'Contact', path: '/contact' },
    ],
    services: [
      { name: 'Software Development', path: '/projects' },
      { name: 'Cybersecurity', path: '/projects' },
      { name: 'IT Consulting', path: '/contact' },
      { name: 'Audit Services', path: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms & Conditions', path: '/terms' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Cookie Policy', path: '/policy' },
    ],
  };

  const socialIcons = [
    { icon: FaFacebook, href: s('facebookUrl', '#'), label: 'Facebook' },
    { icon: FaTwitter, href: s('twitterUrl', '#'), label: 'Twitter' },
    { icon: FaLinkedin, href: s('linkedinUrl', '#'), label: 'LinkedIn' },
    { icon: FaYoutube, href: s('youtubeUrl', '#'), label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Brand card */}
          <div className="sm:col-span-2 xl:col-span-1">
            <div className="h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
              <Link to="/" className="inline-flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-green rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                  <span className="text-white font-bold text-base leading-none tracking-tight">VT</span>
                </div>
                <span className="text-white font-semibold text-lg">{s('companyName', 'Vangitech')}</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                {s('companyDescription', 'Empowering businesses through innovative software solutions, cybersecurity, and IT consulting services.')}
              </p>
              <div className="flex gap-2.5">
                {socialIcons.map((social, index) =>
                  social.href !== '#' ? (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-brand-blue hover:shadow-lg hover:shadow-brand-blue/25 transition-all"
                    >
                      <social.icon size={16} className="text-gray-400 group-hover:text-white" />
                    </a>
                  ) : null
                )}
              </div>
            </div>
          </div>

          {/* Company card */}
          <div>
            <div className="h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
              <h3 className="text-white font-semibold text-sm tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-brand-blue" />
                Company
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={12} className="text-brand-blue/0 group-hover:text-brand-blue transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Services card */}
          <div>
            <div className="h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
              <h3 className="text-white font-semibold text-sm tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-brand-green" />
                Services
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.services.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={12} className="text-brand-green/0 group-hover:text-brand-green transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Legal card */}
          <div>
            <div className="h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
              <h3 className="text-white font-semibold text-sm tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-brand-blue" />
                Contact
              </h3>
              <div className="space-y-3 text-sm mb-6">
                <p className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-brand-blue" />
                  </span>
                  <a href={`mailto:${s('companyEmail', 'info@vangitech.online')}`} className="text-gray-400 hover:text-white transition-colors">
                    {s('companyEmail', 'info@vangitech.online')}
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-brand-blue" />
                  </span>
                  <a href={`tel:${s('companyPhone', '+1234567890')}`} className="text-gray-400 hover:text-white transition-colors">
                    {s('companyPhone', '+1 (234) 567-890')}
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-brand-blue" />
                  </span>
                  <span className="text-gray-400">{s('companyAddress', '123 Tech Park, Silicon Valley, CA')}</span>
                </p>
              </div>
              <h3 className="text-white font-semibold text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-brand-green" />
                Legal
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={12} className="text-brand-green/0 group-hover:text-brand-green transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <p>&copy; {currentYear} {s('companyName', 'Vangitech Limited')}. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link to="/policy" className="hover:text-white transition-colors">Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
