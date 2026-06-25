import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { imageUrl } from '../../api';

const HeroCarousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length);
  }, [currentIndex, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
  }, [currentIndex, slides.length, goToSlide]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green flex items-center justify-center">
        <div className="text-center text-white px-4">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <span className="text-white font-bold text-2xl tracking-tight">VT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4">Vangitech</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-brand-lightGreen">Innovating the Future</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentIndex];

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out hero-slide-enter"
        style={{ backgroundImage: `url(${imageUrl(slide.image)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      <div className="relative h-full flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl">
          <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in leading-tight">
            {slide.title}
          </div>
          <div className="text-base sm:text-xl md:text-2xl text-brand-lightGreen mb-3 font-semibold">
            {slide.subtitle}
          </div>
          <div className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            {slide.description}
          </div>
          {slide.ctaText && (
            <Button
              variant="green"
              size="lg"
              className="text-white bg-brand-green hover:bg-brand-darkGreen shadow-lg shadow-brand-green/25"
              onClick={() => window.location.href = slide.ctaLink || '#'}
            >
              {slide.ctaText}
            </Button>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 h-2.5 bg-brand-green'
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
