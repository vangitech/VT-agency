import { useState, useEffect, useRef } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Plus, Loader2, DollarSign, Calendar, User,
  Phone, Mail, Building2, Trash2, GripVertical,
  Target, Clock, TrendingUp, X, ChevronRight,
  BarChart3, AlertCircle, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'Prospecting', label: 'Prospecting', color: '#6b7280' },
  { id: 'Qualification', label: 'Qualification', color: '#3b82f6' },
  { id: 'Proposal', label: 'Proposal', color: '#8b5cf6' },
  { id: 'Negotiation', label: 'Negotiation', color: '#f59e0b' },
  { id: 'Closed Won', label: 'Closed Won', color: '#10b981' },
  { id: 'Closed Lost', label: 'Closed Lost', color: '#ef4444' },
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DealsTab = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [formData, setFormData] = useState({ title: '', value: '', probability: '', stage: 'Prospecting', company: '', email: '', phone: '', source: '', notes: '', expectedCloseDate: '' });
  const [forecast, setForecast] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ deal: '', type: 'task', subject: '', description: '', dueDate: '', priority: 'medium' });
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [draggedDeal, setDraggedDeal] = useState(null);

  const fetchDeals = () => {
    const params = {};
    if (search) params.search = search;
    API.get('/deals', { params }).then((r) => {
      setDeals(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const fetchStats = () =>
    API.get('/deals/pipeline-stats').then((r) => setStats(r.data)).catch(() => {});

  const fetchForecast = () =>
    API.get('/deals/forecast').then((r) => setForecast(r.data)).catch(() => {});

  const fetchUsers = () =>
    API.get('/auth/users').then((r) => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  useEffect(() => {
    Promise.all([fetchDeals(), fetchStats(), fetchForecast(), fetchUsers()]);
  }, []);

  useEffect(() => {
    if (!search) return;
    const t = setTimeout(fetchDeals, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDrop = async (stageId) => {
    if (!draggedDeal || draggedDeal.stage === stageId) return;
    try {
      const updated = await API.put(`/deals/${draggedDeal._id}`, { stage: stageId });
      if (stageId === 'Closed Won') {
        toast.success('Deal won! Project auto-created.');
      }
      setDeals((prev) => prev.map((d) => d._id === draggedDeal._id ? { ...d, stage: stageId } : d));
      fetchStats();
      fetchForecast();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move deal');
    }
    setDraggedDeal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    try {
      await API.delete(`/deals/${id}`);
      toast.success('Deal deleted');
      fetchDeals();
      fetchStats();
      fetchForecast();
    } catch { toast.error('Failed to delete'); }
  };

  const openForm = (deal = null) => {
    if (deal) {
      setEditDeal(deal);
      setFormData({ title: deal.title, value: String(deal.value || ''), probability: String(deal.probability || ''), stage: deal.stage, company: deal.company || '', email: deal.email || '', phone: deal.phone || '', source: deal.source || '', notes: deal.notes || '', expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '' });
    } else {
      setEditDeal(null);
      setFormData({ title: '', value: '', probability: '', stage: 'Prospecting', company: '', email: '', phone: '', source: '', notes: '', expectedCloseDate: '' });
    }
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, value: Number(formData.value), probability: Number(formData.probability) };
      if (editDeal) {
        await API.put(`/deals/${editDeal._id}`, payload);
        toast.success('Deal updated');
      } else {
        await API.post('/deals', payload);
        toast.success('Deal created');
      }
      setShowForm(false);
      fetchDeals();
      fetchStats();
      fetchForecast();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const openActivities = async (deal) => {
    try {
      const res = await API.get(`/deals/${deal._id}`);
      setActivities(Array.isArray(res.data.activities) ? res.data.activities : []);
      setEditDeal(deal);
    } catch {}
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await API.post('/deals/activities', activityForm);
      toast.success('Activity added');
      setShowActivityForm(false);
      setActivityForm({ deal: '', type: 'task', subject: '', description: '', dueDate: '', priority: 'medium' });
      if (editDeal) openActivities(editDeal);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add activity');
    }
  };

  const completeActivity = async (id) => {
    try {
      await API.put(`/deals/activities/${id}`, { status: 'completed', completedAt: new Date() });
      if (editDeal) openActivities(editDeal);
    } catch { toast.error('Failed to update'); }
  };

  const getStageDeals = (stageId) => deals.filter((d) => d.stage === stageId);

  const totalWeighted = deals.reduce((s, d) => {
    if (d.stage === 'Closed Lost' || d.stage === 'Closed Won') return s;
    return s + (d.value * d.probability / 100);
  }, 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {forecast && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><DollarSign size={18} className="text-brand-blue" /></div><div><p className="text-xl font-bold text-gray-900">{formatCurrency(forecast.weightedForecast)}</p><p className="text-xs text-gray-500">Weighted Forecast</p></div></div></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><TrendingUp size={18} className="text-green-600" /></div><div><p className="text-xl font-bold text-gray-900">{formatCurrency(forecast.totalPipeline)}</p><p className="text-xs text-gray-500">Pipeline Value</p></div></div></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Target size={18} className="text-purple-600" /></div><div><p className="text-xl font-bold text-gray-900">{forecast.dealCount}</p><p className="text-xs text-gray-500">Open Deals</p></div></div></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><BarChart3 size={18} className="text-amber-600" /></div><div><p className="text-xl font-bold text-gray-900">{forecast.monthlyData?.length || 0}</p><p className="text-xs text-gray-500">Months of Data</p></div></div></CardContent></Card>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deals..." className="h-10 rounded-xl pl-3 border-gray-200" />
        </div>
        <Button variant="blue" onClick={() => openForm()} className="rounded-xl"><Plus size={16} className="mr-1.5" /> New Deal</Button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[900px]">
          {STAGES.map((stage) => {
            const stageDeals = getStageDeals(stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage.id} className="flex-1 min-w-[140px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{formatCurrency(stageValue)}</span>
                </div>
                <div className="space-y-2 min-h-[200px] rounded-xl bg-gray-50/80 p-2 border border-gray-100">
                  {stageDeals.map((deal) => (
                    <div key={deal._id} draggable onDragStart={() => handleDragStart(deal)}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{deal.title}</p>
                        <button onClick={() => handleDelete(deal._id)} className="opacity-0 group-hover:opacity-100"><Trash2 size={12} className="text-gray-300 hover:text-red-500" /></button>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.value)}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${deal.probability}%`, backgroundColor: stage.color }} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">{deal.probability}%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                        {deal.company && <span className="flex items-center gap-1"><Building2 size={10} /> {deal.company}</span>}
                        {deal.expectedCloseDate && <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(deal.expectedCloseDate)}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                        <Button variant="ghost" size="sm" onClick={() => openForm(deal)} className="text-[10px] h-6 px-2 rounded-lg">Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => openActivities(deal)} className="text-[10px] h-6 px-2 rounded-lg">Tasks</Button>
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-xs text-gray-400">Drop deals here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <Card className="w-full max-w-lg mx-4 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">{editDeal ? 'Edit Deal' : 'New Deal'}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X size={16} /></Button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1"><Label>Deal Name</Label><Input value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required className="h-10 rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Value</Label><Input type="number" value={formData.value} onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Probability %</Label><Input type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData((p) => ({ ...p, probability: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Stage</Label><select value={formData.stage} onChange={(e) => setFormData((p) => ({ ...p, stage: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                  <div className="space-y-1"><Label>Close Date</Label><Input type="date" value={formData.expectedCloseDate} onChange={(e) => setFormData((p) => ({ ...p, expectedCloseDate: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Company</Label><Input value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Source</Label><Input value={formData.source} onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value }))} className="h-10 rounded-xl" placeholder="LinkedIn, Referral, etc." /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="space-y-1"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={3} className="rounded-xl" /></div>
                <Button type="submit" variant="blue" className="rounded-xl w-full">{editDeal ? 'Update Deal' : 'Create Deal'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {editDeal && activities.length > 0 && !showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) { setActivities([]); } }}>
          <Card className="w-full max-w-md mx-4 border border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Tasks — {editDeal.title}</h3>
                <div className="flex gap-2">
                  <Button variant="blue" size="sm" onClick={() => { setActivityForm((p) => ({ ...p, deal: editDeal._id })); setShowActivityForm(true); }} className="text-xs rounded-lg"><Plus size={12} className="mr-1" /> Add</Button>
                  <Button variant="ghost" size="sm" onClick={() => setActivities([])}><X size={14} /></Button>
                </div>
              </div>
              <div className="space-y-2">
                {activities.map((a) => (
                  <div key={a._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <button onClick={() => completeActivity(a._id)} className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 ${a.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {a.status === 'completed' && <CheckCircle size={14} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${a.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{a.subject}</p>
                      {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                        <span>{a.type}</span>
                        {a.dueDate && <span>Due: {formatDate(a.dueDate)}</span>}
                        <span className={`px-1.5 py-0.5 rounded-full ${a.priority === 'high' ? 'bg-red-50 text-red-500' : a.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-500'}`}>{a.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showActivityForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowActivityForm(false); }}>
          <Card className="w-full max-w-md mx-4 border border-gray-100 shadow-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Add Task</h3>
              <form onSubmit={handleAddActivity} className="space-y-3">
                <div className="space-y-1"><Label>Type</Label><select value={activityForm.type} onChange={(e) => setActivityForm((p) => ({ ...p, type: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">
                  <option value="task">Task</option><option value="call">Call</option><option value="email">Email</option><option value="meeting">Meeting</option><option value="follow_up">Follow Up</option>
                </select></div>
                <div className="space-y-1"><Label>Subject</Label><Input value={activityForm.subject} onChange={(e) => setActivityForm((p) => ({ ...p, subject: e.target.value }))} required className="h-9 rounded-xl" /></div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={activityForm.description} onChange={(e) => setActivityForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Due Date</Label><Input type="date" value={activityForm.dueDate} onChange={(e) => setActivityForm((p) => ({ ...p, dueDate: e.target.value }))} className="h-9 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Priority</Label><select value={activityForm.priority} onChange={(e) => setActivityForm((p) => ({ ...p, priority: e.target.value }))} className="w-full h-9 rounded-xl border border-gray-200 text-sm px-3">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="blue" className="rounded-xl flex-1">Add</Button>
                  <Button type="button" variant="outline" onClick={() => setShowActivityForm(false)} className="rounded-xl">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DealsTab;
