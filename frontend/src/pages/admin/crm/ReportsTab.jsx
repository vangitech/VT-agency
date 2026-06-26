import { useState, useEffect } from 'react';
import API from '../../../api';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  BarChart3, TrendingUp, Target, DollarSign,
  Loader2, Activity, Users, Phone, Mail,
  PieChart, Award, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

const ReportsTab = () => {
  const [dashData, setDashData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [attributionData, setAttributionData] = useState(null);
  const [winLossData, setWinLossData] = useState(null);
  const [velocityData, setVelocityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dash, rev, attr, wl, vel] = await Promise.all([
          API.get('/analytics/dashboard'),
          API.get('/analytics/revenue'),
          API.get('/analytics/attribution'),
          API.get('/analytics/win-loss'),
          API.get('/analytics/velocity'),
        ]);
        setDashData(dash.data);
        setRevenueData(rev.data);
        setAttributionData(attr.data);
        setWinLossData(wl.data);
        setVelocityData(vel.data);
      } catch (e) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  const reports = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'attribution', label: 'Attribution', icon: PieChart },
    { id: 'velocity', label: 'Velocity', icon: Zap },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => setActiveReport(r.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                activeReport === r.id ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue'
              }`}>
              <Icon size={16} /> {r.label}
            </button>
          );
        })}
      </div>

      {activeReport === 'overview' && dashData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pipeline Value</p>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><DollarSign size={16} className="text-brand-blue" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashData.kpis.pipelineValue)}</p>
                <p className="text-xs text-gray-400 mt-1">{dashData.kpis.totalDeals} open deals</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Won Deals</p>
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center"><Award size={16} className="text-green-600" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashData.kpis.wonDeals}</p>
                <p className="text-xs text-gray-400 mt-1">Closed won</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</p>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Target size={16} className="text-purple-600" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashData.kpis.activeProjects}</p>
                <p className="text-xs text-gray-400 mt-1">of {dashData.kpis.totalProjects} total</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hours This Month</p>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><Activity size={16} className="text-amber-600" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashData.kpis.hoursThisMonth}</p>
                <p className="text-xs text-gray-400 mt-1">{formatCurrency(dashData.kpis.expensesThisMonth)} expenses</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</p>
                  <Users size={16} className="text-brand-blue" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashData.kpis.totalContacts}</p>
                <p className="text-xs text-gray-400 mt-1">+{dashData.kpis.newContactsThisMonth} this month</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unread Messages</p>
                  <Mail size={16} className="text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-600">{dashData.kpis.messagesUnread}</p>
                <p className="text-xs text-gray-400 mt-1">In inbox</p>
              </CardContent>
            </Card>
            {velocityData && (
              <>
                <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cycle</p>
                      <Zap size={16} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{velocityData.avgCycleDays}<span className="text-sm font-normal text-gray-500"> days</span></p>
                    <p className="text-xs text-gray-400 mt-1">Deal close time</p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</p>
                      <Target size={16} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{winLossData?.winRate || 0}%</p>
                    <p className="text-xs text-gray-400 mt-1">{winLossData?.totalWon || 0} won / {winLossData?.totalLost || 0} lost</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {revenueData && (
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">Monthly Revenue</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">MRR: <strong className="text-gray-900">{formatCurrency(revenueData.mrr)}</strong></span>
                    <span className={`${revenueData.mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenueData.mrrGrowth >= 0 ? '+' : ''}{revenueData.mrrGrowth}% MoM
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-32">
                  {revenueData.monthlyRevenue.map((m, i) => {
                    const max = Math.max(...revenueData.monthlyRevenue.map((x) => x.revenue));
                    const height = max > 0 ? (m.revenue / max) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-gray-400 font-medium">{formatCurrency(m.revenue)}</span>
                        <div className="w-full bg-brand-blue/10 rounded-t-md relative" style={{ height: `${Math.max(height, 4)}%` }}>
                          <div className="absolute bottom-0 w-full bg-brand-blue rounded-t-md transition-all" style={{ height: `${height}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-500">{m._id.slice(5)}</span>
                      </div>
                    );
                  })}
                  {revenueData.monthlyRevenue.length === 0 && <p className="text-xs text-gray-400 py-8 w-full text-center">No revenue data yet</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeReport === 'revenue' && revenueData && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueData.totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold text-brand-blue">{formatCurrency(revenueData.mrr)}</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">MoM Growth</p>
                <p className={`text-3xl font-bold ${revenueData.mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{revenueData.mrrGrowth >= 0 ? '+' : ''}{revenueData.mrrGrowth}%</p>
              </CardContent>
            </Card>
          </div>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-xs text-gray-500 font-medium">Month</th><th className="text-right py-2 text-xs text-gray-500 font-medium">Deals</th><th className="text-right py-2 text-xs text-gray-500 font-medium">Revenue</th></tr></thead>
                  <tbody>
                    {revenueData.monthlyRevenue.map((m, i) => (
                      <tr key={i} className="border-b border-gray-50"><td className="py-2 text-gray-700">{m._id}</td><td className="py-2 text-right text-gray-700">{m.deals}</td><td className="py-2 text-right font-semibold text-gray-900">{formatCurrency(m.revenue)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeReport === 'pipeline' && dashData && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Pipeline Value</p><p className="text-3xl font-bold text-gray-900">{formatCurrency(dashData.kpis.pipelineValue)}</p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Open Deals</p><p className="text-3xl font-bold text-brand-blue">{dashData.kpis.totalDeals}</p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Won</p><p className="text-3xl font-bold text-green-600">{dashData.kpis.wonDeals}</p></CardContent></Card>
          </div>
          {velocityData && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5"><p className="text-xs text-gray-500 mb-1">Avg Sales Cycle</p><p className="text-2xl font-bold text-gray-900">{velocityData.avgCycleDays} <span className="text-sm font-normal text-gray-500">days</span></p></CardContent></Card>
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5"><p className="text-xs text-gray-500 mb-1">Sales Velocity</p><p className="text-2xl font-bold text-purple-600">{velocityData.velocityScore}</p></CardContent></Card>
            </div>
          )}
          {winLossData && (
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Win / Loss</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1"><span className="text-green-600 font-medium">Won ({winLossData.totalWon})</span><span className="text-gray-500">{winLossData.winRate}%</span></div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${winLossData.winRate}%` }} /></div>
                </div>
              </div>
              {Array.isArray(winLossData.byLostReason) && winLossData.byLostReason.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Lost Reasons</p>
                  {winLossData.byLostReason.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 py-1"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="flex-1">{r._id}</span><span className="font-medium">{r.count}</span></div>
                  ))}
                </div>
              )}
            </CardContent></Card>
          )}
        </div>
      )}

      {activeReport === 'activity' && (
        <Card className="border border-gray-100 shadow-sm"><CardContent className="p-6 text-center">
          <Activity size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Activity reports with interaction breakdowns</p>
          <p className="text-xs text-gray-400 mt-1">Filter by date range to see call, email, and meeting activity per rep</p>
        </CardContent></Card>
      )}

      {activeReport === 'attribution' && attributionData && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Total Deals</p><p className="text-3xl font-bold text-gray-900">{attributionData.totalDeals}</p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Won</p><p className="text-3xl font-bold text-green-600">{attributionData.totalWon}</p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Sources</p><p className="text-3xl font-bold text-brand-blue">{Array.isArray(attributionData.bySource) ? attributionData.bySource.length : 0}</p></CardContent></Card>
          </div>
          {Array.isArray(attributionData.bySource) && attributionData.bySource.length > 0 ? (
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Source</h3>
              <div className="space-y-3">
                {attributionData.bySource.map((s, i) => {
                  const max = Math.max(...attributionData.bySource.map((x) => x.value));
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 capitalize">{s._id}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{s.count} deals ({s.won} won)</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(s.value)}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-blue to-brand-green rounded-full" style={{ width: `${(s.value / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent></Card>
          ) : <Card className="border border-gray-100 shadow-sm"><CardContent className="p-6 text-center"><p className="text-xs text-gray-400">No attribution data yet. Set deal sources to track.</p></CardContent></Card>}
        </div>
      )}

      {activeReport === 'velocity' && velocityData && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Avg Sales Cycle</p><p className="text-3xl font-bold text-gray-900">{velocityData.avgCycleDays}<span className="text-sm font-normal text-gray-500"> days</span></p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Avg Monthly Deals</p><p className="text-3xl font-bold text-brand-blue">{velocityData.avgMonthlyDeals}</p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5 text-center"><p className="text-xs text-gray-500 mb-1">Velocity Score</p><p className="text-3xl font-bold text-purple-600">{velocityData.velocityScore}</p></CardContent></Card>
          </div>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-xs text-gray-500 font-medium">Month</th><th className="text-right py-2 text-xs text-gray-500 font-medium">Deals Won</th><th className="text-right py-2 text-xs text-gray-500 font-medium">Revenue</th></tr></thead>
                <tbody>
                  {velocityData.monthlyHistory.map((m, i) => (
                    <tr key={i} className="border-b border-gray-50"><td className="py-2 text-gray-700">{m._id}</td><td className="py-2 text-right text-gray-700">{m.count}</td><td className="py-2 text-right font-semibold text-gray-900">{formatCurrency(m.value)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
