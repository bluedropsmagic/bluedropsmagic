import React, { useEffect } from 'react';
import { Star, Shield, Truck, CreditCard } from 'lucide-react';
import { buildUrlWithParams, trackPurchase } from '../utils/urlUtils';

interface ProductOffersProps {
  showPurchaseButton: boolean;
  onPurchase: (packageType: '1-bottle' | '3-bottle' | '6-bottle') => void;
  onSecondaryPackageClick: (packageType: '1-bottle' | '3-bottle') => void;
}

export const ProductOffers: React.FC<ProductOffersProps> = ({
  showPurchaseButton,
  onPurchase,
  onSecondaryPackageClick
}) => {
  // Purchase URLs with tracking
  const purchaseUrls = {
    '1-bottle': 'https://pagamento.paybluedrops.com/checkout/176654642:1',
    '3-bottle': 'https://pagamento.paybluedrops.com/checkout/176845818:1',
    '6-bottle': 'https://pagamento.paybluedrops.com/checkout/176849703:1'
  };

  // Purchase values for tracking
  const purchaseValues = {
    '1-bottle': 79,
    '3-bottle': 198,
    '6-bottle': 294
  };

  const handlePurchaseClick = (packageType: '1-bottle' | '3-bottle' | '6-bottle') => {
    // Track the purchase intent
    trackPurchase(purchaseValues[packageType], 'BRL', packageType);
    
    // Call the original onPurchase handler
    onPurchase(packageType);
    
    // ✅ NEW: Build URL with tracking parameters + CID if present
    let urlWithParams = buildUrlWithParams(purchaseUrls[packageType]);
    
    // Add CID parameter if present in current URL
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !urlWithParams.includes('cid=')) {
      urlWithParams += (urlWithParams.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    // ✅ FIXED: Use window.location.href instead of window.open for better tracking
    window.location.href = urlWithParams;
  };

  const handleSecondaryClick = (packageType: '1-bottle' | '3-bottle') => {
    // Track the secondary package click
    trackPurchase(purchaseValues[packageType], 'BRL', `${packageType}-secondary`);
    
    // Call the original handler
    onSecondaryPackageClick(packageType);
  };

  if (!showPurchaseButton) return null;

  return (
    <>
      {/* PRODUTO 1: 6 BOTTLE PACKAGE - BEST VALUE */}
      <div 
        id="six-bottle-package" 
        data-purchase-section="true"
        className="w-full mb-6 sm:mb-8 relative animate-fadeInUp animation-delay-800"
      >
        {/* BEST VALUE Tag */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-black shadow-lg border-2 border-white/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 fill-current" />
              <span className="tracking-wide">BEST VALUE</span>
            </div>
          </div>
        </div>

        {/* Container com glow azul */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-3xl blur-lg opacity-60 animate-pulse"></div>
          
          <div className="relative bg-gradient-to-br from-blue-600/95 to-blue-800/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 pt-8 sm:pt-10 border-2 border-white/30 shadow-2xl">
            <div className="absolute inset-0 rounded-3xl border border-white/20 pointer-events-none"></div>
            
            {/* Product Image */}
            <div className="flex justify-center mb-3 px-2">
              <img 
                src="https://i.imgur.com/hsfqxVP.png" 
                alt="BlueDrops 6 Bottle Pack"
                className="w-full h-auto object-contain drop-shadow-2xl max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-72"
              />
            </div>

            {/* Product Name */}
            <div className="text-center mb-4 sm:mb-5">
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-none px-2">
                BLUEDROPS
              </h3>
              <p className="text-white/80 text-base sm:text-lg md:text-xl font-bold tracking-wide -mt-1">
                6 BOTTLE PACKAGE
              </p>
            </div>

            {/* Savings */}
            <div className="text-center mb-2">
              <p className="text-yellow-400 font-bold text-lg sm:text-xl tracking-wide">
                YOU'RE SAVING $900
              </p>
            </div>

            {/* CTA Button */}
            <div className="relative mb-2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-xl blur opacity-75 animate-pulse"></div>
              <button 
                onClick={() => handlePurchaseClick('6-bottle')}
                className="relative w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden purchase-button-main"
              >
                <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
                <span className="relative z-10">CLAIM OFFER NOW</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Price info */}
            <div className="text-center mb-3">
              <p className="text-white/70 text-sm sm:text-base font-medium">
                only $49 per bottle, $294 total
              </p>
            </div>

            {/* Benefits */}
            <div className="flex justify-center items-center gap-0.5 sm:gap-1 mb-2 px-1">
              <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded-md px-1 sm:px-1.5 py-1 sm:py-1.5 border border-blue-300/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-xs text-white">
                  <Shield className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">180-Day</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded-md px-1 sm:px-1.5 py-1 sm:py-1.5 border border-blue-300/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-xs text-white">
                  <Truck className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">Free Ship</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded-md px-1 sm:px-1.5 py-1 sm:py-1.5 border border-blue-300/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-xs text-white">
                  <CreditCard className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">Secure</span>
                </div>
              </div>
            </div>

            {/* Box branco com imagem */}
            <div>
              <div className="bg-white rounded-md p-1 shadow-sm">
                <img 
                  src="https://i.imgur.com/1in1oo5.png" 
                  alt="Product Benefits"
                  className="w-full h-auto object-contain max-h-12 sm:max-h-14"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUTOS 2 e 3: LADO A LADO - AZUL MENOS CHAMATIVO */}
      <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fadeInUp animation-delay-1000">
        
        {/* PRODUTO 2: 3 BOTTLE PACKAGE */}
        <div className="relative">
          <div className="relative bg-gradient-to-br from-blue-400/80 to-blue-600/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl">
            
            {/* Product Image */}
            <div className="flex justify-center mb-2 px-1">
              <img 
                src="https://i.imgur.com/eXYnjhm.png" 
                alt="BlueDrops 3 Bottle Pack"
                className="w-full h-auto object-contain drop-shadow-xl max-h-16 sm:max-h-20"
              />
            </div>

            {/* Product Name */}
            <div className="text-center mb-2">
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                BLUEDROPS
              </h3>
              <p className="text-white/80 text-xs font-bold tracking-wide">
                3 BOTTLE PACKAGE
              </p>
            </div>

            {/* Savings */}
            <div className="text-center mb-2">
              <p className="text-yellow-400 font-bold text-xs sm:text-sm">
                SAVE $398
              </p>
            </div>

            {/* CTA Button */}
            <div className="relative mb-2">
              <button 
                onClick={() => handleSecondaryClick('3-bottle')}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs sm:text-sm border border-white/30"
              >
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Price info */}
            <div className="text-center mb-2">
              <p className="text-white/70 text-xs font-medium">
                $66 per bottle, $198 total
              </p>
            </div>

            {/* Benefits - Compactos */}
            <div className="flex justify-center items-center gap-0.5 mb-1">
              <div className="bg-gradient-to-r from-blue-300/30 to-blue-500/30 backdrop-blur-sm rounded px-1 py-0.5 border border-blue-200/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <Shield className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">180d</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-300/30 to-blue-500/30 backdrop-blur-sm rounded px-1 py-0.5 border border-blue-200/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <Truck className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">Free</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-300/30 to-blue-500/30 backdrop-blur-sm rounded px-1 py-0.5 border border-blue-200/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <CreditCard className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUTO 3: 1 BOTTLE PACKAGE */}
        <div className="relative">
          <div className="relative bg-gradient-to-br from-blue-300/80 to-blue-500/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl">
            
            {/* Product Image */}
            <div className="flex justify-center mb-2 px-1">
              <img 
                src="https://i.imgur.com/iWs7wy7.png" 
                alt="BlueDrops 1 Bottle Pack"
                className="w-full h-auto object-contain drop-shadow-xl max-h-16 sm:max-h-20"
              />
            </div>

            {/* Product Name */}
            <div className="text-center mb-2">
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                BLUEDROPS
              </h3>
              <p className="text-white/80 text-xs font-bold tracking-wide">
                1 BOTTLE PACKAGE
              </p>
            </div>

            {/* Savings */}
            <div className="text-center mb-2">
              <p className="text-yellow-400 font-bold text-xs sm:text-sm">
                SAVE $309
              </p>
            </div>

            {/* CTA Button */}
            <div className="relative mb-2">
              <button 
                onClick={() => handleSecondaryClick('1-bottle')}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs sm:text-sm border border-white/30"
              >
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Price info */}
            <div className="text-center mb-2">
              <p className="text-white/70 text-xs font-medium">
                $89, $79 + $9.99 ship
              </p>
            </div>

            {/* Benefits - Compactos com shipping diferente */}
            <div className="flex justify-center items-center gap-0.5 mb-1">
              <div className="bg-gradient-to-r from-blue-200/30 to-blue-400/30 backdrop-blur-sm rounded px-1 py-0.5 border border-blue-100/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <Shield className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">180d</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-200/30 to-blue-400/30 backdrop-blur-sm rounded px-1 py-0.5 border border-blue-100/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <Truck className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">$9.99</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-200/30 to-blue-400/30 backdrop-blur-sm rounded px-1 py-0.5 border border-blue-100/40 flex-1">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <CreditCard className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};