import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { initializeRedTrack } from '../utils/redtrackIntegration';
import { initializeFacebookPixelTracking } from '../utils/facebookPixelTracking';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { Star, Shield, Truck, CreditCard, CheckCircle, Clock, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);
  const { trackOfferClick } = useAnalytics();

  // Detect Bolt environment
  useEffect(() => {
    const hostname = window.location.hostname;
    const isBolt = hostname.includes('stackblitz') || 
                   hostname.includes('bolt.new') ||
                   hostname.includes('webcontainer') ||
                   hostname.includes('localhost') ||
                   hostname.includes('127.0.0.1');
    
    setIsBoltEnvironment(isBolt);
  }, []);

  // Initialize tracking
  useEffect(() => {
    initializeRedTrack();
    initializeFacebookPixelTracking();
  }, []);

  const handlePurchase = (packageType: 'premium' | 'regular' | 'trial') => {
    const urls = {
      'premium': 'https://pagamento.paybluedrops.com/checkout/176849703:1', // 6-bottle
      'regular': 'https://pagamento.paybluedrops.com/checkout/176845818:1',  // 3-bottle  
      'trial': 'https://pagamento.paybluedrops.com/checkout/176654642:1'     // 1-bottle
    };
    
    const url = urls[packageType];
    
    // Track the offer click
    trackOfferClick(`landing-${packageType}`);
    trackInitiateCheckout(url);
    
    // Build URL with all tracking parameters
    let finalUrl = url;
    
    // Add UTM and tracking parameters
    const urlParams = new URLSearchParams(window.location.search);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'affiliate_id', 'sub_id'];
    
    trackingParams.forEach(param => {
      const value = urlParams.get(param);
      if (value && !finalUrl.includes(`${param}=`)) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + `${param}=${encodeURIComponent(value)}`;
      }
    });
    
    // Add CID if present
    const cid = urlParams.get('cid');
    if (cid && !finalUrl.includes('cid=')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    console.log('🎯 Landing Page URL with all params:', finalUrl);
    
    setTimeout(() => {
      window.location.href = finalUrl;
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Bolt Environment Indicator */}
      {isBoltEnvironment && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            🔧 BOLT MODE: Landing Page
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-12 w-auto mx-auto"
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="text-blue-900 block mb-2">Natural Solution</span>
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block mb-2">
              for Men Over 40
            </span>
            <span className="text-blue-900 block">Restore Your Performance</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-blue-800 mb-4 font-semibold max-w-3xl mx-auto leading-relaxed">
            Clinically-Backed Formula • No Prescriptions Required • Discreet Delivery
          </p>
          
          {/* Supporting Text */}
          <div className="flex items-center justify-center gap-2 text-blue-700 text-lg mb-12">
            <Award className="w-5 h-5" />
            <span className="font-medium tracking-wide">ADVANCED MALE ENHANCEMENT FORMULA</span>
          </div>
        </div>
      </section>

      {/* Product Description Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mb-8">
            What is <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">BlueDrops?</span>
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
              BlueDrops is a revolutionary liquid supplement designed specifically for men over 40 
              experiencing performance challenges. Our pharmaceutical-grade formula combines 
              scientifically-proven ingredients in an easy-to-use sublingual drop format.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Unlike pills or injections, BlueDrops works by enhancing your body's natural 
              circulation and hormone production through a simple 7-second daily protocol. 
              No prescriptions, no side effects, no embarrassment.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <div className="text-3xl mb-3">💧</div>
                <h3 className="font-bold text-blue-900 mb-2">Liquid Formula</h3>
                <p className="text-gray-600 text-sm">Fast-absorbing sublingual drops for maximum effectiveness</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <div className="text-3xl mb-3">🌿</div>
                <h3 className="font-bold text-blue-900 mb-2">All Natural</h3>
                <p className="text-gray-600 text-sm">Premium botanical ingredients with extensive safety profile</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold text-blue-900 mb-2">Fast Acting</h3>
                <p className="text-gray-600 text-sm">Notice improvements within days, not weeks or months</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mb-4">
              <span className="block">Clinically Proven</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                Male Enhancement
              </span>
            </h2>
            <p className="text-xl text-blue-700 max-w-2xl mx-auto">
              Backed by science, trusted by thousands of men worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard 
              icon="🩸"
              title="Enhances Blood Flow by 373%"
              description="Clinically proven to improve circulation for optimal performance and stamina"
            />
            <BenefitCard 
              icon="💪"
              title="Restores Firm, Long-Lasting Erections"
              description="Regain the confidence and performance of your younger years naturally"
            />
            <BenefitCard 
              icon="⏰"
              title="Simple 7-Second Daily Protocol"
              description="Easy sublingual drops - no pills, no injections, no complications"
            />
            <BenefitCard 
              icon="🌿"
              title="Pharmaceutical-Grade Natural Formula"
              description="Premium ingredients with extensive safety profile and proven efficacy"
            />
            <BenefitCard 
              icon="🚫"
              title="Private, Confidential Treatment"
              description="No medical consultations required - complete privacy assured"
            />
            <BenefitCard 
              icon="📦"
              title="Discreet Delivery"
              description="Professional packaging with complete discretion to your doorstep"
            />
          </div>
        </div>
      </section>

      {/* Purchase Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mb-4">
              Select Your BlueDrops Package
            </h2>
            <p className="text-xl text-blue-700 mb-2">
              Professional-grade formula with guaranteed results
            </p>
            <p className="text-lg text-gray-600">
              Choose the package that's right for your transformation journey
            </p>
          </div>
          
          <PurchaseButtons onPurchase={handlePurchase} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mb-4">
              <span className="block">Verified Results.</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                Real Men.
              </span>
            </h2>
            <p className="text-xl text-blue-700">
              What men are saying about their BlueDrops experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Daniel Carter"
              location="Austin, TX"
              image="https://i.imgur.com/4bcFSBQ.png"
              testimonial="I was skeptical about natural supplements, but BlueDrops delivered results beyond my expectations. The improvement was noticeable within days, and my confidence is completely restored."
              rating={5}
            />
            <TestimonialCard 
              name="Marcus Reed"
              location="Atlanta, GA"
              image="https://i.imgur.com/Ob6Vy9q.png"
              testimonial="At 52, I thought my best years were behind me. BlueDrops restored my vitality and performance in ways I didn't think possible. My wife and I couldn't be happier."
              rating={5}
            />
            <TestimonialCard 
              name="Rick Alvarez"
              location="San Diego, CA"
              image="https://i.imgur.com/UJ0L2tZ.png"
              testimonial="The discretion and effectiveness of BlueDrops made all the difference. Professional results without the clinical hassle or embarrassment of traditional treatments."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-2 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 p-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center text-white">
                    <div className="text-2xl font-bold text-yellow-400">90</div>
                    <div className="text-sm font-bold">DAYS</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-lg font-bold">
                100%
              </div>
            </div>
          </div>
          
          <h3 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-6">
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              90-Day Money-Back Guarantee
            </span>
          </h3>
          
          <p className="text-lg text-blue-800 leading-relaxed mb-8 max-w-2xl mx-auto">
            Your investment is protected by our comprehensive 90-day guarantee. If BlueDrops doesn't 
            meet your expectations for enhanced performance and confidence, we'll provide a full refund. 
            No questions asked, no hassle, no embarrassment.
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200 shadow-lg">
            <p className="text-blue-900 font-semibold text-lg">
              🛡️ Your satisfaction is 100% guaranteed
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            Ready to Transform Your Performance?
          </h2>
          <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto">
            Join thousands of men who have already discovered the power of BlueDrops. 
            Your transformation starts today.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <PurchaseButtons onPurchase={handlePurchase} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-8 w-auto mx-auto mb-4"
            />
            <p className="text-gray-400 text-sm mb-4">
              <strong>Copyright ©2024 | Blue Drops</strong> - All Rights Reserved
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold">🔒 SSL Secured</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold">💳 Safe Checkout</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold">📦 Discreet Shipping</span>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Refund Policy</a>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-center text-xs text-gray-500 max-w-4xl mx-auto">
            <p className="mb-2">
              <strong>Medical Disclaimer:</strong> These statements have not been evaluated by the Food and Drug Administration. 
              This product is not intended to diagnose, treat, cure, or prevent any disease. Results may vary.
            </p>
            <p>
              Individual results may vary. This product is not a substitute for medical treatment. 
              Consult your healthcare provider before use if you have any medical conditions or take medications.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Purchase Buttons Component with Product Images
const PurchaseButtons: React.FC<{ onPurchase: (type: 'premium' | 'regular' | 'trial') => void }> = ({ onPurchase }) => {
  return (
    <div className="space-y-8">
      {/* Premium Offer - 6 Bottles */}
      <div className="relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-blue-600 px-6 py-2 rounded-full text-sm font-black shadow-lg border border-white/40">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600 fill-current" />
              <span className="tracking-wide">BEST VALUE</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-3xl blur-lg opacity-60 animate-pulse"></div>
          
          <div className="relative bg-gradient-to-br from-blue-600/95 to-blue-800/95 backdrop-blur-xl rounded-3xl p-8 pt-12 border-2 border-white/30 shadow-2xl">
            
            {/* Product Image */}
            <div className="flex justify-center mb-6">
              <img 
                src="https://i.imgur.com/hsfqxVP.png" 
                alt="BlueDrops 6 Bottle Pack"
                className="w-full h-auto object-contain drop-shadow-2xl max-h-64"
              />
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                BLUEDROPS PREMIUM
              </h3>
              <p className="text-white/80 text-lg">6 Bottles - 180 Day Supply</p>
              <p className="text-yellow-400 font-bold text-xl">$294 - Save $900</p>
            </div>

            <button 
              onClick={() => onPurchase('premium')}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg checkout-button"
             data-fttrack="checkout"
            >
              CLAIM PREMIUM PACKAGE
            </button>

            <div className="flex justify-center items-center gap-2 mt-4">
              <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-3 py-2 border border-blue-300/40 flex-1">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-sm">90-Day Guarantee</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-3 py-2 border border-blue-300/40 flex-1">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Truck className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-sm">Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regular and Trial side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regular Offer - 3 Bottles */}
        <div className="bg-gradient-to-br from-blue-400/80 to-blue-600/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          
          {/* Product Image */}
          <div className="flex justify-center mb-4">
            <img 
              src="https://i.imgur.com/eXYnjhm.png" 
              alt="BlueDrops 3 Bottle Pack"
              className="w-full h-auto object-contain drop-shadow-xl max-h-32"
            />
          </div>
          
          <div className="text-center mb-4">
            <h3 className="text-lg font-black text-white mb-1">BLUEDROPS REGULAR</h3>
            <p className="text-white/80 text-sm">3 Bottles - 90 Day Supply</p>
            <p className="text-yellow-400 font-bold text-lg">$198 - Save $398</p>
          </div>
          
          <button 
            onClick={() => onPurchase('regular')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm checkout-button"
          >
            GET REGULAR PACKAGE
          </button>

          <div className="flex justify-center items-center gap-1 mt-3">
            <div className="bg-gradient-to-r from-blue-300/30 to-blue-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-200/40 flex-1">
              <div className="flex items-center justify-center gap-1 text-white">
                <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span className="text-center font-semibold text-xs">90-Day</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-300/30 to-blue-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-200/40 flex-1">
              <div className="flex items-center justify-center gap-1 text-white">
                <Truck className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span className="text-center font-semibold text-xs">Free Ship</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Offer - 1 Bottle */}
        <div className="bg-gradient-to-br from-blue-300/80 to-blue-500/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          
          {/* Product Image */}
          <div className="flex justify-center mb-4">
            <img 
              src="https://i.imgur.com/iWs7wy7.png" 
              alt="BlueDrops 1 Bottle Pack"
              className="w-full h-auto object-contain drop-shadow-xl max-h-32"
            />
          </div>
          
          <div className="text-center mb-4">
            <h3 className="text-lg font-black text-white mb-1">BLUEDROPS TRIAL</h3>
            <p className="text-white/80 text-sm">1 Bottle - 30 Day Supply</p>
            <p className="text-yellow-400 font-bold text-lg">$79 - Try Risk-Free</p>
          </div>
          
          <button 
            onClick={() => onPurchase('trial')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm checkout-button"
          >
            START TRIAL PACKAGE
          </button>

          <div className="flex justify-center items-center gap-1 mt-3">
            <div className="bg-gradient-to-r from-blue-200/30 to-blue-400/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-100/40 flex-1">
              <div className="flex items-center justify-center gap-1 text-white">
                <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span className="text-center font-semibold text-xs">90-Day</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-200/30 to-blue-400/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-100/40 flex-1">
              <div className="flex items-center justify-center gap-1 text-white">
                <Clock className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-center font-semibold text-xs">+Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Benefit Card Component
const BenefitCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80 hover:scale-105">
      <div className="text-center">
        <div className="text-5xl mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-blue-900 mb-4 leading-tight">{title}</h3>
        <p className="text-blue-700 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ 
  name: string; 
  location: string; 
  image: string; 
  testimonial: string; 
  rating: number; 
}> = ({ name, location, image, testimonial, rating }) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-6">
        <img 
          src={image}
          alt={name}
          className="w-16 h-16 rounded-full object-cover border-3 border-blue-300 shadow-lg"
        />
        <div>
          <h4 className="font-bold text-blue-900 text-lg">{name}</h4>
          <p className="text-blue-700">{location}</p>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-blue-800 leading-relaxed italic mb-4">
        "{testimonial}"
      </p>
      
      <div className="inline-flex">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-bold">VERIFIED CUSTOMER</span>
        </div>
      </div>
    </div>
  );
};

// Global type declarations
declare global {
  interface Window {
  }
}