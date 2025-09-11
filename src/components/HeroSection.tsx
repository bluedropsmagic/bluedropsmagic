import React from 'react';
import { Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="mb-6 text-center w-full animate-fadeInUp animation-delay-400">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.8] mb-4 px-2">
        <span className="text-blue-900 block mb-1">Baking Soda</span>
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent block">
          cures Impotence
        </span>
      </h1>
      
      <p className="text-base sm:text-lg md:text-xl text-blue-800 mb-2 font-medium px-2 leading-relaxed">
        This secret recipe can reverse Impotence in just{' '}
        <span className="text-yellow-600 font-bold">7 days</span>.
      </p>
    </div>
  );
};