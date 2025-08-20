import React from 'react';
import { Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="mb-6 text-center w-full animate-fadeInUp animation-delay-400">
      {/* Warning Banner */}
      <div className="mb-4 animate-fadeInDown animation-delay-200">
        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-normal flex items-center justify-center gap-1 inline-block mx-auto">
          <span>THEY DON'T WANT YOU TO KNOW THIS</span>
          <span className="text-xs">👇</span>
        </div>
      </div>
      
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.85] mb-3 px-2">
        <span className="text-blue-900 block mb-0.5">VIAGRA? NOPE</span>
        <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
          BAKING SODA!
        </span>
      </h1>
      
      <p className="text-sm sm:text-base text-blue-800 mb-2 font-medium px-2 leading-relaxed">
        "Discover how this simple kitchen ingredient can naturally restore your performance in just{' '}
        <span className="text-yellow-600 font-bold">7 days</span>."
      </p>
    </div>
  );
};