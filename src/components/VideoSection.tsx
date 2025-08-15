import React from 'react';

export const VideoSection: React.FC = () => {
  return (
    <div className="mb-6 animate-fadeInUp animation-delay-600">
      {/* Video Container */}
      <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
        <div
          id="vid_689e7c030f018d362b0e239d"
          className="w-full h-full"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%'
          }}
        >
          {/* VTurb player will be injected here */}
        </div>
      </div>

      {/* Video Instructions */}
      <div className="mt-4 space-y-3 animate-fadeInUp animation-delay-800">
        {/* Sound Warning */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">🔊</span>
            <span className="text-blue-800 font-semibold text-sm">
              Please make sure your sound is on
            </span>
          </div>
          <p className="text-blue-600 text-xs">
            This video contains important audio information
          </p>
        </div>

        {/* Urgency Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <span className="text-red-800 font-semibold text-sm">
              This video may be taken down at any time
            </span>
          </div>
          <p className="text-red-600 text-xs">
            Watch now before it's removed from the internet
          </p>
        </div>
      </div>
    </div>
  );
};