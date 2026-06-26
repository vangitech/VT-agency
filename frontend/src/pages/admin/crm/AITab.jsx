import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Brain, Loader2, Lightbulb, Target,
  MessageSquare, FileText, TrendingUp,
  ChevronRight, Sparkles, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AITab = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('suggestions');
  const [emailText, setEmailText] = useState('');
  const [replyTemplates, setReplyTemplates] = useState([]);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', attendees: '', duration: '30', notes: '' });
  const [meetingSummary, setMeetingSummary] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sugRes, insRes] = await Promise.all([
          API.get('/ai/suggestions'),
          API.get('/ai/predictive-insights'),
        ]);
        setSuggestions(Array.isArray(sugRes.data) ? sugRes.data : []);
        setInsights(insRes.data);
      } catch (e) {
        toast.error('Failed to load AI data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleGenerateReply = async () => {
    if (!emailText.trim()) { toast.error('Enter email text first'); return; }
    setGeneratingReply(true);
    try {
      const res = await API.post('/ai/reply', { emailBody: emailText });
      setReplyTemplates(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error('Failed to generate reply'); }
    finally { setGeneratingReply(false); }
  };

  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/ai/meeting-summary', {
        title: meetingForm.title,
        attendees: meetingForm.attendees.split(',').map((s) => s.trim()),
        duration: meetingForm.duration,
        notes: meetingForm.notes,
      });
      setMeetingSummary(res.data);
    } catch { toast.error('Failed to generate summary'); }
  };

  const panels = [
    { id: 'suggestions', label: 'Next Best Actions', icon: Lightbulb },
    { id: 'reply', label: 'Smart Reply', icon: MessageSquare },
    { id: 'summary', label: 'Meeting Summary', icon: FileText },
    { id: 'insights', label: 'Predictive Insights', icon: TrendingUp },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Sparkles size={18} className="text-white" /></div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
          <p className="text-xs text-gray-500">Smart suggestions, auto-replies, and predictive insights</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {panels.map((p) => {
          const Icon = p.icon;
          return (
            <button key={p.id} onClick={() => setActivePanel(p.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${activePanel === p.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
              <Icon size={16} /> {p.label}
            </button>
          );
        })}
      </div>

      {activePanel === 'suggestions' && (
        <div className="space-y-3">
          {!Array.isArray(suggestions) || suggestions.length === 0 ? (
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-8 text-center"><Lightbulb size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No suggestions yet. Start using the CRM to generate insights.</p></CardContent></Card>
          ) : suggestions.map((s, i) => (
            <Card key={i} className={`border shadow-sm ${s.priority === 'high' ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-amber-400'}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.type === 'task' ? 'bg-red-50' : s.type === 'lead' ? 'bg-green-50' : s.type === 'deal' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                  {s.type === 'task' ? <Target size={14} className="text-red-500" /> : s.type === 'lead' ? <Zap size={14} className="text-green-500" /> : s.type === 'deal' ? <TrendingUp size={14} className="text-blue-500" /> : <Brain size={14} className="text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{s.priority}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Why: {s.reason}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-xs flex-shrink-0">{s.action}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activePanel === 'reply' && (
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Generate Smart Reply</h3>
              <div className="space-y-3">
                <div className="space-y-1"><Label>Email or Message Text</Label><Textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} rows={5} className="rounded-xl" placeholder="Paste the email or message you received..." /></div>
                <Button variant="blue" onClick={handleGenerateReply} disabled={generatingReply || !emailText.trim()} className="rounded-xl">
                  {generatingReply ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Generating...</> : <><Sparkles size={14} className="mr-1.5" /> Generate Reply</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {Array.isArray(replyTemplates) && replyTemplates.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Suggested Replies</h3>
              {replyTemplates.map((t, i) => (
                <Card key={i} className="border border-gray-100 shadow-sm hover:border-purple-200 transition-colors">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{t}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400">Option {i + 1}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => { navigator.clipboard.writeText(t); toast.success('Copied!'); }}>Copy</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activePanel === 'summary' && (
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Generate Meeting Summary</h3>
              <form onSubmit={handleGenerateSummary} className="space-y-3">
                <div className="space-y-1"><Label>Meeting Title</Label><Input value={meetingForm.title} onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))} required className="h-10 rounded-xl" placeholder="Q3 Planning Session" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Attendees (comma separated)</Label><Input value={meetingForm.attendees} onChange={(e) => setMeetingForm((p) => ({ ...p, attendees: e.target.value }))} className="h-10 rounded-xl" placeholder="John, Jane, Bob" /></div>
                  <div className="space-y-1"><Label>Duration (minutes)</Label><Input value={meetingForm.duration} onChange={(e) => setMeetingForm((p) => ({ ...p, duration: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="space-y-1"><Label>Notes</Label><Textarea value={meetingForm.notes} onChange={(e) => setMeetingForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className="rounded-xl" /></div>
                <Button type="submit" variant="blue" className="rounded-xl"><Sparkles size={14} className="mr-1.5" /> Generate Summary</Button>
              </form>
            </CardContent>
          </Card>

          {meetingSummary && (
            <Card className="border border-gray-100 shadow-sm border-l-4 border-l-purple-400">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-1">{meetingSummary.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{meetingSummary.date} · {meetingSummary.duration} · {meetingSummary.attendees?.join(', ')}</p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Key Points</p>
                  <ul className="space-y-1">
                    {meetingSummary.keyPoints?.map((p, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Decisions</p>
                  <ul className="space-y-1">
                    {meetingSummary.decisions?.map((d, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Action Items</p>
                  {meetingSummary.actionItems?.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 w-16">{a.priority}</span>
                      <span className="flex-1">{a.task}</span>
                      <span className="text-xs text-gray-400">{a.owner}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activePanel === 'insights' && insights && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-5 text-center">
                <TrendingUp size={20} className="text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{insights.winRate}%</p>
                <p className="text-xs text-gray-500">Win Rate</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-5 text-center">
                <Target size={20} className="text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">${(insights.predictedMonthlyRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Predicted Monthly Revenue</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-5 text-center">
                <Zap size={20} className="text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{insights.dealGrowth >= 0 ? '+' : ''}{insights.dealGrowth}%</p>
                <p className="text-xs text-gray-500">Deal Growth</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-5 text-center">
                <TrendingUp size={20} className="text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">${(insights.avgDealValue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Avg Deal Value</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Sales Performance Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Average Sales Cycle</p>
                  <p className="text-xl font-bold text-gray-900">{insights.avgSalesCycle} <span className="text-sm font-normal text-gray-500">days</span></p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Deals This Month</p>
                  <p className="text-xl font-bold text-gray-900">{insights.dealsThisMonth} <span className="text-sm font-normal text-gray-500">({insights.dealsLastMonth > 0 ? `${insights.dealGrowth >= 0 ? '+' : ''}${insights.dealGrowth}% vs last month` : 'no prior data'})</span></p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${insights.confidence === 'high' ? 'bg-green-50 text-green-600' : insights.confidence === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                    {insights.confidence.toUpperCase()} confidence
                  </span>
                  <span className="text-gray-400">Based on {insights.winRate}% win rate across {insights.dealsThisMonth + insights.dealsLastMonth} deals</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AITab;
