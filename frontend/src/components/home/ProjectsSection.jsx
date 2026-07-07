import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Shield, BarChart3, GraduationCap, HeartHandshake, PenTool } from 'lucide-react';
import { imageUrl } from '../../api';

const categoryConfig = {
  software: { label: 'Software', color: 'bg-blue-100 text-blue-700', icon: Code },
  cybersecurity: { label: 'Cybersecurity', color: 'bg-red-100 text-red-700', icon: Shield },
  fintech: { label: 'Fintech', color: 'bg-green-100 text-green-700', icon: BarChart3 },
  edutech: { label: 'Edutech', color: 'bg-purple-100 text-purple-700', icon: GraduationCap },
  medical: { label: 'Medical', color: 'bg-pink-100 text-pink-700', icon: HeartHandshake },
  consulting: { label: 'Consulting', color: 'bg-orange-100 text-orange-700', icon: PenTool },
};

const fallbackProjects = [
  {
    _id: '1',
    title: 'FinTech Payment Gateway',
    description: 'A secure, scalable payment processing platform handling over 10,000 transactions daily with real-time fraud detection.',
    category: 'fintech',
    technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    // completionDate: '2025-08-01',
  },
  {
    _id: '2',
    title: 'Healthcare Management System',
    description: 'End-to-end patient management platform with EHR integration, telemedicine, and compliance with HIPAA regulations.',
    category: 'medical',
    technologies: ['Next.js', 'Python', 'PostgreSQL', 'Docker'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    // completionDate: '2025-05-01',
  },
  {
    _id: '3',
    title: 'Enterprise Security Suite',
    description: 'Comprehensive cybersecurity solution featuring threat detection, penetration testing, and real-time monitoring dashboards.',
    category: 'cybersecurity',
    technologies: ['Go', 'React', 'Elasticsearch', 'Kubernetes'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
    // completionDate: '2025-03-01',
  },
  {
    _id: '4',
    title: 'Edutech Learning Platform',
    description: 'Interactive online learning platform serving 50,000+ students with live classes, assessments, and AI-powered recommendations.',
    category: 'edutech',
    technologies: ['Vue.js', 'Django', 'Redis', 'GCP'],
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
    // completionDate: '2024-12-01',
  },
  {
    _id: '5',
    title: 'Digital Banking App',
    description: 'Mobile-first banking application with biometric auth, instant transfers, budgeting tools for a leading African bank.',
    category: 'software',
    technologies: ['Flutter', 'Node.js', 'PostgreSQL', 'Firebase'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
    // completionDate: '2024-10-01',
  },
  {
    _id: '6',
    title: 'IT Infrastructure Audit',
    description: 'Comprehensive IT infrastructure audit and modernization roadmap for a multinational corporation across 12 locations.',
    category: 'consulting',
    technologies: ['AWS', 'Terraform', 'Prometheus', 'Grafana'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    // completionDate: '2024-09-01',
  },
];

const ProjectsSection = ({ projects = [] }) => {
  const [failedImages, setFailedImages] = useState(new Set());
  const items = Array.isArray(projects) && projects.length > 0 ? projects : fallbackProjects;
  const displayed = items.slice(0, 6);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-green bg-brand-green/5 px-4 py-1.5 rounded-full mb-4">
            Our Work
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            <span className="text-brand-blue">Featured</span>{' '}
            <span className="text-brand-green">Projects</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
            Innovative solutions we've delivered for our clients across various industries.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {displayed.map((project) => {
            const cat = categoryConfig[project.category];
            return (
              <div
                key={project._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {failedImages.has(project._id) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-green/10">
                      <Code size={40} className="text-gray-300" />
                    </div>
                  ) : (
                    <img
                      src={imageUrl(project.image)}
                      alt={project.title}
                      onError={() => setFailedImages((prev) => new Set(prev).add(project._id))}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cat?.color || 'bg-gray-100 text-gray-700'}`}>
                      {cat?.label || project.category}
                    </span>
                    {project.completionDate && (
                      <span className="text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        {new Date(project.completionDate).getFullYear()}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Code size={16} className="text-brand-blue" />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">{project.description}</p>
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
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-blue to-brand-green text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all"
          >
            View All Projects <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
