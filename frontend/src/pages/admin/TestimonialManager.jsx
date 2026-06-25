import  { useState, useEffect } from 'react';
import API from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    content: '',
    avatar: '',
    rating: 5,
    isActive: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await API.get('/admin/testimonials');
      setTestimonials(res.data);
    } catch (error) {
      toast.error('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/testimonials/${editingId}`, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await API.post('/admin/testimonials', formData);
        toast.success('Testimonial created successfully');
      }
      setFormOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        position: '',
        company: '',
        content: '',
        avatar: '',
        rating: 5,
        isActive: true,
      });
      fetchTestimonials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      position: item.position,
      company: item.company,
      content: item.content,
      avatar: item.avatar || '',
      rating: item.rating || 5,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await API.delete(`/admin/testimonials/${id}`);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Testimonials</h1>
            <p className="text-gray-500">Manage client testimonials</p>
          </div>
          <Button variant="blue" onClick={() => setFormOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Testimonial
          </Button>
        </div>

        {formOpen && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'New'} Testimonial</h2>
                <button onClick={() => { setFormOpen(false); setEditingId(null); setFormData({ name: '', position: '', company: '', content: '', avatar: '', rating: 5, isActive: true }); }} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input id="position" name="position" value={formData.position} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input id="rating" name="rating" type="number" min="1" max="5" value={formData.rating} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={3} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" name="avatar" placeholder="https://example.com/avatar.jpg" value={formData.avatar} onChange={handleChange} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-brand-blue rounded" />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="blue">{editingId ? 'Update' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditingId(null); setFormData({ name: '', position: '', company: '', content: '', avatar: '', rating: 5, isActive: true }); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No testimonials yet. Add your first one!</p>
            </div>
          ) : (
            testimonials.map((item) => (
              <Card key={item._id} className="border-0 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <span className="text-sm text-gray-500">{item.position}, {item.company}</span>
                        {renderStars(item.rating || 5)}
                        <span className={`text-xs px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">"{item.content}"</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit size={14} className="mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>
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

export default TestimonialManager;