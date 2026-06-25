import React, { useState, useEffect } from 'react';
import API from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: 'software',
    technologies: [],
    client: '',
    completionDate: '',
    isActive: true,
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/admin/projects');
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/projects/${editingId}`, formData);
        toast.success('Project updated successfully');
      } else {
        await API.post('/admin/projects', formData);
        toast.success('Project created successfully');
      }
      setFormOpen(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        category: 'software',
        technologies: [],
        client: '',
        completionDate: '',
        isActive: true,
      });
      setTechInput('');
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image || '',
      category: item.category || 'software',
      technologies: item.technologies || [],
      client: item.client || '',
      completionDate: item.completionDate ? item.completionDate.split('T')[0] : '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/admin/projects/${id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const categoryLabels = {
    software: 'Software',
    cybersecurity: 'Cybersecurity',
    fintech: 'Fintech',
    edutech: 'EduTech',
    medical: 'Medical',
    consulting: 'Consulting',
  };

  const getCategoryColor = (category) => {
    const colors = {
      software: 'bg-blue-100 text-blue-700',
      cybersecurity: 'bg-red-100 text-red-700',
      fintech: 'bg-green-100 text-green-700',
      edutech: 'bg-purple-100 text-purple-700',
      medical: 'bg-pink-100 text-pink-700',
      consulting: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
            <p className="text-gray-500">Manage your portfolio projects</p>
          </div>
          <Button variant="blue" onClick={() => setFormOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Project
          </Button>
        </div>

        {formOpen && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'New'} Project</h2>
                <button onClick={() => { setFormOpen(false); setEditingId(null); setFormData({ title: '', description: '', image: '', category: 'software', technologies: [], client: '', completionDate: '', isActive: true }); setTechInput(''); }} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" name="image" placeholder="https://example.com/project.jpg" value={formData.image} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Input id="client" name="client" value={formData.client} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input id="completionDate" name="completionDate" type="date" value={formData.completionDate} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Technologies</Label>
                  <div className="flex gap-2">
                    <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="e.g. React, Node.js" className="flex-1" />
                    <Button type="button" variant="outline" onClick={addTechnology}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies.map((tech) => (
                      <span key={tech} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center gap-1">
                        {tech}
                        <button type="button" onClick={() => removeTechnology(tech)} className="text-gray-400 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-brand-blue rounded" />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="blue">{editingId ? 'Update' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditingId(null); setFormData({ title: '', description: '', image: '', category: 'software', technologies: [], client: '', completionDate: '', isActive: true }); setTechInput(''); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No projects yet. Add your first project!</p>
            </div>
          ) : (
            projects.map((item) => (
              <Card key={item._id} className="border-0 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {item.image && (
                      <div className="w-full md:w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-gray-800">{item.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                          {categoryLabels[item.category] || item.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                      {item.client && <p className="text-xs text-gray-400">Client: {item.client}</p>}
                      {item.technologies && item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.technologies.slice(0, 4).map((tech) => (
                            <span key={tech} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{tech}</span>
                          ))}
                          {item.technologies.length > 4 && (
                            <span className="text-xs text-gray-400">+{item.technologies.length - 4}</span>
                          )}
                        </div>
                      )}
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

export default ProjectManager;