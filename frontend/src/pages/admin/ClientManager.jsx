import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Edit, Trash2, X, Upload, Link, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientManager = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    category: 'other',
    isActive: true,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await API.get('/admin/clients');
      setClients(res.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await API.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, logo: res.data.url }));
      toast.success('Logo uploaded');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/clients/${editingId}`, formData);
        toast.success('Client updated successfully');
      } else {
        await API.post('/admin/clients', formData);
        toast.success('Client created successfully');
      }
      setFormOpen(false);
      setEditingId(null);
      setUseUrlInput(false);
      setFormData({ name: '', logo: '', website: '', category: 'other', isActive: true });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      logo: item.logo || '',
      website: item.website || '',
      category: item.category || 'other',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setUseUrlInput(true);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await API.delete(`/admin/clients/${id}`);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setUseUrlInput(false);
    setFormData({ name: '', logo: '', website: '', category: 'other', isActive: true });
  };

  const categoryLabels = {
    finance: 'Finance',
    education: 'Education',
    healthcare: 'Healthcare',
    technology: 'Technology',
    government: 'Government',
    other: 'Other',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
            <p className="text-gray-500">Manage companies you've worked with</p>
          </div>
          <Button variant="blue" onClick={() => { setFormOpen(true); setUseUrlInput(false); }}>
            <Plus size={16} className="mr-2" /> Add Client
          </Button>
        </div>

        {formOpen && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'New'} Client</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Client Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Logo *</Label>
                    <button
                      type="button"
                      onClick={() => setUseUrlInput(!useUrlInput)}
                      className="text-xs text-brand-blue hover:text-brand-blue/80 font-medium flex items-center gap-1"
                    >
                      {useUrlInput ? <Upload size={12} /> : <Link size={12} />}
                      {useUrlInput ? 'Upload file instead' : 'Use URL instead'}
                    </button>
                  </div>

                  {useUrlInput ? (
                    <Input name="logo" placeholder="https://example.com/logo.png" value={formData.logo} onChange={handleChange} required />
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                        formData.logo
                          ? 'border-brand-green bg-brand-green/5'
                          : 'border-gray-200 hover:border-brand-blue bg-gray-50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : formData.logo ? (
                        <div className="flex flex-col items-center gap-3">
                          <img src={formData.logo} alt="Preview" className="h-16 rounded-lg object-contain shadow-sm" />
                          <p className="text-xs text-green-600 font-medium">Logo uploaded</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev) => ({ ...prev, logo: '' }));
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500">Drop a logo here or click to browse</p>
                          <p className="text-xs text-gray-400">JPG, PNG, GIF, WEBP, SVG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" placeholder="https://example.com" value={formData.website} onChange={handleChange} />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-brand-blue rounded" />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="blue" disabled={uploading || !formData.name || !formData.logo}>
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clients.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No clients yet. Add your first client!</p>
            </div>
          ) : (
            clients.map((item) => (
              <Card key={item._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  {item.logo && (
                    <div className="h-16 flex items-center justify-center mb-3">
                      <img src={item.logo} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500">{categoryLabels[item.category] || item.category}</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3 justify-center">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Edit size={12} className="mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientManager;
