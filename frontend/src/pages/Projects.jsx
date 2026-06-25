import { useState, useEffect } from 'react';
import API, { imageUrl } from '../api';
import { Search, Code, FolderOpen } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'software', label: 'Software' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'edutech', label: 'EduTech' },
  { value: 'medical', label: 'Medical' },
  { value: 'consulting', label: 'Consulting' },
];

const categoryConfig = {
  software: { label: 'Software', color: 'bg-blue-100 text-blue-700' },
  cybersecurity: { label: 'Cybersecurity', color: 'bg-red-100 text-red-700' },
  fintech: { label: 'Fintech', color: 'bg-green-100 text-green-700' },
  edutech: { label: 'Edutech', color: 'bg-purple-100 text-purple-700' },
  medical: { label: 'Medical', color: 'bg-pink-100 text-pink-700' },
  consulting: { label: 'Consulting', color: 'bg-orange-100 text-orange-700' },
};

const fallbackProjects = [
  {
    _id: '1',
    title: 'FinTech Payment Gateway',
    description: 'A secure, scalable payment processing platform handling over 10,000 transactions daily with real-time fraud detection.',
    category: 'fintech',
    technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    completionDate: '2025-08-01',
    client: 'FinEdge Solutions',
  },
  {
    _id: '2',
    title: 'Healthcare Management System',
    description: 'End-to-end patient management platform with EHR integration, telemedicine, and compliance with HIPAA regulations.',
    category: 'medical',
    technologies: ['Next.js', 'Python', 'PostgreSQL', 'Docker'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    completionDate: '2025-05-01',
    client: 'MedCore Health',
  },
  {
    _id: '3',
    title: 'Enterprise Security Suite',
    description: 'Comprehensive cybersecurity solution featuring threat detection, penetration testing, and real-time monitoring dashboards.',
    category: 'cybersecurity',
    technologies: ['Go', 'React', 'Elasticsearch', 'Kubernetes'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
    completionDate: '2025-03-01',
    client: 'TechVault Inc.',
  },
  {
    _id: '4',
    title: 'Edutech Learning Platform',
    description: 'Interactive online learning platform serving 50,000+ students with live classes, assessments, and AI-powered recommendations.',
    category: 'edutech',
    technologies: ['Vue.js', 'Django', 'Redis', 'GCP'],
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
    completionDate: '2024-12-01',
    client: 'EduPrime',
  },
  {
    _id: '5',
    title: 'Digital Banking App',
    description: 'Mobile-first banking application with biometric auth, instant transfers, budgeting tools for a leading African bank.',
    category: 'software',
    technologies: ['Flutter', 'Node.js', 'PostgreSQL', 'Firebase'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
    completionDate: '2024-10-01',
    client: 'AfriBank',
  },
  {
    _id: '6',
    title: 'IT Infrastructure Audit',
    description: 'Comprehensive IT infrastructure audit and modernization roadmap for a multinational corporation across 12 locations.',
    category: 'consulting',
    technologies: ['AWS', 'Terraform', 'Prometheus', 'Grafana'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    completionDate: '2024-09-01',
    client: 'CloudBase Systems',
  },
  {
    _id: '7',
    title: 'E-Commerce Platform',
    description: 'Full-featured e-commerce platform with AI-powered recommendations, inventory management, and multi-currency support.',
    category: 'software',
    technologies: ['Next.js', 'Stripe', 'PostgreSQL', 'Redis'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
    completionDate: '2024-07-01',
    client: 'ShopAfrica',
  },
  {
    _id: '8',
    title: 'Cybersecurity Audit & Remediation',
    description: 'End-to-end security audit with vulnerability assessment, penetration testing, and full remediation roadmap.',
    category: 'cybersecurity',
    technologies: ['Nmap', 'Burp Suite', 'Wireshark', 'Metasploit'],
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&q=80',
    completionDate: '2024-06-01',
    client: 'SecureTech',
  },
  {
    _id: '9',
    title: 'Microfinance Banking System',
    description: 'Core banking system for microfinance institutions with loan management, savings, and mobile money integration.',
    category: 'fintech',
    technologies: ['Spring Boot', 'Angular', 'MySQL', 'Docker'],
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
    completionDate: '2024-04-01',
    client: 'Momo Microfinance',
  },
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/public/projects');
        const data = res.data.length > 0 ? res.data : fallbackProjects;
        setProjects(data);
        setFilteredProjects(data);
      } catch {
        setProjects(fallbackProjects);
        setFilteredProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let result = projects;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.client && p.client.toLowerCase().includes(term))
      );
    }
    setFilteredProjects(result);
  }, [searchTerm, activeCategory, projects]);

  return (
    <div className="pt-16 -mt-20 md:pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full mb-4">
            Our Portfolio
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Our Projects
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto text-white/80">
            Explore some of the innovative solutions we've delivered for our clients.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? 'blue' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.value)}
                  className="rounded-lg"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 bg-white"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {project.image && (
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      {failedImages.has(project._id) ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-green/10">
                          <FolderOpen size={40} className="text-gray-300" />
                        </div>
                      ) : (
                        <img
                          src={imageUrl(project.image)}
                          alt={project.title}
                          onError={() => setFailedImages((prev) => new Set(prev).add(project._id))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryConfig[project.category]?.color || 'bg-gray-100 text-gray-700'}`}
                        >
                          {categoryConfig[project.category]?.label || project.category}
                        </span>
                        {project.completionDate && (
                          <span className="text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                            {new Date(project.completionDate).getFullYear()}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Code size={16} className="text-brand-blue" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{project.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">{project.description}</p>
                    {project.client && (
                      <p className="text-xs text-gray-400 mb-3">
                        Client: <span className="font-semibold text-gray-600">{project.client}</span>
                      </p>
                    )}
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="text-xs font-medium text-gray-400 px-2.5 py-1">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;
