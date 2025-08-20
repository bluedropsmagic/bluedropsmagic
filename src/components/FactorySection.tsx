import React, { useState, useEffect, useRef } from 'react';
import { Shield, Award, CheckCircle, Play } from 'lucide-react';

interface FactorySlide {
  id: number;
  title: string;
  description: string;
  videoId: string; // VTurb video ID
  badge: string;
}

export const FactorySection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState<{[key: string]: boolean}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const factorySlides: FactorySlide[] = [
    {
      id: 1,
      title: "State-of-the-Art Manufacturing",
      description: "Our FDA-registered facility uses cutting-edge technology to ensure every bottle meets pharmaceutical-grade standards.",
      videoId: "factory_video_1", // Replace with actual VTurb video ID
      badge: "FDA REGISTERED"
    },
    {
      id: 2,
      title: "Rigorous Quality Control",
      description: "Every batch undergoes extensive testing for purity, potency, and safety before reaching your doorstep.",
      videoId: "factory_video_2", // Replace with actual VTurb video ID
      badge: "QUALITY TESTED"
    },
    {
      id: 3,
      title: "Premium Ingredient Sourcing",
      description: "We source only the highest-grade natural ingredients from trusted suppliers worldwide.",
      videoId: "factory_video_3", // Replace with actual VTurb video ID
      badge: "PREMIUM GRADE"
    }
  ];

  // Function to inject VTurb factory videos
  const injectFactoryVideo = (videoId: string) => {
    console.log('🎬 Injecting factory video:', videoId);
    
    // Remove existing script if any
    const existingScript = document.getElementById(`scr_${videoId}`);
    if (existingScript) {
      existingScript.remove();
    }

    // Ensure container exists and is properly isolated BEFORE injecting script
    const targetContainer = document.getElementById(`vid-${videoId}`);
    if (!targetContainer) {
      console.error('❌ Target container not found for factory video:', videoId);
      return;
    }

    // Setup container isolation and positioning
    targetContainer.style.position = 'absolute';
    targetContainer.style.top = '0';
    targetContainer.style.left = '0';
    targetContainer.style.width = '100%';
    targetContainer.style.height = '100%';
    targetContainer.style.zIndex = '20';
    targetContainer.style.overflow = 'hidden';
    targetContainer.style.borderRadius = '0.75rem';
    targetContainer.style.isolation = 'isolate';
    targetContainer.innerHTML = ''; // Clear any existing content
    
    // Add the HTML structure for VTurb
    targetContainer.innerHTML = `
      <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
        <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
        <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
      </div>
      <style>
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
      </style>
    `;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = `scr_${videoId}`;
    script.async = true;
    script.innerHTML = `
      (function() {
        try {
          console.log('🎬 Loading factory video: ${videoId}');
          
          var s = document.createElement("script");
          s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/player.js";
          s.async = true;
          
          s.onload = function() {
            console.log('✅ VTurb factory video loaded: ${videoId}');
            
            // Ensure video elements stay in correct container
            setTimeout(function() {
              // Prevent video from appearing in main video container
              var mainVideoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
              var factoryContainer = document.getElementById('vid-${videoId}');
              
              if (mainVideoContainer && factoryContainer) {
                // Move any factory video elements that ended up in main container
                var orphanedElements = mainVideoContainer.querySelectorAll('[src*="${videoId}"], [data-video-id="${videoId}"], video, iframe');
                orphanedElements.forEach(function(element) {
                  var elementSrc = element.src || element.getAttribute('src') || '';
                  var isFactoryVideo = elementSrc.includes('${videoId}') || 
                                     element.getAttribute('data-video-id') === '${videoId}' ||
                                     element.closest('[id*="${videoId}"]');
                  
                  if (isFactoryVideo && element.parentNode === mainVideoContainer) {
                    factoryContainer.appendChild(element);
                    console.log('🔄 FACTORY VIDEO: Moved factory video element back to correct container');
                  }
                });
                
                // Ensure main video elements stay in main container
                var mainVideoElements = factoryContainer.querySelectorAll('[src*="683ba3d1b87ae17c6e07e7db"], [data-video-id="683ba3d1b87ae17c6e07e7db"]');
                mainVideoElements.forEach(function(element) {
                  if (element.parentNode === factoryContainer) {
                    mainVideoContainer.appendChild(element);
                    console.log('🔄 MAIN VIDEO: Moved main video element back to main container');
                  }
                });
              }
              
            }, 2000);
            window.factoryVideoLoaded_${videoId} = true;
          };
          s.onerror = function() {
            console.error('❌ Failed to load VTurb factory video: ${videoId}');
          };
          document.head.appendChild(s);
        } catch (error) {
          console.error('Error injecting factory video script:', error);
        }
      })();
    `;
    
    document.head.appendChild(script);

    // Check for video load status
    setTimeout(() => {
      if ((window as any)[`factoryVideoLoaded_${videoId}`]) {
        setVideoLoaded(prev => ({ ...prev, [videoId]: true }));
      } else {
        console.log('⚠️ Factory video not loaded yet, will retry...');
        // Retry once if not loaded
        setTimeout(() => injectFactoryVideo(videoId), 2000);
      }
    }, 5000);
  };

  // Inject current factory video when slide changes
  useEffect(() => {
    const currentSlideData = factorySlides[currentSlide];
    if (currentSlideData.videoId) {
      setTimeout(() => {
        injectFactoryVideo(currentSlideData.videoId);
      }, 500);
    }

    // Cleanup function
    return () => {
      factorySlides.forEach((slide) => {
        const scriptToRemove = document.getElementById(`scr_${slide.videoId}`);
        if (scriptToRemove) {
          try {
            scriptToRemove.remove();
          } catch (error) {
            console.error('Error removing factory video script:', error);
          }
        }
      });
    };
  }, [currentSlide]);

  // Improved mobile drag mechanics (same as DoctorsSection)
  const animateDragOffset = (targetOffset: number, duration: number = 200) => {
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

  // Better velocity calculation for mobile
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
        setCurrentSlide((prev) => (prev + 1) % factorySlides.length);
      } else {
        setCurrentSlide((prev) => (prev - 1 + factorySlides.length) % factorySlides.length);
      }
    }
    
    animateDragOffset(0, 150);
    
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

  const goToSlide = (index: number) => {
    if (isTransitioning || isDragging || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Better card styling for mobile
  const getCardStyle = (index: number) => {
    const position = index - currentSlide;
    const dragInfluence = dragOffset * 0.25;
    
    let translateX = 0;
    let translateZ = 0;
    let scale = 1;
    let opacity = 1;
    let blur = 0;
    let rotateY = 0;
    
    if (position === 0) {
      translateX = dragOffset;
      translateZ = 0;
      scale = 1 - Math.abs(dragOffset) * 0.0003;
      opacity = 1 - Math.abs(dragOffset) * 0.001;
      blur = Math.abs(dragOffset) * 0.005;
      rotateY = dragOffset * 0.01;
    } else if (position === 1 || (position === -2 && factorySlides.length === 3)) {
      translateX = 250 + dragInfluence;
      translateZ = -80;
      scale = 0.9;
      opacity = 0.8;
      blur = 0.5;
      rotateY = -10;
    } else if (position === -1 || (position === 2 && factorySlides.length === 3)) {
      translateX = -250 + dragInfluence;
      translateZ = -80;
      scale = 0.9;
      opacity = 0.8;
      blur = 0.5;
      rotateY = 10;
    } else {
      translateX = position > 0 ? 350 : -350;
      translateZ = -150;
      scale = 0.8;
      opacity = 0.5;
      blur = 1;
    }
    
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity: Math.max(0.2, opacity),
      filter: `blur(${blur}px)`,
      zIndex: position === 0 ? 10 : 5 - Math.abs(position),
      transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };
  };

  return (
    <section className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-1500">
      {/* Section Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-2">
          <span className="block">Built for Performance.</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
            Crafted with Precision.
          </span>
        </h2>
        <p className="text-lg sm:text-xl text-blue-700 font-semibold">
          Every bottle is produced under strict quality standards to deliver consistent results you can trust.
        </p>
      </div>

      {/* Drag Instructions */}
      <div className="text-center mb-4">
        <p className="text-sm text-blue-600 font-medium">
          👆 Drag to explore our manufacturing process
        </p>
      </div>

      {/* Slideshow Container */}
      <div 
        ref={containerRef}
        className="relative h-[500px] mb-3"
        style={{ 
          perspective: '1000px',
          touchAction: 'manipulation'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Factory Cards */}
        {factorySlides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 flex items-center justify-center select-none"
            style={getCardStyle(index)}
          >
            <FactoryCard 
              slide={slide} 
              isActive={index === currentSlide}
              isDragging={isDragging}
              videoLoaded={videoLoaded[slide.videoId] || false}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3">
          {factorySlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning || isDragging}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed ${
                index === currentSlide
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

// Factory Card Component with VTurb video
const FactoryCard: React.FC<{ 
  slide: FactorySlide; 
  isActive: boolean; 
  isDragging: boolean;
  videoLoaded: boolean;
}> = ({ 
  slide, 
  isActive, 
  isDragging,
  videoLoaded
}) => {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200 hover:bg-white/95 transition-all duration-300 max-w-md w-full mx-4 ${
      isDragging ? 'shadow-2xl' : 'shadow-lg'
    } ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
      
      {/* Factory Title and Badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-blue-900 leading-tight">
          {slide.title}
        </h3>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Shield className="w-3 h-3" />
          <span className="text-xs font-bold">{slide.badge}</span>
        </div>
      </div>

      {/* VTurb Video container with proper z-index layering */}
      {isActive && (
        <div className="mb-4">
          <div 
            className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative" 
            style={{ 
              isolation: 'isolate',
              contain: 'layout style paint'
            }}
          >
            {/* Container with maximum isolation */}
            <div
              id={`vid-${slide.videoId}`}
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
            
            {/* Placeholder - Show while loading */}
            {!videoLoaded && (
              <div 
                id={`placeholder_${slide.videoId}`}
                className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center"
                style={{ zIndex: 10 }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </div>
                  <p className="text-white/90 text-base font-medium mb-1">
                    Factory Video
                  </p>
                  <p className="text-white/70 text-sm">
                    Loading...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Factory Description */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-blue-100">
        <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Quality Indicators */}
      <div className="flex items-center justify-center gap-2">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Award className="w-3 h-3" />
          <span className="text-xs font-bold">ISO CERTIFIED</span>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
          <CheckCircle className="w-3 h-3" />
          <span className="text-xs font-bold">GMP COMPLIANT</span>
        </div>
      </div>
    </div>
  );
};