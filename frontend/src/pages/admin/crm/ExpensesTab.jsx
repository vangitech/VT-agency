import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Receipt, Loader2, Plus, Search, Trash2,
  DollarSign, BarChart3, CheckCircle, Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

const ExpensesTab = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ project: '', category: 'other', amount: '', description: '', date: new Date().toISOString().split('T')[0], vendor: '', billable: true });

  const fetch = () =>
    API.get('/expenses').then((r) => setExpenses(Array.isArray(r.data.expenses) ? r.data.expenses : [])).catch(() => {}).finally(() => setLoading(false));

  const fetchStats = () =>
    API.get('/expenses/stats').then((r) => setStats(r.data)).catch(() => {});

  const fetchProjects = () =>
    API.get('/projects').then((r) => setProjects(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  useEffect(() => { Promise.all([fetch(), fetchStats(), fetchProjects()]); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.post('/expenses', { ...formData, amount: Number(formData.amount) });
      toast.success('Expense logged');
      setShowForm(false);
      setFormData({ project: '', category: 'other', amount: '', description: '', date: new Date().toISOString().split('T')[0], vendor: '', billable: true });
      fetch();
      fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete expense?')) return;
    try { await API.delete(`/expenses/${id}`); toast.success('Deleted'); fetch(); fetchStats(); } catch { toast.error('Failed to delete'); }
  };

  const handleApprove = async (id) => {
    try { await API.put(`/expenses/${id}/approve`); toast.success('Approved'); fetch(); } catch { toast.error('Failed to approve'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p><p className="text-xs text-gray-500">Total Expenses</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{formatCurrency(stats.billableAmount)}</p><p className="text-xs text-gray-500">Billable</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-brand-blue">{Array.isArray(stats.byCategory) ? stats.byCategory.length : 0}</p><p className="text-xs text-gray-500">Categories</p></CardContent></Card>
          <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{expenses.length}</p><p className="text-xs text-gray-500">Entries</p></CardContent></Card>
        </div>
      )}

      {Array.isArray(stats?.byCategory) && stats.byCategory.length > 0 && (
        <Card className="border border-gray-100 shadow-sm mb-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Category</h3>
            <div className="space-y-2">
              {stats.byCategory.map((c, i) => {
                const max = Math.max(...stats.byCategory.map((x) => x.total));
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-24 capitalize">{c._id}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(c.total / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-20 text-right">{formatCurrency(c.total)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Expense List</h3>
        <Button variant="blue" size="sm" onClick={() => setShowForm(true)} className="rounded-xl"><Plus size={14} className="mr-1" /> Add Expense</Button>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <div className="max-h-[50vh] overflow-y-auto">
          {!Array.isArray(expenses) || expenses.length === 0 ? (
            <div className="text-center py-12"><Receipt size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No expenses yet</p></div>
          ) : expenses.map((e) => (
            <div key={e._id} className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"><Wallet size={16} className="text-amber-500" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{e.description || e.category}</p>
                  <span className="text-xs font-bold text-gray-900">{formatCurrency(e.amount)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="capitalize">{e.category}</span>
                  <span>{new Date(e.date).toLocaleDateString()}</span>
                  <span>{e.vendor ? `— ${e.vendor}` : ''}</span>
                  <span className={`px-1.5 py-0.5 rounded-full ${e.billable ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{e.billable ? 'Billable' : 'Non-billable'}</span>
                  {e.approvedBy ? <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10} /> Approved</span> : <span className="text-amber-500">Pending</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!e.approvedBy && <Button variant="ghost" size="sm" onClick={() => handleApprove(e._id)}><CheckCircle size={12} className="text-green-500" /></Button>}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(e._id)}><Trash2 size={12} className="text-gray-400" /></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <Card className="w-full max-w-md mx-4 border border-gray-100 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Expense</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Amount</Label><Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))} required className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} required className="h-10 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Category</Label><select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">
                    <option value="travel">Travel</option><option value="software">Software</option><option value="hardware">Hardware</option><option value="subscription">Subscription</option><option value="consulting">Consulting</option><option value="marketing">Marketing</option><option value="food">Food</option><option value="transport">Transport</option><option value="other">Other</option>
                  </select></div>
                  <div className="space-y-1"><Label>Project (optional)</Label><select value={formData.project} onChange={(e) => setFormData((p) => ({ ...p, project: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3"><option value="">None</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                </div>
                <div className="space-y-1"><Label>Vendor</Label><Input value={formData.vendor} onChange={(e) => setFormData((p) => ({ ...p, vendor: e.target.value }))} className="h-10 rounded-xl" /></div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} required className="rounded-xl" /></div>
                <div className="flex items-center gap-2"><input type="checkbox" checked={formData.billable} onChange={(e) => setFormData((p) => ({ ...p, billable: e.target.checked }))} className="rounded" /><Label className="text-sm">Billable to client</Label></div>
                <Button type="submit" variant="blue" className="rounded-xl w-full"><Receipt size={14} className="mr-1.5" /> Add Expense</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
