import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { imageUrl } from '../../api';

const FALLBACK_GRADIENTS = [
  'from-brand-darkBlue via-brand-blue to-brand-green',
  'from-brand-darkBlue via-brand-green to-brand-blue',
  'from-brand-blue via-brand-darkBlue to-brand-green',
];

const HeroCarousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

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
    if (!Array.isArray(slides) || slides.length === 0) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, slides]);

  if (!Array.isArray(slides) || slides.length === 0) {
    return (
      <div className="min-h-[90vh] md:min-h-[95vh] bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green flex items-center justify-center">
        <div className="text-center text-white px-4">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <span className="text-white font-bold text-2xl tracking-tight">VT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4">Vangitech</h1>
          <p className="text-base sm:text-xl md:text-2xl text-brand-lightGreen">Innovating the Future</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentIndex];
  const imageFailed = failedImages.has(currentIndex);
  const gradientIndex = currentIndex % FALLBACK_GRADIENTS.length;

  return (
    <div className="relative w-full h-[90vh] md:h-[95vh] min-h-[600px] lg:min-h-[700px] overflow-hidden">
      {imageFailed ? (
        <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[gradientIndex]}`} />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[12000ms] ease-out scale-105 hover:scale-100"
          style={{ backgroundImage: `url(${imageUrl(slide.image)})` }}
        />
      )}
      {/* Preload image to detect failure */}
      {slide.image && !imageFailed && (
        <img
          src={imageUrl(slide.image)}
          alt=""
          className="hidden"
          onError={() => setFailedImages((prev) => new Set(prev).add(currentIndex))}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/40" />

      <div className="relative h-full flex items-center justify-center px-4">
        <div className="text-center text-white max-w-4xl mx-auto">
          <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 animate-fade-in leading-tight">
            {slide.title}
          </div>
          <div className="text-base sm:text-xl md:text-2xl lg:text-3xl text-brand-lightGreen mb-3 sm:mb-4 font-semibold">
            {slide.subtitle}
          </div>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            {slide.description}
          </div>
          {slide.ctaText && (
            <Button
              variant="green"
              size="lg"
              className="text-white bg-brand-green hover:bg-brand-darkGreen shadow-lg shadow-brand-green/25 px-8 py-3 sm:px-10 sm:py-4 text-sm sm:text-base"
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
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
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
