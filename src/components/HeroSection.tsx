import React from 'react';
import { Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="mb-6 text-center w-full animate-fadeInUp animation-delay-400">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.85] mb-3 px-2">
        <span className="text-blue-900 block mb-0.5">Baking Soda</span>
        <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
          cures Impotence
        </span>
      </h1>
      
      <p className="text-base sm:text-lg text-blue-800 mb-2 font-semibold px-2">
        This secret recipe can reverse Impotence in just{' '}
        <span className="text-yellow-600 font-bold">7 Days</span>
      </p>
      
      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm">
        <Play className="w-4 h-4" />
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>
    </div>
  );
};