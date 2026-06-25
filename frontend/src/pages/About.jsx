import {
  Shield, Code, Database, Lock, Users,
  Award, Globe, Heart,
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'We prioritize security in every solution we deliver, ensuring your data and systems remain protected.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Code,
      title: 'Innovation',
      description: 'Pushing boundaries with cutting-edge technology to deliver solutions that give you a competitive edge.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Users,
      title: 'Client-Centric',
      description: 'Your success is our success. We work as an extension of your team with transparent communication.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality through rigorous testing, best practices, and continuous improvement.',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const services = [
    {
      icon: Code,
      title: 'Software Development',
      description: 'Custom software solutions tailored to your business needs — from web and mobile apps to enterprise platforms.',
    },
    {
      icon: Shield,
      title: 'Cybersecurity',
      description: 'Comprehensive security solutions including penetration testing, threat monitoring, and incident response.',
    },
    {
      icon: Lock,
      title: 'Compliance Audit',
      description: 'Professional ISO 27001 and PCI DSS compliance audits to ensure your organization meets regulatory standards.',
    },
    {
      icon: Database,
      title: 'IT Consulting',
      description: 'Strategic technology consulting to help you make informed decisions and accelerate business growth.',
    },
    {
      icon: Shield,
      title: 'Infrastructure Support',
      description: 'Reliable hardware and software maintenance services to keep your operations running smoothly.',
    },
    {
      icon: Globe,
      title: 'Fintech & EduTech',
      description: 'Specialized solutions for the finance and education sectors, built with industry-specific compliance in mind.',
    },
  ];

  return (
    <div className="pt-16 -mt-20 md:pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full mb-4">
            Who We Are
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            About Vangitech
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto text-white/80">
            Empowering businesses with innovative technology solutions since 2020.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 lg:py-28 bg-white -mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 text-center hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Heart className="text-brand-blue" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-brand-blue mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To deliver exceptional technology solutions that drive business growth,
                enhance security, and create lasting value for our clients.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 text-center hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Globe className="text-brand-green" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-brand-green mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the leading technology partner for businesses worldwide,
                recognized for innovation, integrity, and impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-blue bg-brand-blue/5 px-4 py-1.5 rounded-full mb-4">
              Our Principles
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-brand-blue">Core</span>{' '}
              <span className="text-brand-green">Values</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 lg:p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                  <value.icon className="text-white" size={26} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-green bg-brand-green/5 px-4 py-1.5 rounded-full mb-4">
              Our Expertise
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-brand-blue">What</span>{' '}
              <span className="text-brand-green">We Do</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Comprehensive technology services designed to meet your business needs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-green rounded-xl flex items-center justify-center mb-5 shadow-sm">
                  <service.icon className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-brand-blue to-brand-green py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-white/80 font-medium">Projects Delivered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1">30+</div>
              <div className="text-sm text-white/80 font-medium">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1">6+</div>
              <div className="text-sm text-white/80 font-medium">Industries Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1">4+</div>
              <div className="text-sm text-white/80 font-medium">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
