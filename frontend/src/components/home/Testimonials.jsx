import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { imageUrl } from '../../api';

const mockTestimonials = [
  {
    name: 'Sarah Mitchell',
    position: 'CEO',
    company: 'TechVault Inc.',
    content: 'Vangitech transformed our digital infrastructure completely. Their cybersecurity expertise is second to none. We\'ve seen a 60% improvement in our security posture since partnering with them.',
    rating: 5,
    avatar: '',
  },
  {
    name: 'David Okonkwo',
    position: 'CTO',
    company: 'FinEdge Solutions',
    content: 'The fintech platform Vangitech built for us exceeded every expectation. Scalable, secure, and beautifully designed. Our transaction processing speed increased by 3x.',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Emily Chen',
    position: 'Director of Operations',
    company: 'MedCore Health',
    content: 'Working with Vangitech was a game-changer for our healthcare platform. They understood our compliance requirements intuitively and delivered ahead of schedule.',
    rating: 5,
    avatar: '',
  },
  {
    name: 'James Adeyemi',
    position: 'Founder',
    company: 'EduPrime',
    content: 'From concept to launch, Vangitech was with us every step of the way. Our edutech platform now serves over 50,000 students across Africa. Truly transformative.',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Maria Gonzalez',
    position: 'VP of Engineering',
    company: 'CloudBase Systems',
    content: 'Vangitech\'s consulting helped us modernize our legacy systems without disrupting operations. Their team is professional, responsive, and genuinely cares about results.',
    rating: 4,
    avatar: '',
  },
  {
    name: 'Thomas Kariuki',
    position: 'Managing Director',
    company: 'AfriTech Ventures',
    content: 'We\'ve worked with several tech partners over the years, but Vangitech stands out. They deliver quality, respect deadlines, and their post-launch support is exceptional.',
    rating: 5,
    avatar: '',
  },
];

const Testimonials = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const items = testimonials?.length > 0 ? testimonials : mockTestimonials;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, items.length - visibleCount);
  const currentSlides = items.slice(currentIndex, currentIndex + visibleCount);

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-green bg-brand-green/5 px-4 py-1.5 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-brand-blue">What Our</span>{' '}
            <span className="text-brand-green">Clients Say</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Real feedback from real clients who have trusted us with their technology needs.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {currentSlides.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6 lg:p-8">
                  <Quote className="text-brand-blue/15 w-8 h-8 sm:w-10 sm:h-10 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {testimonial.avatar ? (
                      <img
                        src={imageUrl(testimonial.avatar)}
                        alt={testimonial.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{testimonial.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {testimonial.position}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length > visibleCount && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-brand-blue hover:bg-brand-blue/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <span className="text-sm text-gray-400 font-medium">
                {currentIndex + 1}-{Math.min(currentIndex + visibleCount, items.length)} of {items.length}
              </span>
              <button
                onClick={next}
                disabled={currentIndex >= maxIndex}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-brand-blue hover:bg-brand-blue/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
