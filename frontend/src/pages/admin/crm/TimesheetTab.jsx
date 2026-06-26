import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Clock, Loader2, Plus, Search, Trash2,
  DollarSign, BarChart3, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TimesheetTab = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ project: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', category: 'development', billable: true });

  const fetch = () =>
    API.get('/timesheets').then((r) => setEntries(Array.isArray(r.data.entries) ? r.data.entries : [])).catch(() => {}).finally(() => setLoading(false));

  const fetchStats = () =>
    API.get('/timesheets/stats', { params: { start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), end: new Date().toISOString() } }).then((r) => setStats(r.data)).catch(() => {});

  const fetchProjects = () =>
    API.get('/projects').then((r) => setProjects(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  useEffect(() => { Promise.all([fetch(), fetchStats(), fetchProjects()]); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.post('/timesheets', { ...formData, hours: Number(formData.hours) });
      toast.success('Time logged');
      setShowForm(false);
      setFormData({ project: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', category: 'development', billable: true });
      fetch();
      fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete entry?')) return;
    try { await API.delete(`/timesheets/${id}`); toast.success('Deleted'); fetch(); fetchStats(); } catch { toast.error('Failed to delete'); }
  };

  const formatHours = (h) => `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{stats.stats?.totalHours?.toFixed(1) || '0'}</p><p className="text-xs text-gray-500">Total Hours</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.stats?.billableHours?.toFixed(1) || '0'}</p><p className="text-xs text-gray-500">Billable Hours</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-brand-blue">{stats.stats?.entries || 0}</p><p className="text-xs text-gray-500">Entries</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{Array.isArray(stats.byProject) ? stats.byProject.length : 0}</p><p className="text-xs text-gray-500">Projects</p></CardContent></Card>
        </div>
      )}

      {Array.isArray(stats?.byProject) && stats.byProject.length > 0 && (
        <Card className="border border-gray-100 shadow-sm mb-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Hours by Project (This Month)</h3>
            <div className="space-y-2">
              {stats.byProject.map((p, i) => {
                const project = projects.find((pr) => pr._id === p._id);
                const max = Math.max(...stats.byProject.map((x) => x.hours));
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-32 truncate">{project?.name || 'Unknown'}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(p.hours / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-16 text-right">{p.hours.toFixed(1)}h</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Recent Entries</h3>
        <Button variant="blue" size="sm" onClick={() => setShowForm(true)} className="rounded-xl"><Plus size={14} className="mr-1" /> Log Time</Button>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <div className="max-h-[50vh] overflow-y-auto">
          {!Array.isArray(entries) || entries.length === 0 ? (
            <div className="text-center py-12"><Clock size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No time entries yet</p></div>
          ) : entries.map((e) => (
            <div key={e._id} className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0"><Clock size={16} className="text-brand-blue" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{e.project?.name || 'General'}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{new Date(e.date).toLocaleDateString()}</span>
                  <span>{formatHours(e.hours)}</span>
                  <span className={`px-1.5 py-0.5 rounded-full ${e.billable ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{e.billable ? 'Billable' : 'Non-billable'}</span>
                  <span>{e.category}</span>
                </div>
                {e.description && <p className="text-xs text-gray-400 mt-0.5">{e.description}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(e._id)}><Trash2 size={12} className="text-gray-400" /></Button>
            </div>
          ))}
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <Card className="w-full max-w-md mx-4 border border-gray-100 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Log Time</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1"><Label>Project</Label><select value={formData.project} onChange={(e) => setFormData((p) => ({ ...p, project: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3"><option value="">General</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} required className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Hours</Label><Input type="number" step="0.25" min="0" max="24" value={formData.hours} onChange={(e) => setFormData((p) => ({ ...p, hours: e.target.value }))} required className="h-10 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Category</Label><select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">
                    <option value="development">Development</option><option value="design">Design</option><option value="consulting">Consulting</option><option value="meeting">Meeting</option><option value="research">Research</option><option value="support">Support</option><option value="admin">Admin</option>
                  </select></div>
                  <div className="space-y-1"><Label className="flex items-center gap-2"><input type="checkbox" checked={formData.billable} onChange={(e) => setFormData((p) => ({ ...p, billable: e.target.checked }))} className="rounded" /> Billable</Label></div>
                </div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-xl" /></div>
                <Button type="submit" variant="blue" className="rounded-xl w-full"><Clock size={14} className="mr-1.5" /> Log Time</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TimesheetTab;
