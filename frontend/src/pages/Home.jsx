import { useState, useEffect } from 'react';
import API from '../api';
import SEO from '../components/SEO';
import HeroCarousel from '../components/home/HeroCarousel';
import ProjectsSection from '../components/home/ProjectsSection';
import PageContentSection from '../components/home/PageContentSection';
import Testimonials from '../components/home/Testimonials';
import NewsFeed from '../components/home/NewsFeed';
import Clients from '../components/home/Clients';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pageContent, setPageContent] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [news, setNews] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [heroRes, projectsRes, pageContentRes, testimonialRes, newsRes, clientsRes] = await Promise.allSettled([
        API.get('/public/hero'),
        API.get('/public/projects'),
        API.get('/public/page-content/projects'),
        API.get('/public/testimonials'),
        API.get('/public/news'),
        API.get('/public/clients'),
      ]);

      if (heroRes.status === 'fulfilled') setHeroSlides(heroRes.value.data);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data);
      if (pageContentRes.status === 'fulfilled') setPageContent(pageContentRes.value.data);
      if (testimonialRes.status === 'fulfilled') setTestimonials(testimonialRes.value.data);
      if (newsRes.status === 'fulfilled') setNews(newsRes.value.data);
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data);

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Home"
        description="Vangitech delivers custom software development, cybersecurity, compliance audits, and IT consulting. Empowering businesses with innovative technology solutions."
        url="https://vangitech.com/"
      />
      <HeroCarousel slides={heroSlides} />
      <ProjectsSection projects={projects} />
      <Clients clients={clients} />
      <PageContentSection content={pageContent} />
      <Testimonials testimonials={testimonials} />
      <NewsFeed news={news} />
    </>
  );
};

export default Home;