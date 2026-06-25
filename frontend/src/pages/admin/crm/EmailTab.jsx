import { useState, useEffect, useRef } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Mail, Inbox, Send, Trash2, Star, Search,
  Loader2, Plus, Reply, Forward, ArrowLeft,
  Paperclip, Clock, User, CheckCircle, RefreshCw,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const FOLDERS = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox },
  { id: 'SENT', label: 'Sent', icon: Send },
  { id: 'STARRED', label: 'Starred', icon: Star },
  { id: 'DRAFTS', label: 'Drafts', icon: FileText },
  { id: 'TRASH', label: 'Trash', icon: Trash2 },
];

const EmailTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [search, setSearch] = useState('');
  const [composeData, setComposeData] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: '', email: '', provider: 'imap',
    imapHost: '', imapPort: 993, smtpHost: '', smtpPort: 587,
    username: '', password: '', signature: '',
  });

  const fetchAccounts = () =>
    API.get('/email/accounts').then((r) => {
      const accs = Array.isArray(r.data) ? r.data : [];
      setAccounts(accs);
      if (accs.length && !currentAccount) setCurrentAccount(accs[0]._id);
    }).catch(() => {});

  const fetchMessages = () => {
    if (!currentAccount) { setLoading(false); return; }
    const params = { account: currentAccount, folder: currentFolder };
    if (search) params.search = search;
    API.get('/email/messages', { params }).then((r) => {
      setMessages(Array.isArray(r.data.messages) ? r.data.messages : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [currentAccount, currentFolder]);

  useEffect(() => {
    if (!search) return;
    const timer = setTimeout(fetchMessages, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openMessage = async (msg) => {
    setSelectedMsg(msg);
    if (!msg.isRead) {
      try {
        await API.get(`/email/messages/${msg._id}`);
        setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch {}
    }
  };

  const handleStar = async (id) => {
    try {
      const res = await API.put(`/email/messages/${id}/star`);
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, isStarred: res.data.isStarred } : m));
      if (selectedMsg?._id === id) setSelectedMsg((prev) => ({ ...prev, isStarred: res.data.isStarred }));
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move to trash?')) return;
    try {
      await API.delete(`/email/messages/${id}`);
      if (selectedMsg?._id === id) setSelectedMsg(null);
      fetchMessages();
    } catch { toast.error('Failed to delete'); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!composeData.to || !composeData.subject) { toast.error('To and subject required'); return; }
    setSending(true);
    try {
      await API.post('/email/messages/send', {
        to: composeData.to.split(',').map((s) => s.trim()),
        cc: composeData.cc ? composeData.cc.split(',').map((s) => s.trim()) : [],
        bcc: composeData.bcc ? composeData.bcc.split(',').map((s) => s.trim()) : [],
        subject: composeData.subject,
        bodyHtml: composeData.body,
        bodyText: composeData.body,
        accountId: currentAccount,
      });
      toast.success('Email sent');
      setShowCompose(false);
      setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '' });
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      await API.post('/email/accounts', accountForm);
      toast.success('Account added');
      setShowAccountSetup(false);
      setAccountForm({ name: '', email: '', provider: 'imap', imapHost: '', imapPort: 993, smtpHost: '', smtpPort: 587, username: '', password: '', signature: '' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add account');
    }
  };

  const filteredMessages = currentFolder === 'STARRED'
    ? messages.filter((m) => m.isStarred)
    : messages;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  if (accounts.length === 0 && !showAccountSetup) {
    return (
      <div className="text-center py-20">
        <Mail size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Email Accounts</h3>
        <p className="text-gray-500 text-sm mb-6">Connect Gmail, Outlook, Zoho, or any IMAP account</p>
        <Button variant="blue" onClick={() => setShowAccountSetup(true)} className="rounded-xl">
          <Plus size={16} className="mr-1.5" /> Add Email Account
        </Button>
      </div>
    );
  }

  if (showAccountSetup) {
    return (
      <Card className="max-w-xl mx-auto border border-gray-100 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Connect Email Account</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAccountSetup(false)} className="rounded-xl">Cancel</Button>
          </div>
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Display Name</Label><Input value={accountForm.name} onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))} required className="h-10 rounded-xl" placeholder="John Doe" /></div>
              <div className="space-y-1.5"><Label>Email Address</Label><Input type="email" value={accountForm.email} onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))} required className="h-10 rounded-xl" placeholder="john@company.com" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <div className="flex gap-2">
                {[
                  { id: 'gmail', label: 'Gmail' },
                  { id: 'outlook', label: 'Outlook' },
                  { id: 'zoho', label: 'Zoho' },
                  { id: 'imap', label: 'IMAP' },
                ].map((p) => (
                  <button key={p.id} type="button" onClick={() => {
                    setAccountForm((prev) => ({ ...prev, provider: p.id }));
                    if (p.id === 'gmail') setAccountForm((prev) => ({ ...prev, imapHost: 'imap.gmail.com', smtpHost: 'smtp.gmail.com' }));
                    else if (p.id === 'outlook') setAccountForm((prev) => ({ ...prev, imapHost: 'outlook.office365.com', smtpHost: 'smtp.office365.com' }));
                    else if (p.id === 'zoho') setAccountForm((prev) => ({ ...prev, imapHost: 'imap.zoho.com', smtpHost: 'smtp.zoho.com' }));
                  }} className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${accountForm.provider === p.id ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600'}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>IMAP Host</Label><Input value={accountForm.imapHost} onChange={(e) => setAccountForm((p) => ({ ...p, imapHost: e.target.value }))} className="h-10 rounded-xl" /></div>
              <div className="space-y-1.5"><Label>IMAP Port</Label><Input type="number" value={accountForm.imapPort} onChange={(e) => setAccountForm((p) => ({ ...p, imapPort: Number(e.target.value) }))} className="h-10 rounded-xl" /></div>
              <div className="space-y-1.5"><Label>SMTP Host</Label><Input value={accountForm.smtpHost} onChange={(e) => setAccountForm((p) => ({ ...p, smtpHost: e.target.value }))} className="h-10 rounded-xl" /></div>
              <div className="space-y-1.5"><Label>SMTP Port</Label><Input type="number" value={accountForm.smtpPort} onChange={(e) => setAccountForm((p) => ({ ...p, smtpPort: Number(e.target.value) }))} className="h-10 rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Username</Label><Input value={accountForm.username} onChange={(e) => setAccountForm((p) => ({ ...p, username: e.target.value }))} className="h-10 rounded-xl" placeholder="email or username" /></div>
              <div className="space-y-1.5"><Label>Password / App Password</Label><Input type="password" value={accountForm.password} onChange={(e) => setAccountForm((p) => ({ ...p, password: e.target.value }))} className="h-10 rounded-xl" /></div>
            </div>
            <div className="space-y-1.5"><Label>Signature (optional)</Label><Textarea value={accountForm.signature} onChange={(e) => setAccountForm((p) => ({ ...p, signature: e.target.value }))} rows={3} className="rounded-xl" placeholder="Best regards, John" /></div>
            <Button type="submit" variant="blue" className="rounded-xl w-full"><Mail size={16} className="mr-1.5" /> Connect Account</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 h-[calc(100vh-16rem)]">
      <div className="w-full lg:w-72 flex-shrink-0 mb-4 lg:mb-0">
        <Button variant="blue" onClick={() => setShowCompose(true)} className="w-full rounded-xl mb-4">
          <Plus size={16} className="mr-1.5" /> Compose
        </Button>
        <div className="space-y-1 mb-4">
          {FOLDERS.map((f) => {
            const Icon = f.icon;
            const count = f.id === 'INBOX' ? messages.filter((m) => !m.isRead).length : 0;
            return (
              <button key={f.id} onClick={() => { setCurrentFolder(f.id); setSelectedMsg(null); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentFolder === f.id ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icon size={16} />
                <span className="flex-1 text-left">{f.label}</span>
                {count > 0 && <span className="text-xs bg-brand-blue text-white px-2 py-0.5 rounded-full">{count}</span>}
              </button>
            );
          })}
        </div>
        {accounts.length > 1 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-1">Accounts</p>
            {accounts.map((acc) => (
              <button key={acc._id} onClick={() => setCurrentAccount(acc._id)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${currentAccount === acc._id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Mail size={12} /> {acc.email}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-6 overflow-hidden">
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails..." className="h-10 rounded-xl pl-9 border-gray-200" />
          </div>
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="max-h-[50vh] lg:max-h-[65vh] overflow-y-auto">
              {!Array.isArray(filteredMessages) || filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Inbox size={40} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No emails in {currentFolder.toLowerCase()}</p>
                </div>
              ) : filteredMessages.map((msg) => (
                <button key={msg._id} onClick={() => openMessage(msg)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedMsg?._id === msg._id ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''} ${!msg.isRead ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${msg.isRead ? 'bg-gray-300' : 'bg-brand-blue'}`}>
                      {(msg.from?.name || msg.from?.address || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm truncate flex-1 ${msg.isRead ? 'text-gray-600 font-medium' : 'text-gray-900 font-semibold'}`}>{msg.from?.name || msg.from?.address || 'Unknown'}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(msg.receivedAt)}</span>
                      </div>
                      <p className={`text-xs truncate mb-0.5 ${msg.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>{msg.subject}</p>
                      <p className="text-[11px] text-gray-400 truncate">{msg.bodyText?.substring(0, 80) || ''}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex-1 mt-4 lg:mt-0">
          {selectedMsg ? (
            <Card className="border border-gray-100 shadow-sm h-full">
              <div className="max-h-[65vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white font-bold">
                      {(selectedMsg.from?.name || selectedMsg.from?.address || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedMsg.from?.name || 'Unknown'}</h3>
                      <p className="text-xs text-gray-500">{selectedMsg.from?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleStar(selectedMsg._id)}>
                      <Star size={14} className={selectedMsg.isStarred ? 'text-amber-400 fill-amber-400' : 'text-gray-400'} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedMsg._id)}>
                      <Trash2 size={14} className="text-gray-400" />
                    </Button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-4">{selectedMsg.subject}</h2>

                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(selectedMsg.receivedAt).toLocaleString()}</span>
                  {Array.isArray(selectedMsg.to) && selectedMsg.to.length > 0 && (
                    <span>To: {selectedMsg.to.map((t) => t.name || t.address).join(', ')}</span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedMsg.bodyHtml || selectedMsg.bodyText }} />
                </div>

                {Array.isArray(selectedMsg.attachments) && selectedMsg.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Paperclip size={14} /> Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMsg.attachments.map((att, i) => (
                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 hover:bg-gray-200">
                          <Paperclip size={12} /> {att.filename}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setShowCompose(true)} className="rounded-xl">
                    <Reply size={14} className="mr-1.5" /> Reply
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Mail size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowCompose(false); }}>
          <Card className="w-full max-w-2xl mx-4 border border-gray-100 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">New Message</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}><Trash2 size={14} /></Button>
              </div>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-1.5"><Label>To</Label><Input value={composeData.to} onChange={(e) => setComposeData((p) => ({ ...p, to: e.target.value }))} placeholder="recipient@email.com" required className="h-10 rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>CC</Label><Input value={composeData.cc} onChange={(e) => setComposeData((p) => ({ ...p, cc: e.target.value }))} placeholder="cc@email.com" className="h-10 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>BCC</Label><Input value={composeData.bcc} onChange={(e) => setComposeData((p) => ({ ...p, bcc: e.target.value }))} placeholder="bcc@email.com" className="h-10 rounded-xl" /></div>
                </div>
                <div className="space-y-1.5"><Label>Subject</Label><Input value={composeData.subject} onChange={(e) => setComposeData((p) => ({ ...p, subject: e.target.value }))} required className="h-10 rounded-xl" /></div>
                <div className="space-y-1.5"><Label>Message</Label><Textarea value={composeData.body} onChange={(e) => setComposeData((p) => ({ ...p, body: e.target.value }))} rows={10} required className="rounded-xl" /></div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Emails sent via your connected provider</p>
                  <Button type="submit" variant="blue" disabled={sending} className="rounded-xl">
                    {sending ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Sending...</> : <><Send size={14} className="mr-1.5" /> Send</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmailTab;
