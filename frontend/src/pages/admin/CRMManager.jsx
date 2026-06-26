import { useState, useEffect } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import {
  Mail, MessageSquare, CheckCircle, Send, Trash2,
  Loader2, Inbox, Reply, ArrowLeft, Clock, User,
  Users, Phone, Building2, Globe, MapPin, Link2,
  AtSign, Tags, Plus, Search, Merge, AlertTriangle,
  FileText, Calendar, MessageCircle, Smartphone,
  LayoutDashboard, FolderKanban, BarChart3, Zap,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmailTab from './crm/EmailTab';
import CalendarTab from './crm/CalendarTab';
import CallsTab from './crm/CallsTab';
import ChatTab from './crm/ChatTab';
import SMSTab from './crm/SMSTab';
import DealsTab from './crm/DealsTab';
import ProjectsTab from './crm/ProjectsTab';
import TimesheetTab from './crm/TimesheetTab';
import ExpensesTab from './crm/ExpensesTab';
import ResourcesTab from './crm/ResourcesTab';
import ReportsTab from './crm/ReportsTab';
import WorkflowsTab from './crm/WorkflowsTab';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const TABS = [
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'dedup', label: 'Dedup', icon: Merge },
  { id: 'deals', label: 'Deals', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'timesheets', label: 'Timesheets', icon: Clock },
  { id: 'expenses', label: 'Expenses', icon: DollarSign },
  { id: 'resources', label: 'Resources', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'workflows', label: 'Workflows', icon: Zap },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'sms', label: 'SMS', icon: Smartphone },
];

// ── Messages Tab ──

const MessagesTab = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({});
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  const fetch = () =>
    API.get('/crm/messages').then((r) => setMessages(Array.isArray(r.data) ? r.data : [])).catch(() => {});

  const fetchStats = () =>
    API.get('/crm/messages/stats').then((r) => setStats(r.data)).catch(() => {});

  useEffect(() => {
    Promise.all([fetch(), fetchStats()]).finally(() => setLoading(false));
  }, []);

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyBody('');
    if (!msg.read) {
      try {
        await API.put(`/crm/messages/${msg._id}/read`);
        setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, read: true } : m));
        fetchStats();
      } catch {}
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      await API.post(`/crm/messages/${selected._id}/reply`, { body: replyBody });
      toast.success('Reply sent');
      setReplyBody('');
      fetch();
      fetchStats();
      const updated = await API.get(`/crm/messages/${selected._id}`);
      setSelected(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await API.delete(`/crm/messages/${id}`);
      toast.success('Deleted');
      if (selected?._id === id) setSelected(null);
      fetch();
      fetchStats();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSync = async (id) => {
    try {
      await API.post(`/crm/messages/${id}/sync-contact`);
      toast.success('Contact synced');
    } catch {
      toast.error('Failed to sync');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-96 flex-shrink-0">
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
            {!Array.isArray(messages) || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Inbox size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No messages yet</p>
              </div>
            ) : (
              messages.map((msg) => (
                <button key={msg._id} onClick={() => openMessage(msg)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?._id === msg._id ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${msg.read ? 'bg-gray-300' : 'bg-brand-blue'}`}>
                      {msg.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold truncate ${msg.read ? 'text-gray-600' : 'text-gray-900'}`}>{msg.name}</span>
                        {!msg.read && <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-0.5">{msg.subject}</p>
                      <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="flex-1">
        {selected ? (
          <Card className="border border-gray-100 shadow-sm">
            <div className="max-h-[70vh] overflow-y-auto p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-lg font-bold">
                    {selected.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-sm text-brand-blue hover:underline">{selected.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSync(selected._id)} title="Create/update contact profile">
                    <User size={12} className="mr-1" /> Sync
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selected._id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
                <span className="font-semibold text-gray-900">{selected.subject}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 flex items-center gap-1.5"><Clock size={14} />{formatDate(selected.createdAt)}</span>
                {selected.replied && (
                  <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                    <CheckCircle size={11} /> Replied
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {Array.isArray(selected.replies) && selected.replies.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Reply size={14} /> Replies ({selected.replies.length})
                  </h3>
                  <div className="space-y-3">
                    {selected.replies.map((reply, idx) => (
                      <div key={idx} className="bg-brand-blue/5 rounded-2xl p-4 border border-brand-blue/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-brand-blue">{reply.adminName}</span>
                          <span className="text-[10px] text-gray-400">{formatDate(reply.sentAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                        {reply.provider && <span className="text-[10px] text-gray-400 mt-2 inline-block">via {reply.provider}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Send size={14} /> Send Reply</h3>
                <form onSubmit={handleReply} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500">To</Label>
                    <Input value={selected.email} disabled className="h-10 rounded-xl bg-gray-50 border-gray-200 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500">Subject</Label>
                    <Input value={`Re: ${selected.subject}`} disabled className="h-10 rounded-xl bg-gray-50 border-gray-200 text-sm" />
                  </div>
                  <div>
                    <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={5}
                      placeholder="Write your reply..." required className="rounded-xl border-gray-200" />
                  </div>
                  <Button type="submit" variant="blue" disabled={sending || !replyBody.trim()} className="rounded-xl">
                    {sending ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Sending...</>
                      : <><Send size={14} className="mr-1.5" /> Send Reply</>}
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <MessageSquare size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Select a message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Contacts Tab ──

const ContactsTab = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [newInteraction, setNewInteraction] = useState('');
  const [newInteractionType, setNewInteractionType] = useState('note');

  const fetchContacts = () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    API.get(`/crm/contacts${params}`).then((r) => {
      setContacts(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  useEffect(() => {
    if (!search) return;
    const timer = setTimeout(fetchContacts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openContact = async (id) => {
    setSelectedId(id);
    setEditMode(false);
    try {
      const res = await API.get(`/crm/contacts/${id}`);
      setDetail(res.data);
    } catch {
      toast.error('Failed to load contact');
    }
  };

  const handleEdit = () => {
    if (!detail) return;
    setEditData({
      name: detail.contact.name || '',
      email: detail.contact.email || '',
      phone: detail.contact.phone || '',
      title: detail.contact.title || '',
      company: detail.contact.company || '',
      industry: detail.contact.industry || '',
      companySize: detail.contact.companySize || '',
      website: detail.contact.website || '',
      location: detail.contact.location || '',
      notes: detail.contact.notes || '',
      tags: detail.contact.tags?.join(', ') || '',
      socialLinks: detail.contact.socialLinks || {},
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!detail) return;
    try {
      const tags = editData.tags ? editData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      const payload = { ...editData, tags };
      delete payload.socialLinks;
      payload.socialLinks = editData.socialLinks;
      await API.put(`/crm/contacts/${detail.contact._id}`, payload);
      toast.success('Contact updated');
      setEditMode(false);
      openContact(detail.contact._id);
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.trim() || !detail) return;
    try {
      await API.post(`/crm/contacts/${detail.contact._id}/interactions`, {
        type: newInteractionType,
        description: newInteraction,
        subject: newInteractionType === 'note' ? 'Note' : newInteractionType === 'call' ? 'Phone Call' : newInteractionType === 'meeting' ? 'Meeting' : 'Social Media',
      });
      toast.success('Interaction added');
      setNewInteraction('');
      openContact(detail.contact._id);
    } catch {
      toast.error('Failed to add interaction');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  if (detail && selectedId) {
    const { contact, interactions, messages } = detail;
    return (
      <div>
        <button onClick={() => { setSelectedId(null); setDetail(null); }} className="flex items-center gap-1.5 text-sm text-brand-blue font-medium mb-4">
          <ArrowLeft size={16} /> Back to contacts
        </button>

        <Card className="border border-gray-100 shadow-sm">
          <div className="max-h-[70vh] overflow-y-auto p-6 lg:p-8">
            {editMode ? (
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs font-medium">Name</Label><Input value={editData.name} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Email</Label><Input value={editData.email} onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Phone</Label><Input value={editData.phone} onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Title</Label><Input value={editData.title} onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Company</Label><Input value={editData.company} onChange={(e) => setEditData((p) => ({ ...p, company: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Industry</Label><Input value={editData.industry} onChange={(e) => setEditData((p) => ({ ...p, industry: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Company Size</Label><Input value={editData.companySize} onChange={(e) => setEditData((p) => ({ ...p, companySize: e.target.value }))} className="h-10 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Website</Label><Input value={editData.website} onChange={(e) => setEditData((p) => ({ ...p, website: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="space-y-1"><Label className="text-xs font-medium">Location</Label><Input value={editData.location} onChange={(e) => setEditData((p) => ({ ...p, location: e.target.value }))} className="h-10 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs font-medium">Tags (comma separated)</Label><Input value={editData.tags} onChange={(e) => setEditData((p) => ({ ...p, tags: e.target.value }))} className="h-10 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs font-medium">LinkedIn</Label><Input value={editData.socialLinks?.linkedin || ''} onChange={(e) => setEditData((p) => ({ ...p, socialLinks: { ...p.socialLinks, linkedin: e.target.value } }))} className="h-10 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs font-medium">Twitter</Label><Input value={editData.socialLinks?.twitter || ''} onChange={(e) => setEditData((p) => ({ ...p, socialLinks: { ...p.socialLinks, twitter: e.target.value } }))} className="h-10 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs font-medium">Notes</Label><Textarea value={editData.notes} onChange={(e) => setEditData((p) => ({ ...p, notes: e.target.value }))} rows={3} className="rounded-xl" /></div>
                <div className="flex gap-3 pt-2">
                  <Button variant="blue" onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-xl font-bold">
                      {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
                      <p className="text-sm text-gray-500">{contact.title}{contact.title && contact.company ? ' at ' : ''}{contact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}><FileText size={12} className="mr-1" /> Edit</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Mail size={14} className="text-brand-blue flex-shrink-0" />
                      <a href={`mailto:${contact.email}`} className="truncate hover:text-brand-blue">{contact.email}</a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Phone size={14} className="text-brand-blue flex-shrink-0" />
                      <a href={`tel:${contact.phone}`} className="truncate hover:text-brand-blue">{contact.phone}</a>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Building2 size={14} className="text-brand-blue flex-shrink-0" />
                      <span className="truncate">{contact.company}{contact.industry ? ` (${contact.industry})` : ''}</span>
                    </div>
                  )}
                  {contact.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Globe size={14} className="text-brand-blue flex-shrink-0" />
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-brand-blue">{contact.website}</a>
                    </div>
                  )}
                  {contact.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <MapPin size={14} className="text-brand-blue flex-shrink-0" />
                      <span className="truncate">{contact.location}</span>
                    </div>
                  )}
                  {contact.companySize && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Users size={14} className="text-brand-blue flex-shrink-0" />
                      <span>{contact.companySize} employees</span>
                    </div>
                  )}
                  {contact.socialLinks?.linkedin && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Link2 size={14} className="text-brand-blue flex-shrink-0" />
                      <a href={contact.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="truncate hover:text-brand-blue">LinkedIn</a>
                    </div>
                  )}
                  {contact.socialLinks?.twitter && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <AtSign size={14} className="text-brand-blue flex-shrink-0" />
                      <a href={contact.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="truncate hover:text-brand-blue">Twitter</a>
                    </div>
                  )}
                </div>

                {Array.isArray(contact.tags) && contact.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <Tags size={14} className="text-gray-400" />
                    {contact.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                )}

                {contact.notes && (
                  <div className="bg-gray-50 rounded-2xl p-4 mb-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-6 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar size={14} /> Interaction Timeline
                  </h3>

                  <div className="relative pl-6 space-y-0">
                    {Array.isArray(interactions) && interactions.length > 0 ? (
                      interactions.map((ix, i) => (
                        <div key={ix._id || i} className="relative pb-6">
                          {i < interactions.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200" />}
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                              ix.type === 'email' ? 'border-brand-blue bg-brand-blue/10' :
                              ix.type === 'call' ? 'border-green-500 bg-green-50' :
                              ix.type === 'meeting' ? 'border-purple-500 bg-purple-50' :
                              ix.type === 'form_submission' ? 'border-amber-500 bg-amber-50' :
                              'border-gray-400 bg-gray-50'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-semibold ${
                                  ix.type === 'email' ? 'text-brand-blue' :
                                  ix.type === 'call' ? 'text-green-600' :
                                  ix.type === 'meeting' ? 'text-purple-600' :
                                  ix.type === 'form_submission' ? 'text-amber-600' :
                                  'text-gray-600'
                                }`}>{ix.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                                {ix.subject && <span className="text-xs text-gray-500 font-medium">— {ix.subject}</span>}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{ix.description}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(ix.createdAt)}{ix.outcome ? ` — ${ix.outcome}` : ''}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No interactions recorded yet.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Plus size={14} /> Add Interaction
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {['note', 'call', 'meeting', 'social'].map((t) => (
                      <button key={t} onClick={() => setNewInteractionType(t)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                          newInteractionType === t
                            ? 'bg-brand-blue text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newInteraction} onChange={(e) => setNewInteraction(e.target.value)}
                      placeholder="Add a note, call summary, meeting notes..."
                      className="h-10 rounded-xl flex-1" />
                    <Button variant="blue" size="sm" onClick={handleAddInteraction} disabled={!newInteraction.trim()}>
                      Add
                    </Button>
                  </div>
                </div>

                {Array.isArray(messages) && messages.length > 0 && (
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Mail size={14} /> Contact Form Messages ({messages.length})
                    </h3>
                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <div key={msg._id} className="bg-gray-50 rounded-xl p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700">{msg.subject}</span>
                            <span className="text-[10px] text-gray-400">{formatDate(msg.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-2">{msg.message}</p>
                          {msg.replied && <span className="text-[10px] text-green-600 font-medium mt-1 inline-block">Replied</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." className="h-10 rounded-xl pl-9 border-gray-200" />
        </div>
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="max-h-[55vh] lg:max-h-[65vh] overflow-y-auto">
            {!Array.isArray(contacts) || contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Users size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">{search ? 'No results found' : 'No contacts yet'}</p>
              </div>
            ) : (
              contacts.map((c) => (
                <button key={c._id} onClick={() => openContact(c._id)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedId === c._id ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {c.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.company || c.email}</p>
                      {c.industry && <p className="text-[10px] text-gray-400 truncate">{c.industry}</p>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Select a contact to view their 360&deg; profile</p>
        </div>
      </div>
    </div>
  );
};

// ── Dedup Tab ──

const DedupTab = () => {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(null);

  const findDuplicates = async () => {
    setLoading(true);
    try {
      const res = await API.get('/crm/contacts/dedup/find');
      setDuplicates(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to find duplicates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { findDuplicates(); }, []);

  const handleMerge = async (keepId, mergeId) => {
    setMerging(mergeId);
    try {
      await API.post('/crm/contacts/dedup/merge', { keepId, mergeId });
      toast.success('Duplicates merged');
      findDuplicates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to merge');
    } finally {
      setMerging(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Duplicate Detection</h2>
          <p className="text-sm text-gray-500 mt-1">Find and merge duplicate contacts by email</p>
        </div>
        <Button variant="outline" size="sm" onClick={findDuplicates} className="rounded-xl">
          <Search size={14} className="mr-1.5" /> Scan Again
        </Button>
      </div>

      {!Array.isArray(duplicates) || duplicates.length === 0 ? (
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-12 text-center">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-sm">No duplicates found</p>
            <p className="text-gray-400 text-xs mt-1">Your contact database is clean</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {duplicates.map((dup, idx) => (
            <Card key={idx} className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-gray-900">{dup.count} duplicates for <span className="text-brand-blue">{dup._id.email}</span></span>
                </div>

                {dup.ids.map((id, i) => (
                  <div key={id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-xs font-bold">
                        {(dup.names[i] || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dup.names[i] || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{dup.companies[i] || 'No company'} — {dup.sources[i]}</p>
                      </div>
                    </div>
                    <Button variant="blue" size="sm" onClick={() => handleMerge(dup.ids[0], id)}
                      disabled={merging === id || i === 0} className="text-xs rounded-lg">
                      {merging === id ? <Loader2 size={12} className="animate-spin" /> : i === 0 ? 'Keep' : 'Merge Here'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main CRMManager ──

const CRMManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-500 mt-1">Unified contact management &amp; messaging</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
              }`}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'messages' && <MessagesTab user={user} />}
      {activeTab === 'contacts' && <ContactsTab />}
      {activeTab === 'dedup' && <DedupTab />}
      {activeTab === 'deals' && <DealsTab />}
      {activeTab === 'projects' && <ProjectsTab />}
      {activeTab === 'timesheets' && <TimesheetTab />}
      {activeTab === 'expenses' && <ExpensesTab />}
      {activeTab === 'resources' && <ResourcesTab />}
      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'workflows' && <WorkflowsTab />}
      {activeTab === 'email' && <EmailTab />}
      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'calls' && <CallsTab />}
      {activeTab === 'chat' && <ChatTab />}
      {activeTab === 'sms' && <SMSTab />}
    </div>
  );
};

export default CRMManager;