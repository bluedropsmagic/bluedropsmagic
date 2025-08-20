import React from 'react';
import { X } from 'lucide-react';

interface WebMDModalProps {
  onClose: () => void;
  article: {
    title: string;
  };
}

export const WebMDModal: React.FC<WebMDModalProps> = ({ onClose, article }) => {
  // ✅ FIXED: Redirect to home page function
  const redirectToHome = () => {
    // ✅ NEW: Close modal and scroll to purchase section
    onClose();
    
    // ✅ NEW: Show content if not already visible
    if (typeof window !== 'undefined' && (window as any).showRestOfContentAfterDelay) {
      (window as any).showRestOfContentAfterDelay();
    }
    
    // ✅ NEW: Auto-scroll to 6-bottle button after modal closes
    setTimeout(() => {
      const purchaseSection = document.getElementById('six-bottle-package') || 
                            document.querySelector('[data-purchase-section="true"]') ||
                            document.querySelector('.purchase-button-main');
      
      if (purchaseSection) {
        purchaseSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Add highlight effect
        const element = purchaseSection as HTMLElement;
        element.style.transition = 'all 0.8s ease';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.4)';
        
        // Remove highlight after 4 seconds
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.boxShadow = '';
        }, 4000);
        
        console.log('📍 Auto-scrolled to 6-bottle purchase button from WebMD news');
      } else {
        console.log('⚠️ Purchase button not found for auto-scroll from WebMD news');
      }
    }, 500); // Wait for modal to close
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ✅ UPDATED: WebMD Header - Exatamente como na imagem */}
      <div className="bg-blue-900 text-white">
        <div className="px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* ✅ UPDATED: WebMD Logo - Nova logo */}
                <img 
                  src="https://i.imgur.com/hEggmdK.png" 
                  alt="WebMD" 
                  className="h-8 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={redirectToHome}
                />
                
                {/* ✅ UPDATED: Navigation - Exatamente como na imagem */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <span 
                    className="hover:text-blue-200 cursor-pointer"
                    onClick={redirectToHome}
                  >
                    Conditions
                  </span>
                  <span 
                    className="hover:text-blue-200 cursor-pointer"
                    onClick={redirectToHome}
                  >
                    Drugs & Supplements
                  </span>
                  <span 
                    className="text-blue-200 font-semibold border-b border-blue-200 pb-1"
                    onClick={redirectToHome}
                  >
                    Well-Being
                  </span>
                  <span 
                    className="hover:text-blue-200 cursor-pointer"
                    onClick={redirectToHome}
                  >
                    Symptom Checker
                  </span>
                  <span 
                    className="hover:text-blue-200 cursor-pointer"
                    onClick={redirectToHome}
                  >
                    Find a Doctor
                  </span>
                  <span 
                    className="hover:text-blue-200 cursor-pointer"
                    onClick={redirectToHome}
                  >
                    More
                  </span>
                </div>
              </div>
              
              {/* Right side - Subscribe and Close */}
              <div className="flex items-center gap-4">
                <button 
                  className="bg-transparent border border-white text-white px-4 py-2 rounded text-sm hover:bg-white hover:text-blue-900 transition-colors"
                  onClick={redirectToHome}
                >
                  Subscribe
                </button>
                <span 
                  className="text-white hover:text-blue-200 cursor-pointer text-sm"
                  onClick={redirectToHome}
                >
                  Log In
                </span>
                <button onClick={onClose} className="text-white hover:text-blue-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="text-blue-600 text-sm font-semibold mb-2 uppercase tracking-wide">
              Men's Health
            </div>
            
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Natural Male Enhancers Gaining Ground in 2025
            </h1>
            
            {/* Hero Image */}
            <div className="mb-6">
              <img 
                src="https://i.imgur.com/USKdLy9.png" 
                alt="Men's health research" 
                className="w-full h-64 object-cover rounded"
              />
              <p className="text-sm text-gray-500 mt-3 italic">
                Natural supplements are gaining popularity among men seeking alternatives to traditional treatments. (WebMD)
              </p>
            </div>
            
            <div className="text-gray-600 text-sm mb-6 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <strong>WebMD Medical Review: June 22, 2025</strong>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed mb-4">
                In 2025, the shift toward natural wellness continues growing—especially in male health supplements. Among up-and-coming products, BlueDrops stands out for combining traditional herbs like Tribulus and L-Arginine with scientifically backed nitric-oxide boosters in a simple daily drop format.
              </p>

              <p className="text-gray-700 leading-relaxed mb-4">
                WebMD consulted five men enrolled in a 30‑day trial:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>4 out of 5</strong> reported stronger erections</li>
                  <li><strong>3 improved</strong> their performance and confidence in the bedroom</li>
                  <li><strong>All participants</strong> noted better energy levels and mood</li>
                </ul>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                Dr. Julia Nguyen, a men's health specialist, commented:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">EXPERT OPINION</span>
                </h4>
                <p className="text-blue-800 italic">
                  "While not a replacement for prescription therapy, BlueDrops may offer a reliable, low‑risk starting point for men who prefer natural options. The compound appears safe and user-friendly."
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                WebMD classifies BlueDrops as a "promising breakthrough"—especially given the absence of harsh pills or major side effects.
              </p>

              {/* Product CTA Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src="https://i.imgur.com/iWs7wy7.png" 
                      alt="BlueDrops 1 Bottle Pack"
                      className="w-32 h-auto object-contain drop-shadow-lg"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">
                      Claim Your BlueDrops Supply
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Join the men who've already discovered this natural breakthrough. Complete satisfaction guaranteed for 180 days.
                    </p>
                    <button
                      onClick={redirectToHome}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Order BlueDrops Today
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Related Topics</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline" onClick={redirectToHome}>Men's Health Basics</a></li>
                <li><a href="#" className="text-blue-600 hover:underline" onClick={redirectToHome}>Natural Supplements Guide</a></li>
                <li><a href="#" className="text-blue-600 hover:underline" onClick={redirectToHome}>Performance Enhancement</a></li>
                <li><a href="#" className="text-blue-600 hover:underline" onClick={redirectToHome}>Erectile Dysfunction</a></li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Health Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline" onClick={redirectToHome}>Symptom Checker</a></li>
                <li><a href="#" className="text-blue-600 hover:underline" onClick={redirectToHome}>Drug Interaction Checker</a></li>
                <li><a href="#" className="text-blue-600 hover:underline" onClick={redirectToHome}>Find a Doctor</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: WebMD Footer - Exatamente como na imagem */}
      <div className="bg-blue-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Newsletter Section */}
          <div className="mb-12">
            <h3 className="text-white text-xl font-normal mb-4">Sign up for our free Good Health Newsletter</h3>
            <p className="text-gray-300 mb-6">Get wellness tips to help you live happier and healthier</p>
            
            <div className="flex max-w-lg">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 text-gray-900 rounded-l-lg focus:outline-none"
                onClick={redirectToHome}
              />
              <button 
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-r-lg transition-colors"
                onClick={redirectToHome}
              >
                Subscribe
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-3">
              By clicking Subscribe, I agree to the WebMD{' '}
              <a href="#" className="text-blue-300 hover:underline" onClick={redirectToHome}>Terms & Conditions & Privacy Policy</a>{' '}
              and understand that I may opt out of WebMD subscriptions at any time.
            </p>
          </div>

          {/* Social Media and App Downloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Follow WebMD */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow WebMD on Social Media</h4>
              <div className="flex gap-4">
                <div 
                  className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 cursor-pointer transition-colors"
                  onClick={redirectToHome}
                >
                  <span className="text-white text-sm">f</span>
                </div>
                <div 
                  className="w-8 h-8 bg-black rounded flex items-center justify-center hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={redirectToHome}
                >
                  <span className="text-white text-sm">X</span>
                </div>
                <div 
                  className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center hover:bg-pink-700 cursor-pointer transition-colors"
                  onClick={redirectToHome}
                >
                  <span className="text-white text-sm">📷</span>
                </div>
                <div 
                  className="w-8 h-8 bg-black rounded flex items-center justify-center hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={redirectToHome}
                >
                  <span className="text-white text-sm">🎵</span>
                </div>
                <div 
                  className="w-8 h-8 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 cursor-pointer transition-colors"
                  onClick={redirectToHome}
                >
                  <span className="text-white text-sm">📌</span>
                </div>
                <div 
                  className="w-8 h-8 bg-green-600 rounded flex items-center justify-center hover:bg-green-700 cursor-pointer transition-colors"
                  onClick={redirectToHome}
                >
                  <span className="text-white text-sm">💬</span>
                </div>
              </div>
            </div>

            {/* Download App */}
            <div>
              <h4 className="text-white font-semibold mb-4">Download WebMD App</h4>
              <div className="flex gap-3">
                <img 
                  src="https://images.pexels.com/photos/4439901/pexels-photo-4439901.png?auto=compress&cs=tinysrgb&w=120&h=40&fit=crop" 
                  alt="Download on App Store" 
                  className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={redirectToHome}
                />
                <img 
                  src="https://images.pexels.com/photos/4439901/pexels-photo-4439901.png?auto=compress&cs=tinysrgb&w=120&h=40&fit=crop" 
                  alt="Get it on Google Play" 
                  className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={redirectToHome}
                />
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="border-t border-blue-800 pt-8">
            <div className="flex flex-wrap gap-6 mb-6 text-sm">
              <span className="bg-blue-800 text-white px-3 py-1 rounded">Policies</span>
              <a href="#" className="text-gray-300 hover:text-white" onClick={redirectToHome}>About</a>
              <a href="#" className="text-gray-300 hover:text-white" onClick={redirectToHome}>For Advertisers</a>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
              <a href="#" className="hover:text-white" onClick={redirectToHome}>Privacy Policy</a>
              <a href="#" className="hover:text-white" onClick={redirectToHome}>Cookie Policy</a>
              <a href="#" className="hover:text-white" onClick={redirectToHome}>Editorial Policy</a>
              <a href="#" className="hover:text-white" onClick={redirectToHome}>Advertising Policy</a>
              <a href="#" className="hover:text-white" onClick={redirectToHome}>Correction Policy</a>
              <a href="#" className="hover:text-white" onClick={redirectToHome}>Terms of Use</a>
            </div>

            {/* Trust badges and copyright */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded">
                  <span className="text-blue-900 text-xs font-bold">TRUSTe</span>
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="text-blue-900 text-xs font-bold">AdChoices</span>
                </div>
              </div>
              
              <div className="text-right">
                <img 
                  src="https://i.imgur.com/hEggmdK.png" 
                  alt="WebMD" 
                  className="h-6 mb-2 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={redirectToHome}
                />
                <p className="text-xs text-gray-400">
                  © 2005 - 2025 WebMD LLC, an Internet Brands company. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};