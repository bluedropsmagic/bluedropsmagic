import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, Mail, Star } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { BoltNavigation } from '../components/BoltNavigation';

interface DownsellPageProps {
  variant: 'dws1' | 'dws2' | 'dw3';
}

export const DownsellPage: React.FC<DownsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');

  // ✅ NEW: Ensure no Hotjar on downsell pages
  useEffect(() => {
    // Remove ALL Hotjar scripts from downsell pages
    const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
    existingHotjar.forEach(script => script.remove());
    
    // Clean up Hotjar globals
    if ((window as any).hj) {
      delete (window as any).hj;
    }
    if ((window as any)._hjSettings) {
      delete (window as any)._hjSettings;
    }
    
    console.log('🚫 Hotjar removed from downsell page');
  }, []);

  // Preserve CartPanda parameters
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Common CartPanda parameters to preserve
    const cartPandaParams = [
      'order_id', 'customer_id', 'transaction_id', 'email', 'phone',
      'first_name', 'last_name', 'address', 'city', 'state', 'zip',
      'country', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
      'utm_content', 'fbclid', 'gclid', 'affiliate_id', 'sub_id'
    ];

    cartPandaParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        params.append(param, value);
      }
    });

    // Also preserve any other parameters that might be present
    searchParams.forEach((value, key) => {
      if (!cartPandaParams.includes(key)) {
        params.append(key, value);
      }
    });

    setCartParams(params.toString());
  }, [searchParams]);

  // URLs based on variant - keeping original URLs
  const getUrls = () => {
    const urls = {
      'dws1': {
        accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=yes',
        reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=no'
      },
      'dws2': {
        accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=yes',
        reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=no'
      },
      'dw3': {
        accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
        reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no'
      }
    };
    return urls[variant];
  };

  const urls = getUrls();

  const handleAccept = () => {
    trackInitiateCheckout(urls.accept);
    trackOfferClick(`downsell-${variant}-accept`);
    
    let url = cartParams ? `${urls.accept}&${cartParams}` : urls.accept;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  const handleReject = () => {
    trackInitiateCheckout(urls.reject);
    trackOfferClick(`downsell-${variant}-reject`);
    
    let url = cartParams ? `${urls.reject}&${cartParams}` : urls.reject;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Bolt Navigation */}
      <BoltNavigation />
      
      {/* Fixed Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 animate-pulse" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">
            ⚠️ WAIT! YOUR ORDER IS INCOMPLETE
          </span>
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <header className="mb-8 text-center animate-fadeInDown animation-delay-200">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-8 w-auto mx-auto mb-4"
            />
          </header>

          {/* Main Headline - EXACT COPY */}
          <div className="text-center mb-12 animate-fadeInUp animation-delay-400">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-gray-900">
              Maybe you didn't understand that eliminating 100% of the toxin plaques from your penile veins is the ONLY way to never suffer from erectile dysfunction again
            </h1>
            
            <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-4">
                If you don't COMPLETELY EXTERMINATE these damn toxin plaques...
              </h2>
              
              <div className="space-y-3 text-gray-700 text-left">
                <p className="text-sm sm:text-base leading-relaxed">
                  Your erectile dysfunction problems will return.
                </p>
                <p className="text-sm sm:text-base leading-relaxed">
                  That's because, even if you start feeling the incredible benefits in the first few weeks.
                </p>
                <p className="text-sm sm:text-base leading-relaxed">
                  If you stop using BlueDrops before completely eliminating the toxin plaques, ALL the torment can come back to haunt you.
                </p>
                <p className="text-sm sm:text-base leading-relaxed">
                  The flaccidity at the crucial moment can catch you off guard again...
                </p>
                <p className="text-sm sm:text-base leading-relaxed">
                  The insecurity before sex will worry you once more...
                </p>
                <p className="text-sm sm:text-base leading-relaxed">
                  Your relationship with your partner will go back to square one...
                </p>
                <p className="text-sm sm:text-base leading-relaxed">
                  And worst of all, your flaccidity problem may become irreversible.
                </p>
              </div>
            </div>
          </div>

          {/* But I decided to help you section */}
          <div className="mb-12 animate-fadeInUp animation-delay-600">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                But I decided to help you as much as possible, and you will never have to go through all this again.
              </h3>
              <p className="text-lg text-gray-700">
                Maybe you don't know...
              </p>
              <p className="text-lg text-gray-700 mb-6">
                But I receive emails like this almost every day:
              </p>
            </div>

            {/* Email Section - EXACT COPY */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              {/* Email Header */}
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Email Received</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>From:</strong> James C.<br/>
                  <strong>To:</strong> contact@bluedrops.com<br/>
                  <strong>Subject:</strong> New Order Request
                </div>
              </div>
              
              {/* Email Content - EXACT COPY */}
              <div className="p-6">
                <div className="space-y-3 text-gray-700">
                  <p>I need your help.</p>
                  <p>I recently finished using the six bottles of BlueDrops and, honestly, I don't want to stop.</p>
                  <p>I no longer have those worries during sex, and my wife has never been so satisfied with my performance in bed.</p>
                  <p>Additionally, I noticed an increase in the size of my penis, which my partner also noticed.</p>
                  <p>I think I gained about 2 inches, it's incredible!!!</p>
                  <p>I feel more energetic and have much more stamina in my daily life.</p>
                  <p>I would like to buy another six-bottle package, but I saw on the website that the product is out of stock.</p>
                  <p>I would like to know when it will be restocked. I'm willing to pay more if necessary.</p>
                  <p>Awaiting your response.</p>
                  <p>Sincerely,</p>
                  <p>James C.</p>
                </div>
              </div>
            </div>
          </div>

          {/* This only proves one thing section */}
          <div className="mb-12 animate-fadeInUp animation-delay-800">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                This only proves one thing:
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                The benefits that BlueDrops provides go beyond just eliminating flaccidity.
              </p>
              <p className="text-xl font-bold text-blue-600 mb-8">
                More than 14,365 men reported that BlueDrops:
              </p>
            </div>

            {/* Benefits List - EXACT COPY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <p className="text-gray-800 font-medium">Increased penis size and thickness</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <p className="text-gray-800 font-medium">Tripled erection time in bed</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <p className="text-gray-800 font-medium">Accelerated reasoning</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <p className="text-gray-800 font-medium">Increased strength and muscle mass</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <p className="text-gray-800 font-medium">Burned excess fat</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <p className="text-gray-800 font-medium">Improvement in hair loss and appearance</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                All of this makes none of them want to stop taking BlueDrops, even after overcoming erectile dysfunction.
              </p>
              <p className="text-xl font-bold text-red-600">
                All of them would give anything to have access to this exclusive discount that I'm offering only to you.
              </p>
            </div>
          </div>

          {/* That's why I'm giving you one more chance section */}
          <div className="mb-12 animate-fadeInUp animation-delay-1000">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                That's why I'm giving you one more chance... And this time, it's even better.
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Only here, on this page, and while our stocks last...
              </p>
              <p className="text-xl font-bold text-blue-600 mb-8">
                You will pay only $23 per bottle in a 3-month BlueDrops kit.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                You won't see anything like this at any other time...
              </p>
            </div>

            {/* Product Offer - Simple button as per copy */}
            <div className="text-center mb-8">
              <button 
                onClick={handleAccept}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg border-2 border-white/40 checkout-button mb-6"
              >
                Click the button below to order your kit
              </button>
            </div>

            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                6 bt-$29/bottle
              </p>
              <p className="text-lg text-gray-700 mb-6">
                This is the BEST and BIGGEST discount the laboratory has ever offered, all so you don't have to suffer from erectile dysfunction again.
              </p>
              <p className="text-lg text-gray-700">
                And don't miss the countless EXTRA benefits that this powerful BlueDrops formula can provide you.
              </p>
            </div>
          </div>

          {/* Testimonials Section - EXACT COPY */}
          <div className="mb-12 animate-fadeInUp animation-delay-1200">
            <div className="text-lg text-gray-700 mb-6">
              Benefits that Tristan Hayes, from Charleston, SC, shared with us:
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">T</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Tristan Hayes</h4>
                  <p className="text-sm text-gray-600">Charleston, SC</p>
                </div>
                <div className="ml-auto">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              
              <blockquote className="text-gray-700 italic leading-relaxed">
                "I don't even know how to thank you for introducing me to BlueDrops! I thought I'd never feel like a real man again. My self-esteem reignited, thank you so much!"
              </blockquote>
            </div>

            <div className="text-lg text-gray-700 mb-6">
              Or what Landon Bishop, from Tucson, AZ, told us:
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">L</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Landon Bishop</h4>
                  <p className="text-sm text-gray-600">Tucson, AZ</p>
                </div>
                <div className="ml-auto">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              
              <blockquote className="text-gray-700 italic leading-relaxed">
                "This is all I needed! Damn! It feels so good to be confident in bed again... Thank you for this! Now the younger guys don't stand a chance against me, haha. BlueDrops is now part of my routine."
              </blockquote>
            </div>
          </div>

          {/* Take advantage section */}
          <div className="mb-12 animate-fadeInUp animation-delay-1400">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Take advantage of this unique opportunity
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                And, like them, start enjoying a vibrant and powerful sex life.
              </p>
              <p className="text-xl font-bold text-red-600 mb-8">
                Remember: this discount will never appear for you again.
              </p>

              {/* Final CTA Button */}
              <button 
                onClick={handleAccept}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg border-2 border-white/40 checkout-button mb-6"
              >
                6 bt-$29/bottle
              </button>

              <div className="mb-6">
                <p className="text-sm text-gray-600">100% Satisfaction Guarantee</p>
              </div>
            </div>
          </div>

          {/* Final Message - EXACT COPY */}
          <div className="text-center mb-8 animate-fadeInUp animation-delay-1600">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-lg font-medium text-gray-800 mb-4">
                I'll leave it here.
              </p>
              <p className="text-lg font-medium text-blue-600">
                Take care!
              </p>
            </div>
          </div>

          {/* Reject Button - EXACT COPY */}
          <div className="text-center animate-fadeInUp animation-delay-1800">
            <button 
              onClick={handleReject}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-300 checkout-button"
            >
              No, thanks
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};