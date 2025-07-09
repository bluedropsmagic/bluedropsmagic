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

  // Rest of the code remains the same...

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
        setCurrentDoctor((prev) => (prev + 1) % doctors.length);
      } else {
        setCurrentDoctor((prev) => (prev - 1 + doctors.length) % doctors.length);
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

      {/* Rest of the JSX remains the same... */}

    </section>
  );
};

// Rest of the components remain the same...