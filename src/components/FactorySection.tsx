import React, { useState, useEffect, useRef } from 'react';

interface FactoryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string; // Imgur image URL
}

export const FactorySection: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const factoryImages: FactoryImage[] = [
    {
      id: 1,
      title: "State-of-the-Art Manufacturing",
      description: "Our FDA-registered facility uses cutting-edge technology to ensure every bottle meets pharmaceutical-grade standards.",
      imageUrl: "https://i.imgur.com/ABC123.jpg" // Replace with actual Imgur URL
    },
    {
      id: 2,
      title: "Rigorous Quality Control",
      description: "Every batch undergoes extensive testing for purity, potency, and safety before reaching your doorstep.",
      imageUrl: "https://i.imgur.com/DEF456.jpg" // Replace with actual Imgur URL
    },
    {
      id: 3,
      title: "Premium Ingredient Sourcing",
      description: "We source only the highest-grade natural ingredients from trusted suppliers worldwide.",
      imageUrl: "https://i.imgur.com/GHI789.jpg" // Replace with actual Imgur URL
    }
  ];

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
        setCurrentImage((prev) => (prev + 1) % factoryImages.length);
      } else {
        setCurrentImage((prev) => (prev - 1 + factoryImages.length) % factoryImages.length);
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

  const goToImage = (index: number) => {
    if (isTransitioning || isDragging || index === currentImage) return;
    setIsTransitioning(true);
    setCurrentImage(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Better card styling for mobile
  const getCardStyle = (index: number) => {
    const position = index - currentImage;
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
    } else if (position === 1 || (position === -2 && factoryImages.length === 3)) {
      translateX = 250 + dragInfluence;
      translateZ = -80;
      scale = 0.9;
      opacity = 0.8;
      blur = 0.5;
      rotateY = -10;
    } else if (position === -1 || (position === 2 && factoryImages.length === 3)) {
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
        {/* Factory Images */}
        {factoryImages.map((image, index) => (
          <div
            key={image.id}
            className="absolute inset-0 flex items-center justify-center select-none"
            style={getCardStyle(index)}
          >
            <FactoryImageCard 
              image={image} 
              isActive={index === currentImage}
              isDragging={isDragging}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3">
          {factoryImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              disabled={isTransitioning || isDragging}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed ${
                index === currentImage
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

// Factory Image Card Component
const FactoryImageCard: React.FC<{ 
  image: FactoryImage; 
  isActive: boolean; 
  isDragging: boolean;
}> = ({ 
  image, 
  isActive, 
  isDragging
}) => {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200 hover:bg-white/95 transition-all duration-300 max-w-md w-full mx-4 ${
      isDragging ? 'shadow-2xl' : 'shadow-lg'
    } ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
      
      {/* Image Title */}
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-blue-900 leading-tight text-center">
          {image.title}
        </h3>
      </div>

      {/* Factory Image */}
      <div className="mb-4">
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100 relative">
          <img 
            src={image.imageUrl}
            alt={image.title}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>

      {/* Image Description */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-blue-100">
        <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
          {image.description}
        </p>
      </div>
    </div>
  );
};