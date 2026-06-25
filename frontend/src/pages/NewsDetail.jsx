import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Newspaper, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import API from '../api';

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await API.get(`/public/news/${id}`);
        setArticle(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={32} className="animate-spin text-brand-blue" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Button>
          </Link>
          <div className="max-w-3xl mx-auto mt-12 text-center py-20">
            <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h1>
            <p className="text-gray-500 mb-6">{error || 'The article you are looking for does not exist.'}</p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft size={16} className="mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" /> Back to News
          </Button>
        </Link>

        <article className="max-w-3xl mx-auto mt-8">
          {article.image && (
            <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
            {article.category && (
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-blue bg-brand-blue/5 px-3 py-1 rounded-full">
                {article.category}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(article.publishedAt)}
            </span>
            {article.source && (
              <span className="text-gray-400">| {article.source}</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-brand-blue/30 pl-4 italic">
              {article.summary}
            </p>
          )}

          <div className="prose prose-gray max-w-none">
            {article.content ? (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            ) : (
              <p className="text-gray-400 italic">No additional content available for this article.</p>
            )}
          </div>

          {article.url && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Source article:</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-blue hover:text-brand-darkBlue font-medium text-sm transition-colors"
              >
                View original article <ExternalLink size={14} />
              </a>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;
