import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalsProps {
  showPopup: boolean;
  showUpsellPopup: boolean;
  selectedPackage: string;
  onClosePopup: () => void;
  onCloseUpsellPopup: () => void;
  onUpsellAccept: () => void;
  onUpsellRefuse: () => void;
  getUpsellSavings: (packageType: string) => number;
}

export const Modals: React.FC<ModalsProps> = ({
  showPopup,
  showUpsellPopup,
  selectedPackage,
  onClosePopup,
  onCloseUpsellPopup,
  onUpsellAccept,
  onUpsellRefuse,
  getUpsellSavings
}) => {
  const upsellSavings = getUpsellSavings(selectedPackage);

  return (
    <>
      {/* Popup Modal - Overlay on top */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800/90 to-blue-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full mx-4 relative border border-blue-400/20 animate-slideInUp">
            {/* Close button */}
            <button 
              onClick={onClosePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Popup content */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
                <span className="text-white block mb-1">Baking Soda</span>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent block">
                  cures Impotence
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 mb-6">
                This secret recipe can reverse Impotence in just{' '}
                <span className="text-yellow-400 font-bold">7 Days</span>
              </p>

              <button 
                onClick={onClosePopup}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Reveal Secret
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upsell Popup Modal */}
      {showUpsellPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-blue-800/95 to-blue-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-4 relative border border-blue-400/20 animate-bounceIn">
            {/* Close button */}
            <button 
              onClick={onCloseUpsellPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Upsell content */}
            <div className="text-center pt-4">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <AlertTriangle className="w-8 h-8 text-white fill-current" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Wait! You're Leaving ${upsellSavings} Behind...
                </h2>
                
                <div className="text-white/90 text-sm sm:text-base mb-6 leading-relaxed">
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-yellow-400/30">
                    <p className="text-yellow-300 font-bold text-base sm:text-lg mb-2">
                      Choose the 6 Bottle Pack now and save an extra ${upsellSavings}!
                    </p>
                  </div>
                  
                  <p>
                    It's the most popular choice for long-term results — and it includes free shipping + a 180-day guarantee.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={onUpsellAccept}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg border-2 border-white/40"
                >
                  GET ${upsellSavings} EXTRA DISCOUNT
                </button>
                
                <button 
                  onClick={onUpsellRefuse}
                  className="w-full bg-transparent border border-white/20 text-white/60 hover:text-white/80 hover:border-white/30 font-medium py-2.5 px-6 rounded-xl transition-all duration-300 text-sm"
                >
                  Refuse Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};