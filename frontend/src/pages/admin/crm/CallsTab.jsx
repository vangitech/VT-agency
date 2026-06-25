import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Loader2, Clock, User, Search, Plus, Voicemail,
  Trash2, BarChart3, Mic, MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const CallsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    contact: '', to: '', direction: 'outbound', status: 'completed',
    duration: 0, notes: '', outcome: '',
  });
  const [contacts, setContacts] = useState([]);
  const [initiateNumber, setInitiateNumber] = useState('');
  const [initiating, setInitiating] = useState(null);

  const fetchLogs = () => {
    const params = {};
    if (search) params.search = search;
    API.get('/calls/logs', { params }).then((r) => {
      setLogs(Array.isArray(r.data.logs) ? r.data.logs : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const fetchStats = () =>
    API.get('/calls/logs/stats').then((r) => setStats(r.data)).catch(() => {});

  const fetchContacts = () =>
    API.get('/crm/contacts').then((r) => setContacts(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  useEffect(() => {
    Promise.all([fetchLogs(), fetchStats(), fetchContacts()]);
  }, []);

  const handleInitiate = async (phoneNumber) => {
    if (!phoneNumber?.trim()) return;
    setInitiating(phoneNumber);
    try {
      const res = await API.post('/calls/initiate', { phoneNumber });
      toast.success(`Call initiated to ${phoneNumber}`);
      setInitiateNumber('');
      fetchLogs();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate call');
    } finally { setInitiating(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/calls/logs', formData);
      toast.success('Call log created');
      setShowForm(false);
      setFormData({ contact: '', to: '', direction: 'outbound', status: 'completed', duration: 0, notes: '', outcome: '' });
      fetchLogs();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this call log?')) return;
    try {
      await API.delete(`/calls/logs/${id}`);
      toast.success('Deleted');
      fetchLogs();
      fetchStats();
    } catch { toast.error('Failed to delete'); }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return Phone;
      case 'missed': return PhoneMissed;
      case 'voicemail': return Voicemail;
      default: return Phone;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <Phone className="w-5 h-5 text-brand-blue mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Calls</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <PhoneIncoming className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <PhoneMissed className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.missed}</p>
              <p className="text-xs text-gray-500">Missed</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
              <p className="text-xs text-gray-500">Total Duration</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search call logs..." className="h-10 rounded-xl pl-9 border-gray-200" />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Input value={initiateNumber} onChange={(e) => setInitiateNumber(e.target.value)}
              placeholder="+234 800 000 0000" className="h-10 rounded-xl w-48" />
            <Button variant="blue" size="sm" onClick={() => handleInitiate(initiateNumber)}
              disabled={initiating || !initiateNumber.trim()} className="rounded-xl">
              {initiating ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />}
              <span className="ml-1.5 hidden sm:inline">Call</span>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="rounded-xl">
            <Plus size={14} className="mr-1" /> Log
          </Button>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <div className="max-h-[55vh] overflow-y-auto">
          {!Array.isArray(logs) || logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Phone size={40} className="text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No call logs yet</p>
              <p className="text-gray-400 text-xs mt-1">Use the call button or log calls manually</p>
            </div>
          ) : logs.map((log) => {
            const StatusIcon = getStatusIcon(log.status);
            const isInbound = log.direction === 'inbound';
            return (
              <div key={log._id} className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.status === 'completed' ? 'bg-green-50 text-green-500' :
                  log.status === 'missed' ? 'bg-red-50 text-red-500' :
                  log.status === 'voicemail' ? 'bg-amber-50 text-amber-500' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {isInbound ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{log.contact?.name || log.to || log.from || 'Unknown'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      log.status === 'completed' ? 'bg-green-50 text-green-600' :
                      log.status === 'missed' ? 'bg-red-50 text-red-600' :
                      log.status === 'voicemail' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>{log.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(log.startedAt)}</span>
                    <span>{formatDuration(log.duration)}</span>
                    {log.outcome && <span className="text-gray-400">— {log.outcome}</span>}
                  </div>
                  {log.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{log.notes}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {log.contact?.phone && (
                    <Button variant="ghost" size="sm" onClick={() => handleInitiate(log.contact.phone)} title="Call back">
                      <Phone size={12} className="text-brand-blue" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(log._id)}>
                    <Trash2 size={12} className="text-gray-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <Card className="w-full max-w-md mx-4 border border-gray-100 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Log Call</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">Direction</Label>
                  <div className="flex gap-2">
                    {['inbound', 'outbound'].map((d) => (
                      <button key={d} type="button" onClick={() => setFormData((p) => ({ ...p, direction: d }))}
                        className={`text-xs px-4 py-2 rounded-full font-medium ${formData.direction === d ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1"><Label className="text-xs">Phone Number</Label><Input value={formData.to} onChange={(e) => setFormData((p) => ({ ...p, to: e.target.value }))} required className="h-9 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs">Status</Label>
                  <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="w-full h-9 rounded-xl border border-gray-200 text-sm px-3">
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="voicemail">Voicemail</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Duration (seconds)</Label><Input type="number" value={formData.duration} onChange={(e) => setFormData((p) => ({ ...p, duration: Number(e.target.value) }))} className="h-9 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs">Outcome</Label><Input value={formData.outcome} onChange={(e) => setFormData((p) => ({ ...p, outcome: e.target.value }))} className="h-9 rounded-xl" placeholder="Interested, Follow-up, etc." /></div>
                <div className="space-y-1"><Label className="text-xs">Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={3} className="rounded-xl" /></div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="blue" className="rounded-xl flex-1">Save Call Log</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CallsTab;
