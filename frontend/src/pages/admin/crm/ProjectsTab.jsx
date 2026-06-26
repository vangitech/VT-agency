import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  FolderKanban, Loader2, Plus, Search, Clock,
  Users, CheckCircle, Circle, DollarSign, Trash2,
  Calendar, ChevronRight, AlertCircle, BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

const STATUSES = [
  { id: 'onboarding', label: 'Onboarding', color: '#3b82f6' },
  { id: 'in_progress', label: 'In Progress', color: '#10b981' },
  { id: 'on_hold', label: 'On Hold', color: '#f59e0b' },
  { id: 'completed', label: 'Completed', color: '#6b7280' },
];

const ProjectsTab = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', clientName: '', clientEmail: '', clientPhone: '', description: '', status: 'onboarding', priority: 'medium', estimatedHours: '', budget: '', startDate: '' });

  const fetch = () => {
    const params = {};
    if (search) params.search = search;
    API.get('/projects', { params }).then((r) => setProjects(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  };

  const fetchStats = () =>
    API.get('/projects/stats').then((r) => setStats(r.data)).catch(() => {});

  useEffect(() => { Promise.all([fetch(), fetchStats()]); }, []);

  useEffect(() => { if (search) { const t = setTimeout(fetch, 300); return () => clearTimeout(t); } }, [search]);

  const openProject = async (id) => {
    setSelected(id);
    try {
      const res = await API.get(`/projects/${id}`);
      setDetail(res.data);
    } catch { toast.error('Failed to load project'); }
  };

  const handleChecklist = async (projectId, checklistId, completed) => {
    try {
      await API.put(`/projects/${projectId}/onboarding`, { checklistId, completed });
      openProject(projectId);
    } catch { toast.error('Failed to update'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, estimatedHours: Number(formData.estimatedHours), budget: Number(formData.budget) };
      if (selected) {
        await API.put(`/projects/${selected}`, payload);
        toast.success('Project updated');
      } else {
        await API.post('/projects', payload);
        toast.success('Project created');
      }
      setShowForm(false);
      fetch();
      fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await API.delete(`/projects/${id}`); toast.success('Deleted'); fetch(); fetchStats(); if (selected === id) { setSelected(null); setDetail(null); } }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  if (detail && selected) {
    const { project, totalHours, billableHours, totalExpenses } = detail;
    return (
      <div>
        <button onClick={() => { setSelected(null); setDetail(null); }} className="flex items-center gap-1.5 text-sm text-brand-blue font-medium mb-4"><ChevronRight size={16} className="rotate-180" /> Back</button>
        <Card className="border border-gray-100 shadow-sm">
          <div className="max-h-[70vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                <p className="text-sm text-gray-500">{project.clientName}{project.clientEmail ? ` — ${project.clientEmail}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${project.status === 'completed' ? 'bg-gray-100 text-gray-600' : project.status === 'in_progress' ? 'bg-green-50 text-green-600' : project.status === 'on_hold' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{project.status.replace('_', ' ')}</span>
                <Button variant="outline" size="sm" onClick={() => handleDelete(project._id)}><Trash2 size={12} /></Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Total Hours</p><p className="text-lg font-bold text-gray-900">{totalHours?.toFixed(1) || '0'}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Billable Hours</p><p className="text-lg font-bold text-green-600">{billableHours?.toFixed(1) || '0'}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Expenses</p><p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Budget</p><p className="text-lg font-bold text-gray-900">{formatCurrency(project.budget)}</p></div>
            </div>

            <p className="text-sm text-gray-600 mb-6">{project.description}</p>

            {Array.isArray(project.onboardingChecklist) && project.onboardingChecklist.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Onboarding Checklist</h3>
                <div className="space-y-2">
                  {project.onboardingChecklist.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <button onClick={() => handleChecklist(project._id, item._id, !item.completed)}>
                        {item.completed ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-300" />}
                      </button>
                      <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <span className="text-xs text-gray-400">Created {new Date(project.createdAt).toLocaleDateString()}</span>
              <Button variant="outline" size="sm" onClick={() => { setFormData({ name: project.name, clientName: project.clientName || '', clientEmail: project.clientEmail || '', clientPhone: project.clientPhone || '', description: project.description || '', status: project.status, priority: project.priority, estimatedHours: String(project.estimatedHours || ''), budget: String(project.budget || ''), startDate: project.startDate ? project.startDate.split('T')[0] : '' }); setShowForm(true); }} className="rounded-xl text-xs">Edit</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Total Projects</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.active}</p><p className="text-xs text-gray-500">Active</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-500">{stats.completed}</p><p className="text-xs text-gray-500">Completed</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-brand-blue">{stats.totalHours?.toFixed(0) || '0'}</p><p className="text-xs text-gray-500">Hours Logged</p></CardContent></Card>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-xs"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="h-10 rounded-xl pl-3 border-gray-200" /></div>
        <Button variant="blue" onClick={() => { setShowForm(true); }} className="rounded-xl"><Plus size={16} className="mr-1.5" /> New Project</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {!Array.isArray(projects) || projects.length === 0 ? (
          <div className="col-span-full text-center py-16"><FolderKanban size={40} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No projects yet</p></div>
        ) : projects.map((p) => (
          <button key={p._id} onClick={() => openProject(p._id)} className="text-left">
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === 'completed' ? 'bg-gray-100 text-gray-500' : p.status === 'in_progress' ? 'bg-green-50 text-green-600' : p.status === 'on_hold' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{p.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{p.clientName || 'No client'}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={11} /> {p.estimatedHours || 0}h</span>
                  <span className="flex items-center gap-1"><DollarSign size={11} /> {formatCurrency(p.budget)}</span>
                  {Array.isArray(p.team) && <span className="flex items-center gap-1"><Users size={11} /> {p.team.length}</span>}
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <Card className="w-full max-w-lg mx-4 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{selected ? 'Edit Project' : 'New Project'}</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1"><Label>Project Name</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required className="h-10 rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Client Name</Label><Input value={formData.clientName} onChange={(e) => setFormData((p) => ({ ...p, clientName: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Client Email</Label><Input type="email" value={formData.clientEmail} onChange={(e) => setFormData((p) => ({ ...p, clientEmail: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                  <div className="space-y-1"><Label>Priority</Label><select value={formData.priority} onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                  <div className="space-y-1"><Label>Est. Hours</Label><Input type="number" value={formData.estimatedHours} onChange={(e) => setFormData((p) => ({ ...p, estimatedHours: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Budget</Label><Input type="number" value={formData.budget} onChange={(e) => setFormData((p) => ({ ...p, budget: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="rounded-xl" /></div>
                <Button type="submit" variant="blue" className="rounded-xl w-full">{selected ? 'Update' : 'Create Project'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
