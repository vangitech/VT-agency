import { useState, useEffect } from 'react';
import API from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Shield, ShieldCheck, ShieldAlert,
  Trash2, Plus, X, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  superadmin: { label: 'Super Admin', icon: ShieldAlert, color: 'text-red-600 bg-red-50 border-red-200' },
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-brand-blue bg-brand-blue/5 border-brand-blue/20' },
  editor: { label: 'Editor', icon: Shield, color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

const UserManager = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'editor' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/users', formData);
      toast.success('User created');
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role: 'editor' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await API.put(`/auth/users/${userId}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/auth/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage admin users and roles</p>
        </div>
        <Button variant="blue" onClick={() => setShowForm(true)} className="flex-shrink-0">
          <Plus size={16} className="mr-2" /> Add User
        </Button>
      </div>

      {showForm && (
        <Card className="border border-gray-100 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Create New User</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="h-11 rounded-xl border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="h-11 rounded-xl border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="h-11 rounded-xl border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <Button type="submit" variant="blue" className="rounded-xl">Create User</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {users.map((u) => {
          const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.editor;
          const RoleIcon = roleConf.icon;
          const isSelf = u._id === currentUser?._id;
          return (
            <Card key={u._id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm truncate">{u.name}</span>
                      {isSelf && <span className="text-[10px] text-brand-blue bg-brand-blue/5 px-1.5 py-0.5 rounded-full font-medium">You</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${roleConf.color}`}>
                      <RoleIcon size={12} />
                      {roleConf.label}
                    </span>
                    {!isSelf && (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                      >
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    )}
                    {!isSelf && (
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(u._id)}>
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserManager;