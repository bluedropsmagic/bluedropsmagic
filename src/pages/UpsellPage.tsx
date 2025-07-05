import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock, Star, X } from 'lucide-react';

interface UpsellPageProps {
  variant: '1-bottle' | '3-bottle' | '6-bottle';
}

interface UpsellContent {
  offer: {
    title: string;
    subtitle: string;
    description: string;
  };
  pricing: {
    pricePerBottle: string;
    totalPrice: string;
    savings: string;
    freeBottles: string;
    paidBottles: string;
  };
  acceptUrl: string;
  rejectUrl: string;
  productImage: string;
  acceptButtonText: string;
  rejectButtonText: string;
}

export const UpsellPage: React.FC<UpsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');

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

  const getUpsellContent = (variant: string): UpsellContent => {
    const contents = {
      '1-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 5 More Bottles + Get 4 Extra Bottles FREE',
          description: 'All at our lowest price ever...'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '4 FREE',
          paidBottles: '5 PAID'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'YES — COMPLETE MY 9‑MONTH TREATMENT',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure'
      },
      '3-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 3 More Bottles + Get 3 Extra Bottles FREE', // ✅ FIXED: 3+3
          description: 'Complete your transformation with the full protocol'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '3 FREE',
          paidBottles: '3 PAID' // ✅ FIXED: 3 paid
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'YES — COMPLETE MY 9‑MONTH TREATMENT',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure'
      },
      '6-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 1 More Bottle + Get 2 Extra Bottles FREE', // ✅ FIXED: 1+2
          description: 'Just 1 more bottle to ensure complete, permanent results'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '2 FREE',
          paidBottles: '1 PAID' // ✅ FIXED: 1 paid
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'YES — COMPLETE MY 9‑MONTH TREATMENT',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure'
      }
    };

    return contents[variant as keyof typeof contents];
  };

  const content = getUpsellContent(variant);

  const handleAccept = () => {
    trackOfferClick(`upsell-${variant}-accept`);
    
    // ✅ NEW: Add CID parameter if present
    let url = cartParams ? `${content.acceptUrl}&${cartParams}` : content.acceptUrl;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    window.location.href = url;
  };

  const handleReject = () => {
    trackOfferClick(`upsell-${variant}-reject`);
    
    // ✅ NEW: Add CID parameter if present
    let url = cartParams ? `${content.rejectUrl}&${cartParams}` : content.rejectUrl;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      {/* Fixed Red Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">⚠️ WAIT! YOUR ORDER IS NOT COMPLETE</span>
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
        </div>
      </div>

      {/* Main container */}
      <div className="pt-16 px-4 py-6 sm:py-8">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <header className="mb-6 sm:mb-8 text-center animate-fadeInDown animation-delay-200">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-6 sm:h-8 w-auto mx-auto"
            />
          </header>

          {/* Hero Section */}
          <div className="mb-6 text-center animate-fadeInUp animation-delay-400">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3">
              <span className="text-blue-900 block mb-1">You're Just ONE Step</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                Away From Success
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-blue-800 font-semibold px-2">
              Congratulations on securing your first bottles — but now, one last step could change everything.
            </p>
          </div>

          {/* Warning Sections - MOVED BEFORE product box */}
          <div className="space-y-4 sm:space-y-6 mb-6">
            {/* Critical Warning */}
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-red-200 shadow-lg animate-fadeInUp animation-delay-600">
              <div className="text-center">
                <div className="bg-red-500 text-white px-3 py-1.5 rounded-full inline-block mb-3">
                  <span className="font-bold text-xs sm:text-sm">CRITICAL WARNING</span>
                </div>
                
                <div className="space-y-2 text-blue-800 text-xs sm:text-sm leading-relaxed">
                  <p className="font-bold text-red-600">
                    If you skip this step, you might be wasting your entire investment.
                  </p>
                  <p className="font-bold text-red-600">Yes, I'm serious.</p>
                  <p>
                    Because stopping this treatment too early will erase ALL your progress — and can even make your condition worse than before.
                  </p>
                </div>
              </div>
            </div>

            {/* Truth Section */}
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-lg animate-fadeInUp animation-delay-800">
              <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                💧 Here's the Truth:
              </h3>
              
              <div className="space-y-2 sm:space-y-3 text-blue-800 text-xs sm:text-sm leading-relaxed">
                <p>
                  BlueDrops is a liquid formula designed to remove the toxins that disrupt blood flow and performance.
                </p>
                <p>
                  From the moment you take your first drops, your body begins a slow battle — fighting against the damage caused by years of poor circulation, stress, and hormonal imbalance.
                </p>
                <p className="font-bold text-red-600">
                  But here's the problem...
                </p>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-red-700 font-bold text-xs sm:text-sm">
                    🧠 These toxins are deeply rooted in your body. And they don't go down without a fight. They resist. They hide. They rebuild.
                  </p>
                </div>
                <p>
                  And if you stop the treatment too soon — before they're completely eliminated — they'll come back stronger.
                </p>
              </div>
            </div>

            {/* Consequences */}
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-red-200 shadow-lg animate-fadeInUp animation-delay-1000">
              <h3 className="text-base sm:text-lg font-bold text-red-700 mb-3 text-center">
                ❌ If You Don't Complete 9 Months of Treatment…
              </h3>
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                  <span>Your blood flow will weaken again</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                  <span>Your confidence and energy will drop</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                  <span>And in many cases, your body becomes immune to further treatment</span>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-blue-800 text-xs sm:text-sm italic text-center">
                  "It's like sending your army into battle, winning the war... And then suddenly pulling them out, letting the enemy regroup and conquer your body again."
                </p>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-red-600 font-bold text-xs sm:text-sm">
                  You'll lose everything you gained — and worse — you may not be able to recover again.
                </p>
              </div>
            </div>

            {/* Solution */}
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-green-200 shadow-lg animate-fadeInUp animation-delay-1200">
              <h3 className="text-base sm:text-lg font-bold text-green-700 mb-3 text-center">
                ✅ Why 9 Months of BlueDrops is Absolutely Essential
              </h3>
              
              <div className="space-y-2 sm:space-y-3 text-blue-800 text-xs sm:text-sm leading-relaxed">
                <p>
                  Only after 9 months of consistent use will your body create a strong defensive wall — a new, healthier internal state where performance-killing toxins can never return.
                </p>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-green-700 font-bold text-center text-xs sm:text-sm">Once that happens...</p>
                  <p className="text-green-600 text-center font-bold text-xs sm:text-sm">You'll NEVER need another product again.</p>
                </div>
                
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-red-700 font-bold text-center text-xs sm:text-sm">But if you stop early…</p>
                  <p className="text-red-600 text-center font-bold text-xs sm:text-sm">You might not be able to stand up again.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ MOVED: Product Box to the END - AFTER all arguments */}
          <div className="mb-6 relative animate-fadeInUp animation-delay-1400">
            {/* FINAL CHANCE Tag */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg border border-white/40">
                <div className="flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  <span className="tracking-wide">FINAL CHANCE</span>
                </div>
              </div>
            </div>

            {/* Card Container */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-2xl sm:rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-blue-600/95 to-blue-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 pt-6 sm:pt-8 border-2 border-white/30 shadow-2xl">
                
                {/* Product Image */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img 
                    src={content.productImage} 
                    alt="BlueDrops Complete Treatment"
                    className="w-full h-auto object-contain drop-shadow-2xl max-h-32 sm:max-h-40 md:max-h-48"
                  />
                </div>

                {/* Product Name */}
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">
                    BLUEDROPS
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base font-bold tracking-wide -mt-1">
                    {content.offer.title}
                  </p>
                </div>

                {/* Offer Details */}
                <div className="text-center mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg mb-3">
                    {content.offer.subtitle}
                  </div>
                  
                  {/* Benefits List */}
                  <div className="space-y-1.5 sm:space-y-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mb-4">
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>{content.pricing.totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>{content.pricing.pricePerBottle}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>No extra shipping fees</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>{content.pricing.savings}</span>
                    </div>
                  </div>
                </div>

                {/* ✅ CTA Button - NOW in the product box at the end */}
                <div className="relative mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-xl blur opacity-75 animate-pulse"></div>
                  <button 
                    onClick={handleAccept}
                    className="relative w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
                    <span className="relative z-10">{content.acceptButtonText}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Benefits Icons */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">180-Day</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Truck className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Free Ship</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Clock className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Secure</span>
                    </div>
                  </div>
                </div>

                {/* Benefits Image */}
                <div>
                  <div className="bg-white rounded p-1 shadow-sm">
                    <img 
                      src="https://i.imgur.com/1in1oo5.png" 
                      alt="Product Benefits"
                      className="w-full h-auto object-contain max-h-8 sm:max-h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reject Button */}
          <div className="mb-6 animate-fadeInUp animation-delay-1600">
            <button 
              onClick={handleReject}
              className="w-full bg-gradient-to-br from-gray-400/80 to-gray-600/80 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-xl text-white hover:bg-gray-500/80 transition-all duration-300"
            >
              <span className="text-xs sm:text-sm font-medium">❌ {content.rejectButtonText}</span>
            </button>
          </div>

          {/* Footer Warning */}
          <footer className="text-center text-blue-700 animate-fadeInUp animation-delay-2000">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg inline-block mb-2">
                <span className="font-bold text-xs sm:text-sm">🔴 FINAL WARNING</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-red-600 mb-1">
                Once this page closes, this offer disappears forever.
              </p>
              <p className="text-xs opacity-70">
                This is your only chance to secure the full 9-month protocol
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};