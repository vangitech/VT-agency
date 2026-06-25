import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { imageUrl } from '../../api';

const fallbackNews = [
  {
    title: 'AI-Powered Cybersecurity: The Next Frontier in Threat Detection',
    summary: 'How machine learning is revolutionizing the way organizations detect and respond to cyber threats in real-time.',
    source: 'TechCrunch',
    publishedAt: '2026-06-15',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
  },
  {
    title: 'The Rise of Fintech in Africa: 2026 Market Analysis',
    summary: 'African fintech startups raised over $3B in 2025, with mobile payments and digital banking leading the charge.',
    source: 'Forbes Africa',
    publishedAt: '2026-06-10',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&q=80',
  },
  {
    title: 'Cloud Migration Best Practices for Enterprise Organizations',
    summary: 'A comprehensive guide to migrating legacy systems to the cloud while minimizing downtime and maximizing ROI.',
    source: 'ZDNet',
    publishedAt: '2026-06-05',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  },
];

const NewsFeed = ({ news }) => {
  const items = news?.length > 0 ? news : fallbackNews;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-blue bg-brand-blue/5 px-4 py-1.5 rounded-full mb-4">
            Latest Insights
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-brand-blue">Tech</span>{' '}
            <span className="text-brand-green">News</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Stay updated with the latest trends and developments in technology worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {items.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              {item.image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={imageUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar size={14} className="mr-1.5 flex-shrink-0" />
                  <span>{formatDate(item.publishedAt)}</span>
                  {item.source && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="font-medium">{item.source}</span>
                    </>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {item.summary}
                </p>
                <Link
                  to={`/news/${item._id}`}
                  className="inline-flex items-center gap-1.5 text-brand-blue font-semibold text-sm hover:text-brand-darkBlue transition-colors"
                >
                  Read More <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
