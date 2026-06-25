import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Image, Users, Newspaper, Briefcase,
  Settings, FileText, LogOut, ChevronLeft, Menu, X, ScrollText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { imageUrl } from '../../api';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Hero Slides', path: '/admin/hero', icon: Image },
  { name: 'Testimonials', path: '/admin/testimonials', icon: Users },
  { name: 'News', path: '/admin/news', icon: Newspaper },
  { name: 'Clients', path: '/admin/clients', icon: Briefcase },
  { name: 'Projects', path: '/admin/projects', icon: FileText },
  { name: 'Legal Pages', path: '/admin/legal', icon: ScrollText },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800/50">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs leading-none tracking-tight">VT</span>
          </div>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={14} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-brand-blue/10 text-brand-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-800/50 p-3">
        <div className="flex items-center gap-3 px-1">
          {user?.avatar ? (
            <img src={imageUrl(user.avatar)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar - mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 bg-gray-900 border-r border-gray-800 transition-all duration-200 hidden lg:flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
