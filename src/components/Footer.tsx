import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 sm:mt-12 text-center text-blue-700 w-full px-4 animate-fadeInUp animation-delay-2000">
      <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 max-w-xl mx-auto border border-blue-200">
        <p className="text-xs mb-1">
          <strong>Copyright ©2024 | Blue Drops</strong>
        </p>
        <p className="text-xs mb-2">All Rights Reserved</p>
        <p className="text-xs opacity-70">
          These statements have not been evaluated by the Food and Drug Administration. 
          This product is not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>
    </footer>
  );
};