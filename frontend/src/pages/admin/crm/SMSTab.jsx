import { useState, useEffect, useRef } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  MessageSquare, Send, Phone, Loader2,
  User, Clock, CheckCircle, ArrowLeft,
  Plus, Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SMSTab = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newSms, setNewSms] = useState({ to: '', body: '' });
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = () =>
    API.get('/sms/conversations').then((r) => {
      setConversations(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { fetchConversations(); }, []);

  const openConversation = async (conv) => {
    setSelectedConvo(conv);
    const contactId = conv.contact?._id;
    const params = {};
    if (contactId) params.contact = contactId;
    if (conv.conversationId) params.conversationId = conv._id;
    try {
      const res = await API.get('/sms/messages', { params });
      setMessages(Array.isArray(res.data.messages) ? res.data.messages : []);
    } catch { setMessages([]); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newSms.to || !newSms.body) { toast.error('Number and message required'); return; }
    setSending(true);
    try {
      await API.post('/sms/messages/send', {
        to: newSms.to,
        body: newSms.body,
        conversationId: selectedConvo?._id,
      });
      toast.success('SMS sent');
      setNewSms({ to: '', body: '' });
      setShowCompose(false);
      fetchConversations();
      if (selectedConvo) openConversation(selectedConvo);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-16rem)]">
      <div className="w-full lg:w-80 flex-shrink-0">
        <Button variant="blue" onClick={() => { setShowCompose(true); setSelectedConvo(null); }} className="w-full rounded-xl mb-4">
          <Plus size={16} className="mr-1.5" /> New SMS
        </Button>
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto">
            {!Array.isArray(conversations) || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare size={36} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No SMS conversations</p>
              </div>
            ) : conversations.map((conv, i) => (
              <button key={conv._id + i} onClick={() => openConversation(conv)}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConvo?._id === conv._id ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {conv.contact?.name?.charAt(0)?.toUpperCase() || conv.to?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conv.contact?.name || conv.to || conv.from || 'Unknown'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-gray-400">{formatDate(conv.lastDate)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{conv.count} msgs</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConvo && !showCompose ? (
          <Card className="border border-gray-100 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-sm font-bold">
                  {selectedConvo.contact?.name?.charAt(0)?.toUpperCase() || selectedConvo.to?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedConvo.contact?.name || selectedConvo.to || 'Unknown'}</p>
                  <p className="text-[11px] text-gray-500">{selectedConvo.contact?.phone || selectedConvo.to}</p>
                </div>
              </div>
              <Button variant="blue" size="sm" onClick={() => { setShowCompose(true); setNewSms((p) => ({ ...p, to: selectedConvo.contact?.phone || selectedConvo.to })); }} className="rounded-xl text-xs">
                <Send size={12} className="mr-1" /> Reply
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
              {messages.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No messages</p>
                </div>
              ) : messages.map((msg, i) => (
                <div key={msg._id || i} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${msg.direction === 'outbound' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-800'} rounded-2xl px-4 py-2.5`}>
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                    <div className={`flex items-center gap-1.5 mt-1 ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] ${msg.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'}`}>{formatDate(msg.createdAt)}</span>
                      {msg.direction === 'outbound' && (
                        msg.status === 'delivered' ? <CheckCircle size={10} className="text-blue-200" /> :
                        msg.status === 'sent' ? <CheckCircle size={10} className="text-blue-200" /> :
                        <Clock size={10} className="text-blue-200" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </Card>
        ) : showCompose ? (
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Send SMS</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>
                  <ArrowLeft size={16} />
                </Button>
              </div>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input value={newSms.to} onChange={(e) => setNewSms((p) => ({ ...p, to: e.target.value }))}
                    placeholder="+234 800 000 0000" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea value={newSms.body} onChange={(e) => setNewSms((p) => ({ ...p, body: e.target.value }))}
                    rows={6} required className="rounded-xl" placeholder="Type your SMS message..." />
                  <p className="text-[10px] text-gray-400">{newSms.body.length} characters (approx. {Math.ceil(newSms.body.length / 160)} segment{Math.ceil(newSms.body.length / 160) !== 1 ? 's' : ''})</p>
                </div>
                <Button type="submit" variant="blue" disabled={sending || !newSms.to || !newSms.body} className="rounded-xl w-full">
                  {sending ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Sending...</>
                    : <><Send size={14} className="mr-1.5" /> Send SMS</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Smartphone size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Select a conversation or compose a new SMS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSTab;
