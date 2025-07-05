import React, { useState, useEffect, useRef } from 'react';
import { CNNModal } from './news/cnn/CNNModal';
import { WebMDModal } from './news/webmd/WebMDModal';
import { MayoModal } from './news/mayo/MayoModal';

interface NewsArticle {
  id: string;
  source: string;
  logo: string;
  title: string;
  summary: string;
  buttonText: string;
  url: string;
  color: string;
}

export const NewsSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [currentNews, setCurrentNews] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // ✅ UPDATED: Logos trocadas e nomes removidos dos boxes
  const newsArticles: NewsArticle[] = [
    {
      id: 'cnn',
      source: '', // ✅ REMOVED: Nome removido
      logo: 'https://i.imgur.com/0twf89j.png',
      title: 'A Surprising Natural Solution to Men\'s Performance Issues',
      summary: 'CNN reveals the growing demand for natural solutions among men over 40. Products like BlueDrops are gaining ground as alternatives to traditional treatments.',
      buttonText: 'Read Full Article',
      url: 'https://edition.cnn.com/2025/06/15/health/natural-solutions-men-performance-bluedrops/index.html',
      color: 'border-red-200 bg-red-50'
    },
    {
      id: 'mayo',
      source: '', // ✅ REMOVED: Nome removido
      logo: 'https://i.imgur.com/ClqsijC.png', // ✅ UPDATED: Nova logo da Mayo Clinic conforme solicitado
      title: 'The Science Behind Herbal Support for Men\'s Vitality',
      summary: 'Mayo Clinic explores the benefits and limitations of natural approaches, suggesting products like BlueDrops may complement traditional treatment.',
      buttonText: 'Read Full Article',
      url: 'https://www.mayoclinic.org/diseases-conditions/erectile-dysfunction/in-depth/herbal-support-mens-vitality/art-20048047',
      color: 'border-blue-200 bg-blue-50'
    },
    {
      id: 'webmd',
      source: '', // ✅ REMOVED: Nome removido
      logo: 'https://i.imgur.com/hEggmdK.png', // ✅ UPDATED: Nova logo do WebMD
      title: 'Natural Male Enhancers Gaining Ground in 2025',
      summary: 'WebMD highlights studies on the use of simple ingredients to improve male sexual health and performance naturally.',
      buttonText: 'Read Full Article',
      url: 'https://www.webmd.com/men/features/natural-male-enhancers-2025-bluedrops',
      color: 'border-blue-200 bg-blue-50'
    }
  ];

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
        setCurrentNews((prev) => (prev + 1) % newsArticles.length);
      } else {
        setCurrentNews((prev) => (prev - 1 + newsArticles.length) % newsArticles.length);
      }
    }
    
    animateDragOffset(0, 100);
    
    setVelocity(0);
    setLastMoveTime(0);
    setLastMoveX(0);
  };

  // ✅ FIXED: Only prevent default for actual drags, not clicks
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't prevent default immediately - let clicks work
    handleDragStart(e.clientX);
  };

  // ✅ FIXED: Don't prevent default on touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  // ✅ FIXED: Only prevent default if actually dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && Math.abs(dragOffset) > 10) {
      e.preventDefault(); // Only prevent when actually dragging
      handleDragMove(e.touches[0].clientX);
    } else if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  // ✅ FIXED: Don't prevent default on touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    handleDragEnd();
  };

  // Global mouse events
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

  const goToNews = (index: number) => {
    if (isTransitioning || isDragging || index === currentNews) return;
    setIsTransitioning(true);
    setCurrentNews(index);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  // Better card styling for mobile
  const getCardStyle = (index: number) => {
    const position = index - currentNews;
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
    } else if (position === 1 || (position === -2 && newsArticles.length === 3)) {
      translateX = 220 + dragInfluence;
      scale = 0.95;
      opacity = 0.8;
      zIndex = 5;
    } else if (position === -1 || (position === 2 && newsArticles.length === 3)) {
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
      transition: isDragging ? 'none' : 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };
  };

  const openArticle = (article: NewsArticle) => {
    requestAnimationFrame(() => {
      setSelectedArticle(article);
    });
  };

  const closeModal = () => {
    setSelectedArticle(null);
  };

  return (
    <>
      <section className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-1600">
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-2">
            <span className="block">As Seen In</span>
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
              Major News Outlets
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-blue-700 font-semibold">
            Leading Health Publications Cover BlueDrops
          </p>
        </div>

        {/* Drag Instructions */}
        <div className="text-center mb-4">
          <p className="text-sm text-blue-600 font-medium">
            👆 Drag to navigate between news articles
          </p>
        </div>

        {/* News Slideshow Container */}
        <div 
          ref={containerRef}
          className="relative h-[400px] mb-3"
          style={{ 
            perspective: '800px',
            touchAction: 'manipulation' // ✅ FIXED: Better touch action
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* News Cards */}
          {newsArticles.map((article, index) => (
            <div
              key={article.id}
              className="absolute inset-0 flex items-center justify-center select-none"
              style={getCardStyle(index)}
            >
              <NewsCard 
                article={article} 
                isActive={index === currentNews}
                isDragging={isDragging}
                onRead={() => openArticle(article)}
              />
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            {newsArticles.map((article, index) => (
              <button
                key={article.id}
                onClick={() => goToNews(index)}
                disabled={isTransitioning || isDragging}
                className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed ${
                  index === currentNews
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

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen">
            {selectedArticle.id === 'cnn' && <CNNModal onClose={closeModal} />}
            {selectedArticle.id === 'webmd' && <WebMDModal onClose={closeModal} article={selectedArticle} />}
            {selectedArticle.id === 'mayo' && <MayoModal onClose={closeModal} article={selectedArticle} />}
          </div>
        </div>
      )}
    </>
  );
};

// ✅ UPDATED: News Card Component - Sem nomes dos sites, só logos
const NewsCard: React.FC<{ 
  article: any; 
  isActive: boolean; 
  isDragging: boolean;
  onRead: () => void;
}> = ({ article, isActive, isDragging, onRead }) => {
  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 ${article.color} hover:shadow-lg transition-all duration-300 max-w-md w-full mx-4 ${
      isDragging ? 'shadow-2xl' : 'shadow-lg'
    } ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
      
      {/* ✅ UPDATED: Source Header - Só logo, sem nome */}
      <div className="flex items-center justify-center mb-4">
        <img 
          src={article.logo} 
          alt="News Source"
          className="h-8 sm:h-10 w-auto object-contain"
          draggable={false}
        />
      </div>

      {/* Article Title */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-tight">
        {article.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {article.summary}
      </p>

      {/* Read Button */}
      <button
        onClick={(e) => {
          // ✅ CRITICAL: Stop propagation and prevent drag interference
          e.stopPropagation();
          e.preventDefault();
          
          // ✅ Only trigger if not dragging
          if (!isDragging) {
          onRead();
          }
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 px-4 rounded-xl transition-colors text-sm"
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          minHeight: '44px', // ✅ Minimum touch target size
          position: 'relative',
          zIndex: 30 // ✅ Higher z-index than drag container
        }}
      >
        {article.buttonText}
      </button>
    </div>
  );
};