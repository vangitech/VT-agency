import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Zap, Loader2, Plus, Trash2, Play, Pause,
  Target, Users, BarChart3, Mail, Bell,
  ToggleLeft, ToggleRight, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

const WorkflowsTab = () => {
  const [activeTab, setActiveTab] = useState('sequences');
  const [sequences, setSequences] = useState([]);
  const [rules, setRules] = useState([]);
  const [leadScores, setLeadScores] = useState([]);
  const [scoringStats, setScoringStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('sequence');
  const [formData, setFormData] = useState({ name: '', description: '', trigger: 'manual', triggerValue: '', status: 'draft', steps: [{ order: 1, subject: '', body: '', delayDays: 0 }] });
  const [ruleForm, setRuleForm] = useState({ name: '', description: '', trigger: 'deal.created', triggerValue: '', actions: [{ type: 'assign_owner', config: {} }] });

  const fetchSequences = () =>
    API.get('/workflows/sequences').then((r) => setSequences(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  const fetchRules = () =>
    API.get('/workflows/rules').then((r) => setRules(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  const fetchScores = () =>
    API.get('/workflows/lead-scores', { params: { limit: 20 } }).then((r) => setLeadScores(Array.isArray(r.data.scores) ? r.data.scores : [])).catch(() => {});

  const fetchScoreStats = () =>
    API.get('/workflows/lead-scores/stats').then((r) => setScoringStats(r.data)).catch(() => {});

  useEffect(() => {
    Promise.all([fetchSequences(), fetchRules(), fetchScores(), fetchScoreStats()]).finally(() => setLoading(false));
  }, []);

  const handleSaveSequence = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await API.put(`/workflows/sequences/${formData._id}`, formData);
        toast.success('Sequence updated');
      } else {
        await API.post('/workflows/sequences', formData);
        toast.success('Sequence created');
      }
      setShowForm(false);
      setFormData({ name: '', description: '', trigger: 'manual', triggerValue: '', status: 'draft', steps: [{ order: 1, subject: '', body: '', delayDays: 0 }] });
      fetchSequences();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      if (ruleForm._id) {
        await API.put(`/workflows/rules/${ruleForm._id}`, ruleForm);
        toast.success('Rule updated');
      } else {
        await API.post('/workflows/rules', ruleForm);
        toast.success('Rule created');
      }
      setShowForm(false);
      setRuleForm({ name: '', description: '', trigger: 'deal.created', triggerValue: '', actions: [{ type: 'assign_owner', config: {} }] });
      fetchRules();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const toggleRule = async (rule) => {
    try {
      await API.put(`/workflows/rules/${rule._id}`, { active: !rule.active });
      toast.success(`Rule ${rule.active ? 'paused' : 'activated'}`);
      fetchRules();
    } catch { toast.error('Failed to toggle'); }
  };

  const deleteSequence = async (id) => {
    if (!window.confirm('Delete this sequence?')) return;
    try { await API.delete(`/workflows/sequences/${id}`); toast.success('Deleted'); fetchSequences(); } catch { toast.error('Failed to delete'); }
  };

  const deleteRule = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try { await API.delete(`/workflows/rules/${id}`); toast.success('Deleted'); fetchRules(); } catch { toast.error('Failed to delete'); }
  };

  const recalculateScore = async (id) => {
    try {
      await API.post(`/workflows/lead-scores/${id}/recalculate`);
      toast.success('Score recalculated');
      fetchScores();
      fetchScoreStats();
    } catch { toast.error('Failed to recalculate'); }
  };

  const addStep = () => setFormData((p) => ({ ...p, steps: [...p.steps, { order: p.steps.length + 1, subject: '', body: '', delayDays: 0 }] }));
  const addAction = () => setRuleForm((p) => ({ ...p, actions: [...p.actions, { type: 'add_tag', config: {} }] }));

  const getLevelBadge = (level) => {
    switch (level) {
      case 'hot': return 'bg-red-50 text-red-600';
      case 'warm': return 'bg-amber-50 text-amber-600';
      case 'cold': return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  const tabs = [
    { id: 'sequences', label: 'Email Sequences', icon: Mail },
    { id: 'rules', label: 'Automation Rules', icon: Zap },
    { id: 'scores', label: 'Lead Scoring', icon: Target },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue'}`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'sequences' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">{sequences.length} Sequences</h3>
            <Button variant="blue" size="sm" onClick={() => { setFormMode('sequence'); setShowForm(true); }} className="rounded-xl"><Plus size={14} className="mr-1" /> New Sequence</Button>
          </div>
          <div className="space-y-3">
            {!Array.isArray(sequences) || sequences.length === 0 ? (
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-8 text-center"><Mail size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No email sequences yet</p></CardContent></Card>
            ) : sequences.map((seq) => (
              <Card key={seq._id} className="border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-brand-blue" />
                      <p className="text-sm font-semibold text-gray-900">{seq.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${seq.status === 'active' ? 'bg-green-50 text-green-600' : seq.status === 'paused' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>{seq.status}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setFormData(seq); setFormMode('sequence'); setShowForm(true); }}><Mail size={12} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSequence(seq._id)}><Trash2 size={12} className="text-gray-400" /></Button>
                    </div>
                  </div>
                  {seq.description && <p className="text-xs text-gray-500 mb-2">{seq.description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span>Trigger: {seq.trigger} {seq.triggerValue ? `(${seq.triggerValue})` : ''}</span>
                    <span>{Array.isArray(seq.steps) ? seq.steps.length : 0} steps</span>
                    <span>Sent: {seq.sentCount} | Opens: {seq.openCount}% | Clicks: {seq.clickCount}%</span>
                  </div>
                  {Array.isArray(seq.steps) && seq.steps.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                      {seq.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] bg-gray-50 rounded-lg px-2 py-1 text-gray-500">
                          <Mail size={8} />
                          {step.delayDays > 0 ? `+${step.delayDays}d` : 'Immediate'}
                          {i < seq.steps.length - 1 && <ChevronRight size={8} />}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">{rules.length} Rules</h3>
            <Button variant="blue" size="sm" onClick={() => { setFormMode('rule'); setShowForm(true); }} className="rounded-xl"><Plus size={14} className="mr-1" /> New Rule</Button>
          </div>
          <div className="space-y-3">
            {!Array.isArray(rules) || rules.length === 0 ? (
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-8 text-center"><Zap size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No automation rules yet</p></CardContent></Card>
            ) : rules.map((rule) => (
              <Card key={rule._id} className="border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Zap size={16} className={`${rule.active ? 'text-amber-500' : 'text-gray-300'}`} />
                      <p className="text-sm font-semibold text-gray-900">{rule.name}</p>
                      {rule.active ? <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">Active</span> : <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Paused</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleRule(rule)}>{rule.active ? <ToggleRight size={18} className="text-brand-blue" /> : <ToggleLeft size={18} className="text-gray-300" />}</button>
                      <Button variant="ghost" size="sm" onClick={() => deleteRule(rule._id)}><Trash2 size={12} className="text-gray-400" /></Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">When <strong>{rule.trigger.replace(/\./g, ' ')}</strong>{rule.triggerValue ? ` (${rule.triggerValue})` : ''}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {Array.isArray(rule.actions) && rule.actions.map((a, i) => (
                      <span key={i} className="text-[10px] bg-brand-blue/5 text-brand-blue px-2 py-1 rounded-lg font-medium">{a.type.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Run {rule.runCount} times | Last: {rule.lastRun ? new Date(rule.lastRun).toLocaleDateString() : 'Never'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'scores' && (
        <div>
          {scoringStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{scoringStats.total}</p><p className="text-xs text-gray-500">Scored Leads</p></CardContent></Card>
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{scoringStats.hot}</p><p className="text-xs text-gray-500">Hot</p></CardContent></Card>
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{scoringStats.warm}</p><p className="text-xs text-gray-500">Warm</p></CardContent></Card>
              <Card className="border border-gray-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{scoringStats.cold}</p><p className="text-xs text-gray-500">Cold</p></CardContent></Card>
            </div>
          )}
          <Card className="border border-gray-100 shadow-sm">
            <div className="max-h-[60vh] overflow-y-auto">
              {!Array.isArray(leadScores) || leadScores.length === 0 ? (
                <div className="text-center py-12"><Target size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No lead scores yet. Recalculate scores from contact records.</p></div>
              ) : leadScores.map((ls) => (
                <div key={ls._id} className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{ls.contact?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{ls.contact?.name || 'Unknown'}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getLevelBadge(ls.level)}`}>{ls.level.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-500">{ls.contact?.email || ls.contact?.company || ''}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${ls.score >= 80 ? 'text-red-600' : ls.score >= 40 ? 'text-amber-600' : 'text-blue-600'}`}>{ls.score}</p>
                    <p className="text-[10px] text-gray-400">Score</p>
                  </div>
                  <div className="flex-1 max-w-[200px] hidden lg:block">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ls.score >= 80 ? 'bg-red-500' : ls.score >= 40 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${ls.score}%` }} />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      <span>{ls.factors?.emailOpens || 0} opens</span>
                      <span>{ls.factors?.dealValue ? `$${ls.factors.dealValue}` : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {showForm && formMode === 'sequence' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <Card className="w-full max-w-2xl mx-4 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{formData._id ? 'Edit Sequence' : 'New Email Sequence'}</h2>
              <form onSubmit={handleSaveSequence} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3"><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select></div>
                </div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Trigger</Label><select value={formData.trigger} onChange={(e) => setFormData((p) => ({ ...p, trigger: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">
                    <option value="manual">Manual</option><option value="lead_created">Lead Created</option><option value="deal_stage">Deal Stage Changed</option><option value="form_submission">Form Submitted</option>
                  </select></div>
                  <div className="space-y-1"><Label>Trigger Value</Label><Input value={formData.triggerValue} onChange={(e) => setFormData((p) => ({ ...p, triggerValue: e.target.value }))} className="h-10 rounded-xl" placeholder="Stage name or form ID" /></div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-gray-700">Email Steps</h3><Button type="button" variant="outline" size="sm" onClick={addStep} className="rounded-xl text-xs"><Plus size={12} className="mr-1" /> Add Step</Button></div>
                  <div className="space-y-3">
                    {formData.steps.map((step, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-gray-500">Step {i + 1}</span><Button type="button" variant="ghost" size="sm" onClick={() => setFormData((p) => ({ ...p, steps: p.steps.filter((_, idx) => idx !== i) }))}><Trash2 size={12} className="text-gray-400" /></Button></div>
                        <div className="grid grid-cols-3 gap-3 mb-2">
                          <div className="space-y-1"><Label className="text-[10px]">Delay (days)</Label><Input type="number" min="0" value={step.delayDays} onChange={(e) => { const s = [...formData.steps]; s[i].delayDays = Number(e.target.value); setFormData((p) => ({ ...p, steps: s })); }} className="h-8 rounded-lg text-xs" /></div>
                          <div className="col-span-2 space-y-1"><Label className="text-[10px]">Subject</Label><Input value={step.subject} onChange={(e) => { const s = [...formData.steps]; s[i].subject = e.target.value; setFormData((p) => ({ ...p, steps: s })); }} className="h-8 rounded-lg text-xs" /></div>
                        </div>
                        <div className="space-y-1"><Label className="text-[10px]">Body</Label><Textarea value={step.body} onChange={(e) => { const s = [...formData.steps]; s[i].body = e.target.value; setFormData((p) => ({ ...p, steps: s })); }} rows={2} className="rounded-lg text-xs" /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" variant="blue" className="rounded-xl w-full">{formData._id ? 'Update Sequence' : 'Create Sequence'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && formMode === 'rule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <Card className="w-full max-w-lg mx-4 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{ruleForm._id ? 'Edit Rule' : 'New Automation Rule'}</h2>
              <form onSubmit={handleSaveRule} className="space-y-4">
                <div className="space-y-1"><Label>Name</Label><Input value={ruleForm.name} onChange={(e) => setRuleForm((p) => ({ ...p, name: e.target.value }))} required className="h-10 rounded-xl" /></div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={ruleForm.description} onChange={(e) => setRuleForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-xl" /></div>
                <div className="space-y-1"><Label>Trigger</Label><select value={ruleForm.trigger} onChange={(e) => setRuleForm((p) => ({ ...p, trigger: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">
                  <option value="deal.created">Deal Created</option><option value="deal.stage_changed">Deal Stage Changed</option><option value="deal.won">Deal Won</option><option value="deal.lost">Deal Lost</option><option value="contact.created">Contact Created</option><option value="form.submitted">Form Submitted</option>
                </select></div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-gray-700">Actions</span><Button type="button" variant="outline" size="sm" onClick={addAction} className="rounded-xl text-xs"><Plus size={12} className="mr-1" /> Add</Button></div>
                  {ruleForm.actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-2">
                      <select value={action.type} onChange={(e) => { const a = [...ruleForm.actions]; a[i].type = e.target.value; setRuleForm((p) => ({ ...p, actions: a })); }} className="flex-1 h-9 rounded-lg border border-gray-200 text-xs px-2">
                        <option value="assign_owner">Assign Owner</option><option value="change_stage">Change Stage</option><option value="add_tag">Add Tag</option><option value="send_email">Send Email</option><option value="create_task">Create Task</option><option value="notify_slack">Notify Slack</option>
                      </select>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setRuleForm((p) => ({ ...p, actions: p.actions.filter((_, idx) => idx !== i) }))}><Trash2 size={12} className="text-gray-400" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="submit" variant="blue" className="rounded-xl w-full">{ruleForm._id ? 'Update Rule' : 'Create Rule'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18l6-6-6-6" /></svg>
);

export default WorkflowsTab;
