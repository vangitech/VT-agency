import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Users, Loader2, AlertTriangle, CheckCircle,
  Clock, Briefcase, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResourcesTab = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overall, setOverall] = useState(null);

  const fetch = () =>
    API.get('/resources/capacity-report').then((r) => {
      setResources(Array.isArray(r.data.resources) ? r.data.resources : []);
      setOverall(r.data.overall);
    }).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { fetch(); }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-50 text-green-600 border-green-200';
      case 'partial': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'full': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'overbooked': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'partial': return 'bg-blue-500';
      case 'full': return 'bg-amber-500';
      case 'overbooked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div>
      {overall && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Total Capacity</p>
                <Users size={16} className="text-brand-blue" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{overall.totalCapacity}h <span className="text-sm font-normal text-gray-500">/ week</span></p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Currently Allocated</p>
                <Clock size={16} className="text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{overall.totalAllocated}h <span className="text-sm font-normal text-gray-500">/ week</span></p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Avg Utilization</p>
                <BarChart3 size={16} className="text-brand-blue" />
              </div>
              <p className={`text-2xl font-bold ${overall.avgUtilization >= 80 ? 'text-red-600' : overall.avgUtilization >= 50 ? 'text-amber-600' : 'text-green-600'}`}>{overall.avgUtilization}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!Array.isArray(resources) || resources.length === 0 ? (
          <div className="col-span-full text-center py-16"><Users size={40} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No resources configured</p></div>
        ) : resources.map((r) => (
          <Card key={r._id} className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-sm font-bold">
                    {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{r.role || r.user?.role || 'Team Member'}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${getStatusColor(r.status)}`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Capacity: {r.currentAllocation}h / {r.weeklyCapacity}h</span>
                  <span>{r.utilization}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${r.utilization >= 100 ? 'bg-red-500' : r.utilization >= 80 ? 'bg-amber-500' : r.utilization >= 50 ? 'bg-blue-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(r.utilization, 100)}%` }} />
                </div>
              </div>

              {Array.isArray(r.assignments) && r.assignments.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Assignments</p>
                  {r.assignments.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                      <Briefcase size={10} className="text-gray-400" />
                      <span className="flex-1 truncate">{a.project?.name || 'Project'}</span>
                      <span className="font-medium">{a.allocation}h</span>
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(r.timeOff) && r.timeOff.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  {r.timeOff.map((to, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mt-1">
                      <Calendar size={10} />
                      <span>Time off: {new Date(to.start).toLocaleDateString()} - {new Date(to.end).toLocaleDateString()}</span>
                      {to.reason && <span>({to.reason})</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BarChart3 = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export default ResourcesTab;
