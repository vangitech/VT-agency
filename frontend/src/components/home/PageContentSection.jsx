import React from 'react';
import { Shield, Code, TrendingUp, Users, Award, Zap } from 'lucide-react';

const fallbackItems = [
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Every solution we build follows security-first principles, ensuring your data and systems remain protected against evolving threats.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Code,
    title: 'Cutting-Edge Technology',
    description: 'We leverage the latest frameworks, cloud infrastructure, and development practices to deliver scalable, future-ready solutions.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Business-Driven Results',
    description: 'Our solutions are designed to drive measurable outcomes — faster time-to-market, reduced costs, and improved user satisfaction.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Users,
    title: 'Client-First Partnership',
    description: 'We work as an extension of your team, with transparent communication, agile processes, and a shared commitment to your success.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: Award,
    title: 'Proven Expertise',
    description: 'With years of experience across fintech, healthcare, edutech, and enterprise, we bring deep domain knowledge to every project.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Agile Delivery',
    description: 'Our streamlined workflows and iterative approach mean we ship faster without compromising quality — keeping your project on track.',
    color: 'from-cyan-500 to-cyan-600',
  },
];

const fallbackStats = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '30+', label: 'Happy Clients' },
  { value: '6+', label: 'Industries Served' },
  { value: '10+', label: 'Years of Excellence' },
];

const PageContentSection = ({ content }) => {
  const sections = content?.sections || {};
  const items = sections.highlights?.length ? sections.highlights : fallbackItems;
  const stats = sections.stats?.length ? sections.stats : fallbackStats;
  const title = sections.title || 'Why Choose Vangitech';
  const subtitle = sections.subtitle || 'What sets us apart';
  const description = sections.description || 'We combine deep technical expertise with a genuine commitment to your success. Here\'s why businesses trust us with their most important technology initiatives.';

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-blue bg-brand-blue/5 px-4 py-1.5 rounded-full mb-4">
            {subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title.split(' ').map((word, i, arr) => {
              const mid = Math.ceil(arr.length / 2);
              return (
                <span key={i} className={i < mid ? 'text-brand-blue' : 'text-brand-green'}>
                  {word}{i < arr.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-20">
          {items.map((item, index) => {
            const Icon = typeof item.icon === 'string' ? null : item.icon || null;
            const color = item.color || 'from-brand-blue to-brand-green';
            return (
              <div
                key={index}
                className="group relative p-6 lg:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-5 shadow-sm`}>
                  {Icon ? (
                    <Icon className="text-white" size={22} />
                  ) : (
                    <span className="text-white text-lg font-bold">{item.icon}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-green rounded-2xl p-8 lg:p-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageContentSection;
