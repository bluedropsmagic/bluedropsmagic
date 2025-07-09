import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Play } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  profileImage: string;
  videoId: string;
  caption: string;
}

export const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [pageType, setPageType] = useState<'main' | 'upsell'>('main');

  // ... [rest of the code remains the same until the JSX] ...

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Better animation for mobile
  const animateDragOffset = (targetOffset: number, duration: number = 150) => {
    const startOffset = dragOffset;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const currentOffset = startOffset + (targetOffset - startOffset) * easeOut;
      setDragOffset(currentOffset);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDragOffset(targetOffset);
        if (targetOffset === 0) {
          setIsTransitioning(false);
        }
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  // Better velocity calculation
  const calculateVelocity = (clientX: number) => {
    const now = performance.now();
    if (lastMoveTime > 0) {
      const timeDiff = now - lastMoveTime;
      const distanceDiff = clientX - lastMoveX;
      if (timeDiff > 0) {
        setVelocity(distanceDiff / timeDiff);
      }
    }
    setLastMoveTime(now);
    setLastMoveX(clientX);
  };

  // Improved drag handlers for mobile
  const handleDragStart = (clientX: number) => {
    if (isTransitioning) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
    setVelocity(0);
    setLastMoveTime(performance.now());
    setLastMoveX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || isTransitioning) return;
    
    const diff = clientX - startX;
    const maxDrag = 120;
    
    let clampedDiff = Math.max(-maxDrag * 1.2, Math.min(maxDrag * 1.2, diff));
    
    setDragOffset(clampedDiff);
    calculateVelocity(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging || isTransitioning) return;
    
    setIsDragging(false);
    setIsTransitioning(true);
    
    const threshold = 40;
    const velocityThreshold = 0.3;
    
    let shouldChange = false;
    let direction = 0;
    
    if (Math.abs(dragOffset) > threshold || Math.abs(velocity) > velocityThreshold) {
      if (dragOffset > 0 || velocity > velocityThreshold) {
        direction = -1;
        shouldChange = true;
      } else if (dragOffset < 0 || velocity < -velocityThreshold) {
        direction = 1;
        shouldChange = true;
      }
    }
    
    if (shouldChange) {
      if (direction > 0) {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      } else {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
    }
    
    animateDragOffset(0, 100);
    
    setVelocity(0);
    setLastMoveTime(0);
    setLastMoveX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && Math.abs(dragOffset) > 10) {
      e.preventDefault();
      handleDragMove(e.touches[0].clientX);
    } else if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleDragEnd();
  };

  // Better global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: true });
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, dragOffset, velocity]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const goToTestimonial = (index: number) => {
    if (isTransitioning || isDragging || index === currentTestimonial) return;
    setIsTransitioning(true);
    setCurrentTestimonial(index);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  // Better card styling for mobile
  const getCardStyle = (index: number) => {
    const position = index - currentTestimonial;
    const dragInfluence = dragOffset * 0.2;
    
    let translateX = 0;
    let scale = 1;
    let opacity = 1;
    let zIndex = 1;
    
    if (position === 0) {
      translateX = dragOffset;
      scale = 1 - Math.abs(dragOffset) * 0.0002;
      opacity = 1 - Math.abs(dragOffset) * 0.001;
      zIndex = 10;
    } else if (position === 1 || (position === -2 && testimonials.length === 3)) {
      translateX = 220 + dragInfluence;
      scale = 0.95;
      opacity = 0.8;
      zIndex = 5;
    } else if (position === -1 || (position === 2 && testimonials.length === 3)) {
      translateX = -220 + dragInfluence;
      scale = 0.95;
      opacity = 0.8;
      zIndex = 5;
    } else {
      translateX = position > 0 ? 300 : -300;
      scale = 0.9;
      opacity = 0.6;
      zIndex = 1;
    }
    
    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity: Math.max(0.3, opacity),
      zIndex,
      transition: isDragging ? 'none' : 'all 0.25s ease-out',
    };
  };

  if (!isVisible) {
    return (
      <section 
        ref={sectionRef}
        className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 h-96"
      />
    );
  }

  return (
    <section className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-1200">
      {/* Section Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-2">
          <span className="block">No Filters.</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
            Just Real Results.
          </span>
        </h2>
        <p className="text-lg sm:text-xl text-blue-700 font-semibold">
          What Real Men Are Saying About BlueDrops
        </p>
      </div>

      {/* Drag Instructions */}
      <div className="text-center mb-4">
        <p className="text-sm text-blue-600 font-medium">
          👆 Drag to navigate between testimonials
        </p>
      </div>

      {/* Slideshow Container - Better mobile support */}
      <div 
        className="relative h-[500px] mb-3"
        style={{ 
          perspective: '800px',
          touchAction: 'manipulation'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-md"
            style={getCardStyle(index)}
          >
            <TestimonialCard
              testimonial={testimonial}
              isActive={index === currentTestimonial}
              isDragging={isDragging}
              pageType={pageType}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => goToTestimonial(index)}
              disabled={isTransitioning || isDragging}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed ${
                index === currentTestimonial
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

// ... [rest of the TestimonialCard component remains the same]