import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const GuaranteeSection: React.FC = () => {
  const [isGuaranteeExpanded, setIsGuaranteeExpanded] = useState(false);

  return (
    <section className="mt-16 sm:mt-20 w-full max-w-2xl mx-auto px-4 animate-fadeInUp animation-delay-1800">
      <div 
        className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:bg-white/40 border border-blue-200"
        onClick={() => setIsGuaranteeExpanded(!isGuaranteeExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Compact Guarantee Seal */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center text-white">
                    <div className="text-xs font-bold text-yellow-400">180</div>
                    <div className="text-xs font-bold">DAYS</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold">
                100%
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-1">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  180 Days Guarantee
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-700">
                100% money-back guarantee
              </p>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div className="text-blue-700 flex-shrink-0">
            {isGuaranteeExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isGuaranteeExpanded ? 'max-h-96 mt-4 sm:mt-6' : 'max-h-0'
        }`}>
          <div className="border-t border-blue-300 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-blue-800 leading-relaxed mb-4">
              Your order today is protected by our iron-clad 180-day 100% money-back guarantee. 
              If you're not amazed by how well BlueDrops enhances your vitality and performance, helping 
              you overcome the challenges of performance problems, or if you don't feel more 
              confident and satisfied, just let us know at any time within the next 180 days, 
              and we'll refund every penny of your investment. No questions asked.
            </p>
            
            <div className="flex items-center gap-3">
              <img 
                src="https://i.imgur.com/QJxTIcN.png" 
                alt="Blue Drops Logo"
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};