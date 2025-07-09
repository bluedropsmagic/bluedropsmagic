import React, { useEffect, useState, useRef } from 'react';
import { Shield, Play } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  affiliation: string;
  testimonial: string;
  profileImage: string;
  videoId: string; // VTurb video ID for testimonial
}

export const DoctorsSection: React.FC = () => {
  const [currentDoctor, setCurrentDoctor] = useState(0);
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

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Mehmet Oz",
      specialty: "Cardiothoracic Surgeon, MD",
      affiliation: "Columbia University",
      testimonial: "BlueDrops represents a breakthrough in natural men's health. Simple ingredients, impressive results.",
      profileImage: "https://i.imgur.com/oM0Uyij.jpeg",
      videoId: "686778a578c1d68a67597d8c" // ✅ Dr. Oz VTurb video ID
    },
    {
      id: 2,
      name: "Dr. Steven Gundry",
      specialty: "Former Cardiac Surgeon, MD",
      affiliation: "Center for Restorative Medicine",
      testimonial: "Natural compounds like those in BlueDrops restore balance from within — exactly my philosophy.",
      profileImage: "https://i.imgur.com/z8WR0yL.jpeg",
      videoId: "68677941d890d9c12c549bbc" // REAL VTurb video ID - Dr. Gundry
    },
    {
      id: 3,
      name: "Dr. Rena Malik",
      specialty: "Urologist, MD",
      affiliation: "University of Maryland",
      testimonial: "BlueDrops offers men a promising natural alternative that supports both confidence and wellness.",
      profileImage: "https://i.imgur.com/iNaQpa5.jpeg",
      videoId: "68677d0e96c6c01dd66478a3" // REAL VTurb video ID - Dr. Rena Malik
    }
  ];

  // ✅ UPDATED: Function to inject VTurb doctor testimonial videos with HTML structure
  const injectDoctorVideo = (videoId: string) => {
    console.log('🎬 Injecting doctor video:', videoId);
    
    // Remove existing script if any
    const existingScript = document.getElementById(`scr_${videoId}`);
    if (existingScript) {
      existingScript.remove();
    }

    // ✅ CRITICAL: Wait for main video to be fully loaded first
    if (!window.vslVideoLoaded) {
      console.log('⏳ Waiting for main video to load before injecting doctor video');
      return;
    }

    // ✅ CRITICAL: Ensure container exists and is properly isolated BEFORE injecting script
    const targetContainer = document.getElementById(`vid-${videoId}`);
    if (!targetContainer) {
      console.error('❌ Target container not found for video:', videoId);
      return;
    }

    // ✅ Setup container isolation and positioning
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
    
    // ✅ NEW: Add the HTML structure that you provided for Dr. Oz
    if (videoId === "686778a578c1d68a67597d8c") {
      targetContainer.innerHTML = `
        <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
          <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
          <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
        </div>
        <style>
          .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
        </style>
      `;
    } else if (videoId === "68677941d890d9c12c549bbc") {
      // ✅ Dr. Gundry - Same HTML structure
      targetContainer.innerHTML = `
        <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
          <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
          <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
        </div>
        <style>
          .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
        </style>
      `;
    } else if (videoId === "68677d0e96c6c01dd66478a3") {
      // ✅ Dr. Rena Malik - Same HTML structure
      targetContainer.innerHTML = `
        <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
          <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
          <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
        </div>
        <style>
          .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
        </style>
      `;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = `scr_${videoId}`;
    script.async = true;
    script.innerHTML = `
      (function() {
        try {
          console.log('🎬 Loading doctor video: ${videoId}');
          
          var s = document.createElement("script");
          // ✅ UPDATED: Use the correct VTurb script URL for each doctor
          if ('${videoId}' === '686778a578c1d68a67597d8c' || '${videoId}' === '68677941d890d9c12c549bbc' || '${videoId}' === '68677d0e96c6c01dd66478a3') {
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/player.js";
          } else {
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/v4/player.js";
          }
          s.async = true;
          
          s.onload = function() {
            console.log('✅ VTurb doctor video loaded: ${videoId}');
            
            // ✅ FIXED: Ensure video elements stay in correct container
            setTimeout(function() {
              // ✅ CRITICAL: Prevent video from appearing in main video container
              var mainVideoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
              var doctorContainer = document.getElementById('vid-${videoId}');
              
              if (mainVideoContainer && doctorContainer) {
                // ✅ Move any doctor video elements that ended up in main container
                var orphanedElements = mainVideoContainer.querySelectorAll('[src*="${videoId}"], [data-video-id="${videoId}"]');
                orphanedElements.forEach(function(element) {
                  if (element.parentNode === mainVideoContainer) {
                    doctorContainer.appendChild(element);
                    console.log('🔄 Moved doctor video element back to correct container');
                  }
                });
              }
              
            }, 2000);
            window.doctorVideoLoaded_${videoId} = true;
          };
          s.onerror = function() {
            console.error('❌ Failed to load VTurb doctor video: ${videoId}');
          };
          document.head.appendChild(s);
        } catch (error) {
          console.error('Error injecting doctor video script:', error);
        }
      })();
    `;
    
    document.head.appendChild(script);

    // Check for video load status
    setTimeout(() => {
      if ((window as any)[`doctorVideoLoaded_${videoId}`]) {
        setVideoLoaded(prev => ({ ...prev, [videoId]: true }));
      } else {
        console.log('⚠️ Doctor video not loaded yet, will retry...');
        // Retry once if not loaded
        setTimeout(() => injectDoctorVideo(videoId), 2000);
      }
    }, 5000);
  };

  // Inject current doctor video when doctor changes
  useEffect(() => {
    const currentDoctorData = doctors[currentDoctor];
    if (currentDoctorData.videoId && window.vslVideoLoaded) {
      setTimeout(() => {
        injectDoctorVideo(currentDoctorData.videoId);
      }, 500);
    } else if (currentDoctorData.videoId) {
      console.log('⏳ Main video not ready, delaying doctor video injection');
      
      // ✅ FIXED: Set up a retry mechanism
      const checkInterval = setInterval(() => {
        if (window.vslVideoLoaded) {
          clearInterval(checkInterval);
          injectDoctorVideo(currentDoctorData.videoId);
        }
      }, 2000);
      
      // Clear interval after 30 seconds to prevent memory leaks
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 30000);
      
      return () => {
        clearInterval(checkInterval);
      };
    }

    // Cleanup function
    return () => {
      doctors.forEach((doctor) => {
        // ✅ FIXED: Proper cleanup
        const scriptToRemove = document.getElementById(`scr_${doctor.videoId}`);
        if (scriptToRemove) {
          try {
            scriptToRemove.remove();
          } catch (error) {
            console.error('Error removing doctor video script:', error);
          }
        }
      });
    };
  }, [currentDoctor]);

  // Improved mobile drag mechanics
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
    const maxDrag = 120; // Increased for better detection
    
    let clampedDiff = Math.max(-maxDrag * 1.2, Math.min(maxDrag * 1.2, diff));
    
    setDragOffset(clampedDiff);
    calculateVelocity(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging || isTransitioning) return;
    
    setIsDragging(false);
    setIsTransitioning(true);
    
    const threshold = 40; // Increased threshold
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
        setCurrentDoctor((prev) => (prev + 1) % doctors.length);
      } else {
        setCurrentDoctor((prev) => (prev - 1 + doctors.length) % doctors.length);
      }
    }
    
    animateDragOffset(0, 150);
    
    setVelocity(0);
    setLastMoveTime(0);
    setLastMoveX(0);
  };

  // ✅ FIXED: Don't prevent default immediately
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  // ✅ FIXED: Don't prevent default on touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  // ✅ FIXED: Only prevent default when actually dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && Math.abs(dragOffset) > 10) {
      e.preventDefault();
      handleDragMove(e.touches[0].clientX);
    } else if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  // ✅ FIXED: Don't prevent default on touch end
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

  const goToDoctor = (index: number) => {
    if (isTransitioning || isDragging || index === currentDoctor) return;
    setIsTransitioning(true);
    setCurrentDoctor(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Better card styling for mobile
  const getCardStyle = (index: number) => {
    const position = index - currentDoctor;
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
    } else if (position === 1 || (position === -2 && doctors.length === 3)) {
      translateX = 250 + dragInfluence; // Reduced distance for mobile
      translateZ = -80;
      scale = 0.9; // Larger scale for mobile
      opacity = 0.8; // Higher opacity
      blur = 0.5; // Less blur
      rotateY = -10; // Less rotation
    } else if (position === -1 || (position === 2 && doctors.length === 3)) {
      translateX = -250 + dragInfluence; // Reduced distance for mobile
      translateZ = -80;
      scale = 0.9; // Larger scale for mobile
      opacity = 0.8; // Higher opacity
      blur = 0.5; // Less blur
      rotateY = 10; // Less rotation
    } else {
      translateX = position > 0 ? 350 : -350; // Reduced distance
      translateZ = -150;
      scale = 0.8;
      opacity = 0.5; // Higher opacity for visibility
      blur = 1;
    }
    
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity: Math.max(0.2, opacity), // Higher minimum opacity
      filter: `blur(${blur}px)`,
      zIndex: position === 0 ? 10 : 5 - Math.abs(position),
      transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };
  };

  return (
    <section className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-1400">
      {/* Section Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-2">
          <span className="block">Clinically Reviewed.</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
            Doctor Approved.
          </span>
        </h2>
        <p className="text-lg sm:text-xl text-blue-700 font-semibold">
          What Doctors Say About BlueDrops
        </p>
      </div>

      {/* Drag Instructions */}
      <div className="text-center mb-4">
        <p className="text-sm text-blue-600 font-medium">
          👆 Drag to navigate between doctors
        </p>
      </div>

      {/* Slideshow Container - Better mobile support */}
      <div 
        ref={containerRef}
        className="relative h-[500px] mb-3"
        style={{ 
          perspective: '1000px',
          touchAction: 'manipulation' // ✅ FIXED: Better touch action
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Doctor Cards */}
        {doctors.map((doctor, index) => (
          <div
            key={doctor.id}
            className="absolute inset-0 flex items-center justify-center select-none"
            style={getCardStyle(index)}
          >
            <DoctorCard 
              doctor={doctor} 
              isActive={index === currentDoctor}
              isDragging={isDragging}
              videoLoaded={videoLoaded[doctor.videoId] || false}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3">
          {doctors.map((doctor, index) => (
            <button
              key={doctor.id}
              onClick={() => goToDoctor(index)}
              disabled={isTransitioning || isDragging}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed ${
                index === currentDoctor
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="text-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-blue-200 inline-block">
          <p className="text-sm text-blue-700 font-medium mb-1">
            🏥 <strong>Medical Advisory Board</strong>
          </p>
          <p className="text-xs text-blue-600">
            Reviewed and approved by licensed medical professionals
          </p>
        </div>
      </div>
    </section>
  );
};

// ✅ FIXED: Doctor Card Component with proper video isolation
const DoctorCard: React.FC<{ 
  doctor: any; 
  isActive: boolean; 
  isDragging: boolean;
  videoLoaded: boolean;
}> = ({ 
  doctor, 
  isActive, 
  isDragging,
  videoLoaded
}) => {
  // ✅ Check which doctors have real VTurb video IDs
  const hasRealVideo = doctor.videoId === "686778a578c1d68a67597d8c" || 
                       doctor.videoId === "68677941d890d9c12c549bbc" || 
                       doctor.videoId === "68677d0e96c6c01dd66478a3";

  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200 hover:bg-white/95 transition-all duration-300 max-w-md w-full mx-4 ${
      isDragging ? 'shadow-2xl' : 'shadow-lg'
    } ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
      
      {/* Doctor Info - Photo + Name Side by Side */}
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={doctor.profileImage}
          alt={doctor.name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-300 flex-shrink-0 shadow-lg"
          draggable={false}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-blue-900 leading-tight mb-1">
            {doctor.name}
          </h3>
          <p className="text-sm sm:text-base text-blue-700 font-medium leading-tight mb-1">
            {doctor.specialty}
          </p>
          <p className="text-xs sm:text-sm text-blue-600 leading-tight mb-2">
            {doctor.affiliation}
          </p>
          <div className="inline-flex">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Shield className="w-3 h-3" />
              <span className="text-xs font-bold">MD VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Testimonial Quote */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-blue-100">
        <p className="text-sm sm:text-base text-blue-800 leading-relaxed italic">
          "{doctor.testimonial}"
        </p>
      </div>

      {/* ✅ Video container with proper z-index layering */}
      {isActive && (
        <div className="mb-4">
          <div 
            className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative" 
            style={{ 
              isolation: 'isolate',
              contain: 'layout style paint'
            }}
          >
            {/* ✅ Container with maximum isolation */}
            <div
              id={`vid-${doctor.videoId}`}
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
            
            {/* ✅ Placeholder - Only show for non-Dr. Oz videos */}
            {!hasRealVideo && (
            <div 
              id={`placeholder_${doctor.videoId}`}
              className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center"
              style={{ zIndex: 10 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
                <p className="text-white/90 text-base font-medium mb-1">
                  {doctor.name}
                </p>
                <p className="text-white/70 text-sm">
                  {hasRealVideo ? 'Loading video...' : 'Video Testimonial'}
                </p>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};