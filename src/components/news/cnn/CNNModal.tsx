import React from 'react';
import { X, Menu } from 'lucide-react';

interface CNNModalProps {
  onClose: () => void;
}

export const CNNModal: React.FC<CNNModalProps> = ({ onClose }) => {
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
        
        console.log('📍 Auto-scrolled to 6-bottle purchase button from CNN news');
      } else {
        console.log('⚠️ Purchase button not found for auto-scroll from CNN news');
      }
    }, 500); // Wait for modal to close
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Simplified CNN Header - Based on attached image */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Left side - Logo and Health */}
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={redirectToHome}
              >
                {/* CNN Logo */}
                <img src="https://i.imgur.com/0twf89j.png" alt="CNN" className="h-6" />
                <span className="text-lg font-bold text-gray-900">Health</span>
                <img src="https://i.imgur.com/0twf89j.png" alt="CNN" className="h-6" />
                <span className="text-lg font-bold text-gray-900">Health</span>
              </div>
              
              {/* Right side - Menu and Close */}
              <div className="flex items-center gap-4">
                <Menu className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
                <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Article Header */}
          <div className="mb-8">
            <div className="text-red-600 text-sm font-bold mb-3 uppercase tracking-wide">
              CNN Health
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              A Surprising Natural Solution to Men's Performance Issues
            </h1>
            <div className="text-gray-600 text-sm mb-6 flex items-center gap-4">
              <span>By <strong>CNN Health Staff</strong></span>
              <span>•</span>
              <span>Published June 15, 2025</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mb-8">
            <img 
              src="https://i.imgur.com/W7PYgoQ.jpeg" 
              alt="Men's health research" 
              className="w-full h-80 object-cover rounded"
            />
            <p className="text-sm text-gray-500 mt-3 italic">
              Men over 40 are increasingly seeking natural alternatives for performance issues, with products like BlueDrops gaining attention. (Getty Images)
            </p>
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-800 leading-relaxed mb-6 font-light">
              Over the past year, interest has surged in plant-based, non-prescription alternatives for men experiencing age-related performance concerns. Among the top trending options is BlueDrops, a natural liquid supplement blending nitric‑oxide boosting amino acids and adaptogens.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              An independent study involving more than 2,000 men over 40 revealed that daily use of BlueDrops for just seven days led to:
            </p>

            {/* Study Results */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-8">
              <h3 className="font-bold text-gray-900 mb-4 text-xl">Study Results:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
                <li>A 35% average increase in firmness and stamina</li>
                <li>Significant improvements in sexual confidence and duration</li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              "When passive approaches failed, participants turned to supplements like BlueDrops—and many reported noticeable results faster than expected," says Dr. Alan Roberts.
            </p>

            {/* Quote Block */}
            <div className="bg-gray-50 border-l-4 border-red-600 p-6 rounded-lg my-8">
              <blockquote className="text-lg text-gray-800 italic mb-4">
                "Users have praised the product for its quick onset, zero reported side effects, and discreet delivery without a prescription."
              </blockquote>
              <cite className="text-sm text-gray-600 font-medium">— CNN Health Research Team</cite>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Scientists continue to investigate the blend of ingredients, but current findings are promising enough to spark widespread interest among men seeking natural alternatives to traditional treatments.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              The appeal of natural solutions like BlueDrops lies in their accessibility and the comfort men feel using ingredients they recognize and trust. This shift reflects broader changes in how men approach health and wellness, with many preferring solutions that work with their body's natural processes.
            </p>

            {/* Key Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
              <h3 className="font-bold text-gray-900 mb-4 text-xl">Key Benefits Reported:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
                <li>Quick onset of effects within days</li>
                <li>Zero reported side effects in clinical studies</li>
                <li>Discreet delivery without prescription requirements</li>
                <li>Natural ingredients with proven efficacy</li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed text-lg mb-8">
              As research continues to validate natural approaches to men's health, products like BlueDrops represent a promising direction for those seeking effective, natural solutions without the complexity or side effects often associated with traditional treatments.
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
                    Try BlueDrops Risk-Free
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Experience the natural solution that's changing men's lives. Start with our 30-day trial package.
                  </p>
                  <button
                    onClick={redirectToHome}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Get BlueDrops Now
                  </button>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2 hover:text-red-600 cursor-pointer">
                    Natural supplements gain ground in men's health market
                  </h4>
                  <p className="text-sm text-gray-600">Industry experts weigh in on the growing trend...</p>
                </div>
                <div className="border border-gray-200 rounded p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2 hover:text-red-600 cursor-pointer">
                    What doctors want you to know about performance supplements
                  </h4>
                  <p className="text-sm text-gray-600">Medical professionals share their perspectives...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Updated CNN Footer - Based on attached image */}
      <div className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* CNN Health Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <img src="https://i.imgur.com/0twf89j.png" alt="CNN" className="h-6" />
              <span className="text-white text-lg font-bold">Health</span>
            </div>
          </div>

          {/* Follow CNN Section */}
          <div className="text-center mb-8">
            <h3 className="text-white font-bold text-sm mb-4 tracking-wide">FOLLOW CNN</h3>
            <div className="flex justify-center gap-6">
              {/* Social Media Icons */}
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <span className="text-white text-sm">f</span>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <span className="text-white text-sm">X</span>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <span className="text-white text-sm">📷</span>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <span className="text-white text-sm">🎵</span>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <span className="text-white text-sm">in</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400 mb-6">
            <div className="space-y-2">
              <a href="#" className="block hover:text-white">Terms of Use</a>
              <a href="#" className="block hover:text-white">Ad Choices</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block hover:text-white">Privacy Policy</a>
              <a href="#" className="block hover:text-white">Accessibility & CC</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block hover:text-white">Cookie Settings</a>
              <a href="#" className="block hover:text-white">About</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block hover:text-white">Newsletters</a>
              <a href="#" className="block hover:text-white">Transcripts</a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-gray-400 border-t border-gray-700 pt-6">
            <p className="mb-2">© 2025 Cable News Network. A Warner Bros. Discovery Company. All Rights Reserved.</p>
            <p>CNN Sans ™ & © 2016 Cable News Network.</p>
          </div>
        </div>
      </div>
    </div>
  );
};