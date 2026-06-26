import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import {
  MessageSquare, Send, User, Loader2,
  Mail, CheckCircle, XCircle, Clock,
  Plus, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://vt-agency.onrender.com' : '');

const ChatTab = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('active');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socketUrl = API_BASE || window.location.origin;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => console.error('[WS] Connection error:', err.message));

    socket.on('chat:message', (message) => {
      if (selected && message.session === selected._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on('session:updated', (updatedSession) => {
      setSessions((prev) => prev.map((s) => s._id === updatedSession._id ? updatedSession : s));
      if (selected && selected._id === updatedSession._id) {
        setSelected(updatedSession);
      }
    });

    socket.on('chat:stats:update', () => { fetchStats(); });

    socketRef.current = socket;

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (selected && socketRef.current?.connected) {
      socketRef.current.emit('join:session', selected._id);
      return () => {
        socketRef.current?.emit('leave:session', selected._id);
      };
    }
  }, [selected?._id]);

  const fetchSessions = () => {
    API.get('/chat/sessions', { params: { status: filter } }).then((r) => {
      setSessions(Array.isArray(r.data.sessions) ? r.data.sessions : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const fetchStats = () =>
    API.get('/chat/sessions/stats').then((r) => setStats(r.data)).catch(() => {});

  useEffect(() => {
    Promise.all([fetchSessions(), fetchStats()]);
  }, [filter]);

  const openSession = async (session) => {
    setSelected(session);
    try {
      const res = await API.get(`/chat/sessions/${session._id}`);
      setMessages(Array.isArray(res.data.messages) ? res.data.messages : []);
    } catch { setMessages([]); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selected) return;

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:send', {
        sessionId: selected._id,
        content: newMessage,
      });
      setNewMessage('');
    } else {
      setSending(true);
      try {
        const res = await API.post(`/chat/sessions/${selected._id}/messages`, { content: newMessage });
        setMessages((prev) => [...prev, res.data]);
        setNewMessage('');
        fetchSessions();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send');
      } finally { setSending(false); }
    }
  };

  const handleEnd = async () => {
    if (!selected || !window.confirm('End this chat session?')) return;
    if (socketRef.current?.connected) {
      socketRef.current.emit('session:end', selected._id);
      setSelected(null);
    } else {
      try {
        await API.put(`/chat/sessions/${selected._id}/end`);
        toast.success('Session ended');
        setSelected(null);
        fetchSessions();
        fetchStats();
      } catch { toast.error('Failed to end session'); }
    }
  };

  const handleAssign = async () => {
    if (!selected) return;
    if (socketRef.current?.connected) {
      socketRef.current.emit('session:assign', selected._id);
    } else {
      try {
        await API.put(`/chat/sessions/${selected._id}/assign`);
        toast.success('Session assigned to you');
        fetchSessions();
      } catch { toast.error('Failed to assign'); }
    }
  };

  const handleSync = async () => {
    if (!selected) return;
    try {
      await API.post(`/chat/sessions/${selected._id}/sync-contact`);
      toast.success('Contact synced');
    } catch { toast.error('Failed to sync'); }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-16rem)]">
      <div className="w-full lg:w-80 flex-shrink-0">
        {connected !== undefined && (
          <div className={`text-[10px] flex items-center gap-1 mb-2 px-1 ${connected ? 'text-green-600' : 'text-amber-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-amber-500'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
        )}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900">{stats.active}</p><p className="text-[10px] text-gray-500">Active</p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-600">{stats.waiting}</p><p className="text-[10px] text-gray-500">Waiting</p></CardContent></Card>
            <Card className="border border-gray-100 shadow-sm"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900">{stats.total}</p><p className="text-[10px] text-gray-500">Total</p></CardContent></Card>
          </div>
        )}

        <div className="flex gap-1 mb-3">
          {['active', 'waiting', 'ended'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${filter === s ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="max-h-[55vh] overflow-y-auto">
            {!Array.isArray(sessions) || sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare size={36} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No {filter} sessions</p>
              </div>
            ) : sessions.map((s) => (
              <button key={s._id} onClick={() => openSession(s)}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?._id === s._id ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.visitorName?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.visitorName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{s.pageTitle || s.pageUrl || 'Website'}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'active' ? 'bg-green-500' : s.status === 'waiting' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col">
        {selected ? (
          <Card className="border border-gray-100 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-sm font-bold">
                  {selected.visitorName?.charAt(0)?.toUpperCase() || 'V'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selected.visitorName}</p>
                  <p className="text-[11px] text-gray-500">{selected.pageTitle || selected.pageUrl || 'Website Visitor'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selected.visitorEmail && (
                  <Button variant="ghost" size="sm" onClick={handleSync} title="Create contact">
                    <User size={14} className="text-gray-500" />
                  </Button>
                )}
                {!selected.assignedTo && (
                  <Button variant="ghost" size="sm" onClick={handleAssign} title="Assign to me">
                    <Users size={14} className="text-gray-500" />
                  </Button>
                )}
                {selected.status !== 'ended' && (
                  <Button variant="ghost" size="sm" onClick={handleEnd} title="End session">
                    <XCircle size={14} className="text-red-500" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
              {messages.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No messages yet</p>
                </div>
              ) : messages.map((msg, i) => (
                <div key={msg._id || i} className={`flex ${msg.sender === 'agent' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                  {msg.sender === 'system' ? (
                    <div className="text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{msg.content}</div>
                  ) : (
                    <div className={`max-w-[75%] ${msg.sender === 'agent' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-800'} rounded-2xl px-4 py-2.5`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'agent' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {msg.senderName ? `${msg.senderName} · ` : ''}{formatTime(msg.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {selected.status !== 'ended' ? (
              <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-gray-100">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..." className="h-11 rounded-xl flex-1 border-gray-200" />
                <Button type="submit" variant="blue" disabled={sending || !newMessage.trim()} className="rounded-xl h-11 w-11 p-0">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </Button>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1"><CheckCircle size={12} className="text-green-500" /> Session ended</p>
              </div>
            )}
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Select a chat session</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTab;
