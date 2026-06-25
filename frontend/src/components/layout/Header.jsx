import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Mail, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { imageUrl } from '../../api';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { navigateWithLoader } = useLoading();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex flex-col items-center">
            <span className="text-[9px] text-gray-400 font-medium leading-tight tracking-wider">RC 1803640</span>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-green rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base leading-none tracking-tight">VT</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigateWithLoader(link.path)}
                className={`text-sm font-medium transition-colors hover:text-brand-blue ${
                  isActive(link.path)
                    ? 'text-brand-blue'
                    : 'text-gray-700'
                }`}
              >
                {link.name}
              </button>
            ))}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {user.avatar ? (
                    <img src={imageUrl(user.avatar)} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate('/admin/dashboard'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="mailto:info@vangitech.com?subject=Let's%20Work%20Together">
                <Button variant="blue" size="sm" className="shadow-sm">
                  <Mail size={16} className="mr-2" /> Get in Touch
                </Button>
              </a>
            )}
          </nav>

          <button
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container mx-auto px-4 py-5 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { setIsOpen(false); navigateWithLoader(link.path); }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-100">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    {user.avatar ? (
                      <img src={imageUrl(user.avatar)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-blue hover:bg-brand-blue/5 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => { logout(); setIsOpen(false); }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <a
                  href="mailto:info@vangitech.com?subject=Let's%20Work%20Together"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-blue hover:bg-brand-blue/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Mail size={18} /> Get in Touch
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
