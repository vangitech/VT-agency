import React, { useState, useEffect } from 'react';
import API from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';
import { Mail, Trash2, CheckCircle, ExternalLink } from 'lucide-react';

const SettingsManager = () => {
  const [settings, setSettings] = useState({
    companyName: 'Vangitech Limited',
    companyEmail: 'info@vangitech.com',
    companyPhone: '+234 806 975 2912',
    companyAddress: 'No 38 Mike Akhigbe Way Jabi FCT-Abuja',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    footerCopyright: 'All rights reserved.',
    newsApiKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    fetchSettings();
    fetchMessages();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/admin/settings');
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get('/admin/messages');
      setMessages(res.data);
    } catch {
      // silent
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/admin/settings', settings);
      toast.success('Settings updated successfully');
    } catch {
      toast.error('Failed to update settings');
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/admin/messages/${id}/read`);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, read: true } : msg))
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const deleteMessage = async (id) => {
    try {
      await API.delete(`/admin/messages/${id}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage website settings, social links, and contact messages</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
          }`}
        >
          Site Settings
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'messages'
              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
          }`}
        >
          Contact Messages
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'settings' ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</Label>
                  <Input id="companyName" name="companyName" value={settings.companyName} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-sm font-medium text-gray-700">Company Email</Label>
                  <Input id="companyEmail" name="companyEmail" type="email" value={settings.companyEmail} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone" className="text-sm font-medium text-gray-700">Company Phone</Label>
                  <Input id="companyPhone" name="companyPhone" value={settings.companyPhone} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="text-sm font-medium text-gray-700">Company Address</Label>
                  <Input id="companyAddress" name="companyAddress" value={settings.companyAddress} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
              </div>

              <h3 className="font-bold text-gray-900 pt-6 border-t border-gray-200">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl" className="text-sm font-medium text-gray-700">Facebook URL</Label>
                  <Input id="facebookUrl" name="facebookUrl" placeholder="https://facebook.com/..." value={settings.facebookUrl} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl" className="text-sm font-medium text-gray-700">Twitter URL</Label>
                  <Input id="twitterUrl" name="twitterUrl" placeholder="https://twitter.com/..." value={settings.twitterUrl} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-700">LinkedIn URL</Label>
                  <Input id="linkedinUrl" name="linkedinUrl" placeholder="https://linkedin.com/..." value={settings.linkedinUrl} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl" className="text-sm font-medium text-gray-700">YouTube URL</Label>
                  <Input id="youtubeUrl" name="youtubeUrl" placeholder="https://youtube.com/..." value={settings.youtubeUrl} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerCopyright" className="text-sm font-medium text-gray-700">Footer Copyright Text</Label>
                <Input id="footerCopyright" name="footerCopyright" value={settings.footerCopyright} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
              </div>

              <h3 className="font-bold text-gray-900 pt-6 border-t border-gray-200">Integrations</h3>
              <div className="space-y-2">
                <Label htmlFor="newsApiKey" className="text-sm font-medium text-gray-700">
                  NewsAPI Key
                  <span className="text-xs text-gray-400 ml-2 font-normal">(get one at newsapi.org)</span>
                </Label>
                <Input
                  id="newsApiKey"
                  name="newsApiKey"
                  type="password"
                  placeholder="Enter your NewsAPI API key"
                  value={settings.newsApiKey}
                  onChange={handleChange}
                  className="h-11 rounded-xl border-gray-200"
                />
              </div>

              <Button type="submit" variant="blue" size="lg" className="rounded-xl shadow-lg shadow-brand-blue/25">
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Messages tab */
        <div>
          {messagesLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <Mail size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-sm ${
                    msg.read ? 'border-gray-100' : 'border-brand-blue/20 bg-brand-blue/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{msg.name}</span>
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {msg.email} &middot; {new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mb-2">{msg.subject}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!msg.read && (
                        <button
                          onClick={() => markAsRead(msg._id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this message?')) deleteMessage(msg._id);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsManager;
