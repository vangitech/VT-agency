import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Save, Eye, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const legalPages = [
  { value: 'privacy', label: 'Privacy Policy', path: '/privacy' },
  { value: 'terms', label: 'Terms & Conditions', path: '/terms' },
  { value: 'faq', label: 'FAQ', path: '/faq' },
  { value: 'policy', label: 'Cookie Policy', path: '/policy' },
];

const LegalPagesManager = () => {
  const [selectedPage, setSelectedPage] = useState('privacy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState(null);

  const mountedRef = useRef(true);
  const currentPageRef = useRef('privacy');

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    currentPageRef.current = selectedPage;
    fetchContent();
  }, [selectedPage]);

  const switchPage = (page) => {
    if (page === selectedPage) return;
    setError(null);
    setLoading(true);
    setSections(null);
    setSelectedPage(page);
  };

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = currentPageRef.current;
      const res = await API.get(`/admin/page-content/${page}`);

      if (!mountedRef.current) return;
      if (currentPageRef.current !== page) return;

      const s = res.data && res.data.sections ? res.data.sections : {};
      setSections({
        title: s.title || '',
        lastUpdated: s.lastUpdated || '',
        content: Array.isArray(s.content) ? s.content : [],
      });
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;

      if (err.response && err.response.status === 404) {
        setSections({ title: '', lastUpdated: '', content: [] });
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load content');
        setSections({ title: '', lastUpdated: '', content: [] });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/admin/page-content/${selectedPage}`, sections);
      toast.success(`${legalPages.find(p => p.value === selectedPage)?.label} updated`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setSections((prev) => ({
      ...prev,
      content: [...(prev?.content || []), { heading: '', body: '' }],
    }));
  };

  const removeSection = (index) => {
    setSections((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
  };

  const updateSection = (index, field, value) => {
    setSections((prev) => {
      const newContent = [...prev.content];
      newContent[index] = { ...newContent[index], [field]: value };
      return { ...prev, content: newContent };
    });
  };

  const currentPage = legalPages.find((p) => p.value === selectedPage);

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Legal Pages</h1>
          <p className="text-gray-500 mt-1">Manage privacy, terms, FAQ, and cookie policy content</p>
        </div>
        <div className="flex items-center gap-3">
          {currentPage && (
            <Link
              to={currentPage.path}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-brand-blue font-medium hover:text-brand-blue/80 transition-colors"
            >
              <Eye size={16} /> Preview
            </Link>
          )}
          <Button variant="blue" size="sm" onClick={handleSave} disabled={saving || !sections}>
            <Save size={16} className="mr-1.5" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {legalPages.map((page) => (
          <button
            key={page.value}
            onClick={() => switchPage(page.value)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedPage === page.value
                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            <FileText size={16} />
            {page.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <p className="font-medium mb-1">Failed to load content</p>
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchContent}>
            Retry
          </Button>
        </div>
      )}

      {/* Editor */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        </div>
      ) : sections ? (
        <div className="space-y-6 max-w-4xl">
          {/* Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={sections.title}
                onChange={(e) => setSections((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Page title"
                className="h-12 rounded-xl border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastUpdated">Last Updated</Label>
              <Input
                id="lastUpdated"
                value={sections.lastUpdated}
                onChange={(e) => setSections((prev) => ({ ...prev, lastUpdated: e.target.value }))}
                placeholder="e.g. June 2026"
                className="h-12 rounded-xl border-gray-200"
              />
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-gray-900">Content Sections</Label>
              <Button variant="outline" size="sm" onClick={addSection}>
                + Add Section
              </Button>
            </div>
            {(!sections.content || sections.content.length === 0) && (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No sections yet. Click &quot;Add Section&quot; to get started.</p>
              </div>
            )}
            {sections.content && sections.content.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Section {index + 1}</span>
                  <button
                    onClick={() => removeSection(index)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Heading</Label>
                  <Input
                    value={item.heading}
                    onChange={(e) => updateSection(index, 'heading', e.target.value)}
                    placeholder="Section heading"
                    className="h-11 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Body</Label>
                  <Textarea
                    value={item.body}
                    onChange={(e) => updateSection(index, 'body', e.target.value)}
                    placeholder="Write the section content here..."
                    rows={4}
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button variant="blue" size="lg" onClick={handleSave} disabled={saving}>
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : `Save ${currentPage?.label}`}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LegalPagesManager;
