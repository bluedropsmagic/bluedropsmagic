import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, Mail, Star, Shield, CheckCircle, Clock, Truck } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { BoltNavigation } from '../components/BoltNavigation';

interface DownsellPageProps {
  variant: 'dws1' | 'dws2' | 'dw3';
}

interface DownsellContent {
  productType: string;
  priceText: string;
  subscriptionText: string;
  productImage: string;
  savings: string;
  description: string;
  acceptUrl: string;
  rejectUrl: string;
  finalOfferText: string;
  bottleCount: string;
  pricePerBottle: string;
}

export const DownsellPage: React.FC<DownsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);

  // ✅ NEW: Detect Bolt environment
  useEffect(() => {
    const hostname = window.location.hostname;
    const isBolt = hostname.includes('stackblitz') || 
                   hostname.includes('bolt.new') ||
                   hostname.includes('webcontainer') ||
                   hostname.includes('localhost') ||
                   hostname.includes('127.0.0.1');
    
    setIsBoltEnvironment(isBolt);
    
    if (isBolt) {
      console.log('🔧 Bolt environment detected on downsell page - all content visible');
    }
  }, []);
  // ✅ Ensure no Hotjar on downsell pages
  useEffect(() => {
    const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
    existingHotjar.forEach(script => script.remove());
    
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

    searchParams.forEach((value, key) => {
      if (!cartPandaParams.includes(key)) {
        params.append(key, value);
      }
    });

    setCartParams(params.toString());
  }, [searchParams]);

  const getDownsellContent = (variant: string): DownsellContent => {
    const contents = {
      'dws1': {
        productType: '6 BOTTLE PACKAGE',
        priceText: '$23 per bottle',
        subscriptionText: 'When you buy a 6-bottle kit',
        productImage: 'https://i.postimg.cc/XqFzZmRd/6-bottle.png',
        savings: 'Save $66 per bottle',
        description: 'Complete 6-bottle treatment',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=no',
        finalOfferText: '👉 6 Bottles – $23/Bottle',
        bottleCount: '6 bottles',
        pricePerBottle: '$23'
      },
      'dws2': {
        productType: '6 BOTTLE PACKAGE',
        priceText: '$24 per bottle',
        subscriptionText: 'When you buy a 6-bottle kit',
        productImage: 'https://i.postimg.cc/XqFzZmRd/6-bottle.png',
        savings: 'Save $65 per bottle',
        description: 'Complete 6-bottle treatment',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=no',
        finalOfferText: '👉 6 Bottles – $24/Bottle',
        bottleCount: '6 bottles',
        pricePerBottle: '$24'
      },
      'dw3': {
        productType: '3 BOTTLE PACKAGE',
        priceText: '$33 per bottle',
        subscriptionText: 'When you buy a 3-bottle kit',
        productImage: 'https://i.postimg.cc/XqFzZmRd/6-bottle.png',
        savings: 'Save $150 total',
        description: 'Complete 3-bottle treatment',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no',
        finalOfferText: '👉 3 Bottles – $33/Bottle',
        bottleCount: '3 bottles',
        pricePerBottle: '$33'
      }
    };

    return contents[variant as keyof typeof contents] || contents['dws1'];
  };

  const content = getDownsellContent(variant);

  const handleAccept = () => {
    trackInitiateCheckout(content.acceptUrl);
    trackOfferClick(`downsell-${variant}-accept`);
    
    let url = cartParams ? `${content.acceptUrl}&${cartParams}` : content.acceptUrl;
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
    trackInitiateCheckout(content.rejectUrl);
    trackOfferClick(`downsell-${variant}-reject`);
    
    let url = cartParams ? `${content.rejectUrl}&${cartParams}` : content.rejectUrl;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      {/* Bolt Navigation */}
      <BoltNavigation />
      
      {/* ✅ NEW: Bolt Environment Indicator */}
      {isBoltEnvironment && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            🔧 BOLT MODE: All Content Visible
          </div>
        </div>
      )}
      
      {/* Fixed Red Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">⚠️ FINAL CHANCE - DON'T MISS OUT</span>
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
        </div>
      </div>

      {/* Main Content */}
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

          {/* Main Headline */}
          <div className="mb-6 text-center animate-fadeInUp animation-delay-400">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-4 text-red-700">
              <span className="block mb-2">⚠️ <strong>Maybe you didn't realize it yet...</strong></span>
            </h1>
            
            <p className="text-sm sm:text-base text-red-700 font-bold px-2 mb-6">
              ⚠️ But eliminating <strong>100%</strong> of the toxic plaque from your penile veins is the <strong>ONLY</strong> way to never suffer from erectile dysfunction again.
            </p>
          </div>

          {/* Warning Section */}
          <div className="mb-6 animate-fadeInUp animation-delay-500">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <h2 className="text-lg sm:text-xl font-black text-red-700 mb-3">
                ⚠️ <strong>If you don't completely EXTERMINATE that toxic junk from your system...</strong>
              </h2>
              <p className="text-red-700 font-bold text-sm sm:text-base mb-2">
                ⚠️ <strong>Your ED issues WILL come back.</strong>
              </p>
            </div>
          </div>

          {/* Consequences Section */}
          <section className="mb-6 animate-fadeInUp animation-delay-600">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200">
              <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>Even if you've started to feel the incredible benefits within the first few weeks…</p>
                <p className="font-bold text-red-700">
                  ⚠️ <strong>If you stop using Blue Drops before all the plaque is gone, the nightmare can return to haunt you.</strong>
                </p>
                <p className="font-bold text-red-700">
                  ⚠️ <strong>That dreaded softness right at the crucial moment can strike again…</strong>
                </p>
                <p className="font-bold text-red-700">
                  ⚠️ <strong>The anxiety before sex will creep back in…</strong>
                </p>
                <p>Your relationship could go back to square one...</p>
                <p className="font-bold text-xl text-red-700">
                  ⚠️ <strong>And worst of all — your erectile problems might become irreversible.</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Help Decision */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-700">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">
                But I made a decision:
              </h2>
              <p className="text-blue-800 text-sm sm:text-base">
                I'm going to help you as much as I can — so you never have to go through that again.
              </p>
            </div>
          </section>

          {/* Email Section */}
          <section className="mb-6 animate-fadeInUp animation-delay-800">
            <div className="text-center mb-4">
              <p className="text-blue-800 text-sm sm:text-base font-semibold">
                You might not know this… But I get emails like this almost every day:
              </p>
            </div>
            
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
              {/* Email Header */}
              <div className="bg-gray-100 rounded-lg p-3 mb-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm">Email Received</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>From:</strong> James C.</p>
                  <p><strong>To:</strong> contact@bluedrops.com</p>
                  <p><strong>Subject:</strong> New Order Request</p>
                </div>
              </div>
              
              {/* Email Content */}
              <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <p>I need your help.</p>
                <p>I recently finished my 6 bottles of Blue Drops, and honestly — I don't want to stop.</p>
                <p>I don't worry about sex anymore, and my wife has never been so satisfied with my performance.</p>
                <p>On top of that, I've noticed an increase in penis size — and so has my wife.</p>
                <p><strong>I think I gained around 2 inches, it's insane!!!</strong></p>
                <p>I feel more energetic and have way more stamina in everyday life.</p>
                <p>I wanted to order another 6-month supply, but I saw the site says it's out of stock.</p>
                <p>Please let me know when it's back — I'm willing to pay more if needed.</p>
                <p>Sincerely,<br/>James C.</p>
              </div>
            </div>
          </section>

          {/* Proof Section */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-900">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-200">
              <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">
                This only proves one thing:
              </h2>
              <p className="text-blue-800 text-sm sm:text-base mb-3">
                The benefits of Blue Drops go far beyond fixing erectile dysfunction.
              </p>
              <p className="text-blue-600 font-bold text-sm sm:text-base">
                Over 14,365 men have reported that Blue Drops helped them:
              </p>
            </div>
          </section>

          {/* Benefits Grid */}
          <section className="mb-6 animate-fadeInUp animation-delay-1000">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-green-200">
                <p className="font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-green-700 text-center sm:text-left">
                  <span className="text-lg">🍆</span>
                  <span>Increase penis size and girth</span>
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-green-200">
                <p className="font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-green-700 text-center sm:text-left">
                  <span className="text-lg">💪</span>
                  <span>Triple their performance time in bed</span>
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-green-200">
                <p className="font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-green-700 text-center sm:text-left">
                  <span className="text-lg">🧠</span>
                  <span>Sharpen mental focus</span>
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-green-200">
                <p className="font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-green-700 text-center sm:text-left">
                  <span className="text-lg">💪</span>
                  <span>Build more muscle and strength</span>
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-green-200">
                <p className="font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-green-700 text-center sm:text-left">
                  <span className="text-lg">🔥</span>
                  <span>Burn off stubborn fat</span>
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-green-200">
                <p className="font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-green-700 text-center sm:text-left">
                  <span className="text-lg">✨</span>
                  <span>Regrow hair and improve appearance</span>
                </p>
              </div>
            </div>
          </section>

          {/* Continuation */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1100">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-200">
              <p className="text-blue-800 text-sm sm:text-base mb-3">
                That's why <strong>NONE</strong> of them want to stop taking Blue Drops — even after beating ED.
              </p>
              <p className="text-blue-800 text-sm sm:text-base">
                They would do anything to get this exclusive discount I'm offering you right now.
              </p>
            </div>
          </section>

          {/* Final Offer Setup */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1200">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">
                And that's why I'm giving you one more shot…
              </h2>
              <p className="text-blue-800 text-sm sm:text-base mb-2">
                This time, an even better deal.
              </p>
              <p className="text-blue-800 text-sm sm:text-base">
                Right here, on this page — and <strong>ONLY</strong> while supplies last...
              </p>
            </div>
          </section>

          {/* Price Announcement */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1250">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-4">
              <p className="text-lg sm:text-xl font-bold mb-2">
                You'll pay just <span className="text-yellow-300">${content.pricePerBottle} per bottle</span>
              </p>
              <p className="text-sm sm:text-base">
                on a 6-bottle supply of Blue Drops.
              </p>
            </div>
          </section>

          {/* Never Again Warning */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1275">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-bold text-base sm:text-lg mb-1">
                ⚠️ <strong>You will NOT see this offer again.</strong>
              </p>
              <p className="text-red-600 font-bold text-sm sm:text-base">
                Not tomorrow. Not ever.
              </p>
            </div>
          </section>

          {/* CTA Instruction */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1280">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <p className="text-blue-800 text-sm sm:text-base font-semibold">
                Click the button below to claim your kit.
              </p>
            </div>
          </section>

          {/* Main Offer */}
          <div className="mb-6 relative animate-fadeInUp animation-delay-1300">
            {/* TODAY ONLY Tag */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg border border-white/40">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  <span className="tracking-wide">TODAY ONLY</span>
                </div>
              </div>
            </div>

            {/* Card Container */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-green-500/95 to-green-700/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 pt-6 sm:pt-8 border-2 border-white/30 shadow-2xl">
                
                {/* Product Image */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img 
                    src={content.productImage} 
                    alt={`BlueDrops ${content.productType}`}
                    className="w-full h-auto object-contain drop-shadow-2xl max-h-32 sm:max-h-40 md:max-h-48"
                  />
                </div>

                {/* Product Name */}
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">
                    BLUEDROPS
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base font-bold tracking-wide -mt-1">
                    {content.productType}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/30 mb-3">
                    <p className="text-2xl sm:text-3xl font-black text-white mb-1">
                      {content.priceText}
                    </p>
                    <p className="text-white/90 text-xs sm:text-sm">
                      {content.subscriptionText}
                    </p>
                  </div>
                  
                  <p className="text-yellow-300 font-bold text-sm sm:text-base mb-2">
                    {content.savings}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="relative mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl blur opacity-75 animate-pulse"></div>
                  <button 
                    onClick={handleAccept}
                    className="relative w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden checkout-button"
                  >
                    <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
                    <span className="relative z-10">YES, I WANT THIS DEAL</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Benefits Icons */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  <div className="bg-gradient-to-r from-green-600/30 to-green-800/30 backdrop-blur-sm rounded px-2 py-1 border border-green-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">180-Day</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600/30 to-green-800/30 backdrop-blur-sm rounded px-2 py-1 border border-green-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Truck className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Free Ship</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600/30 to-green-800/30 backdrop-blur-sm rounded px-2 py-1 border border-green-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Clock className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Limited</span>
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

          {/* Lab Discount Message */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1400">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 font-bold text-sm sm:text-base">
                This is the <strong>BIGGEST</strong> discount ever offered by the lab — because we don't want you to suffer from ED ever again.
              </p>
            </div>
          </section>

          {/* Extra Benefits Intro */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1500">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-200">
              <p className="text-blue-800 text-sm sm:text-base">
                And don't miss out on the <strong>EXTRA</strong> benefits this formula can bring you.
              </p>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-6 animate-fadeInUp animation-delay-1600">
            {/* Tristan Hayes */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 border border-blue-200 shadow-lg mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">T</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Tristan Hayes</h4>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-600 text-xs">Charleston, SC</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed italic text-xs sm:text-sm">
                    "I can't thank you enough for introducing me to Blue Drops! I thought I'd never feel like a real man again. My self-esteem is back. Thank you!"
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Landon Bishop */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 border border-blue-200 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">L</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Landon Bishop</h4>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-600 text-xs">Tucson, AZ</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed italic text-xs sm:text-sm">
                    "This is exactly what I needed! Damn — it feels so good to be confident in bed again. Thanks a ton! Young guys don't stand a chance against me now, haha. Blue Drops is now part of my daily routine."
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1700">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-200">
              <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">
                Take advantage of this one-time-only offer...
              </h2>
              <p className="text-blue-800 text-sm sm:text-base mb-3">
                And like them — start living with the sexual power and confidence you deserve.
              </p>
              <p className="text-red-600 font-bold text-sm sm:text-base">
                Remember: This deal will <strong>NEVER</strong> appear again for you.
              </p>
            </div>
          </section>

          {/* Final Offer Repeat */}
          <div className="mb-6 relative animate-fadeInUp animation-delay-1800">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-blue-600/95 to-blue-800/95 backdrop-blur-xl rounded-2xl p-4 border-2 border-white/30 shadow-2xl">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white mb-2">
                    {content.finalOfferText}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                    <span className="text-white font-bold text-sm sm:text-base">✔ 100% Satisfaction Guarantee</span>
                  </div>
                  
                  <button 
                    onClick={handleAccept}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg checkout-button"
                  >
                    YES, I WANT THIS DEAL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Message */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1900">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <p className="text-blue-800 text-sm sm:text-base mb-1">I'll leave it here.</p>
              <p className="text-blue-600 font-medium text-sm sm:text-base">Take care!</p>
            </div>
          </section>

          {/* Reject Button */}
          <div className="mb-6 animate-fadeInUp animation-delay-2000">
            <button 
              onClick={handleReject}
              className="w-full bg-gradient-to-br from-gray-400/80 to-gray-600/80 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-xl text-white hover:bg-gray-500/80 transition-all duration-300 checkout-button"
            >
              <span className="text-xs sm:text-sm font-medium">No, thanks. I'll miss out.</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};