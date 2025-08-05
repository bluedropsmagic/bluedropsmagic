import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Shield, Truck, Star, Gift, Award, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { trackPurchase } from '../utils/facebookPixelTracking';
import { BoltNavigation } from '../components/BoltNavigation';

export const ThankYouPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    email: string;
    amount: number;
    currency: string;
    productType: string;
  } | null>(null);
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);

  // App slider images
  const appSlides = [
    {
      id: 1,
      title: 'App Interface',
      image: 'https://i.imgur.com/Nf7IQ47.png',
      description: 'Intuitive dashboard to track your progress'
    },
    {
      id: 2,
      title: 'Exclusive Bonuses',
      image: 'https://i.imgur.com/lfN5OF8.png',
      description: 'Premium content only for BlueDrops customers'
    },
    {
      id: 3,
      title: 'Symptom Tracker',
      image: 'https://i.imgur.com/wiUkHgw.png',
      description: 'Monitor your improvements day by day'
    }
  ];

  // Auto-advance slider every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % appSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % appSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + appSlides.length) % appSlides.length);
  };

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

  // Extract order details from URL parameters
  useEffect(() => {
    const orderId = searchParams.get('order_id') || searchParams.get('transaction_id') || 'BD' + Date.now();
    const email = searchParams.get('email') || 'customer@example.com';
    const amount = parseFloat(searchParams.get('amount') || searchParams.get('value') || '294');
    const currency = searchParams.get('currency') || 'BRL';
    const productType = searchParams.get('product') || searchParams.get('package') || '6-bottle';

    setOrderDetails({
      orderId,
      email,
      amount,
      currency,
      productType
    });

    // Track Purchase event for both pixels
    if (amount > 0) {
      console.log('🛒 Tracking Purchase event on thank you page:', { amount, currency, productType });
      trackPurchase(amount, currency);
    }
  }, [searchParams]);

  // Load Hotjar for thank you page
  useEffect(() => {
    // Remove any existing Hotjar scripts
    const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
    existingHotjar.forEach(script => script.remove());
    
    // Load Hotjar for thank you page (same ID as main page)
    const hotjarScript = document.createElement('script');
    hotjarScript.innerHTML = `
      (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:6457423,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    
    document.head.appendChild(hotjarScript);
    console.log('🔥 Hotjar thank you page tracking loaded (ID: 6457423)');
  }, []);

  const getProductInfo = (productType: string) => {
    const products = {
      '6-bottle': {
        name: 'BlueDrops 6-Bottle Package',
        image: 'https://i.imgur.com/hsfqxVP.png',
        description: '180-day complete treatment',
        benefits: ['180-day money-back guarantee', 'Free shipping worldwide', 'Complete 6-month protocol']
      },
      '3-bottle': {
        name: 'BlueDrops 3-Bottle Package', 
        image: 'https://i.imgur.com/eXYnjhm.png',
        description: '90-day treatment package',
        benefits: ['180-day money-back guarantee', 'Free shipping', '3-month supply']
      },
      '1-bottle': {
        name: 'BlueDrops 1-Bottle Package',
        image: 'https://i.imgur.com/iWs7wy7.png', 
        description: '30-day trial package',
        benefits: ['180-day money-back guarantee', 'Fast shipping', '1-month supply']
      }
    };

    return products[productType as keyof typeof products] || products['6-bottle'];
  };

  const productInfo = orderDetails ? getProductInfo(orderDetails.productType) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Bolt Navigation */}
      <BoltNavigation />
      
      {/* Bolt Environment Indicator */}
      {isBoltEnvironment && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            🔧 BOLT MODE: Thank You Page
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-8 px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <header className="mb-8 text-center animate-fadeInDown animation-delay-200">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-8 w-auto mx-auto mb-4"
            />
          </header>

          {/* Success Message */}
          <div className="text-center mb-8 animate-fadeInUp animation-delay-400">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-green-900 mb-4">
              🎉 Order Confirmed!
            </h1>
            
            <p className="text-lg text-green-800 font-semibold mb-2">
              Thank you for your purchase!
            </p>
            
            <p className="text-base text-gray-700">
              Your transformation journey starts now
            </p>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 mb-8 animate-fadeInUp animation-delay-600">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-600" />
                Order Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                {productInfo && (
                  <div className="flex justify-center">
                    <img 
                      src={productInfo.image}
                      alt={productInfo.name}
                      className="w-full h-auto object-contain max-h-48 drop-shadow-lg"
                    />
                  </div>
                )}
                
                {/* Order Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{productInfo?.name}</h3>
                    <p className="text-gray-600 text-sm">{productInfo?.description}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-gray-900">{orderDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">{orderDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-green-600">
                        {orderDetails.currency === 'BRL' ? 'R$' : '$'}{orderDetails.amount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mb-8 animate-fadeInUp animation-delay-800">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              What Happens Next?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Order Processing</h3>
                  <p className="text-blue-700 text-sm">Your order is being processed and will be shipped within 24-48 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Shipping Confirmation</h3>
                  <p className="text-blue-700 text-sm">You'll receive a tracking number via email once your package ships</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Start Your Protocol</h3>
                  <p className="text-blue-700 text-sm">Begin your BlueDrops protocol as soon as you receive your package</p>
                </div>
              </div>
            </div>
          </div>


          {/* Exclusive App Access */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6 mb-8 animate-fadeInUp animation-delay-600">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl">📱</span>
              </div>
              
              <h2 className="text-2xl font-bold text-blue-900 mb-3">
                🎉 Congratulations! You Now Have Access to Our Exclusive App
              </h2>
              
              <p className="text-blue-700 text-lg mb-6 leading-relaxed">
                As a BlueDrops customer, you now have exclusive access to our premium mobile app with:
              </p>
              
              {/* App Screenshots Slider */}
              <div className="mb-8">
                <div className="relative max-w-sm mx-auto">
                  {/* Slider Container */}
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
                    {/* Slides */}
                    {appSlides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                          index === currentSlide 
                            ? 'opacity-100 transform translate-x-0' 
                            : index < currentSlide 
                              ? 'opacity-0 transform -translate-x-full'
                              : 'opacity-0 transform translate-x-full'
                        }`}
                      >
                        <img 
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        
                        {/* Slide Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                          <h4 className="text-white font-bold text-lg mb-1">{slide.title}</h4>
                          <p className="text-white/90 text-sm">{slide.description}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Slide Indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {appSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'bg-blue-600 scale-110'
                            : 'bg-blue-200 hover:bg-blue-400'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Slide Counter */}
                  <div className="text-center mt-2">
                    <span className="text-blue-600 text-sm font-medium">
                      {currentSlide + 1} / {appSlides.length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* App Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-bold text-blue-900 mb-1">Progress Tracking</h3>
                  <p className="text-blue-700 text-sm">Monitor your daily protocol and results</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                  <div className="text-3xl mb-2">🔔</div>
                  <h3 className="font-bold text-blue-900 mb-1">Daily Reminders</h3>
                  <p className="text-blue-700 text-sm">Never miss your BlueDrops protocol</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                  <div className="text-3xl mb-2">👨‍⚕️</div>
                  <h3 className="font-bold text-blue-900 mb-1">Expert Tips</h3>
                  <p className="text-blue-700 text-sm">Exclusive content from health professionals</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="font-bold text-blue-900 mb-1">Success Stories</h3>
                  <p className="text-blue-700 text-sm">Real results from other BlueDrops users</p>
                </div>
              </div>
              
              {/* App Access Button */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                
                <a
                  href="https://www.bluedrops.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl text-lg border-2 border-white/40 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📱</span>
                    <span>ACCESS YOUR EXCLUSIVE APP NOW</span>
                    <span className="text-2xl">🚀</span>
                  </div>
                </a>
              </div>
              
              <p className="text-blue-600 text-sm mt-4 font-medium">
                👆 Click above to access your premium BlueDrops app
              </p>
              
              <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-semibold">
                  🔐 Exclusive Access: Only available to BlueDrops customers
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 p-6 mb-8 animate-fadeInUp animation-delay-1000">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Your Order is Protected
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">180-Day Guarantee</h3>
                <p className="text-gray-600 text-xs">Full money-back guarantee</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Free Shipping</h3>
                <p className="text-gray-600 text-xs">Worldwide delivery included</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Premium Quality</h3>
                <p className="text-gray-600 text-xs">Highest quality ingredients</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-gray-600 animate-fadeInUp animation-delay-1400">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <p className="text-sm mb-2">
                <strong>Copyright ©2024 | Blue Drops</strong> - All Rights Reserved
              </p>
              <p className="text-xs">
                Thank you for choosing BlueDrops for your health and wellness journey
              </p>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

// Global type declarations
declare global {
  interface Window {
    // Add any global types needed for thank you page
  }
}