import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import toast from 'react-hot-toast';
import {
  Image, Users, Newspaper, Briefcase,
  Settings, FileText, Upload, ScrollText,
  ArrowUpRight, Loader2, Key, Eye, EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const { navigateWithLoader } = useLoading();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          API.get('/admin/hero'),
          API.get('/admin/testimonials'),
          API.get('/admin/news'),
          API.get('/admin/clients'),
          API.get('/admin/projects'),
          API.get('/admin/messages'),
        ]);
        setStats({
          heroSlides: results[0].status === 'fulfilled' ? results[0].value.data.length : 0,
          testimonials: results[1].status === 'fulfilled' ? results[1].value.data.length : 0,
          news: results[2].status === 'fulfilled' ? results[2].value.data.length : 0,
          clients: results[3].status === 'fulfilled' ? results[3].value.data.length : 0,
          projects: results[4].status === 'fulfilled' ? results[4].value.data.length : 0,
          messages: results[5].status === 'fulfilled' ? results[5].value.data.length : 0,
        });
      } catch {
        toast.error('Failed to load some stats');
      }
    };
    fetchStats();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: profileName, avatar: profileAvatar });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await API.put('/auth/change-password', passwordData);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const cards = [
    { title: 'Hero Slides', count: stats.heroSlides || 0, icon: Image, color: 'from-blue-500 to-blue-600', link: '/admin/hero' },
    { title: 'Testimonials', count: stats.testimonials || 0, icon: Users, color: 'from-emerald-500 to-emerald-600', link: '/admin/testimonials' },
    { title: 'News', count: stats.news || 0, icon: Newspaper, color: 'from-purple-500 to-purple-600', link: '/admin/news' },
    { title: 'Clients', count: stats.clients || 0, icon: Briefcase, color: 'from-orange-500 to-orange-600', link: '/admin/clients' },
    { title: 'Projects', count: stats.projects || 0, icon: FileText, color: 'from-pink-500 to-pink-600', link: '/admin/projects' },
    { title: 'Messages', count: stats.messages || 0, icon: ScrollText, color: 'from-teal-500 to-teal-600', link: '/admin/settings' },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your website content and settings</p>
        </div>
        <button
          onClick={() => navigateWithLoader('/')}
          className="inline-flex items-center gap-1.5 text-sm text-brand-blue font-medium hover:text-brand-blue/80 transition-colors"
        >
          View site <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Profile card */}
      <Card className="mb-8 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-shrink-0 relative">
              {uploading ? (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-100">
                  <Loader2 size={28} className="animate-spin text-brand-blue" />
                </div>
              ) : profileAvatar ? (
                <img src={profileAvatar} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-100">
                  {initials}
                </div>
              )}
            </div>
            <form onSubmit={handleProfileSave} className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profileName" className="text-sm font-medium text-gray-700">Full name</Label>
                  <Input id="profileName" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your full name" className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Profile photo</Label>
                  <div className="flex items-center gap-3">
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
                          if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
                          setUploading(true);
                          try {
                            const form = new FormData();
                            form.append('image', file);
                            const res = await API.post('/admin/upload', form, {
                              headers: { 'Content-Type': 'multipart/form-data' },
                            });
                            setProfileAvatar(res.data.url);
                            toast.success('Photo uploaded');
                          } catch {
                            toast.error('Failed to upload photo');
                          } finally {
                            setUploading(false);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-brand-blue/30 transition-colors text-sm text-gray-600 font-medium">
                        <Upload size={16} /> Upload photo
                      </div>
                    </label>
                    {profileAvatar && (
                      <button
                        type="button"
                        onClick={() => setProfileAvatar('')}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <Button type="submit" variant="blue" size="sm" disabled={saving || uploading}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Password change card */}
      <Card className="mb-8 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <Key size={20} className="text-brand-blue" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Must contain at least 8 characters, a capital letter, a number, and a special character</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                  className="h-11 rounded-xl border-gray-200 pr-10"
                />
                <button type="button" onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  className="h-11 rounded-xl border-gray-200 pr-10"
                />
                <button type="button" onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="blue" size="sm" disabled={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {cards.map((card) => (
          <Link to={card.link} key={card.title}>
            <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
              <CardContent className="p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.count}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-sm`}>
                    <card.icon className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Card className="border border-gray-200 shadow-sm mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="blue" size="sm" onClick={() => navigate('/admin/hero')}>+ Add Hero Slide</Button>
            <Button variant="green" size="sm" onClick={() => navigate('/admin/testimonials')}>+ Add Testimonial</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate('/admin/news')}>+ Add News</Button>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/admin/clients')}>+ Add Client</Button>
            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => navigate('/admin/projects')}>+ Add Project</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
