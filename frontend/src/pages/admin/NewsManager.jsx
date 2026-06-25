import { useState, useEffect } from 'react';
import API, { imageUrl } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import {
  Plus, Edit, Trash2, X, Globe, Download, Search,
  ExternalLink, Calendar, Newspaper, Loader2, AlertCircle,
  CheckCircle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Technology', 'Software/IT', 'Cybersecurity', 'Fintech',
  'Business', 'Health', 'Science',
  'Sports', 'Entertainment', 'General',
];

const NEWSAPI_CATEGORIES = [
  { id: 'technology', value: 'technology', label: 'Technology', search: '' },
  { id: 'software', value: 'technology', label: 'Software/IT', search: 'software OR IT' },
  { id: 'cybersecurity', value: 'technology', label: 'Cybersecurity', search: 'cybersecurity OR security threat' },
  { id: 'fintech', value: 'technology', label: 'Fintech', search: 'fintech OR financial technology' },
  { id: 'business', value: 'business', label: 'Business', search: '' },
  { id: 'health', value: 'health', label: 'Health', search: '' },
  { id: 'science', value: 'science', label: 'Science', search: '' },
  { id: 'sports', value: 'sports', label: 'Sports', search: '' },
  { id: 'entertainment', value: 'entertainment', label: 'Entertainment', search: '' },
  { id: 'general', value: 'general', label: 'General', search: '' },
];



const formDefaults = {
  title: '', summary: '', content: '', image: '',
  source: '', url: '', category: 'Technology', isActive: true,
};

const NewsManager = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(formDefaults);

  // NewsAPI state
  const [apiCategoryId, setApiCategoryId] = useState('technology');
  const [apiQuery, setApiQuery] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [apiFetching, setApiFetching] = useState(false);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiImporting, setApiImporting] = useState(new Set());
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await API.get('/admin/news');
      setNews(res.data);
    } catch {
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/news/${editingId}`, formData);
        toast.success('News updated');
      } else {
        await API.post('/admin/news', formData);
        toast.success('News created');
      }
      setFormOpen(false);
      setEditingId(null);
      setFormData(formDefaults);
      fetchNews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      summary: item.summary,
      content: item.content,
      image: item.image || '',
      source: item.source || '',
      url: item.url || '',
      category: item.category || 'Technology',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await API.delete(`/admin/news/${id}`);
      toast.success('News deleted');
      fetchNews();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const fetchFromAPI = async () => {
    setApiFetching(true);
    setNeedsApiKey(false);
    try {
      const cat = NEWSAPI_CATEGORIES.find((c) => c.id === apiCategoryId);
      const params = new URLSearchParams({
        category: cat?.value || 'technology',
        pageSize: '36',
      });
      if (cat?.search) params.set('q', cat.search);
      if (apiQuery.trim()) {
        const combined = cat?.search ? `(${cat.search}) AND (${apiQuery.trim()})` : apiQuery.trim();
        params.set('q', combined);
      }

      const res = await API.get(`/admin/news/fetch-from-api?${params.toString()}`);
      setApiResults(res.data.articles || []);
      setApiTotal(res.data.totalResults || 0);
    } catch (error) {
      const data = error.response?.data;
      if (data?.needsApiKey) {
        setNeedsApiKey(true);
        setApiResults([]);
        setApiTotal(0);
      } else {
        toast.error(data?.message || 'Failed to fetch from NewsAPI');
      }
    } finally {
      setApiFetching(false);
    }
  };

  const importArticle = async (article) => {
    setApiImporting((prev) => new Set(prev).add(article.title));
    try {
      const cat = NEWSAPI_CATEGORIES.find((c) => c.id === apiCategoryId);
      await API.post(`/admin/news/import-from-api?category=${cat?.label || 'Technology'}`, {
        articles: [article],
      });
      toast.success('Article imported');
      fetchNews();
    } catch {
      toast.error('Failed to import');
    } finally {
      setApiImporting((prev) => {
        const next = new Set(prev);
        next.delete(article.title);
        return next;
      });
    }
  };

  const importAllArticles = async () => {
    const toImport = apiResults.filter((a) => a.title);
    if (toImport.length === 0) {
      toast.error('No articles to import');
      return;
    }
    setApiImporting((prev) => new Set([...prev, ...toImport.map((a) => a.title)]));
    try {
      const cat = NEWSAPI_CATEGORIES.find((c) => c.id === apiCategoryId);
      const res = await API.post(`/admin/news/import-from-api?category=${cat?.label || 'Technology'}`, {
        articles: toImport,
      });
      toast.success(res.data.message || 'Articles imported');
      fetchNews();
    } catch {
      toast.error('Failed to import articles');
    } finally {
      setApiImporting(new Set());
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const openForm = () => {
    setEditingId(null);
    setFormData(formDefaults);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormData(formDefaults);
  };

  const tabs = [
    { id: 'all', label: 'All News', icon: Newspaper },
    { id: 'fetch', label: 'Fetch from API', icon: Download },
    { id: 'add', label: 'Add Manual', icon: Plus },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">News</h1>
          <p className="text-gray-500 mt-1">Manage news articles and fetch from NewsAPI</p>
        </div>
        {activeTab !== 'add' && (
          <Button variant="blue" onClick={openForm} className="flex-shrink-0">
            <Plus size={16} className="mr-2" /> Add Manual
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* === TAB: All News === */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {news.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <Newspaper size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm mb-4">No news articles yet</p>
              <div className="flex justify-center gap-3">
                <Button variant="blue" size="sm" onClick={() => setActiveTab('fetch')}>
                  <Download size={14} className="mr-1.5" /> Fetch from API
                </Button>
                <Button variant="outline" size="sm" onClick={openForm}>
                  <Plus size={14} className="mr-1.5" /> Add Manually
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{news.length} article(s)</p>
              </div>
              {news.map((item) => (
                <Card key={item._id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {item.image && (
                        <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={imageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-medium text-brand-blue bg-brand-blue/5 px-2 py-0.5 rounded-full">
                            {item.category || 'General'}
                          </span>
                          {item.source && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Globe size={10} /> {item.source}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={10} /> {formatDate(item.publishedAt)}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            item.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {item.isActive ? 'Active' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1 mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.summary}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors"
                            title="Open article"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit size={12} className="mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>
                          <Trash2 size={12} className="mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {/* === TAB: Fetch from API === */}
      {activeTab === 'fetch' && (
        <div>
          {/* API Key missing banner */}
          {needsApiKey && (
            <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm mb-1">NewsAPI Key Required</p>
                <p className="text-amber-700 text-xs mb-3">
                  Add your NewsAPI key in{' '}
                  <a href="/admin/settings" className="text-brand-blue font-medium hover:underline">Settings → Integrations</a>
                  {' '}to fetch live news articles.
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <Card className="border border-gray-100 shadow-sm mb-6">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">Category</Label>
                  <select
                    value={apiCategoryId}
                    onChange={(e) => setApiCategoryId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  >
                    {NEWSAPI_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">Search (optional)</Label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={apiQuery}
                      onChange={(e) => setApiQuery(e.target.value)}
                      placeholder="Search articles worldwide..."
                      className="h-10 rounded-xl border-gray-200 pl-9"
                      onKeyDown={(e) => e.key === 'Enter' && fetchFromAPI()}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="blue" onClick={fetchFromAPI} disabled={apiFetching} className="rounded-xl">
                  {apiFetching ? (
                    <><Loader2 size={16} className="mr-1.5 animate-spin" /> Fetching...</>
                  ) : (
                    <><Search size={16} className="mr-1.5" /> Fetch News</>
                  )}
                </Button>
                {apiResults.length > 0 && (
                  <>
                    <span className="text-xs text-gray-400">{apiTotal} results found</span>
                    <button
                      onClick={fetchFromAPI}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {apiFetching ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
              <p className="text-sm text-gray-500">Fetching latest news...</p>
            </div>
          ) : apiResults.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <Newspaper size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm mb-1">No articles found</p>
              <p className="text-xs text-gray-400">Try a different category or search term</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Showing {apiResults.length} of {apiTotal} results
                </p>
                <Button variant="outline" size="sm" onClick={importAllArticles} className="rounded-xl">
                  <Download size={14} className="mr-1.5" /> Import All
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {apiResults.map((article, index) => {
                  const isImporting = apiImporting.has(article.title);
                  const isImported = news.some((n) => n.title === article.title);
                  return (
                    <Card key={article.title + index} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                      <div className="h-40 bg-gray-100 overflow-hidden relative">
                        {article.urlToImage ? (
                          <img
                            src={imageUrl(article.urlToImage)}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper size={32} className="text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          {isImported ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-semibold px-2 py-1 rounded-lg">
                              <CheckCircle size={10} /> Imported
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                          <span>{article.source?.name || 'Unknown'}</span>
                          {article.publishedAt && (
                            <>
                              <span>•</span>
                              <span>{formatDate(article.publishedAt)}</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1.5">
                          {article.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                          {article.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={isImported ? 'outline' : 'blue'}
                            size="sm"
                            onClick={() => importArticle(article)}
                            disabled={isImporting || isImported}
                            className="rounded-lg text-xs"
                          >
                            {isImporting ? (
                              <><Loader2 size={12} className="mr-1 animate-spin" /> Importing</>
                            ) : isImported ? (
                              <><CheckCircle size={12} className="mr-1" /> Imported</>
                            ) : (
                              <><Download size={12} className="mr-1" /> Import</>
                            )}
                          </Button>
                          {article.url && (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* === TAB: Add Manual === */}
      {activeTab === 'add' && (
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Article' : 'Create New Article'}
              </h2>
              {editingId && (
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="summary" className="text-sm font-medium text-gray-700">Summary *</Label>
                <Textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} rows={2} required className="rounded-xl border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">Content *</Label>
                <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={5} required className="rounded-xl border-gray-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="image" className="text-sm font-medium text-gray-700">Image URL</Label>
                  <Input id="image" name="image" placeholder="https://..." value={formData.image} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="source" className="text-sm font-medium text-gray-700">Source</Label>
                  <Input id="source" name="source" placeholder="e.g. TechCrunch" value={formData.source} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url" className="text-sm font-medium text-gray-700">External URL</Label>
                <Input id="url" name="url" placeholder="https://..." value={formData.url} onChange={handleChange} className="h-11 rounded-xl border-gray-200" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                <Label htmlFor="isActive" className="cursor-pointer text-sm text-gray-700">Published / Active</Label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="blue" className="rounded-xl">
                  {editingId ? 'Update Article' : 'Create Article'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm} className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsManager;
