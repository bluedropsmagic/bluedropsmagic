import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface BoltNavigationProps {
  onToggleFactory?: () => void;
  showFactorySection?: boolean;
}

export const BoltNavigation: React.FC<BoltNavigationProps> = ({ 
  onToggleFactory, 
  showFactorySection = false 
}) => {
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // Detect Bolt environment
  useEffect(() => {
    const hostname = window.location.hostname;
    const isBolt = hostname.includes('stackblitz') || 
                   hostname.includes('bolt.new') ||
                   hostname.includes('webcontainer') ||
                   hostname.includes('localhost') ||
                   hostname.includes('127.0.0.1') ||
                   hostname.includes('preview');
    
    setIsBoltEnvironment(isBolt);
    
    if (isBolt) {
      console.log('🔧 Development environment detected - navigation enabled');
    } else {
      console.log('🌐 Production environment - navigation hidden');
    }
  }, []);

  // Don't render if not in Bolt environment
  if (!isBoltEnvironment) {
    return null;
  }

  const currentPath = location.pathname;

  const navigationItems = [
    {
      category: 'Main',
      items: [
        { label: '🏠 Home Page', path: '/', color: 'bg-gray-500 hover:bg-gray-600' },
        { label: '🎯 FTR Page', path: '/ftr', color: 'bg-gray-500 hover:bg-gray-600' },
        { label: '🎉 Thank You Page', path: '/thankyou?order_id=BD123456&email=test@example.com&amount=294&product=6-bottle', color: 'bg-green-500 hover:bg-green-600' }
      ]
    },
    {
      category: 'Upsell Pages',
      items: [
        { label: '📦 1-Bottle Upsell', path: '/up1bt?cid=bolt_test_1bt', color: 'bg-blue-500 hover:bg-blue-600' },
        { label: '📦 3-Bottle Upsell', path: '/up3bt?cid=bolt_test_3bt', color: 'bg-blue-500 hover:bg-blue-600' },
        { label: '📦 6-Bottle Upsell', path: '/up6bt?cid=bolt_test_6bt', color: 'bg-blue-500 hover:bg-blue-600' }
      ]
    },
    {
      category: 'Second Upsell Pages',
      items: [
        { label: '🎯 Second Upsell 1BT', path: '/upig1bt?cid=bolt_test_upig1bt', color: 'bg-purple-500 hover:bg-purple-600' },
        { label: '🎯 Second Upsell 3BT', path: '/upig3bt?cid=bolt_test_upig3bt', color: 'bg-purple-500 hover:bg-purple-600' },
        { label: '🎯 Second Upsell 6BT', path: '/upig6bt?cid=bolt_test_upig6bt', color: 'bg-purple-500 hover:bg-purple-600' }
      ]
    },
    {
      category: 'Downsell Pages',
      items: [
        { label: '💰 Downsell 1', path: '/dws1?cid=bolt_test_dws1', color: 'bg-orange-500 hover:bg-orange-600' },
        { label: '💰 Downsell 2', path: '/dws2?cid=bolt_test_dws2', color: 'bg-orange-500 hover:bg-orange-600' },
        { label: '💰 Downsell 3', path: '/dw3?cid=bolt_test_dw3', color: 'bg-orange-500 hover:bg-orange-600' }
      ]
    },
    {
      category: 'Admin',
      items: [
        { label: '👨‍💼 Admin Dashboard', path: '/admin', color: 'bg-purple-500 hover:bg-purple-600' }
      ]
    }
  ];

  return (
    <div className="fixed top-4 left-4 z-[9999]">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header - Always visible */}
        <div 
          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-gray-800">🔧 Bolt Nav</span>
            </div>
            <div className="text-gray-500 text-xs">
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>
          
          {/* Current page indicator */}
          <div className="mt-1">
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              {currentPath === '/' ? 'Home' : currentPath}
            </span>
          </div>
        </div>

        {/* Navigation items - Expandable */}
        {isExpanded && (
          <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
            {navigationItems.map((category, categoryIndex) => (
              <div key={categoryIndex} className="p-3 border-b border-gray-100 last:border-b-0">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  {category.category}:
                </p>
                <div className="space-y-1">
                  {category.items.map((item, itemIndex) => {
                    const isActive = currentPath === item.path.split('?')[0];
                    return (
                      <a
                        key={itemIndex}
                        href={item.path}
                        className={`block ${item.color} text-white px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          isActive ? 'ring-2 ring-yellow-400 ring-offset-1' : ''
                        }`}
                      >
                        {item.label}
                        {isActive && <span className="ml-2 text-yellow-300">●</span>}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Footer info */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2">
              {/* Factory Section Toggle */}
              {onToggleFactory && (
                <div className="mb-2">
                  <button
                    onClick={onToggleFactory}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${
                      showFactorySection 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    🏭 Factory Section: {showFactorySection ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}
              
              <p className="text-xs text-gray-500 text-center">
                🔧 Bolt environment only
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};