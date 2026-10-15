import { useLocation } from 'react-router-dom';
import { Home, FolderKanban, FileText, Phone, Info } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Quote', path: '/quote', icon: FileText, center: true },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Contact', path: '/contact', icon: Phone },
];

const MobileTabBar = () => {
  const location = useLocation();
  const { navigateWithLoader } = useLoading();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe"
    >
      <div className="grid grid-cols-5 items-end px-2 pt-1.5">
        {tabs.map((tab) => {
          const active =
            tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
          if (tab.center) {
            return (
              <button
                key={tab.path}
                onClick={() => navigateWithLoader(tab.path)}
                aria-label={tab.name}
                className="flex flex-col items-center gap-0.5 -mt-6 pb-1"
              >
                <span
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-blue/30 border-4 border-gray-50 transition-transform active:scale-95',
                    active
                      ? 'bg-gradient-to-br from-brand-blue to-brand-green'
                      : 'bg-gradient-to-br from-brand-darkBlue to-brand-blue'
                  )}
                >
                  <tab.icon size={24} />
                </span>
                <span className={cn('text-[10px] font-semibold', active ? 'text-brand-blue' : 'text-gray-500')}>
                  {tab.name}
                </span>
              </button>
            );
          }
          return (
            <button
              key={tab.path}
              onClick={() => navigateWithLoader(tab.path)}
              aria-label={tab.name}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center gap-1 py-2 min-h-16 transition-colors active:bg-gray-100 rounded-xl"
            >
              {active && <span className="absolute top-0.5 w-8 h-1 rounded-full bg-brand-blue" />}
              <tab.icon size={22} className={active ? 'text-brand-blue' : 'text-gray-400'} />
              <span className={cn('text-[10px] font-semibold', active ? 'text-brand-blue' : 'text-gray-500')}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
