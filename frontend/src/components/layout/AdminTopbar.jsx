import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { imageUrl } from '../../api';
import { cn } from '@/lib/utils';

const AdminTopbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center justify-end px-4 sm:px-6 lg:px-8">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 hover:bg-gray-100 transition-colors"
        >
          {user?.avatar ? (
            <img
              src={imageUrl(user.avatar)}
              alt={user?.name || 'Admin'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-xs font-bold ring-2 ring-gray-200">
              {initials}
            </div>
          )}
          <span className="hidden sm:block text-left">
            <span className="block text-sm font-semibold text-gray-900 leading-tight max-w-40 truncate">
              {user?.name || 'Admin'}
            </span>
            <span className="block text-xs text-gray-500 leading-tight capitalize">
              {user?.role || ''}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={cn('text-gray-400 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-gray-200 shadow-xl py-2 z-30"
          >
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Link
              to="/vaccess/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminTopbar;
