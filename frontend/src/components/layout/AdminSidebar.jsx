import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Image, Users, Newspaper, Briefcase,
  Settings, FileText, ChevronLeft, ScrollText, Shield, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';
import logoSrc from '../../assets/images/Vangitech Logo.png';

const navItems = [
  { name: 'Dashboard', path: '/vaccess/dashboard', icon: LayoutDashboard },
  { name: 'Hero Slides', path: '/vaccess/hero', icon: Image },
  { name: 'Testimonials', path: '/vaccess/testimonials', icon: Users },
  { name: 'News', path: '/vaccess/news', icon: Newspaper },
  { name: 'Clients', path: '/vaccess/clients', icon: Briefcase },
  { name: 'Projects', path: '/vaccess/projects', icon: FileText },
  { name: 'Legal Pages', path: '/vaccess/legal', icon: ScrollText },
  { name: 'CRM', path: '/vaccess/crm', icon: MessageSquare },
  { name: 'Users', path: '/vaccess/users', icon: Shield, superadmin: true },
  { name: 'Settings', path: '/vaccess/settings', icon: Settings },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const open = () => setMobileOpen(true);
    window.addEventListener('open-admin-sidebar', open);
    return () => window.removeEventListener('open-admin-sidebar', open);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800/50">
        <Link to="/vaccess/dashboard" className="flex flex-col items-center">
          <span className="text-[8px] text-gray-500 font-medium leading-tight tracking-wider"></span>
          <img src={logoSrc} alt="Vangitech" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
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
        {navItems.filter((item) => !item.superadmin || user?.role === 'superadmin').map((item) => {
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
