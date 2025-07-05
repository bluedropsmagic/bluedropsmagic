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

  // ✅ UPDATED: ALL testimonials now have real VTurb video IDs and profile images
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Michael R.",
      location: "Texas",
      profileImage: "https://i.imgur.com/IYyJR1B.png",
      videoId: "68677fbfd890d9c12c549f94", // REAL VTurb video ID
      caption: "BlueDrops completely changed my life. I felt the difference in just 2 weeks!"
    },
    {
      id: 2,
      name: "Robert S.",
      location: "California",
      profileImage: "https://i.imgur.com/d1raEIm.png",
      videoId: "6867816a78c1d68a675981f1", // REAL VTurb video ID
      caption: "After 50, I thought there was no hope. BlueDrops proved me wrong!"
    },
    {
      id: 3,
      name: "John O.",
      location: "Florida",
      profileImage: "https://i.imgur.com/UJ0L2tZ.png",
      videoId: "68678320c5ab1e6abe6e5b6f", // REAL VTurb video ID
      caption: "My wife noticed the difference before I even told her about BlueDrops!"
    }
  ];

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
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
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Carregando depoimentos...</p>
          </div>
        </div>
      </section>
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
        {/* Testimonial Cards */}
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="absolute inset-0 flex items-center justify-center select-none"
            style={getCardStyle(index)}
          >
            <TestimonialCard 
              testimonial={testimonial} 
              isActive={index === currentTestimonial}
              isDragging={isDragging}
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

// ✅ COMPLETELY REIMPLEMENTED: TestimonialCard with EXACT SAME structure as DoctorsSection
const TestimonialCard: React.FC<{ 
  testimonial: any; 
  isActive: boolean; 
  isDragging: boolean;
}> = ({ 
  testimonial, 
  isActive, 
  isDragging 
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  // ✅ FIXED: Use EXACT SAME injection method as DoctorsSection
  useEffect(() => {
    if (isActive) {
      console.log('🎬 Injecting TESTIMONIAL VTurb for:', testimonial.name, 'VideoID:', testimonial.videoId);
      
      const injectTestimonialVideo = () => {
        // ✅ CRITICAL: Wait for main video to be fully loaded first
        if (!window.vslVideoLoaded) {
          console.log('⏳ Waiting for main video to load before injecting testimonial video');
          setTimeout(injectTestimonialVideo, 2000);
          return;
        }

        // Remove any existing script first
        const existingScript = document.getElementById(`scr_testimonial_${testimonial.videoId}`);
        if (existingScript) {
          try {
            existingScript.remove();
          } catch (error) {
            console.error('Error removing existing testimonial script:', error);
          }
        }

        // ✅ CRITICAL: Ensure container exists and is properly isolated BEFORE injecting script
        const targetContainer = document.getElementById(`vid-${testimonial.videoId}`);
        if (!targetContainer) {
          console.error('❌ Target container not found for video:', testimonial.videoId);
          return;
        }

        // ✅ Setup container isolation and positioning - EXACT SAME as DoctorsSection
        targetContainer.style.position = 'absolute';
        targetContainer.style.top = '0';
        targetContainer.style.left = '0';
        targetContainer.style.width = '100%';
        targetContainer.style.height = '100%';
        targetContainer.style.zIndex = '20';
        targetContainer.style.overflow = 'hidden';
        targetContainer.style.borderRadius = '0.75rem';
        targetContainer.style.isolation = 'isolate';
        targetContainer.innerHTML = ''; // ✅ Clear any existing content

        // ✅ EXACT SAME HTML structure as DoctorsSection
        targetContainer.innerHTML = `
          <div id="vid_${testimonial.videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
            <img id="thumb_${testimonial.videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${testimonial.videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
            <div id="backdrop_${testimonial.videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
          </div>
          <style>
            .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
          </style>
        `;

        // ✅ EXACT SAME script injection as DoctorsSection
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = `scr_testimonial_${testimonial.videoId}`;
        script.async = true;
        script.defer = true;
        
        // ✅ EXACT SAME script content as DoctorsSection
        script.innerHTML = `
          (function() {
            try {
              console.log('🎬 Loading testimonial video: ${testimonial.videoId}');
              
              var s = document.createElement("script");
              s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${testimonial.videoId}/player.js";
              s.async = true;
              
              s.onload = function() {
                console.log('✅ VTurb testimonial video loaded: ${testimonial.videoId}');
                
                // ✅ FIXED: Ensure video elements stay in correct container
                setTimeout(function() {
                  // ✅ CRITICAL: Prevent video from appearing in main video container
                  var mainVideoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                  var testimonialContainer = document.getElementById('vid-${testimonial.videoId}');
                  
                  if (mainVideoContainer && testimonialContainer) {
                    // ✅ Move any testimonial video elements that ended up in main container
                    var orphanedElements = mainVideoContainer.querySelectorAll('[src*="${testimonial.videoId}"], [data-video-id="${testimonial.videoId}"]');
                    orphanedElements.forEach(function(element) {
                      if (element.parentNode === mainVideoContainer) {
                        testimonialContainer.appendChild(element);
                        console.log('🔄 Moved testimonial video element back to correct container');
                      }
                    });
                  }
                  
                }, 2000);
                window.testimonialVideoLoaded_${testimonial.videoId} = true;
              };
              s.onerror = function() {
                console.error('❌ Failed to load VTurb testimonial video: ${testimonial.videoId}');
              };
              document.head.appendChild(s);
            } catch (error) {
              console.error('Error injecting testimonial video script:', error);
            }
          })();
        `;
        
        document.head.appendChild(script);
        console.log('✅ Testimonial VTurb script injected for:', testimonial.name);

        // Check for video load status
        setTimeout(() => {
          if ((window as any)[`testimonialVideoLoaded_${testimonial.videoId}`]) {
            setVideoLoaded(true);
            console.log('✅ Testimonial video loaded for:', testimonial.name);
          } else {
            console.log('⚠️ Testimonial video not loaded yet, will retry...');
            // Retry once if not loaded
            setTimeout(() => injectTestimonialVideo(), 2000);
          }
        }, 5000);
      };
      
      // Try to inject immediately
      injectTestimonialVideo();
    }

    // Cleanup when card becomes inactive
    return () => {
      if (!isActive) {
        // Clean up scripts when switching testimonials
        const script = document.getElementById(`scr_testimonial_${testimonial.videoId}`);
        if (script) {
          try {
            script.remove();
            console.log('🧹 Cleaned up testimonial script for:', testimonial.name);
          } catch (error) {
            console.error('Error removing testimonial script:', error);
          }
        }
        
        setVideoLoaded(false);
      }
    };
  }, [isActive, testimonial.videoId, testimonial.name]);

  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200 hover:bg-white/95 transition-all duration-300 max-w-md w-full mx-4 ${
      isDragging ? 'shadow-2xl' : 'shadow-lg'
    } ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
      
      {/* Customer Info - Photo + Name Side by Side */}
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={testimonial.profileImage}
          alt={testimonial.name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-300 flex-shrink-0 shadow-lg"
          draggable={false}
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-blue-900 leading-tight mb-1">
            {testimonial.name}
          </h3>
          <p className="text-sm sm:text-base text-blue-700 font-medium leading-tight mb-2">
            {testimonial.location}
          </p>
          <div className="inline-flex">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs font-bold">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Testimonial Quote */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-blue-100">
        <p className="text-sm sm:text-base text-blue-800 leading-relaxed italic">
          "{testimonial.caption}"
        </p>
      </div>

      {/* ✅ EXACT SAME video container structure as DoctorsSection */}
      {isActive && (
        <div className="mb-4">
          <div 
            className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative" 
            style={{ 
              isolation: 'isolate',
              contain: 'layout style paint'
            }}
          >
            {/* ✅ Container with maximum isolation - EXACT SAME as DoctorsSection */}
            <div
              id={`vid-${testimonial.videoId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 20,
                overflow: 'hidden',
                borderRadius: '0.75rem',
                isolation: 'isolate',
                contain: 'layout style paint size'
              }}
            ></div>
            
            {/* ✅ Placeholder - Only show while loading */}
            {!videoLoaded && (
              <div 
                id={`placeholder_${testimonial.videoId}`}
                className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center"
                style={{ zIndex: 10 }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </div>
                  <p className="text-white/90 text-base font-medium mb-1">
                    {testimonial.name}
                  </p>
                  <p className="text-white/70 text-sm">
                    Customer Story
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
        <span className="ml-1 text-gray-600 text-sm font-medium">5.0</span>
      </div>
    </div>
  );
};