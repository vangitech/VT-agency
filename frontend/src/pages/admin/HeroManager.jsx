import { useState, useEffect, useRef } from 'react';
import API, { imageUrl } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Edit, Trash2, X, Upload, Link, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const HeroManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    ctaText: 'Learn More',
    ctaLink: '#',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await API.get('/admin/hero');
      setSlides(res.data);
    } catch (error) {
      toast.error('Failed to fetch slides');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      setFormData((prev) => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
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
        await API.put(`/admin/hero/${editingId}`, formData);
        toast.success('Slide updated successfully');
      } else {
        await API.post('/admin/hero', formData);
        toast.success('Slide created successfully');
      }
      setFormOpen(false);
      setEditingId(null);
      setUseUrlInput(false);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        ctaText: 'Learn More',
        ctaLink: '#',
        order: 0,
        isActive: true,
      });
      fetchSlides();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (slide) => {
    setEditingId(slide._id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      image: slide.image,
      ctaText: slide.ctaText || 'Learn More',
      ctaLink: slide.ctaLink || '#',
      order: slide.order || 0,
      isActive: slide.isActive !== undefined ? slide.isActive : true,
    });
    setUseUrlInput(true);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await API.delete(`/admin/hero/${id}`);
      toast.success('Slide deleted successfully');
      fetchSlides();
    } catch (error) {
      toast.error('Failed to delete slide');
    }
  };

  const handleCancel = () => {
    setFormOpen(false);
    setEditingId(null);
    setUseUrlInput(false);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      ctaText: 'Learn More',
      ctaLink: '#',
      order: 0,
      isActive: true,
    });
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
            <h1 className="text-3xl font-bold text-gray-800">Hero Slides</h1>
            <p className="text-gray-500">Manage the hero carousel slides</p>
          </div>
          <Button variant="blue" onClick={() => { setFormOpen(true); setUseUrlInput(false); }}>
            <Plus size={16} className="mr-2" /> Add Slide
          </Button>
        </div>

        {/* Form */}
        {formOpen && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Slide' : 'New Slide'}
                </h2>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle *</Label>
                    <Input
                      id="subtitle"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Image *</Label>
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
                    <Input
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                        formData.image
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
                      ) : formData.image ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-32 rounded-lg object-cover shadow-sm"
                          />
                          <p className="text-xs text-green-600 font-medium">Image uploaded</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev) => ({ ...prev, image: '' }));
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Drop an image here or click to browse
                          </p>
                          <p className="text-xs text-gray-400">JPG, PNG, GIF, WEBP, SVG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      value={formData.order}
                      onChange={handleChange}
                    />
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">CTA Text</Label>
                    <Input
                      id="ctaText"
                      name="ctaText"
                      value={formData.ctaText}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">CTA Link</Label>
                    <Input
                      id="ctaLink"
                      name="ctaLink"
                      value={formData.ctaLink}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="blue" disabled={uploading || !formData.image}>
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Slides List */}
        <div className="space-y-4">
          {slides.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No slides yet. Create your first slide!</p>
            </div>
          ) : (
            slides.map((slide) => (
              <Card key={slide._id} className="border-0 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {slide.image && (
                      <div className="w-full md:w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl(slide.image)}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-gray-800">{slide.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-400">Order: {slide.order}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{slide.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(slide)}>
                        <Edit size={14} className="mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(slide._id)}>
                        <Trash2 size={14} className="mr-1" /> Delete
                      </Button>
                    </div>
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

export default HeroManager;
