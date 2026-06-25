import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import {
  Mail, MessageSquare, CheckCircle, Send, Trash2,
  Loader2, Inbox, Reply, ArrowLeft, ChevronRight,
  Clock, User, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CRMManager = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({ total: 0, unread: 0, replied: 0 });
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const replyRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await API.get('/crm/messages');
      setMessages(res.data);
    } catch {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/crm/messages/stats');
      setStats(res.data);
    } catch {}
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    setShowMobileList(false);
    setReplyBody('');
    if (!msg.read) {
      try {
        await API.put(`/crm/messages/${msg._id}/read`);
        setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, read: true } : m));
        fetchStats();
      } catch {}
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await API.delete(`/crm/messages/${id}`);
      toast.success('Message deleted');
      if (selected?._id === id) setSelected(null);
      fetchMessages();
      fetchStats();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      await API.post(`/crm/messages/${selected._id}/reply`, { body: replyBody });
      toast.success('Reply sent successfully');
      setReplyBody('');
      fetchMessages();
      fetchStats();
      if (selected) {
        const updated = await API.get(`/crm/messages/${selected._id}`);
        setSelected(updated.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-6 lg:p-8 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-500 mt-1">Manage inquiries and send replies</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-gray-500">
            <Inbox size={14} className="text-brand-blue" />
            {stats.total} total
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium">
            <Clock size={12} />
            {stats.unread} unread
          </span>
          <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            {stats.replied} replied
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden px-6 lg:px-8 pb-6 gap-6">
        {/* Messages list */}
        <div className={`${showMobileList ? 'flex' : 'hidden'} lg:flex w-full lg:w-96 flex-shrink-0 flex-col`}>
          <Card className="flex-1 border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-y-auto flex-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Inbox size={40} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No messages yet</p>
                  <p className="text-gray-400 text-xs mt-1">Contact form submissions will appear here</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <button
                    key={msg._id}
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selected?._id === msg._id ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                        msg.read ? 'bg-gray-300' : 'bg-brand-blue'
                      }`}>
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-semibold truncate ${msg.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {msg.name}
                          </span>
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

        {/* Message detail */}
        <div className={`${!showMobileList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col`}>
          {selected ? (
            <Card className="flex-1 border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6 lg:p-8">
                {/* Back button mobile */}
                <button
                  onClick={() => setShowMobileList(true)}
                  className="lg:hidden flex items-center gap-1.5 text-sm text-brand-blue font-medium mb-4"
                >
                  <ArrowLeft size={16} /> Back to messages
                </button>

                {/* Message header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-lg font-bold">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                      <a href={`mailto:${selected.email}`} className="text-sm text-brand-blue hover:underline">{selected.email}</a>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selected._id)}>
                    <Trash2 size={12} className="mr-1" /> Delete
                  </Button>
                </div>

                {/* Subject & date */}
                <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
                  <span className="font-semibold text-gray-900">{selected.subject}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Clock size={14} />
                    {formatDate(selected.createdAt)}
                  </span>
                  {selected.replied && (
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                      <CheckCircle size={11} /> Replied
                    </span>
                  )}
                </div>

                {/* Message body */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-8">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Reply history */}
                {selected.replies?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Reply size={14} /> Reply History ({selected.replies.length})
                    </h3>
                    <div className="space-y-3">
                      {selected.replies.map((reply, idx) => (
                        <div key={idx} className="bg-brand-blue/5 rounded-2xl p-4 border border-brand-blue/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-brand-blue">{reply.adminName}</span>
                            <span className="text-[10px] text-gray-400">{formatDate(reply.sentAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                          {reply.provider && (
                            <span className="text-[10px] text-gray-400 mt-2 inline-block">Sent via {reply.provider}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply form */}
                <div ref={replyRef}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Send size={14} /> Send Reply
                  </h3>
                  <form onSubmit={handleReply} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="replyTo" className="text-xs font-medium text-gray-500">To</Label>
                      <Input id="replyTo" value={selected.email} disabled className="h-10 rounded-xl bg-gray-50 border-gray-200 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="replySubject" className="text-xs font-medium text-gray-500">Subject</Label>
                      <Input id="replySubject" value={`Re: ${selected.subject}`} disabled className="h-10 rounded-xl bg-gray-50 border-gray-200 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="replyBody" className="text-sm font-medium text-gray-700">Your Reply</Label>
                      <Textarea
                        id="replyBody"
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        rows={5}
                        placeholder="Write your reply here..."
                        required
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button type="submit" variant="blue" disabled={sending || !replyBody.trim()} className="rounded-xl">
                        {sending ? (
                          <><Loader2 size={14} className="mr-1.5 animate-spin" /> Sending...</>
                        ) : (
                          <><Send size={14} className="mr-1.5" /> Send Reply</>
                        )}
                      </Button>
                      <p className="text-xs text-gray-400">Emails sent via Resend + Brevo with professional template</p>
                    </div>
                  </form>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Select a message to reply</p>
                <p className="text-gray-400 text-xs mt-1">Choose from the list on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMManager;