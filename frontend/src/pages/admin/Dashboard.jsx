import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api';
import { useLoading } from '../../context/LoadingContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import toast from 'react-hot-toast';
import {
  Image, Users, Newspaper, Briefcase, FileText, ScrollText,
  ArrowUpRight, Loader2, TrendingUp, DollarSign, Target,
  BarChart3, Activity, Mail, Clock,
} from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

const Dashboard = () => {
  const { navigateWithLoader } = useLoading();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dash, heroR, testimonialR, newsR, clientsR, projectsR, messagesR] = await Promise.allSettled([
          API.get('/analytics/dashboard'),
          API.get('/admin/hero'),
          API.get('/admin/testimonials'),
          API.get('/admin/news'),
          API.get('/admin/clients'),
          API.get('/admin/projects'),
          API.get('/admin/messages'),
        ]);

        if (dash.status === 'fulfilled') setAnalytics(dash.value.data);
        if (dash.status === 'rejected') toast.error('Failed to load analytics');

        setStats({
          heroSlides: heroR.status === 'fulfilled' ? heroR.value.data.length : 0,
          testimonials: testimonialR.status === 'fulfilled' ? testimonialR.value.data.length : 0,
          news: newsR.status === 'fulfilled' ? newsR.value.data.length : 0,
          clients: clientsR.status === 'fulfilled' ? clientsR.value.data.length : 0,
          projects: projectsR.status === 'fulfilled' ? projectsR.value.data.length : 0,
          messages: messagesR.status === 'fulfilled' ? messagesR.value.data.length : 0,
        });
      } catch (e) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  const kpiCards = [
    {
      title: 'Pipeline Value',
      value: formatCurrency(kpis.pipelineValue),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/crm',
      tab: 'deals',
    },
    {
      title: 'Active Deals',
      value: kpis.activeDeals ?? kpis.totalDeals ?? 0,
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/admin/crm',
      tab: 'deals',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(kpis.mrr),
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/admin/crm',
      tab: 'reports',
    },
    {
      title: 'Win Rate',
      value: kpis.winRate != null ? `${Math.round(kpis.winRate)}%` : '—',
      icon: BarChart3,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/admin/crm',
      tab: 'reports',
    },
  ];

  const contentCards = [
    { title: 'Hero Slides', count: stats.heroSlides, icon: Image, color: 'from-blue-500 to-blue-600', link: '/admin/hero' },
    { title: 'Testimonials', count: stats.testimonials, icon: Users, color: 'from-emerald-500 to-emerald-600', link: '/admin/testimonials' },
    { title: 'News', count: stats.news, icon: Newspaper, color: 'from-purple-500 to-purple-600', link: '/admin/news' },
    { title: 'Clients', count: stats.clients, icon: Briefcase, color: 'from-orange-500 to-orange-600', link: '/admin/clients' },
    { title: 'Projects', count: stats.projects, icon: FileText, color: 'from-pink-500 to-pink-600', link: '/admin/projects' },
    { title: 'Messages', count: stats.messages, icon: Mail, color: 'from-teal-500 to-teal-600', link: '/admin/settings' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your agency at a glance</p>
        </div>
        <button
          onClick={() => navigateWithLoader('/')}
          className="inline-flex items-center gap-1.5 text-sm text-brand-blue font-medium hover:text-brand-blue/80 transition-colors"
        >
          View site <ArrowUpRight size={14} />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.title} to={`${kpi.link}${kpi.tab ? `?tab=${kpi.tab}` : ''}`}>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.title}</span>
                    <div className={`${kpi.bg} p-2 rounded-lg`}>
                      <Icon size={16} className={kpi.color} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Content Stats */}
      <Card className="border border-gray-200 shadow-sm mb-8">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">Content Overview</CardTitle>
            <Activity size={16} className="text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {contentCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.title} to={card.link}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer">
                    <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-shadow`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">{card.count}</span>
                    <span className="text-xs text-gray-500 text-center leading-tight">{card.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity + Quick Actions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
              <Link to="/admin/crm" className="text-xs text-brand-blue font-medium hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-1">
              {analytics?.recentActivity?.length > 0 ? (
                analytics.recentActivity.slice(0, 6).map((act, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      act.type === 'deal' ? 'bg-blue-50 text-blue-600' :
                      act.type === 'project' ? 'bg-purple-50 text-purple-600' :
                      act.type === 'contact' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {act.type === 'deal' ? <Target size={13} /> :
                       act.type === 'project' ? <FileText size={13} /> :
                       act.type === 'contact' ? <Users size={13} /> :
                       <Activity size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{act.description || act.message || act.title || 'Activity'}</p>
                      {act.date && <p className="text-xs text-gray-400">{new Date(act.date).toLocaleDateString()}</p>}
                    </div>
                    {act.value && <span className="text-xs font-semibold text-gray-900">{formatCurrency(act.value)}</span>}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-2">
              {[
                { label: '+ Deal', icon: Target, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', path: '/admin/crm', tab: 'deals' },
                { label: '+ Project', icon: FileText, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', path: '/admin/crm', tab: 'projects' },
                { label: '+ News', icon: Newspaper, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', path: '/admin/news' },
                { label: '+ Client', icon: Briefcase, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', path: '/admin/clients' },
                { label: '+ Testimonial', icon: Users, color: 'bg-pink-50 text-pink-600 hover:bg-pink-100', path: '/admin/testimonials' },
                { label: 'Reports', icon: BarChart3, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', path: '/admin/crm', tab: 'reports' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(`${action.path}${action.tab ? `?tab=${action.tab}` : ''}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                  >
                    <Icon size={16} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
