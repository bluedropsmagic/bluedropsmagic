import React from 'react';
import { X } from 'lucide-react';

interface MayoModalProps {
  onClose: () => void;
  article: {
    title: string;
  };
}

export const MayoModal: React.FC<MayoModalProps> = ({ onClose, article }) => {
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
        
        console.log('📍 Auto-scrolled to 6-bottle purchase button from Mayo news');
      } else {
        console.log('⚠️ Purchase button not found for auto-scroll from Mayo news');
      }
    }, 500); // Wait for modal to close
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Mayo Clinic Header - Replicando exatamente a imagem */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Left side - Logo e Navigation */}
              <div className="flex items-center gap-8">
                {/* ✅ UPDATED: Mayo Clinic Logo - Nova logo conforme solicitado */}
                <img 
                  src="https://i.imgur.com/ClqsijC.png" 
                  alt="Mayo Clinic" 
                  className="h-10 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={redirectToHome}
                />
                
                {/* Navigation Menu - ✅ FIXED: All redirect to home */}
                <div className="hidden md:flex items-center gap-8 text-sm">
                  <span 
                    className="text-gray-700 hover:text-gray-900 cursor-pointer font-medium"
                    onClick={redirectToHome}
                  >
                    News Network
                  </span>
                  <span 
                    className="text-gray-700 hover:text-gray-900 cursor-pointer font-medium"
                    onClick={redirectToHome}
                  >
                    News Releases
                  </span>
                  <span 
                    className="text-gray-700 hover:text-gray-900 cursor-pointer font-medium"
                    onClick={redirectToHome}
                  >
                    Health Topics
                  </span>
                  <span 
                    className="text-gray-700 hover:text-gray-900 cursor-pointer font-medium"
                    onClick={redirectToHome}
                  >
                    Medical Research
                  </span>
                  <span 
                    className="text-gray-700 hover:text-gray-900 cursor-pointer font-medium"
                    onClick={redirectToHome}
                  >
                    Media Contacts
                  </span>
                  <span 
                    className="text-gray-700 hover:text-gray-900 cursor-pointer font-medium"
                    onClick={redirectToHome}
                  >
                    About
                  </span>
                </div>
              </div>
              
              {/* Right side - Close button */}
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Breadcrumb/Category */}
        <div className="text-gray-600 text-sm mb-4 uppercase tracking-wide font-medium">
          Mayo Clinic Q and A: Signs of overtraining
        </div>
        
        {/* Main Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
          Mayo Clinic Q and A: Signs of overtraining
        </h1>

        {/* Author and Date */}
        <div className="mb-6">
          <p className="text-gray-900 font-semibold mb-1">Patty Miller</p>
          <p className="text-gray-600 text-sm">July 3, 2025</p>
        </div>

        {/* ✅ FIXED: Social Share Icons - All redirect to home */}
        <div className="flex items-center gap-3 mb-8">
          <div 
            className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
            onClick={redirectToHome}
          >
            <span className="text-white text-sm font-bold">f</span>
          </div>
          <div 
            className="w-8 h-8 bg-black rounded flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={redirectToHome}
          >
            <span className="text-white text-sm font-bold">X</span>
          </div>
          <div 
            className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors"
            onClick={redirectToHome}
          >
            <span className="text-white text-sm font-bold">in</span>
          </div>
          <div 
            className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors"
            onClick={redirectToHome}
          >
            <span className="text-white text-sm font-bold">@</span>
          </div>
          <div 
            className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center cursor-pointer hover:bg-yellow-600 transition-colors"
            onClick={redirectToHome}
          >
            <span className="text-white text-sm font-bold">📄</span>
          </div>
        </div>

        {/* ✅ FIXED: Hero Image - VOLTOU A IMAGEM ANTERIOR */}
        <div className="mb-8">
          <img 
            src="https://i.imgur.com/LDXspIL.jpeg" 
            alt="Men's health research" 
            className="w-full h-80 object-cover rounded"
          />
          <p className="text-sm text-gray-500 mt-3 italic">
            Mayo Clinic researchers continue to explore natural approaches to men's health and wellness. (Mayo Clinic)
          </p>
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-800 leading-relaxed mb-6">
            <strong>DEAR MAYO CLINIC:</strong> I've taken up running again and decided to enter a half-marathon. I know I have to push myself to get ready for the race, but I don't want to overdo it. What should I watch out for as I train?
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>ANSWER:</strong> We're surrounded by warning signs — on the roads, at work, and on packaging and equipment. Your body sends warning signs, too. As your race date nears, it's tempting to pull out all the stops. But that makes this a prime time to watch for warning signs of overtraining.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Mayo Clinic researchers have been exploring natural methods to support men's sexual health without the need for pharmaceutical intervention. A recent review analyzed non-prescription supplements with active botanical compounds and amino acids that promote vascular and hormonal support.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            BlueDrops emerged as a noteworthy product, incorporating adaptogens like ashwagandha and nitric-oxide precursors in a precise, daily-use formula. Physicians who followed a 30-day observational group reported:
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 my-8">
            <h3 className="font-bold text-blue-900 mb-3">Clinical Observations</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Enhanced penile blood flow</strong> in 67% of subjects</li>
              <li><strong>45% noted increased stamina</strong> and improved mood</li>
              <li><strong>Participants experienced no cardiac</strong> or metabolic side effects</li>
            </ul>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">
            "Combining lifestyle interventions with evidence-informed botanical products may offer men a safe route toward improved vitality," notes Dr. Patrick Owens.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            While clinical trials are still underway, early data suggest that supplements like BlueDrops can serve as valuable tools in men's wellness routines.
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
                  Secure Your BlueDrops Package
                </h3>
                <p className="text-blue-700 mb-4">
                  Access the same natural solution discussed by Mayo Clinic experts. Risk-free with our 180-day money-back promise.
                </p>
                <button
                  onClick={redirectToHome}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Get BlueDrops Risk-Free
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 italic">
                <strong>Medical Disclaimer:</strong> This information is for educational purposes and should not replace professional medical advice. Always consult with your healthcare provider before starting any new supplement regimen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Footer - Logo redirects to home */}
      <div className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <img 
              src="https://i.imgur.com/ClqsijC.png" 
              alt="Mayo Clinic" 
              className="h-8 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={redirectToHome}
            />
            <p className="text-sm text-gray-600">
              © 2025 Mayo Foundation for Medical Education and Research. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};